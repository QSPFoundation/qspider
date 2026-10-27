/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/debugger',
  resolve: { tsconfigPaths: true },
  test: {
    name: 'debugger',
    environment: 'node',
    include: ['src/**/*.spec.ts'],
  },
});
