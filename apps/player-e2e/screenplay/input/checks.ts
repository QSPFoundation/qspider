import type { Task } from '@serenity-js/core';
import { equals } from '@serenity-js/assertions';
import { Text } from '@serenity-js/web';
import { waitUntilAbsent } from '../support/presence';
import { seeEventually } from '../support/see-eventually';
import { InputContent, InputDialog } from './elements';

export const SeeInput = (prompt: string): Task =>
  seeEventually(InputContent, (e) => Text.of(e).trim(), equals(prompt), `#actor sees input prompt "${prompt}"`);

export const SeeInputGone = () => waitUntilAbsent(InputDialog);
