import { describe, expect, it } from 'vitest';

import { pointInPolygon, selectTerritoryPoints } from './lasso';

describe('territorial lasso', () => {
  const polygon = [
    { lat: 0, lng: 0 },
    { lat: 0, lng: 10 },
    { lat: 10, lng: 10 },
    { lat: 10, lng: 0 },
  ];

  it('includes only signals inside an irregular territory', () => {
    expect(pointInPolygon({ lat: 5, lng: 5 }, polygon)).toBe(true);
    expect(pointInPolygon({ lat: 12, lng: 5 }, polygon)).toBe(false);
    expect(selectTerritoryPoints([
      { id: 'inside', lat: 4, lng: 4, status: 'queued', category: 'light' },
      { id: 'outside', lat: -1, lng: 4, status: 'queued', category: 'light' },
    ], polygon)).toEqual(['inside']);
  });
});
