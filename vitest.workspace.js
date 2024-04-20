import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  './apps/player/vite.config.mts',
  './apps/player-desktop/vite.config.mts',
  './apps/player-standalone/vite.config.mts',
  './apps/cl-builder/vite.config.mts',
]);
