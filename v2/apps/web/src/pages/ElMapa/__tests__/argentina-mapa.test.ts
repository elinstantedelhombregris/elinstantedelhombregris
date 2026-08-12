import { NOMBRES_DE_PROVINCIA, PROVINCIAS_CANONICAS } from '@v2/civic-core';
import { describe, expect, it } from 'vitest';

import { PROVINCIAS_SVG } from '~/geo/pais.generated';
import { MAPA_VIEWBOX } from '~/geo/proyeccion.generated';

/**
 * Los nombres canónicos se IMPORTAN. Acá había una copia hardcodeada de las 24,
 * con un comentario que apuntaba a un archivo que ya no la tenía — y sin dueño
 * posible, porque `apps/web` no puede importar de `packages/db`. Por eso la
 * lista se mudó a `@v2/civic-core`: es dato del país, no de la base, y ahora la
 * leen el seed, el relleno, el test de la migración y este test.
 *
 * Lo que esta copia dejaba pasar no era cosmético. `MapaArgentina.tsx` matchea
 * `PROVINCIAS_SVG[].nombre` contra `geographic_locations.name` por **igualdad
 * exacta de cadena** (el `find` de `verDeCerca` y el `idPorNombre.get` de
 * `onProvincia`): si mañana cambia un nombre canónico, esa provincia deja de
 * pintarse y de abrir su popover **sin un solo error**. Este test es el único
 * aviso posible, y sólo avisa si lee la lista de verdad.
 */
describe('argentina-mapa.generated (módulo precomputado)', () => {
  it('trae las 24 provincias con los nombres canónicos, ordenadas', () => {
    expect(PROVINCIAS_SVG.map((p) => p.nombre)).toEqual(NOMBRES_DE_PROVINCIA);
    expect(NOMBRES_DE_PROVINCIA).toHaveLength(24);
  });

  it('el orden es el del castellano, y ninguna provincia sobra ni falta', () => {
    // Las dos mitades por separado: el CONJUNTO tiene que ser el canónico
    // —comparar listas ordenadas confunde «falta Chubut» con «cambió el
    // criterio de orden»— y el orden tiene que ser el que emite el generador
    // (`scripts/build/geo/capas/provincias.ts`, `localeCompare(…, 'es')`).
    const canonicas = PROVINCIAS_CANONICAS.map((p) => p.name);
    expect([...PROVINCIAS_SVG.map((p) => p.nombre)].sort()).toEqual([...canonicas].sort());
    // «Córdoba» antes que «Corrientes»: por code point es al revés.
    expect(NOMBRES_DE_PROVINCIA.indexOf('Córdoba')).toBeLessThan(
      NOMBRES_DE_PROVINCIA.indexOf('Corrientes'),
    );
  });

  it('declara un viewBox alto (formato del especimen: ~468×1000)', () => {
    const partes = MAPA_VIEWBOX.split(' ').map(Number);
    expect(partes).toHaveLength(4);
    const [x, y, w, h] = partes;
    expect(x).toBe(0);
    expect(y).toBe(0);
    expect(h).toBe(1000);
    expect(w).toBeGreaterThan(400);
    expect(w).toBeLessThan(560);
  });

  it('cada provincia tiene path bien formado y centroide dentro del viewBox', () => {
    const [, , w, h] = MAPA_VIEWBOX.split(' ').map(Number);
    for (const p of PROVINCIAS_SVG) {
      expect(p.path).toMatch(/^M[\d.,\sMLZ-]+Z$/);
      expect(p.cx).toBeGreaterThan(0);
      expect(p.cx).toBeLessThan(w ?? 0);
      expect(p.cy).toBeGreaterThan(0);
      expect(p.cy).toBeLessThan(h ?? 0);
    }
  });
});
