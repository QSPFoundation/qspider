import { E2E_GAME } from '../fixtures/e2e-game';
import { restartAppWithEmptyData } from '../targets/desktop/fresh-app';
import {
  chooseSaveSlot,
  clickAction,
  expectMainText,
  expectShelfTitles,
  expectSlotEmpty,
  openFixture,
  openFromShelf,
  reachCounter,
  returnToShelf,
} from './player';

const { action: ACTION, shelfTitle: SHELF_TITLE, text: TEXT } = E2E_GAME;
const SAVE_SLOT = 1;

// Each test runs in a fresh app process with empty app data: empty shelf, no saves.
// The app opens the fixture from its CLI argument, so there is no empty-shelf/import step.
beforeEach(restartAppWithEmptyData);

it('opening a game file starts it and adds it to the shelf', async () => {
  await openFixture();
  await returnToShelf();
  await expectShelfTitles([SHELF_TITLE]);
});

it('actions update the game text', async () => {
  await openFixture();
  await clickAction(ACTION.goToRoom);
  await expectMainText(TEXT.room(0));
  await clickAction(ACTION.increment);
  await expectMainText(TEXT.room(1));
});

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

it('a game on the shelf can be reopened', async () => {
  await openFixture();
  await returnToShelf();
  await openFromShelf(SHELF_TITLE);
  await expectMainText(TEXT.start);
});
