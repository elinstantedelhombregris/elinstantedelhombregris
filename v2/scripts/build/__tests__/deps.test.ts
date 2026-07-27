import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  RUTA_MOVIL,
  TOPE_DEPS_MOVIL,
  TOPE_DEPS_PRODUCCION,
  TOPE_DURO_CLAUDE_MD,
  buscarManifiestos,
  cuentaEsteDirectorio,
  depsUnicasDeProduccion,
  leerPaquetes,
  separarPorPresupuesto,
} from '../deps';

const aqui = dirname(fileURLToPath(import.meta.url));
const raizV2 = join(aqui, '..', '..', '..');

describe('depsUnicasDeProduccion', () => {
  it('deduplica, ordena y descarta los paquetes del propio workspace', () => {
    const unicas = depsUnicasDeProduccion([
      { nombre: '@v2/web', ruta: 'apps/web', deps: ['zod', 'react', '@v2/shared'] },
      { nombre: '@v2/api', ruta: 'apps/api', deps: ['zod', 'express', '@v2/db'] },
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

  it('la plataforma no supera su tope de trabajo', () => {
    const { plataforma } = separarPorPresupuesto(leerPaquetes(raizV2));

    expect(depsUnicasDeProduccion(plataforma).length).toBeLessThanOrEqual(TOPE_DEPS_PRODUCCION);
  });

  it('el móvil no supera el suyo', () => {
    const { movil } = separarPorPresupuesto(leerPaquetes(raizV2));

    // Si esto se rompe porque `apps/mobile` dejó de existir, el guardia estaría
    // pasando en verde sin medir nada.
    expect(movil.length).toBe(1);
    expect(depsUnicasDeProduccion(movil).length).toBeLessThanOrEqual(TOPE_DEPS_MOVIL);
  });

  it('los dos presupuestos son disjuntos y cubren todo', () => {
    const paquetes = leerPaquetes(raizV2);
    const { plataforma, movil } = separarPorPresupuesto(paquetes);

    expect(plataforma.length + movil.length).toBe(paquetes.length);
    expect(plataforma.some((p) => p.ruta === RUTA_MOVIL)).toBe(false);
  });

  it('no cuenta las deps de las configuraciones compartidas', () => {
    // El predicado en sí. `packages/config/` no tiene `package.json` propio (sus
    // configs viven un nivel más abajo: `eslint/`, `prettier/`, `typescript/`).
    // OJO: en el camino real (`leerPaquetes`) este predicado se evalúa ANTES de
    // bajar a esa carpeta, así que el `continue` corta ahí mismo — esos tres
    // manifiestos anidados nunca se abren, ni se "descubren y después se
    // excluyen". Los dos tests siguientes prueban cosas distintas: que
    // `buscarManifiestos` puede bajar a un manifiesto anidado si se la llama
    // directo (bypaseando este filtro), y que por el camino real ese paquete
    // no aparece.
    expect(cuentaEsteDirectorio('packages', 'config')).toBe(false);
    expect(cuentaEsteDirectorio('packages', 'db')).toBe(true);
    expect(cuentaEsteDirectorio('apps', 'web')).toBe(true);
  });

  it('el descubrimiento encuentra manifiestos anidados un nivel más abajo (packages/config/*)', () => {
    // `buscarManifiestos` no aplica `cuentaEsteDirectorio` — es el paso de
    // descubrimiento puro. Llamado directo sobre `packages/config` (bypaseando el
    // filtro de `leerPaquetes`, que ni siquiera llegaría a recorrerlo) prueba que
    // el recorrido SÍ baja a `packages/config/eslint/package.json` y lee sus
    // `dependencies` reales — nueve paquetes de ESLint, no cero.
    const encontrados = buscarManifiestos(join(raizV2, 'packages', 'config'));
    const configEslint = encontrados.find((paquete) => paquete.nombre === '@v2/config-eslint');

    expect(configEslint).toBeDefined();
    expect(configEslint?.deps).toContain('@typescript-eslint/eslint-plugin');
    expect(configEslint?.deps.length).toBeGreaterThan(0);
  });

  it('el filtro excluye lo que el descubrimiento encontró', () => {
    // Complemento del test anterior: contra el camino real (`leerPaquetes`, que sí
    // aplica `cuentaEsteDirectorio`), ni el paquete ni sus deps aparecen. Si se
    // borra el filtro (o el `if` que lo usa en `leerPaquetes`), este test se pone
    // en rojo porque el descubrimiento recursivo SÍ encuentra `packages/config/*`.
    const paquetes = leerPaquetes(raizV2);
    expect(paquetes.some((paquete) => paquete.nombre === '@v2/config-eslint')).toBe(false);

    const unicas = depsUnicasDeProduccion(paquetes);
    expect(unicas).not.toContain('@typescript-eslint/eslint-plugin');
  });
});
