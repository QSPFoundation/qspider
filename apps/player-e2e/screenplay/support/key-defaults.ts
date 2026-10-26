import { containAtLeastOneItemThat, equals } from '@serenity-js/assertions';
import { Interaction, type QuestionAdapter, Question, Task } from '@serenity-js/core';
import { scriptResult } from './page-script';
import { NotRecordingError, seeScriptEventually } from './see-script-eventually';

// A keydown recorder: whether the player prevented a key's browser default (Ctrl+S opens the browser's
// save dialog unless a handler prevents it). Like the recorder in page-script.ts it writes only its own
// store; the functions are serialised into the page (self-contained, plain data back) and run only
// through scriptResult.

export type KeyDefault = { key: string; ctrl: boolean; prevented: boolean };

/**
 * Starts a fresh recording. The one listener (per page load) is on window in the capture phase, so it
 * sees every keydown even when a handler stops propagation; it reads `defaultPrevented` in a timeout,
 * after the dispatch and so after every handler has run.
 */
function installKeyRecorder(): boolean {
  const page = window as unknown as { __e2eKeyDefaults?: KeyDefault[] };
  const listening = page.__e2eKeyDefaults !== undefined;
  page.__e2eKeyDefaults = [];
  if (listening) return true;
  window.addEventListener(
    'keydown',
    (event) => {
      const { key, ctrlKey } = event;
      setTimeout(() => page.__e2eKeyDefaults?.push({ key, ctrl: ctrlKey, prevented: event.defaultPrevented }), 0);
    },
    true,
  );
  return true;
}

/** The keydowns recorded since RecordKeyDefaults, or `{ notRecording: true }` when it has not run on this page load. */
function readKeyDefaults(): KeyDefault[] | { notRecording: true } {
  return (window as unknown as { __e2eKeyDefaults?: KeyDefault[] }).__e2eKeyDefaults ?? { notRecording: true };
}

/** Starts a fresh keydown recording on this page load (call again after a reload). */
export const RecordKeyDefaults = (): Interaction =>
  Interaction.where(`#actor records whether keydowns are prevented`, async (actor) => {
    await actor.answer(scriptResult('the keydown recorder', installKeyRecorder));
  });

/** The keydowns recorded since RecordKeyDefaults on this page load. */
export const RecordedKeyDefaults = (): QuestionAdapter<KeyDefault[]> =>
  Question.about('the recorded keydowns', async (actor) => {
    const recorded = await actor.answer(scriptResult('the recorded keydowns', readKeyDefaults));
    if (Array.isArray(recorded)) return recorded;
    throw new NotRecordingError('RecordKeyDefaults() was not run on this page load (was the page reloaded?)');
  });

/** Eventually a keydown recorded since RecordKeyDefaults reads exactly `expected`. */
export const SeeKeyDefault = (expected: KeyDefault): Task =>
  seeScriptEventually(
    RecordedKeyDefaults(),
    containAtLeastOneItemThat(equals(expected)),
    `#actor sees the keydown ${JSON.stringify(expected)}`,
  );
