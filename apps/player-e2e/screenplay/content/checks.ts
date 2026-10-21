import type { Answerable, Task } from '@serenity-js/core';
import { equals } from '@serenity-js/assertions';
import { Attribute, Text, type PageElement } from '@serenity-js/web';
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

/** `element` eventually reads `text` (whitespace-trimmed). */
export const SeeElementText = (element: Answerable<PageElement>, text: string, description: string): Task =>
  seeEventually(element, (e) => Text.of(e).trim(), equals(text), description);

/** `element`'s attribute `name` eventually reads `value`. */
export const SeeElementAttribute = (element: Answerable<PageElement>, name: string, value: string): Task =>
  seeEventually(
    element,
    (e) => Attribute.called(name).of(e),
    equals(value),
    `#actor sees the ${name} attribute read "${value}"`,
  );
