import { Task, type Answerable } from '@serenity-js/core';
import { endsWith, equals, includes, not } from '@serenity-js/assertions';
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

/** `element` eventually has no attribute `name` (it reads null on both targets). Check a settled anchor first. */
export const SeeElementWithoutAttribute = (element: Answerable<PageElement>, name: string): Task =>
  seeEventually(element, (e) => Attribute.called(name).of(e), equals(null), `#actor sees no ${name} attribute`);

/**
 * `element`'s URL attribute `name` is neutralized: it never mentions `javascript` and ends with `#`. The attribute
 * value is `#` on Chromium but the resolved URL (`<origin>/<path>#`) on desktop WebKit, so exact equality is not portable.
 */
export const SeeNeutralizedUrl = (element: Answerable<PageElement>, name: string): Task =>
  Task.where(
    `#actor sees the ${name} of the element neutralized`,
    seeEventually(
      element,
      (e) => Attribute.called(name).of(e).toLowerCase(),
      not(includes('javascript')),
      `#actor sees the ${name} free of "javascript"`,
    ),
    seeEventually(element, (e) => Attribute.called(name).of(e), endsWith('#'), `#actor sees the ${name} end with "#"`),
  );

/** `element`'s href is neutralized (SeeNeutralizedUrl). */
export const SeeNeutralizedHref = (element: Answerable<PageElement>): Task => SeeNeutralizedUrl(element, 'href');
