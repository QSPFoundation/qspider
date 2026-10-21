import type { Interaction } from '@serenity-js/core';
import { Key, Press } from '@serenity-js/web';
import { ClickWhenPresent } from '../support/presence';
import { MenuItem } from './elements';

export const ChooseMenuItem = (name: string): Interaction => ClickWhenPresent(MenuItem(name));

/** Dismisses the menu with Escape; the engine receives -1. */
export const CancelMenu = (): Interaction => Press.the(Key.Escape);
