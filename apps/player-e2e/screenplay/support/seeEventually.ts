import { Task, Wait, type Answerable, type Expectation } from '@serenity-js/core';
import { Ensure, isPresent } from '@serenity-js/assertions';
import type { PageElement } from '@serenity-js/web';

/**
 * The one way to check what the player sees: waits until `element` is present, then waits until
 * `question(element)` meets `expectation`.
 *
 * Waiting for presence first matters on desktop: Serenity's WebdriverIO adapter does not retry
 * WebKitWebDriver's "no such element", so reading an element that has not rendered yet fails at once.
 */
export function seeEventually<T>(
  element: Answerable<PageElement>,
  question: (e: Answerable<PageElement>) => Answerable<T>,
  expectation: Expectation<T>,
  description: string,
): Task {
  return Task.where(description, Wait.until(element, isPresent()), Ensure.eventually(question(element), expectation));
}
