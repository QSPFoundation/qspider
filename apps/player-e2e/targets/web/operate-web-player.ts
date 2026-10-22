import type { AnswersQuestions, UsesAbilities } from '@serenity-js/core';
import { BrowseTheWebWithPlaywright, type PlaywrightPage } from '@serenity-js/playwright';
import { TEST_PACK } from '../../fixtures/test-pack';
import { OperatePlayer } from '../../screenplay/support/operate-player';

/** The web player: a page at the app root; files open through the shelf's Open game file input. */
export class OperateWebPlayer extends OperatePlayer {
  async startPlayer(actor: UsesAbilities & AnswersQuestions): Promise<void> {
    const page = await BrowseTheWebWithPlaywright.as(actor).currentPage();
    await page.navigateTo('/');
  }

  async restartPlayer(actor: UsesAbilities & AnswersQuestions): Promise<void> {
    // A full page load in the same browser context (page.goto, not a client-side route change): the
    // app's init() runs again and reads the shelf and saves back from IndexedDB.
    const page = await BrowseTheWebWithPlaywright.as(actor).currentPage();
    await page.navigateTo('/');
  }

  async loadTestPack(actor: UsesAbilities & AnswersQuestions): Promise<void> {
    // The pack zip is built by global-setup.ts.
    await this.openGameFile(actor, TEST_PACK.zipPath);
  }

  async dropGameFile(_actor: UsesAbilities & AnswersQuestions, _path: string): Promise<void> {
    throw new Error('dropGameFile is not supported on web');
  }

  async openGameUrl(actor: UsesAbilities & AnswersQuestions, url: string): Promise<void> {
    const page = await BrowseTheWebWithPlaywright.as(actor).currentPage();
    // A relative url is resolved against the origin the player is served at (the config's baseURL).
    await page.navigateTo('/');
    const origin = new URL((await page.url()).href).origin;
    await page.navigateTo(`/?game=${encodeURIComponent(new URL(url, origin).href)}`);
  }

  async openGameFile(actor: UsesAbilities & AnswersQuestions, path: string): Promise<void> {
    // Serenity's web API has no file upload, so this uses the native Playwright page.
    const page = (await BrowseTheWebWithPlaywright.as(actor).currentPage()) as PlaywrightPage;
    await (await page.nativePage()).locator('#openGame').setInputFiles(path);
  }
}
