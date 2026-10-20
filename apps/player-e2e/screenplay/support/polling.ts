import {
  AssertionError,
  Question,
  TimeoutExpiredError,
  Wait,
  type AnswersQuestions,
  type UsesAbilities,
} from '@serenity-js/core';
import { equals } from '@serenity-js/assertions';
import { INTERACTION_TIMEOUT, POLLING_INTERVAL } from './timeouts';

type Actor = UsesAbilities & AnswersQuestions;

export interface PollResult {
  met: boolean;
  /** The last error `tolerate` accepted, if any; the caller puts it in its timeout message. */
  lastError?: unknown;
}

/**
 * Calls `attempt` every POLLING_INTERVAL until it returns true or INTERACTION_TIMEOUT passes.
 * An error `tolerate` accepts counts as "not yet" and is remembered; any other error aborts.
 * Resolves `{ met: false, lastError }` on timeout instead of throwing, so the caller can report it.
 */
export async function pollUntil(
  actor: Actor,
  description: string,
  attempt: (actor: Actor) => Promise<boolean>,
  tolerate: (error: unknown) => boolean,
): Promise<PollResult> {
  let lastError: unknown;
  const done = Question.about(description, async (a) => {
    try {
      return await attempt(a);
    } catch (error) {
      if (!tolerate(error)) throw error;
      lastError = error;
      return false;
    }
  });
  try {
    await Wait.upTo(INTERACTION_TIMEOUT).until(done, equals(true)).pollingEvery(POLLING_INTERVAL).performAs(actor);
    return { met: true };
  } catch (error) {
    if (error instanceof AssertionError && error.cause instanceof TimeoutExpiredError) return { met: false, lastError };
    throw error;
  }
}
