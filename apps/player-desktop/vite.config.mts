/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { resolve } from 'node:path';

export default defineConfig({
  root: __dirname,
  build: {
    outDir: '../../dist/apps/player-desktop',
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
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
    alias: {
      '@qspider/env': resolve(__dirname, '../../libs/desktop/src/index.ts'),
    },
  },

  preview: {
    port: 4300,
    host: 'localhost',
  },

  plugins: [react(), nxViteTsPaths()],

  worker: {
    plugins: () => [nxViteTsPaths()],
  },
});
