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

// A page load always asks the server, even while the browser's HTTP cache still holds the page: GitHub Pages
// serves index.html with max-age=600, so a load right after a deploy would otherwise run the previous build.
// The revalidation is a conditional request, answered with 304 while the page is unchanged.
// Workbox drops `fetchOptions` for navigation requests, so the request is rebuilt with the cache mode instead
// (a Request built from a navigation request with an init gets mode 'same-origin').
const revalidatePage = {
  requestWillFetch: async ({ request }: { request: Request }) => new Request(request, { cache: 'no-cache' }),
};
const networkOnlyNavigationRoute = new Route(
  ({ request }) => {
    return request.mode === 'navigate';
  },
  new NetworkOnly({ plugins: [revalidatePage] }),
);
registerRoute(networkOnlyNavigationRoute);
