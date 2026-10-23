import { equals } from '@serenity-js/assertions';
import type { Task } from '@serenity-js/core';
import { Text } from '@serenity-js/web';
import { seeEventually } from '../support/see-eventually';
import { ResourceMark } from './elements';

/** The marker `qa` that a game script wrote reads `text`. */
export const SeeResourceMark = (qa: string, text: string): Task =>
  seeEventually(ResourceMark(qa), (e) => Text.of(e).trim(), equals(text), `#actor sees ${qa} = "${text}"`);
