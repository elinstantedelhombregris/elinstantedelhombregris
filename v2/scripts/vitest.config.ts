import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  // root explícito: sin esto Vitest resuelve `root` contra process.cwd() (no contra este archivo) y el `include` de abajo no encuentra nada al correr `pnpm test:scripts` desde la raíz de v2.
  root: fileURLToPath(new URL('.', import.meta.url)),
  esbuild: {
    tsconfigRaw: '{}',
  },
  test: {
    environment: 'node',
    globals: false,
    include: [
      'content/__tests__/**/*.test.ts',
      'build/__tests__/**/*.test.ts',
      'radiografia/__tests__/**/*.test.ts',
      'simulacion/__tests__/**/*.test.ts',
    ],
  },
});
