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

// The path stops at `?` or `#`: a game may write `img.png?v=2`, which names the file `img.png`.
const regexp = /\/qspider-files\/(.*?)\/([^?#]*)/i;

const MIME_TYPES: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  bmp: 'image/bmp',
  ico: 'image/x-icon',
  css: 'text/css',
  js: 'text/javascript',
  html: 'text/html',
  htm: 'text/html',
  json: 'application/json',
  xml: 'application/xml',
  txt: 'text/plain',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
  mid: 'audio/midi',
  midi: 'audio/midi',
  mp4: 'video/mp4',
  webm: 'video/webm',
  woff: 'font/woff',
  woff2: 'font/woff2',
  ttf: 'font/ttf',
  otf: 'font/otf',
};

function contentTypeOf(path: string): string {
  const extension = path.slice(path.lastIndexOf('.') + 1).toLowerCase();
  return MIME_TYPES[extension] ?? 'application/octet-stream';
}

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
        return new Response(data, { headers: { 'Content-Type': contentTypeOf(path) } });
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
