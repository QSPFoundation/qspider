/// <reference types="vitest" />
import { defineConfig } from 'vite';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

export default defineConfig({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/debugger',
  plugins: [nxViteTsPaths()],
  test: {
    name: 'debugger',
    environment: 'node',
    include: ['src/**/*.spec.ts'],
  },
});
