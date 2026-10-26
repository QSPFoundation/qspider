import { playwright } from '@vitest/browser-playwright';
import type { UserConfig } from 'vitest/config';

/**
 * Shared Vitest browser-mode setup (headless Chromium via Playwright) for libraries that need a real DOM.
 * Locally, CHROME_BIN picks the Chromium binary; in CI it is unset and Playwright's own Chromium runs.
 */
export function browserTest(name: string, include: string[] = ['src/**/*.spec.{ts,tsx}']): UserConfig['test'] {
  return {
    name,
    include,
    browser: {
      enabled: true,
      headless: true,
      provider: playwright({ launchOptions: { executablePath: process.env['CHROME_BIN'] } }),
      instances: [{ browser: 'chromium' }],
    },
  };
}
