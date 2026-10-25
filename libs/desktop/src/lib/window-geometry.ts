import type { DesktopOs } from './game-url-rules';

const platformNames: Record<string, string> = {
  macos: 'Macintosh',
  linux: 'Linux',
  windows: 'Windows',
};

/** The platform name games see, or undefined for an OS the player does not name. */
export function windowPlatformName(os: DesktopOs): string | undefined {
  return platformNames[os];
}

/** A window size is kept one pixel inside the monitor's logical size. */
export function clampToMonitor(size: number, monitorSize: number): number {
  return size > monitorSize - 1 ? monitorSize - 1 : size;
}

// solving a bug https://github.com/tauri-apps/tauri/issues/6333
export function adjustHeightFor(os: DesktopOs, height: number): number {
  return os === 'macos' ? height + 28 : height;
}
