import { describe, expect, it } from 'vitest';

import { prepareRecordLocation, publishedPrecision, validGeoPoint } from './location-policy';

/**
 * La política de exactitud, desde el lado de la app de campo.
 *
 * La matriz completa (rol × sensibilidad × audiencia) la cubren los tests de
 * `@v2/civic-core`, que es donde vive la regla. Lo que se prueba ACÁ es que la
 * app la consume de verdad y que sus tres casos reales caen donde deben.
 *
 * Este archivo antes afirmaba lo contrario: que `exact` se degradaba a `100m`
 * en todo canal colectivo. Esa regla se reemplazó (D7) porque un pozo, un
 * semáforo roto o un punto de reparto no sirven a 100 metros de distancia.
 */
const PLAZA = { lat: -32.889458, lng: -68.845839 };

describe('la política de exactitud, desde el móvil', () => {
  it('una observación se publica en su punto exacto', () => {
    // Rol `capture`: dónde estaba parado quien vio la cosa. Es la esquina del
    // problema, no la casa de nadie.
    const prepared = prepareRecordLocation({
      point: PLAZA,
      requestedPrecision: 'exact',
      role: 'capture',
      sensitivity: 'low',
      audience: 'collective',
      locationLabel: '  Plaza Independencia  ',
    });

    expect(prepared.publishedPrecision).toBe('exact');
    expect(prepared.publicPoint).toEqual(PLAZA);
    expect(prepared.coarsenedBecause).toBeNull();
    expect(prepared.locationLabel).toBe('Plaza Independencia');
  });

  it('un punto de reparto se publica exacto aunque el registro sea sensible', () => {
    // Manda el rol, no la etiqueta de sensibilidad: sin exactitud el recurso
    // no se puede usar.
    const prepared = prepareRecordLocation({
      point: PLAZA,
      requestedPrecision: 'exact',
      role: 'meeting_point',
      sensitivity: 'high',
      audience: 'collective',
    });

    expect(prepared.publishedPrecision).toBe('exact');
    expect(prepared.publicPoint).toEqual(PLAZA);
  });

  it('una necesidad sensible recibe la propuesta de engrosar, con su explicación', () => {
    const prepared = prepareRecordLocation({
      point: PLAZA,
      requestedPrecision: 'exact',
      role: 'subject',
      sensitivity: 'high',
      audience: 'collective',
    });

    expect(prepared.publishedPrecision).toBe('500m');
    expect(prepared.publicPoint).not.toEqual(PLAZA);
    expect(prepared.coarsenedBecause).toMatch(/persona/);
    // El punto conocido no se pierde: sigue bajo custodia local.
    expect(prepared.exact).toEqual(PLAZA);
  });

  it('la persona puede rechazar el engrosado — es propuesta, no ley', () => {
    const prepared = prepareRecordLocation({
      point: PLAZA,
      requestedPrecision: 'exact',
      role: 'subject',
      sensitivity: 'high',
      audience: 'collective',
      overrideCoarsening: true,
    });

    expect(prepared.publishedPrecision).toBe('exact');
    expect(prepared.publicPoint).toEqual(PLAZA);
    expect(prepared.coarsenedBecause).toBeNull();
  });

  it('en el canal privado nada se toca', () => {
    expect(
      publishedPrecision({
        requested: 'exact',
        role: 'subject',
        sensitivity: 'high',
        audience: 'private',
      }).precision,
    ).toBe('exact');
  });

  it('rechaza coordenadas inválidas antes de construir cualquier representación', () => {
    expect(validGeoPoint({ lat: 91, lng: -68.8 })).toBeNull();
    expect(validGeoPoint({ lat: -32.8, lng: Number.NaN })).toBeNull();
    expect(prepareRecordLocation({ point: { lat: 91, lng: 181 } }).publicPoint).toBeNull();
  });
});
