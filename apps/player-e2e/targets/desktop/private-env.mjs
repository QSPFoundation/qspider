// The Linux private session shared by the desktop runners (run-desktop-e2e.mjs, smoke/run-smoke.mjs):
// a stripped environment with private XDG dirs, the Xvfb + private D-Bus wrapper, and a process tree
// run in its own process group and cleaned up afterwards. See run-desktop-e2e.mjs for the full picture.
import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, symlinkSync } from 'node:fs';
import { constants, tmpdir } from 'node:os';
import { delimiter, join } from 'node:path';
import process from 'node:process';
import { setTimeout as delay } from 'node:timers/promises';

/**
 * Wraps a command in a virtual X display of a fixed size (so every machine and CI gets the same size; the
 * xvfb-run default varies by distribution, 640x480 on Arch) and a private session bus.
 */
export const PRIVATE_SESSION_WRAPPER = ['xvfb-run', '-a', '-s', '-screen 0 1280x1024x24', 'dbus-run-session', '--'];

/** How long the process group gets to exit after TERM before it is KILLed. */
const GROUP_EXIT_TIMEOUT_MS = 30_000;

/**
 * Points `env` at a fresh private dir and strips everything that reaches the desktop session. Returns the
 * private dir; the caller removes it (removePrivateDir) when the run ends. Removes it itself if it throws.
 */
export function preparePrivateEnv(env) {
  const privateDir = mkdtempSync(join(tmpdir(), 'qspider-e2e-runtime-')); // created 0700
  try {
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
    // The host's display scaling and look: GDK_SCALE halves the screen in logical pixels (e.g. 320x240 on a
    // 640x480 screen), which is why the scaling vars are stripped and the screen is pinned.
    for (const name of [
      'GDK_SCALE',
      'GDK_DPI_SCALE',
      'QT_SCALE_FACTOR',
      'QT_AUTO_SCREEN_SCALE_FACTOR',
      'GTK_THEME',
      'XCURSOR_SIZE',
    ]) {
      delete env[name];
    }
    env.GDK_BACKEND = 'x11';
    env.GIO_USE_VFS = 'local';
    env.GVFS_DISABLE_FUSE = '1';
    // with-a11y-bus.sh, wdio.conf.ts, dialog.py and run-smoke.mjs refuse to run without it.
    env.QSPIDER_E2E_PRIVATE_SESSION = '1';
    return privateDir;
  } catch (error) {
    removePrivateDir(privateDir);
    throw error;
  }
}

export function removePrivateDir(privateDir) {
  if (privateDir) rmSync(privateDir, { recursive: true, force: true });
}

/**
 * Runs `command` as the root of its own process tree and exits this process with its status, once the
 * tree has exited and `cleanup` has run. Signals to this process are passed on to the whole tree.
 * `cleanup` also runs if the spawn fails.
 */
export function runTree(command, { cwd, env, shell = false, cleanup = () => undefined }) {
  const ownGroup = process.platform !== 'win32';
  let child;
  try {
    const [file, ...args] = command;
    child = spawn(file, args, {
      cwd,
      env,
      stdio: 'inherit',
      // Its own process group, so a signal reaches the whole tree (xvfb-run, Xvfb, the buses, the runner, the
      // app), not only xvfb-run, which would exit and orphan the rest.
      detached: ownGroup,
      shell,
    });
  } catch (error) {
    cleanup();
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
    cleanup();
    process.exit(1);
  });

  child.on('exit', (code, signal) => {
    // A signal-terminated child exits 128+n, like a shell.
    const status = signal ? 128 + (constants.signals[signal] ?? 0) : (code ?? 1);
    stopGroup()
      .finally(cleanup)
      .finally(() => process.exit(status));
  });
}
