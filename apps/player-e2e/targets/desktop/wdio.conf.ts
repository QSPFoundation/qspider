// WebdriverIO config for the desktop (Tauri) core-flow tests. Run via `pnpm e2e:desktop`,
// which first builds the E2E debug binary (`nx run player-e2e:build-desktop-e2e`) and then runs
// wdio through run-desktop-e2e.mjs. Never run `wdio run` on this file directly: on Linux,
// onPrepare refuses to start outside the runner's private session (private-session.ts); on Windows,
// it refuses off CI unless QSPIDER_E2E_HOST_SESSION=1 (platform/windows.ts).
import { spawn, type ChildProcess } from 'node:child_process';
import { appendFileSync, closeSync, openSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { connect } from 'node:net';
import { tmpdir } from 'node:os';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { browser } from '@wdio/globals';
import { SevereServiceError } from 'webdriverio';
import type { WebdriverIOConfig } from '@serenity-js/webdriverio';
import { INTERACTION_TIMEOUT } from '../../screenplay/support/timeouts';
import { TEST_PACK } from '../../fixtures/test-pack';
import type { Server } from 'node:http';
import { ASSET_SERVER, startAssetServer, stopAssetServer } from '../../fixtures/asset-server';
import { buildFixtures } from '../../fixtures/build-fixtures';
import { desktopPlatform } from './platform';
import { ENV_APP_DATA_DIRS, ENV_DRIVER_PID, ENV_DRIVER_START_ERROR } from './platform/env';
import { windowsWebviewOptions } from './platform/windows';
import { MAIN_EXCLUDE, MAIN_SPECS } from './shards';
import { atspiProbes, findMissingPrereqs, INSTALL_HINT, which } from './prereqs';

const workspaceRoot = fileURLToPath(new URL('../../../..', import.meta.url));

/** The E2E debug binary in a Cargo target dir (relative to the workspace root). Name = Cargo package name (src-tauri/Cargo.toml). */
export const desktopBinary = (targetDir: string): string =>
  join(workspaceRoot, targetDir, 'debug', process.platform === 'win32' ? 'qspider.exe' : 'qspider');

const DRIVER_PORT = 4444;

// Read by screenplay/support/scenario.ts to pick this target's scenario shim.
process.env['QSPIDER_E2E_TARGET'] = 'desktop';

// One tauri-driver PER spec-file worker (spawned in beforeSession, stopped in afterSession), each with
// its own app data dirs (platform/). A single driver shared across workers intermittently lost the second worker's
// session-creation handshake (tauri-driver logged hyper::Error(IncompleteMessage)) and orphaned the
// app processes, which then poisoned later scenarios; a fresh driver per worker isolates that.
// Within a worker, fresh-app.ts ends the app, empties the dirs and starts a new session per test.
let tauriDriver: ChildProcess | undefined;
let runDir: string | undefined;
/** Serves the files games name by an absolute http URL (fixtures/asset-server.ts); lives for the whole run. */
let assetServer: Server | undefined;

/** Stops tauri-driver; resolves after it exits so its log is complete. */
function killDriver(): Promise<void> {
  const driver = tauriDriver;
  tauriDriver = undefined;
  if (!driver || driver.exitCode !== null) return Promise.resolve();
  return new Promise((resolve) => {
    driver.once('exit', () => resolve());
    desktopPlatform().stopDriver(driver);
  });
}

/** Resolves once something accepts TCP connections on `port` (tauri-driver is up). */
function waitForPort(port: number, timeoutMs: number): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  return new Promise((resolve, reject) => {
    const attempt = (): void => {
      const socket = connect(port, '127.0.0.1');
      socket.once('connect', () => {
        socket.end();
        resolve();
      });
      socket.once('error', () => {
        socket.destroy();
        if (tauriDriver?.exitCode != null) {
          reject(new Error(`tauri-driver exited with code ${tauriDriver.exitCode}`));
        } else if (Date.now() > deadline) {
          reject(new Error(`tauri-driver did not listen on port ${port} within ${timeoutMs}ms`));
        } else {
          setTimeout(attempt, 100); // poll interval, not a fixed wait
        }
      });
    };
    attempt();
  });
}

