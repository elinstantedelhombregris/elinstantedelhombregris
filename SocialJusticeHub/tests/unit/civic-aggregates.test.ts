import { describe, expect, it } from 'vitest';

import { buildPublicCivicAggregates, type AggregateSourceEvent } from '../../server/civic/aggregates';

const uuid = (value: number): string => `00000000-0000-4000-8000-${String(value).padStart(12, '0')}`;
const actor = (value: number): string => `actor_${uuid(value)}`;
let sequence = 100;
const row = (
  actorKey: string,
  entityType: string,
  entityId: string,
  operation: string,
  payload: Record<string, unknown>,
): AggregateSourceEvent => {
  const releasedPayload = ['observation', 'need', 'resource'].includes(entityType)
    && !Object.prototype.hasOwnProperty.call(payload, 'audience')
    ? { ...payload, audience: 'collective' }
    : payload;
  return {
    sequence,
    eventId: uuid(sequence++), actorKey, entityType, entityId, operation,
    payloadJson: JSON.stringify(releasedPayload), occurredAt: new Date().toISOString(),
  };
};

describe('buildPublicCivicAggregates', () => {
  it('no permite que verificadores eleven un grupo por encima de k', () => {
    const observationId = uuid(1);
    const result = buildPublicCivicAggregates([
      row(actor(1), 'observation', observationId, 'create', {
        campaignKey: 'luminarias-v1', campaignVersion: 1, category: 'luminaria',
        locationLabel: 'Barrio Norte', locationPrecision: '500m',
        location: { lat: -32.89, lng: -68.85 },
      }),
      ...[2, 3, 4, 5, 6, 7].map((value) => row(actor(value), 'verification', uuid(10 + value), 'create', {
        observationId, verdict: 'confirm',
      })),
    ], 5);

    expect(result.groups).toEqual([]);
    expect(result.suppressedGroups).toBe(1);
  });

  it('publica sólo métricas agregadas después del umbral y deriva corroboración', () => {
    const observationId = uuid(3);
    const events = [
      ...[1, 2, 3, 4, 5].map((value, index) => row(actor(value), 'observation', index === 0 ? observationId : uuid(50 + value), 'create', {
        campaignKey: 'luminarias-v1', campaignVersion: 1, category: 'luminaria',
        locationLabel: 'Barrio Norte', locationPrecision: '500m',
        location: { lat: -32.89, lng: -68.85 },
      })),
      row(actor(6), 'verification', uuid(16), 'create', { observationId, verdict: 'confirm' }),
      row(actor(7), 'verification', uuid(17), 'create', { observationId, verdict: 'confirm' }),
    ];
    const result = buildPublicCivicAggregates(events, 5);

    expect(result.groups).toHaveLength(1);
    expect(result.groups[0]).toMatchObject({
      campaignKey: 'luminarias-v1',
      territory: { label: 'Barrio Norte', precision: '500m' },
      coverage: { observed: 5 },
      quality: { corroborated: 1, needsReview: 4, method: 'two-independent-confirmations' },
      contributors: { band: '5–9', minimumApplied: 5 },
    });
    const serialized = JSON.stringify(result.groups[0]);
    expect(serialized).not.toContain('actor_');
    expect(serialized).not.toContain('-32.89');
    expect(serialized).not.toContain(observationId);
  });

  it('separa celdas geográficas aunque compartan la misma etiqueta', () => {
    const events = [
      ...[1, 2, 3, 4, 5].map((value) => row(actor(value), 'observation', uuid(100 + value), 'create', {
        campaignKey: 'luminarias-v1', category: 'luminaria',
        locationLabel: 'Mi zona', locationPrecision: '500m',
        location: { lat: -32.89, lng: -68.85 },
      })),
      ...[6, 7, 8, 9, 10].map((value) => row(actor(value), 'observation', uuid(100 + value), 'create', {
        campaignKey: 'luminarias-v1', category: 'luminaria',
        locationLabel: 'Mi zona', locationPrecision: '500m',
        location: { lat: -34.6037, lng: -58.3816 },
      })),
    ];

    const result = buildPublicCivicAggregates(events, 5);

    expect(result.groups).toHaveLength(2);
    expect(result.groups.map((group) => group.coverage.observed).sort()).toEqual([5, 5]);
    expect(result.groups.every((group) => group.territory.label === 'Mi zona')).toBe(true);
    expect(new Set(result.groups.map((group) => group.id)).size).toBe(2);
  });

  it('une una misma celda pero no publica una etiqueta sin su propio umbral k', () => {
    const labels = ['Mi zona', 'Mi zona', 'Distrito Centro', 'Distrito Centro', 'Distrito Centro'];
    const events = labels.map((locationLabel, index) => row(
      actor(index + 1),
      'observation',
      uuid(130 + index),
      'create',
      {
        campaignKey: 'luminarias-v1', category: 'luminaria',
        locationLabel, locationPrecision: '500m',
        location: { lat: -32.89 + index * 0.00000001, lng: -68.85 },
      },
    ));

    const result = buildPublicCivicAggregates(events, 5);

    expect(result.groups).toHaveLength(1);
    expect(result.groups[0]).toMatchObject({
      territory: { label: null, precision: '500m' },
      coverage: { observed: 5 },
    });
  });

  it('oculta cinco etiquetas distintas aunque el grupo alcance el umbral', () => {
    const events = ['Casa 1', 'Casa 2', 'Casa 3', 'Casa 4', 'Casa 5'].map((locationLabel, index) => row(
      actor(index + 1),
      'observation',
      uuid(140 + index),
      'create',
      {
        campaignKey: 'luminarias-v1', category: 'luminaria',
        locationLabel, locationPrecision: '500m',
        location: { lat: -32.89, lng: -68.85 },
      },
    ));

    const result = buildPublicCivicAggregates(events, 5);

    expect(result.groups).toHaveLength(1);
    expect(result.groups[0]?.territory.label).toBeNull();
  });

  it('falla cerrado cuando falta audience collective', () => {
    const hidden = [1, 2, 3, 4, 5].map((value) => row(actor(value), 'observation', uuid(145 + value), 'create', {
      campaignKey: 'luminarias-v1', category: 'luminaria',
      locationLabel: 'No publicable', locationPrecision: '500m',
      location: { lat: -32.89, lng: -68.85 },
      audience: undefined,
    }));
    const visible = [6, 7, 8, 9, 10].map((value) => row(actor(value), 'resource', uuid(155 + value), 'create', {
      category: 'alimentos', locationLabel: 'Zona común', publicPrecision: '500m',
      publicLat: -32.89, publicLng: -68.85, audience: 'collective',
    }));

    const result = buildPublicCivicAggregates([...hidden, ...visible], 5);

    expect(result.groups).toHaveLength(1);
    expect(result.groups[0]).toMatchObject({ campaignKey: 'red-recursos-v1', resources: { available: 5 } });
    expect(JSON.stringify(result)).not.toContain('No publicable');
  });

  it('omite registros sin punto en vez de crear un territorio geográfico ficticio', () => {
    const events = [1, 2, 3, 4, 5].map((value) => row(actor(value), 'observation', uuid(180 + value), 'create', {
      campaignKey: 'luminarias-v1', category: 'luminaria',
      locationLabel: 'Lugares incompatibles', locationPrecision: '500m',
    }));

    const result = buildPublicCivicAggregates(events, 5);

    expect(result.groups).toEqual([]);
    expect(result.suppressedGroups).toBe(0);
  });

  it('descarta pares incompletos, no finitos y fuera de rango de la proyección', () => {
    const valid = [1, 2, 3, 4, 5].map((value) => row(actor(value), 'observation', uuid(150 + value), 'create', {
      campaignKey: 'luminarias-v1', category: 'luminaria',
      locationLabel: 'Zona válida', locationPrecision: '500m',
      location: { lat: -32.89, lng: -68.85 },
    }));
    const malformedLocations: Record<string, unknown>[] = [
      { lat: -32.89 },
      { lng: -68.85 },
      { lat: 91, lng: -68.85 },
      { lat: -32.89, lng: -181 },
      { lat: Number.NaN, lng: -68.85 },
    ];
    const invalid = malformedLocations.map((location, index) => row(
      actor(20 + index),
      'observation',
      uuid(170 + index),
      'create',
      {
        campaignKey: 'luminarias-v1', category: 'luminaria',
        locationLabel: 'Zona válida', locationPrecision: '500m', location,
      },
    ));

    const result = buildPublicCivicAggregates([...valid, ...invalid], 5);

    expect(result.groups).toHaveLength(1);
    expect(result.groups[0]?.coverage.observed).toBe(5);
    expect(result.processedEvents).toBe(10);
  });

  it('agrupa necesidades y recursos directos por su punto público, no por su etiqueta', () => {
    const needs = [1, 2, 3, 4, 5].map((value) => row(actor(value), 'need', uuid(190 + value), 'create', {
      category: 'alimentos', locationLabel: 'Zona común', publicPrecision: '500m',
      publicLat: -32.89, publicLng: -68.85,
    }));
    const resources = [6, 7, 8, 9, 10].map((value) => row(actor(value), 'resource', uuid(190 + value), 'create', {
      category: 'alimentos', locationLabel: 'Zona común', publicPrecision: '500m',
      publicLat: -34.6037, publicLng: -58.3816,
    }));

    const result = buildPublicCivicAggregates([...needs, ...resources], 5);

    expect(result.groups).toHaveLength(2);
    expect(result.groups).toEqual(expect.arrayContaining([
      expect.objectContaining({ needs: { open: 5, resolved: 0 }, resources: { available: 0 } }),
      expect.objectContaining({ needs: { open: 0, resolved: 0 }, resources: { available: 5 } }),
    ]));
  });

  it('excluye recursos vencidos, agotados o sin cantidad del total disponible', () => {
    const resources = [1, 2, 3, 4, 5, 6, 7, 8].map((value) => row(
      actor(value),
      'resource',
      uuid(400 + value),
      'create',
      {
        category: 'alimentos', locationLabel: 'Zona común', publicPrecision: '500m',
        publicLat: -32.89, publicLng: -68.85,
        status: value === 7 ? 'depleted' : 'available',
        quantity: value === 8 ? 0 : 10,
        expiresAt: value === 6 ? '2000-01-01T00:00:00.000Z' : '2999-01-01T00:00:00.000Z',
      },
    ));

    const result = buildPublicCivicAggregates(resources, 5);

    expect(result.groups).toHaveLength(1);
    expect(result.groups[0]).toMatchObject({ resources: { available: 5 } });
  });

  it('deja de contar un recurso mientras una conexión lo tiene comprometido', () => {
    const resourceIds = [1, 2, 3, 4, 5, 6].map((value) => uuid(430 + value));
    const resources = resourceIds.map((entityId, index) => row(
      actor(index + 1),
      'resource',
      entityId,
      'create',
      {
        category: 'cuidados', locationLabel: 'Zona común', publicPrecision: '500m',
        publicLat: -32.89, publicLng: -68.85, status: 'available', quantity: 1,
      },
    ));
    const matchId = uuid(450);
    const matchEvents = [
      row(actor(1), 'match', matchId, 'create', { needId: uuid(451), resourceId: resourceIds[0], status: 'proposed' }),
      row(actor(1), 'match', matchId, 'transition', { status: 'accepted' }),
    ];

    const result = buildPublicCivicAggregates([...resources, ...matchEvents], 5);

    expect(result.groups).toHaveLength(1);
    expect(result.groups[0]).toMatchObject({ resources: { available: 5 } });
  });

  it('da a una necesidad vinculada su propio grupo cuando su lugar difiere de la observación', () => {
    const observations = [1, 2, 3, 4, 5].map((value) => row(actor(value), 'observation', uuid(210 + value), 'create', {
      campaignKey: 'ollas-v1', campaignVersion: 3, category: 'olla-comunitaria',
      locationLabel: 'Origen', locationPrecision: '500m',
      location: { lat: -32.89, lng: -68.85 },
    }));
    const needs = [1, 2, 3, 4, 5].map((value) => row(actor(value), 'need', uuid(220 + value), 'create', {
      observationId: uuid(210 + value), category: 'alimentos-secos',
      locationLabel: 'Punto de entrega', publicPrecision: '500m',
      publicLat: -34.6037, publicLng: -58.3816,
    }));

    const result = buildPublicCivicAggregates([...observations, ...needs], 5);

    expect(result.groups).toHaveLength(2);
    expect(result.groups).toEqual(expect.arrayContaining([
      expect.objectContaining({
        campaignKey: 'ollas-v1', campaignVersion: 3, category: 'olla-comunitaria',
        coverage: { observed: 5, target: null, pct: null },
        needs: { open: 0, resolved: 0 },
      }),
      expect.objectContaining({
        campaignKey: 'ollas-v1', campaignVersion: 3, category: 'alimentos-secos',
        coverage: { observed: 0, target: null, pct: null },
        needs: { open: 5, resolved: 0 },
        territory: { label: 'Punto de entrega', precision: '500m' },
      }),
    ]));
  });

  it('proyecta una resolución confirmada sin exponer las partes', () => {
    const observationId = uuid(20);
    const needId = uuid(21);
    const matchId = uuid(22);
    const events = [
      ...[1, 2, 3, 4, 5].map((value, index) => row(actor(value), 'observation', index === 0 ? observationId : uuid(60 + value), 'create', {
        campaignKey: 'ollas-v1', category: 'alimentos', locationLabel: 'Las Heras', locationPrecision: 'city',
        location: { lat: -32.89, lng: -68.85 },
      })),
      row(actor(1), 'need', needId, 'create', {
        observationId, category: 'alimentos', publicPrecision: 'city',
        publicLat: -32.89, publicLng: -68.85,
      }),
      row(actor(1), 'match', matchId, 'create', { needId, resourceId: uuid(40) }),
      row(actor(1), 'match', matchId, 'transition', { status: 'confirmed' }),
    ];
    const result = buildPublicCivicAggregates(events, 5);

    expect(result.groups[0]?.needs).toEqual({ open: 0, resolved: 1 });
  });

  it('reserva escucha-v1 exclusivamente para su proyección sin texto ni territorio', () => {
    const events = [1, 2, 3, 4, 5].map((value) => row(actor(value), 'observation', uuid(80 + value), 'create', {
      campaignKey: 'escucha-v1',
      category: 'categoría arbitraria',
      locationLabel: 'Ubicación que no debe aparecer',
      data: { theme: 'health', kind: 'dream', horizon: 'generation', scope: 'country' },
    }));

    const result = buildPublicCivicAggregates(events);

    expect(result.groups).toEqual([]);
    expect(JSON.stringify(result)).not.toContain('Ubicación que no debe aparecer');
  });

  it('retira una fila de los conteos públicos sin borrar su historia append-only', () => {
    const observationIds = [1, 2, 3, 4, 5, 6].map((value) => uuid(300 + value));
    const events = observationIds.map((entityId, index) => row(
      actor(index + 1),
      'observation',
      entityId,
      'create',
      {
        campaignKey: 'luminarias-v1', category: 'luminaria',
        locationLabel: 'Zona protegida', locationPrecision: '500m',
        location: { lat: -32.89, lng: -68.85 },
      },
    ));
    events.push(row(actor(1), 'observation', observationIds[0]!, 'update', {
      audience: 'collective',
      revokedAt: '2026-07-14T10:00:00.000Z',
    }));

    const result = buildPublicCivicAggregates([...events].reverse(), 5);

    expect(result.groups).toHaveLength(1);
    expect(result.groups[0]?.coverage.observed).toBe(5);
    expect(result.groups[0]?.contributors.band).toBe('5–9');
    expect(JSON.stringify(result)).not.toContain(observationIds[0]);
  });

  it('mueve una corrección completa a su nueva celda pública', () => {
    const events = [1, 2, 3, 4, 5, 6].map((value) => row(
      actor(value),
      'resource',
      uuid(320 + value),
      'create',
      {
        category: 'cuidados', locationLabel: 'Zona oeste', publicPrecision: '500m',
        publicLat: -32.89, publicLng: -68.85,
      },
    ));
    events.push(row(actor(1), 'resource', uuid(321), 'update', {
      audience: 'collective', category: 'cuidados', locationLabel: 'Zona este',
      publicPrecision: '500m', publicLat: -34.6037, publicLng: -58.3816,
    }));

    const result = buildPublicCivicAggregates([...events].reverse(), 5);

    expect(result.groups).toHaveLength(1);
    expect(result.groups[0]).toMatchObject({
      territory: { label: 'Zona oeste', precision: '500m' },
      resources: { available: 5 },
    });
  });
});
