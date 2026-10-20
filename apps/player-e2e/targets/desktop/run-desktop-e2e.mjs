// Runs the desktop E2E (WebdriverIO + tauri-driver): `node run-desktop-e2e.mjs [wdio args...]`.
// On Linux the run is always headless: dbus-run-session hosts a private session bus, with-a11y-bus.sh
// starts the AT-SPI accessibility bus on it (the native file dialog is driven through AT-SPI), and
// xvfb-run gives the app a virtual X display. WAYLAND_DISPLAY is removed and GDK_BACKEND=x11 is set
// so GTK uses Xvfb instead of the developer's Wayland session. Other platforms run wdio directly.
import { spawnSync } from 'node:child_process';
import { delimiter } from 'node:path';
import process from 'node:process';
import { fileURLToPath, URL } from 'node:url';

const workspaceRoot = fileURLToPath(new URL('../../../..', import.meta.url));
const a11yBus = fileURLToPath(new URL('./atspi/with-a11y-bus.sh', import.meta.url));
const wdio = ['wdio', 'run', 'apps/player-e2e/targets/desktop/wdio.conf.ts', ...process.argv.slice(2)];

const env = { ...process.env };
// Find the workspace's wdio even when not started through a pnpm script.
env.PATH = [fileURLToPath(new URL('../../../../node_modules/.bin', import.meta.url)), env.PATH].join(delimiter);

let command = wdio;
if (process.platform === 'linux') {
  delete env.WAYLAND_DISPLAY;
  env.GDK_BACKEND = 'x11';
  command = ['dbus-run-session', '--', a11yBus, 'xvfb-run', '-a', ...wdio];
}

const [file, ...args] = command;
const result = spawnSync(file, args, {
  cwd: workspaceRoot,
  env,
  stdio: 'inherit',
  // wdio is a .cmd shim on Windows.
  shell: process.platform === 'win32',
});
if (result.error) {
  process.stderr.write(`Could not start ${file}: ${result.error.message}\n`);
  process.exit(1);
}
process.exit(result.status ?? 1);
