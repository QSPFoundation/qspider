/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/i18n',
  resolve: { tsconfigPaths: true },
  test: {
    name: 'i18n',
    environment: 'node',
    include: ['src/**/*.spec.ts'],
  },
});
