// Per-test isolation for the desktop tests: one tauri-driver serves the whole run
// (wdio.conf.ts), and each test gets a new app process with empty app data.
import { mkdirSync, rmSync } from 'node:fs';
import { browser } from '@wdio/globals';
import { desktopPlatform } from './platform';
import { driverPid, ENV_APP_DATA_DIRS, requireEnv } from './platform/env';

const EXIT_TIMEOUT = 10_000;

/** Whether an app process (or one of its webview processes) is running under the worker's tauri-driver. */
export function appRunning(): boolean {
  return desktopPlatform().appRunning();
}

/**
 * Set by expectAppExit when a scenario makes the app exit on purpose (a game that quits); consumed
 * by the next restart. Only while it is set may the actor's discard (cast.ts) and the next restart
 * find no app running; otherwise a missing app is a failure (a crash).
 */
let appExitExpected = false;

/** The app is about to exit on purpose: the scenario's end and the next restart tolerate a missing app. */
export function expectAppExit(): void {
  appExitExpected = true;
}

/** Whether the app exited after expectAppExit: nothing is left to discard (cast.ts). */
export function appExitedAsExpected(): boolean {
  return appExitExpected && !appRunning();
}

/**
 * Ends the running app and waits until it and its webview processes have exited (so nothing still
 * writes app data). An app that already exited after expectAppExit (a game that quit) only has its
 * dead session ended; with no exit expected, a missing app fails. Then, when `wipeData`, empties
 * the app data dirs the platform named (ENV_APP_DATA_DIRS, never anything else;
 * a delete that fails, e.g. on a file still held open, fails the restart). Then starts a new
 * session: tauri-driver launches a new app process, which opens the test pack from its CLI argument.
 */
async function restartApp(wipeData: boolean): Promise<void> {
  const platform = desktopPlatform();
  const driver = driverPid();
  const dataDirs = JSON.parse(requireEnv(ENV_APP_DATA_DIRS)) as string[];

  const exitExpected = appExitExpected;
  appExitExpected = false;
  const running = platform.appProcesses(driver);
  if (running.length > 0) {
    await browser.deleteSession();
    await platform.waitForExit(running, EXIT_TIMEOUT);
  } else if (exitExpected) {
    console.warn('Restart: the previous app had already exited, as the previous scenario expected');
    // Its session outlived the app; WebKitWebDriver may answer the delete with an error about that.
    await browser.deleteSession().catch((error: unknown) => {
      console.warn(`Ended the session of an app that had already exited: ${String(error)}`);
    });
  } else {
    throw new Error(`No app process found under tauri-driver (pid ${driver})`);
  }

  if (wipeData) {
    for (const dir of dataDirs) {
      rmSync(dir, { recursive: true, force: true });
      mkdirSync(dir);
    }
  }
  await browser.reloadSession();
}

/** A new app process with empty app data: the start of every scenario. */
export const restartAppWithEmptyData = (): Promise<void> => restartApp(true);

/**
 * A new app process on the same private app data dirs, kept as they are: for scenarios about what
 * survives a restart. Same isolation as restartAppWithEmptyData.
 */
export const restartAppKeepingData = (): Promise<void> => restartApp(false);
