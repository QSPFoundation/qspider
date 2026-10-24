import { defineConfig } from '@playwright/test';
import type { SerenityFixtures, SerenityWorkerFixtures } from '@serenity-js/playwright-test';
import { fileURLToPath } from 'node:url';
import base from './playwright.config';

// The web standalone target: the standalone player (apps/player-standalone) built with the fixture game in
// its game/ folder (nx run player-e2e:build-standalone-web-e2e), served as plain static files. Runs only
// scenarios/standalone/; the same web shim, Cast and OperateWebPlayer as the main web target.
const PORT = 4310;
const baseURL = `http://localhost:${PORT}`;
const workspaceRoot = fileURLToPath(new URL('../../../..', import.meta.url));

export default defineConfig<SerenityFixtures, SerenityWorkerFixtures>({
  ...base,
  testDir: '../../scenarios/standalone',
  testIgnore: undefined,
  // No global setup: the standalone game is bundled in the build, not uploaded.
  globalSetup: undefined,
  outputDir: '../../artifacts/standalone-web',
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: '../../artifacts/standalone-web-report' }],
    ['@serenity-js/playwright-test', { crew: ['@serenity-js/console-reporter'] }],
  ],
  use: { ...base.use, baseURL },
  webServer: {
    // Vite preview of dist/apps/player-standalone, run directly: `nx run player-standalone:preview` depends on
    // player-standalone:build, which would rebuild without the staged public dir and overwrite the E2E bundle.
    command: `pnpm exec vite preview -c apps/player-standalone/vite.config.mts --port ${PORT} --strictPort`,
    cwd: workspaceRoot,
    url: baseURL,
    // Never test whatever else is listening on the port: a busy port fails the run.
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
