/** Where the service worker serves an imported game's files from IndexedDB (see WebStorage.prepareLoadConfig). */
const SERVED_BY_WORKER = '/qspider-files/';

/**
 * The message a page posts to the active service worker when that worker does not control it: the worker answers
 * with clients.claim(). The worker's own claim at activation skips a page that was still loading then.
 */
export const CLAIM_CLIENTS_MESSAGE = 'qspider:claim-clients';

/** How long a game waits for the service worker to take control of the page. */
const CONTROL_TIMEOUT_MS = 10_000;

/**
 * Resolves once the game files under `baseUrl` can be fetched. Files under /qspider-files/ exist only in the
 * service worker: on a first visit the page may load before the worker controls it, and those requests would
 * reach the server instead (which answers with the app's HTML). Such a game waits until the worker controls the
 * page; it fails with a clear error if that does not happen in time. Other games resolve at once.
 */
export async function whenGameFilesReady(baseUrl: string): Promise<void> {
  if (!new URL(baseUrl, window.location.href).pathname.startsWith(SERVED_BY_WORKER)) return;
  const container = 'serviceWorker' in navigator ? navigator.serviceWorker : undefined;
  if (!container) throw new Error('This browser cannot play imported games: it has no service worker support');
  if (container.controller) return;

  let onChange: (() => void) | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      new Promise<void>((resolve) => {
        onChange = () => {
          if (container.controller) resolve();
        };
        // `ready` is an active worker, not yet one in control: control comes with its clients.claim(),
        // which fires controllerchange. The timeout below stays as a backstop.
        container.addEventListener('controllerchange', onChange);
        void container.ready.then((registration) => {
          onChange?.();
          // Active, yet not in control: its claim at activation missed this page, so ask it to claim again.
          if (!container.controller) registration.active?.postMessage({ type: CLAIM_CLIENTS_MESSAGE });
        });
      }),
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error('The player is not ready to serve this game yet: reload the page and try again')),
          CONTROL_TIMEOUT_MS,
        );
      }),
    ]);
  } finally {
    if (onChange) container.removeEventListener('controllerchange', onChange);
    clearTimeout(timer);
  }
}
