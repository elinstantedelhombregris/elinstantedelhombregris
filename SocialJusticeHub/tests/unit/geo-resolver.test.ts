import { describe, it, expect } from 'vitest';
import {
  snapCoords,
  pointInPolygonFeature,
  resolveProvince,
  nearestCity,
} from '../../server/geo-resolver';

const square = {
  type: 'Feature' as const,
  properties: { name: 'Cuadrado' },
  geometry: {
    type: 'Polygon' as const,
    coordinates: [[[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]]],
  },
};

describe('snapCoords', () => {
  it('rounds to 2 decimals (~1.1 km)', () => {
    expect(snapCoords(-34.60372, -58.38159)).toEqual({ lat: -34.6, lng: -58.38 });
  });
});

describe('pointInPolygonFeature', () => {
  it('detects inside / outside', () => {
    expect(pointInPolygonFeature(5, 5, square)).toBe(true);
    expect(pointInPolygonFeature(15, 5, square)).toBe(false);
  });
});

describe('resolveProvince (real boundaries)', () => {
  it('resolves CABA with the official name', () => {
    expect(resolveProvince(-34.6037, -58.3816)).toBe('Ciudad Autónoma de Buenos Aires');
  });
  it('resolves Córdoba capital', () => {
    expect(resolveProvince(-31.4201, -64.1888)).toBe('Córdoba');
  });
  it('returns null in the ocean', () => {
    expect(resolveProvince(-40.0, -50.0)).toBeNull();
  });
});

describe('nearestCity', () => {
  const cities = [
    { name: 'Rosario', latitude: -32.9468, longitude: -60.6393 },
    { name: 'Santa Fe', latitude: -31.6107, longitude: -60.6973 },
  ];
  it('picks the closest city within 50 km', () => {
    expect(nearestCity(-32.95, -60.64, cities)).toBe('Rosario');
  });
  it('returns null when everything is farther than 50 km', () => {
    expect(nearestCity(-38.0, -68.0, cities)).toBeNull();
  });
  it('returns null with empty list', () => {
    expect(nearestCity(-32.95, -60.64, [])).toBeNull();
  });
});
