// Drives the native file dialog that the desktop "Open game" button opens. It is a window outside
// the webview, so WebDriver cannot reach it; the OS accessibility API can.
// - Linux: the GTK file chooser through AT-SPI, atspi/dialog.py. Runs need an AT-SPI bus in the
//   session and GTK on X11, which run-desktop-e2e.mjs provides (see README, "Desktop runs on Linux").
// - Windows: the IFileOpenDialog through UI Automation, uia/dialog.ps1, limited to a dialog of the
//   app's own processes (the tree under the worker's tauri-driver).
import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { desktopPlatform } from './platform';
import { driverPid } from './platform/env';

const run = promisify(execFile);
const ATSPI_SCRIPT = fileURLToPath(new URL('./atspi/dialog.py', import.meta.url));
const UIA_SCRIPT = fileURLToPath(new URL('./uia/dialog.ps1', import.meta.url));
// How long a driver waits for the dialog (and its file field), and then for its next step (AT-SPI:
// the location entry; UI Automation: the dialog closing, within half of it). A dialog that never
// shows fails after 10s with the driver's message; a driver stuck in an accessibility call is killed
// after both waits plus a margin (22s). Either way the open fails well inside the 45s scenario timeout
// (the Open game click before it is quick when the button is there, and fails on its own otherwise).
const DIALOG_WAIT_S = 10;
const KILL_AFTER_MS = (2 * DIALOG_WAIT_S + 2) * 1000;

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

/**
 * The driver's failure, from its stderr. A driver's own failure is one line (dialog.py's fail,
 * dialog.ps1's Fail). Otherwise on Linux the last line is kept (a Python traceback ends with the
 * error); on Windows a PowerShell error record (e.g. a parse error) starts with its message and
 * carries a FullyQualifiedErrorId, so those two are kept.
 */
export function driverFailure(stderr: string, platform: NodeJS.Platform): string {
  const lines = stderr
    .replace(/^\uFEFF/, '') // the BOM a UTF-8 console stream may start with
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line !== '');
  if (lines.length <= 1 || platform !== 'win32') return lines.pop() ?? '';
  const id = lines.map((line) => /FullyQualifiedErrorId\s*:\s*(.+)$/.exec(line)?.[1]).find(Boolean);
  return id ? `${lines[0]} (${id})` : lines[0];
}

/** Chooses `path` in the open native file dialog and confirms; fails with the dialog driver's message. */
export async function pickFileInNativeDialog(path: string): Promise<void> {
  try {
    const [command, args] = driverCommand(path);
    // A hung accessibility call is cut off after both waits (KILL_AFTER_MS).
    await run(command, args, { timeout: KILL_AFTER_MS, windowsHide: true });
  } catch (error) {
    const { stderr, killed } = error as { stderr?: unknown; killed?: boolean };
    if (killed) throw new Error(`Native file dialog: the driver did not finish within ${KILL_AFTER_MS / 1000}s`);
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Native file dialog: ${driverFailure(String(stderr ?? ''), process.platform) || message}`);
  }
}
