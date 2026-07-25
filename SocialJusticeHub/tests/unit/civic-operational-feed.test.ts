import { describe, expect, it } from 'vitest';

import { buildOperationalFeed } from '../../server/civic/operational-feed';
import type { CivicFeedSourceEvent } from '../../server/civic/postgres-store';
import type { CivicActionLinkRecord, CivicMatchParties } from '../../server/civic/service';

const event = (
  id: number,
  entityType: string,
  entityId: string,
  actorKey: string,
  payload: Record<string, unknown>,
): CivicFeedSourceEvent => ({
  id,
  eventId: `00000000-0000-4000-8000-${String(id).padStart(12, '0')}`,
  actorKey,
  entityType,
  entityId,
  operation: 'create',
  payloadJson: JSON.stringify(payload),
  occurredAt: '2026-07-13T12:00:00.000Z',
});

const parties = (overrides: Partial<CivicMatchParties> = {}): CivicMatchParties => ({
  matchId: 'match-1',
  needActorKey: 'actor-a',
  resourceActorKey: 'actor-b',
  createdByActorKey: 'actor-a',
  needAcceptedAt: '2026-07-13T12:01:00.000Z',
  resourceAcceptedAt: '2026-07-13T12:02:00.000Z',
  fulfilledAt: null,
  confirmedAt: null,
  ...overrides,
});

describe('buildOperationalFeed', () => {
  it('conserva la firma declarada pero elimina identidad técnica, contacto y ubicación exacta', () => {
    const rows = buildOperationalFeed([
      event(1, 'observation', 'observation-1', 'actor-a', {
        creatorKey: 'actor-a',
        title: 'Luminaria apagada',
        summary: 'Frente a la plaza',
        phone: '+54 261 555 1234',
        contactConsent: true,
        attributionEmail: 'asamblea@example.org',
        exactLat: -32.88,
        exactLocation: { lat: -32.88, lng: -68.81 },
        location: { lat: -32.9, lng: -68.8 },
        locationPrecision: '500m',
        locationRole: 'phenomenon',
        locationSource: 'map_pin',
        horizontalAccuracyM: 18,
        audience: 'collective',
        attributionMode: 'circle_name',
        attributionName: 'Asamblea de la Plaza',
      }),
    ], 'actor-b', [], []);

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ entityType: 'observation', ownedByMe: false });
    expect(rows[0]?.payload).toMatchObject({
      title: 'Luminaria apagada',
      locationPrecision: '500m',
      locationRole: 'phenomenon',
      locationSource: 'map_pin',
      horizontalAccuracyM: 18,
      audience: 'collective',
      attributionMode: 'circle_name',
      attributionName: 'Asamblea de la Plaza',
    });
    expect(JSON.stringify(rows[0])).not.toContain('actor-a');
    expect(rows[0]?.payload).not.toHaveProperty('phone');
    expect(rows[0]?.payload).not.toHaveProperty('contactConsent');
    expect(rows[0]?.payload).not.toHaveProperty('attributionEmail');
    expect(rows[0]?.payload).not.toHaveProperty('exactLat');
    expect(rows[0]?.payload).not.toHaveProperty('exactLocation');
  });

  it('excluye escucha-v1 incluso para quien creó la observación', () => {
    const rows = buildOperationalFeed([
      event(4, 'observation', 'listening-1', 'actor-a', {
        campaignKey: 'escucha-v1',
        title: 'Voz territorial',
        summary: 'texto que no debe viajar por el feed',
        data: { theme: 'health', kind: 'dream', horizon: 'generation', scope: 'country' },
      }),
    ], 'actor-a', [], []);

    expect(rows).toEqual([]);
  });

  it('falla cerrado para registros sin audiencia colectiva', () => {
    const source = [
      event(5, 'observation', 'observation-private', 'actor-a', { title: 'Privada', audience: 'private' }),
      event(6, 'observation', 'observation-circle', 'actor-a', { title: 'Círculo', audience: 'circle' }),
      event(7, 'need', 'need-counterpart', 'actor-a', { title: 'Contraparte', audience: 'counterpart' }),
      event(8, 'resource', 'resource-legacy', 'actor-a', { title: 'Sin audiencia' }),
      event(9, 'resource', 'resource-collective', 'actor-a', { title: 'Colectivo', audience: 'collective' }),
    ];

    const rows = buildOperationalFeed(source, 'actor-b', [], []);

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ entityType: 'resource', entityId: 'resource-collective' });
  });

  it('proyecta una revocación auditable sin reabrir campos privados', () => {
    const rows = buildOperationalFeed([
      event(10, 'observation', 'observation-revoked', 'actor-a', {
        id: 'observation-revoked',
        audience: 'collective',
        revokedAt: '2026-07-13T12:05:00.000Z',
        exactLat: -32.88,
        revocationReason: 'private note',
      }),
    ], 'actor-b', [], []);

    expect(rows).toHaveLength(1);
    expect(rows[0]?.payload).toEqual({
      audience: 'collective',
      revokedAt: '2026-07-13T12:05:00.000Z',
    });
  });

  it('muestra una conexión sólo a sus partes y deriva la doble aceptación', () => {
    const source = [
      event(2, 'match', 'match-1', 'actor-a', {
        needId: 'need-1',
        resourceId: 'resource-1',
        score: 88,
        acceptedNeedBy: 'actor-a',
        acceptedResourceBy: 'actor-b',
        status: 'confirmed',
      }),
    ];
    const visible = buildOperationalFeed(source, 'actor-b', [parties()], []);
    const hidden = buildOperationalFeed(source, 'actor-c', [], []);

    expect(visible).toHaveLength(1);
    expect(visible[0]?.payload.status).toBe('accepted');
    expect(visible[0]?.parties).toEqual({
      needOwnedByMe: false,
      resourceOwnedByMe: true,
      needAccepted: true,
      resourceAccepted: true,
    });
    expect(JSON.stringify(visible[0])).not.toContain('acceptedNeedBy');
    expect(hidden).toEqual([]);
  });

  it('deriva el estado de acción desde claims persistidos', () => {
    const action: CivicActionLinkRecord = {
      actionId: 'action-1',
      matchId: 'match-1',
      createdByActorKey: 'actor-b',
      completedAt: '2026-07-13T12:03:00.000Z',
      confirmedAt: null,
    };
    const rows = buildOperationalFeed([
      event(3, 'action', 'action-1', 'actor-b', {
        matchId: 'match-1', title: 'Entrega', outcomeJson: '{"private":"no"}', status: 'confirmed',
      }),
    ], 'actor-a', [parties()], [action]);

    expect(rows[0]?.payload).toMatchObject({ matchId: 'match-1', title: 'Entrega', status: 'completed' });
    expect(rows[0]?.payload).not.toHaveProperty('outcomeJson');
  });
});
