import { describe, expect, it } from 'vitest';

import { MAPA_VIEWBOX, PROVINCIAS_SVG } from '../argentina-mapa.generated';

/** Nombres canónicos del seed de geographic_locations (packages/db/scripts/seed-provinces.ts). */
const NOMBRES_CANONICOS = [
  'Buenos Aires',
  'Catamarca',
  'Chaco',
  'Chubut',
  'Ciudad Autónoma de Buenos Aires',
  'Córdoba',
  'Corrientes',
  'Entre Ríos',
  'Formosa',
  'Jujuy',
  'La Pampa',
  'La Rioja',
  'Mendoza',
  'Misiones',
  'Neuquén',
  'Río Negro',
  'Salta',
  'San Juan',
  'San Luis',
  'Santa Cruz',
  'Santa Fe',
  'Santiago del Estero',
  'Tierra del Fuego',
  'Tucumán',
];

describe('argentina-mapa.generated (módulo precomputado)', () => {
  it('trae las 24 provincias con los nombres canónicos de la DB, ordenadas', () => {
    expect(PROVINCIAS_SVG.map((p) => p.nombre)).toEqual(NOMBRES_CANONICOS);
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
