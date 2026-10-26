import { Howler } from 'howler';
import { Sound } from './sound';
import { getFileKey, normalizeVolume, stepVolume } from './volume';
import { atom } from 'xoid';
import { clamp } from './utils';

export const sounds$ = atom(new Map<string, Sound>(), (atom) => {
  return {
    isPlaying(path: string): boolean {
      const key = getFileKey(path);
      const sound = atom.value.get(key);
      return Boolean(sound?.isPlaying);
    },
    play(input: string, volume: number): void {
      const key = getFileKey(input);
      let sound = atom.value.get(key);
      if (!sound) {
        sound = Sound.create(input, volume);
        atom.value.set(key, sound);
      }
      sound.play(volume);
    },
    close(path: string): void {
      const key = getFileKey(path);
      const sound = atom.value.get(key);
      if (!sound) {
        return;
      }
      sound.stop();
    },
    closeAll(): void {
      for (const sound of atom.value.values()) {
        sound.stop();
      }
    },
    clear(): void {
      for (const sound of atom.value.values()) {
        sound.dispose();
      }
      atom.set(new Map());
    },
  };
});
export const muted$ = atom(false);
export const volume$ = atom(100, (atom) => {
  return {
    increase(): void {
      atom.update((s) => stepVolume(s, 1));
    },
    decrease(): void {
      atom.update((s) => stepVolume(s, -1));
    },
  };
});

muted$.watch((isMuted) => {
  Howler.mute(isMuted);
});
volume$.watch((volume) => {
  Howler.volume(normalizeVolume(clamp(volume, 0, 100)));
});
