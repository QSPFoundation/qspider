import {
  AssertionError,
  type Answerable,
  d,
  ExpectationMet,
  type Expectation,
  Interaction,
  Task,
} from '@serenity-js/core';
import { Ensure } from '@serenity-js/assertions';
import type { PageElement } from '@serenity-js/web';
import { describeError } from './element-errors';
import { pollUntil } from './polling';
import { INTERACTION_TIMEOUT } from './timeouts';

/**
 * The one way to check what the player sees: polls until `element` is present and
 * `question(element)` meets `expectation`, for up to INTERACTION_TIMEOUT.
 *
 * Every read is error-tolerant: on desktop a read of an element that is not rendered yet, or is
 * re-rendering, throws WebKitWebDriver's raw "no such element" (see presence.ts), and Serenity's
 * Ensure.eventually would fail on it at once. Here a read error only means "not yet". After the
 * timeout, one strict Ensure.that reports Expected/Received, with the last read error appended.
 */
export function seeEventually<T>(
  element: Answerable<PageElement>,
  question: (e: Answerable<PageElement>) => Answerable<T>,
  expectation: Expectation<T>,
  description: string,
): Task {
  const actual = question(element);
  const check = Interaction.where(d`#actor waits until ${actual} does ${expectation}`, async (actor) => {
    const { met, lastError } = await pollUntil(
      actor,
      d`whether ${actual} does ${expectation}`,
      async (a) =>
        (await (await a.answer(element)).isPresent()) &&
        (await a.answer(expectation.isMetFor(actual))) instanceof ExpectationMet,
      () => true,
    );
    if (met) return;
    const name = d`${element}`;

    // Timed out: one strict read reports what the player sees now.
    const last = lastError === undefined ? '' : `\nLast read error while waiting: ${describeError(lastError)}`;
    try {
      if (!(await (await actor.answer(element)).isPresent())) {
        throw new AssertionError(`Timed out after ${INTERACTION_TIMEOUT.toString()}: ${name} is not present${last}`);
      }
      await Ensure.that(actual, expectation).performAs(actor);
    } catch (error) {
      if (error instanceof AssertionError) {
        throw error.message.includes(last) ? error : new AssertionError(`${error.message}${last}`, error);
      }
      throw new AssertionError(
        `Timed out after ${INTERACTION_TIMEOUT.toString()}: could not read ${name} (${describeError(error)})${last}`,
        error instanceof Error ? error : undefined,
      );
    }
  });
  return Task.where(description, check);
}
