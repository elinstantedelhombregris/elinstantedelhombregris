import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  AREA_MINIMA,
  anillosDe,
  area,
  caminoDe,
  proyectar,
  rdp,
  simplificarAnillo,
  simplificarProvincias,
  type Punto,
} from '../../geo/simplificar-provincias.js';

/** Un cuadrado de 10 × 10, cerrado, con puntos casi alineados en cada lado. */
const CUADRADO: Punto[] = [
  [0, 0],
  [5, 0.05],
  [10, 0],
  [10.04, 5],
  [10, 10],
  [5, 9.97],
  [0, 10],
  [0.03, 5],
  [0, 0],
];

describe('simplificar las provincias de Ver', () => {
  it('el RDP saca los puntos dentro de la tolerancia y deja las puntas', () => {
    expect(
      rdp(
        [
          [0, 0],
          [1, 0.1],
          [2, 0],
        ],
        0.16,
      ),
    ).toEqual([
      [0, 0],
      [2, 0],
    ]);
    expect(
      rdp(
        [
          [0, 0],
          [1, 1],
          [2, 0],
        ],
        0.16,
      ),
    ).toHaveLength(3);
  });

  it('un anillo cerrado no colapsa: queda el cuadrado, sin el punto repetido', () => {
    const simple = simplificarAnillo(CUADRADO, 0.16);
    expect(simple).toEqual([
      [0, 0],
      [10, 0],
      [10, 10],
      [0, 10],
    ]);
    expect(area(simple)).toBeCloseTo(100);
  });

  it('el camino lleva un decimal, cierra con Z y no repite puntos seguidos', () => {
    expect(
      caminoDe([
        [
          [0, 0],
          [0.01, 0.02],
          [10, 0],
          [10, 10],
        ],
      ]),
    ).toBe('M0.0 0.0 10.0 0.0 10.0 10.0Z');
  });

  it('descarta un islote chico y deja siempre el anillo más grande', () => {
    // Un grado de lado a 38° S son unos 79 × 100 unidades; el islote, una centésima.
    const grande = [
      [-65, -30],
      [-64, -30],
      [-64, -31],
      [-65, -31],
      [-65, -30],
    ];
    const islote = [
      [-60, -30],
      [-59.99, -30],
      [-59.99, -30.01],
      [-60, -30.01],
      [-60, -30],
    ];
    const anillos = anillosDe({ type: 'MultiPolygon', coordinates: [[islote], [grande]] }, 0.16);
    expect(anillos).toHaveLength(1);
    expect(area(anillos[0] ?? [])).toBeGreaterThan(AREA_MINIMA);
    const solo = anillosDe({ type: 'Polygon', coordinates: [islote] }, 0.16);
    expect(solo).toHaveLength(1);
  });

  it('la proyección deja al país adentro del viewBox 0 0 166 340', () => {
    const [x0, y0] = proyectar([-73.57, -21.78]);
    const [x1, y1] = proyectar([-53.64, -55.06]);
    expect(Math.min(x0, x1)).toBeGreaterThan(0);
    expect(Math.max(x0, x1)).toBeLessThan(166);
    expect(Math.min(y0, y1)).toBeGreaterThan(0);
    expect(Math.max(y0, y1)).toBeLessThan(340);
  });

  it('una provincia sin ISO canónico frena el script', () => {
    expect(() =>
      simplificarProvincias({
        features: [
          {
            properties: { name: 'Provincia inventada' },
            geometry: { type: 'Polygon', coordinates: [[]] },
          },
        ],
      }),
    ).toThrow(/no está en PROVINCIAS_CANONICAS/);
  });

  it('el archivo commiteado tiene las 24 provincias, con su ISO, y es liviano', () => {
    const aqui = dirname(fileURLToPath(import.meta.url));
    const ruta = join(
      aqui,
      '../../../apps/web/src/pages/MiArgentinaIdeal/ver/provincias-simples.json',
    );
    const texto = readFileSync(ruta, 'utf8');
    const provincias = JSON.parse(texto) as { nombre: string; iso: string; d: string }[];
    expect(provincias).toHaveLength(24);
    expect(new Set(provincias.map((p) => p.iso)).size).toBe(24);
    for (const p of provincias) expect(p.d).toMatch(/^M[\d. ]+Z(M[\d. ]+Z)*$/);
    expect(texto.length).toBeLessThan(48_000);
  });
});
