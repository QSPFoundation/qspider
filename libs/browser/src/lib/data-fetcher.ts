import { cleanPath, fetchProxyFallback } from '@qspider/utils';

export async function fetchTextContent(baseUrl: string, path: string): Promise<string> {
  const url = `${baseUrl}${cleanPath(path)}`;
  const r = await fetchProxyFallback(url);
  if (!r.ok) throw new Error(`File not found`);
  return await r.text();
}

export async function fetchBinaryContent(baseUrl: string, path: string): Promise<ArrayBuffer> {
  const url = `${baseUrl}${cleanPath(path)}`;
  const r = await fetchProxyFallback(url);
  if (!r.ok) throw new Error(`File not found`);
  return await r.arrayBuffer();
}
