import { Task, type Answerable, type Expectation } from '@serenity-js/core';
import { Ensure } from '@serenity-js/assertions';
import type { PageElement } from '@serenity-js/web';
import { waitUntilPresent } from './presence';

/**
 * The one way to check what the player sees: waits until `element` is present, then waits until
 * `question(element)` meets `expectation`.
 *
 * Waiting for presence first matters on desktop: Serenity's WebdriverIO adapter does not retry
 * WebKitWebDriver's "no such element", so reading an element that has not rendered yet fails at once
 * (see presence.ts).
 */
export function seeEventually<T>(
  element: Answerable<PageElement>,
  question: (e: Answerable<PageElement>) => Answerable<T>,
  expectation: Expectation<T>,
  description: string,
): Task {
  return Task.where(description, waitUntilPresent(element), Ensure.eventually(question(element), expectation));
}
