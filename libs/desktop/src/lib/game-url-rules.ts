/** The value of `platform()` from `@tauri-apps/plugin-os` ('windows', 'linux', 'macos', ...). */
export type DesktopOs = string;

export function gameUrlBaseFor(os: DesktopOs): string {
  return os === 'windows' ? 'https://qsp.localhost/' : 'qsp://localhost/';
}

export function buildGameUrlFor(os: DesktopOs, uuid: string): string {
  return `${gameUrlBaseFor(os)}${uuid}/`;
}

export function isGameUrlFor(os: DesktopOs, url: string): boolean {
  return url.startsWith(gameUrlBaseFor(os));
}

/** Detects pre-v2 game urls: `qsp://<uuid>/…` and `https://qsp.<uuid>/…`. */
export function isLegacyGameUrl(url: string, uuid: string): boolean {
  return url.startsWith(`qsp://${uuid}/`) || url.startsWith(`https://qsp.${uuid}/`);
}

/** Windows serves game files over https://qsp.localhost, so only linux/macos need the XHR shim. */
export function shouldShimXhrFor(os: DesktopOs, baseUrl: string): boolean {
  return isGameUrlFor(os, baseUrl) && os !== 'windows';
}
