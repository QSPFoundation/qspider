import { Howler } from 'howler';
import { normalizeVolume, Sound } from './sound';

import { decorate, observable, action } from 'mobx';

export class AudioEngine {
  private sounds: Map<string, Sound> = new Map();
  isMuted: boolean = false;
  volume: number = 100;

  mute(): void {
    this.isMuted = true;
    Howler.mute(this.isMuted);
  }

  unMute(): void {
    this.isMuted = false;
    Howler.mute(this.isMuted);
  }

  changeVolume(volume: number): void {
    this.volume = normalizeVolume(volume);
    Howler.volume(this.volume);
  }

  isPlaying(path: string): boolean {
    const key = this.getFileKey(path);
    const sound = this.sounds.get(key);
    if (!sound) {
      return false;
    }
    return sound.isPlaying;
  }

  play(path: string, volume: number): void {
    const key = this.getFileKey(path);
    let sound = this.sounds.get(key);
    if (!sound) {
      sound = Sound.create(path, volume);
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

decorate(AudioEngine, {
  isMuted: observable,
  volume: observable,

  mute: action,
  unMute: action,
  changeVolume: action,
});
