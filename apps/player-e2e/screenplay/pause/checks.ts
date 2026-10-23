import { equals } from '@serenity-js/assertions';
import type { Task } from '@serenity-js/core';
import { Attribute } from '@serenity-js/web';
import { seeEventually } from '../support/see-eventually';
import { waitUntilAbsent } from '../support/presence';
import { PauseScreen, VolumeSlider } from './elements';

export const SeeNoPauseScreen = () => waitUntilAbsent(PauseScreen);

/** The volume slider shows `value` (aria-valuenow, 0-100). */
export const SeeVolumeSlider = (value: number): Task =>
  seeEventually(
    VolumeSlider,
    (e) => Attribute.called('aria-valuenow').of(e),
    equals(String(value)),
    `#actor sees the volume slider at ${value}`,
  );
