/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { resolve } from 'node:path';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const pkg = require('../../package.json');

// E2E builds only (apps/player-e2e, targets/standalone/stage-public.ts): a staged copy of public/ with the
// fixture game in game/, relative to the workspace root. Unset, the build uses the repo's public/ as always.
const e2ePublicDir = process.env['QSPIDER_E2E_STANDALONE_PUBLIC_DIR'];

export default defineConfig(({ mode }) => {
  return {
    base: '',
    root: import.meta.dirname,
    cacheDir: '../../node_modules/.vite/apps/player-standalone',
    publicDir: e2ePublicDir ? resolve(import.meta.dirname, '../..', e2ePublicDir) : '../../public',

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
      // outDir is outside the project root, so Vite would keep stale files. Every build starts clean, so no earlier
      // build's files (an E2E fixture game or an old public/game/) are shipped.
      emptyOutDir: true,
      reportCompressedSize: true,
      commonjsOptions: {
        transformMixedEsModules: true,
      },
    },

    resolve: {
      alias: {
        '@qspider/env': resolve(
          import.meta.dirname,
          mode === 'desktop' ? '../../libs/desktop/src/index.ts' : '../../libs/browser/src/index.ts',
        ),
      },
    },
  };
});
