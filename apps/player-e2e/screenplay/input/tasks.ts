import { type Interaction, Task } from '@serenity-js/core';
import { ClickWhenPresent, waitUntilPresent } from '../support/presence';
import { TypeInto } from '../support/type-into';
import { InputCancel, InputField, InputOk } from './elements';

export const SubmitInput = (text: string): Task =>
  Task.where(
    `#actor submits "${text}" in the input dialog`,
    waitUntilPresent(InputField),
    TypeInto(text, InputField),
    ClickWhenPresent(InputOk),
  );

export const CancelInput = (): Interaction => ClickWhenPresent(InputCancel);
