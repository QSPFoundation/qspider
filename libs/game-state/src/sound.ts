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
  public static create(input: string, volume: number): Sound {
    return new Sound(input, volume);
  }

  private _state: SoundState = SoundState.Loading;
  private _error: Error | null = null;
  private howl: Howl;
  private isScheduled = false;

  public get state(): SoundState {
    return this._state;
  }

  public get error(): Error | null {
    return this._error;
  }

  public get isPlaying(): boolean {
    // sound that is still loading is considered as playing
    return this._state === SoundState.Playing || this._state === SoundState.Loading;
  }

  constructor(input: string, volume: number) {
    this.howl = new Howl({
      src: [input],
      // streaming blobs does not work in tauri at the moment
      html5: !input.includes('blob:'),
      volume: normalizeVolume(volume),
      loop: false,
      preload: true,
      autoplay: false,
      onload: (): void => {
        this._state = SoundState.Loaded;
        if (this.isScheduled) {
          this.howl.play();
        }
      },
      onloaderror: (_, err): void => {
        console.error(input, err);
        this._state = SoundState.LoadingError;
        this._error = err as Error;
      },
      onplayerror: (_, err): void => {
        console.error(input, err);
        this._state = SoundState.PlayError;
        this._error = err as Error;
      },
      onplay: (): void => {
        this._state = SoundState.Playing;
      },
      onend: (): void => {
        this._state = SoundState.Played;
      },
      onpause: (): void => {
        this._state = SoundState.Paused;
      },
      onstop: (): void => {
        this._state = SoundState.Played;
      },
      onunlock: (): void => {
        if (this._state === SoundState.Loaded && this.isScheduled) {
          this._state = SoundState.Playing;
          this.howl.play();
        }
      },
    });
  }

  play(volume: number): void {
    this.howl.volume(normalizeVolume(volume));
    this.isScheduled = true;
    if (this.howl.state() === 'loaded' && !this.howl.playing()) {
      this.howl.play();
    }
  }

  stop(): void {
    this.isScheduled = false;
    this.howl.stop();
  }

  dispose(): void {
    this.isScheduled = false;
    this.howl.stop();
    this.howl.unload();
  }
}
