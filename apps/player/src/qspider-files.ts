// The path stops at `?` or `#`: a game may write `img.png?v=2`, which names the file `img.png`.
const regexp = /\/qspider-files\/(.*?)\/([^?#]*)/i;

export const MIME_TYPES: Record<string, string> = {
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

/** The game id and the file path of a `/qspider-files/<gameId>/<path>` url, decoded; null for any other url. */
export function parseQspiderFileUrl(url: string): { gameId: string; path: string } | null {
  const matches = url.match(regexp);
  if (!matches) return null;
  const [, gameId, path] = matches;
  return { gameId: decodeURI(gameId), path: decodeURI(path) };
}

export /** The Content-Type of a known file extension; unknown ones get none (the browser decides, as before). */
function contentTypeOf(path: string): string | undefined {
  const name = path.slice(path.lastIndexOf('/') + 1);
  const dot = name.lastIndexOf('.');
  return dot === -1 ? undefined : MIME_TYPES[name.slice(dot + 1).toLowerCase()];
}

/** Whether the data starts with the UTF-16LE byte order mark (`ff fe`). */
export function isUtf16Le(data: ArrayBuffer): boolean {
  const header = new Uint8Array(data.slice(0, 2));
  return header[0] === 255 && header[1] === 254;
}
