import {
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
import { pollUntil } from './polling';
import { reportTimedOutCheck } from './timeout-report';

// The one place that runs script in the page. Every script here only reads page state (or, for the
// recorder, writes its own store): scenarios pick a named probe and cannot pass code of their own.
// The functions below are serialised into the page, so they must be self-contained (no outer names).
// Results go through JSON on desktop (WebKitWebDriver), so each one returns plain data.

type EventStore = Record<string, unknown[]>;

function installRecorder(type: string): void {
  const page = window as unknown as { __e2eEvents?: EventStore };
  const store = (page.__e2eEvents ??= {});
  const listening = type in store;
  store[type] = []; // every call starts a fresh recording
  if (listening) return; // one listener per page load
  window.addEventListener(type, (event) => {
    try {
      const detail = (event as CustomEvent<unknown>).detail ?? null;
      store[type]?.push(JSON.parse(JSON.stringify(detail)) as unknown);
    } catch {
      // a detail JSON cannot copy (cyclic, BigInt) is dropped
    }
  });
}

/** The recorded details, or `{ notRecording: true }` when RecordWindowEvents has not run on this page load. */
function readRecorded(type: string): unknown[] | { notRecording: true } {
  const page = window as unknown as { __e2eEvents?: EventStore };
  return page.__e2eEvents?.[type] ?? { notRecording: true };
}

/** Thrown at once (not polled) when the page has no recorder for the event type. */
class NotRecordingError extends Error {}

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
 * Starts a fresh recording of window events of `type`: each event's `detail` is kept in the page until
 * it unloads. The first call on a page load installs the one listener; every call (including the first)
 * clears the details recorded so far. So a scenario that must see only fresh events calls it right
 * before the trigger, and must call it again after a reload. Details are JSON copies, so both targets
 * read the same plain data: NaN and undefined read as null, and a detail JSON cannot copy is dropped.
 */
export const RecordWindowEvents = (type: string): Interaction =>
  Interaction.where(`#actor records "${type}" window events`, async (actor) => {
    await ExecuteScript.sync(installRecorder).withArguments(type).performAs(actor);
  });

/** The details of the `type` events recorded since RecordWindowEvents on this page load. */
export const RecordedEvents = (type: string): QuestionAdapter<unknown[]> =>
  Question.about(`the recorded "${type}" events`, async (actor) => {
    const recorded = await actor.answer(scriptResult(`the recorded "${type}" events`, readRecorded, type));
    if (Array.isArray(recorded)) return recorded as unknown[];
    throw new NotRecordingError(`RecordWindowEvents("${type}") was not run on this page load (was the page reloaded?)`);
  });

/** One probe's current answer. */
const ProbeResult = (name: PageProbe): QuestionAdapter<unknown> =>
  scriptResult<unknown>(`the page probe ${name}`, PROBES[name]);

/**
 * Like seeEventually, for a page-script question: polls until `actual` meets `expectation` (a script
 * error means "not yet", except NotRecordingError, which fails at once); on timeout one strict
 * Ensure.that reports Expected/Received.
 */
function seeScriptEventually<T>(actual: QuestionAdapter<T>, expectation: Expectation<T>, description: string): Task {
  const check = Interaction.where(d`#actor waits until ${actual} does ${expectation}`, async (actor) => {
    const { met, lastError } = await pollUntil(
      actor,
      d`whether ${actual} does ${expectation}`,
      async (a) => (await a.answer(expectation.isMetFor(actual))) instanceof ExpectationMet,
      (error) => !(error instanceof NotRecordingError),
    );
    if (met) return;
    await reportTimedOutCheck(lastError, 'script', d`run ${actual}`, () =>
      Ensure.that(actual, expectation).performAs(actor),
    );
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

/**
 * The named probe eventually answers `expected` (deep equality). An expected `null` ("nothing is
 * fullscreen") is an absence-style check: it passes at once while the page is still settling, so check
 * a settled anchor first (see README, "Reading and waiting").
 */
export const SeePageProbe = (name: PageProbe, expected: unknown): Task =>
  seeScriptEventually(
    ProbeResult(name),
    equals(expected),
    `#actor sees page probe ${name} = ${JSON.stringify(expected)}`,
  );
