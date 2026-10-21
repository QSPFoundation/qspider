import type { Interaction } from '@serenity-js/core';
import { ClickWhenPresent } from '../support/presence';
import { WaitLock } from './elements';

export const ClickWaitLock = (): Interaction => ClickWhenPresent(WaitLock);
