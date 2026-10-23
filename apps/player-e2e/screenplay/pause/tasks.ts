import { type Interaction, Task } from '@serenity-js/core';
import { Key, Press } from '@serenity-js/web';
import { ClickWhenPresent, waitUntilPresent } from '../support/presence';
import { PauseScreen, PreferencesButton, VolumeSlider } from './elements';

/** Escape opens the pause screen; its Preferences button shows the volume slider. */
export const OpenPreferences = (): Task =>
  Task.where(
    '#actor opens the preferences panel',
    Press.the(Key.Escape),
    waitUntilPresent(PauseScreen),
    ClickWhenPresent(PreferencesButton),
    waitUntilPresent(VolumeSlider),
  );

// Pause screen only: these hotkeys are not active while the game runs.
/** Home: mutes. */
export const PressMuteHotkey = (): Interaction => Press.the(Key.Home);

/** End: unmutes. */
export const PressUnmuteHotkey = (): Interaction => Press.the(Key.End);

/** PageUp: volume +10. */
export const PressVolumeUpHotkey = (): Interaction => Press.the(Key.PageUp);

/** PageDown: volume -10. */
export const PressVolumeDownHotkey = (): Interaction => Press.the(Key.PageDown);
