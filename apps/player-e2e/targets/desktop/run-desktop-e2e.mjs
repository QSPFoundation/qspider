// Runs the desktop E2E (WebdriverIO + tauri-driver): `node run-desktop-e2e.mjs [wdio args...]`.
// On Linux the run is always headless and isolated from the developer's desktop session:
//   xvfb-run -a                      a virtual X display; everything below sees only its DISPLAY
//   └ private environment            fresh XDG_RUNTIME_DIR (0700), no WAYLAND_DISPLAY / AT_SPI_BUS_ADDRESS,
//                                    GDK_BACKEND=x11, gvfs kept local (no FUSE mounts)
//     └ dbus-run-session --          a private session bus
//       └ atspi/with-a11y-bus.sh     the AT-SPI accessibility bus + registry (the native file dialog
//                                    is driven through AT-SPI)
//         └ wdio run …/wdio.conf.ts
// Other platforms run wdio directly.
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { constants, tmpdir } from 'node:os';
import { delimiter, join } from 'node:path';
import process from 'node:process';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath, URL } from 'node:url';

const workspaceRoot = fileURLToPath(new URL('../../../..', import.meta.url));
const a11yBus = fileURLToPath(new URL('./atspi/with-a11y-bus.sh', import.meta.url));
const wdio = ['wdio', 'run', 'apps/player-e2e/targets/desktop/wdio.conf.ts', ...process.argv.slice(2)];

const env = { ...process.env };
// Find the workspace's wdio even when not started through a pnpm script.
env.PATH = [join(workspaceRoot, 'node_modules/.bin'), env.PATH].join(delimiter);

let command = wdio;
let runtimeDir;
if (process.platform === 'linux') {
  runtimeDir = mkdtempSync(join(tmpdir(), 'qspider-e2e-runtime-')); // created 0700
  env.XDG_RUNTIME_DIR = runtimeDir;
  delete env.WAYLAND_DISPLAY;
  delete env.AT_SPI_BUS_ADDRESS;
  env.GDK_BACKEND = 'x11';
  env.GIO_USE_VFS = 'local';
  env.GVFS_DISABLE_FUSE = '1';
  command = ['xvfb-run', '-a', 'dbus-run-session', '--', a11yBus, ...wdio];
}

function removeRuntimeDir() {
  if (runtimeDir) rmSync(runtimeDir, { recursive: true, force: true });
  runtimeDir = undefined;
}

const [file, ...args] = command;
const ownGroup = process.platform !== 'win32';
const child = spawn(file, args, {
  cwd: workspaceRoot,
  env,
  stdio: 'inherit',
  // Its own process group, so a signal reaches the whole tree (xvfb-run, Xvfb, the buses, wdio, the app),
  // not only xvfb-run, which would exit and orphan the rest.
  detached: ownGroup,
  // wdio is a .cmd shim on Windows.
  shell: process.platform === 'win32',
});

let signalled = false;
function signalTree(signal) {
  try {
    if (ownGroup) process.kill(-child.pid, signal);
    else child.kill(signal);
  } catch {
    // already gone
  }
}
function groupAlive() {
  try {
    process.kill(-child.pid, 0);
    return true;
  } catch {
    return false;
  }
}
/** After a signal, gives the tree about 10s to clean up (the a11y wrapper stops its daemons), then KILLs it. */
async function waitForGroup() {
  if (!ownGroup || !signalled) return;
  const deadline = Date.now() + 10_000;
  while (groupAlive() && Date.now() < deadline) await delay(100);
  if (groupAlive()) signalTree('SIGKILL');
}

// Keep running until the tree has exited (so cleanup happens); pass the signal on to all of it.
for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
  process.on(signal, () => {
    signalled = true;
    signalTree(signal);
  });
}

child.on('error', (error) => {
  process.stderr.write(`Could not start ${file}: ${error.message}\n`);
  removeRuntimeDir();
  process.exit(1);
});

child.on('exit', (code, signal) => {
  // A signal-terminated child exits 128+n, like a shell.
  const status = signal ? 128 + (constants.signals[signal] ?? 0) : (code ?? 1);
  waitForGroup()
    .finally(removeRuntimeDir)
    .finally(() => process.exit(status));
});
