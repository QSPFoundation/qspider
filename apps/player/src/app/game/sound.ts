import { Howl } from 'howler';

enum SoundState {
  Loading,
  LoadingError,
  Loaded,
  PlayError,
  Playing,
  Paused,
  Played,
}

export const normalizeVolume = (volume: number): number => (volume > 1 ? volume * 0.01 : volume);

export class Sound {
  public static create(path: string, volume: number): Sound {
    return new Sound(path, volume);
  }

  private _state: SoundState = SoundState.Loading;
  private _error: Error;
  private howl: Howl;
  private isScheduled = false;

  public get state(): SoundState {
    return this._state;
  }

  public get error(): Error {
    return this._error;
  }

  public get isPlaying(): boolean {
    // sound that is still loading is considered as playing
    return this._state === SoundState.Playing || this._state === SoundState.Loading;
  }

  constructor(path: string, volume: number) {
    this.howl = new Howl({
      src: [path],
      html5: true,
      volume: normalizeVolume(volume),
      loop: false,
      preload: true,
      autoplay: false,
      onload: () => {
        this._state = SoundState.Loaded;
        if (this.isScheduled) {
          this.howl.play();
        }
      },
      onloaderror: (_, err) => {
        console.error(path, err);
        this._state = SoundState.LoadingError;
        this._error = err as Error;
      },
      onplayerror: (_, err) => {
        console.error(path, err);
        this._state = SoundState.PlayError;
        this._error = err as Error;
      },
      onplay: () => {
        this._state = SoundState.Playing;
      },
      onend: () => {
        this._state = SoundState.Played;
      },
      onpause: () => {
        this._state = SoundState.Paused;
      },
      onstop: () => {
        this._state = SoundState.Played;
      },
      onunlock: () => {
        if (this._state === SoundState.Loaded && this.isScheduled) {
          this.howl.play();
        }
      },
    });
  }

  play(volume: number): void {
    this.howl.volume(normalizeVolume(volume));
    this.isScheduled = true;
    if (this.howl.state() === 'loaded') {
      this.howl.play();
    }
  }

  stop(): void {
    this.isScheduled = false;
    this.howl.stop();
  }
}
