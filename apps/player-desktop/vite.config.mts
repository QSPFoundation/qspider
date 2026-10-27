/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { nxReadySignal } from '@nx/vite/plugins/nx-ready-signal.plugin';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const pkg = require('../../package.json');

export default defineConfig({
  root: import.meta.dirname,
  define: {
    QSPIDER_VERSION: JSON.stringify(pkg.version),
  },
  build: {
    outDir: '../../dist/apps/player-desktop',
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  optimizeDeps: {
    exclude: ['@qsp/wasm-engine/*'],
  },
  cacheDir: '../../node_modules/.vite/player',
  publicDir: '../../public',
  server: {
    port: 4200,
    host: 'localhost',
    fs: {
      strict: false,
    },
  },
  resolve: {
    tsconfigPaths: true,
    alias: {
      '@qspider/env': resolve(import.meta.dirname, '../../libs/desktop/src/index.ts'),
    },
  },

  preview: {
    port: 4300,
    host: 'localhost',
  },

  plugins: [react(), nxReadySignal()],

  test: {
    name: 'player-desktop',
    environment: 'node',
    include: ['src/**/*.spec.ts'],
  },
});
