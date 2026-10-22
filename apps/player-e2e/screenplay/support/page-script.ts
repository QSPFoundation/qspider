import {
  AssertionError,
  d,
  type Expectation,
  ExpectationMet,
  Interaction,
  Question,
  type QuestionAdapter,
  Task,
} from '@serenity-js/core';
import { containAtLeastOneItemThat, Ensure, equals } from '@serenity-js/assertions';
import { ExecuteScript, LastScriptExecution } from '@serenity-js/web';
import { describeError } from './element-errors';
import { pollUntil } from './polling';
import { INTERACTION_TIMEOUT } from './timeouts';

// The one place that runs script in the page. Every script here only reads page state (or, for the
// recorder, appends to its own store): scenarios pick a named probe and cannot pass code of their own.
// The functions below are serialised into the page, so they must be self-contained (no outer names).
// Results go through JSON on desktop (WebKitWebDriver), so each one returns plain data; the recorder
// stores a JSON copy of each detail, so both targets read the same thing (NaN reads as null).

type EventStore = Record<string, unknown[]>;

function installRecorder(type: string): void {
  const page = window as unknown as { __e2eEvents?: EventStore };
  const store = (page.__e2eEvents ??= {});
  if (store[type]) return; // already listening since this page load
  const events: unknown[] = (store[type] = []);
  window.addEventListener(type, (event) => {
    const detail = (event as CustomEvent<unknown>).detail ?? null;
    events.push(JSON.parse(JSON.stringify(detail)) as unknown);
  });
}

function readRecorded(type: string): unknown[] {
  const page = window as unknown as { __e2eEvents?: EventStore };
  return page.__e2eEvents?.[type] ?? [];
}

/** The read-only probes a scenario may check, by name. */
const PROBES = {
  /** `data-qsp` of document.fullscreenElement (its tag name if it has none, e.g. qsp-game-root), or null. */
  fullscreenElementMarker: function (): string | null {
    const element = document.fullscreenElement;
    if (!element) return null;
    return element.getAttribute('data-qsp') ?? element.tagName.toLowerCase();
  },
} as const;

export type PageProbe = keyof typeof PROBES;

/**
 * Runs `script` with `args` in the page and answers its result. A script's null reads as undefined on
 * desktop (WebdriverIO), so an absent result answers null on both targets.
 */
const scriptResult = <R>(description: string, script: (...args: never[]) => R, ...args: unknown[]) =>
  Question.about<R | null>(description, async (actor) => {
    await ExecuteScript.sync(script)
      .withArguments(...args)
      .performAs(actor);
    return (await actor.answer(LastScriptExecution.result<R | undefined>())) ?? null;
  });

/**
 * Starts recording window events of `type`: each event's `detail` is kept in the page until it
 * unloads. Installs one listener per page load; calling it again on the same page does nothing.
 */
export const RecordWindowEvents = (type: string): Interaction =>
  Interaction.where(`#actor records "${type}" window events`, async (actor) => {
    await ExecuteScript.sync(installRecorder).withArguments(type).performAs(actor);
  });

/** The details of the `type` events recorded since RecordWindowEvents on this page load. */
export const RecordedEvents = (type: string): QuestionAdapter<unknown[]> =>
  Question.about(
    `the recorded "${type}" events`,
    async (actor) => (await actor.answer(scriptResult(`the recorded "${type}" events`, readRecorded, type))) ?? [],
  );

/** One probe's current answer. */
const ProbeResult = (name: PageProbe): QuestionAdapter<unknown> =>
  scriptResult<unknown>(`the page probe ${name}`, PROBES[name]);

/**
 * Like seeEventually, for a page-script question: polls until `actual` meets `expectation` (a script
 * error means "not yet"); on timeout one strict Ensure.that reports Expected/Received.
 */
function seeScriptEventually<T>(actual: QuestionAdapter<T>, expectation: Expectation<T>, description: string): Task {
  const check = Interaction.where(d`#actor waits until ${actual} does ${expectation}`, async (actor) => {
    const { met, lastError } = await pollUntil(
      actor,
      d`whether ${actual} does ${expectation}`,
      async (a) => (await a.answer(expectation.isMetFor(actual))) instanceof ExpectationMet,
      () => true,
    );
    if (met) return;
    const last = lastError === undefined ? '' : `\nLast script error while waiting: ${describeError(lastError)}`;
    try {
      await Ensure.that(actual, expectation).performAs(actor);
    } catch (error) {
      if (error instanceof AssertionError) throw new AssertionError(`${error.message}${last}`, error);
      throw new AssertionError(
        `Timed out after ${INTERACTION_TIMEOUT.toString()}: could not run ${d`${actual}`} (${describeError(error)})${last}`,
        error instanceof Error ? error : undefined,
      );
    }
  });
  return Task.where(description, check);
}

/** Some `type` event recorded since RecordWindowEvents has a `detail` deep-equal to `expected`. */
export const SeeRecordedEvent = (type: string, expected: unknown): Task =>
  seeScriptEventually(
    RecordedEvents(type),
    containAtLeastOneItemThat(equals(expected)),
    `#actor sees a "${type}" event with detail ${JSON.stringify(expected)}`,
  );

/** The named probe eventually answers `expected` (deep equality). */
export const SeePageProbe = (name: PageProbe, expected: unknown): Task =>
  seeScriptEventually(
    ProbeResult(name),
    equals(expected),
    `#actor sees page probe ${name} = ${JSON.stringify(expected)}`,
  );
