/* eslint-disable no-restricted-globals */
import { clientsClaim } from 'workbox-core';
import { CLAIM_CLIENTS_MESSAGE, getStorage } from '@qspider/env';
import { NetworkOnly, Strategy, StrategyHandler } from 'workbox-strategies';
import { Route, registerRoute } from 'workbox-routing';
import { contentTypeOf, isUtf16Le, parseQspiderFileUrl } from './qspider-files';

const sw = self as unknown as ServiceWorkerGlobalScope;
const storage = getStorage();

clientsClaim();

sw.addEventListener('install', () => {
  // force the new service worker to unregister and replace the old one
  sw.skipWaiting();
});

// A page that was still loading when this worker activated is not claimed by the clientsClaim() above; such a page
// asks for it (libs/browser/src/lib/game-files.ts).
sw.addEventListener('message', (event) => {
  if ((event.data as { type?: unknown } | null)?.type === CLAIM_CLIENTS_MESSAGE) event.waitUntil(sw.clients.claim());
});

class QspiderStrategy extends Strategy {
  protected async _handle(request: Request, handler: StrategyHandler): Promise<Response | undefined> {
    const file = parseQspiderFileUrl(request.url);
    if (file) {
      const { gameId, path } = file;
      const data = await storage.getGameResource(gameId, path);
      if (data) {
        if (path.endsWith('.xml') && isUtf16Le(data)) {
          // utf16 encoded config
          const decoder = new TextDecoder('utf-16le');
          const text = decoder.decode(data);
          return new Response(text);
        }
        const contentType = contentTypeOf(path);
        return new Response(data, contentType ? { headers: { 'Content-Type': contentType } } : undefined);
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
