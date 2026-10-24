import { AssertionError, Interaction, Task } from '@serenity-js/core';
import { OperatePlayer } from '../support/operate-player';
import { pollUntil } from '../support/polling';
import { INTERACTION_TIMEOUT } from '../support/timeouts';

/**
 * The player's window has closed and the app has exited (desktop only): no app process is left.
 * A positive check on the process, not on the page, which a closed window can no longer answer.
 */
export const SeeAppClosed = (): Task =>
  Task.where(
    '#actor sees the app close',
    Interaction.where('#actor waits for the app to exit', async (actor) => {
      const { met } = await pollUntil(
        actor,
        'whether the app has exited',
        async (a) => !(await OperatePlayer.as(a).appRunning(a)),
        () => false,
      );
      if (!met)
        throw new AssertionError(
          `The app was still running ${INTERACTION_TIMEOUT.toString()} after it should have closed`,
        );
    }),
  );
