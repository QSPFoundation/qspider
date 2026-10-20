import { Cast } from '@serenity-js/core';
import { BrowseTheWebWithWebdriverIO } from '@serenity-js/webdriverio';
import { browser } from '@wdio/globals';
import { OperateDesktopPlayer } from './operate-desktop-player';

/** Desktop actors drive the app's webview through tauri-driver and operate the desktop player. */
export const desktopCast = (): Cast =>
  Cast.where((actor) => actor.whoCan(BrowseTheWebWithWebdriverIO.using(browser), new OperateDesktopPlayer()));
