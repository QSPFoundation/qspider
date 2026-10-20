import { expect, test } from '@playwright/test';
import { ACTION, FIXTURE_PATH, SAVE_SLOT, SHELF_TITLE, TEXT } from '../shared/core-flow';
import {
  chooseSaveSlot,
  clickAction,
  expectMainText,
  expectSlotEmpty,
  failOnErrorAlert,
  openFromShelf,
  returnToShelf,
  shelfGameTitles,
} from './player';

test('opens a game from file, plays, saves, loads and returns to shelf', async ({ page }) => {
  await page.goto('/');
  expect(await shelfGameTitles(page)).toEqual([]); // clean state
  await page.locator('#openGame').setInputFiles(FIXTURE_PATH);
  await failOnErrorAlert(page);
  await expectMainText(page, TEXT.start);
  await clickAction(page, ACTION.goToRoom);
  await expectMainText(page, TEXT.room(0));
  await clickAction(page, ACTION.increment);
  await expectMainText(page, TEXT.room(1));
  await clickAction(page, ACTION.save);
  await expectSlotEmpty(page, SAVE_SLOT); // no leftover saves
  await chooseSaveSlot(page, SAVE_SLOT);
  await clickAction(page, ACTION.increment);
  await expectMainText(page, TEXT.room(2));
  await clickAction(page, ACTION.load);
  await chooseSaveSlot(page, SAVE_SLOT);
  await expectMainText(page, TEXT.room(1)); // restore is observable
  await returnToShelf(page);
  expect(await shelfGameTitles(page)).toContain(SHELF_TITLE);
  await openFromShelf(page, SHELF_TITLE);
  await expectMainText(page, TEXT.start);
});
