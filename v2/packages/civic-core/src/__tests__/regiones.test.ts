import { describe, expect, it } from 'vitest';

import { PROVINCIAS_CANONICAS } from '../provincias-canonicas.js';
import { REGIONES, regionDe } from '../regiones.js';

describe('regiones', () => {
  it('cada una de las 24 provincias tiene región', () => {
    expect(PROVINCIAS_CANONICAS).toHaveLength(24);
    for (const p of PROVINCIAS_CANONICAS) expect(regionDe(p.isoCode), p.name).not.toBeNull();
  });

  it('las seis regiones tienen provincias', () => {
    const usadas = new Set(PROVINCIAS_CANONICAS.map((p) => regionDe(p.isoCode)));
    for (const r of REGIONES) expect(usadas.has(r), r).toBe(true);
  });

  it('La Pampa va en Centro y la Ciudad en Buenos Aires', () => {
    expect(regionDe('AR-L')).toBe('Centro');
    expect(regionDe('AR-C')).toBe('Buenos Aires');
    expect(regionDe(null)).toBeNull();
    expect(regionDe('AR-ZZ')).toBeNull();
  });
});
