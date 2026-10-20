import { platform } from '@tauri-apps/plugin-os';

export function gameUrlBase(): string {
  return platform() === 'windows' ? 'https://qsp.localhost/' : 'qsp://localhost/';
}

export function buildGameUrl(uuid: string): string {
  return `${gameUrlBase()}${uuid}/`;
}

export function isGameUrl(url: string): boolean {
  return url.startsWith(gameUrlBase());
}

/** Detects pre-v2 game urls: `qsp://<uuid>/…` and `https://qsp.<uuid>/…`. */
export function isLegacyGameUrl(url: string, uuid: string): boolean {
  return url.startsWith(`qsp://${uuid}/`) || url.startsWith(`https://qsp.${uuid}/`);
}
