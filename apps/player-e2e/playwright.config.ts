import { defineConfig, devices } from '@playwright/test';
import { fileURLToPath } from 'node:url';

// Preview port of apps/player (apps/player/vite.config.mts `preview.port`).
const PORT = 4300;
const baseURL = `http://localhost:${PORT}`;
const workspaceRoot = fileURLToPath(new URL('../..', import.meta.url));
const chromeBin = process.env['CHROME_BIN'];

export default defineConfig({
  testDir: './web',
  retries: 0,
  workers: 1,
  fullyParallel: false,
  forbidOnly: !!process.env['CI'],
  outputDir: 'artifacts/web',
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'artifacts/web-report' }]],
  use: {
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
    reuseExistingServer: !process.env['CI'],
    timeout: 180_000,
  },
});
