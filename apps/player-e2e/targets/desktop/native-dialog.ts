// Drives the native GTK file chooser that the desktop "Open game" button opens. It is a window
// outside the webview, so WebDriver cannot reach it; AT-SPI (the Linux accessibility API) can,
// through atspi/dialog.py. Runs need an AT-SPI bus in the session and GTK on X11, which
// run-desktop-e2e.mjs provides (see README, "Desktop runs on Linux").
import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { INTERACTION_TIMEOUT } from '../../screenplay/support/timeouts';

const run = promisify(execFile);
const SCRIPT = fileURLToPath(new URL('./atspi/dialog.py', import.meta.url));

/** Chooses `path` in the open native file dialog and confirms; fails with the dialog driver's message. */
export async function pickFileInNativeDialog(path: string): Promise<void> {
  const timeoutMs = INTERACTION_TIMEOUT.inMilliseconds();
  try {
    // -I: isolated mode, so nothing from the working directory or user site shadows the driver's imports.
    // The script waits up to timeoutMs for the dialog and again for its entry; a hung AT-SPI call is
    // cut off after both waits.
    await run('python3', ['-I', SCRIPT, 'open', path, String(timeoutMs / 1000)], { timeout: 2 * timeoutMs + 5_000 });
  } catch (error) {
    const stderr = String((error as { stderr?: unknown }).stderr ?? '').trim();
    throw new Error(`Native file dialog: ${stderr.split('\n').pop() || String(error)}`);
  }
}
