import { equals } from '@serenity-js/assertions';
import type { Task } from '@serenity-js/core';
import { Attribute, Text, Value } from '@serenity-js/web';
import { seeEventually } from '../support/see-eventually';
import { waitUntilAbsent } from '../support/presence';
import { PauseLocaleSelect, PauseScreen, PreferencesButton, VolumeSlider } from './elements';

export const SeeNoPauseScreen = () => waitUntilAbsent(PauseScreen);

/** The volume slider shows `value` (aria-valuenow, 0-100). */
export const SeeVolumeSlider = (value: number): Task =>
  seeEventually(
    VolumeSlider,
    (e) => Attribute.called('aria-valuenow').of(e),
    equals(String(value)),
    `#actor sees the volume slider at ${value}`,
  );

/** The pause screen's Preferences button eventually reads `text`. */
export const SeePreferencesLabel = (text: string): Task =>
  seeEventually(
    PreferencesButton,
    (e) => Text.of(e),
    equals(text),
    `#actor sees the Preferences button read "${text}"`,
  );

/** The pause screen's language select eventually shows language `code`. */
export const SeePauseLanguage = (code: string): Task =>
  seeEventually(
    PauseLocaleSelect,
    (e) => Value.of(e),
    equals(code),
    `#actor sees the pause language select on ${code}`,
  );
