/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/game-shelf',
  resolve: { tsconfigPaths: true },
  test: {
    name: 'game-shelf',
    environment: 'node',
    include: ['src/**/*.spec.ts'],
  },
});
