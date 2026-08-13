import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
    /**
     * El tercer patrón no es redundante: `pnpm test:unit` corre con
     * `--dir src`, y vitest resuelve los globos de `include` **relativos a
     * `dir`**, no a la raíz del paquete. Con sólo `src/**` y `tests/**`, un
     * test unitario adentro de `src/` se busca en `src/src/**` y no se
     * encuentra nunca: `test:unit` pasaba en verde por `--passWithNoTests`,
     * afirmando sobre cero archivos. `**\/__tests__\/**` sí matchea desde `src`
     * y desde la raíz, así que las dos invocaciones ven los mismos archivos.
     */
    include: ['src/**/*.test.ts', 'tests/**/*.test.ts', '**/__tests__/**/*.test.ts'],
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
