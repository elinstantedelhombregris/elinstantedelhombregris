import { describe, expect, it } from 'vitest';

import {
  prepareRecordLocation,
  publishedPrecision,
  validGeoPoint,
} from '../location-policy.js';
import { PRECISION_ORDER } from '../types.js';

import type { CivicAudience, CivicSensitivity, LocationPrecision, LocationRole } from '../types.js';

const ROLES: LocationRole[] = ['subject', 'capture', 'service_area', 'meeting_point'];
const SENSITIVITIES: CivicSensitivity[] = ['low', 'moderate', 'high'];
const AUDIENCES: CivicAudience[] = ['private', 'collective', 'circle', 'counterpart'];

/** La esquina del pozo. Es el caso que D7 existe para permitir. */
const ESQUINA = { lat: -34.6037, lng: -58.3816 };

describe('publishedPrecision — la matriz rol × sensibilidad × audiencia (D7)', () => {
  it('publica exacto en todas las combinaciones salvo el caso protegido', () => {
    const engrosadas: string[] = [];
    for (const role of ROLES) {
      for (const sensitivity of SENSITIVITIES) {
        for (const audience of AUDIENCES) {
          const r = publishedPrecision({ requested: 'exact', role, sensitivity, audience });
          if (r.precision !== 'exact') engrosadas.push(`${role}/${sensitivity}/${audience}`);
        }
      }
    }
    // Solo subject + high + las tres audiencias no privadas.
    expect(engrosadas.sort()).toEqual([
      'subject/high/circle',
      'subject/high/collective',
      'subject/high/counterpart',
    ]);
  });

  it('un pozo observado en la calle se publica en su punto', () => {
    const r = publishedPrecision({
      requested: 'exact',
      role: 'capture',
      sensitivity: 'low',
      audience: 'collective',
    });
    expect(r).toEqual({ precision: 'exact', coarsenedBecause: null, overridable: true });
  });

  it('un punto de reparto se publica exacto aunque el registro sea sensible', () => {
    // Sin exactitud el recurso no se puede usar: el rol manda sobre la sensibilidad.
    const r = publishedPrecision({
      requested: 'exact',
      role: 'meeting_point',
      sensitivity: 'high',
      audience: 'collective',
    });
    expect(r.precision).toBe('exact');
    expect(r.coarsenedBecause).toBeNull();
  });

  it('el caso protegido propone engrosar, lo explica, y deja rechazarlo', () => {
    const r = publishedPrecision({
      requested: 'exact',
      role: 'subject',
      sensitivity: 'high',
      audience: 'collective',
    });
    expect(r.precision).toBe('500m');
    expect(r.coarsenedBecause).toMatch(/persona/);
    expect(r.overridable).toBe(true);
  });

  it('el caso protegido en canal privado no se toca', () => {
    const r = publishedPrecision({
      requested: 'exact',
      role: 'subject',
      sensitivity: 'high',
      audience: 'private',
    });
    expect(r.precision).toBe('exact');
    expect(r.coarsenedBecause).toBeNull();
  });

  it('no engrosa lo que ya venía igual o más grueso que el piso', () => {
    for (const requested of ['500m', 'neighborhood', 'city', 'province'] as LocationPrecision[]) {
      const r = publishedPrecision({
        requested,
        role: 'subject',
        sensitivity: 'high',
        audience: 'collective',
      });
      expect(r.precision).toBe(requested);
      expect(r.coarsenedBecause).toBeNull();
    }
  });

  it('engrosa 100m al piso, igual que exact', () => {
    const r = publishedPrecision({
      requested: '100m',
      role: 'subject',
      sensitivity: 'high',
      audience: 'collective',
    });
    expect(r.precision).toBe('500m');
  });

  it('nunca devuelve una precisión más fina que la pedida', () => {
    for (const requested of PRECISION_ORDER) {
      for (const role of ROLES) {
        for (const sensitivity of SENSITIVITIES) {
          for (const audience of AUDIENCES) {
            const r = publishedPrecision({ requested, role, sensitivity, audience });
            expect(PRECISION_ORDER.indexOf(r.precision)).toBeGreaterThanOrEqual(
              PRECISION_ORDER.indexOf(requested),
            );
          }
        }
      }
    }
  });
});

describe('prepareRecordLocation', () => {
  it('deja el punto intacto cuando se publica exacto', () => {
    const r = prepareRecordLocation({
      point: ESQUINA,
      requestedPrecision: 'exact',
      role: 'capture',
      sensitivity: 'low',
      audience: 'collective',
    });
    expect(r.publicPoint).toEqual(ESQUINA);
    expect(r.publishedPrecision).toBe('exact');
    expect(r.coarsenedBecause).toBeNull();
  });

  it('corre el punto cuando el caso protegido engrosa', () => {
    const r = prepareRecordLocation({
      point: ESQUINA,
      requestedPrecision: 'exact',
      role: 'subject',
      sensitivity: 'high',
      audience: 'collective',
    });
    expect(r.publishedPrecision).toBe('500m');
    expect(r.publicPoint).not.toEqual(ESQUINA);
    expect(r.exact).toEqual(ESQUINA);
    expect(r.coarsenedBecause).toMatch(/persona/);
  });

  it('respeta el rechazo del engrosado', () => {
    const r = prepareRecordLocation({
      point: ESQUINA,
      requestedPrecision: 'exact',
      role: 'subject',
      sensitivity: 'high',
      audience: 'collective',
      overrideCoarsening: true,
    });
    expect(r.publishedPrecision).toBe('exact');
    expect(r.publicPoint).toEqual(ESQUINA);
    expect(r.coarsenedBecause).toBeNull();
  });

  it('el default es provincia y sin coordenada no hay punto público', () => {
    const r = prepareRecordLocation({ point: null });
    expect(r.publishedPrecision).toBe('province');
    expect(r.publicPoint).toBeNull();
  });

  it('descarta coordenadas fuera de WGS84', () => {
    expect(validGeoPoint({ lat: 91, lng: 0 })).toBeNull();
    expect(validGeoPoint({ lat: 0, lng: -181 })).toBeNull();
    expect(validGeoPoint({ lat: Number.NaN, lng: 0 })).toBeNull();
    expect(validGeoPoint(ESQUINA)).toEqual(ESQUINA);
  });
});
