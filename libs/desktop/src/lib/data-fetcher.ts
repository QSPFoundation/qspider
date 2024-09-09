import { cleanPath } from '@qspider/utils';
import { tauri } from '@tauri-apps/api';

export async function fetchTextContent(baseUrl: string, path: string): Promise<string> {
  const url = `${baseUrl}${cleanPath(path)}`;

  const content = await tauri.invoke<number[]>('read_resource', { url });

  const data = new Uint8Array(content);
  const encoding = content[0] === 255 && content[1] === 254 ? 'utf-16le' : 'utf-8';
  const decoder = new TextDecoder(encoding);
  const text = decoder.decode(data);
  return text;
}

export async function fetchBinaryContent(baseUrl: string, path: string): Promise<ArrayBuffer> {
  const url = `${baseUrl}${cleanPath(path)}`;

  const content = await tauri.invoke<number[]>('read_resource', { url });
  return new Uint8Array(content).buffer;
}
