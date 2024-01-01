/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  root: __dirname,
  build: {
    outDir: '../../dist/apps/player',
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

  worker: {
    plugins: () => [nxViteTsPaths()],
  },
});