/** Resolves true when something already accepts TCP connections on `port`. */
function isPortInUse(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = connect(port, '127.0.0.1');
    socket.once('connect', () => {
      socket.end();
      resolve(true);
    });
    socket.once('error', () => {
      socket.destroy();
      resolve(false);
    });
  });
}

/** Fails the run when a foreign process holds the driver port: WDIO would talk to it instead of our tauri-driver. */
async function assertDriverPortFree(): Promise<void> {
  if (await isPortInUse(DRIVER_PORT)) {
    throw new SevereServiceError(
      `Port ${DRIVER_PORT} (tauri-driver) is already in use by another process. Stop it and re-run.`,
    );
  }
}

const safeName = (s: string): string => s.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '');

/** How long a failure capture waits for each WebDriver answer; running out is evidence (an unresponsive webview). */
const CAPTURE_TIMEOUT = 10_000;

function withinCaptureTime<T>(answer: Promise<T>, what: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`WebDriver gave no ${what} within ${CAPTURE_TIMEOUT}ms: the webview did not answer`)),
      CAPTURE_TIMEOUT,
    );
  });
  return Promise.race([answer, timeout]).finally(() => clearTimeout(timer));
}

/** Resolves once nothing accepts TCP on `port`: our previous worker's driver has fully released it. */
function waitForPortFree(port: number, timeoutMs: number): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  return new Promise((resolve, reject) => {
    const attempt = async (): Promise<void> => {
      if (!(await isPortInUse(port))) return resolve();
      if (Date.now() > deadline)
        return reject(new Error(`tauri-driver port ${port} still in use after ${timeoutMs}ms`));
      setTimeout(() => void attempt(), 100); // poll interval, not a fixed wait
    };
    void attempt();
  });
}

/**
 * Spawns a fresh tauri-driver for one worker, with empty app data dirs (Linux: new XDG dirs under the
 * worker's temp dir; Windows: the app's own dirs, emptied), and exposes it to fresh-app.ts.
 */
async function startDriver(logPath: string): Promise<void> {
  const platform = desktopPlatform();
  await waitForPortFree(DRIVER_PORT, 10_000);
  runDir = mkdtempSync(join(tmpdir(), 'qspider-e2e-'));
  const driverEnv = platform.driverEnv(runDir);
  const dataDirs = platform.appDataDirs(runDir);
  dataDirs.forEach((dir) => platform.emptyDir(dir));
  // Straight into the artifacts, appended across a spec's retries, and written by the driver itself
  // (no buffering in this worker): WDIO skips afterSession when the session could not be created and
  // the worker then exits, which is exactly when this log (msedgedriver's stderr too) matters.
  mkdirSync(dirname(logPath), { recursive: true });
  appendFileSync(logPath, `--- tauri-driver started ${new Date().toISOString()} ---\n`);
  const log = openSync(logPath, 'a');
  try {
    tauriDriver = spawn('tauri-driver', platform.driverArgs(DRIVER_PORT), {
      env: { ...process.env, ...driverEnv },
      stdio: ['ignore', log, log],
    });
  } finally {
    closeSync(log); // the driver holds its own handle
  }
  // Covers an aborted worker; afterSession is the normal teardown. Only a driver still running: the PID of
  // one that already exited may belong to another process by now.
  process.once('exit', () => {
    if (tauriDriver && tauriDriver.exitCode === null && tauriDriver.signalCode === null)
      platform.stopDriver(tauriDriver);
  });
  await waitForPort(DRIVER_PORT, 10_000);
  // If our driver died (e.g. failed to bind), the port answer came from someone else.
  if (tauriDriver.exitCode !== null || tauriDriver.signalCode !== null) {
    throw new Error(
      `tauri-driver exited (code ${tauriDriver.exitCode ?? tauriDriver.signalCode}) but port ${DRIVER_PORT} answers: another process holds it.`,
    );
  }
  // Read by fresh-app.ts in this same worker process.
  process.env[ENV_DRIVER_PID] = String(tauriDriver.pid);
  process.env[ENV_APP_DATA_DIRS] = JSON.stringify(dataDirs);
}

