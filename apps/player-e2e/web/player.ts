import { expect, type Page } from '@playwright/test';

const MAIN_TEXT_TIMEOUT = 15_000;

/** Throws with the alert text if the shelf/import error toast is showing. */
export async function failOnErrorAlert(page: Page): Promise<void> {
  const alert = page.locator('.qsp-toast-root.error');
  if (await alert.isVisible()) {
    throw new Error(`Player shows an error alert: ${(await alert.innerText()).trim()}`);
  }
}

/** Clicks a game action (the actions panel buttons) by its label. */
export async function clickAction(page: Page, label: string): Promise<void> {
  await page.locator('[data-qsp="actions-list"]').getByRole('button', { name: label, exact: true }).click();
}

/** Waits until the main description panel shows exactly `text`. */
export async function expectMainText(page: Page, text: string): Promise<void> {
  try {
    await expect(page.locator('[data-qsp="main-content"]')).toHaveText(text, { timeout: MAIN_TEXT_TIMEOUT });
  } catch (err) {
    await failOnErrorAlert(page);
    throw err;
  }
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

/** Titles of the games on the shelf, once the shelf has rendered. */
export async function shelfGameTitles(page: Page): Promise<string[]> {
  const shelf = page.locator('.game-shelf');
  const titles = shelf.getByRole('heading', { level: 3 });
  await expect(shelf.getByText('Game shelf is empty').or(titles.first())).toBeVisible();
  return titles.allInnerTexts();
}

export async function openFromShelf(page: Page, title: string): Promise<void> {
  await page
    .locator('.game-shelf__card')
    .filter({ has: page.getByRole('heading', { name: title, exact: true }) })
    .getByRole('link', { name: 'Run', exact: true })
    .click();
}
