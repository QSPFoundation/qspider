/// <reference types="vitest" />
import { defineConfig } from 'vite';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { resolve } from 'node:path';

export default defineConfig({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/desktop',
  plugins: [nxViteTsPaths()],
  resolve: {
    // tests only need cleanPath; avoid pulling the whole utils barrel (toml, etc.)
    alias: {
      '@qspider/utils': resolve(import.meta.dirname, '../utils/src/path.ts'),
    },
  },
  test: {
    name: 'desktop',
    environment: 'node',
    include: ['src/**/*.spec.ts'],
  },
});
