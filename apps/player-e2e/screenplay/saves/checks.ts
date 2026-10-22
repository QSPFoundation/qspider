import { Task } from '@serenity-js/core';
import { equals, not } from '@serenity-js/assertions';
import { Attribute } from '@serenity-js/web';
import { PauseScreenContent } from '../pause/elements';
import { seeEventually } from '../support/see-eventually';
import { QuickSaveSlot, SaveSlot } from './elements';

/** Slot `index` holds no save. Checks the slot's marker only: its "Empty" label is translated. */
export const SeeSlotEmpty = (index: number): Task =>
  seeEventually(
    SaveSlot(index),
    (e) => Attribute.called('data-save-empty').of(e),
    equals(''),
    `#actor sees save slot ${index} empty`,
  );

/** Slot `index` holds a save: its empty marker is absent. */
export const SeeSlotFilled = (index: number): Task =>
  seeEventually(
    SaveSlot(index),
    (e) => Attribute.called('data-save-empty').of(e),
    not(equals('')),
    `#actor sees save slot ${index} filled`,
  );

/** The quicksave slot holds a save. */
export const SeeQuickSaveFilled = (): Task =>
  seeEventually(
    QuickSaveSlot,
    (e) => Attribute.called('data-save-empty').of(e),
    not(equals('')),
    '#actor sees the quicksave filled',
  );

/** The saves panel was opened for `command`. */
export const SeeRequestedSaveCommand = (command: 'save' | 'load'): Task =>
  seeEventually(
    PauseScreenContent,
    (e) => Attribute.called('data-requested-save-command').of(e),
    equals(command),
    `#actor sees the saves panel requested for ${command}`,
  );
