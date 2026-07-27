import baseConfig from '@v2/config-eslint';

export default [
  ...baseConfig,
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    /**
     * `coverage.ts` y `lasso.ts` son código MIGRADO desde `juego/src/civic`,
     * con sus tests, sin cambios de comportamiento (spec 2 §2.1). Traen 57
     * aserciones non-null que `noUncheckedIndexedAccess` obliga en recorridos
     * de anillos y grillas donde el índice es demostrablemente válido —
     * `ring[(i + 1) % ring.length]` y compañía.
     *
     * Reescribirlas significaría tocar 900 líneas de geometría probada a
     * cambio de cero comportamiento nuevo: es riesgo de corrección puro. La
     * excepción es por archivo y por regla, no global, y muere el día que
     * estos módulos se reescriban.
     *
     * Todo lo escrito para v2 —`types.ts`, `geo.ts`, `location-policy.ts`—
     * cumple la regla completa y NO está en esta lista.
     */
    files: [
      'src/coverage.ts',
      'src/lasso.ts',
      // Los tests migrados con ellos, por la misma razón.
      'src/__tests__/coverage.test.ts',
      'src/__tests__/lasso.test.ts',
      'src/__tests__/geo.test.ts',
    ],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
    },
  },
];
