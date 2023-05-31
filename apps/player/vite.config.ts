/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsConfigPaths from 'vite-tsconfig-paths';
import pluginRewriteAll from 'vite-plugin-rewrite-all';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  cacheDir: '../../node_modules/.vite/player',
  publicDir: '../../public',
  server: {
    port: 4200,
    host: 'localhost',
  },

  preview: {
    port: 4300,
    host: 'localhost',
  },

  plugins: [
    react(),
    viteTsConfigPaths({
      root: '../../',
    }),
    pluginRewriteAll(),
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
    plugins: [
      viteTsConfigPaths({
        root: '../../',
      }),
    ],
  },
});
