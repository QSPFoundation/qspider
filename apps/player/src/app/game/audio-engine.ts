import { Howler } from 'howler';
import { normalizeVolume, Sound } from './sound';

import { observable, action, makeObservable } from 'mobx';
import { Resource } from './resource-manager';

const VOLUME_STEP = 10;

const clamp = function (value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
};

export class AudioEngine {
  private sounds: Map<string, Sound> = new Map();
  isMuted: boolean = false;
  volume: number = 100;

  constructor() {
    makeObservable(this, {
      isMuted: observable,
      volume: observable,

      mute: action,
      unMute: action,
      changeVolume: action,
    });
  }

  mute(): void {
    this.isMuted = true;
    Howler.mute(this.isMuted);
  }

  unMute(): void {
    this.isMuted = false;
    Howler.mute(this.isMuted);
  }

  changeVolume(volume: number): void {
    this.volume = clamp(volume, 0, 100);
    Howler.volume(normalizeVolume(this.volume));
  }

  increaseVolume(): void {
    this.changeVolume(this.volume + VOLUME_STEP);
  }

  decreaseVolume(): void {
    this.changeVolume(this.volume - VOLUME_STEP);
  }

  isPlaying(path: string): boolean {
    const key = this.getFileKey(path);
    const sound = this.sounds.get(key);
    if (!sound) {
      return false;
    }
    return sound.isPlaying;
  }

  play(input: Resource, volume: number): void {
    const key = this.getFileKey(input.url);
    let sound = this.sounds.get(key);
    if (!sound) {
      sound = Sound.create(input, volume);
      this.sounds.set(key, sound);
    }
    sound.play(volume);
  }

  close(path: string): void {
    const key = this.getFileKey(path);
    const sound = this.sounds.get(key);
    if (!sound) {
      return;
    }
    sound.stop();
  }

  closeAll(): void {
    for (const sound of this.sounds.values()) {
      sound.stop();
    }
  }

  private getFileKey(path: string): string {
    return path.replace('/', '__').toUpperCase();
  }
}
