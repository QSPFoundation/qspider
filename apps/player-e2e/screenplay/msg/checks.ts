import type { Task } from '@serenity-js/core';
import { equals } from '@serenity-js/assertions';
import { Text } from '@serenity-js/web';
import { waitUntilAbsent } from '../support/presence';
import { seeEventually } from '../support/see-eventually';
import { MsgContent, MsgDialog } from './elements';

export const SeeMsg = (text: string): Task =>
  seeEventually(MsgContent, (e) => Text.of(e).trim(), equals(text), `#actor sees message box text "${text}"`);

export const SeeMsgGone = () => waitUntilAbsent(MsgDialog);
