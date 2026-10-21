import type { Task } from '@serenity-js/core';
import { equals } from '@serenity-js/assertions';
import { Text } from '@serenity-js/web';
import { seeEventually } from '../support/see-eventually';
import { ContentMark } from './elements';

/** The element marked `mark` eventually reads `text`. */
export const SeeContentText = (mark: string, text: string): Task =>
  seeEventually(
    ContentMark(mark),
    (e) => Text.of(e).trim(),
    equals(text),
    `#actor sees content "${mark}" read "${text}"`,
  );
