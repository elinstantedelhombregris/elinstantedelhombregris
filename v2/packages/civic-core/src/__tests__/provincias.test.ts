import { describe, expect, it } from 'vitest';

import { provinciaDelPunto } from '../provincias.js';

import type { AreaProvincia } from '../provincias.js';

/**
 * Resolver un punto a su provincia (D-001).
 *
 * Función pura: recibe el punto y las áreas ya parseadas, y devuelve un
 * nombre. No lee archivos ni sabe de la base — quien la llama resuelve el
 * nombre a un id.
 */

/** Anillo cuadrado de 10×10, cerrado, en orden GeoJSON [lng, lat]. */
const anillo = (lat0: number, lng0: number): number[][] => [
  [lng0, lat0],
  [lng0 + 10, lat0],
  [lng0 + 10, lat0 + 10],
  [lng0, lat0 + 10],
  [lng0, lat0],
];

const cuadrado = (nombre: string, lat0: number, lng0: number): AreaProvincia => ({
  nombre,
  geometria: { type: 'Polygon', coordinates: [anillo(lat0, lng0)] },
});

describe('provinciaDelPunto', () => {
  const areas = [cuadrado('Oeste', 0, 0), cuadrado('Este', 0, 10)];

  it('devuelve la provincia que contiene el punto', () => {
    expect(provinciaDelPunto({ lat: 5, lng: 5 }, areas)).toBe('Oeste');
  });

  it('distingue entre provincias linderas', () => {
    expect(provinciaDelPunto({ lat: 5, lng: 15 }, areas)).toBe('Este');
  });

  it('devuelve null para un punto fuera de todas', () => {
    expect(provinciaDelPunto({ lat: 50, lng: 50 }, areas)).toBeNull();
  });

  it('resuelve una isla de un MultiPolygon', () => {
    // Tierra del Fuego y Buenos Aires tienen islas: si el resolvedor solo
    // mirara el primer anillo, una voz cargada en una isla quedaría sin
    // provincia — que es exactamente el bug que esto viene a arreglar.
    const conIsla: AreaProvincia = {
      nombre: 'Con isla',
      geometria: {
        type: 'MultiPolygon',
        coordinates: [[anillo(0, 0)], [anillo(40, 40)]],
      },
    };
    expect(provinciaDelPunto({ lat: 45, lng: 45 }, [conIsla])).toBe('Con isla');
  });

  it('no reclama un punto que cae en un hueco', () => {
    // Un anillo interior es territorio ajeno enclavado. Contarlo como propio
    // le atribuiría voces a la provincia equivocada.
    const conHueco: AreaProvincia = {
      nombre: 'Con hueco',
      geometria: {
        type: 'Polygon',
        coordinates: [
          [
            [0, 0],
            [20, 0],
            [20, 20],
            [0, 20],
            [0, 0],
          ],
          [
            [8, 8],
            [12, 8],
            [12, 12],
            [8, 12],
            [8, 8],
          ],
        ],
      },
    };
    expect(provinciaDelPunto({ lat: 10, lng: 10 }, [conHueco])).toBeNull();
    expect(provinciaDelPunto({ lat: 3, lng: 3 }, [conHueco])).toBe('Con hueco');
  });
});
