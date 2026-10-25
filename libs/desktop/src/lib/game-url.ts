import { platform } from '@tauri-apps/plugin-os';
import { buildGameUrlFor, gameUrlBaseFor, isGameUrlFor } from './game-url-rules';

export { isLegacyGameUrl } from './game-url-rules';

export function gameUrlBase(): string {
  return gameUrlBaseFor(platform());
}

export function buildGameUrl(uuid: string): string {
  return buildGameUrlFor(platform(), uuid);
}

export function isGameUrl(url: string): boolean {
  return isGameUrlFor(platform(), url);
}
