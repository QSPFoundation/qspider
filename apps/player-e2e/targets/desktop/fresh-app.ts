// Per-test isolation for the desktop tests: one tauri-driver serves the whole run
// (wdio.conf.ts), and each test gets a new app process with empty app data.
import { mkdirSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { browser } from '@wdio/globals';

/** Env vars wdio.desktop.conf.ts sets in the launcher; WDIO workers inherit them. */
export const ENV_DRIVER_PID = 'QSPIDER_E2E_DRIVER_PID';
export const ENV_APP_DATA_DIRS = 'QSPIDER_E2E_APP_DATA_DIRS';

const EXIT_TIMEOUT = 10_000;
const POLL_INTERVAL = 50;

interface Proc {
  pid: number;
  ppid: number;
  /** Start time in clock ticks since boot: tells a reused PID apart. */
  start: string;
  zombie: boolean;
}

function readProc(pid: number): Proc | null {
  let stat: string;
  try {
    stat = readFileSync(`/proc/${pid}/stat`, 'utf8');
  } catch {
    return null; // exited
  }
  // Fields after "(comm)"; comm itself may contain spaces and parentheses.
  const fields = stat.slice(stat.lastIndexOf(')') + 2).split(' ');
  return { pid, ppid: Number(fields[1]), start: fields[19], zombie: fields[0] === 'Z' };
}

/**
 * The app and its WebKit helper processes: everything below tauri-driver's direct child
 * (WebKitWebDriver), which launches one app per WebDriver session.
 */
function appProcesses(driverPid: number): Proc[] {
  const procs = readdirSync('/proc')
    .filter((name) => /^\d+$/.test(name))
    .map((name) => readProc(Number(name)))
    .filter((p): p is Proc => p !== null && !p.zombie);
  const children = (pid: number): Proc[] => procs.filter((p) => p.ppid === pid);
  const result: Proc[] = [];
  const queue = children(driverPid).flatMap((webDriver) => children(webDriver.pid));
  while (queue.length > 0) {
    const p = queue.shift()!;
    result.push(p);
    queue.push(...children(p.pid));
  }
  return result;
}

const isAlive = (p: Proc): boolean => {
  const now = readProc(p.pid);
  return now !== null && !now.zombie && now.start === p.start;
};

async function waitForExit(procs: Proc[]): Promise<void> {
  const deadline = Date.now() + EXIT_TIMEOUT;
  for (;;) {
    const alive = procs.filter(isAlive);
    if (alive.length === 0) return;
    if (Date.now() > deadline) {
      throw new Error(
        `App processes still running ${EXIT_TIMEOUT}ms after the session ended: ${alive.map((p) => p.pid).join(', ')}`,
      );
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL)); // poll interval, not a fixed wait
  }
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set; run the desktop tests through targets/desktop/wdio.conf.ts`);
  return value;
}

/**
 * Ends the running app and waits until it and its WebKit processes have exited (so nothing still
 * writes app data). Then, when `wipeData`, empties the run's private app data dirs (from
 * ENV_APP_DATA_DIRS, never anything else). Then starts a new session: tauri-driver launches a new
 * app process, which opens the test pack from its CLI argument.
 */
async function restartApp(wipeData: boolean): Promise<void> {
  if (process.platform !== 'linux') {
    // XDG dirs and /proc are Linux-only; other platforms have no isolated app data here.
    throw new Error(`Desktop E2E isolation is implemented for Linux only, not ${process.platform}`);
  }
  const driverPid = Number(requireEnv(ENV_DRIVER_PID));
  const dataDirs = JSON.parse(requireEnv(ENV_APP_DATA_DIRS)) as string[];

  const running = appProcesses(driverPid);
  if (running.length === 0) throw new Error(`No app process found under tauri-driver (pid ${driverPid})`);
  await browser.deleteSession();
  await waitForExit(running);

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
