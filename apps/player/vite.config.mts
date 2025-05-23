/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { VitePWA } from 'vite-plugin-pwa';
import { resolve } from 'node:path';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const pkg = require('../../package.json');

export default defineConfig({
  base: '',
  root: __dirname,
  define: {
    QSPIDER_VERSION: JSON.stringify(pkg.version),
  },
  build: {
    outDir: '../../dist/apps/player',
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

  preview: {
    port: 4300,
    host: 'localhost',
  },

  plugins: [
    react(),
    nxViteTsPaths(),
    VitePWA({
      srcDir: 'src',
      filename: 'service-worker.ts',
      strategies: 'injectManifest',
      injectRegister: false,
      manifest: false,
      injectManifest: {
        injectionPoint: '',
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  resolve: {
    alias: {
      '@qspider/env': resolve(__dirname, '../../libs/browser/src/index.ts'),
      '@qspider/utils': resolve(__dirname, '../../libs/utils/src/index.ts'),
    },
  },

  worker: {
    plugins: () => [nxViteTsPaths()],
  },
});
