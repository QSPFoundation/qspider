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
    // PLAY and CLOSE set the state at once (Howler reports its events a tick later, after the game has already
    // asked ISPLAY), and a sound that is still loading counts as playing: the game has asked for it.
    return this._state === SoundState.Playing || this._state === SoundState.Loading;
  }

  constructor(input: string, volume: number) {
    this.howl = new Howl({
      src: [input],
      volume: normalizeVolume(volume),
      loop: false,
      preload: true,
      autoplay: false,
      onload: (): void => {
        this._state = this.isScheduled ? SoundState.Playing : SoundState.Loaded;
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
      // Howler delivers these events a tick late: one that belongs to an earlier PLAY or CLOSE must not undo
      // the newer one, so they only apply while they still agree with what the game asked for last.
      onplay: (): void => {
        if (this.isScheduled) this._state = SoundState.Playing;
      },
      onend: (): void => {
        if (this.howl.playing()) return;
        this._state = SoundState.Played;
        this.isScheduled = false;
      },
      onpause: (): void => {
        this._state = SoundState.Paused;
      },
      onstop: (): void => {
        if (this._state === SoundState.LoadingError || this._state === SoundState.PlayError) return;
        if (!this.isScheduled) {
          this._state = SoundState.Played;
        } else if (!this.howl.playing()) {
          // The game's latest request was PLAY, but a queued stop (a suspended audio context runs queued calls
          // on resume) killed it: play again rather than report a silent sound as playing.
          this.howl.play();
        }
      },
      onunlock: (): void => {
        if (this.isScheduled && this._state === SoundState.Playing && !this.howl.playing()) {
          this.howl.play();
        }
      },
    });
  }

  play(volume: number): void {
    this.howl.volume(normalizeVolume(volume));
    this.isScheduled = true;
    if (this._state !== SoundState.Loading && this._state !== SoundState.LoadingError) {
      this._state = SoundState.Playing;
    }
    if (this.howl.state() === 'loaded' && !this.howl.playing()) {
      this.howl.play();
    }
  }

  stop(): void {
    this.isScheduled = false;
    if (this._state !== SoundState.LoadingError && this._state !== SoundState.PlayError) {
      this._state = SoundState.Played;
    }
    this.howl.stop();
  }

  dispose(): void {
    this.isScheduled = false;
    this.howl.stop();
    this.howl.unload();
  }
}
