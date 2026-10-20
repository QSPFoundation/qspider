// WebdriverIO config for the desktop (Tauri) core-flow tests. Run via `pnpm e2e:desktop`,
// which first builds the E2E debug binary (`nx run player-e2e:build-desktop-e2e`).
import { spawn, type ChildProcess } from 'node:child_process';
import { copyFileSync, createWriteStream, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { connect } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { browser } from '@wdio/globals';
import { SevereServiceError } from 'webdriverio';
import type { WebdriverIOConfig } from '@serenity-js/webdriverio';
import { E2E_GAME } from '../../fixtures/e2e-game';
import { ENV_APP_DATA_DIRS, ENV_DRIVER_PID } from './fresh-app';
import { findMissingPrereqs, INSTALL_HINT, which } from './prereqs';

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

// One tauri-driver for the whole run, with one set of XDG dirs. Before each test,
// fresh-app.ts ends the app, empties those dirs and starts a new session, for
// which tauri-driver launches a new app process.
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
      'tauri:options': { application, args: [E2E_GAME.path] },
    } as WebdriverIO.Capabilities,
  ],
  logLevel: 'warn',
  outputDir: join(artifactsDir, 'wdio-logs'),
  waitforTimeout: 10_000,
  specFileRetries: 0,
  framework: '@serenity-js/webdriverio',
  // console-reporter: without it, desktop failures show only as "Unknown error".
  serenity: { runner: 'mocha', crew: ['@serenity-js/console-reporter'] },
  // forbidOnly: a stray it.only would silently skip the rest of the suite.
  mochaOpts: { ui: 'bdd', timeout: 120_000, retries: 0, forbidOnly: true },
  reporters: ['spec'],

  async onPrepare() {
    const missing = findMissingPrereqs(process.platform, which, process.env);
    if (missing.length > 0) {
      // SevereServiceError makes WDIO abort with a non-zero exit instead of logging and continuing.
      throw new SevereServiceError(`Missing desktop E2E prerequisites: ${missing.join(', ')}. ${INSTALL_HINT}`);
    }
    await assertDriverPortFree();
    rmSync(artifactsDir, { recursive: true, force: true });
    // Recreate outputDir too: WDIO workers write their logs there.
    mkdirSync(join(artifactsDir, 'wdio-logs'), { recursive: true });

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
    // Covers an aborted launcher; onComplete is the normal teardown.
    process.once('exit', () => tauriDriver?.kill());
    await waitForPort(DRIVER_PORT, 10_000);
    // If our driver died (e.g. failed to bind), the port answer came from someone else.
    if (tauriDriver.exitCode !== null || tauriDriver.signalCode !== null) {
      throw new SevereServiceError(
        `tauri-driver exited (code ${tauriDriver.exitCode ?? tauriDriver.signalCode}) but port ${DRIVER_PORT} answers: another process holds it.`,
      );
    }
    // Read by fresh-app.ts in the worker, which inherits the launcher's env.
    process.env[ENV_DRIVER_PID] = String(tauriDriver.pid);
    process.env[ENV_APP_DATA_DIRS] = JSON.stringify(Object.values(xdg));
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

  async onComplete(exitCode) {
    await killDriver();
    if (!runDir) return;
    if (exitCode !== 0) {
      try {
        copyFileSync(join(runDir, 'tauri-driver.log'), join(artifactsDir, 'tauri-driver.log'));
      } catch {
        // no log written
      }
    }
    rmSync(runDir, { recursive: true, force: true });
    runDir = undefined;
  },
};
