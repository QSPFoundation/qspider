/// <reference types="vitest" />
import { defineConfig } from 'vite';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

export default defineConfig({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/i18n',
  plugins: [nxViteTsPaths()],
  test: {
    name: 'i18n',
    environment: 'node',
    include: ['src/**/*.spec.ts'],
  },
});
