/// <reference types="vitest" />
import { defineConfig } from 'vite';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

export default defineConfig({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/game-shelf',
  plugins: [nxViteTsPaths()],
  test: {
    name: 'game-shelf',
    environment: 'node',
    include: ['src/**/*.spec.ts'],
  },
});
