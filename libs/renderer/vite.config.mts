/// <reference types="vitest" />
import { defineConfig } from 'vite';
import { browserTest } from '../../vitest.browser.mjs';

export default defineConfig({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/renderer',
  resolve: { tsconfigPaths: true },
  test: browserTest('renderer'),
});
