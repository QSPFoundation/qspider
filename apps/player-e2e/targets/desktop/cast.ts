import { Cast } from '@serenity-js/core';
import { BrowseTheWebWithWebdriverIO, WebdriverIOBrowsingSession } from '@serenity-js/webdriverio';
import { browser } from '@wdio/globals';
import { appRunning } from './fresh-app';
import { OperateDesktopPlayer } from './operate-desktop-player';

/**
 * Browsing the app's webview. When the actor leaves the stage after the app has exited (a game that
 * quit), there are no windows left to discard and the session is gone: discarding them would fail
 * the scenario on the dead session. The next restart ends that session (fresh-app.ts).
 */
class BrowseTheDesktopApp extends BrowseTheWebWithWebdriverIO {
  override async discard(): Promise<void> {
    if (appRunning()) await super.discard();
  }
}

/** Desktop actors drive the app's webview through tauri-driver and operate the desktop player. */
export const desktopCast = (): Cast =>
  Cast.where((actor) =>
    actor.whoCan(new BrowseTheDesktopApp(new WebdriverIOBrowsingSession(browser)), new OperateDesktopPlayer()),
  );
