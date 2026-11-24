// Windows: keeping the app's WebView2 profile between scenarios (fresh-app.ts). WebView2 holds a brand-new
// profile's first request 0.3 s to 16 s on CI and an existing one's never, so instead of deleting the profile,
// the runner has the running app clear its browsing data (the debug-only e2e_clear_webview_data command: the
// webview goes to about:blank first, so no app code is left to write after the clear, then to
// about:blank#cleared or #failed) and keeps the profile folder while it empties the rest of the app data dirs.
// Pure, so it is unit tested; fresh-app.ts does the WebDriver and file system work.
import { win32 } from 'node:path';

/** The folder WebView2 keeps its profile in, inside the user data folder the session gives it. */
export const WEBVIEW_PROFILE_DIR = 'EBWebView';

/** Where the webview ends up once e2e_clear_webview_data is done (src-tauri/src/e2e.rs clear_outcome_url). */
export const CLEARED_URL = 'about:blank#cleared';
export const CLEAR_FAILED_URL = 'about:blank#failed';

/** What the webview's URL says about the clear: done, failed, or not over yet. */
export function clearOutcome(url: string): 'cleared' | 'failed' | 'pending' {
  if (url === CLEARED_URL) return 'cleared';
  if (url === CLEAR_FAILED_URL) return 'failed';
  return 'pending';
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
