// Writes the Tauri config overlay the desktop E2E builds add with `tauri build -c`: the app's windows,
// each with WebView2 browser arguments that open a DevTools port (Windows only; ignored on Linux).
//   node webdriver-config.mjs <config with app.windows> <out.json>
//
// Why: msedgedriver attaches to a WebView2 app through the DevToolsActivePort file that
// `--remote-debugging-port` makes the browser write into its user data folder. msedgedriver passes that
// flag in WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS, but on the CI runner (WebView2 155) that variable never
// reached the browser of a Tauri app, which always sets its own additional browser arguments (wry): the
// browser ran with wry's arguments only, no port, no session ("DevToolsActivePort file doesn't exist").
// The user data folder msedgedriver sets (WEBVIEW2_USER_DATA_FOLDER) does apply, so the port file lands
// where msedgedriver looks. So the E2E build asks for the port itself; release builds
// never get this overlay. A config overlay replaces arrays whole (JSON merge patch), hence every
// window is copied from the given config with the arguments added.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import process from 'node:process';

// What wry passes when the app sets none (wry src/webview2/mod.rs; Tauri enables autoplay), plus the
// DevTools port: 0 lets the browser pick a free one and write it to DevToolsActivePort.
const WEBDRIVER_BROWSER_ARGS =
  '--disable-features=msWebOOUI,msPdfOOUI,msSmartScreenProtection --autoplay-policy=no-user-gesture-required --remote-debugging-port=0';

const [from, out] = process.argv.slice(2);
if (!from || !out) {
  process.stderr.write('usage: node webdriver-config.mjs <config with app.windows> <out.json>\n');
  process.exit(2);
}
const windows = JSON.parse(readFileSync(from, 'utf8'))?.app?.windows;
if (!Array.isArray(windows) || windows.length === 0) {
  process.stderr.write(`${from} has no app.windows to add the WebDriver browser arguments to\n`);
  process.exit(1);
}
const overlay = {
  app: { windows: windows.map((window) => ({ ...window, additionalBrowserArgs: WEBDRIVER_BROWSER_ARGS })) },
};
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, `${JSON.stringify(overlay, null, 2)}\n`);
