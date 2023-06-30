/* eslint-disable no-restricted-globals */
import { clientsClaim } from 'workbox-core';
import { WebStorage } from '@qspider/web-storage';
import { NetworkOnly, Strategy, StrategyHandler } from 'workbox-strategies';
import { Route, registerRoute } from 'workbox-routing';

const sw = self as unknown as ServiceWorkerGlobalScope;
const storage = new WebStorage();

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
