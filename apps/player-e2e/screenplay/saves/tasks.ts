import { Task, Wait } from '@serenity-js/core';
import { equals } from '@serenity-js/assertions';
import { Click } from '@serenity-js/web';
import { PauseScreen } from '../pause/elements';
import { PresenceOf, waitUntilPresent } from '../support/presence';
import { SlotCommandButton } from './elements';

/** In the saves panel, saves to or loads from slot `index`, then waits until the panel has closed. */
export const ChooseSaveSlot = (index: number): Task =>
  Task.where(
    `#actor chooses save slot ${index}`,
    waitUntilPresent(SlotCommandButton(index)),
    Click.on(SlotCommandButton(index)),
    Wait.until(PresenceOf(PauseScreen), equals(false)),
  );
