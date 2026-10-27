/// <reference types="vitest" />
import { defineConfig } from 'vite';
import { browserTest } from '../../vitest.browser.mjs';

export default defineConfig({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/html-renderer',
  resolve: { tsconfigPaths: true },
  test: browserTest('html-renderer'),
});
