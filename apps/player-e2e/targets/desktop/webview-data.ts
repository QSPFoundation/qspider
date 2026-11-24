// Windows: keeping the app's WebView2 profile between scenarios (fresh-app.ts). WebView2 holds a brand-new
// profile's first request 0.3 s to 16 s on CI and an existing one's never, so instead of deleting the profile,
// the runner clears its browsing data in the running app (the debug-only e2e_clear_webview_data command) and,
// once the page shows nothing left, keeps the profile folder while it empties the rest of the app data dirs.
// Pure, so it is unit tested; fresh-app.ts does the WebDriver and file system work.
import { win32 } from 'node:path';

/** The folder WebView2 keeps its profile in, inside the user data folder the session gives it. */
export const WEBVIEW_PROFILE_DIR = 'EBWebView';

/** What the page still holds after a clear: what the next scenario would inherit if the profile were kept. */
export interface WebviewDataLeft {
  indexedDb: string[];
  localStorage: number;
  sessionStorage: number;
  /** Cache Storage entries; null where the page has no Cache Storage. */
  caches: number | null;
}

/** Each kind of data the clear left behind, worded for a warning; empty when nothing is left. */
export function webviewDataLeft(left: WebviewDataLeft): string[] {
  const problems: string[] = [];
  if (left.indexedDb.length) problems.push(`IndexedDB ${left.indexedDb.join(', ')}`);
  if (left.localStorage) problems.push(`${left.localStorage} local storage item(s)`);
  if (left.sessionStorage) problems.push(`${left.sessionStorage} session storage item(s)`);
  if (left.caches) problems.push(`${left.caches} Cache Storage cache(s)`);
  return problems;
}

/** The WebView2 profile folder of a session's user data folder (its `tauri:options.webviewOptions`). */
export function webviewProfileDir(userDataFolder: string): string {
  return win32.join(userDataFolder, WEBVIEW_PROFILE_DIR);
}

/**
 * The name of the entry of `dir` that emptying it must keep: `keep`'s own name when `keep` is directly inside
 * `dir` (Windows paths: case-insensitive, either separator), otherwise null (empty `dir` entirely).
 */
export function keptEntry(dir: string, keep: string | undefined): string | null {
  if (!keep) return null;
  const parent = win32.dirname(win32.normalize(keep));
  return parent.toLowerCase() === win32.normalize(dir).replace(/\\$/, '').toLowerCase()
    ? win32.basename(win32.normalize(keep))
    : null;
}
