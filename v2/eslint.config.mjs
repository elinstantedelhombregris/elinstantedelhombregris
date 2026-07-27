// @ts-check
import nodeConfig from './packages/config/eslint/node.js';

/**
 * Config de la raíz de v2 — existe sólo para `scripts/`, que no es workspace de
 * pnpm y por lo tanto no lo alcanza `pnpm -r lint`. Sin esto, los cuatro scripts
 * de build de ① (sellar-head, prerender, build-og-cards, subset-fonts) shippean
 * sin `no-explicit-any`, sin `no-console` y sin `no-non-null-assertion`.
 *
 * El objeto de `ignores` global de la config compartida ignora `build/**`, que acá
 * matchearía `scripts/build/**` (los patrones de flat config son estilo gitignore
 * y matchean a cualquier profundidad). Se lo filtra y se declara uno propio.
 */
const esSoloIgnores = (config) => Object.keys(config).length === 1 && 'ignores' in config;

export default [
  {
    ignores: [
      '**/node_modules/**',
      'scripts/_archive/**',
      // Importa código de v1 (`SocialJusticeHub/shared/*`), que vive fuera del
      // universo de tipos de v2. Está excluido de `scripts/tsconfig.json` por el
      // mismo motivo; sin esta línea el projectService no lo encuentra en ningún
      // proyecto.
      'scripts/content/extraer-fuentes-planes.ts',
      // Mismo motivo: importa `arquitecto-data.ts` y `strategic-initiatives.ts`
      // de v1 directamente (verificación cruzada del canon de PLANES_SOURCES
      // contra la fuente v1). Excluido de `scripts/tsconfig.json` en el mismo
      // paso — sin esta línea el projectService tampoco lo encuentra.
      'scripts/content/__tests__/planes-sources.test.ts',
    ],
  },
  ...nodeConfig.filter((config) => !esSoloIgnores(config)),
  {
    // Scripts de migración de una sola corrida v1 → v2. Ya corrieron, su salida
    // está commiteada y la protegen guardias propias (`pnpm planes:check`,
    // `verify-blog-migration`). Se lintean igual, pero sin las dos reglas que
    // obligarían a reescribir lógica probada por 39 sitios. Los scripts NUEVOS
    // no entran acá: `no-non-null-assertion` es `error` para ellos.
    files: [
      'scripts/content/migrate-*.ts',
      'scripts/content/verify-*.ts',
      'scripts/content/repair-*.ts',
      'scripts/content/__tests__/**/*.ts',
    ],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-confusing-void-expression': 'off',
    },
  },
];
