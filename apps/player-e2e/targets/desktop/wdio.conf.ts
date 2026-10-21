// WebdriverIO config for the desktop (Tauri) core-flow tests. Run via `pnpm e2e:desktop`,
// which first builds the E2E debug binary (`nx run player-e2e:build-desktop-e2e`) and then runs
// wdio through run-desktop-e2e.mjs. Never run `wdio run` on this file directly: on Linux,
// onPrepare refuses to start outside the runner's private session (private-session.ts).
import { spawn, type ChildProcess } from 'node:child_process';
import { copyFileSync, createWriteStream, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { connect } from 'node:net';
import { tmpdir } from 'node:os';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { browser } from '@wdio/globals';
import { SevereServiceError } from 'webdriverio';
import type { WebdriverIOConfig } from '@serenity-js/webdriverio';
import { INTERACTION_TIMEOUT } from '../../screenplay/support/timeouts';
import { TEST_PACK } from '../../fixtures/test-pack';
import { buildFixtures } from '../../fixtures/build-fixtures';
import { ENV_APP_DATA_DIRS, ENV_DRIVER_PID } from './fresh-app';
import { atspiProbes, findMissingPrereqs, INSTALL_HINT, which } from './prereqs';
import { PRIVATE_SESSION_HINT, privateSessionProblem } from './private-session';

const workspaceRoot = fileURLToPath(new URL('../../../..', import.meta.url));
const artifactsDir = fileURLToPath(new URL('../../artifacts/desktop', import.meta.url));
// Binary name = Cargo package name (src-tauri/Cargo.toml).
const application = join(
  workspaceRoot,
  'src-tauri/target/debug',
  process.platform === 'win32' ? 'qspider.exe' : 'qspider',
);
const DRIVER_PORT = 4444;

// Read by screenplay/support/scenario.ts to pick this target's scenario shim.
process.env['QSPIDER_E2E_TARGET'] = 'desktop';

// One tauri-driver PER spec-file worker (spawned in beforeSession, stopped in afterSession), each with
// its own XDG dirs. A single driver shared across workers intermittently lost the second worker's
// session-creation handshake (tauri-driver logged hyper::Error(IncompleteMessage)) and orphaned the
// app processes, which then poisoned later scenarios; a fresh driver per worker isolates that.
// Within a worker, fresh-app.ts ends the app, empties the dirs and starts a new session per test.
let tauriDriver: ChildProcess | undefined;
let runDir: string | undefined;

/** Stops tauri-driver; resolves after it exits so its log is complete. */
function killDriver(): Promise<void> {
  const driver = tauriDriver;
  tauriDriver = undefined;
  if (!driver || driver.exitCode !== null) return Promise.resolve();
  return new Promise((resolve) => {
    driver.once('exit', () => resolve());
    driver.kill();
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

/** Spawns a fresh tauri-driver with its own XDG dirs for one worker, and exposes it to fresh-app.ts. */
async function startDriver(): Promise<void> {
  await waitForPortFree(DRIVER_PORT, 10_000);
  runDir = mkdtempSync(join(tmpdir(), 'qspider-e2e-'));
  const xdg = {
    XDG_DATA_HOME: join(runDir, 'data'),
    XDG_CONFIG_HOME: join(runDir, 'config'),
    XDG_CACHE_HOME: join(runDir, 'cache'),
  };
  Object.values(xdg).forEach((dir) => mkdirSync(dir));
  const log = createWriteStream(join(runDir, 'tauri-driver.log'));
  tauriDriver = spawn('tauri-driver', ['--port', String(DRIVER_PORT)], {
    env: { ...process.env, ...xdg },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  tauriDriver.stdout?.pipe(log);
  tauriDriver.stderr?.pipe(log);
  // Covers an aborted worker; afterSession is the normal teardown.
  process.once('exit', () => tauriDriver?.kill());
  await waitForPort(DRIVER_PORT, 10_000);
  // If our driver died (e.g. failed to bind), the port answer came from someone else.
  if (tauriDriver.exitCode !== null || tauriDriver.signalCode !== null) {
    throw new SevereServiceError(
      `tauri-driver exited (code ${tauriDriver.exitCode ?? tauriDriver.signalCode}) but port ${DRIVER_PORT} answers: another process holds it.`,
    );
  }
  // Read by fresh-app.ts in this same worker process.
  process.env[ENV_DRIVER_PID] = String(tauriDriver.pid);
  process.env[ENV_APP_DATA_DIRS] = JSON.stringify(Object.values(xdg));
}

export const config: WebdriverIOConfig = {
  runner: 'local',
  specs: ['../../scenarios/**/*.scenario.ts'],
  maxInstances: 1,
  hostname: '127.0.0.1',
  port: DRIVER_PORT,
  capabilities: [
    {
      // tauri-driver's WebKitWebDriver/msedgedriver speak WebDriver classic only.
      'wdio:enforceWebDriverClassic': true,
      // The app starts with the test pack: all its games on the shelf, none started.
      'tauri:options': { application, args: [TEST_PACK.configPath] },
    } as WebdriverIO.Capabilities,
  ],
  logLevel: 'warn',
  outputDir: join(artifactsDir, 'wdio-logs'),
  waitforTimeout: 10_000,
  // The per-scenario app relaunch (deleteSession+reloadSession) intermittently hangs (~5-10%/run) in
  // wry/WebKitWebDriver's session handling — independent of our code. A failed spec is retried in a
  // brand-new worker with its own fresh tauri-driver (beforeSession), so no orphaned state carries over;
  // 2 retries (3 attempts) drive a ~10%/attempt flake to ~0.1%/spec.
  specFileRetries: 2,
  framework: '@serenity-js/webdriverio',
  // console-reporter: without it, desktop failures show only as "Unknown error".
  serenity: { runner: 'mocha', crew: ['@serenity-js/console-reporter'], interactionTimeout: INTERACTION_TIMEOUT },
  // timeout: as Playwright's (targets/web/playwright.config.ts); it includes the per-test app restart.
  // forbidOnly: a stray it.only would silently skip the rest of the suite.
  mochaOpts: { ui: 'bdd', timeout: 45_000, retries: 0, forbidOnly: true },
  reporters: ['spec'],

  async onPrepare() {
    // First, before anything is launched: outside the private session the app would use the real
    // display, dconf and accessibility bus.
    if (process.platform === 'linux') {
      const problem = privateSessionProblem(process.env, process.getuid?.() ?? -1);
      if (problem) {
        throw new SevereServiceError(
          `Refusing to run the desktop E2E outside its private session: ${problem}. ${PRIVATE_SESSION_HINT}`,
        );
      }
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
  },

  // A fresh tauri-driver per worker (see the note by `let tauriDriver`). maxInstances is 1, so workers
  // run serially and only one driver holds DRIVER_PORT at a time.
  async beforeSession() {
    if (process.platform !== 'linux') return;
    await startDriver();
  },

  async afterSession(_config, _caps, specs) {
    await killDriver();
    if (runDir) {
      try {
        copyFileSync(
          join(runDir, 'tauri-driver.log'),
          join(artifactsDir, `tauri-driver-${safeName(basename(String(specs?.[0] ?? 'run')))}.log`),
        );
      } catch {
        // no log written
      }
      rmSync(runDir, { recursive: true, force: true });
      runDir = undefined;
    }
  },

  async afterTest(test, _context, { passed, error }) {
    // A skipped scenario (this.skip()) reports passed: false without an error.
    if (passed || !error) return;
    mkdirSync(artifactsDir, { recursive: true });
    const base = join(artifactsDir, safeName(test.title));
    try {
      await browser.saveScreenshot(`${base}.png`);
      // The URL shows whether the webview navigated away from the app.
      writeFileSync(`${base}.html`, `<!-- url: ${await browser.getUrl()} -->\n${await browser.getPageSource()}`);
    } catch (err) {
      writeFileSync(`${base}.capture-error.txt`, String(err));
    }
  },
};
