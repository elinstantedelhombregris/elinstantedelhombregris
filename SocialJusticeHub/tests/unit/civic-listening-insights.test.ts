import { describe, expect, it } from 'vitest';

import type { AggregateSourceEvent } from '../../server/civic/aggregates';
import { buildPublicListeningInsights } from '../../server/civic/listening-insights';

const uuid = (value: number): string => `10000000-0000-4000-8000-${String(value).padStart(12, '0')}`;
const actor = (value: number): string => `actor_${uuid(value)}`;
let sequence = 1;

const observation = (
  actorKey: string,
  entityId: string,
  data: Record<string, unknown>,
  extra: Record<string, unknown> = {},
): AggregateSourceEvent => ({
  sequence,
  eventId: uuid(1000 + sequence++),
  actorKey,
  entityType: 'observation',
  entityId,
  operation: 'create',
  payloadJson: JSON.stringify({
    campaignKey: 'escucha-v1',
    audience: 'collective',
    location: { lat: -32.8895, lng: -68.8458 },
    locationPrecision: '500m',
    data,
    ...extra,
  }),
  occurredAt: '2026-07-13T12:00:00.000Z',
});

const updateObservation = (
  actorKey: string,
  entityId: string,
  payload: Record<string, unknown>,
): AggregateSourceEvent => ({
  sequence,
  eventId: uuid(1000 + sequence++),
  actorKey,
  entityType: 'observation',
  entityId,
  operation: 'update',
  payloadJson: JSON.stringify(payload),
  occurredAt: '2026-07-14T12:00:00.000Z',
});

const canonical = {
  theme: 'health',
  kind: 'dream',
  horizon: 'generation',
  scope: 'country',
  importance: 5,
  supportWanted: true,
} as const;

