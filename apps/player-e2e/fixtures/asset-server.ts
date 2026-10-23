// A tiny static server for the files a game names by an absolute http URL (`$BACKIMAGE = 'http://...'`, `PLAY
// 'http://...'`, a game script's XHR). Started once per run by the web global setup and by the desktop wdio
// config (inside the runner's private session), stopped with the run. It binds 127.0.0.1 only and answers every
// request with `Access-Control-Allow-Origin: *`: the files are fetched by XHR from another origin (the page, or
// `qsp://localhost` on desktop). The port is fixed because the fixture game spells the URL. A busy port fails
// the run loudly: the web global setup throws, and the desktop config wraps the error in a SevereServiceError
// (WDIO ignores any other error from onPrepare). Keep this module free of test-framework imports: both runners load it.
import { createServer, type Server } from 'node:http';
import { quietWav } from './resource-assets';

export const ASSET_SERVER = {
  host: '127.0.0.1',
  port: 47631,
  /** The URLs the resources game spells (guarded in build-fixtures.spec.ts). */
  paths: { image: '/ext.png', sound: '/ext.wav', text: '/ext.txt' },
  /** The body of `paths.text`: what the game script's XHR must read back. */
  text: 'XHR EXTERNAL TEXT',
  /** Seconds of the wav: long enough that nothing ends by itself during a scenario. */
  soundSeconds: 20,
} as const;

const PNG_1X1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
);

/** The absolute URL of one of the served files. */
export function assetUrl(path: string): string {
  return `http://${ASSET_SERVER.host}:${ASSET_SERVER.port}${path}`;
}

/** Starts the server; resolves once it listens. Call `stopAssetServer` with the result. */
export function startAssetServer(): Promise<Server> {
  const files: Record<string, [type: string, body: Uint8Array]> = {
    [ASSET_SERVER.paths.image]: ['image/png', PNG_1X1],
    [ASSET_SERVER.paths.sound]: ['audio/wav', quietWav(ASSET_SERVER.soundSeconds, 440)],
    [ASSET_SERVER.paths.text]: ['text/plain', Buffer.from(ASSET_SERVER.text)],
  };
  const server = createServer((request, response) => {
    const file = files[new URL(request.url ?? '/', 'http://x').pathname];
    const headers = { 'Access-Control-Allow-Origin': '*' };
    if (!file) {
      response.writeHead(404, headers).end();
      return;
    }
    response.writeHead(200, { ...headers, 'Content-Type': file[0], 'Content-Length': file[1].length }).end(file[1]);
  });
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(ASSET_SERVER.port, ASSET_SERVER.host, () => resolve(server));
  });
}

/** Stops the server and drops its open connections. */
export function stopAssetServer(server: Server): Promise<void> {
  return new Promise((resolve) => {
    server.close(() => resolve());
    server.closeAllConnections();
  });
}
