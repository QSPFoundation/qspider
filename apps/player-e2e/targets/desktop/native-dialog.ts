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
  if (appPids.length === 0) throw new Error('Native file dialog: no app process runs under tauri-driver');
  return [
    'powershell',
    [
      '-NoProfile',
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

/** Chooses `path` in the open native file dialog and confirms; fails with the dialog driver's message. */
export async function pickFileInNativeDialog(path: string): Promise<void> {
  const [command, args] = driverCommand(path);
  try {
    // A hung accessibility call is cut off after both waits (KILL_AFTER_MS).
    await run(command, args, { timeout: KILL_AFTER_MS, windowsHide: true });
  } catch (error) {
    const { stderr, killed } = error as { stderr?: unknown; killed?: boolean };
    if (killed) throw new Error(`Native file dialog: the driver did not finish within ${KILL_AFTER_MS / 1000}s`);
    throw new Error(
      `Native file dialog: ${
        String(stderr ?? '')
          .trim()
          .split('\n')
          .pop() || String(error)
      }`,
    );
  }
}
