// Windows: tauri-driver → msedgedriver → the app (qspider.exe) → WebView2 (msedgewebview2.exe) processes,
// read from Win32_Process by parent PID (a name only identifies msedgedriver's console host; nothing is
// killed by name). The app keeps its data in the user's real
// %APPDATA%\<identifier> and %LOCALAPPDATA%\<identifier> (with EBWebView): Tauri resolves them through
// the Known Folders API, so no env var can redirect them. Hence the host-session guard: these dirs are
// emptied only on a throwaway CI machine or when the developer opts in.
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import { win32 } from 'node:path';
import { which } from '../prereqs';
import { driverPid } from './env';
import type { DesktopPlatform, Proc } from './index';
import { pollUntilExited } from './wait-for-exit';

/** Opts a developer machine in to the desktop E2E (it empties the app's real data dirs). */
export const ENV_HOST_SESSION = 'QSPIDER_E2E_HOST_SESSION';

/** The bundle identifiers of the apps under test: src-tauri/tauri.conf.json and fixtures/standalone/qspider.desktop.json. */
export const APP_IDENTIFIERS = ['org.qsp.qspider', 'org.qsp.e2e.standalone'];

const CIM_QUERY =
  'Get-CimInstance Win32_Process | Select-Object ProcessId,ParentProcessId,CreationDate,Name | ConvertTo-Json -Compress';
const POLL_INTERVAL = 250;
/** Past the p99 of normal exits (1.9 s on CI), well before a slow one ends: when the stragglers are named. */
const DESCRIBE_AFTER_MS = 2_000;

type Env = Record<string, string | undefined>;

/** A Win32_Process entry; the name tells msedgedriver's console host (conhost.exe) from the app. */
export interface WinProc extends Proc {
  name?: string;
}

/**
 * Fails unless this is CI (`CI` is `true` or `1`; `CI=false` is a common developer setting) or the developer
 * opted in with QSPIDER_E2E_HOST_SESSION=1.
 */
export function assertHostSessionAllowed(env: Env): void {
  if (env['CI'] === 'true' || env['CI'] === '1' || env[ENV_HOST_SESSION] === '1') return;
  throw new Error(
    'Refusing to run the Windows desktop E2E on a host session: the app writes and the run empties its real ' +
      `%APPDATA% and %LOCALAPPDATA% dirs (${APP_IDENTIFIERS.join(', ')}). It runs where CI is set; on a ` +
      `machine whose app data may be wiped, set ${ENV_HOST_SESSION}=1.`,
  );
}

/** The Roaming and Local app data dirs of every app identifier. */
export function windowsAppDataDirs(env: Env): string[] {
  const roaming = env['APPDATA'];
  const local = env['LOCALAPPDATA'];
  if (!roaming || !local) throw new Error('APPDATA and LOCALAPPDATA must both be set');
  if (!win32.isAbsolute(roaming) || !win32.isAbsolute(local)) {
    throw new Error(`APPDATA (${roaming}) and LOCALAPPDATA (${local}) must be absolute paths`);
  }
  return APP_IDENTIFIERS.flatMap((id) => [win32.join(roaming, id), win32.join(local, id)]);
}

/**
 * The WebView2 options for an app's sessions: its user data folder pinned to where the real app keeps it
 * (%LOCALAPPDATA%\<identifier>, which WebView2 extends with EBWebView). Without it msedgedriver gives every
 * session a new temp folder (C:\Windows\SystemTemp\scoped_dir<n>\EBWebView) and deletes it with the session,
 * so web storage (the player theme, the language) never survives a restart. Inside the app data dirs, so a
 * fresh scenario empties it and a restart keeping data keeps it, as on Linux.
 */
export function windowsWebviewOptions(identifier: string, env: Env): { userDataFolder: string } {
  const local = env['LOCALAPPDATA'];
  if (!local || !win32.isAbsolute(local)) throw new Error(`LOCALAPPDATA (${local}) must be an absolute path`);
  return { userDataFolder: win32.join(local, identifier) };
}

