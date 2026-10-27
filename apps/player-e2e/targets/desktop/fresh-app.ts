// Per-test isolation for the desktop tests: one tauri-driver serves the whole run
// (wdio.conf.ts), and each test gets a new app process with empty app data.
import { browser } from '@wdio/globals';
import { desktopPlatform, type Proc } from './platform';
import { assertDriverStarted, driverPid, ENV_APP_DATA_DIRS, requireEnv } from './platform/env';
import { restartStep } from './restart-step';

/** How long a closed app gets to exit on its own before its session is ended, which kills it. */
const CLOSE_TIMEOUT = 5_000;
/**
 * A guard against an app that never exits, not a speed budget: on Windows the orphaned WebView2 `browser` and
 * `crashpad-handler` processes of an app whose session ended sometimes take 20 s and more. The restart's own
 * timeout (RESTART_TIMEOUT) covers it.
 */
const EXIT_TIMEOUT = 40_000;
/** The mocha timeout a restart runs under, instead of the scenario's: the close, the exit wait, a launch. */
const RESTART_TIMEOUT = CLOSE_TIMEOUT + EXIT_TIMEOUT + 30_000;
/** How long the killed leftovers of a failed exit wait get to be gone. */
const KILL_TIMEOUT = 5_000;

/** The running scenario's test (scenario.ts), whose timeout a restart sets aside. */
let scenarioTest: Mocha.Runnable | undefined;

/** Called first in every scenario: its restarts do not count against its timeout. */
export function startScenario(context: Mocha.Context): void {
  scenarioTest = context.runnable();
}

/**
 * Set from the moment a restart ends the app's session until it starts the next one: a restart that failed
 * in between (its exit wait timed out) leaves no session, and the next restart must only start one.
 */
let sessionEnded = false;

/** Closes the app the way a user does, where the platform supports it, and waits (bounded) for it to exit. */
async function closeApp(platform: ReturnType<typeof desktopPlatform>, driver: number): Promise<void> {
  const app = platform.closeApp?.(platform.appProcesses(driver));
  if (app === undefined || app === null) return;
  const deadline = Date.now() + CLOSE_TIMEOUT;
  while (platform.appProcesses(driver).some((p) => p.pid === app)) {
    if (Date.now() > deadline) {
      console.warn(`The app (pid ${app}) did not exit within ${CLOSE_TIMEOUT}ms of a close; ending its session`);
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 250)); // poll interval, not a fixed wait
  }
}

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
 * Closes the running app as a user would (where the platform supports it), ends its session and waits until
 * it and its webview processes have exited (so nothing still writes app data). After a restart that failed
 * in that wait (which kills what it left), only the new app is started, so the failure stays with that one
 * scenario. An app that already exited after expectAppExit (a game that quit) only has its
 * dead session ended; with no exit expected, a missing app fails. Then, when `wipeData`, empties
 * the app data dirs the platform named (ENV_APP_DATA_DIRS, never anything else;
 * a delete that fails, e.g. on a file still held open, fails the restart). Then starts a new
 * session: tauri-driver launches a new app process, which opens the test pack from its CLI argument,
 * or, with `args`, gets `args` as its command line instead.
 */
async function restartApp(wipeData: boolean, args?: string[]): Promise<void> {
  // A slow exit of the previous app must not eat the scenario's time; setting its timeout back restarts the timer.
  const test = scenarioTest;
  const scenarioTimeout = test?.timeout();
  setTimeoutWhileRunning(test, RESTART_TIMEOUT);
  await restartAppNow(wipeData, args);
  if (scenarioTimeout !== undefined) setTimeoutWhileRunning(test, scenarioTimeout);
}

/** Sets the test's timeout, unless it already ended: on an ended test it would arm a timer again. */
function setTimeoutWhileRunning(test: Mocha.Runnable | undefined, ms: number): void {
  if (test && test.state === undefined && !test.timedOut) test.timeout(ms);
}

/**
 * Kills what a failed exit wait left, so the next restart starts the new app on its own: those processes may be
 * hung for good (Linux, #167; still under tauri-driver, so every later restart would wait for them again), or
 * orphans out of appProcesses' reach (Windows: a WebView2 `browser` whose app was killed), and a new app on the
 * same WebView2 user data folder would join that dying browser process.
 */
async function killLeftovers(platform: ReturnType<typeof desktopPlatform>, procs: Proc[]): Promise<void> {
  platform.kill(procs);
  await platform.waitForExit(procs, KILL_TIMEOUT).catch((error: unknown) => {
    console.warn(`Killed leftovers of a failed exit wait are still running: ${String(error)}`);
  });
}

async function restartAppNow(wipeData: boolean, args: string[] | undefined): Promise<void> {
  assertDriverStarted();
  const capabilities = launchCapabilities(args);
  const platform = desktopPlatform();
  const driver = driverPid();
  const dataDirs = JSON.parse(requireEnv(ENV_APP_DATA_DIRS)) as string[];

  const exitExpected = appExitExpected;
  appExitExpected = false;
  const running = platform.appProcesses(driver);
  const step = restartStep(running.length > 0, exitExpected, sessionEnded);
  if (step === 'end-session') {
    await closeApp(platform, driver);
    sessionEnded = true;
    // After a close the app has usually exited already; the driver may answer the delete with an error about that.
    await browser.deleteSession().catch((error: unknown) => {
      if (platform.appProcesses(driver).length > 0) throw error;
      console.warn(`Ended the session of an app that had already closed: ${String(error)}`);
    });
    await platform.waitForExit(running, EXIT_TIMEOUT).catch(async (error: unknown) => {
      await killLeftovers(platform, running);
      throw error;
    });
  } else if (step === 'start-only') {
    console.warn('Restart: the previous restart ended the session but failed waiting for the app to exit');
  } else if (step === 'end-dead-session') {
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
  sessionEnded = false;
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
