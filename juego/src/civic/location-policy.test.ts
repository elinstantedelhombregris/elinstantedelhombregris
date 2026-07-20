import { describe, expect, it } from 'vitest';

import { prepareRecordLocation, sharedPrecisionForAudience, validGeoPoint } from './location-policy';

describe('location disclosure policy', () => {
  it('reprojects an exact private point before it enters the collective channel', () => {
    const exact = { lat: -32.889458, lng: -68.845839 };
    const prepared = prepareRecordLocation({
      point: exact,
      precision: 'exact',
      audience: 'collective',
      locationLabel: '  Plaza Independencia  ',
    });

    expect(prepared.sharedPrecision).toBe('100m');
    expect(prepared.publicPoint).not.toEqual(exact);
    expect(prepared.locationLabel).toBe('Plaza Independencia');
  });

  it('keeps exact precision only inside the private audience', () => {
    expect(sharedPrecisionForAudience('exact', 'private')).toBe('exact');
    expect(sharedPrecisionForAudience('exact', 'collective')).toBe('100m');
    expect(sharedPrecisionForAudience('exact', 'circle')).toBe('100m');
  });

  it('rejects invalid coordinates before either local representation is built', () => {
    expect(validGeoPoint({ lat: 91, lng: -68.8 })).toBeNull();
    expect(validGeoPoint({ lat: -32.8, lng: Number.NaN })).toBeNull();
    expect(prepareRecordLocation({ point: { lat: 91, lng: 181 } }).publicPoint).toBeNull();
  });
});
