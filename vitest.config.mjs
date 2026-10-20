import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      './apps/player/vite.config.mts',
      './apps/player-desktop/vite.config.mts',
      './apps/player-standalone/vite.config.mts',
      './libs/desktop/vite.config.mts',
      './tools/standalone-config/vitest.config.mjs',
      './apps/player-e2e/vite.config.mts',
      '!vitest.config.mjs',
    ],
  },
});
