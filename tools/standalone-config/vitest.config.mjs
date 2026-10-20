import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'standalone-config',
    environment: 'node',
    include: ['*.spec.mjs'],
  },
});
