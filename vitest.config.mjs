import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      './apps/player/vite.config.mts',
      './apps/player-desktop/vite.config.mts',
      './apps/player-standalone/vite.config.mts',
      './libs/desktop/vite.config.mts',
      '!vitest.config.mjs',
    ],
  },
});
