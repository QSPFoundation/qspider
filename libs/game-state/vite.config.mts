/// <reference types="vitest" />
import { defineConfig } from 'vite';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { browserTest } from '../../vitest.browser.mjs';

export default defineConfig({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/game-state',
  plugins: [nxViteTsPaths()],
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'game-state',
          environment: 'node',
          include: ['src/**/*.spec.ts'],
          exclude: ['**/*.browser.spec.ts', '**/node_modules/**'],
          // @qspider/utils pulls iarna-toml-esm, which ships ES modules in a CommonJS package
          server: { deps: { inline: ['iarna-toml-esm'] } },
        },
      },
      { extends: true, test: browserTest('game-state-browser', ['src/**/*.browser.spec.ts']) },
    ],
  },
});
