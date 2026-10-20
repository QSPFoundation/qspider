import { SHELF_TITLE, TEXT } from '../shared/core-flow';
import { expectMainText, openFixture, openFromShelf, returnToShelf } from './player';

it('a game on the shelf can be reopened', async () => {
  await openFixture();
  await returnToShelf();
  await openFromShelf(SHELF_TITLE);
  await expectMainText(TEXT.start);
});
