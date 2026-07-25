import { describe, expect, it } from 'vitest';

import {
  civicEventSchema,
  type CivicDeviceRole,
  type CivicEntityType,
  type CivicEventInput,
} from '../../server/civic/contracts';
import {
  CivicApiError,
  CivicEventService,
  type CivicActionLinkRecord,
  type CivicDeviceRecord,
  type CivicEventStore,
  type CivicMatchParties,
  type ClaimResult,
  type StoredCivicEvent,
  type TransitionClaimResult,
} from '../../server/civic/service';

const uuid = (value: number): string => `00000000-0000-4000-8000-${String(value).padStart(12, '0')}`;
const actorKey = (value: number): string => `actor_${uuid(value)}`;
const actor = (value: number, role: CivicDeviceRole = 'contributor', linkedUserId: number | null = null) => ({
  actorKey: actorKey(value),
  role,
  linkedUserId,
});

class MemoryCivicStore implements CivicEventStore {
  devices = new Map<string, CivicDeviceRecord>();
  events: Array<StoredCivicEvent & { entityType: CivicEntityType; entityId: string; event: CivicEventInput }> = [];
  owners = new Map<string, string>();
  verifications = new Map<string, string>();
  verificationIds = new Map<string, string>();
  matches = new Map<string, CivicMatchParties>();
  actions = new Map<string, CivicActionLinkRecord>();
  failNextAppend = false;

  async runInTransaction<T>(operation: (store: CivicEventStore) => Promise<T>): Promise<T> {
    const snapshot = {
      devices: new Map(this.devices),
      events: [...this.events],
      owners: new Map(this.owners),
      verifications: new Map(this.verifications),
      verificationIds: new Map(this.verificationIds),
      matches: new Map(this.matches),
      actions: new Map(this.actions),
    };
    try {
      return await operation(this);
    } catch (error) {
      this.devices = snapshot.devices;
      this.events = snapshot.events;
      this.owners = snapshot.owners;
      this.verifications = snapshot.verifications;
      this.verificationIds = snapshot.verificationIds;
      this.matches = snapshot.matches;
      this.actions = snapshot.actions;
      throw error;
    }
  }

