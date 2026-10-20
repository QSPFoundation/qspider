import { defineConfig } from 'vitest/config';

// Unit tests for the E2E harness itself (not the E2E scenarios).
export default defineConfig({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/player-e2e',
  test: {
    name: 'player-e2e',
    environment: 'node',
    include: ['desktop/**/*.test.ts'],
  },
});
