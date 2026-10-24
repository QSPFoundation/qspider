// WebdriverIO config for the desktop standalone target: the standalone player with the fixture game bundled,
// built the way a game author builds it (tools/standalone-config overlay + `tauri build`; nx run
// player-e2e:build-desktop-standalone-e2e) into its own Cargo target dir. Runs only scenarios/standalone/.
// Run through `nx run player-e2e:e2e-standalone-desktop` (run-desktop-e2e.mjs --standalone), never `wdio run`.
import { fileURLToPath } from 'node:url';
import type { WebdriverIOConfig } from '@serenity-js/webdriverio';
import { desktopBinary, desktopConfig } from './wdio.conf';

export const config: WebdriverIOConfig = {
  ...desktopConfig({
    application: desktopBinary('src-tauri/target/e2e-standalone'),
    // The standalone player opens its bundled game by itself.
    args: [],
    identifier: 'org.qsp.e2e.standalone',
    artifactsDir: fileURLToPath(new URL('../../artifacts/desktop-standalone', import.meta.url)),
  }),
  specs: ['../../scenarios/standalone/**/*.scenario.ts'],
};
