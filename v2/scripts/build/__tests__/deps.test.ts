import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  TOPE_DEPS_PRODUCCION,
  TOPE_DURO_CLAUDE_MD,
  cuentaEsteDirectorio,
  depsUnicasDeProduccion,
  leerPaquetes,
} from '../deps';

const aqui = dirname(fileURLToPath(import.meta.url));
const raizV2 = join(aqui, '..', '..', '..');

describe('depsUnicasDeProduccion', () => {
  it('deduplica, ordena y descarta los paquetes del propio workspace', () => {
    const unicas = depsUnicasDeProduccion([
      { nombre: '@v2/web', deps: ['zod', 'react', '@v2/shared'] },
      { nombre: '@v2/api', deps: ['zod', 'express', '@v2/db'] },
    ]);

    expect(unicas).toEqual(['express', 'react', 'zod']);
  });

  it('con cero paquetes devuelve una lista vacía', () => {
    expect(depsUnicasDeProduccion([])).toEqual([]);
  });
});

describe('el catálogo real de v2', () => {
  it('el tope de trabajo es menor que el tope duro de CLAUDE.md', () => {
    expect(TOPE_DEPS_PRODUCCION).toBeLessThan(TOPE_DURO_CLAUDE_MD);
    expect(TOPE_DURO_CLAUDE_MD).toBe(60);
  });

  it('no supera el tope de trabajo', () => {
    const unicas = depsUnicasDeProduccion(leerPaquetes(raizV2));

    expect(unicas.length).toBeLessThanOrEqual(TOPE_DEPS_PRODUCCION);
  });

  it('no cuenta las deps de las configuraciones compartidas', () => {
    // Se prueba el PREDICADO, no el resultado sobre el repo real: `packages/config/`
    // no tiene `package.json` hoy (sus configs viven en `eslint/`, `prettier/` y
    // `typescript/`, un nivel más abajo), así que `leerManifiesto` devolvería
    // `undefined` y el directorio se saltearía igual con el filtro y sin él. Un
    // assert contra `leerPaquetes(raizV2)` pasaría con la línea borrada: no
    // protegería nada. El día que `packages/config/package.json` exista, esta
    // línea es lo único que impide que sus plugins de ESLint entren al cupo de
    // producción.
    expect(cuentaEsteDirectorio('packages', 'config')).toBe(false);
    expect(cuentaEsteDirectorio('packages', 'db')).toBe(true);
    expect(cuentaEsteDirectorio('apps', 'web')).toBe(true);
  });
});