/** What differs between the desktop targets: the app under test and where the run's artifacts go. */
export interface DesktopTarget {
  /** The app binary tauri-driver launches for every scenario. */
  application: string;
  /** Its command-line arguments. */
  args: string[];
  /** Its bundle identifier (tauri.conf.json): names its app data dirs. */
  identifier: string;
  /** Emptied at the start of a run; screenshots, page sources, wdio and driver logs go here. */
  artifactsDir: string;
}

/**
 * The desktop WebdriverIO config for one app: the private-session guard, a fresh tauri-driver per
 * worker, retries, artifacts. Target configs spread it and set their own specs.
 */
export const desktopConfig = ({ application, args, identifier, artifactsDir }: DesktopTarget): WebdriverIOConfig => ({
  runner: 'local',
  maxInstances: 1,
  hostname: '127.0.0.1',
  port: DRIVER_PORT,
  capabilities: [
    {
      // tauri-driver's WebKitWebDriver/msedgedriver speak WebDriver classic only.
      'wdio:enforceWebDriverClassic': true,
      // Windows: msedgedriver would give each session a throwaway WebView2 user data folder (windowsWebviewOptions).
      'tauri:options':
        process.platform === 'win32'
          ? { application, args, webviewOptions: windowsWebviewOptions(identifier, process.env) }
          : { application, args },
    } as WebdriverIO.Capabilities,
  ],
  // Windows: every WebDriver command goes to wdio-logs/, so a scenario that hits mocha's timeout shows which call
  // never answered (the startup hang seen on CI, 2026-10-26/27).
  logLevel: process.platform === 'win32' ? 'info' : 'warn',
  outputDir: join(artifactsDir, 'wdio-logs'),
  waitforTimeout: 10_000,
  // The per-scenario app relaunch (deleteSession+reloadSession) intermittently hangs (~5-10%/run) in
  // wry/WebKitWebDriver's session handling — independent of our code. A failed spec is retried in a
  // brand-new worker with its own fresh tauri-driver (beforeSession), so no orphaned state carries over;
  // 2 retries (3 attempts) drive a ~10%/attempt flake to ~0.1%/spec. That hang (#167) is Linux-only
  // (WebKitWebDriver); Windows needed no retry (run 40105883229), so it gets none: a Windows retry needs its
  // own documented cause, and a Windows flake stays visible instead of absorbed.
  specFileRetries: process.platform === 'win32' ? 0 : 2,
  framework: '@serenity-js/webdriverio',
  // console-reporter: without it, desktop failures show only as "Unknown error".
  serenity: { runner: 'mocha', crew: ['@serenity-js/console-reporter'], interactionTimeout: INTERACTION_TIMEOUT },
  // timeout: as Playwright's (targets/web/playwright.config.ts); the per-test app restart has its own (scenario.ts).
  // forbidOnly: a stray it.only would silently skip the rest of the suite.
  mochaOpts: { ui: 'bdd', timeout: 45_000, retries: 0, forbidOnly: true },
  reporters: ['spec'],

  async onPrepare() {
    // First, before anything is launched: on Linux outside the private session the app would use the
    // real display, dconf and accessibility bus; on Windows off CI it would wipe the developer's app data.
    try {
      desktopPlatform().checkRunAllowed();
    } catch (error) {
      throw new SevereServiceError(error instanceof Error ? error.message : String(error));
    }
    const missing = findMissingPrereqs(process.platform, which, atspiProbes);
    if (missing.length > 0) {
      // SevereServiceError makes WDIO abort with a non-zero exit instead of logging and continuing.
      throw new SevereServiceError(`Missing desktop E2E prerequisites: ${missing.join(', ')}. ${INSTALL_HINT}`);
    }
    await assertDriverPortFree();
    rmSync(artifactsDir, { recursive: true, force: true });
    // Recreate outputDir too: WDIO workers write their logs there.
    mkdirSync(join(artifactsDir, 'wdio-logs'), { recursive: true });

    await buildFixtures();
    try {
      assetServer = await startAssetServer();
    } catch (error) {
      // WDIO ignores any other error from onPrepare; a busy port must stop the run.
      throw new SevereServiceError(`asset server on ${ASSET_SERVER.host}:${ASSET_SERVER.port}: ${String(error)}`);
    }
  },

  async onComplete() {
    if (assetServer) await stopAssetServer(assetServer);
    assetServer = undefined;
  },

  // A fresh tauri-driver per worker (see the note by `let tauriDriver`). maxInstances is 1, so workers
  // run serially and only one driver holds DRIVER_PORT at a time.
  // WDIO only logs (to the worker's log file) an error thrown here and goes on to create the session.
  // So the error is also printed and recorded: fresh-app.ts rethrows it at the first restart, which
  // fails the scenario with the real cause when a session could still be created (a foreign driver
  // on the port); otherwise the session creation fails and the printed line is the cause.
  async beforeSession(_config, _caps, specs) {
    delete process.env[ENV_DRIVER_START_ERROR];
    try {
      await startDriver(join(artifactsDir, `tauri-driver-${safeName(basename(String(specs?.[0] ?? 'run')))}.log`));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`tauri-driver did not start: ${message}`);
      process.env[ENV_DRIVER_START_ERROR] = message;
      throw error;
    }
  },

  async afterSession() {
    await killDriver();
    if (runDir) {
      rmSync(runDir, { recursive: true, force: true });
      runDir = undefined;
    }
  },

  async afterTest(test, _context, { passed, error }) {
    // A skipped scenario (this.skip()) reports passed: false without an error.
    if (passed || !error) return;
    mkdirSync(artifactsDir, { recursive: true });
    const base = join(artifactsDir, safeName(test.title));
    // First what needs no WebDriver: a hung webview can leave every WebDriver call below unanswered.
    try {
      const platform = desktopPlatform();
      const procs = platform.appProcesses(Number(process.env[ENV_DRIVER_PID]));
      writeFileSync(`${base}.processes.txt`, `${platform.describeProcesses(procs)}\n`);
    } catch (err) {
      writeFileSync(`${base}.processes.txt`, `(could not list the app's processes: ${String(err)})\n`);
    }
    try {
      await withinCaptureTime(browser.saveScreenshot(`${base}.png`), 'screenshot');
      // The URL shows whether the webview navigated away from the app.
      const url = await withinCaptureTime(browser.getUrl(), 'URL');
      const source = await withinCaptureTime(browser.getPageSource(), 'page source');
      writeFileSync(`${base}.html`, `<!-- url: ${url} -->\n${source}`);
    } catch (err) {
      writeFileSync(`${base}.capture-error.txt`, String(err));
    }
  },
});

/** The main desktop player (src-tauri/target/debug, built by build-desktop-e2e) and every scenario but the standalone ones. */
export const config: WebdriverIOConfig = {
  ...desktopConfig({
    application: desktopBinary('src-tauri/target'),
    // The app starts with the test pack: all its games on the shelf, none started. As `--file=<path>`, not
    // the positional form: msedgedriver (Windows) turns every arg into a Chromium switch, so a bare path
    // reaches the app as `--d:\...\game.cfg` (lowercased), which the CLI plugin rejects and the app stays
    // on its loader. A `--name=value` switch passes with its value intact; WebKitWebDriver passes it as is.
    args: [`--file=${TEST_PACK.configPath}`],
    identifier: 'org.qsp.qspider',
    artifactsDir: fileURLToPath(new URL('../../artifacts/desktop', import.meta.url)),
  }),
  specs: MAIN_SPECS,
  // The standalone scenarios run only against the standalone build (wdio.standalone.conf.ts).
  exclude: MAIN_EXCLUDE,
};