interface CimProcess {
  ProcessId?: unknown;
  ParentProcessId?: unknown;
  CreationDate?: unknown;
  Name?: unknown;
}

/** CreationDate as ConvertTo-Json writes it: "/Date(ms)/" (PowerShell 5.1), ISO (7), or { value }. */
function creationDate(raw: unknown): string {
  if (typeof raw === 'string') return raw;
  if (raw && typeof raw === 'object' && 'value' in raw) return String(raw.value);
  return '';
}

/** Parses the CIM_QUERY output (an array, or one object when there is a single process). */
export function parseCimProcesses(json: string): WinProc[] {
  const parsed = JSON.parse(json) as CimProcess | CimProcess[];
  return (Array.isArray(parsed) ? parsed : [parsed]).map((p) => {
    if (typeof p.ProcessId !== 'number' || typeof p.ParentProcessId !== 'number') {
      throw new Error(`Unexpected Win32_Process entry (no ProcessId/ParentProcessId): ${JSON.stringify(p)}`);
    }
    const proc: WinProc = { pid: p.ProcessId, ppid: p.ParentProcessId, start: creationDate(p.CreationDate) };
    if (typeof p.Name === 'string') proc.name = p.Name;
    return proc;
  });
}

/** Milliseconds of a CreationDate; NaN when unknown. */
function startMs(start: string): number {
  const ms = /^\/Date\((-?\d+)\)\/$/.exec(start);
  return ms ? Number(ms[1]) : Date.parse(start);
}

/** Windows keeps a dead parent's PID in ParentProcessId: a real child was created no earlier than its parent. */
function isChildOf(child: Proc, parent: Proc): boolean {
  if (child.ppid !== parent.pid || child.pid === parent.pid) return false;
  const [c, p] = [startMs(child.start), startMs(parent.start)];
  return Number.isNaN(c) || Number.isNaN(p) || c >= p;
}

/**
 * Every descendant of tauri-driver's direct child (msedgedriver), which launches one app per WebDriver
 * session: the app and its WebView2 processes. Neither the driver nor msedgedriver is included, nor
 * a console host (conhost.exe) of msedgedriver's own, which would otherwise look like a running app.
 */
export function appTree(procs: WinProc[], driverPid: number): WinProc[] {
  const driver = procs.find((p) => p.pid === driverPid);
  if (!driver) return [];
  const children = (parent: Proc): WinProc[] => procs.filter((p) => isChildOf(p, parent));
  const isConsoleHost = (p: WinProc): boolean => p.name?.toLowerCase() === 'conhost.exe';
  const result: WinProc[] = [];
  const queue = children(driver).flatMap((nativeDriver) => children(nativeDriver).filter((p) => !isConsoleHost(p)));
  while (queue.length > 0) {
    const p = queue.shift()!;
    if (result.includes(p)) continue;
    result.push(p);
    queue.push(...children(p));
  }
  return result;
}

function listProcesses(): WinProc[] {
  const out = execFileSync('powershell', ['-NoProfile', '-NonInteractive', '-Command', CIM_QUERY], {
    encoding: 'utf8',
    maxBuffer: 16 * 1024 * 1024,
    windowsHide: true,
  });
  return parseCimProcesses(out);
}

const appProcesses = (pid: number): Proc[] => appTree(listProcesses(), pid);

/** The kind of a WebView2 process from its command line (`--type=renderer`, …; none: the browser process). */
export function processKind(commandLine: string): string {
  return /--type=([\w-]+)/.exec(commandLine)?.[1] ?? 'browser';
}

