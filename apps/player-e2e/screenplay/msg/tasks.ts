import type { Interaction } from '@serenity-js/core';
import { ClickWhenPresent } from '../support/presence';
import { MsgOkButton } from './elements';

export const DismissMsg = (): Interaction => ClickWhenPresent(MsgOkButton);
