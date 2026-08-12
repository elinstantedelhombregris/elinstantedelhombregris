import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
    include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
    /**
     * La suite de faltas crea más de seis en una corrida, y el techo real del
     * canal son seis por hora (spec §2.6). Se sube acá y no en el código para
     * que el default de producción siga siendo el de la spec — hay una guarda
     * en `faltas-flows.test.ts` que lo afirma.
     */
    env: { FALTAS_POR_HORA: '500' },
    testTimeout: 15_000,
    hookTimeout: 15_000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      exclude: ['**/dist/**', '**/*.config.*', '**/index.ts'],
    },
  },
  resolve: {
    alias: {
      '~': new URL('./src', import.meta.url).pathname,
    },
  },
});
