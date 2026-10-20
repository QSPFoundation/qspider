// Prerequisite check for the desktop (tauri-driver) E2E run. No test-framework imports.
import { accessSync, constants } from 'node:fs';
import { delimiter, join } from 'node:path';

const PREREQS: Partial<Record<NodeJS.Platform, string[]>> = {
  linux: ['tauri-driver', 'WebKitWebDriver'],
  win32: ['tauri-driver', 'msedgedriver'],
};

export const INSTALL_HINT =
  'Install: cargo install tauri-driver --locked; Arch: webkit2gtk-4.1 provides WebKitWebDriver; Debian/Ubuntu: webkit2gtk-driver';

/** Returns the names of the tools the desktop E2E needs on `platform` that `which` can't find. */
export function findMissingPrereqs(platform: NodeJS.Platform, which: (cmd: string) => string | null): string[] {
  return (PREREQS[platform] ?? []).filter((cmd) => which(cmd) === null);
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
