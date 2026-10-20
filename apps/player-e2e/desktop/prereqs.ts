// Prerequisite check for the desktop (tauri-driver) E2E run. No test-framework imports.
import { accessSync, constants } from 'node:fs';
import { delimiter, join } from 'node:path';

const PREREQS: Partial<Record<NodeJS.Platform, string[]>> = {
  linux: ['tauri-driver', 'WebKitWebDriver'],
  win32: ['tauri-driver', 'msedgedriver'],
};

/** Name reported when Linux has no display for the app window. */
export const DISPLAY_PREREQ = 'a display (DISPLAY or WAYLAND_DISPLAY; headless: xvfb-run -a)';

export const INSTALL_HINT =
  'Install: cargo install tauri-driver --locked, and make sure ~/.cargo/bin is on PATH; Arch: webkit2gtk-4.1 provides WebKitWebDriver; Debian/Ubuntu: webkit2gtk-driver';

/**
 * Returns the names of the prerequisites the desktop E2E needs on `platform` that are missing:
 * tools `which` can't find and, on Linux, a display when neither DISPLAY nor WAYLAND_DISPLAY is set in `env`.
 */
export function findMissingPrereqs(
  platform: NodeJS.Platform,
  which: (cmd: string) => string | null,
  env: Record<string, string | undefined>,
): string[] {
  const missing = (PREREQS[platform] ?? []).filter((cmd) => which(cmd) === null);
  if (platform === 'linux' && !env['DISPLAY'] && !env['WAYLAND_DISPLAY']) missing.push(DISPLAY_PREREQ);
  return missing;
}

/** Resolves `cmd` on PATH (honouring PATHEXT on Windows); null when not found. */
export function which(cmd: string): string | null {
  const exts = process.platform === 'win32' ? (process.env['PATHEXT'] ?? '.EXE').split(';') : [''];
  for (const dir of (process.env['PATH'] ?? '').split(delimiter)) {
    if (!dir) continue;
    for (const ext of exts) {
      const candidate = join(dir, cmd + ext);
      try {
        accessSync(candidate, constants.X_OK);
        return candidate;
      } catch {
        // not here
      }
    }
  }
  return null;
}
