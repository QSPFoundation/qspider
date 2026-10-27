/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/importers',
  resolve: { tsconfigPaths: true },
  test: {
    name: 'importers',
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    // iarna-toml-esm ships ES modules in a CommonJS package, so Node cannot load it unbundled
    server: { deps: { inline: ['iarna-toml-esm'] } },
  },
});
