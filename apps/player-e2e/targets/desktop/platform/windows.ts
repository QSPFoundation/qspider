// Windows: tauri-driver → msedgedriver → the app (qspider.exe) → WebView2 (msedgewebview2.exe) processes,
// read from Win32_Process by parent PID (never by name). The app keeps its data in the user's real
// %APPDATA%\<identifier> and %LOCALAPPDATA%\<identifier> (with EBWebView): Tauri resolves them through
// the Known Folders API, so no env var can redirect them. Hence the host-session guard: these dirs are
// emptied only on a throwaway CI machine or when the developer opts in.
import { execFileSync, spawnSync } from 'node:child_process';
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
  'Get-CimInstance Win32_Process | Select-Object ProcessId,ParentProcessId,CreationDate | ConvertTo-Json -Compress';
const POLL_INTERVAL = 250;

type Env = Record<string, string | undefined>;

/** Fails unless this is CI (`CI` set) or the developer opted in with QSPIDER_E2E_HOST_SESSION=1. */
export function assertHostSessionAllowed(env: Env): void {
  if (env['CI'] || env[ENV_HOST_SESSION] === '1') return;
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
  return APP_IDENTIFIERS.flatMap((id) => [win32.join(roaming, id), win32.join(local, id)]);
}

interface CimProcess {
  ProcessId?: unknown;
  ParentProcessId?: unknown;
  CreationDate?: unknown;
}

/** CreationDate as ConvertTo-Json writes it: "/Date(ms)/" (PowerShell 5.1), ISO (7), or { value }. */
function creationDate(raw: unknown): string {
  if (typeof raw === 'string') return raw;
  if (raw && typeof raw === 'object' && 'value' in raw) return String(raw.value);
  return '';
}

/** Parses the CIM_QUERY output (an array, or one object when there is a single process). */
export function parseCimProcesses(json: string): Proc[] {
  const parsed = JSON.parse(json) as CimProcess | CimProcess[];
  return (Array.isArray(parsed) ? parsed : [parsed]).map((p) => {
    if (typeof p.ProcessId !== 'number' || typeof p.ParentProcessId !== 'number') {
      throw new Error(`Unexpected Win32_Process entry (no ProcessId/ParentProcessId): ${JSON.stringify(p)}`);
    }
    return { pid: p.ProcessId, ppid: p.ParentProcessId, start: creationDate(p.CreationDate) };
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
 * session: the app and its WebView2 processes. Neither the driver nor msedgedriver is included.
 */
export function appTree(procs: Proc[], driverPid: number): Proc[] {
  const driver = procs.find((p) => p.pid === driverPid);
  if (!driver) return [];
  const children = (parent: Proc): Proc[] => procs.filter((p) => isChildOf(p, parent));
  const result: Proc[] = [];
  const queue = children(driver).flatMap(children);
  while (queue.length > 0) {
    const p = queue.shift()!;
    if (result.includes(p)) continue;
    result.push(p);
    queue.push(...children(p));
  }
  return result;
}

function listProcesses(): Proc[] {
  const out = execFileSync('powershell', ['-NoProfile', '-NonInteractive', '-Command', CIM_QUERY], {
    encoding: 'utf8',
    maxBuffer: 16 * 1024 * 1024,
    windowsHide: true,
  });
  return parseCimProcesses(out);
}

const appProcesses = (pid: number): Proc[] => appTree(listProcesses(), pid);

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
    if (driver.pid === undefined) return;
    spawnSync('taskkill', ['/PID', String(driver.pid), '/T', '/F'], { stdio: 'ignore', windowsHide: true });
  },
  appProcesses,
  appRunning: () => appProcesses(driverPid()).length > 0,
  waitForExit: (procs, timeoutMs) =>
    pollUntilExited(
      procs,
      (left) => {
        const now = new Set(listProcesses().map((p) => `${p.pid}@${p.start}`));
        return left.filter((p) => now.has(`${p.pid}@${p.start}`));
      },
      timeoutMs,
      POLL_INTERVAL,
    ),
  appDataDirs: () => {
    assertHostSessionAllowed(process.env);
    return windowsAppDataDirs(process.env);
  },
};
