/// <reference types="vitest" />
import { defineConfig } from 'vite';
import { browserTest } from '../../vitest.browser.mts';

export default defineConfig({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/debugger',
  resolve: { tsconfigPaths: true },
  test: browserTest('debugger'),
});
