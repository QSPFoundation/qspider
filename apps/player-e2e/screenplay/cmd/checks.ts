import { Task } from '@serenity-js/core';
import { equals } from '@serenity-js/assertions';
import { Value } from '@serenity-js/web';
import { waitUntilAbsent } from '../support/presence';
import { seeEventually } from '../support/see-eventually';
import { CommandInput, CommandLine } from './elements';

/** The command line's text field eventually holds `text`. */
export const SeeCommandInput = (text: string): Task =>
  seeEventually(CommandInput, (e) => Value.of(e), equals(text), `#actor sees the command line hold "${text}"`);

/** The command line is gone. An absence check: check a settled anchor first. */
export const SeeNoCommandLine = (): Task => Task.where('#actor sees no command line', waitUntilAbsent(CommandLine));
