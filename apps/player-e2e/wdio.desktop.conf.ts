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
import { FIXTURE_PATH } from './shared/core-flow';
import { findMissingPrereqs, INSTALL_HINT, which } from './desktop/prereqs';

const workspaceRoot = fileURLToPath(new URL('../..', import.meta.url));
const artifactsDir = fileURLToPath(new URL('./artifacts/desktop', import.meta.url));
// Binary name = Cargo package name (src-tauri/Cargo.toml).
const application = join(
  workspaceRoot,
  'src-tauri/target/debug',
  process.platform === 'win32' ? 'qspider.exe' : 'qspider',
);
const DRIVER_PORT = 4444;

// One tauri-driver per WDIO session (one session per spec file), each with its own
// XDG dirs, so every test starts the app with an empty shelf and no saves.
let tauriDriver: ChildProcess | undefined;
let sessionDir: string | undefined;
let sessionFailed = false;

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

export const config: WebdriverIO.Config = {
  runner: 'local',
  specs: ['./desktop/**/*.e2e.ts'],
  maxInstances: 1,
  hostname: '127.0.0.1',
  port: DRIVER_PORT,
  capabilities: [
    {
      // tauri-driver's WebKitWebDriver/msedgedriver speak WebDriver classic only.
      'wdio:enforceWebDriverClassic': true,
      'tauri:options': { application, args: [FIXTURE_PATH] },
    } as WebdriverIO.Capabilities,
  ],
  logLevel: 'warn',
  outputDir: join(artifactsDir, 'wdio-logs'),
  waitforTimeout: 10_000,
  specFileRetries: 0,
  framework: 'mocha',
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
    mkdirSync(artifactsDir, { recursive: true });
  },

  async beforeSession() {
    sessionFailed = false;
    // Re-checked per session: the previous session's driver has exited by now (afterSession awaits it).
    await assertDriverPortFree();
    sessionDir = mkdtempSync(join(tmpdir(), 'qspider-e2e-'));
    const xdg = {
      XDG_DATA_HOME: join(sessionDir, 'data'),
      XDG_CONFIG_HOME: join(sessionDir, 'config'),
      XDG_CACHE_HOME: join(sessionDir, 'cache'),
    };
    Object.values(xdg).forEach((dir) => mkdirSync(dir));
    const log = createWriteStream(join(sessionDir, 'tauri-driver.log'));
    tauriDriver = spawn('tauri-driver', ['--port', String(DRIVER_PORT)], {
      env: { ...process.env, ...xdg },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    tauriDriver.stdout?.pipe(log);
    tauriDriver.stderr?.pipe(log);
    process.once('exit', () => tauriDriver?.kill());
    await waitForPort(DRIVER_PORT, 10_000);
    // If our driver died (e.g. failed to bind), the port answer came from someone else.
    if (tauriDriver.exitCode !== null || tauriDriver.signalCode !== null) {
      throw new SevereServiceError(
        `tauri-driver exited (code ${tauriDriver.exitCode ?? tauriDriver.signalCode}) but port ${DRIVER_PORT} answers: another process holds it.`,
      );
    }
  },

  async afterTest(test, _context, { passed }) {
    if (passed) return;
    sessionFailed = true;
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

  async afterSession(_config, _capabilities, specs) {
    await killDriver();
    if (!sessionDir) return;
    if (sessionFailed) {
      const spec = safeName(specs[0]?.split('/').pop() ?? 'session');
      try {
        copyFileSync(join(sessionDir, 'tauri-driver.log'), join(artifactsDir, `${spec}.tauri-driver.log`));
      } catch {
        // no log written
      }
    }
    rmSync(sessionDir, { recursive: true, force: true });
    sessionDir = undefined;
  },
};
