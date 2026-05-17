import { defineConfig } from 'vitest/config';

export default defineConfig({
  esbuild: {
    tsconfigRaw: '{}',
  },
  test: {
    environment: 'node',
    globals: false,
    include: ['content/__tests__/**/*.test.ts'],
  },
});
