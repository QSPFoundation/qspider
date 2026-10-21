// Drives the native GTK file chooser that the desktop "Open game" button opens. It is a window
// outside the webview, so WebDriver cannot reach it; AT-SPI (the Linux accessibility API) can,
// through atspi/dialog.py. Runs need an AT-SPI bus in the session and GTK on X11, which
// run-desktop-e2e.mjs provides (see README, "Desktop runs on Linux").
import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const run = promisify(execFile);
const SCRIPT = fileURLToPath(new URL('./atspi/dialog.py', import.meta.url));
// How long the driver waits for the dialog, and then again for its location entry. A dialog that
// never shows fails after 10s with the driver's message; a driver stuck in an AT-SPI call is killed
// after both waits plus a margin (22s). Either way the open fails well inside the 45s scenario timeout
// (the Open game click before it is quick when the button is there, and fails on its own otherwise).
const DIALOG_WAIT_S = 10;
const KILL_AFTER_MS = (2 * DIALOG_WAIT_S + 2) * 1000;

/** Chooses `path` in the open native file dialog and confirms; fails with the dialog driver's message. */
export async function pickFileInNativeDialog(path: string): Promise<void> {
  try {
    // -I: isolated mode, so nothing from the working directory or user site shadows the driver's imports.
    // A hung AT-SPI call is cut off after both waits (KILL_AFTER_MS).
    await run('python3', ['-I', SCRIPT, 'open', path, String(DIALOG_WAIT_S)], { timeout: KILL_AFTER_MS });
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
