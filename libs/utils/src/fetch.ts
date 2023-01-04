const PROXY_URL = 'https://game-proxy.qspider.workers.dev/';

export function fetchProxyFallback(url: string): Promise<Response> {
  return fetch(url).then((r) => {
    if (!r.ok) return fetch(PROXY_URL + window.btoa(url));
    return r;
  });
}