/** `pid name kind` for each of `procs`, read from their command lines. */
function describeKinds(procs: Proc[]): string {
  const filter = procs.map((p) => `ProcessId=${p.pid}`).join(' OR ');
  const out = spawnSync(
    'powershell',
    [
      '-NoProfile',
      '-NonInteractive',
      '-Command',
      `Get-CimInstance Win32_Process -Filter '${filter}' | Select-Object ProcessId,Name,CommandLine | ConvertTo-Json -Compress`,
    ],
    { encoding: 'utf8', windowsHide: true, maxBuffer: 16 * 1024 * 1024 },
  );
  if (out.stdout.trim() === '') return '(exited before they could be named)';
  try {
    const parsed = JSON.parse(out.stdout) as { ProcessId: number; Name: string; CommandLine: string | null };
    const list = Array.isArray(parsed) ? parsed : [parsed];
    return list.map((p) => `${p.ProcessId} ${p.Name} ${processKind(p.CommandLine ?? '')}`).join(', ');
  } catch {
    return `(could not read command lines: ${out.stderr.trim()})`;
  }
}

export const windowsPlatform: DesktopPlatform = {
  driverEnv: () => {
    assertHostSessionAllowed(process.env);
    return {};
  },
  driverArgs: (port) => {
    const native = which('msedgedriver');
    if (!native) throw new Error('msedgedriver is not on PATH');
    return ['--port', String(port), '--native-driver', native];
  },
  // Killing tauri-driver alone would leave msedgedriver (and an app) running: end its whole tree, by PID.
  stopDriver: (driver) => {
    const pid = driver.pid;
    const taskkill =
      pid === undefined ? undefined : spawnSync('taskkill', ['/PID', String(pid), '/T', '/F'], { windowsHide: true });
    if (taskkill?.status !== 0) {
      // Never leave afterSession waiting for an exit that will not come: end tauri-driver itself at least.
      console.warn(`taskkill of tauri-driver (pid ${pid}) failed: ${taskkill?.error ?? taskkill?.stderr}`);
      driver.kill();
    }
  },
  appProcesses,
  appRunning: () => appProcesses(driverPid()).length > 0,
  describeProcesses: (procs) => (procs.length === 0 ? '(none)' : describeKinds(procs)),
  // WM_CLOSE to the app (msedgedriver's child, not one of its WebView2 processes): the app shuts down as on a
  // click on X, and WebView2 with it.
  closeApp: (procs) => {
    const app = (procs as WinProc[]).find((p) => p.name?.toLowerCase() !== 'msedgewebview2.exe');
    if (!app) return null;
    const close = spawnSync(
      'powershell',
      ['-NoProfile', '-NonInteractive', '-Command', `(Get-Process -Id ${app.pid}).CloseMainWindow()`],
      { encoding: 'utf8', windowsHide: true },
    );
    if (close.status !== 0 || close.stdout.trim() !== 'True') {
      console.warn(`WM_CLOSE to the app (pid ${app.pid}) was not delivered: ${close.stdout} ${close.stderr}`);
    }
    return app.pid;
  },
  waitForExit: (procs, timeoutMs) => {
    // Once the wait passes DESCRIBE_AFTER_MS, names what each process still alive is (WebView2's --type=):
    // the evidence for why an exit is slow.
    const started = Date.now();
    let described = false;
    return pollUntilExited(
      procs,
      (left) => {
        const now = new Set(listProcesses().map((p) => `${p.pid}@${p.start}`));
        const alive = left.filter((p) => now.has(`${p.pid}@${p.start}`));
        if (!described && alive.length > 0 && Date.now() - started > DESCRIBE_AFTER_MS) {
          described = true;
          console.warn(`Still running ${Date.now() - started}ms after the session ended: ${describeKinds(alive)}`);
        }
        return alive;
      },
      timeoutMs,
      POLL_INTERVAL,
    );
  },
  // WebView2 can release EBWebView files a moment after its processes are gone; still fails after the retries.
  emptyDir: (dir) => {
    rmSync(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
    mkdirSync(dir);
  },
  checkRunAllowed: () => assertHostSessionAllowed(process.env),
  mapAreaClick: 'area',
  appDataDirs: () => {
    assertHostSessionAllowed(process.env);
    return windowsAppDataDirs(process.env);
  },
};
