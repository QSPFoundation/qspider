// TEMPORARY (3c round 11 diagnosis): can the Windows desktop E2E keep the WebView2 user data folder across a
// restart? Probes (1) tauri:options.webviewOptions and (2) attaching msedgedriver to an app the harness starts
// itself (debuggerAddress) with WEBVIEW2_USER_DATA_FOLDER fixed. Never fails on purpose; prints [DIAG] lines.
import { execFileSync, spawn, type ChildProcess } from 'node:child_process';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import { win32 } from 'node:path';
import { browser } from '@wdio/globals';
import { remote } from 'webdriverio';
import { TEST_PACK } from '../fixtures/test-pack';
import { which } from '../targets/desktop/prereqs';
import { restartAppWithEmptyData } from '../targets/desktop/fresh-app';

const log = (label: string, value: unknown): void => {
  console.log(`[DIAG] ${label}: ${typeof value === 'string' ? value : JSON.stringify(value)}`);
};

async function probe(label: string, fn: () => Promise<unknown>): Promise<void> {
  try {
    log(label, await fn());
  } catch (error) {
    log(`${label} FAILED`, String(error).slice(0, 800));
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** --user-data-dir of every msedgewebview2 browser process. */
function browserDataDirs(): unknown {
  const out = execFileSync(
    'powershell',
    [
      '-NoProfile',
      '-NonInteractive',
      '-Command',
      'Get-CimInstance Win32_Process -Filter "Name=\'msedgewebview2.exe\'" | Select-Object ProcessId,CommandLine | ConvertTo-Json -Compress',
    ],
    { encoding: 'utf8', windowsHide: true, maxBuffer: 16 * 1024 * 1024 },
  );
  const parsed = JSON.parse(out || '[]') as { ProcessId: number; CommandLine: string | null }[];
  return (Array.isArray(parsed) ? parsed : [parsed])
    .filter((p) => !/--type=/.test(p.CommandLine ?? ''))
    .map((p) => `${p.ProcessId}:${/--user-data-dir=("[^"]*"|\S+)/.exec(p.CommandLine ?? '')?.[1]}`);
}

const storage = () => ({
  href: location.href,
  keys: Object.keys(localStorage),
  diag: localStorage.getItem('qspider-diag'),
});

/** The DevTools port the app's WebView2 wrote into the user data folder (EBWebView below it, or the folder itself). */
async function devToolsPort(dir: string, timeoutMs: number): Promise<{ file: string; port: number }> {
  const deadline = Date.now() + timeoutMs;
  const files = [win32.join(dir, 'EBWebView', 'DevToolsActivePort'), win32.join(dir, 'DevToolsActivePort')];
  while (Date.now() < deadline) {
    for (const file of files) {
      if (existsSync(file)) {
        const port = Number(readFileSync(file, 'utf8').split(/\r?\n/)[0]);
        if (port > 0) return { file, port };
      }
    }
    await sleep(200);
  }
  throw new Error(`no DevToolsActivePort in ${files.join(' or ')} within ${timeoutMs} ms`);
}

function killTree(child: ChildProcess | undefined): void {
  if (child?.pid === undefined) return;
  try {
    execFileSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' });
  } catch {
    // already gone
  }
}

describe('windows diagnosis (round 11)', () => {
  it('A: keeping the WebView2 user data folder across a restart', async function () {
    this.timeout(400_000);
    await restartAppWithEmptyData();
    const requested = structuredClone(browser.requestedCapabilities) as Record<string, unknown>;
    const tauri = requested['tauri:options'] as { application: string; args: string[] };
    log('caps', tauri);

    // (1) webviewOptions: does msedgedriver take a user data folder from it?
    const optionsDir = win32.join(process.env['LOCALAPPDATA'] ?? 'C:\\', 'org.qsp.qspider', 'e2e-options');
    const variants = [{ userDataFolder: optionsDir }, { additionalBrowserArguments: `--user-data-dir=${optionsDir}` }];
    for (const webviewOptions of variants) {
      await probe(`webviewOptions ${JSON.stringify(webviewOptions)}`, async () => {
        const caps = { ...requested, 'tauri:options': { ...tauri, webviewOptions } } as WebdriverIO.Capabilities;
        await browser.reloadSession(caps);
        await browser.execute(() => localStorage.setItem('qspider-diag', 'options'));
        const first = { dirs: browserDataDirs(), page: await browser.execute(storage) };
        await browser.reloadSession(caps);
        return { first, second: { dirs: browserDataDirs(), page: await browser.execute(storage) } };
      });
    }
    await probe('back to default caps', async () => {
      await browser.reloadSession(requested as WebdriverIO.Capabilities);
      return browserDataDirs();
    });

    // (2) attach: the harness starts the app with a fixed WEBVIEW2_USER_DATA_FOLDER; msedgedriver attaches.
    const dir = win32.join(process.env['LOCALAPPDATA'] ?? 'C:\\', 'org.qsp.qspider', 'e2e-attach');
    rmSync(dir, { recursive: true, force: true });
    const exe = tauri.application.endsWith('.exe') ? tauri.application : `${tauri.application}.exe`;
    let driver: ChildProcess | undefined;
    let app: ChildProcess | undefined;
    try {
      driver = spawn(which('msedgedriver') ?? 'msedgedriver', ['--port=4556'], { stdio: 'ignore', windowsHide: true });
      await sleep(1500);
      for (const launch of ['first', 'second']) {
        await probe(`attach ${launch} launch`, async () => {
          // A stale port file from the previous launch would point at a dead browser.
          for (const f of [win32.join(dir, 'EBWebView', 'DevToolsActivePort'), win32.join(dir, 'DevToolsActivePort')]) {
            rmSync(f, { force: true });
          }
          const started = Date.now();
          app = spawn(exe, [`--file=${TEST_PACK.configPath}`], {
            env: { ...process.env, WEBVIEW2_USER_DATA_FOLDER: dir },
            stdio: 'ignore',
          });
          const { file, port } = await devToolsPort(dir, 30_000);
          const portAfterMs = Date.now() - started;
          const session = await remote({
            hostname: '127.0.0.1',
            port: 4556,
            logLevel: 'warn',
            capabilities: {
              browserName: 'webview2',
              'ms:edgeOptions': { debuggerAddress: `127.0.0.1:${port}` },
            } as WebdriverIO.Capabilities,
          });
          const sessionAfterMs = Date.now() - started;
          await session.$('[data-qa="startup-finished"]').waitForExist({ timeout: 30_000 });
          const before = await session.execute(storage);
          if (launch === 'first') await session.execute(() => localStorage.setItem('qspider-diag', 'attached'));
          const toast = await session.execute(
            () => document.querySelector('[data-qa="notice-toast"]')?.textContent ?? null,
          );
          await session.deleteSession();
          killTree(app);
          await sleep(2000);
          return { file, port, portAfterMs, sessionAfterMs, before, toast, dirs: browserDataDirs() };
        });
      }
    } finally {
      killTree(app);
      killTree(driver);
    }
  });
});
