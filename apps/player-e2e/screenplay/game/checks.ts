import { Task } from '@serenity-js/core';
import { equals } from '@serenity-js/assertions';
import { Text } from '@serenity-js/web';
import { seeEventually } from '../support/see-eventually';
import { MainText } from './elements';

export const SeeMainText = (text: string): Task =>
  seeEventually(MainText, (e) => Text.of(e).trim(), equals(text), `#actor sees main text "${text}"`);
