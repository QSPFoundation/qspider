import type { AnswersQuestions, UsesAbilities } from '@serenity-js/core';
import { BrowseTheWebWithPlaywright, type PlaywrightPage } from '@serenity-js/playwright';
import { TEST_PACK } from '../../fixtures/test-pack';
import { OperatePlayer } from '../../screenplay/support/operate-player';

/** The web player: a page at the app root; files open through the shelf's Open game file input. */
export class OperateWebPlayer extends OperatePlayer {
  private readonly proxied: string[] = [];

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

  async delayRequests(actor: UsesAbilities & AnswersQuestions, pathSuffix: string, ms: number): Promise<void> {
    const page = (await BrowseTheWebWithPlaywright.as(actor).currentPage()) as PlaywrightPage;
    // The server answers late: the route holds the request for `ms` before it goes on to the network. It is
    // routed on the browser context, not the page: a page route never sees the service worker's own requests
    // (its script, and what it fetches from the network).
    await (await page.nativePage()).context().route(
      (url) => url.pathname.endsWith(pathSuffix),
      async (route) => {
        await new Promise((resolve) => setTimeout(resolve, ms));
        await route.continue().catch(() => undefined); // the page may have gone by then
      },
    );
  }

  async routeThroughProxy(actor: UsesAbilities & AnswersQuestions, origin: string): Promise<void> {
    const page = (await BrowseTheWebWithPlaywright.as(actor).currentPage()) as PlaywrightPage;
    const native = await page.nativePage();
    const playerOrigin = new URL((await page.url()).href).origin;
    await native.route(
      (url) => url.origin === origin,
      (route) => route.abort('failed'),
    );
    await native.route('https://proxy.qspider.xyz/**', async (route) => {
      // The tail is btoa(encodeURI(original url)), see libs/utils/src/fetch.ts.
      const original = decodeURI(atob(new URL(route.request().url()).pathname.slice(1)));
      this.proxied.push(original);
      const target = new URL(original);
      // The fake origin's files are the player's own served fixtures, at the same path.
      const served =
        target.origin === origin ? await native.request.get(new URL(target.pathname, playerOrigin).href) : undefined;
      await route.fulfill({
        status: served?.status() ?? 404,
        headers: { 'access-control-allow-origin': '*' },
        body: served ? await served.body() : '',
      });
    });
  }

  async proxiedUrls(): Promise<string[]> {
    return [...this.proxied];
  }

  async emulateColorScheme(actor: UsesAbilities & AnswersQuestions, scheme: 'light' | 'dark'): Promise<void> {
    const page = (await BrowseTheWebWithPlaywright.as(actor).currentPage()) as PlaywrightPage;
    await (await page.nativePage()).emulateMedia({ colorScheme: scheme });
  }
}
