import { expect, test } from '@playwright/test';
import { ACTION, FIXTURE_PATH, SAVE_SLOT, SHELF_TITLE, TEXT } from '../shared/core-flow';
import {
  chooseSaveSlot,
  clickAction,
  expectMainText,
  expectSlotEmpty,
  failOnErrorAlert,
  openFixture,
  openFromShelf,
  reachCounter,
  returnToShelf,
  shelfGameTitles,
} from './player';

// Each test runs in a fresh browser context: empty shelf, no saves.

test('opening a game file starts it and adds it to the shelf', async ({ page }) => {
  await page.goto('/');
  expect(await shelfGameTitles(page)).toEqual([]); // clean state
  await page.locator('#openGame').setInputFiles(FIXTURE_PATH);
  await failOnErrorAlert(page);
  await expectMainText(page, TEXT.start);
  await returnToShelf(page);
  expect(await shelfGameTitles(page)).toContain(SHELF_TITLE);
});

test('actions update the game text', async ({ page }) => {
  await openFixture(page);
  await clickAction(page, ACTION.goToRoom);
  await expectMainText(page, TEXT.room(0));
  await clickAction(page, ACTION.increment);
  await expectMainText(page, TEXT.room(1));
});

test('loading a save restores the saved state', async ({ page }) => {
  await openFixture(page);
  await reachCounter(page, 1);
  await clickAction(page, ACTION.save);
  await expectSlotEmpty(page, SAVE_SLOT); // no leftover saves
  await chooseSaveSlot(page, SAVE_SLOT);
  await clickAction(page, ACTION.increment);
  await expectMainText(page, TEXT.room(2));
  await clickAction(page, ACTION.load);
  await chooseSaveSlot(page, SAVE_SLOT);
  await expectMainText(page, TEXT.room(1)); // restore is observable
});

test('a game on the shelf can be reopened', async ({ page }) => {
  await openFixture(page);
  await returnToShelf(page);
  await openFromShelf(page, SHELF_TITLE);
  await expectMainText(page, TEXT.start);
});
