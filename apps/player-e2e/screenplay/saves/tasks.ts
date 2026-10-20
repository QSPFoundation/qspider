import { Task } from '@serenity-js/core';
import { PauseScreen } from '../pause/elements';
import { ClickWhenPresent, waitUntilAbsent } from '../support/presence';
import { SlotCommandButton } from './elements';

/** In the saves panel, saves to or loads from slot `index`, then waits until the panel has closed. */
export const ChooseSaveSlot = (index: number): Task =>
  Task.where(
    `#actor chooses save slot ${index}`,
    ClickWhenPresent(SlotCommandButton(index)),
    waitUntilAbsent(PauseScreen),
  );
