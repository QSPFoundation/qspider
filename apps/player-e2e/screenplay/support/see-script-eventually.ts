import { d, type Expectation, ExpectationMet, Interaction, type QuestionAdapter, Task } from '@serenity-js/core';
import { Ensure } from '@serenity-js/assertions';
import { pollUntil } from './polling';
import { reportTimedOutCheck } from './timeout-report';

/** Thrown at once (not polled) when the page has no recorder for the event type. */
export class NotRecordingError extends Error {}

/**
 * Like seeEventually, for a page-script question: polls until `actual` meets `expectation` (a script
 * error means "not yet", except NotRecordingError, which fails at once); on timeout one strict
 * Ensure.that reports Expected/Received.
 */
export function seeScriptEventually<T>(
  actual: QuestionAdapter<T>,
  expectation: Expectation<T>,
  description: string,
): Task {
  // The step title omits the expectation: it can list many values and overflow a report file name (the
  // failure detail below still carries Expected/Received).
  const check = Interaction.where(d`#actor waits until ${actual} meets its expectation`, async (actor) => {
    const { met, lastError } = await pollUntil(
      actor,
      d`whether ${actual} does ${expectation}`,
      async (a) => (await a.answer(expectation.isMetFor(actual))) instanceof ExpectationMet,
      (error) => !(error instanceof NotRecordingError),
    );
    if (met) return;
    await reportTimedOutCheck(lastError, 'script', d`run ${actual}`, () =>
      Ensure.that(actual, expectation).performAs(actor),
    );
  });
  return Task.where(description, check);
}
