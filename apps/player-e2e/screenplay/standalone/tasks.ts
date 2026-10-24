import { Interaction, Task } from '@serenity-js/core';
import { Action } from '../game/elements';
import { isSessionEndedError } from '../support/element-errors';
import { ClickWhenPresent } from '../support/presence';

/**
 * Clicks the game action `label` that closes the app (desktop). The app can exit before the click is
 * answered, ending the session under it; only that error is accepted. Follow with SeeAppClosed, which
 * proves the app is gone (a click that ended the session without closing the app fails there).
 */
export const ClickActionClosingTheApp = (label: string): Task =>
  Task.where(
    `#actor clicks the "${label}" action, which closes the app`,
    Interaction.where(`#actor clicks the "${label}" action`, async (actor) => {
      try {
        await ClickWhenPresent(Action(label)).performAs(actor);
      } catch (error) {
        if (!isSessionEndedError(error)) throw error;
      }
    }),
  );
