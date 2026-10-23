import type { Interaction } from '@serenity-js/core';
import { Key, Press } from '@serenity-js/web';
import { ClickWhenPresent } from '../support/presence';
import { View } from './elements';

/** Closes the classic modal view with Escape. */
export const CloseView = (): Interaction => Press.the(Key.Escape);

/** Clicks the image view (an Aero view closes on click unless ALWAYS_SHOW_VIEW is set). */
export const ClickView = (): Interaction => ClickWhenPresent(View);
