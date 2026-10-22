import { AssertionError } from '@serenity-js/core';
import { describeError } from './element-errors';
import { INTERACTION_TIMEOUT } from './timeouts';

/**
 * The tail of an eventual check whose polling timed out: runs `strictCheck` once to report what the
 * player sees now (an AssertionError with Expected/Received), with the last error tolerated while
 * polling appended. `strictCheck` gets that suffix, for messages it builds itself. Any other error
 * from the strict check becomes "could not <couldNot>". Returns normally if the strict check passes.
 *
 * `kind` names the polled error in the suffix: "read" (element reads) or "script" (page scripts).
 */
export async function reportTimedOutCheck(
  lastError: unknown,
  kind: 'read' | 'script',
  couldNot: string,
  strictCheck: (last: string) => Promise<void>,
): Promise<void> {
  const last = lastError === undefined ? '' : `\nLast ${kind} error while waiting: ${describeError(lastError)}`;
  try {
    await strictCheck(last);
  } catch (error) {
    if (error instanceof AssertionError) {
      throw error.message.includes(last) ? error : new AssertionError(`${error.message}${last}`, error);
    }
    throw new AssertionError(
      `Timed out after ${INTERACTION_TIMEOUT.toString()}: could not ${couldNot} (${describeError(error)})${last}`,
      error instanceof Error ? error : undefined,
    );
  }
}
