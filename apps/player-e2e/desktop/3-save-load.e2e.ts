import { ACTION, SAVE_SLOT, TEXT } from '../shared/core-flow';
import { chooseSaveSlot, clickAction, expectMainText, expectSlotEmpty, openFixture, reachCounter } from './player';

it('loading a save restores the saved state', async () => {
  await openFixture();
  await reachCounter(1);
  await clickAction(ACTION.save);
  await expectSlotEmpty(SAVE_SLOT); // no leftover saves
  await chooseSaveSlot(SAVE_SLOT);
  await clickAction(ACTION.increment);
  await expectMainText(TEXT.room(2));
  await clickAction(ACTION.load);
  await chooseSaveSlot(SAVE_SLOT);
  await expectMainText(TEXT.room(1)); // restore is observable
});
