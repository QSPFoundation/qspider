import { defineConfig, devices } from '@playwright/test';
import type { SerenityFixtures, SerenityWorkerFixtures } from '@serenity-js/playwright-test';
import { INTERACTION_TIMEOUT } from '../../screenplay/support/timeouts';
import { fileURLToPath } from 'node:url';

// Preview port of apps/player (apps/player/vite.config.mts `preview.port`).
const PORT = 4300;
const baseURL = `http://localhost:${PORT}`;
const workspaceRoot = fileURLToPath(new URL('../../../..', import.meta.url));
const chromeBin = process.env['CHROME_BIN'];

// Read by screenplay/support/scenario.ts to pick this target's scenario shim.
process.env['QSPIDER_E2E_TARGET'] = 'web';

export default defineConfig<SerenityFixtures, SerenityWorkerFixtures>({
  testDir: '../../scenarios',
  testMatch: '**/*.scenario.ts',
  retries: 0,
  // Same as desktop's mocha timeout. A failing check gives up after about 15s (INTERACTION_TIMEOUT,
  // fixed polling in screenplay/support), so a scenario's steps plus one failing check fit in 45s.
  timeout: 45_000,
  workers: 1,
  fullyParallel: false,
  // A stray test.only would silently skip the rest of the suite.
  forbidOnly: true,
  outputDir: '../../artifacts/web',
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: '../../artifacts/web-report' }],
    // Serenity/JS step trace for every scenario, in the same form as on desktop.
    ['@serenity-js/playwright-test', { crew: ['@serenity-js/console-reporter'] }],
  ],
  use: {
    // Same actor name as on desktop (targets/desktop/scenario.ts).
    defaultActorName: 'Player',
    interactionTimeout: INTERACTION_TIMEOUT,
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Locally, CHROME_BIN points at a system Chromium; CI uses Playwright's own.
        launchOptions: chromeBin ? { executablePath: chromeBin } : {},
      },
    },
  ],
  webServer: {
    // Serves the production build in dist/apps/player (built by `pnpm e2e:web`).
    command: 'pnpm nx run player:preview:production',
    cwd: workspaceRoot,
    url: baseURL,
    // Never test whatever else is listening on the port: a busy port fails the run.
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
