import type { AnswersQuestions, UsesAbilities } from '@serenity-js/core';
import { BrowseTheWebWithPlaywright, type PlaywrightPage } from '@serenity-js/playwright';
import { OperatePlayer } from '../../screenplay/support/operate-player';

/** The web player: a page at the app root; game files open through the shelf's file input. */
export class OperateWebPlayer extends OperatePlayer {
  async startPlayer(actor: UsesAbilities & AnswersQuestions): Promise<void> {
    const page = await BrowseTheWebWithPlaywright.as(actor).currentPage();
    await page.navigateTo('/');
  }

  async openGameFile(actor: UsesAbilities & AnswersQuestions, path: string): Promise<void> {
    // Serenity's web API has no file upload, so this uses the native Playwright page.
    const page = (await BrowseTheWebWithPlaywright.as(actor).currentPage()) as PlaywrightPage;
    await (await page.nativePage()).locator('#openGame').setInputFiles(path);
  }
}
