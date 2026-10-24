import { ARCHIVES } from '../fixtures/archives';
import { RESOURCES_GAME } from '../fixtures/resources-game';
import { SeeGameStarted, SeeStartupFinished } from '../screenplay/common/checks';
import { SeeMainTextContaining } from '../screenplay/game/checks';
import { ClickAction, ReturnToShelf } from '../screenplay/game/tasks';
import { SeeVolumeSlider } from '../screenplay/pause/checks';
import {
  OpenPreferences,
  PressMuteHotkey,
  PressUnmuteHotkey,
  PressVolumeDownHotkey,
  PressVolumeUpHotkey,
} from '../screenplay/pause/tasks';
import { SeeShelfIncludes } from '../screenplay/shelf/checks';
import { LoadGame, StartPlayer } from '../screenplay/support/operate-player';
import { scenario } from '../screenplay/support/scenario';
import { SeeAudioState, SeeSoundState } from '../screenplay/support/sound-state';

// Sounds of the resources game. Each sound line is `str(ISPLAY(...))` written in the SAME action right after the
// statement, so it shows what the game itself sees; the probe shows what Howler really does. The wavs last 20 s,
// so every scenario stays far below that and never spans a relaunch.
const { text: TEXT, actions: ACTIONS, sound: SOUND } = RESOURCES_GAME;
const { lines: LINES } = SOUND;

/** From a clean app: opens the resources game and goes to its sound location. */
const OpenSoundLocation = [
  StartPlayer(),
  SeeStartupFinished(),
  LoadGame(RESOURCES_GAME.zipPath),
  SeeGameStarted(TEXT.start),
  ClickAction(ACTIONS.start.toSound),
  SeeMainTextContaining(TEXT.soundReady),
] as const;

const PLAYING = (volume: number) => ({ playing: true, volume });
const STOPPED = (volume: number) => ({ playing: false, volume });

scenario('PLAY, replay, ISPLAY and CLOSE', async (player) => {
  await player.attemptsTo(
    ...OpenSoundLocation,
    SeeSoundState('a.wav', null),
    ClickAction(ACTIONS.sound.play),
    SeeMainTextContaining(`${LINES.play}1`),
    SeeSoundState('a.wav', PLAYING(0.5)),
    // A second PLAY only changes the volume: the same sound stays playing.
    ClickAction(ACTIONS.sound.playAgain),
    SeeMainTextContaining(`${LINES.playAgain}1`),
    SeeSoundState('a.wav', PLAYING(0.8)),
    ClickAction(ACTIONS.sound.isPlaying),
    SeeMainTextContaining(`${LINES.isPlaying}1`),
    ClickAction(ACTIONS.sound.close),
    SeeMainTextContaining(`${LINES.close}0`),
    SeeSoundState('a.wav', STOPPED(0.8)),
    // A replay after a stop plays again; the second sound starts with it.
    ClickAction(ACTIONS.sound.playTwo),
    SeeMainTextContaining(`${LINES.playTwo}1 B=1`),
    SeeSoundState('a.wav', PLAYING(1)),
    SeeSoundState('b.wav', PLAYING(1)),
    ClickAction(ACTIONS.sound.closeAll),
    SeeMainTextContaining(`${LINES.closeAll}0 B=0`),
    SeeSoundState('a.wav', STOPPED(1)),
    SeeSoundState('b.wav', STOPPED(1)),
  );
});

scenario('a sound path with backslashes', async (player) => {
  await player.attemptsTo(
    ...OpenSoundLocation,
    ClickAction(ACTIONS.sound.playBackslash),
    SeeMainTextContaining(`${LINES.backslash}1 F=1`),
    SeeSoundState('b.wav', PLAYING(1)),
    // The same file spelled with a forward slash is the same sound (ISPLAY F=1); closing it stops both spellings.
    ClickAction(ACTIONS.sound.closeBackslash),
    SeeMainTextContaining(`${LINES.closeBackslashB}0 F=0`),
    SeeSoundState('b.wav', STOPPED(1)),
  );
});

scenario('mute and volume from the pause screen hotkeys', async (player) => {
  await player.attemptsTo(
    ...OpenSoundLocation,
    OpenPreferences(),
    SeeAudioState({ muted: false, volume: 1 }),
    PressMuteHotkey(),
    SeeAudioState({ muted: true, volume: 1 }),
    PressUnmuteHotkey(),
    SeeAudioState({ muted: false, volume: 1 }),
    PressVolumeDownHotkey(),
    PressVolumeDownHotkey(),
    SeeAudioState({ muted: false, volume: 0.8 }),
    // The slider follows the hotkeys.
    SeeVolumeSlider(80),
    PressVolumeUpHotkey(),
    SeeAudioState({ muted: false, volume: 0.9 }),
    SeeVolumeSlider(90),
  );
});

scenario('sounds stop when the game stops', async (player) => {
  await player.attemptsTo(
    ...OpenSoundLocation,
    ClickAction(ACTIONS.sound.play),
    SeeSoundState('a.wav', PLAYING(0.5)),
    ReturnToShelf(),
    SeeShelfIncludes(ARCHIVES.resourcesZip.title),
    SeeSoundState('a.wav', null),
  );
});
