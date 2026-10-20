// WebdriverIO helpers for the desktop core-flow tests. Same names and meaning as
// web/player.ts, without the `page` argument (WDIO's `browser` is global).
import { $, $$, browser, expect } from '@wdio/globals';
import { E2E_GAME } from '../fixtures/e2e-game';

const { action: ACTION, text: TEXT } = E2E_GAME;

const MAIN_TEXT_TIMEOUT = 15_000;

const MAIN_CONTENT = '[data-qsp="main-content"]';
// Error UI the player can show while opening a game: the import error toast
// (libs/game-shelf/src/components/error-alert.tsx) and the QSP engine error dialog
// (libs/renderer/src/qsp-error-alert.tsx).
const ERROR_ALERT = '.qsp-toast-root.error, [role="alertdialog"]';
const DIALOG = '[role="dialog"]';

const normalize = (s: string): string => s.replace(/\s+/g, ' ').trim();

/** Visible elements matching `selector`, skipping ones that went stale mid-read. */
async function visible(selector: string): Promise<WebdriverIO.Element[]> {
  const result: WebdriverIO.Element[] = [];
  for (const el of await $$(selector).getElements()) {
    try {
      if (await el.isDisplayed()) result.push(el);
    } catch {
      // re-rendered between query and check
    }
  }
  return result;
}

async function textOf(el: WebdriverIO.Element): Promise<string | null> {
  try {
    return normalize(await el.getText());
  } catch {
    return null;
  }
}

/** Waits until exactly one visible `selector` element has text matching `matches`, returns it. */
async function theOnly(
  selector: string,
  matches: (text: string) => boolean,
  what: string,
): Promise<WebdriverIO.Element> {
  let found: WebdriverIO.Element[] = [];
  try {
    await browser.waitUntil(async () => {
      found = [];
      for (const el of await visible(selector)) {
        const text = await textOf(el);
        if (text !== null && matches(text)) found.push(el);
      }
      return found.length === 1;
    });
  } catch {
    throw new Error(`Expected exactly one visible ${what} (${selector}), found ${found.length}`);
  }
  return found[0];
}

/** Throws with the alert text if an error toast or QSP error dialog is showing. */
export async function failOnErrorAlert(): Promise<void> {
  const [alert] = await visible(ERROR_ALERT);
  if (alert) {
    throw new Error(`Player shows an error alert: ${(await textOf(alert)) ?? ''}`);
  }
}

/** Clicks a game action (the actions panel buttons) by its label. */
export async function clickAction(label: string): Promise<void> {
  const button = await theOnly(`[data-qsp="actions-list"] button`, (t) => t === label, `action "${label}"`);
  await button.click();
}

/** Waits until the main description panel shows exactly `text`. */
export async function expectMainText(text: string): Promise<void> {
  await expect($(MAIN_CONTENT)).toHaveText(text, { wait: MAIN_TEXT_TIMEOUT });
}

const saveSlot = (index: number): string => `${DIALOG} [data-qsp-save-index="${index}"]`;

/**
 * Picks a slot in the saves panel opened by the game's `savegame`/`opengame`.
 * In that mode the slot shows only the requested command's button (Save or Load).
 */
export async function chooseSaveSlot(index: number): Promise<void> {
  const button = await theOnly(
    `${saveSlot(index)} button`,
    (t) => /^(Save|Load)$/.test(t),
    `Save/Load in slot ${index}`,
  );
  await button.click();
  await $(DIALOG).waitForDisplayed({ reverse: true });
}

export async function expectSlotEmpty(index: number): Promise<void> {
  const slot = $(saveSlot(index));
  await expect(slot).toBeDisplayed();
  await expect(slot).toHaveAttribute('data-save-empty');
  await expect(slot).toHaveText(expect.stringContaining('Empty'));
}

/** Opens the pause screen with Escape and quits to the game shelf. */
export async function returnToShelf(): Promise<void> {
  await browser.keys('Escape');
  const quit = await theOnly(`${DIALOG} button`, (t) => t === 'Quit', 'Quit button');
  await quit.click();
  await expect($('.game-shelf')).toBeDisplayed();
}

/**
 * Waits until the shelf lists exactly `titles`, in order, so a duplicate entry fails.
 * An empty list means the shelf shows its empty state.
 */
export async function expectShelfTitles(titles: string[]): Promise<void> {
  let seen: (string | null)[] = [];
  let emptyShown = false;
  try {
    await browser.waitUntil(async () => {
      seen = [];
      for (const heading of await $$('.game-shelf h3').getElements()) seen.push(await textOf(heading));
      if (titles.length > 0) return JSON.stringify(seen) === JSON.stringify(titles);
      const shelf = $('.game-shelf');
      emptyShown =
        (await shelf.isExisting()) &&
        (await textOf(await shelf.getElement()))?.includes('Game shelf is empty') === true;
      return emptyShown && seen.length === 0;
    });
  } catch {
    throw new Error(
      `Expected shelf titles ${JSON.stringify(titles)}, saw ${JSON.stringify(seen)}` +
        (titles.length === 0 ? ` (empty message shown: ${emptyShown})` : ''),
    );
  }
}

export async function openFromShelf(title: string): Promise<void> {
  let card: WebdriverIO.Element | undefined;
  await browser.waitUntil(
    async () => {
      for (const c of await $$('.game-shelf__card').getElements()) {
        if ((await textOf(await c.$('h3').getElement())) === title) {
          card = c;
          return true;
        }
      }
      return false;
    },
    { timeoutMsg: `No shelf card titled "${title}"` },
  );
  const run = await card!.$('a=Run').getElement();
  await run.click();
}

/**
 * The game is passed as the app's CLI argument (wdio.desktop.conf.ts), so it opens on
 * launch. Waits for whichever comes first, the game text or an error alert, and fails
 * with the alert's text.
 */
export async function openFixture(): Promise<void> {
  await browser.waitUntil(
    async () => {
      if ((await visible(ERROR_ALERT)).length > 0) return true;
      const main = $(MAIN_CONTENT);
      return (await main.isExisting()) && ((await textOf(await main.getElement())) ?? '').includes(TEXT.start);
    },
    { timeout: MAIN_TEXT_TIMEOUT, timeoutMsg: `Neither "${TEXT.start}" nor an error alert appeared` },
  );
  await failOnErrorAlert();
  await expectMainText(TEXT.start);
}

/** From the start location: goes to the room and increments the counter `n` times. */
export async function reachCounter(n: number): Promise<void> {
  await clickAction(ACTION.goToRoom);
  await expectMainText(TEXT.room(0));
  for (let i = 1; i <= n; i++) {
    await clickAction(ACTION.increment);
    await expectMainText(TEXT.room(i));
  }
}
