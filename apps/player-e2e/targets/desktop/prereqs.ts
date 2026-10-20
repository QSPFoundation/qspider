// Prerequisite check for the desktop (tauri-driver) E2E run. No test-framework imports.
import { spawnSync } from 'node:child_process';
import { accessSync, constants } from 'node:fs';
import { delimiter, join } from 'node:path';

// On Linux the run is always headless (run-desktop-e2e.mjs): Xvfb provides the display and
// dbus-run-session hosts the AT-SPI accessibility bus, which python3 + Atspi drive.
const PREREQS: Partial<Record<NodeJS.Platform, string[]>> = {
  linux: ['tauri-driver', 'WebKitWebDriver', 'xvfb-run', 'dbus-run-session', 'dbus-send', 'python3'],
  win32: ['tauri-driver', 'msedgedriver'],
};

/** The AT-SPI daemons atspi/with-a11y-bus.sh starts; Debian/Ubuntu keep them in /usr/libexec, Arch in /usr/lib. */
export const ATSPI_DAEMONS = ['at-spi-bus-launcher', 'at-spi2-registryd'];
export const ATSPI_DAEMON_DIRS = ['/usr/libexec', '/usr/lib'];

/** Name reported for an AT-SPI daemon that is in none of ATSPI_DAEMON_DIRS. */
export const atspiDaemonPrereq = (daemon: string): string => `${daemon} (in /usr/libexec or /usr/lib)`;

/** Name reported when python3 is present but cannot import the AT-SPI bindings. */
export const ATSPI_PREREQ = 'python3 with gi.repository.Atspi (PyGObject + the Atspi 2.0 typelib)';

export const INSTALL_HINT =
  'Install: cargo install tauri-driver --locked, and make sure ~/.cargo/bin is on PATH; ' +
  'Arch: webkit2gtk-4.1 (WebKitWebDriver), xorg-server-xvfb, dbus, at-spi2-core, python-gobject; ' +
  'Debian/Ubuntu: webkit2gtk-driver (webkitgtk-webdriver on Ubuntu 26.04+), xvfb, dbus, at-spi2-core, python3-gi, gir1.2-atspi-2.0';

/** Linux-only AT-SPI probes, injected so the check stays testable. */
export interface AtspiProbes {
  /** True when python3 can import gi.repository.Atspi 2.0. */
  canImportAtspi: () => boolean;
  /** The AT-SPI daemons (ATSPI_DAEMONS) that are in none of ATSPI_DAEMON_DIRS. */
  findMissingAtspiDaemons: () => string[];
}

/**
 * Returns the names of the prerequisites the desktop E2E needs on `platform` that are missing:
 * tools `which` can't find and, on Linux, the AT-SPI daemons and the AT-SPI Python bindings
 * (probed only when python3 is present). No display is needed: on Linux the run brings its own Xvfb.
 */
export function findMissingPrereqs(
  platform: NodeJS.Platform,
  which: (cmd: string) => string | null,
  atspi: AtspiProbes,
): string[] {
  const missing = (PREREQS[platform] ?? []).filter((cmd) => which(cmd) === null);
  if (platform !== 'linux') return missing;
  missing.push(...atspi.findMissingAtspiDaemons().map(atspiDaemonPrereq));
  if (!missing.includes('python3') && !atspi.canImportAtspi()) missing.push(ATSPI_PREREQ);
  return missing;
}

/** The AT-SPI daemons that are not executable in any of ATSPI_DAEMON_DIRS. */
export function findMissingAtspiDaemons(): string[] {
  return ATSPI_DAEMONS.filter((daemon) => !ATSPI_DAEMON_DIRS.some((dir) => isExecutable(join(dir, daemon))));
}

/** The real probes for findMissingPrereqs. */
export const atspiProbes: AtspiProbes = { canImportAtspi: () => canImportAtspi(), findMissingAtspiDaemons };

function isExecutable(path: string): boolean {
  try {
    accessSync(path, constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

/** True when `python3` can import gi.repository.Atspi 2.0. */
export function canImportAtspi(): boolean {
  const probe = "import gi; gi.require_version('Atspi', '2.0'); from gi.repository import Atspi";
  return spawnSync('python3', ['-c', probe], { stdio: 'ignore' }).status === 0;
}

/** Resolves `cmd` on PATH (honouring PATHEXT on Windows); null when not found. */
export function which(cmd: string): string | null {
  const exts = process.platform === 'win32' ? (process.env['PATHEXT'] ?? '.EXE').split(';') : [''];
  for (const dir of (process.env['PATH'] ?? '').split(delimiter)) {
    if (!dir) continue;
    for (const ext of exts) {
      const candidate = join(dir, cmd + ext);
      if (isExecutable(candidate)) return candidate;
    }
  }
  return null;
}
