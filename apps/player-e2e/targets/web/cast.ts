import { Cast } from '@serenity-js/core';
import { BrowseTheWebWithPlaywright, type ExtraBrowserContextOptions } from '@serenity-js/playwright';
import type { Page } from '@playwright/test';
import { OperateWebPlayer } from './operate-web-player';

/** Web actors browse the test's own page (a fresh browser context per test) and operate the web player. */
export const webCast = (page: Page, contextOptions: Partial<ExtraBrowserContextOptions>): Cast =>
  Cast.where((actor) =>
    actor.whoCan(BrowseTheWebWithPlaywright.usingPage(page, contextOptions), new OperateWebPlayer()),
  );
