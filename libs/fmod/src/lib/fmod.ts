import { FMODModule, FMOD } from './fmod_core';

import fmodWasm from './fmod_core.wasm';
import {
  RESULT,
  System,
  SPEAKERMODE,
  INITFLAGS,
  Channel,
  Sound,
  MODE,
} from './fmod_types';
import midiDls from '../midi.dls';

interface Out<T> {
  val: T;
}

interface QspSound {
  channel: Channel;
  sound: Sound;
  volume: number;
}

export class SoundManager {
  preRun = () => {
    //
  };
  main = () => {
    this.fmod.FS_createPreloadedFile('/', 'midi.dls', midiDls, true, false);

    let result;

    console.log('Creating FMOD System object\n');

    const outSystem: Out<System> = { val: null };
    // Create the system and check the result
    result = this.fmod.System_Create(outSystem);
    this.checkResult(result);

    console.log('grabbing system object from temporary and storing it\n');

    // Take out our System object
    this.system = outSystem.val;

    // Optional.  Setting DSP Buffer size can affect latency and stability.
    // Processing is currently done in the main thread so anything lower than 2048 samples can cause stuttering on some devices.
    console.log('set DSP Buffer size.\n');
    result = this.system.setDSPBufferSize(4096, 2);
    this.checkResult(result);

    // Optional.  Set sample rate of mixer to be the same as the OS output rate.
    // This can save CPU time and latency by avoiding the automatic insertion of a resampler at the output stage.
    console.log('Set mixer sample rate');
    const outSampleRate: Out<number> = { val: 0 };
    result = this.system.getDriverInfo(
      0,
      null,
      null,
      outSampleRate,
      null,
      null
    );
    console.log(outSampleRate);
    this.checkResult(result);
    result = this.system.setSoftwareFormat(
      outSampleRate.val,
      SPEAKERMODE.STEREO,
      0
    );
    this.checkResult(result);

    console.log('initialize FMOD\n');

    // 32 virtual channels
    result = this.system.init(32, INITFLAGS.NORMAL, null);
    this.checkResult(result);

    const iOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    // Set up iOS/Chrome workaround.  Webaudio is not allowed to start unless screen is touched or button is clicked.
    const resumeAudio = () => {
      if (!this.audioResumed) {
        console.log('Resetting audio driver based on user input.');

        result = this.system.mixerSuspend();
        this.checkResult(result);
        result = this.system.mixerResume();
        this.checkResult(result);

        if (iOS) {
          window.removeEventListener('touchend', resumeAudio, false);
        } else {
          document.removeEventListener('click', resumeAudio);
        }

        this.audioResumed = true;
      }
    };

    if (iOS) {
      window.addEventListener('touchend', resumeAudio, false);
    } else {
      document.addEventListener('click', resumeAudio);
    }

    // Starting up your typical JavaScript application loop. Set the framerate to 50 frames per second, or 20ms.
    console.log('Start game loop\n');
    window.setInterval(this.update, 10);
  };

  private fmod: FMOD = ({
    preRun: this.preRun,
    onRuntimeInitialized: this.main,
    locateFile(path) {
      if (path.endsWith('.wasm')) {
        return fmodWasm;
      }
      return path;
    },
  } as unknown) as FMOD;

  private system: System;
  private audioResumed = false;
  private sounds: Map<string, QspSound> = new Map();
  private fileLoaders: Map<string, Promise<void>> = new Map();
  private fileUrl: string;

  init(fileUrl: string) {
    this.fileUrl = fileUrl;
    FMODModule(this.fmod);
  }

  update = () => {
    const result = this.system.update();
    try {
      this.checkResult(result);
    } catch (e) {
      //
    }
  };

  getFileKey(file: string): string {
    return file.replace('/', '__').toUpperCase();
  }

  isPlaying(file: string): boolean {
    const key = this.getFileKey(file);
    const sound = this.sounds.get(key);

    if (sound) {
      const out: Out<boolean> = { val: null };
      sound.channel.isPlaying(out);
      return out.val;
    }
    return false;
  }

  closeFile(file: string) {
    if (file) {
      const key = this.getFileKey(file);
      const sound = this.sounds.get(key);
      if (sound) {
        sound.sound.release();
        this.sounds.delete(key);
      }
    } else {
      for (const sound of this.sounds.values()) {
        sound.sound.release();
      }
      this.sounds.clear();
    }
  }

  setVolume(file: string, volume: number): boolean {
    if (!this.isPlaying(file)) {
      return false;
    }
    const key = this.getFileKey(file);
    const sound = this.sounds.get(key);
    sound.volume = volume;
    sound.channel.setVolume(volume * 0.01);
    return true;
  }

  async playFile(file: string, volume: number) {
    if (this.setVolume(file, volume)) {
      return;
    }
    this.closeFile(file);
    await this.loadFile(file);

    const key = this.getFileKey(file);

    const exinfo = this.fmod.CREATESOUNDEXINFO();
    exinfo.dlsname = '/midi.dls';

    const outSound: Out<Sound> = { val: null };
    let result = this.system.createSound(
      '/' + key,
      MODE.LOOP_OFF,
      exinfo,
      outSound
    );
    this.checkResult(result);

    this.updateSounds();

    const outChannel: Out<Channel> = { val: null };
    result = this.system.playSound(outSound.val, null, false, outChannel);
    this.checkResult(result);

    const sound: QspSound = {
      sound: outSound.val,
      channel: outChannel.val,
      volume,
    };

    this.sounds.set(key, sound);
    this.setVolume(file, volume);
  }

  updateSounds() {
    for (const [key, sound] of this.sounds) {
      if (!this.isPlaying(key)) {
        sound.sound.release();
        this.sounds.delete(key);
      }
    }
  }

  loadFile(file: string): Promise<void> {
    const key = this.getFileKey(file);
    const loader = this.fileLoaders.get(key);
    if (loader) {
      return loader;
    }
    const newLoader = new Promise<void>((resolve) => {
      this.fmod.FS_createPreloadedFile(
        '/',
        key,
        this.fileUrl + file,
        true,
        false,
        () => {
          resolve();
        }
      );
    });
    this.fileLoaders.set(key, newLoader);
    return newLoader;
  }

  checkResult(result: RESULT) {
    if (result != RESULT.OK) {
      const msg = "Error!!! '" + this.fmod.ErrorString(result) + "'";

      console.error(msg);

      throw msg;
    }
  }
}
