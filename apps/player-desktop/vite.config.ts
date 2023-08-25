/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import pluginRewriteAll from 'vite-plugin-rewrite-all';

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

  plugins: [react(), nxViteTsPaths(), pluginRewriteAll()],

  worker: {
    plugins: [nxViteTsPaths()],
  },
});
