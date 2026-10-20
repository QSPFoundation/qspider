import { cleanPath } from '@qspider/utils';
import { invoke } from '@tauri-apps/api/core';
import { isGameUrl } from './game-url';

async function readBytes(baseUrl: string, path: string): Promise<ArrayBuffer> {
  const url = `${baseUrl}${cleanPath(path)}`;
  if (isGameUrl(url)) {
    return invoke<ArrayBuffer>('read_resource', { url });
  }
  const response = await fetch(url);
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
