import { Howler } from 'howler';
import { Resource } from '@qspider/contracts';
import { normalizeVolume, Sound } from './sound';
import { create, use } from 'xoid';
import { clamp } from './utils';
import { qspApi$ } from './qsp-api';
import { getResource } from './resources';

const VOLUME_STEP = 10;

export const sounds$ = create(new Map<string, Sound>(), (atom) => {
  return {
    isPlaying(path: string): boolean {
      const key = getFileKey(path);
      const sound = atom.value.get(key);
      return Boolean(sound?.isPlaying);
    },
    play(input: Resource, volume: number): void {
      const key = getFileKey(input.url);
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
export const muted$ = create(false);
export const volume$ = create(100, (atom) => {
  return {
    increase(): void {
      atom.update((s) => clamp(s + VOLUME_STEP, 0, 100));
    },
    decrease(): void {
      atom.update((s) => clamp(s - VOLUME_STEP, 0, 100));
    },
  };
});

muted$.watch((isMuted) => {
  Howler.mute(isMuted);
});
volume$.watch((volume) => {
  Howler.volume(normalizeVolume(clamp(volume, 0, 100)));
});
qspApi$.subscribe((api) => {
  api.on('is_play', (path, result) => {
    result(use(sounds$).isPlaying(getResource(path).url));
  });
  api.on('play_file', (path, volume, ready) => {
    use(sounds$).play(getResource(path), volume);
    ready();
  });
  api.on('close_file', (path, ready) => {
    if (path) {
      use(sounds$).close(getResource(path).url);
    } else {
      use(sounds$).closeAll();
    }
    ready();
  });
});

function getFileKey(path: string): string {
  return path.replace('/', '__').toUpperCase();
}
