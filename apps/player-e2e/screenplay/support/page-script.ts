import { type Expectation, Interaction, Question, type QuestionAdapter, Task } from '@serenity-js/core';
import { containAtLeastOneItemThat, equals } from '@serenity-js/assertions';
import { ExecuteScript, LastScriptExecution } from '@serenity-js/web';
import { NotRecordingError, seeScriptEventually } from './see-script-eventually';

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

/** Computed values of `names` on the target element, or null when it is absent. */
function styleValues(kind: string, value: string, names: string[]): Record<string, string> | null {
  if (!/^[a-z0-9-]+$/.test(value)) throw new Error(`invalid style target "${value}"`);
  const selector = kind === 'root' ? 'qsp-game-root' : `[data-${kind}="${value}"]`;
  const element = document.querySelector(selector);
  if (!element) return null;
  const style = getComputedStyle(element);
  return Object.fromEntries(names.map((name) => [name, style.getPropertyValue(name).trim()]));
}

/** The read-only probes a scenario may check, by name. */
const PROBES = {
  /** `data-qsp` of document.fullscreenElement (its tag name if it has none, e.g. qsp-game-root), or null. */
  fullscreenElementMarker: function (): string | null {
    const element = document.fullscreenElement;
    if (!element) return null;
    return element.getAttribute('data-qsp') ?? element.tagName.toLowerCase();
  },
  /** The page's clock: milliseconds since its time origin (read by PageClockAdvanced in page-clock.ts). */
  pageClock: function (): number {
    return performance.now();
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

/** Where a style probe reads: the game root, or the first element with this data-qsp / data-qa value. */
export type StyleTarget = { root: true } | { qsp: string } | { qa: string };

/**
 * Computed values of `names` on the target (trimmed); null when the target is absent. Read-only and
 * safe: no code is passed, the marker is regex-validated before it builds a selector, and names go
 * only to getPropertyValue.
 */
export const CssValues = (target: StyleTarget, names: string[]): QuestionAdapter<Record<string, string> | null> => {
  const [kind, value] = 'root' in target ? ['root', 'root'] : Object.entries(target)[0]!;
  return scriptResult(`the computed ${names.join(', ')} of ${JSON.stringify(target)}`, styleValues, kind, value, names);
};

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
export const ProbeResult = (name: PageProbe): QuestionAdapter<unknown> =>
  scriptResult<unknown>(`the page probe ${name}`, PROBES[name]);

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

/** Eventually every name in `expected` reads exactly its value (an absent target never matches). */
export const SeeCssValues = (target: StyleTarget, expected: Record<string, string>): Task =>
  seeScriptEventually(
    CssValues(target, Object.keys(expected)),
    equals(expected),
    `#actor sees ${JSON.stringify(expected)} on ${JSON.stringify(target)}`,
  );

/** Eventually the one value meets `expectation` (e.g. endsWith). */
export const SeeCssValue = (target: StyleTarget, name: string, expectation: Expectation<string>): Task =>
  seeScriptEventually(
    Question.about(
      `the computed ${name}`,
      async (actor) => (await actor.answer(CssValues(target, [name])))?.[name] ?? '',
    ),
    expectation,
    `#actor sees ${name} on ${JSON.stringify(target)} meet ${expectation}`,
  );
