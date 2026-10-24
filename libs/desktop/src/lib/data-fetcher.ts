import { cleanPath, isExternalUrl } from '@qspider/utils';
import { invoke } from '@tauri-apps/api/core';
import { isGameUrl } from './game-url';

/** The origins the app's own frontend is served from (as src-tauri/src/app_asset.rs). */
const APP_ORIGINS = ['tauri://localhost/', 'http://tauri.localhost/', 'https://tauri.localhost/'];

const isAppAssetUrl = (url: string): boolean => APP_ORIGINS.some((origin) => url.startsWith(origin));

async function readBytes(baseUrl: string, path: string): Promise<ArrayBuffer> {
  const url = isExternalUrl(path) ? path : `${baseUrl}${cleanPath(path)}`;
  if (isGameUrl(url)) {
    return invoke<ArrayBuffer>('read_resource', { url });
  }
  if (isAppAssetUrl(url)) {
    // Not fetch: the asset server answers a missing file with index.html (status 200), and a file of a
    // type it does not know with text/html, so a response cannot tell the two apart.
    try {
      return await invoke<ArrayBuffer>('read_app_asset', { url });
    } catch (error) {
      throw new Error(`Failed to load ${url}: ${String(error)}`);
    }
  }
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load ${url}: ${response.status}`);
  }
  return response.arrayBuffer();
}

export async function fetchTextContent(baseUrl: string, path: string): Promise<string> {
  const data = new Uint8Array(await readBytes(baseUrl, path));
  const encoding = data[0] === 255 && data[1] === 254 ? 'utf-16le' : 'utf-8';
  return new TextDecoder(encoding).decode(data);
}

export async function fetchBinaryContent(baseUrl: string, path: string): Promise<ArrayBuffer> {
  return readBytes(baseUrl, path);
}
