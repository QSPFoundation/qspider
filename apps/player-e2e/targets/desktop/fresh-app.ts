// Per-test isolation for the desktop tests: one tauri-driver serves the whole run
// (wdio.conf.ts), and each test gets a new app process with empty app data.
import { browser } from '@wdio/globals';
import { desktopPlatform } from './platform';
import { assertDriverStarted, driverPid, ENV_APP_DATA_DIRS, requireEnv } from './platform/env';

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
 * The session's capabilities as the config set them, taken at the worker's first restart. Every restart
 * passes them explicitly: WebdriverIO's reloadSession(caps) keeps `caps` as the session's capabilities,
 * so a plain reloadSession() after a custom-args launch would reuse those args.
 */
let defaultCapabilities: WebdriverIO.Capabilities | undefined;

/** The default capabilities, with `args` (when given) as the app's command line instead of the config's. */
function launchCapabilities(args: string[] | undefined): WebdriverIO.Capabilities {
  defaultCapabilities ??= structuredClone(browser.requestedCapabilities as WebdriverIO.Capabilities);
  const capabilities = structuredClone(defaultCapabilities);
  if (args) {
    const options = (capabilities as Record<string, unknown>)['tauri:options'] as Record<string, unknown>;
    (capabilities as Record<string, unknown>)['tauri:options'] = { ...options, args: [...args] };
  }
  return capabilities;
}

/**
 * Ends the running app and waits until it and its webview processes have exited (so nothing still
 * writes app data). An app that already exited after expectAppExit (a game that quit) only has its
 * dead session ended; with no exit expected, a missing app fails. Then, when `wipeData`, empties
 * the app data dirs the platform named (ENV_APP_DATA_DIRS, never anything else;
 * a delete that fails, e.g. on a file still held open, fails the restart). Then starts a new
 * session: tauri-driver launches a new app process, which opens the test pack from its CLI argument,
 * or, with `args`, gets `args` as its command line instead.
 */
async function restartApp(wipeData: boolean, args?: string[]): Promise<void> {
  assertDriverStarted();
  const capabilities = launchCapabilities(args);
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
    dataDirs.forEach((dir) => platform.emptyDir(dir));
  }
  await browser.reloadSession(capabilities);
}

/** A new app process with empty app data: the start of every scenario. */
export const restartAppWithEmptyData = (): Promise<void> => restartApp(true);

/**
 * A new app process on the same private app data dirs, kept as they are: for scenarios about what
 * survives a restart. Same isolation as restartAppWithEmptyData.
 */
export const restartAppKeepingData = (): Promise<void> => restartApp(false);

/**
 * A new app process on the same private app data dirs, launched with `args` as its command line instead
 * of the test pack (the binary stays the config's). The next restart launches with the default args again.
 */
export const restartAppKeepingDataWith = (args: string[]): Promise<void> => restartApp(false, args);
