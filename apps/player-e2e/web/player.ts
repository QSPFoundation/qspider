import { expect, type Page } from '@playwright/test';
import { ACTION, FIXTURE_PATH, TEXT } from '../shared/core-flow';

const MAIN_TEXT_TIMEOUT = 15_000;

const mainContent = (page: Page) => page.locator('[data-qsp="main-content"]');
// Error UI the player can show while opening a game:
// - the import error toast (libs/game-shelf/src/components/error-alert.tsx), which closes
//   itself after a few seconds, so it must be checked as soon as it can appear;
// - the QSP engine error dialog (libs/renderer/src/qsp-error-alert.tsx), e.g. "Game not loaded!".
const errorAlert = (page: Page) => page.locator('.qsp-toast-root.error').or(page.getByRole('alertdialog'));

/** Throws with the alert text if an error toast or QSP error dialog is showing. */
export async function failOnErrorAlert(page: Page): Promise<void> {
  const alert = errorAlert(page).first();
  if (await alert.isVisible()) {
    throw new Error(`Player shows an error alert: ${(await alert.innerText()).replace(/\s+/g, ' ').trim()}`);
  }
}

/** Clicks a game action (the actions panel buttons) by its label. */
export async function clickAction(page: Page, label: string): Promise<void> {
  await page.locator('[data-qsp="actions-list"]').getByRole('button', { name: label, exact: true }).click();
}

/** Waits until the main description panel shows exactly `text`. */
export async function expectMainText(page: Page, text: string): Promise<void> {
  await expect(mainContent(page)).toHaveText(text, { timeout: MAIN_TEXT_TIMEOUT });
}

function saveSlot(page: Page, index: number) {
  return page.getByRole('dialog').locator(`[data-qsp-save-index="${index}"]`);
}

/**
 * Picks a slot in the saves panel opened by the game's `savegame`/`opengame`.
 * In that mode the slot shows only the requested command's button (Save or Load).
 */
export async function chooseSaveSlot(page: Page, index: number): Promise<void> {
  const dialog = page.getByRole('dialog');
  await saveSlot(page, index)
    .getByRole('button', { name: /^(Save|Load)$/ })
    .click();
  await expect(dialog).toBeHidden();
}

export async function expectSlotEmpty(page: Page, index: number): Promise<void> {
  const slot = saveSlot(page, index);
  await expect(slot).toBeVisible();
  await expect(slot).toHaveAttribute('data-save-empty', '');
  await expect(slot).toContainText('Empty');
}

/** Opens the pause screen with Escape and quits to the game shelf. */
export async function returnToShelf(page: Page): Promise<void> {
  await page.keyboard.press('Escape');
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: 'Quit', exact: true }).click();
  await expect(page.locator('.game-shelf')).toBeVisible();
}

/**
 * Waits until the shelf lists exactly `titles`, in order, so a duplicate entry fails.
 * An empty list means the shelf shows its empty state.
 */
export async function expectShelfTitles(page: Page, titles: string[]): Promise<void> {
  const shelf = page.locator('.game-shelf');
  const cardTitles = shelf.getByRole('heading', { level: 3 });
  if (titles.length === 0) {
    await expect(shelf.getByText('Game shelf is empty')).toBeVisible();
    await expect(cardTitles).toHaveCount(0);
  } else {
    await expect(cardTitles).toHaveText(titles);
  }
}

export async function openFromShelf(page: Page, title: string): Promise<void> {
  await page
    .locator('.game-shelf__card')
    .filter({ has: page.getByRole('heading', { name: title, exact: true }) })
    .getByRole('link', { name: 'Run', exact: true })
    .click();
}

/**
 * Opens the e2e fixture through the shelf's file input. Waits for whichever comes
 * first, the game text or the import error toast, and fails with the toast's text.
 */
export async function importFixture(page: Page): Promise<void> {
  await page.locator('#openGame').setInputFiles(FIXTURE_PATH);
  const started = mainContent(page).filter({ hasText: TEXT.start });
  await expect(started.or(errorAlert(page)).first()).toBeVisible({ timeout: MAIN_TEXT_TIMEOUT });
  await failOnErrorAlert(page);
  await expectMainText(page, TEXT.start);
}

/** Starts from the app root and opens the e2e fixture. */
export async function openFixture(page: Page): Promise<void> {
  await page.goto('/');
  await importFixture(page);
}

/** From the start location: goes to the room and increments the counter `n` times. */
export async function reachCounter(page: Page, n: number): Promise<void> {
  await clickAction(page, ACTION.goToRoom);
  await expectMainText(page, TEXT.room(0));
  for (let i = 1; i <= n; i++) {
    await clickAction(page, ACTION.increment);
    await expectMainText(page, TEXT.room(i));
  }
}
