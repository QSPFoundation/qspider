// Drives the native file dialog that the desktop "Open game" button opens. It is a window outside
// the webview, so WebDriver cannot reach it; the OS accessibility API can.
// - Linux: the GTK file chooser through AT-SPI, atspi/dialog.py. Runs need an AT-SPI bus in the
//   session and GTK on X11, which run-desktop-e2e.mjs provides (see README, "Desktop runs on Linux").
// - Windows: the IFileOpenDialog through UI Automation, uia/dialog.ps1, limited to a dialog of the
//   app's own processes (the tree under the worker's tauri-driver).
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { desktopPlatform } from './platform';
import { driverPid } from './platform/env';

const ATSPI_SCRIPT = fileURLToPath(new URL('./atspi/dialog.py', import.meta.url));
const UIA_SCRIPT = fileURLToPath(new URL('./uia/dialog.ps1', import.meta.url));
// How long a driver waits for the dialog (and its file field), and then for its next step (AT-SPI:
// the location entry; UI Automation: the dialog closing, within half of it). A dialog that never
// shows fails after 10s with the driver's message; a driver stuck in an accessibility call is killed.
// Either way the open fails well inside the 45s scenario timeout.
const DIALOG_WAIT_S = 10;
// Linux: the kill timer runs from the spawn, both waits plus a margin.
const KILL_AFTER_MS = (2 * DIALOG_WAIT_S + 2) * 1000;
// Windows: a cold PowerShell start plus Add-Type (UIAutomation, and C# it compiles) took most of a
// spawn-based budget on a CI runner. dialog.ps1 prints READY_LINE on stdout once it is set up: the
// start-up is bounded on its own, and the drive (the dialog wait, then half of it for the close) is
// timed from that line.
const STARTUP_MAX_MS = 20_000;
const DRIVE_MAX_MS = (1.5 * DIALOG_WAIT_S + 2) * 1000;

/** The line dialog.ps1 prints on stdout once UI Automation and its Win32 helpers are loaded. */
const READY_LINE = 'READY';

/** Whether `stdout` holds READY_LINE as a complete line (a leading UTF-8 BOM and a trailing CR are ignored). */
export function hasReadyLine(stdout: string): boolean {
  const lines = stdout.replace(/^\uFEFF/, '').split('\n');
  lines.pop(); // the last piece is not a complete line yet
  return lines.some((line) => line.trim() === READY_LINE);
}

/** The driver command for this OS: [executable, args]. */
function driverCommand(path: string): [string, string[]] {
  if (process.platform !== 'win32') {
    // -I: isolated mode, so nothing from the working directory or user site shadows the driver's imports.
    return ['python3', ['-I', ATSPI_SCRIPT, 'open', path, String(DIALOG_WAIT_S)]];
  }
  const appPids = desktopPlatform()
    .appProcesses(driverPid())
    .map((p) => p.pid);
  if (appPids.length === 0) throw new Error('no app process runs under tauri-driver');
  return [
    'powershell',
    [
      '-NoProfile',
      '-NonInteractive',
      '-ExecutionPolicy',
      'Bypass',
      '-File',
      UIA_SCRIPT,
      '-Path',
      path,
      '-WaitSeconds',
      String(DIALOG_WAIT_S),
      '-AppPids',
      appPids.join(','),
    ],
  ];
}

/** The driver's stderr as trimmed, non-empty lines, without the BOM a UTF-8 console stream may start with. */
function stderrLines(stderr: string): string[] {
  return stderr
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line !== '');
}

/** Lines starting with '|' are details after the message (dialog.ps1's UIA tree dump), not the message. */
const isDetail = (line: string) => line.startsWith('|');

/**
 * The driver's failure, from its stderr. A driver's own failure is one line (dialog.py's fail,
 * dialog.ps1's Fail), maybe followed by detail lines. Otherwise on Linux the last line is kept (a
 * Python traceback ends with the error); on Windows a PowerShell error record (e.g. a parse error)
 * starts with its message and carries a FullyQualifiedErrorId, so those two are kept.
 */
export function driverFailure(stderr: string, platform: NodeJS.Platform): string {
  const lines = stderrLines(stderr).filter((line) => !isDetail(line));
  if (lines.length <= 1 || platform !== 'win32') return lines.pop() ?? '';
  const id = lines.map((line) => /FullyQualifiedErrorId\s*:\s*(.+)$/.exec(line)?.[1]).find(Boolean);
  return id ? `${lines[0]} (${id})` : lines[0];
}

/** The driver's detail lines (dialog.ps1's UIA tree dump on a dialog it could not drive), in order. */
export function driverDetails(stderr: string): string[] {
  return stderrLines(stderr).filter(isDetail);
}

/** A driver the harness stopped: `reason` says which bound it passed. */
class DriverKilled extends Error {}

/**
 * Runs the driver. `readyGated` (Windows): the kill timer starts at READY_LINE, after a start-up bound of its
 * own; otherwise it runs from the spawn. Rejects with DriverKilled when stopped, else with `{ stderr }` on a
 * non-zero exit.
 */
function runDriver(command: string, args: string[], readyGated: boolean): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { windowsHide: true });
    let stdout = '';
    let stderr = '';
    let killed: string | undefined;
    const killAfter = (ms: number, reason: string) =>
      setTimeout(() => {
        killed = reason;
        child.kill();
      }, ms);
    let timer = readyGated
      ? killAfter(STARTUP_MAX_MS, `the driver did not get ready within ${STARTUP_MAX_MS / 1000}s`)
      : killAfter(KILL_AFTER_MS, `the driver did not finish within ${KILL_AFTER_MS / 1000}s`);
    let ready = !readyGated;
    child.stdout.setEncoding('utf8').on('data', (chunk: string) => {
      stdout += chunk;
      if (ready || !hasReadyLine(stdout)) return;
      ready = true;
      clearTimeout(timer);
      timer = killAfter(DRIVE_MAX_MS, `the driver did not finish within ${DRIVE_MAX_MS / 1000}s of getting ready`);
    });
    child.stderr.setEncoding('utf8').on('data', (chunk: string) => (stderr += chunk));
    child.on('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      if (killed !== undefined) reject(new DriverKilled(killed));
      else if (code === 0) resolve();
      else reject(Object.assign(new Error(`${command} exited with code ${String(code)}`), { stderr }));
    });
  });
}

/** Chooses `path` in the open native file dialog and confirms; fails with the dialog driver's message. */
export async function pickFileInNativeDialog(path: string): Promise<void> {
  try {
    const [command, args] = driverCommand(path);
    await runDriver(command, args, process.platform === 'win32');
  } catch (error) {
    if (error instanceof DriverKilled) throw new Error(`Native file dialog: ${error.message}`);
    const { stderr } = error as { stderr?: unknown };
    const message = error instanceof Error ? error.message : String(error);
    const details = driverDetails(String(stderr ?? ''));
    const failure = driverFailure(String(stderr ?? ''), process.platform) || message;
    // The details (the dialog's UIA tree) go into the error, so the failure explains the dialog's shape.
    throw new Error([`Native file dialog: ${failure}`, ...details].join('\n'));
  }
}
