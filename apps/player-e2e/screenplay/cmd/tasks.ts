import { Task } from '@serenity-js/core';
import { Key, Press } from '@serenity-js/web';
import { waitUntilPresent } from '../support/presence';
import { TypeInto } from '../support/type-into';
import { CommandInput } from './elements';

/** Types `text` into the command line and submits it with Enter. */
export const SubmitCommand = (text: string): Task =>
  Task.where(
    `#actor submits "${text}" in the command line`,
    waitUntilPresent(CommandInput),
    TypeInto(text, CommandInput),
    Press.the(Key.Enter).in(CommandInput),
  );
