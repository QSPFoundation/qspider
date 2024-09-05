/* eslint-disable no-restricted-globals */
import { clientsClaim } from 'workbox-core';
import { getStorage } from '@qspider/env';
import { NetworkOnly, Strategy, StrategyHandler } from 'workbox-strategies';
import { Route, registerRoute } from 'workbox-routing';

const sw = self as unknown as ServiceWorkerGlobalScope;
const storage = getStorage();

clientsClaim();

sw.addEventListener('install', () => {
  // force the new service worker to unregister and replace the old one
  sw.skipWaiting();
});

const regexp = /\/qspider-files\/(.*?)\/(.*)/i;
class QspiderStrategy extends Strategy {
  protected async _handle(request: Request, handler: StrategyHandler): Promise<Response | undefined> {
    const matches = request.url.match(regexp);
    if (matches) {
      const [, gameId, path] = matches;
      const data = await storage.getGameResource(decodeURI(gameId), decodeURI(path));
      if (data) {
        const header = new Uint8Array(data.slice(0, 2));
        if (path.endsWith('.xml') && header[0] === 255 && header[1] === 254) {
          // utf16 encoded config
          const decoder = new TextDecoder('utf-16le');
          const text = decoder.decode(data);
          return new Response(text);
        }
        return new Response(data);
      } else {
        return new Response(null, { status: 404 });
      }
    }

    return await handler.fetch(request);
  }
}

registerRoute(({ request }) => request.url.includes('/qspider-files/'), new QspiderStrategy());

const networkOnlyNavigationRoute = new Route(({ request }) => {
  return request.mode === 'navigate';
}, new NetworkOnly());
registerRoute(networkOnlyNavigationRoute);
