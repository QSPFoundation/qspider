import { equals } from '@serenity-js/assertions';
import { type QuestionAdapter, Question, Task } from '@serenity-js/core';
import { scriptResult } from './page-script';
import { seeScriptEventually } from './see-script-eventually';

// Read-only sound probes over Howler's global registry (window.Howler). Like the probes in
// page-script.ts, these functions are serialised into the page, so they are self-contained and return
// plain data. The script itself still runs only through page-script.ts (scriptResult).

type Howl = { _src?: string | string[]; _webAudio?: boolean; playing(): boolean; volume(): number };
type HowlerGlobal = { _howls?: Howl[]; _muted?: boolean; _volume?: number };

/**
 * `playing`, `volume` and `webAudio` of the first Howl whose source ends with `srcSuffix` (also matched against
 * the decoded source), or null when there is none. `webAudio` is true when Howler fetched and decoded the bytes
 * itself, false when it fell back to an HTML5 Audio element (its fetch failed): `playing` reads true in both
 * cases, so only `webAudio` tells a failed fetch apart. One function answers both, so they cannot disagree.
 */
function howlState(srcSuffix: string): { playing: boolean; volume: number; webAudio: boolean } | null {
  if (!/^[\p{L}\p{N}_./ -]+$/u.test(srcSuffix)) throw new Error(`invalid sound source "${srcSuffix}"`);
  const howler = (window as unknown as { Howler?: HowlerGlobal }).Howler;
  for (const howl of howler?._howls ?? []) {
    const source = Array.isArray(howl._src) ? howl._src[0] : howl._src;
    // The source is the URL Howler loads (percent-encoded), so a suffix also matches in decoded form.
    if (typeof source !== 'string') continue;
    if (source.endsWith(srcSuffix) || decodeURIComponent(source).endsWith(srcSuffix))
      return { playing: howl.playing(), volume: howl.volume(), webAudio: howl._webAudio === true };
  }
  return null;
}

/** The master state of all sounds: Howler.mute() and Howler.volume(); null when window.Howler is missing. */
function audioState(): { muted: boolean; volume: number } | null {
  const howler = (window as unknown as { Howler?: HowlerGlobal }).Howler;
  if (!howler) return null;
  return { muted: howler._muted ?? false, volume: howler._volume ?? 1 };
}

export type SoundStateValue = { playing: boolean; volume: number };
export type AudioStateValue = { muted: boolean; volume: number };

/** The state of the sound whose source ends with `srcSuffix`; null when the game has not created one. */
export const SoundState = (srcSuffix: string): QuestionAdapter<SoundStateValue | null> =>
  Question.about(`the sound state of ${srcSuffix}`, async (actor) => {
    const state = await actor.answer(scriptResult(`the sound state of ${srcSuffix}`, howlState, srcSuffix));
    return state && { playing: state.playing, volume: state.volume };
  });

/** The master mute and volume; null when Howler is not loaded yet. */
export const AudioState = (): QuestionAdapter<AudioStateValue | null> =>
  scriptResult('the master audio state', audioState);

/** Eventually the sound reads exactly `expected` (`null`: no such sound, an absence-style check). */
export const SeeSoundState = (srcSuffix: string, expected: SoundStateValue | null): Task =>
  seeScriptEventually(
    SoundState(srcSuffix),
    equals(expected),
    `#actor sees the sound ${srcSuffix} as ${JSON.stringify(expected)}`,
  );

/** Eventually the master audio state reads exactly `expected`. */
export const SeeAudioState = (expected: AudioStateValue): Task =>
  seeScriptEventually(AudioState(), equals(expected), `#actor sees the master audio as ${JSON.stringify(expected)}`);

/** Eventually the sound whose source ends with `srcSuffix` is (`true`) or is not (`false`) decoded through Web Audio. */
export const SeeSoundWebAudio = (srcSuffix: string, expected: boolean): Task =>
  seeScriptEventually(
    Question.about(`whether ${srcSuffix} uses Web Audio`, async (actor) => {
      const state = await actor.answer(scriptResult(`whether ${srcSuffix} uses Web Audio`, howlState, srcSuffix));
      return state && state.webAudio;
    }),
    equals(expected),
    `#actor sees the sound ${srcSuffix} ${expected ? 'using' : 'not using'} Web Audio`,
  );
