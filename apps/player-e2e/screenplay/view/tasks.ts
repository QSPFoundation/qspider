import type { Interaction } from '@serenity-js/core';
import { Key, Press } from '@serenity-js/web';

/** Closes the classic modal view with Escape. */
export const CloseView = (): Interaction => Press.the(Key.Escape);