  async getDevice(key: string) { return this.devices.get(key) ?? null; }
  async createDevice(key: string, secretHash: string) {
    const record: CivicDeviceRecord = { actorKey: key, secretHash, role: 'contributor', linkedUserId: null, revokedAt: null };
    if (!this.devices.has(key)) this.devices.set(key, record);
    return this.devices.get(key)!;
  }
  async linkDevice(key: string, userId: number) {
    const current = this.devices.get(key);
    if (!current) return 'missing' as const;
    if (current.linkedUserId === userId) return 'same' as const;
    if (current.linkedUserId != null) return 'conflict' as const;
    this.devices.set(key, { ...current, linkedUserId: userId });
    return 'linked' as const;
  }
  async unlinkDevice(key: string, userId: number) {
    const current = this.devices.get(key);
    if (!current || current.linkedUserId !== userId) return false;
    this.devices.set(key, { ...current, linkedUserId: null, role: 'contributor' });
    return true;
  }
  async touchDevice() {}
  async findEvents(eventId: string, idempotencyKey: string) {
    return this.events.filter((row) => row.eventId === eventId || row.idempotencyKey === idempotencyKey);
  }
  async appendEvent(input: { event: CivicEventInput; idempotencyKey: string; actorKey: string; eventHash: string }) {
    if (this.failNextAppend) {
      this.failNextAppend = false;
      throw new Error('simulated_append_failure');
    }
    if ((await this.findEvents(input.event.eventId, input.idempotencyKey)).length > 0) return false;
    this.events.push({
      eventId: input.event.eventId,
      idempotencyKey: input.idempotencyKey,
      actorKey: input.actorKey,
      eventHash: input.eventHash,
      entityType: input.event.entityType,
      entityId: input.event.entityId,
      event: input.event,
    });
    return true;
  }
  ownerKey(type: CivicEntityType, id: string) { return `${type}:${id}`; }
  async getOwner(type: CivicEntityType, id: string) { return this.owners.get(this.ownerKey(type, id)) ?? null; }
  async claimOwner(type: CivicEntityType, id: string, key: string): Promise<ClaimResult> {
    const mapKey = this.ownerKey(type, id);
    const current = this.owners.get(mapKey);
    if (!current) { this.owners.set(mapKey, key); return 'claimed'; }
    return current === key ? 'same' : 'conflict';
  }
  async claimVerification(input: { observationId: string; verifierActorKey: string; verificationId: string }): Promise<ClaimResult> {
    const key = `${input.observationId}:${input.verifierActorKey}`;
    const byActor = this.verifications.get(key);
    const byId = this.verificationIds.get(input.verificationId);
    if (!byActor && !byId) {
      this.verifications.set(key, input.verificationId);
      this.verificationIds.set(input.verificationId, key);
      return 'claimed';
    }
    return byActor === input.verificationId && byId === key ? 'same' : 'conflict';
  }
  async getMatchParties(id: string) { return this.matches.get(id) ?? null; }
  async claimMatchParties(parties: CivicMatchParties): Promise<ClaimResult> {
    const current = this.matches.get(parties.matchId);
    if (!current) { this.matches.set(parties.matchId, parties); return 'claimed'; }
    return JSON.stringify(current) === JSON.stringify(parties) ? 'same' : 'conflict';
  }
  async recordMatchAcceptance(id: string, side: 'need' | 'resource'): Promise<TransitionClaimResult> {
    const current = this.matches.get(id);
    if (!current) return 'prerequisite_missing';
    const key = side === 'need' ? 'needAcceptedAt' : 'resourceAcceptedAt';
    if (current[key]) return 'already_recorded';
    this.matches.set(id, { ...current, [key]: new Date().toISOString() });
    return 'recorded';
  }
  async recordMatchFulfillment(id: string): Promise<TransitionClaimResult> {
    const current = this.matches.get(id);
    if (!current?.needAcceptedAt || !current.resourceAcceptedAt) return 'prerequisite_missing';
    if (current.fulfilledAt) return 'already_recorded';
    this.matches.set(id, { ...current, fulfilledAt: new Date().toISOString() });
    return 'recorded';
  }
  async recordMatchConfirmation(id: string): Promise<TransitionClaimResult> {
    const current = this.matches.get(id);
    if (!current?.fulfilledAt) return 'prerequisite_missing';
    if (current.confirmedAt) return 'already_recorded';
    this.matches.set(id, { ...current, confirmedAt: new Date().toISOString() });
    return 'recorded';
  }
  async getActionLink(id: string) { return this.actions.get(id) ?? null; }
  async claimActionLink(link: CivicActionLinkRecord): Promise<ClaimResult> {
    const current = this.actions.get(link.actionId);
    if (!current) { this.actions.set(link.actionId, link); return 'claimed'; }
    return JSON.stringify(current) === JSON.stringify(link) ? 'same' : 'conflict';
  }
  async recordActionCompletion(id: string): Promise<TransitionClaimResult> {
    const current = this.actions.get(id);
    if (!current) return 'prerequisite_missing';
    if (current.completedAt) return 'already_recorded';
    this.actions.set(id, { ...current, completedAt: new Date().toISOString() });
    return 'recorded';
  }
  async recordActionConfirmation(id: string): Promise<TransitionClaimResult> {
    const current = this.actions.get(id);
    if (!current?.completedAt) return 'prerequisite_missing';
    if (current.confirmedAt) return 'already_recorded';
    this.actions.set(id, { ...current, confirmedAt: new Date().toISOString() });
    return 'recorded';
  }
}

let sequence = 100;
const event = (
  entityType: CivicEntityType,
  entityId: string,
  operation: CivicEventInput['operation'],
  payload: Record<string, unknown>,
): CivicEventInput => ({
  eventId: uuid(sequence++),
  entityType,
  entityId,
  operation,
  payload,
  createdAt: new Date().toISOString(),
});

