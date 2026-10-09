import { describe, expect, it } from 'vitest';

import { pintarAmbitos } from '../ambitos-provinciales';

import type { ColeccionProvincial } from '../ambitos-provinciales';
import type { LecturaMapa } from '~/lib/queries/civic-map';

const geometria: ColeccionProvincial = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'Mendoza' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-70, -36],
            [-66, -36],
            [-66, -32],
            [-70, -36],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { name: 'Nombre sin resolver' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-68, -34],
            [-67, -34],
            [-67, -33],
            [-68, -34],
          ],
        ],
      },
    },
  ],
};
const resumen: LecturaMapa['metadata'] = {
  total: 800,
  entregados: 100,
  completa: false,
  hasta: '2026-10-08T00:00:00Z',
  siguiente: 'cursor',
  unidad: 'registros',
  sinPunto: 800,
  porProvincia: [
    {
      provinceId: 50,
      total: 700,
      tipos: [
        { tipo: 'sueño', total: 600 },
        { tipo: 'necesidad', total: 100 },
      ],
    },
    { provinceId: null, total: 100, tipos: [{ tipo: 'sueño', total: 100 }] },
  ],
  porDia: [],
};
describe('Ámbitos provinciales sin inventar puntos', () => {
  it('pinta los totales autoritativos y conserva la geometría, aunque la página sea parcial', () => {
    const salida = pintarAmbitos(geometria, resumen, [{ id: 50, name: 'Mendoza', isoCode: null }]);
    expect(salida.features[0]?.properties.total).toBe(700);
    expect(salida.features[0]?.geometry).toBe(geometria.features[0]?.geometry);
    expect(salida.features.every((f) => f.geometry.type === 'Polygon')).toBe(true);
    expect(geometria.features[0]?.properties).toEqual({ name: 'Mendoza' });
  });
  it('jamás reparte voces nacionales entre provincias sin identificación', () => {
    const salida = pintarAmbitos(geometria, resumen, []);
    expect(
      salida.features.every((f) => f.properties.total === 0 && f.properties.provinceId === null),
    ).toBe(true);
  });
  it('respeta las clases elegidas sobre los totales del alcance completo', () => {
    const salida = pintarAmbitos(
      geometria,
      resumen,
      [{ id: 50, name: 'Mendoza', isoCode: null }],
      new Set(['deseo']),
    );
    expect(salida.features[0]?.properties.total).toBe(600);
    expect(salida.features[1]?.properties.total).toBe(0);
  });
});
