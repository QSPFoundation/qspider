export function cleanPath(path: string): string {
  return path.replace(/\\/g, '/');
}

/**
 * True for a URL that names its own resource (`http:`, `https:`, `data:`, `blob:`, ...), as opposed to a path
 * inside the game. A scheme needs at least two characters before the colon, so a Windows drive path
 * (`C:\img\a.png`) stays a game path.
 */
export function isExternalUrl(path: string): boolean {
  return /^[a-z][a-z0-9+.-]+:/i.test(path);
}
