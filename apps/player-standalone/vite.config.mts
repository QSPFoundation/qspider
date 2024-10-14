/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { resolve } from 'node:path';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const pkg = require('../../package.json');

export default defineConfig(({ mode }) => {
  return {
    base: '',
    root: __dirname,
    cacheDir: '../../node_modules/.vite/apps/player-standalone',
    publicDir: '../../public',

    define: {
      APP_MODE: JSON.stringify(mode === 'desktop' ? 'desktop' : 'web'),
      QSPIDER_VERSION: JSON.stringify(pkg.version),
    },

    server: {
      port: 4200,
      host: 'localhost',
    },

    preview: {
      port: 4300,
      host: 'localhost',
    },

    plugins: [react(), nxViteTsPaths()],

    build: {
      outDir: '../../dist/apps/player-standalone',
      reportCompressedSize: true,
      commonjsOptions: {
        transformMixedEsModules: true,
      },
    },

    resolve: {
      alias: {
        '@qspider/env': resolve(
          __dirname,
          mode === 'desktop' ? '../../libs/desktop/src/index.ts' : '../../libs/browser/src/index.ts',
        ),
      },
    },
  };
});
