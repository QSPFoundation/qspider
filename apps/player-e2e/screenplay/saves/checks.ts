import { Task } from '@serenity-js/core';
import { equals } from '@serenity-js/assertions';
import { Attribute } from '@serenity-js/web';
import { seeEventually } from '../support/see-eventually';
import { SaveSlot } from './elements';

/** Slot `index` holds no save. Checks the slot's marker only: its "Empty" label is translated. */
export const SeeSlotEmpty = (index: number): Task =>
  seeEventually(
    SaveSlot(index),
    (e) => Attribute.called('data-save-empty').of(e),
    equals(''),
    `#actor sees save slot ${index} empty`,
  );
