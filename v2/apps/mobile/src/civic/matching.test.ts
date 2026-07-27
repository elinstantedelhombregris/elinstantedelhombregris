import { describe, expect, it } from 'vitest';

import { scoreMatch } from './matching';

describe('needs-to-resources matching', () => {
  const base = {
    needCategory: 'alimentos',
    resourceCategory: 'alimentos',
    needQuantity: 40,
    resourceQuantity: 50,
    distanceKm: 1,
    radiusKm: 5,
    needUrgency: 4,
    resourceConfidence: 0.8,
  };

  it('explains a strong eligible proposal', () => {
    const result = scoreMatch(base);
    expect(result.eligible).toBe(true);
    expect(result.score).toBeGreaterThanOrEqual(85);
    expect(result.reasons).toContain('Puede cubrir la cantidad completa');
    expect(result.reasons).toContain('Está muy cerca');
  });

  it('rejects incompatible or unreachable resources', () => {
    expect(scoreMatch({ ...base, resourceCategory: 'abrigo' })).toMatchObject({ eligible: false, score: 0 });
    expect(scoreMatch({ ...base, distanceKm: 12 })).toMatchObject({ eligible: false, score: 0 });
    expect(scoreMatch({ ...base, needQuantity: null, resourceQuantity: 0 }))
      .toMatchObject({ eligible: false, score: 0 });
  });

  it('uses distance intervals when public locations are approximate', () => {
    const overlap = scoreMatch({
      ...base,
      distanceKm: 5.2,
      distanceMinKm: 3.8,
      distanceMaxKm: 6.6,
    });
    expect(overlap.eligible).toBe(true);
    expect(overlap.reasons).toContain('Las zonas se solapan; la distancia se confirma entre las partes');

    expect(scoreMatch({
      ...base,
      distanceKm: 7,
      distanceMinKm: 5.5,
      distanceMaxKm: 8.5,
    })).toMatchObject({ eligible: false, score: 0 });
  });
});
