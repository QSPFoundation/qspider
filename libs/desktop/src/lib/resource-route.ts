import { cleanPath, isExternalUrl } from '@qspider/utils';
import { isGameUrlFor, type DesktopOs } from './game-url-rules';

/** The origins the app's own frontend is served from (as src-tauri/src/app_asset.rs). */
export const APP_ORIGINS = ['tauri://localhost/', 'http://tauri.localhost/', 'https://tauri.localhost/'];

export function resolveResourceUrl(baseUrl: string, path: string): string {
  return isExternalUrl(path) ? path : `${baseUrl}${cleanPath(path)}`;
}

/** Which reader serves a resource url: game files and the app's own files have a Tauri command each. */
export function resourceRoute(os: DesktopOs, url: string): 'game' | 'app-asset' | 'network' {
  if (isGameUrlFor(os, url)) return 'game';
  if (APP_ORIGINS.some((origin) => url.startsWith(origin))) return 'app-asset';
  return 'network';
}

/** Normalised as fetch would: dot segments resolved, raw spaces and non-ASCII percent-encoded. */
export function appAssetUrl(url: string): string {
  return new URL(url).href;
}

/** UTF-16LE when the bytes start with its BOM (old files written on Windows), otherwise UTF-8. */
export function decodeText(data: Uint8Array): string {
  const encoding = data[0] === 255 && data[1] === 254 ? 'utf-16le' : 'utf-8';
  return new TextDecoder(encoding).decode(data);
}
