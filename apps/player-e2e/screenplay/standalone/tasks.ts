import { Interaction, Task } from '@serenity-js/core';
import { ActionInView } from '../game/tasks';
import { isSessionEndedError } from '../support/element-errors';
import { ExpectAppExit } from '../support/operate-player';
import { ClickWhenPresent } from '../support/presence';

/**
 * Clicks the game action `label` that closes the app (desktop). The app can exit before the click is
 * answered, ending the session under it; only that error is accepted. Follow with SeeAppClosed, which
 * proves the app is gone (a click that ended the session without closing the app fails there).
 * Declares the exit first (ExpectAppExit), so the scenario's end and the next restart accept it.
 */
export const ClickActionClosingTheApp = (label: string): Task =>
  Task.where(
    `#actor clicks the "${label}" action, which closes the app`,
    ExpectAppExit(),
    Interaction.where(`#actor clicks the "${label}" action`, async (actor) => {
      try {
        await ClickWhenPresent(...ActionInView(label)).performAs(actor);
      } catch (error) {
        if (!isSessionEndedError(error)) throw error;
      }
    }),
  );
