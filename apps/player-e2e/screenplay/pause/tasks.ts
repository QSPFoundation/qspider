import { Interaction, Task } from '@serenity-js/core';
import { Key, Press, Select } from '@serenity-js/web';
import { ClickWhenPresent, waitUntilPresent } from '../support/presence';
import { PauseLocaleSelect, PauseScreen, PreferencesButton, VolumeSlider } from './elements';

/** Escape opens the pause screen; its Preferences button shows the volume slider. */
export const OpenPreferences = (): Task =>
  Task.where(
    '#actor opens the preferences panel',
    Press.the(Key.Escape),
    waitUntilPresent(PauseScreen),
    ClickWhenPresent(PreferencesButton),
    waitUntilPresent(VolumeSlider),
  );

/** Picks language `code` in the pause screen's language select (open the Preferences panel first). */
export const SwitchPauseLanguage = (code: string): Interaction =>
  Interaction.where(`#actor switches the pause language to ${code}`, (actor) =>
    Select.value(code).from(PauseLocaleSelect).performAs(actor),
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
