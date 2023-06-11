const PROXY_URL = 'https://game-proxy.qspider.workers.dev/';

export function fetchProxyFallback(url: string): Promise<Response> {
  return fetch(url).catch(() => fetch(PROXY_URL + window.btoa(url)));
}
