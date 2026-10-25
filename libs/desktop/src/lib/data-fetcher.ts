import { invoke } from '@tauri-apps/api/core';
import { platform } from '@tauri-apps/plugin-os';
import { appAssetUrl, decodeText, resolveResourceUrl, resourceRoute } from './resource-route';

async function readBytes(baseUrl: string, path: string): Promise<ArrayBuffer> {
  const url = resolveResourceUrl(baseUrl, path);
  const route = resourceRoute(platform(), url);
  if (route === 'game') {
    return invoke<ArrayBuffer>('read_resource', { url });
  }
  if (route === 'app-asset') {
    // Not fetch: the asset server answers a missing file with index.html (status 200), and a file of a
    // type it does not know with text/html, so a response cannot tell the two apart.
    try {
      return await invoke<ArrayBuffer>('read_app_asset', { url: appAssetUrl(url) });
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
  return decodeText(new Uint8Array(await readBytes(baseUrl, path)));
}

export async function fetchBinaryContent(baseUrl: string, path: string): Promise<ArrayBuffer> {
  return readBytes(baseUrl, path);
}
