// Runs the desktop E2E (WebdriverIO + tauri-driver): `node run-desktop-e2e.mjs [wdio args...]`.
// On Linux the run is always headless and isolated from the developer's desktop session and home:
//   xvfb-run -a                      a virtual X display; everything below sees only its DISPLAY
//   └ private environment            fresh private dir (0700) as XDG_RUNTIME_DIR, with XDG_CONFIG/DATA/CACHE/
//                                    STATE_HOME under it; GSETTINGS_BACKEND=memory; no variable that points
//                                    at the desktop session (Wayland, D-Bus, AT-SPI, XDG_SESSION_*, audio,
//                                    ssh agent, GTK_MODULES, Hyprland); GDK_BACKEND=x11;
//                                    gvfs kept local (no FUSE mounts); QSPIDER_E2E_PRIVATE_SESSION=1
//     └ dbus-run-session --          a private session bus
//       └ atspi/with-a11y-bus.sh     the AT-SPI accessibility bus + registry (the native file dialog
//                                    is driven through AT-SPI); refuses to run outside this tree
//         └ wdio run …/wdio.conf.ts  (sets its own per-run XDG_* dirs for tauri-driver and the app)
// Other platforms run wdio directly.
import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, symlinkSync } from 'node:fs';
import { constants, tmpdir } from 'node:os';
import { delimiter, join } from 'node:path';
import process from 'node:process';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath, URL } from 'node:url';

const workspaceRoot = fileURLToPath(new URL('../../../..', import.meta.url));
const a11yBus = fileURLToPath(new URL('./atspi/with-a11y-bus.sh', import.meta.url));
const wdio = ['wdio', 'run', 'apps/player-e2e/targets/desktop/wdio.conf.ts', ...process.argv.slice(2)];
/** How long the process group gets to exit after TERM before it is KILLed. */
const GROUP_EXIT_TIMEOUT_MS = 30_000;

const env = { ...process.env };
// Find the workspace's wdio even when not started through a pnpm script.
env.PATH = [join(workspaceRoot, 'node_modules/.bin'), env.PATH].join(delimiter);

let command = wdio;
let privateDir;

function removePrivateDir() {
  if (privateDir) rmSync(privateDir, { recursive: true, force: true });
  privateDir = undefined;
}

/** Points the env at a fresh private dir and strips everything that reaches the desktop session. */
function preparePrivateSession() {
  privateDir = mkdtempSync(join(tmpdir(), 'qspider-e2e-runtime-')); // created 0700
  env.XDG_RUNTIME_DIR = privateDir;
  // Nothing in the tree (GTK, dconf-service and other services the private bus activates) writes the real home.
  for (const [name, sub] of [
    ['XDG_CONFIG_HOME', 'config'],
    ['XDG_DATA_HOME', 'data'],
    ['XDG_CACHE_HOME', 'cache'],
    ['XDG_STATE_HOME', 'state'],
  ]) {
    env[name] = join(privateDir, sub);
    mkdirSync(env[name], { mode: 0o700 });
  }
  // Version-manager shims (mise, asdf, …) read their config and trust state from the XDG dirs replaced
  // above and can fail there, so pin node and python3 to the interpreters resolved with the real env.
  const pinned = join(privateDir, 'bin');
  mkdirSync(pinned);
  symlinkSync(process.execPath, join(pinned, 'node'));
  const python = spawnSync('python3', ['-c', 'import sys; print(sys.executable)'], { encoding: 'utf8' });
  const pythonExe = python.status === 0 ? python.stdout.trim() : '';
  if (pythonExe) symlinkSync(pythonExe, join(pinned, 'python3'));
  env.PATH = [pinned, env.PATH].join(delimiter);
  env.GSETTINGS_BACKEND = 'memory';
  // Everything that points at the desktop session: its display, buses, audio, agents and compositor.
  for (const name of [
    'WAYLAND_DISPLAY',
    'AT_SPI_BUS_ADDRESS',
    'DBUS_SESSION_BUS_ADDRESS',
    'XDG_SESSION_TYPE',
    'XDG_CURRENT_DESKTOP',
    'XDG_SESSION_DESKTOP',
    'PULSE_SERVER',
    'PIPEWIRE_REMOTE',
    'GTK_MODULES',
    'SSH_AUTH_SOCK',
    'HYPRLAND_INSTANCE_SIGNATURE',
  ]) {
    delete env[name];
  }
  env.GDK_BACKEND = 'x11';
  env.GIO_USE_VFS = 'local';
  env.GVFS_DISABLE_FUSE = '1';
  // with-a11y-bus.sh, wdio.conf.ts and dialog.py refuse to run without it.
  env.QSPIDER_E2E_PRIVATE_SESSION = '1';
  command = ['xvfb-run', '-a', 'dbus-run-session', '--', a11yBus, ...wdio];
}

const ownGroup = process.platform !== 'win32';
let child;
try {
  // Anything here that throws (the private dir, the symlinks, the python probe, spawn) must not leave
  // the private dir behind.
  if (process.platform === 'linux') preparePrivateSession();
  const [file, ...args] = command;
  child = spawn(file, args, {
    cwd: workspaceRoot,
    env,
    stdio: 'inherit',
    // Its own process group, so a signal reaches the whole tree (xvfb-run, Xvfb, the buses, wdio, the app),
    // not only xvfb-run, which would exit and orphan the rest.
    detached: ownGroup,
    // wdio is a .cmd shim on Windows.
    shell: process.platform === 'win32',
  });
} catch (error) {
  removePrivateDir();
  throw error;
}

// Once the group is seen empty, its id may be reused: never signal it again.
let groupGone = !ownGroup;
function groupAlive() {
  if (groupGone) return false;
  try {
    process.kill(-child.pid, 0);
    return true;
  } catch {
    groupGone = true;
    return false;
  }
}
function signalTree(signal) {
  if (!ownGroup) {
    child.kill(signal);
    return;
  }
  if (!groupAlive()) return;
  try {
    process.kill(-child.pid, signal);
  } catch {
    groupGone = true;
  }
}
/** Stops what is left of the group (e.g. services the private bus activated): TERM, up to 30s, then KILL. */
async function stopGroup() {
  if (!ownGroup) return;
  signalTree('SIGTERM');
  const deadline = Date.now() + GROUP_EXIT_TIMEOUT_MS;
  while (groupAlive() && Date.now() < deadline) await delay(100);
  signalTree('SIGKILL');
}

// Keep running until the tree has exited (so cleanup happens); pass the signal on to all of it.
for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
  process.on(signal, () => signalTree(signal));
}

child.on('error', (error) => {
  process.stderr.write(`Could not start ${command[0]}: ${error.message}\n`);
  removePrivateDir();
  process.exit(1);
});

child.on('exit', (code, signal) => {
  // A signal-terminated child exits 128+n, like a shell.
  const status = signal ? 128 + (constants.signals[signal] ?? 0) : (code ?? 1);
  stopGroup()
    .finally(removePrivateDir)
    .finally(() => process.exit(status));
});
