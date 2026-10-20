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

  async loadTestPack(actor: UsesAbilities & AnswersQuestions): Promise<void> {
    // The pack zip is built by global-setup.ts.
    await this.openGameFile(actor, TEST_PACK.zipPath);
  }

  async openGameFile(actor: UsesAbilities & AnswersQuestions, path: string): Promise<void> {
    // Serenity's web API has no file upload, so this uses the native Playwright page.
    const page = (await BrowseTheWebWithPlaywright.as(actor).currentPage()) as PlaywrightPage;
    await (await page.nativePage()).locator('#openGame').setInputFiles(path);
  }
}
