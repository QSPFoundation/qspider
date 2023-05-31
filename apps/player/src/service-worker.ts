/* eslint-disable no-restricted-globals */
import { clientsClaim } from 'workbox-core';

const sw = self as unknown as ServiceWorkerGlobalScope;

clientsClaim();

sw.addEventListener('install', () => {
  // force the new service worker to unregister and replace the old one
  sw.skipWaiting();
});

sw.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
