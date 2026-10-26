// Volume arithmetic of audio.ts and sound.ts, kept apart from Howler. Light: only the clamp helper and
// @qspider/utils' cleanPath (both free of side effects at import).
import { clamp } from './utils';
import { cleanPath } from '@qspider/utils';

export const VOLUME_STEP = 10;

/** Every volume in the player (the engine's PLAY, the player volume slider) is 0..100; Howler wants 0..1. */
export const normalizeVolume = (volume: number): number => volume / 100;

/** The player volume (0..100) one step up (`1`) or down (`-1`), kept within 0..100. */
export function stepVolume(volume: number, direction: 1 | -1): number {
  return clamp(volume + direction * VOLUME_STEP, 0, 100);
}

export function getFileKey(path: string): string {
  return cleanPath(path).toUpperCase();
}
