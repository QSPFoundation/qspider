/// <reference types="vitest" />
import { defineConfig } from 'vite';
import { browserTest } from '../../vitest.browser.mjs';

export default defineConfig({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/desktop',
  resolve: { tsconfigPaths: true },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'desktop',
          environment: 'node',
          include: ['src/**/*.spec.ts'],
          exclude: ['**/*.browser.spec.ts', '**/node_modules/**'],
          // iarna-toml-esm ships ES modules in a CommonJS package, so Node cannot load it unbundled
          server: { deps: { inline: ['iarna-toml-esm'] } },
        },
      },
      { extends: true, test: browserTest('desktop-browser', ['src/**/*.browser.spec.ts']) },
    ],
  },
});
