// Linux: tauri-driver → WebKitWebDriver → the app → WebKit helper processes, read from /proc. The app
// data lives in the per-worker XDG dirs that tauri-driver (and so the app) gets.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { driverPid } from './env';
import type { DesktopPlatform, Proc } from './index';
import { pollUntilExited } from './wait-for-exit';

const POLL_INTERVAL = 50;

interface LinuxProc extends Proc {
  /** Start time in clock ticks since boot: tells a reused PID apart. */
  start: string;
  zombie: boolean;
}

function readProc(pid: number): LinuxProc | null {
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
    .filter((p): p is LinuxProc => p !== null && !p.zombie);
  const children = (pid: number): LinuxProc[] => procs.filter((p) => p.ppid === pid);
  const result: LinuxProc[] = [];
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

/** The per-worker XDG dirs under `runDir`. */
const xdgDirs = (runDir: string): Record<string, string> => ({
  XDG_DATA_HOME: join(runDir, 'data'),
  XDG_CONFIG_HOME: join(runDir, 'config'),
  XDG_CACHE_HOME: join(runDir, 'cache'),
});

export const linuxPlatform: DesktopPlatform = {
  driverEnv: xdgDirs,
  driverArgs: (port) => ['--port', String(port)],
  stopDriver: (driver) => {
    driver.kill();
  },
  appProcesses,
  appRunning: () => appProcesses(driverPid()).length > 0,
  waitForExit: (procs, timeoutMs) => pollUntilExited(procs, (left) => left.filter(isAlive), timeoutMs, POLL_INTERVAL),
  appDataDirs: (runDir) => Object.values(xdgDirs(runDir)),
};
