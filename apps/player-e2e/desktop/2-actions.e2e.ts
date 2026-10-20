import { ACTION, TEXT } from '../shared/core-flow';
import { clickAction, expectMainText, openFixture } from './player';

it('actions update the game text', async () => {
  await openFixture();
  await clickAction(ACTION.goToRoom);
  await expectMainText(TEXT.room(0));
  await clickAction(ACTION.increment);
  await expectMainText(TEXT.room(1));
});
