import type { Interaction } from '@serenity-js/core';
import { ClickWhenPresent } from '../support/presence';
import { ObjectItem } from './elements';

/** Clicks the object named `name` in the objects panel, which selects it. */
export const SelectObject = (name: string): Interaction => ClickWhenPresent(ObjectItem(name));
