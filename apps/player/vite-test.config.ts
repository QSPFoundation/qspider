/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsConfigPaths from 'vite-tsconfig-paths';
import pluginRewriteAll from 'vite-plugin-rewrite-all';
import istanbulPlugin from 'vite-plugin-istanbul';

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
    istanbulPlugin({
      cypress: true,
      requireEnv: false,
      checkProd: false,
      forceBuildInstrument: true,
    }),
  ],
});
