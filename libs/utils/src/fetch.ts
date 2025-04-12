const PROXY_URL = 'https://proxy.qspider.xyz/';

export function fetchProxyFallback(url: string): Promise<Response> {
  return fetch(url).catch(() => fetch(PROXY_URL + window.btoa(encodeURI(url))));
}
