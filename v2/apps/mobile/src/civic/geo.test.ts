import { describe, expect, it } from 'vitest';

import { haversineKm, obfuscatePoint, publicLocation } from './geo';

describe('public civic geography', () => {
  const mendoza = { lat: -32.8895, lng: -68.8458 };

  it('keeps exact coordinates only when explicitly requested', () => {
    expect(obfuscatePoint(mendoza, 'exact')).toEqual(mendoza);
  });

  it('publishes a deterministic lower-precision cell', () => {
    const a = obfuscatePoint(mendoza, '500m');
    const b = obfuscatePoint(mendoza, '500m');
    expect(a).toEqual(b);
    expect(a).not.toEqual(mendoza);
    expect(haversineKm(mendoza, a!)).toBeLessThan(0.5);
  });

  it('uses the same authoritative grid as the server', () => {
    expect(obfuscatePoint({ lat: -32.8895731, lng: -68.8498124 }, '100m')).toEqual({
      lat: -32.889867,
      lng: -68.849962,
    });
  });

  it('preserves a human label without inventing a point', () => {
    expect(publicLocation(null, 'neighborhood', 'Barrio La Favorita')).toEqual({
      point: null,
      precision: 'neighborhood',
      label: 'Barrio La Favorita',
    });
  });
});