const expectCode = async (promise: Promise<unknown>, code: string) => {
  await expect(promise).rejects.toMatchObject<CivicApiError>({ code });
};

describe('CivicEventService', () => {
  it('canoniza UUID y referencias de actor antes de reclamar propiedad', async () => {
    const store = new MemoryCivicStore();
    const service = new CivicEventService(store);
    const entityId = uuid(90_010);
    const eventId = uuid(90_011);
    const raw = {
      ...event('need', entityId.toUpperCase(), 'create', {
        id: entityId.toUpperCase(),
      }),
      eventId: eventId.toUpperCase(),
    };
    const parsed = civicEventSchema.parse(raw);
    expect(parsed).toMatchObject({ eventId, entityId });

    await expect(service.ingest(actor(1), raw, `need:${entityId}:canonical`))
      .resolves.toMatchObject({ status: 'accepted', eventId });
    expect(await store.getOwner('need', entityId)).toBe(actorKey(1));
    expect(store.events[0]).toMatchObject({ eventId, entityId });
    expect(store.events[0]?.event.payload).toMatchObject({ id: entityId });
  });

  it('revierte el claim si falla el append y permite un reintento limpio', async () => {
    const store = new MemoryCivicStore();
    const service = new CivicEventService(store);
    const observationId = uuid(90_001);
    const input = event('observation', observationId, 'create', {
      id: observationId,
      creatorKey: actorKey(1),
      audience: 'collective',
    });
    const key = `observation:${observationId}:create`;

    store.failNextAppend = true;
    await expect(service.ingest(actor(1), input, key)).rejects.toThrow('simulated_append_failure');
    expect(await store.getOwner('observation', observationId)).toBeNull();
    expect(store.events).toEqual([]);

    await expect(service.ingest(actor(1), input, key)).resolves.toMatchObject({ status: 'accepted' });
    expect(await store.getOwner('observation', observationId)).toBe(actorKey(1));
    expect(store.events).toHaveLength(1);
  });

  it('acepta una observación y hace el replay idempotente', async () => {
    const store = new MemoryCivicStore();
    const service = new CivicEventService(store);
    const observationId = uuid(1);
    const input = event('observation', observationId, 'create', {
      id: observationId,
      creatorKey: actorKey(1),
      title: 'Luminaria apagada',
      location: { lat: -32.89, lng: -68.85 },
      locationPrecision: '500m',
    });

    await expect(service.ingest(actor(1), input, `observation:${observationId}:publish`))
      .resolves.toMatchObject({ status: 'accepted' });
    await expect(service.ingest(actor(1), input, `observation:${observationId}:publish`))
      .resolves.toMatchObject({ status: 'duplicate' });

    await expectCode(service.ingest(actor(1), { ...input, payload: { ...input.payload, title: 'otro dato' } }, `observation:${observationId}:publish`), 'IDEMPOTENCY_CONFLICT');
    expect(store.events).toHaveLength(1);
  });

  it('rechaza ubicación exacta, campos privados y URI locales', async () => {
    const service = new CivicEventService(new MemoryCivicStore());
    const first = uuid(2);
    await expectCode(service.ingest(actor(1), event('observation', first, 'create', {
      id: first, creatorKey: actorKey(1), exactLat: -32.9,
    }), `observation:${first}:create`), 'FORBIDDEN_FIELD');

    const second = uuid(3);
    await expectCode(service.ingest(actor(1), event('observation', second, 'create', {
      id: second, creatorKey: actorKey(1), locationPrecision: ' Exact ',
    }), `observation:${second}:create`), 'EXACT_LOCATION_FORBIDDEN');

    const third = uuid(4);
    await expectCode(service.ingest(actor(1), event('observation', third, 'create', {
      id: third, creatorKey: actorKey(1), evidenceJson: '[{"uri":"file:///camera/private.jpg"}]',
    }), `observation:${third}:create`), 'LOCAL_MEDIA_FORBIDDEN');

    const fourth = uuid(23);
    await expectCode(service.ingest(actor(1), event('resource', fourth, 'create', {
      id: fourth, title: 'Aporte', telefono: '+54 261 555 1234',
    }), `resource:${fourth}:create`), 'FORBIDDEN_FIELD');
  });

  it('valida recursivamente puntos públicos y pares publicLat/publicLng', async () => {
    const service = new CivicEventService(new MemoryCivicStore());

    const incompletePoint = uuid(24);
    await expectCode(service.ingest(actor(1), event('observation', incompletePoint, 'create', {
      id: incompletePoint,
      creatorKey: actorKey(1),
      location: { lat: -32.89 },
      locationPrecision: '500m',
    }), `observation:${incompletePoint}:create`), 'INVALID_PUBLIC_LOCATION');

    const invalidRange = uuid(25);
    await expectCode(service.ingest(actor(1), event('observation', invalidRange, 'create', {
      id: invalidRange,
      creatorKey: actorKey(1),
      publicPlace: { point: { lat: -91, lng: -68.85 }, precision: '500m' },
    }), `observation:${invalidRange}:create`), 'NON_CANONICAL_LOCATION_FORBIDDEN');

    const nonFinite = uuid(26);
    await expectCode(service.ingest(actor(1), event('resource', nonFinite, 'create', {
      id: nonFinite,
      publicLat: Number.POSITIVE_INFINITY,
      publicLng: -68.85,
      publicPrecision: 'neighborhood',
    }), `resource:${nonFinite}:create`), 'INVALID_PUBLIC_LOCATION');

    const incompletePublicPair = uuid(27);
    await expectCode(service.ingest(actor(1), event('need', incompletePublicPair, 'create', {
      id: incompletePublicPair,
      publicLat: -32.89,
      publicPrecision: 'neighborhood',
    }), `need:${incompletePublicPair}:create`), 'INVALID_PUBLIC_LOCATION');

    const invalidLongitude = uuid(31);
    await expectCode(service.ingest(actor(1), event('resource', invalidLongitude, 'create', {
      id: invalidLongitude,
      publicLat: -32.89,
      publicLng: 180.01,
      publicPrecision: 'city',
    }), `resource:${invalidLongitude}:create`), 'INVALID_PUBLIC_LOCATION');
  });

  it('ajusta el punto canónico antes de persistir y calcular idempotencia', async () => {
    const store = new MemoryCivicStore();
    const service = new CivicEventService(store);
    const valid = uuid(28);
    const input = event('observation', valid, 'create', {
      id: valid,
      creatorKey: actorKey(1),
      location: { lat: -32.8895731, lng: -68.8498124 },
      locationPrecision: '100m',
      audience: 'collective',
    });
    await expect(service.ingest(actor(1), input, `observation:${valid}:create`))
      .resolves.toMatchObject({ status: 'accepted' });
    expect(store.events[0]?.event.payload).toMatchObject({
      location: { lat: -32.889867, lng: -68.849962 },
      locationPrecision: '100m',
      audience: 'collective',
    });

    // Two raw GPS readings in the same public cell are the same public event.
    await expect(service.ingest(actor(1), {
      ...input,
      payload: { ...input.payload, location: { lat: -32.8895738, lng: -68.8498129 } },
    }, `observation:${valid}:create`)).resolves.toMatchObject({ status: 'duplicate' });

    // Coordinate envelopes outside the canonical entity contract cannot be
    // snapped authoritatively, regardless of their decimal representation.
    const tooPrecise = uuid(29);
    await expectCode(service.ingest(actor(1), event('observation', tooPrecise, 'create', {
      id: tooPrecise,
      creatorKey: actorKey(1),
      publicPlace: { point: { lat: -32.8895731, lng: -68.849812 } },
      audience: 'collective',
    }), `observation:${tooPrecise}:create`), 'NON_CANONICAL_LOCATION_FORBIDDEN');

    const nestedSixDecimals = uuid(29_001);
    await expectCode(service.ingest(actor(1), event('observation', nestedSixDecimals, 'create', {
      id: nestedSixDecimals,
      creatorKey: actorKey(1),
      data: { foo: { lat: -32.889573, lng: -68.849812 } },
      audience: 'collective',
    }), `observation:${nestedSixDecimals}:create`), 'NON_CANONICAL_LOCATION_FORBIDDEN');

    const territoryId = uuid(29_002);
    await expect(service.ingest(actor(1), event('territory', territoryId, 'create', {
      id: territoryId,
      geometry: {
        type: 'Polygon',
        coordinates: [[[-68.85, -32.89], [-68.84, -32.89], [-68.85, -32.88], [-68.85, -32.89]]],
      },
    }), `territory:${territoryId}:create`)).resolves.toMatchObject({ status: 'accepted' });

    const emptyPair = uuid(30);
    await expect(service.ingest(actor(1), event('resource', emptyPair, 'create', {
      id: emptyPair,
      publicLat: null,
      publicLng: null,
      publicPrecision: 'neighborhood',
      audience: 'collective',
    }), `resource:${emptyPair}:create`)).resolves.toMatchObject({ status: 'accepted' });
  });

  it('ajusta publicLat/publicLng y rechaza precisiones o audiencias no soportadas', async () => {
    const store = new MemoryCivicStore();
    const service = new CivicEventService(store);
    const cases = [
      ['500m', -32.891664, -68.852428],
      ['neighborhood', -32.891664, -68.857777],
      ['city', -32.878189, -68.831263],
    ] as const;
    for (const [precision, publicLat, publicLng] of cases) {
      const resourceId = uuid(sequence++);
      await expect(service.ingest(actor(1), event('resource', resourceId, 'create', {
        id: resourceId,
        publicLat: -32.8895731,
        publicLng: -68.8498124,
        publicPrecision: precision,
        audience: 'collective',
      }), `resource:${resourceId}:create`)).resolves.toMatchObject({ status: 'accepted' });
      expect(store.events.find((row) => row.entityId === resourceId)?.event.payload).toMatchObject({
        publicLat,
        publicLng,
        publicPrecision: precision,
      });
    }

    for (const unsupported of ['private', 'circle', 'counterpart']) {
      const id = uuid(sequence++);
      await expectCode(service.ingest(actor(1), event('need', id, 'create', {
        id,
        audience: unsupported,
      }), `need:${id}:create`), 'UNSUPPORTED_AUDIENCE');
    }

    const invalidPrecision = uuid(sequence++);
    await expectCode(service.ingest(actor(1), event('need', invalidPrecision, 'create', {
      id: invalidPrecision,
      publicLat: -32.89,
      publicLng: -68.85,
      publicPrecision: 'block',
      audience: 'collective',
    }), `need:${invalidPrecision}:create`), 'INVALID_PUBLIC_PRECISION');

    const missingPrecision = uuid(sequence++);
    await expectCode(service.ingest(actor(1), event('resource', missingPrecision, 'create', {
      id: missingPrecision,
      publicLat: -32.89,
      publicLng: -68.85,
      audience: 'collective',
    }), `resource:${missingPrecision}:create`), 'INVALID_PUBLIC_PRECISION');
  });

  it('rechaza correo o teléfono embebido aun bajo claves aparentemente públicas', async () => {
    const service = new CivicEventService(new MemoryCivicStore());
    const emailId = uuid(sequence++);
    await expectCode(service.ingest(actor(1), event('observation', emailId, 'create', {
      id: emailId,
      creatorKey: actorKey(1),
      summary: 'Escribime a asamblea@example.org para coordinar',
      audience: 'collective',
    }), `observation:${emailId}:create`), 'PERSONAL_CONTACT_FORBIDDEN');

    const phoneId = uuid(sequence++);
    await expectCode(service.ingest(actor(1), event('resource', phoneId, 'create', {
      id: phoneId,
      availabilityJson: '{"nota":"WhatsApp +54 261 555-1234"}',
      audience: 'collective',
    }), `resource:${phoneId}:create`), 'PERSONAL_CONTACT_FORBIDDEN');

    const safeId = uuid(sequence++);
    await expect(service.ingest(actor(1), event('need', safeId, 'create', {
      id: safeId,
      description: 'Disponible desde 2026-07-13; referencia pública en la plaza.',
      audience: 'collective',
    }), `need:${safeId}:create`)).resolves.toMatchObject({ status: 'accepted' });
  });

  it('acepta revocación append-only del owner y rechaza sobres ambiguos', async () => {
    const store = new MemoryCivicStore();
    const service = new CivicEventService(store);
    const observationId = uuid(sequence++);
    await service.ingest(actor(1), event('observation', observationId, 'create', {
      id: observationId,
      creatorKey: actorKey(1),
      audience: 'collective',
    }), `observation:${observationId}:create`);

    await expect(service.ingest(actor(1), event('observation', observationId, 'update', {
      id: observationId,
      audience: 'collective',
      campaignKey: 'luminarias-v1',
      revokedAt: '2026-07-14T01:00:00.000Z',
    }), `observation:${observationId}:revoke`)).resolves.toMatchObject({ status: 'accepted' });
    expect(store.events.at(-1)?.event).toMatchObject({
      operation: 'update',
      payload: {
        audience: 'collective', campaignKey: 'luminarias-v1',
        revokedAt: '2026-07-14T01:00:00.000Z',
      },
    });

    const invalidId = uuid(sequence++);
    await expectCode(service.ingest(actor(1), event('resource', invalidId, 'create', {
      id: invalidId,
      audience: 'collective',
      revokedAt: '2026-07-14T01:00:00.000Z',
    }), `resource:${invalidId}:create`), 'INVALID_REVOCATION_OPERATION');

    await expectCode(service.ingest(actor(1), event('observation', observationId, 'update', {
      id: observationId,
      audience: 'collective',
      campaignKey: 'luminarias-v1',
      revokedAt: 'ayer',
    }), `observation:${observationId}:bad-revoke`), 'INVALID_REVOCATION_TIMESTAMP');

    await expectCode(service.ingest(actor(1), event('observation', observationId, 'update', {
      id: observationId,
      audience: 'collective',
      campaignKey: 'luminarias-v1',
      revokedAt: '2026-07-14T01:00:00.000Z',
      reason: 'un texto que no debe quedar en el evento público',
    }), `observation:${observationId}:verbose-revoke`), 'INVALID_REVOCATION_FIELDS');
  });

  it('ignora estado y confianza autodeclarados en correcciones de entidades públicas', async () => {
    const store = new MemoryCivicStore();
    const service = new CivicEventService(store);
    const observationId = uuid(sequence++);
    const needId = uuid(sequence++);
    const resourceId = uuid(sequence++);

    await service.ingest(actor(1), event('observation', observationId, 'create', {
      id: observationId,
      creatorKey: actorKey(1),
      title: 'Señal original',
      audience: 'collective',
    }), `observation:${observationId}:create`);
    await service.ingest(actor(1), event('need', needId, 'create', {
      id: needId,
      title: 'Necesidad original',
      audience: 'collective',
    }), `need:${needId}:create`);
    await service.ingest(actor(1), event('resource', resourceId, 'create', {
      id: resourceId,
      title: 'Recurso original',
      audience: 'collective',
    }), `resource:${resourceId}:create`);

    await service.ingest(actor(1), event('observation', observationId, 'update', {
      id: observationId,
      title: 'Señal corregida',
      status: 'corroborated',
      confidence: 1,
      audience: 'collective',
    }), `observation:${observationId}:correction`);
    await service.ingest(actor(1), event('need', needId, 'update', {
      id: needId,
      title: 'Necesidad corregida',
      status: 'resolved',
      audience: 'collective',
    }), `need:${needId}:correction`);
    await service.ingest(actor(1), event('resource', resourceId, 'update', {
      id: resourceId,
      title: 'Recurso corregido',
      status: 'depleted',
      confidence: 1,
      audience: 'collective',
    }), `resource:${resourceId}:correction`);

    const corrections = store.events.filter((row) => row.event.operation === 'update');
    expect(corrections).toHaveLength(3);
    expect(corrections.map((row) => row.event.payload)).toEqual([
      { id: observationId, title: 'Señal corregida', audience: 'collective' },
      { id: needId, title: 'Necesidad corregida', audience: 'collective' },
      { id: resourceId, title: 'Recurso corregido', audience: 'collective' },
    ]);
  });

  it('vincula creatorKey al token y bloquea la auto-verificación', async () => {
    const store = new MemoryCivicStore();
    const service = new CivicEventService(store);
    const badId = uuid(5);
    await expectCode(service.ingest(actor(1), event('observation', badId, 'create', {
      id: badId, creatorKey: actorKey(2),
    }), `observation:${badId}:create`), 'ACTOR_MISMATCH');

    const observationId = uuid(6);
    await service.ingest(actor(1), event('observation', observationId, 'create', {
      id: observationId, creatorKey: actorKey(1),
    }), `observation:${observationId}:create`);
    const verificationId = uuid(7);
    await expectCode(service.ingest(actor(1), event('verification', verificationId, 'create', {
      id: verificationId, observationId, verifierKey: actorKey(1), verdict: 'confirm',
    }), `verification:${verificationId}:create`), 'SELF_VERIFICATION_FORBIDDEN');
  });

  it('permite una sola verificación independiente por actor', async () => {
    const store = new MemoryCivicStore();
    const service = new CivicEventService(store);
    const observationId = uuid(8);
    await service.ingest(actor(1), event('observation', observationId, 'create', {
      id: observationId, creatorKey: actorKey(1),
    }), `observation:${observationId}:create`);

    const firstId = uuid(9);
    await expect(service.ingest(actor(2), event('verification', firstId, 'create', {
      id: firstId, observationId, verifierKey: actorKey(2), verdict: 'confirm',
    }), `verification:${firstId}:create`)).resolves.toMatchObject({ status: 'accepted' });

    const secondId = uuid(10);
    await expectCode(service.ingest(actor(2), event('verification', secondId, 'create', {
      id: secondId, observationId, verifierKey: actorKey(2), verdict: 'correct',
    }), `verification:${secondId}:create`), 'ALREADY_VERIFIED');
  });

  it('no confunde dos teléfonos de una misma cuenta con dos miradas independientes', async () => {
    const store = new MemoryCivicStore();
    store.devices.set(actorKey(1), { actorKey: actorKey(1), secretHash: 'a', role: 'contributor', linkedUserId: 77, revokedAt: null });
    store.devices.set(actorKey(2), { actorKey: actorKey(2), secretHash: 'b', role: 'contributor', linkedUserId: 77, revokedAt: null });
    const service = new CivicEventService(store);
    const observationId = uuid(18);
    await service.ingest(actor(1, 'contributor', 77), event('observation', observationId, 'create', {
      id: observationId, creatorKey: actorKey(1),
    }), `observation:${observationId}:create`);

    const verificationId = uuid(19);
    await expectCode(service.ingest(actor(2, 'contributor', 77), event('verification', verificationId, 'create', {
      id: verificationId, observationId, verifierKey: actorKey(2), verdict: 'confirm',
    }), `verification:${verificationId}:create`), 'SELF_VERIFICATION_FORBIDDEN');

    const needId = uuid(20);
    const resourceId = uuid(21);
    const matchId = uuid(22);
    await service.ingest(actor(1, 'contributor', 77), event('need', needId, 'create', { id: needId }), `need:${needId}:create`);
    await service.ingest(actor(2, 'contributor', 77), event('resource', resourceId, 'create', { id: resourceId }), `resource:${resourceId}:create`);
    await expectCode(service.ingest(actor(1, 'contributor', 77), event('match', matchId, 'create', {
      id: matchId, needId, resourceId,
    }), `match:${matchId}:create`), 'DISTINCT_PARTIES_REQUIRED');
  });

  it('exige dos identidades y aceptación desde el lado correcto', async () => {
    const store = new MemoryCivicStore();
    const service = new CivicEventService(store);
    const needId = uuid(11);
    const resourceId = uuid(12);
    await service.ingest(actor(1), event('need', needId, 'create', { id: needId, title: 'Necesidad' }), `need:${needId}:create`);
    await service.ingest(actor(2), event('resource', resourceId, 'create', { id: resourceId, title: 'Recurso' }), `resource:${resourceId}:create`);

    const matchId = uuid(13);
    await service.ingest(actor(1), event('match', matchId, 'create', {
      id: matchId, needId, resourceId, status: 'proposed',
    }), `match:${matchId}:create`);

    await service.ingest(actor(1), event('match', matchId, 'transition', {
      acceptedNeedBy: actorKey(1), acceptedNeedAt: new Date().toISOString(),
    }), `match:${matchId}:accept:need`);
    await expectCode(service.ingest(actor(1), event('match', matchId, 'transition', {
      acceptedResourceBy: actorKey(1),
    }), `match:${matchId}:accept:resource:wrong`), 'AUTHORIZATION_FAILED');
    await expect(service.ingest(actor(2), event('match', matchId, 'transition', {
      acceptedResourceBy: actorKey(2), acceptedResourceAt: new Date().toISOString(), status: 'accepted',
    }), `match:${matchId}:accept:resource`)).resolves.toMatchObject({ status: 'accepted' });

    await expectCode(service.ingest(actor(2), event('match', matchId, 'transition', { status: 'confirmed' }), `match:${matchId}:confirm:wrong`), 'AUTHORIZATION_FAILED');
    await expectCode(service.ingest(actor(1), event('match', matchId, 'transition', { status: 'confirmed' }), `match:${matchId}:confirm:early`), 'FULFILLMENT_REQUIRED');
    await service.ingest(actor(2), event('match', matchId, 'transition', { status: 'fulfilled' }), `match:${matchId}:fulfilled`);
    await expect(service.ingest(actor(1), event('match', matchId, 'transition', { status: 'confirmed' }), `match:${matchId}:confirm`))
      .resolves.toMatchObject({ status: 'accepted' });
  });

  it('separa quién entrega de quién confirma el resultado', async () => {
    const store = new MemoryCivicStore();
    const service = new CivicEventService(store);
    const needId = uuid(14);
    const resourceId = uuid(15);
    const matchId = uuid(16);
    const actionId = uuid(17);
    await service.ingest(actor(1), event('need', needId, 'create', { id: needId }), `need:${needId}:create`);
    await service.ingest(actor(2), event('resource', resourceId, 'create', { id: resourceId }), `resource:${resourceId}:create`);
    await service.ingest(actor(1), event('match', matchId, 'create', { id: matchId, needId, resourceId }), `match:${matchId}:create`);
    await expectCode(service.ingest(actor(2), event('action', actionId, 'create', { id: actionId, matchId, title: 'Entrega' }), `action:${actionId}:early`), 'BOTH_ACCEPTANCES_REQUIRED');
    await service.ingest(actor(1), event('match', matchId, 'transition', { acceptedNeedBy: actorKey(1) }), `match:${matchId}:accept:need`);
    await service.ingest(actor(2), event('match', matchId, 'transition', { acceptedResourceBy: actorKey(2), status: 'accepted' }), `match:${matchId}:accept:resource`);
    await service.ingest(actor(2), event('action', actionId, 'create', { id: actionId, matchId, title: 'Entrega' }), `action:${actionId}:create`);

    await expectCode(service.ingest(actor(1), event('action', actionId, 'transition', { status: 'completed' }), `action:${actionId}:complete:wrong`), 'AUTHORIZATION_FAILED');
    await service.ingest(actor(2), event('action', actionId, 'transition', { status: 'completed' }), `action:${actionId}:complete`);
    await expectCode(service.ingest(actor(2), event('action', actionId, 'transition', { status: 'confirmed' }), `action:${actionId}:confirm:wrong`), 'AUTHORIZATION_FAILED');
    await expect(service.ingest(actor(1), event('action', actionId, 'transition', { status: 'confirmed' }), `action:${actionId}:confirm`))
      .resolves.toMatchObject({ status: 'accepted' });
  });
});
