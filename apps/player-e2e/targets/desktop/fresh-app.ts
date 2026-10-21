// Per-test isolation for the desktop tests: one tauri-driver serves the whole run
// (wdio.conf.ts), and each test gets a new app process with empty app data.
import { mkdirSync, readdirSync, readFileSync, readlinkSync, rmSync } from 'node:fs';
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

// TEMP relaunch diagnostics: remove with the fix.
async function probeStartup(driverPid: number, log: (m: string) => void): Promise<void> {
  const deadline = Date.now() + 12_000;
  for (;;) {
    try {
      if (await browser.execute(() => !!document.querySelector('[data-qa="startup-finished"]'))) return;
    } catch {
      /* page not ready */
    }
    if (Date.now() > deadline) break;
    await new Promise((r) => setTimeout(r, 100));
  }
  log('PROBE: startup marker NOT present after 12s');
  try {
    log(
      `PROBE page: ${JSON.stringify(await browser.execute(() => ({ rs: document.readyState, url: location.href, len: document.body?.innerHTML.length, body: document.body?.innerHTML.slice(0, 500), tauri: '__TAURI_INTERNALS__' in window })))}`,
    );
  } catch (e) {
    log(`PROBE execute failed: ${String(e)}`);
  }
  dumpDiagnostics(appProcesses(driverPid));
}

function dumpDiagnostics(alive: Proc[]): void {
  const rd = (f: string): string => {
    try {
      return readFileSync(f, 'utf8').replace(/\0/g, ' ').trim();
    } catch (e) {
      return `(${String(e)})`;
    }
  };
  const all = readdirSync('/proc').filter((n) => /^\d+$/.test(n));
  console.log('DIAG alive:', alive.map((p) => p.pid).join(','));
  for (const p of alive) {
    const d = `/proc/${p.pid}`;
    const st = rd(`${d}/status`)
      .split('\n')
      .filter((l) => /^(Name|State|PPid|Threads|SigPnd|ShdPnd|SigBlk|SigIgn|SigCgt)/.test(l))
      .join(' | ');
    console.log(`DIAG pid ${p.pid} cmd=${rd(`${d}/cmdline`).slice(0, 200)} ${st} wchan=${rd(`${d}/wchan`)}`);
    const tasks = readdirSync(`${d}/task`).map(
      (t) =>
        `${t}:${rd(`${d}/task/${t}/comm`)}:${rd(`${d}/task/${t}/wchan`)}:${rd(`${d}/task/${t}/stat`).split(' ')[2]}`,
    );
    console.log(`DIAG pid ${p.pid} threads: ${tasks.join(' ')}`);
  }
  const tree = all
    .map((n) => `${n}<${rd(`/proc/${n}/stat`).split(' ')[3]}:${rd(`/proc/${n}/comm`)}`)
    .filter((x) => /qspider|WebKit|Web|tauri|dbus|at-spi/i.test(x));
  console.log('DIAG related procs:', tree.join(' '));
}

async function waitForExit(procs: Proc[]): Promise<void> {
  const deadline = Date.now() + EXIT_TIMEOUT;
  for (;;) {
    const alive = procs.filter(isAlive);
    if (alive.length === 0) return;
    if (Date.now() > deadline) {
      dumpDiagnostics(alive); // TEMP relaunch diagnostics
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
 * Ends the running app, waits until it and its WebKit processes have exited (so nothing
 * still writes app data), empties the app data dirs, then starts a new session:
 * tauri-driver launches a new app process, which opens the fixture from its CLI argument.
 */
export async function restartAppWithEmptyData(): Promise<void> {
  if (process.platform !== 'linux') {
    // XDG dirs and /proc are Linux-only; other platforms have no isolated app data here.
    throw new Error(`Desktop E2E isolation is implemented for Linux only, not ${process.platform}`);
  }
  const driverPid = Number(requireEnv(ENV_DRIVER_PID));
  const dataDirs = JSON.parse(requireEnv(ENV_APP_DATA_DIRS)) as string[];

  const T0 = Date.now();
  const log = (m: string): void => console.log(`RELAUNCH +${Date.now() - T0}ms ${m}`); // TEMP diagnostics
  const running = appProcesses(driverPid);
  log(`running=${running.map((p) => `${p.pid}:${p.start}`).join(',')} session=${browser.sessionId}`);
  if (running.length === 0) throw new Error(`No app process found under tauri-driver (pid ${driverPid})`);
  await browser.deleteSession();
  log('deleteSession done');
  await waitForExit(running);
  log('waitForExit done');

  for (const dir of dataDirs) {
    rmSync(dir, { recursive: true, force: true });
    mkdirSync(dir);
  }
  log('dirs reset');
  const watchdog = setTimeout(() => {
    log('WATCHDOG: reloadSession still pending after 15s');
    dumpDiagnostics(appProcesses(driverPid));
    const wd = readdirSync('/proc').filter((n) => /^\d+$/.test(n) && readProc(Number(n))?.ppid === driverPid);
    for (const w of wd) {
      const d = `/proc/${w}`;
      let fds = '';
      try {
        fds = readdirSync(`${d}/fd`)
          .map((f) => {
            try {
              return `${f}->${readlinkSync(`${d}/fd/${f}`)}`;
            } catch {
              return f;
            }
          })
          .join(' ');
      } catch {
        /* */
      }
      const tasks = readdirSync(`${d}/task`).map(
        (t) =>
          `${t}:${readFileSync(`${d}/task/${t}/comm`, 'utf8').trim()}:${readFileSync(`${d}/task/${t}/wchan`, 'utf8')}`,
      );
      console.log(
        `DIAG webdriver ${w} cmd=${readFileSync(`${d}/cmdline`, 'utf8').replace(/\0/g, ' ')} threads=${tasks.join(' ')} fds=${fds}`,
      );
    }
    for (const a of appProcesses(driverPid).slice(0, 1)) {
      console.log(
        `DIAG app env: ${readFileSync(`/proc/${a.pid}/environ`, 'utf8')
          .split('\0')
          .filter((e) => /WEBKIT|DBUS|AT_SPI|AUTOMATION|XDG_RUNTIME|GTK/i.test(e))
          .join(' ')}`,
      );
    }
    console.log(`DIAG loadavg ${readFileSync('/proc/loadavg', 'utf8')}`);
  }, 15_000);
  await browser.reloadSession();
  clearTimeout(watchdog);
  await probeStartup(driverPid, log); // TEMP diagnostics
  log(
    `reloadSession done session=${browser.sessionId} apps=${appProcesses(driverPid)
      .map((p) => p.pid)
      .join(',')}`,
  );
}
