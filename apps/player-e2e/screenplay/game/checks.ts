import { Task } from '@serenity-js/core';
import { equals } from '@serenity-js/assertions';
import { Text } from '@serenity-js/web';
import { waitUntilAbsent } from '../support/presence';
import { seeEventually } from '../support/see-eventually';
import { MainText } from './elements';

export const SeeMainText = (text: string): Task =>
  seeEventually(MainText, (e) => Text.of(e).trim(), equals(text), `#actor sees main text "${text}"`);

/** No game is running: the game's main content is not rendered (the shelf shows instead). */
export const SeeNoGameRunning = (): Task => Task.where('#actor sees no game running', waitUntilAbsent(MainText));