describe('buildPublicListeningInsights', () => {
  it('suprime cada faceta con menos de cinco creadores de observación', () => {
    const events = [1, 2, 3, 4].flatMap((value) => [
      observation(actor(value), uuid(value), canonical),
      observation(actor(value), uuid(100 + value), canonical),
    ]);

    const result = buildPublicListeningInsights(events, 1);

    expect(result.facets).toEqual({ theme: [], kind: [], horizon: [], scope: [] });
    expect(result.suppressedBuckets).toEqual({ theme: 1, kind: 1, horizon: 1, scope: 1 });
    expect(result.territories).toEqual([]);
    expect(result.suppressedTerritories).toBe(1);
  });

  it('publica sólo facetas allowlisted y nunca texto, ids, actores ni ubicación', () => {
    const events = [1, 2, 3, 4, 5].map((value) => observation(actor(value), uuid(value), canonical, {
      title: 'Voz territorial',
      summary: 'Mi historia privada no debe aparecer',
      location: { lat: -32.8895, lng: -68.8458 },
      locationPrecision: '500m',
      locationLabel: 'Barrio secreto',
    }));

    const result = buildPublicListeningInsights(events);

    expect(result.facets).toEqual({
      theme: [{ value: 'health', observations: 5, contributors: { band: '5–9', minimumApplied: 5 } }],
      kind: [{ value: 'dream', observations: 5, contributors: { band: '5–9', minimumApplied: 5 } }],
      horizon: [{ value: 'generation', observations: 5, contributors: { band: '5–9', minimumApplied: 5 } }],
      scope: [{ value: 'country', observations: 5, contributors: { band: '5–9', minimumApplied: 5 } }],
    });
    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain('Mi historia privada');
    expect(serialized).not.toContain('Barrio secreto');
    expect(serialized).not.toContain('actor_');
    expect(serialized).not.toContain('-32.8895');
    expect(serialized).not.toContain('grid:');
    expect(serialized).not.toContain(uuid(1));
    expect(serialized).not.toContain('importance');
    expect(serialized).not.toContain('supportWanted');
  });

  it('rechaza valores arbitrarios en vez de reflejarlos', () => {
    const poisoned = [1, 2, 3, 4, 5].map((value) => observation(actor(value), uuid(20 + value), {
      ...canonical,
      theme: 'Nombre y dirección de una persona',
    }));

    const result = buildPublicListeningInsights(poisoned);

    expect(result.facets).toEqual({ theme: [], kind: [], horizon: [], scope: [] });
    expect(JSON.stringify(result)).not.toContain('Nombre y dirección');
  });

  it('aplica k por valor de faceta, no sólo al total de la campaña', () => {
    const food = [1, 2, 3, 4, 5].map((value) => observation(actor(value), uuid(40 + value), {
      ...canonical,
      theme: 'food',
      kind: 'need',
      horizon: 'now',
      scope: 'neighborhood',
    }));
    const rare = [6, 7, 8, 9].map((value) => observation(actor(value), uuid(40 + value), {
      ...canonical,
      theme: 'democracy',
      kind: 'need',
      horizon: 'now',
      scope: 'neighborhood',
    }));

    const result = buildPublicListeningInsights([...food, ...rare]);

    expect(result.facets.theme).toEqual([
      { value: 'food', observations: 5, contributors: { band: '5–9', minimumApplied: 5 } },
    ]);
    expect(result.suppressedBuckets.theme).toBe(1);
    expect(result.facets.kind[0]).toMatchObject({ value: 'need', observations: 9 });
    expect(result.facets.horizon[0]).toMatchObject({ value: 'now', observations: 9 });
    expect(result.facets.scope[0]).toMatchObject({ value: 'neighborhood', observations: 9 });
    expect(result.territories).toHaveLength(1);
    expect(result.territories[0]?.facets.theme).toEqual([
      { value: 'food', observations: 5, contributors: { band: '5–9', minimumApplied: 5 } },
    ]);
    expect(JSON.stringify(result.territories[0])).not.toContain('democracy');
  });

  it('deduplica creates repetidos por entidad antes de contar', () => {
    const events = [1, 2, 3, 4, 5].map((value) => observation(actor(value), uuid(80 + value), canonical));
    events.push(observation(actor(6), uuid(81), canonical));

    const result = buildPublicListeningInsights(events);

    expect(result.facets.theme[0]).toMatchObject({ value: 'health', observations: 5 });
    expect(result.territories[0]).toMatchObject({ precision: '500m', observations: 5 });
  });

  it('falla cerrado sin audiencia colectiva, punto público o precisión válida', () => {
    const missingAudience = [1, 2, 3, 4, 5].map((value) => observation(
      actor(value),
      uuid(120 + value),
      canonical,
      { audience: undefined },
    ));
    const privateAudience = [6, 7, 8, 9, 10].map((value) => observation(
      actor(value),
      uuid(120 + value),
      canonical,
      { audience: 'circle' },
    ));
    const missingPoint = [11, 12, 13, 14, 15].map((value) => observation(
      actor(value),
      uuid(120 + value),
      canonical,
      { location: undefined },
    ));
    const invalidPoint = [16, 17, 18, 19, 20].map((value) => observation(
      actor(value),
      uuid(120 + value),
      canonical,
      { location: { lat: -91, lng: -68.8 } },
    ));
    const invalidPrecision = [21, 22, 23, 24, 25].map((value) => observation(
      actor(value),
      uuid(120 + value),
      canonical,
      { locationPrecision: 'exact' },
    ));

    const result = buildPublicListeningInsights([
      ...missingAudience,
      ...privateAudience,
      ...missingPoint,
      ...invalidPoint,
      ...invalidPrecision,
    ]);

    expect(result.facets).toEqual({ theme: [], kind: [], horizon: [], scope: [] });
    expect(result.territories).toEqual([]);
    expect(result.suppressedTerritories).toBe(0);
  });

  it('separa celdas por el punto y nunca mezcla por locationLabel', () => {
    const mendoza = [1, 2, 3].map((value) => observation(
      actor(value),
      uuid(180 + value),
      canonical,
      { locationLabel: 'Territorio compartido' },
    ));
    const buenosAires = [4, 5, 6].map((value) => observation(
      actor(value),
      uuid(180 + value),
      canonical,
      {
        location: { lat: -34.6037, lng: -58.3816 },
        locationLabel: 'Territorio compartido',
      },
    ));

    const result = buildPublicListeningInsights([...mendoza, ...buenosAires]);

    // The national facet is safe with six actors, but each physical cell is
    // still below k. Grouping by the shared label would incorrectly publish it.
    expect(result.facets.theme[0]).toMatchObject({ value: 'health', observations: 6 });
    expect(result.territories).toEqual([]);
    expect(result.suppressedTerritories).toBe(2);
    expect(JSON.stringify(result)).not.toContain('Territorio compartido');
  });

  it('publica celdas protegidas independientes sin ids, claves ni puntos', () => {
    const mendoza = [1, 2, 3, 4, 5].map((value) => observation(
      actor(value),
      uuid(220 + value),
      canonical,
      { locationLabel: `Etiqueta ${value}` },
    ));
    const buenosAires = [6, 7, 8, 9, 10].map((value) => observation(
      actor(value),
      uuid(220 + value),
      {
        ...canonical,
        theme: 'food',
        kind: 'need',
        horizon: 'now',
        scope: 'neighborhood',
      },
      {
        location: { lat: -34.6037, lng: -58.3816 },
        locationLabel: 'Otra etiqueta privada',
      },
    ));

    const result = buildPublicListeningInsights([...mendoza, ...buenosAires]);

    expect(result.territories).toHaveLength(2);
    expect(result.territories.map((territory) => territory.precision)).toEqual(['500m', '500m']);
    expect(result.territories.map((territory) => territory.facets.theme[0]?.value).sort()).toEqual([
      'food',
      'health',
    ]);
    const serialized = JSON.stringify(result.territories);
    expect(serialized).not.toContain('grid:');
    expect(serialized).not.toContain('location');
    expect(serialized).not.toContain('Etiqueta');
    expect(serialized).not.toContain('-34.6037');
    expect(serialized).not.toContain(uuid(221));
    expect(serialized).not.toContain('actor_');
  });

  it('mantiene separadas dos precisiones declaradas para el mismo punto', () => {
    const fine = [1, 2, 3, 4, 5].map((value) => observation(
      actor(value),
      uuid(280 + value),
      canonical,
      { locationPrecision: '100m' },
    ));
    const city = [6, 7, 8, 9, 10].map((value) => observation(
      actor(value),
      uuid(280 + value),
      canonical,
      { locationPrecision: 'city' },
    ));

    const result = buildPublicListeningInsights([...fine, ...city]);

    expect(result.territories.map(({ precision, observations }) => ({ precision, observations }))).toEqual([
      { precision: '100m', observations: 5 },
      { precision: 'city', observations: 5 },
    ]);
  });

  it('retira una escucha revocada de facetas y cohortes sin borrar el evento histórico', () => {
    const ids = [1, 2, 3, 4, 5, 6].map((value) => uuid(360 + value));
    const events = ids.map((entityId, index) => observation(actor(index + 1), entityId, canonical));
    events.push(updateObservation(actor(1), ids[0]!, {
      audience: 'collective',
      revokedAt: '2026-07-14T11:59:00.000Z',
    }));

    const result = buildPublicListeningInsights([...events].reverse());

    expect(result.facets.theme[0]).toMatchObject({ value: 'health', observations: 5 });
    expect(result.territories[0]).toMatchObject({ precision: '500m', observations: 5 });
    expect(JSON.stringify(result)).not.toContain(ids[0]);
  });

  it('reemplaza una corrección categórica y territorial en orden append-only', () => {
    const ids = [1, 2, 3, 4, 5, 6].map((value) => uuid(380 + value));
    const events = ids.map((entityId, index) => observation(actor(index + 1), entityId, canonical));
    events.push(updateObservation(actor(1), ids[0]!, {
      campaignKey: 'escucha-v1', audience: 'collective',
      location: { lat: -34.6037, lng: -58.3816 }, locationPrecision: '500m',
      data: { ...canonical, theme: 'food' },
    }));

    const result = buildPublicListeningInsights([...events].reverse());

    expect(result.facets.theme).toEqual([
      { value: 'health', observations: 5, contributors: { band: '5–9', minimumApplied: 5 } },
    ]);
    expect(result.territories).toHaveLength(1);
    expect(result.territories[0]?.observations).toBe(5);
  });
});
