// Volume arithmetic of audio.ts and sound.ts, kept apart from Howler. Light: only the clamp helper.
import { clamp } from './utils';
import { cleanPath } from '@qspider/utils';

export const VOLUME_STEP = 10;

export const normalizeVolume = (volume: number): number => (volume > 1 ? volume * 0.01 : volume);

/** The player volume (0..100) one step up (`1`) or down (`-1`), kept within 0..100. */
export function stepVolume(volume: number, direction: 1 | -1): number {
  return clamp(volume + direction * VOLUME_STEP, 0, 100);
}

export function getFileKey(path: string): string {
  return cleanPath(path).toUpperCase();
}
