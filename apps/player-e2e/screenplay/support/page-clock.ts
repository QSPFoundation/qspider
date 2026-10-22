import { Interaction, Task } from '@serenity-js/core';
import { ProbeResult } from './page-script';
import { pollUntil } from './polling';

/**
 * Waits until `ms` have passed on the page's own clock. The single documented exception to "no fixed
 * sleeps": it waits for the condition under test (elapsed time) and must never paper over a race.
 * The only allowed use: the counter "does not run while a dialog / the pause screen is open" checks, with
 * ms = 5 x the timer interval. Any other use needs maintainer approval.
 */
export const PageClockAdvanced = (ms: number): Task =>
  Task.where(
    `#actor waits ${ms} ms on the page clock`,
    Interaction.where(`#actor lets ${ms} ms pass on the page clock`, async (actor) => {
      const now = async () => Number(await actor.answer(ProbeResult('pageClock')));
      const start = await now();
      const { met } = await pollUntil(
        actor,
        `the page clock reaching ${start + ms}`,
        async () => (await now()) - start >= ms,
        () => true,
      );
      if (!met) throw new Error(`The page clock did not advance ${ms} ms within the interaction timeout`);
    }),
  );
