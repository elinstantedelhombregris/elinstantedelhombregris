import { describe, expect, it } from 'vitest';

import {
  createCustodyGrantSchema,
  createCustodyGrantResponseSchema,
  CustodyGrantService,
  type CreateCustodyGrantInput,
  type CreateCustodyGrantResponseInput,
  type CustodyCircleAccess,
  type CustodyDeviceRecord,
  type CustodyGrantStore,
  type CustodyNeedOwnerRecord,
  type StoredCustodyGrant,
  type StoredCustodyGrantResponse,
  type StoredCustodyRevocation,
} from '../../server/civic/custody-grants';
import { CivicApiError } from '../../server/civic/service';
import { custodyTimestampToIsoUtc } from '../../server/civic/custody-timestamps';
import {
  encodeCustodyPageCursor,
  type CustodyPageRequest,
} from '../../server/civic/custody-pagination';

const uuid = (value: number): string => `00000000-0000-4000-8000-${String(value).padStart(12, '0')}`;
const actorKey = (value: number): string => `actor_${uuid(value)}`;
const START = Date.parse('2026-07-14T15:00:00.000Z');

interface MemoryCircle {
  kind: CustodyCircleAccess['kind'];
  isPrivate: boolean;
  members: Map<number, 'coordinador' | 'miembro'>;
}

class MemoryCustodyStore implements CustodyGrantStore {
  activeUsers = new Set<number>();
  devices = new Map<string, CustodyDeviceRecord>();
  circles = new Map<number, MemoryCircle>();
  owners = new Map<string, string>();
  grants: StoredCustodyGrant[] = [];
  revocations: StoredCustodyRevocation[] = [];
  responses: StoredCustodyGrantResponse[] = [];
  coordinationProposalGrantIds = new Set<string>();
  databaseNowMs: number | null = null;
  nextRowId = 1;
  nextResponseRowId = 1;

  async getDevice(key: string) { return this.devices.get(key) ?? null; }
  async isActiveUser(userId: number) { return this.activeUsers.has(userId); }
  async getCircleAccess(circleId: number, userId: number) {
    const circle = this.circles.get(circleId);
    if (!circle) return null;
    return {
      circleId,
      kind: circle.kind,
      isPrivate: circle.isPrivate,
      membershipRole: circle.members.get(userId) ?? null,
      hasCoordinator: [...circle.members.entries()]
        .some(([memberId, role]) => role === 'coordinador' && this.activeUsers.has(memberId)),
    };
  }
  async isCircleCoordinator(circleId: number, userId: number) {
    const circle = this.circles.get(circleId);
    return Boolean(
      circle
      && (circle.kind === 'celula' || circle.isPrivate)
      && circle.members.get(userId) === 'coordinador',
    );
  }
  async getNeedOwner(needId: string): Promise<CustodyNeedOwnerRecord | null> {
    const key = this.owners.get(needId);
    if (!key) return null;
    return { actorKey: key, linkedUserId: this.devices.get(key)?.linkedUserId ?? null };
  }
  async claimNeedOwner(needId: string, key: string) {
    const owner = this.owners.get(needId);
    if (!owner) { this.owners.set(needId, key); return 'claimed' as const; }
    return owner === key ? 'same' as const : 'conflict' as const;
  }
  async findGrantConflicts(grantId: string, userId: number, idempotencyKey: string) {
    return this.grants.filter((row) => row.grantId === grantId
      || (row.grantorUserId === userId && row.idempotencyKey === idempotencyKey));
  }
  async insertGrant(input: Omit<StoredCustodyGrant, 'rowId' | 'revokedAt' | 'closedAt' | 'closedReason'>) {
    if ((await this.findGrantConflicts(input.grantId, input.grantorUserId, input.idempotencyKey)).length) return false;
    if (await this.getOpenGrantForNeed(input.needId)) return false;
    this.grants.push({
      ...input,
      rowId: this.nextRowId++,
      revokedAt: null,
      closedAt: null,
      closedReason: null,
    });
    return true;
  }
  async getGrant(grantId: string) { return this.grants.find((row) => row.grantId === grantId) ?? null; }
  async getGrantForUpdate(grantId: string) { return this.getGrant(grantId); }
  async getRespondableGrant(grantId: string, userId: number, now: string) {
    const grant = await this.getGrant(grantId);
    if (!grant || grant.revokedAt || grant.closedAt || grant.expiresAt <= now || !this.activeUsers.has(userId)) return null;
    const circle = this.circles.get(grant.recipientCircleId);
    if (!circle || (!circle.isPrivate && circle.kind !== 'celula')) return null;
    return circle.members.get(userId) === 'coordinador' ? grant : null;
  }
  async getOpenGrantForNeed(needId: string) {
    return this.grants.find((row) => row.needId === needId && row.closedAt == null) ?? null;
  }
  async listActiveInbox(
    userId: number,
    limit: number,
    now: string,
    page: CustodyPageRequest | null = null,
  ) {
    const currentMs = Math.max(Date.parse(now), this.databaseNowMs ?? Number.NEGATIVE_INFINITY);
    const observedAtMs = page ? Math.min(Date.parse(page.asOf), currentMs) : currentMs;
    const observedAt = new Date(observedAtMs).toISOString();
    if (!this.activeUsers.has(userId)) {
      return { authorized: false, rows: [], refreshedAt: null };
    }
    const grants = this.grants
      .filter((row) => !row.revokedAt && !row.closedAt
        && Date.parse(row.createdAt) <= observedAtMs
        && Date.parse(row.expiresAt) > currentMs
        && this.circles.get(row.recipientCircleId)?.members.get(userId) === 'coordinador')
      .filter((row) => {
        const circle = this.circles.get(row.recipientCircleId);
        return Boolean(circle && (circle.kind === 'celula' || circle.isPrivate));
      })
      .filter((row) => !page || row.rowId < page.after.rowId)
      .sort((left, right) => right.rowId - left.rowId)
      .slice(0, limit);
    return {
      authorized: true,
      rows: grants.map((grant) => ({
        grant,
        response: [...this.responses].reverse().find((response) => (
          response.grantId === grant.grantId
          && response.applied
          && Date.parse(response.createdAt) <= observedAtMs
        )) ?? null,
      })),
      refreshedAt: observedAt,
    };
  }
  async markGrantRevoked(grantId: string, _userId: number, revokedAt: string) {
    const row = this.grants.find((item) => item.grantId === grantId);
    const effectiveNow = Math.max(Date.parse(revokedAt), this.databaseNowMs ?? Number.NEGATIVE_INFINITY);
    if (!row || row.closedAt || Date.parse(row.expiresAt) <= effectiveNow) return null;
    const authoritativeRevokedAt = new Date(this.databaseNowMs ?? Date.parse(revokedAt)).toISOString();
    row.revokedAt = authoritativeRevokedAt;
    row.closedAt = authoritativeRevokedAt;
    row.closedReason = 'revoked';
    return authoritativeRevokedAt;
  }
  async isGrantExpired(grantId: string, now: string) {
    const row = this.grants.find((item) => item.grantId === grantId);
    const effectiveNow = Math.max(Date.parse(now), this.databaseNowMs ?? Number.NEGATIVE_INFINITY);
    return Boolean(row && Date.parse(row.expiresAt) <= effectiveNow);
  }
  async markGrantExpired(grantId: string, closedAt: string) {
    const row = this.grants.find((item) => item.grantId === grantId);
    if (!row || row.closedAt || row.expiresAt > closedAt) return false;
    row.closedAt = closedAt;
    row.closedReason = 'expired';
    return true;
  }
  async findRevocation(userId: number, idempotencyKey: string) {
    return this.revocations.find((row) => row.revokedByUserId === userId && row.idempotencyKey === idempotencyKey) ?? null;
  }
  async appendRevocation(input: StoredCustodyRevocation) {
    if (await this.findRevocation(input.revokedByUserId, input.idempotencyKey)) return false;
    this.revocations.push(input);
    return true;
  }
  async findResponseConflicts(responseId: string, userId: number, idempotencyKey: string) {
    return this.responses.filter((row) => row.responseId === responseId
      || (row.responderUserId === userId && row.idempotencyKey === idempotencyKey));
  }
  async getLatestAppliedResponse(grantId: string) {
    return [...this.responses]
      .reverse()
      .find((row) => row.grantId === grantId && row.applied) ?? null;
  }
  async listLatestAppliedResponses(grantIds: string[]) {
    const ids = new Set(grantIds);
    const latest = new Map<string, StoredCustodyGrantResponse>();
    for (const response of [...this.responses].reverse()) {
      if (ids.has(response.grantId) && response.applied && !latest.has(response.grantId)) {
        latest.set(response.grantId, response);
      }
    }
    return [...latest.values()];
  }
  async insertResponse(input: Omit<StoredCustodyGrantResponse, 'rowId' | 'createdAt'>) {
    if ((await this.findResponseConflicts(input.responseId, input.responderUserId, input.idempotencyKey)).length) {
      return null;
    }
    const row: StoredCustodyGrantResponse = {
      ...input,
      rowId: this.nextResponseRowId,
      createdAt: new Date(START + this.nextResponseRowId * 1_000).toISOString(),
    };
    this.nextResponseRowId += 1;
    this.responses.push(row);
    this.databaseNowMs = Math.max(this.databaseNowMs ?? Number.NEGATIVE_INFINITY, Date.parse(row.createdAt));
    return row;
  }
  async hasCoordinationProposal(grantId: string) {
    return this.coordinationProposalGrantIds.has(grantId);
  }
}

const actor = (value: number, userId: number | null): CustodyDeviceRecord => ({
  actorKey: actorKey(value),
  linkedUserId: userId,
  revokedAt: null,
});

const request = (
  id: number,
  circleId = 10,
  expiresAt = new Date(START + 30 * 24 * 60 * 60_000).toISOString(),
): CreateCustodyGrantInput => ({
  grantId: uuid(id),
  needId: uuid(10_000 + id),
  recipient: { type: 'circle', id: circleId },
  expiresAt,
  need: {
    category: 'food',
    quantity: 12,
    unit: 'meals',
    urgency: 4,
    location: { lat: -32.887172, lng: -68.843589, precision: '500m' },
  },
});

const responseRequest = (
  grantId: string,
  id: number,
  disposition: CreateCustodyGrantResponseInput['disposition'],
  quantity?: number | null,
): CreateCustodyGrantResponseInput => ({
  grantId,
  responseId: uuid(20_000 + id),
  disposition,
  ...(quantity === undefined ? {} : { quantity }),
});

const setup = () => {
  const store = new MemoryCustodyStore();
  store.activeUsers.add(1);
  store.activeUsers.add(2);
  store.activeUsers.add(3);
  store.devices.set(actorKey(1), actor(1, 1));
  store.devices.set(actorKey(2), actor(2, 2));
  store.devices.set(actorKey(3), actor(3, 3));
  store.circles.set(10, {
    kind: 'celula',
    isPrivate: true,
    members: new Map([[1, 'miembro'], [2, 'coordinador'], [3, 'miembro']]),
  });
  return store;
};

const expectCode = async (promise: Promise<unknown>, code: string) => {
  await expect(promise).rejects.toMatchObject<CivicApiError>({ code });
};

describe('contrato de custody grants', () => {
  it('alinea el contrato y PostgreSQL en UUID v4', () => {
    const base = request(30);
    expect(createCustodyGrantSchema.safeParse(base).success).toBe(true);
    const uppercase = createCustodyGrantSchema.safeParse({
      ...base,
      grantId: base.grantId.toUpperCase(),
      needId: base.needId.toUpperCase(),
    });
    expect(uppercase.success).toBe(true);
    if (uppercase.success) {
      expect(uppercase.data.grantId).toBe(base.grantId);
      expect(uppercase.data.needId).toBe(base.needId);
    }
    expect(createCustodyGrantSchema.safeParse({
      ...base,
      grantId: '01890f3e-7b2c-7cc1-98c8-0f6f67b5f3af',
    }).success).toBe(false);
    expect(createCustodyGrantSchema.safeParse({
      ...base,
      needId: '00000000-0000-0000-0000-000000000000',
    }).success).toBe(false);
  });

  it('rechaza relato, contacto, custodio y cualquier otra clave no allowlisted', () => {
    const base = request(1);
    for (const forbidden of [
      { story: 'Vivo en Calle Secreta 123' },
      { contact: '+54 261 555 1234' },
      { custodian: 'referente local' },
      { description: 'texto libre' },
    ]) {
      const parsed = createCustodyGrantSchema.safeParse({
        ...base,
        need: { ...base.need, ...forbidden },
      });
      expect(parsed.success).toBe(false);
    }
    expect(createCustodyGrantSchema.safeParse({
      ...base,
      need: { ...base.need, unit: 'mi teléfono es 2615555555' },
    }).success).toBe(false);
  });

  it('persiste sólo códigos/números y verifica otra vez la grilla en servidor', async () => {
    const store = setup();
    const service = new CustodyGrantService(store, () => new Date(START));
    const input = request(2);

    const result = await service.create(actor(1, 1), 1, input, 'custody:create:2');

    expect(result.status).toBe('accepted');
    expect(result.grant.payload).toEqual({
      category: 'food',
      quantity: 12,
      unit: 'meals',
      urgency: 4,
      location: expect.objectContaining({ precision: '500m' }),
    });
    expect(result.grant.payload.location).toEqual(input.need.location);
    expect(Object.keys(result.grant.payload).sort()).toEqual(['category', 'location', 'quantity', 'unit', 'urgency']);
    expect(result.grant).not.toHaveProperty('needId');
    expect(JSON.stringify(result.grant)).not.toMatch(/story|relato|contact|custod|actorKey|userId/i);
    expect(store.owners.get(input.needId)).toBe(actorKey(1));
  });

  it('rechaza coordenadas crudas aunque declaren una precisión segura', async () => {
    const store = setup();
    const service = new CustodyGrantService(store, () => new Date(START));
    const input = request(25);
    await expectCode(service.create(actor(1, 1), 1, {
      ...input,
      need: {
        ...input.need,
        location: { lat: -32.88912345, lng: -68.84567891, precision: '500m' },
      },
    }, 'custody:create:25'), 'CUSTODY_LOCATION_NOT_REDUCED');
    expect(store.grants).toEqual([]);
  });

  it('hace replay idempotente y detecta reuso conflictivo', async () => {
    const store = setup();
    const service = new CustodyGrantService(store, () => new Date(START));
    const input = request(3);

    await expect(service.create(actor(1, 1), 1, input, 'custody:create:3'))
      .resolves.toMatchObject({ status: 'accepted' });
    await expect(service.create(actor(1, 1), 1, input, 'custody:create:3'))
      .resolves.toMatchObject({ status: 'duplicate' });
    await expectCode(service.create(
      actor(1, 1),
      1,
      { ...input, need: { ...input.need, urgency: 5 } },
      'custody:create:3',
    ), 'CUSTODY_IDEMPOTENCY_CONFLICT');
    expect(store.grants).toHaveLength(1);
  });

  it('mantiene el replay idempotente cuando ya quedan menos de cinco minutos', async () => {
    const store = setup();
    let now = START;
    const service = new CustodyGrantService(store, () => new Date(now));
    const input = request(26, 10, new Date(START + 10 * 60_000).toISOString());

    await expect(service.create(actor(1, 1), 1, input, 'custody:create:26'))
      .resolves.toMatchObject({ status: 'accepted' });
    now = START + 6 * 60_000;
    await expect(service.create(actor(1, 1), 1, input, 'custody:create:26'))
      .resolves.toMatchObject({ status: 'duplicate', grant: { state: 'active' } });
    expect(store.grants).toHaveLength(1);
  });

  it('nunca presenta como activo un grant legado cerrado por reemplazo', async () => {
    const store = setup();
    const service = new CustodyGrantService(store, () => new Date(START));
    const input = request(34);

    await service.create(actor(1, 1), 1, input, 'custody:create:34');
    store.grants[0].closedAt = new Date(START + 60_000).toISOString();
    store.grants[0].closedReason = 'superseded';

    await expect(service.create(actor(1, 1), 1, input, 'custody:create:34'))
      .resolves.toMatchObject({ status: 'duplicate', grant: { state: 'closed' } });
  });

  it('falla cerrado sin vínculo, membresía o círculo custodial', async () => {
    const store = setup();
    store.devices.set(actorKey(4), actor(4, null));
    store.circles.set(20, {
      kind: 'territorial',
      isPrivate: false,
      members: new Map([[1, 'miembro'], [2, 'coordinador']]),
    });
    store.circles.set(30, {
      kind: 'tematica',
      isPrivate: true,
      members: new Map([[2, 'coordinador']]),
    });
    const service = new CustodyGrantService(store, () => new Date(START));

    await expectCode(service.create(actor(4, null), 1, request(4), 'custody:create:4'), 'LINKED_DEVICE_REQUIRED');
    await expectCode(service.create(actor(1, 1), 1, request(5, 20), 'custody:create:5'), 'CUSTODY_RECIPIENT_NOT_AVAILABLE');
    await expectCode(service.create(actor(1, 1), 1, request(6, 30), 'custody:create:6'), 'CUSTODY_RECIPIENT_NOT_AVAILABLE');
  });

  it('no abre una custodia si el único coordinador está inactivo', async () => {
    const store = setup();
    store.activeUsers.delete(2);
    const service = new CustodyGrantService(store, () => new Date(START));

    await expectCode(
      service.create(actor(1, 1), 1, request(29), 'custody:create:29'),
      'CUSTODY_RECIPIENT_NOT_AVAILABLE',
    );
    expect(store.grants).toEqual([]);
  });

  it('mantiene un solo grant abierto por necesidad y libera el slot al vencer', async () => {
    const store = setup();
    let now = START;
    const service = new CustodyGrantService(store, () => new Date(now));
    const first = request(27, 10, new Date(START + 10 * 60_000).toISOString());
    const second = {
      ...request(28, 10, new Date(START + 30 * 24 * 60 * 60_000).toISOString()),
      needId: first.needId,
    };

    await service.create(actor(1, 1), 1, first, 'custody:create:27');
    await expectCode(
      service.create(actor(1, 1), 1, second, 'custody:create:28'),
      'CUSTODY_ACTIVE_GRANT_EXISTS',
    );
    now = START + 11 * 60_000;
    await expect(service.create(actor(1, 1), 1, second, 'custody:create:28'))
      .resolves.toMatchObject({ status: 'accepted' });
    expect(store.grants).toHaveLength(2);
    expect(store.grants[0]).toMatchObject({ closedReason: 'expired' });
    expect(store.grants[1]).toMatchObject({ closedAt: null });
  });

  it('bloquea organizaciones hasta que exista identidad y representación verificable', async () => {
    const store = setup();
    const service = new CustodyGrantService(store, () => new Date(START));
    const input: CreateCustodyGrantInput = {
      ...request(7),
      recipient: { type: 'organization', id: uuid(900) },
    };
    await expectCode(service.create(actor(1, 1), 1, input, 'custody:create:7'), 'ORGANIZATION_IDENTITY_UNAVAILABLE');
    expect(store.grants).toEqual([]);
  });

  it('exige vigencia acotada incluso con un contrato sintácticamente válido', async () => {
    const store = setup();
    const service = new CustodyGrantService(store, () => new Date(START));
    await expectCode(service.create(
      actor(1, 1),
      1,
      request(8, 10, new Date(START + 60_000).toISOString()),
      'custody:create:8',
    ), 'INVALID_CUSTODY_EXPIRY');
    await expectCode(service.create(
      actor(1, 1),
      1,
      request(9, 10, new Date(START + 91 * 24 * 60 * 60_000).toISOString()),
      'custody:create:9',
    ), 'INVALID_CUSTODY_EXPIRY');
  });

  it('acepta otro dispositivo de la misma cuenta, pero no transfiere la propiedad entre cuentas', async () => {
    const store = setup();
    store.devices.set(actorKey(11), actor(11, 1));
    const ownedNeed = uuid(11_111);
    store.owners.set(ownedNeed, actorKey(1));
    const service = new CustodyGrantService(store, () => new Date(START));

    await expect(service.create(
      actor(11, 1),
      1,
      { ...request(10), needId: ownedNeed },
      'custody:create:10',
    )).resolves.toMatchObject({ status: 'accepted' });
    expect(store.grants[0].ownerActorKey).toBe(actorKey(1));

    await expectCode(service.create(
      actor(2, 2),
      2,
      { ...request(11), needId: ownedNeed },
      'custody:create:11',
    ), 'NEED_OWNERSHIP_UNPROVEN');
  });
});

describe('respuesta mínima de custody grants', () => {
  it('mantiene un body estricto, UUID v4 canónico y assessing sin cantidad', () => {
    const base = responseRequest(request(40).grantId, 1, 'assessing');
    expect(createCustodyGrantResponseSchema.safeParse(base).success).toBe(true);
    const uppercase = createCustodyGrantResponseSchema.safeParse({
      ...base,
      grantId: base.grantId.toUpperCase(),
      responseId: base.responseId.toUpperCase(),
    });
    expect(uppercase.success).toBe(true);
    if (uppercase.success) {
      expect(uppercase.data.grantId).toBe(base.grantId);
      expect(uppercase.data.responseId).toBe(base.responseId);
    }
    expect(createCustodyGrantResponseSchema.safeParse({ ...base, quantity: 1 }).success).toBe(false);
    expect(createCustodyGrantResponseSchema.safeParse({ ...base, contact: '2615555555' }).success).toBe(false);
    expect(createCustodyGrantResponseSchema.safeParse({
      ...base,
      disposition: 'support_available',
      quantity: 0,
    }).success).toBe(false);
  });

  it('aplica la máquina monotónica, idempotencia doble y recibo durable de already_recorded', async () => {
    const store = setup();
    const service = new CustodyGrantService(store, () => new Date(START));
    const grant = request(41);
    await service.create(actor(1, 1), 1, grant, 'custody:create:41');

    await expectCode(service.respond(
      2,
      responseRequest(grant.grantId, 1, 'support_available', 12),
      'custody:respond:41:early',
    ), 'CUSTODY_RESPONSE_ASSESSING_REQUIRED');
    expect(store.responses).toEqual([]);

    const assessing = responseRequest(grant.grantId, 2, 'assessing');
    const first = await service.respond(2, assessing, 'custody:respond:41:assessing');
    expect(first).toMatchObject({
      contract: 'basta-civic-custody-grants/v1',
      status: 'accepted',
      grant: {
        response: { disposition: 'assessing', quantity: null, unit: null },
      },
      recordedResponse: {
        responseId: assessing.responseId,
        disposition: 'assessing',
        quantity: null,
        unit: null,
      },
    });
    expect(JSON.stringify(first.grant.response)).not.toMatch(/responseId|responder|userId|needId|idempotency|requestHash/i);
    expect(store.responses).toHaveLength(1);
    expect(store.responses[0]).toMatchObject({ applied: true });

    await expect(service.respond(2, assessing, 'custody:respond:41:assessing'))
      .resolves.toMatchObject({ status: 'duplicate' });
    await expectCode(
      service.respond(2, assessing, 'custody:respond:41:different-key'),
      'CUSTODY_RESPONSE_IDEMPOTENCY_CONFLICT',
    );
    await expectCode(
      service.respond(
        2,
        responseRequest(grant.grantId, 3, 'assessing'),
        'custody:respond:41:assessing',
      ),
      'CUSTODY_RESPONSE_IDEMPOTENCY_CONFLICT',
    );

    const repeatedAssessing = responseRequest(grant.grantId, 4, 'assessing');
    await expect(service.respond(2, repeatedAssessing, 'custody:respond:41:already'))
      .resolves.toMatchObject({
        status: 'already_recorded',
        grant: { response: { disposition: 'assessing' } },
      });
    expect(store.responses).toHaveLength(2);
    expect(store.responses[1]).toMatchObject({ applied: false });
    await expect(service.respond(2, repeatedAssessing, 'custody:respond:41:already'))
      .resolves.toMatchObject({ status: 'duplicate' });

    const support = responseRequest(grant.grantId, 5, 'support_available', 12);
    await expect(service.respond(2, support, 'custody:respond:41:support'))
      .resolves.toMatchObject({
        status: 'accepted',
        grant: { response: { disposition: 'support_available', quantity: 12, unit: 'meals' } },
      });
    await expectCode(service.respond(
      2,
      responseRequest(grant.grantId, 6, 'assessing'),
      'custody:respond:41:regression',
    ), 'CUSTODY_RESPONSE_REGRESSION');

    await expect(service.respond(
      2,
      responseRequest(grant.grantId, 7, 'support_available', 6),
      'custody:respond:41:revision',
    )).resolves.toMatchObject({
      status: 'accepted',
      grant: { response: { disposition: 'support_available', quantity: 6, unit: 'meals' } },
    });

    // El estado vigente puede avanzar antes de recuperar un HTTP perdido. El
    // recibo separa ambos hechos: `grant.response` es 6, pero la constancia
    // idempotente recuperada sigue probando exactamente la operación de 12.
    await expect(service.respond(2, support, 'custody:respond:41:support'))
      .resolves.toMatchObject({
        status: 'duplicate',
        grant: { response: { disposition: 'support_available', quantity: 6, unit: 'meals' } },
        recordedResponse: {
          responseId: support.responseId,
          disposition: 'support_available',
          quantity: 12,
          unit: 'meals',
        },
      });

    await expect(service.create(actor(1, 1), 1, grant, 'custody:create:41'))
      .resolves.toMatchObject({
        status: 'duplicate',
        grant: { response: { disposition: 'support_available', quantity: 6, unit: 'meals' } },
      });
    await expect(service.listInbox(2, 50)).resolves.toMatchObject({
      grants: [{ response: { disposition: 'support_available', quantity: 6, unit: 'meals' } }],
    });
  });

  it('deja quantity opcional, deriva unit y rechaza sólo cantidades que exceden el pedido', async () => {
    const store = setup();
    const service = new CustodyGrantService(store, () => new Date(START));
    const quantified = request(42);
    await service.create(actor(1, 1), 1, quantified, 'custody:create:42');
    await service.respond(
      2,
      responseRequest(quantified.grantId, 10, 'assessing'),
      'custody:respond:42:assessing',
    );
    await expect(service.respond(
      2,
      responseRequest(quantified.grantId, 11, 'support_available'),
      'custody:respond:42:no-quantity',
    )).resolves.toMatchObject({
      grant: { response: { disposition: 'support_available', quantity: null, unit: null } },
    });
    await expectCode(service.respond(
      2,
      responseRequest(quantified.grantId, 12, 'support_available', 13),
      'custody:respond:42:too-much',
    ), 'INVALID_CUSTODY_RESPONSE_QUANTITY');
    await expect(service.respond(
      2,
      responseRequest(quantified.grantId, 13, 'support_available', 0.1),
      'custody:respond:42:fraction',
    )).resolves.toMatchObject({ grant: { response: { quantity: 0.1, unit: 'meals' } } });

    const unquantified = {
      ...request(43),
      need: { ...request(43).need, quantity: 12, unit: null },
    };
    await service.create(actor(1, 1), 1, unquantified, 'custody:create:43');
    await service.respond(
      2,
      responseRequest(unquantified.grantId, 14, 'assessing'),
      'custody:respond:43:assessing',
    );
    await expectCode(service.respond(
      2,
      responseRequest(unquantified.grantId, 15, 'support_available', 1),
      'custody:respond:43:quantity',
    ), 'INVALID_CUSTODY_RESPONSE_QUANTITY');
    await expect(service.respond(
      2,
      responseRequest(unquantified.grantId, 16, 'support_available'),
      'custody:respond:43:no-quantity',
    )).resolves.toMatchObject({ grant: { response: { quantity: null, unit: null } } });
  });

  it('revalida cuenta, coordinación y círculo incluso en replay, pero recupera el exacto tras expirar', async () => {
    const store = setup();
    let now = START;
    const service = new CustodyGrantService(store, () => new Date(now));
    const grant = request(44, 10, new Date(START + 10 * 60_000).toISOString());
    await service.create(actor(1, 1), 1, grant, 'custody:create:44');
    const assessing = responseRequest(grant.grantId, 20, 'assessing');

    await expectCode(
      service.respond(3, assessing, 'custody:respond:44:outsider'),
      'CUSTODY_GRANT_NOT_FOUND',
    );
    await service.respond(2, assessing, 'custody:respond:44:assessing');
    store.circles.get(10)!.members.delete(2);
    await expectCode(
      service.respond(2, assessing, 'custody:respond:44:assessing'),
      'CUSTODY_GRANT_NOT_FOUND',
    );
    store.circles.get(10)!.members.set(2, 'coordinador');
    store.circles.get(10)!.kind = 'tematica';
    store.circles.get(10)!.isPrivate = false;
    await expectCode(
      service.respond(2, assessing, 'custody:respond:44:assessing'),
      'CUSTODY_GRANT_NOT_FOUND',
    );
    store.circles.get(10)!.kind = 'celula';
    store.activeUsers.delete(2);
    await expectCode(
      service.respond(2, assessing, 'custody:respond:44:assessing'),
      'ACCOUNT_NOT_ACTIVE',
    );
    store.activeUsers.add(2);
    now = START + 11 * 60_000;
    await expect(service.respond(2, assessing, 'custody:respond:44:assessing'))
      .resolves.toMatchObject({ status: 'duplicate', grant: { state: 'expired' } });
    await expectCode(service.respond(
      2,
      responseRequest(grant.grantId, 21, 'assessing'),
      'custody:respond:44:fresh-after-expiry',
    ), 'CUSTODY_GRANT_NOT_FOUND');
  });

  it('recupera el replay exacto tras revocar, pero corta toda respuesta nueva', async () => {
    const store = setup();
    const service = new CustodyGrantService(store, () => new Date(START));
    const grant = request(45);
    const assessing = responseRequest(grant.grantId, 30, 'assessing');
    await service.create(actor(1, 1), 1, grant, 'custody:create:45');
    await service.respond(2, assessing, 'custody:respond:45:assessing');
    await service.revoke(1, grant.grantId, 'custody:revoke:45');

    await expect(service.respond(2, assessing, 'custody:respond:45:assessing'))
      .resolves.toMatchObject({ status: 'duplicate', grant: { state: 'revoked' } });
    await expectCode(service.respond(
      2,
      responseRequest(grant.grantId, 31, 'assessing'),
      'custody:respond:45:fresh-after-revoke',
    ), 'CUSTODY_GRANT_NOT_FOUND');
  });

  it('congela support_available después de una propuesta sin romper el replay exacto previo', async () => {
    const store = setup();
    const service = new CustodyGrantService(store, () => new Date(START));
    const grant = request(46);
    await service.create(actor(1, 1), 1, grant, 'custody:create:46');
    await service.respond(
      2,
      responseRequest(grant.grantId, 40, 'assessing'),
      'custody:respond:46:assessing',
    );
    const support = responseRequest(grant.grantId, 41, 'support_available', 8);
    await service.respond(2, support, 'custody:respond:46:support');
    store.coordinationProposalGrantIds.add(grant.grantId);

    await expect(service.respond(2, support, 'custody:respond:46:support'))
      .resolves.toMatchObject({ status: 'duplicate' });
    await expectCode(service.respond(
      2,
      responseRequest(grant.grantId, 42, 'support_available', 6),
      'custody:respond:46:revision',
    ), 'CUSTODY_COORDINATION_PROPOSAL_EXISTS');
    expect(store.responses.filter((row) => row.disposition === 'support_available')).toHaveLength(1);
  });
});

describe('inbox y revocación de custody grants', () => {
  it('canoniza timestamps PostgreSQL en inbox, replays, respuestas y recibos sin mutar las filas', async () => {
    const store = setup();
    const service = new CustodyGrantService(store, () => new Date(START));
    const input = request(47, 10, '2026-08-14T21:59:36.430Z');
    const assessing = responseRequest(input.grantId, 47, 'assessing');
    await service.create(actor(1, 1), 1, input, 'custody:create:47');
    await service.respond(2, assessing, 'custody:respond:47');

    const pgCreatedAt = '2026-07-14 21:59:36.430138+00';
    const pgExpiresAt = '2026-08-14 21:59:36.430138+00';
    const pgRecordedAt = '2026-07-14 22:00:36.987654+00';
    store.grants[0].createdAt = pgCreatedAt;
    store.grants[0].expiresAt = pgExpiresAt;
    store.responses[0].createdAt = pgRecordedAt;
    store.databaseNowMs = Date.parse('2026-07-14T23:00:00.000Z');

    const inbox = await service.listInbox(2, 50);
    const createReplay = await service.create(actor(1, 1), 1, input, 'custody:create:47');
    const responseReplay = await service.respond(2, assessing, 'custody:respond:47');
    for (const view of [inbox.grants[0], createReplay.grant, responseReplay.grant]) {
      expect(view).toMatchObject({
        createdAt: '2026-07-14T21:59:36.430Z',
        expiresAt: '2026-08-14T21:59:36.430Z',
        response: { recordedAt: '2026-07-14T22:00:36.987Z' },
      });
    }

    await service.revoke(1, input.grantId, 'custody:revoke:47');
    store.revocations[0].revokedAt = pgCreatedAt;
    await expect(service.revoke(1, input.grantId, 'custody:revoke:47')).resolves.toMatchObject({
      status: 'duplicate',
      revokedAt: '2026-07-14T21:59:36.430Z',
    });

    expect(store.grants[0].createdAt).toBe(pgCreatedAt);
    expect(store.grants[0].expiresAt).toBe(pgExpiresAt);
    expect(store.responses[0].createdAt).toBe(pgRecordedAt);
    expect(store.revocations[0].revokedAt).toBe(pgCreatedAt);
  });

  it('falla cerrada si una fecha almacenada no se puede canonizar', () => {
    expect(() => custodyTimestampToIsoUtc(
      'not-a-postgresql-timestamp',
      '$.grant.createdAt',
    )).toThrowError(expect.objectContaining({ code: 'CUSTODY_TIMESTAMP_INVALID' }));
  });

  it('sólo enumera grants activos para coordinadores actuales del círculo destinatario', async () => {
    const store = setup();
    let now = START;
    const service = new CustodyGrantService(store, () => new Date(now));
    const input = request(20, 10, new Date(START + 24 * 60 * 60_000).toISOString());
    await service.create(actor(1, 1), 1, input, 'custody:create:20');

    const coordinatorInbox = await service.listInbox(2, 50);
    expect(coordinatorInbox.scope).toBe('private-circle-coordinator-inbox');
    expect(coordinatorInbox.grants).toHaveLength(1);
    expect(coordinatorInbox.grants[0]).not.toHaveProperty('needId');
    expect(JSON.stringify(coordinatorInbox)).not.toMatch(/actorKey|grantor|userId|contact|story|relato/i);
    await expect(service.listInbox(3, 50)).resolves.toMatchObject({ grants: [] });

    now = START + 2 * 24 * 60 * 60_000;
    await expect(service.listInbox(2, 50)).resolves.toMatchObject({ grants: [] });
  });

  it('revalida la cuenta activa dentro del snapshot del inbox', async () => {
    const store = setup();
    const service = new CustodyGrantService(store, () => new Date(START));
    const input = request(201);
    await service.create(actor(1, 1), 1, input, 'custody:create:inbox-active-user');
    store.activeUsers.delete(2);

    await expectCode(service.listInbox(2, 50), 'ACCOUNT_NOT_ACTIVE');
  });

  it('fija un corte autoritativo y excluye escrituras concurrentes o ya vencidas', async () => {
    const store = setup();
    const service = new CustodyGrantService(store, () => new Date(START));
    const input = request(202, 10, new Date(START + 60 * 60_000).toISOString());
    await service.create(actor(1, 1), 1, input, 'custody:create:inbox-snapshot');
    const assessing = responseRequest(input.grantId, 202, 'assessing');
    await service.respond(2, assessing, 'custody:respond:inbox-snapshot');
    const snapshotMs = store.databaseNowMs!;

    store.responses.push({
      ...store.responses[0],
      rowId: 99_001,
      responseId: uuid(99_001),
      idempotencyKey: 'custody:response:concurrent',
      disposition: 'support_available',
      applied: true,
      createdAt: new Date(snapshotMs + 1_000).toISOString(),
    });
    store.grants.push({
      ...store.grants[0],
      rowId: 99_002,
      grantId: uuid(99_002),
      needId: uuid(199_002),
      idempotencyKey: 'custody:grant:concurrent',
      createdAt: new Date(snapshotMs + 1_000).toISOString(),
    });

    await expect(service.listInbox(2, 50)).resolves.toMatchObject({
      refreshedAt: new Date(snapshotMs).toISOString(),
      grants: [{
        grantId: input.grantId,
        state: 'active',
        response: { disposition: 'assessing' },
      }],
    });

    store.databaseNowMs = Date.parse(store.grants[0].expiresAt);
    await expect(service.listInbox(2, 50)).resolves.toMatchObject({
      refreshedAt: store.grants[0].expiresAt,
      grants: [],
    });
  });

  it('pagina más de 50 grants con keyset estable, incluso cuando createdAt empata', async () => {
    const store = setup();
    const service = new CustodyGrantService(store, () => new Date(START));
    for (let index = 1; index <= 60; index += 1) {
      const input = request(1_000 + index);
      await service.create(actor(1, 1), 1, input, `custody:create:page:${index}`);
    }

    const first = await service.listInbox(2, 50);
    const second = await service.listInbox(2, 50, first.nextCursor!);
    const ids = [...first.grants, ...second.grants].map((item) => item.grantId);
    const decodedCursor = JSON.parse(Buffer.from(first.nextCursor!, 'base64url').toString('utf8')) as object;

    expect(first).toMatchObject({ truncated: true, nextCursor: expect.any(String) });
    expect(first.grants).toHaveLength(50);
    expect(second).toMatchObject({ truncated: false, nextCursor: null });
    expect(second.grants).toHaveLength(10);
    expect(second.refreshedAt).toBe(first.refreshedAt);
    expect(new Set(ids).size).toBe(60);
    expect(ids).toEqual(Array.from({ length: 60 }, (_, index) => uuid(1_060 - index)));
    expect(Object.keys(decodedCursor).sort()).toEqual(['after', 'asOf', 'kind', 'v']);
    expect(JSON.stringify(decodedCursor)).not.toMatch(/needId|grantId|actor|user|circle|payload/i);
  });

  it('el cursor por serial no pierde filas con microsegundos distintos dentro del mismo milisegundo', async () => {
    const store = setup();
    const service = new CustodyGrantService(store, () => new Date(START));
    await service.create(actor(1, 1), 1, request(2_101), 'custody:create:micro:1');
    await service.create(actor(1, 1), 1, request(2_102), 'custody:create:micro:2');
    store.grants[0].createdAt = '2026-07-14 15:00:00.000100+00';
    store.grants[1].createdAt = '2026-07-14 15:00:00.000900+00';
    store.databaseNowMs = START + 1;

    const first = await service.listInbox(2, 1);
    const second = await service.listInbox(2, 1, first.nextCursor!);

    expect([...first.grants, ...second.grants].map((item) => item.grantId))
      .toEqual([uuid(2_102), uuid(2_101)]);
    expect(second.nextCursor).toBeNull();
  });

  it('rechaza cursores inválidos o futuros y un asOf histórico no resucita vencidos', async () => {
    const store = setup();
    const service = new CustodyGrantService(store, () => new Date(START));
    const input = request(2_001, 10, new Date(START + 10 * 60_000).toISOString());
    await service.create(actor(1, 1), 1, input, 'custody:create:cursor-security');

    await expectCode(service.listInbox(2, 50, '%%%'), 'INVALID_CUSTODY_CURSOR');
    const cursorWithSensitiveExtra = Buffer.from(JSON.stringify({
      v: 1,
      kind: 'grant-inbox',
      asOf: new Date(START).toISOString(),
      after: { rowId: 1 },
      needId: input.needId,
    })).toString('base64url');
    await expectCode(service.listInbox(2, 50, cursorWithSensitiveExtra), 'INVALID_CUSTODY_CURSOR');
    await expectCode(service.listInbox(2, 50, encodeCustodyPageCursor('coordination-inbox', {
      asOf: new Date(START).toISOString(),
      after: { rowId: Number.MAX_SAFE_INTEGER },
    })), 'INVALID_CUSTODY_CURSOR');

    store.databaseNowMs = START + 10 * 60_000 + 1;
    const historical = encodeCustodyPageCursor('grant-inbox', {
      asOf: new Date(START).toISOString(),
      after: { rowId: Number.MAX_SAFE_INTEGER },
    });
    await expect(service.listInbox(2, 50, historical)).resolves.toMatchObject({ grants: [] });

    store.databaseNowMs = START;
    const future = encodeCustodyPageCursor('grant-inbox', {
      asOf: new Date(START + 60_000).toISOString(),
      after: { rowId: Number.MAX_SAFE_INTEGER },
    });
    await expectCode(service.listInbox(2, 50, future), 'INVALID_CUSTODY_CURSOR');
  });

  it('permite revocar al emisor o a la coordinación y retira el payload del inbox', async () => {
    const store = setup();
    const service = new CustodyGrantService(store, () => new Date(START));
    const first = request(21);
    await service.create(actor(1, 1), 1, first, 'custody:create:21');

    await expect(service.revoke(2, first.grantId, 'custody:revoke:21'))
      .resolves.toMatchObject({ status: 'revoked' });
    await expect(service.revoke(2, first.grantId, 'custody:revoke:21'))
      .resolves.toMatchObject({ status: 'duplicate' });
    await expect(service.listInbox(2, 50)).resolves.toMatchObject({ grants: [] });

    const second = request(22);
    await service.create(actor(1, 1), 1, second, 'custody:create:22');
    await expect(service.revoke(1, second.grantId, 'custody:revoke:22'))
      .resolves.toMatchObject({ status: 'revoked' });
  });

  it('no confirma existencia a terceros y protege la idempotencia de revocación', async () => {
    const store = setup();
    const service = new CustodyGrantService(store, () => new Date(START));
    const first = request(23);
    const second = request(24);
    await service.create(actor(1, 1), 1, first, 'custody:create:23');
    await service.create(actor(1, 1), 1, second, 'custody:create:24');

    await expectCode(service.revoke(3, first.grantId, 'custody:revoke:outsider'), 'CUSTODY_GRANT_NOT_FOUND');
    await service.revoke(1, first.grantId, 'custody:revoke:shared-key');
    await expectCode(service.revoke(1, second.grantId, 'custody:revoke:shared-key'), 'CUSTODY_IDEMPOTENCY_CONFLICT');
  });

  it('reserva la clave idempotente aunque el grant ya estuviera revocado', async () => {
    const store = setup();
    const service = new CustodyGrantService(store, () => new Date(START));
    const first = request(31);
    const second = request(32);
    await service.create(actor(1, 1), 1, first, 'custody:create:31');
    await service.create(actor(1, 1), 1, second, 'custody:create:32');
    await service.revoke(1, first.grantId, 'custody:revoke:31');

    await expect(service.revoke(1, first.grantId, 'custody:revoke:late'))
      .resolves.toMatchObject({ status: 'already_revoked' });
    await expect(service.revoke(1, first.grantId, 'custody:revoke:late'))
      .resolves.toMatchObject({ status: 'duplicate' });
    await expectCode(
      service.revoke(1, second.grantId, 'custody:revoke:late'),
      'CUSTODY_IDEMPOTENCY_CONFLICT',
    );
  });

  it('no deja que una coordinación opere una capability vencida', async () => {
    const store = setup();
    let now = START;
    const service = new CustodyGrantService(store, () => new Date(now));
    const grant = request(33, 10, new Date(START + 10 * 60_000).toISOString());
    await service.create(actor(1, 1), 1, grant, 'custody:create:33');

    now = START + 11 * 60_000;
    await expectCode(
      service.revoke(2, grant.grantId, 'custody:revoke:expired-recipient'),
      'CUSTODY_GRANT_NOT_FOUND',
    );
    await expectCode(
      service.revoke(1, grant.grantId, 'custody:revoke:expired-grantor'),
      'CUSTODY_GRANT_EXPIRED',
    );
    expect(store.grants[0]).toMatchObject({ revokedAt: null, closedAt: null });
  });

  it('mapea a expired una carrera donde el reloj PostgreSQL ya alcanzó el vencimiento', async () => {
    const store = setup();
    let serviceNow = START;
    const service = new CustodyGrantService(store, () => new Date(serviceNow));
    const grant = request(34, 10, new Date(START + 10 * 60_000).toISOString());
    await service.create(actor(1, 1), 1, grant, 'custody:create:34');
    serviceNow = START + 9 * 60_000;
    store.databaseNowMs = START + 11 * 60_000;

    await expectCode(
      service.revoke(1, grant.grantId, 'custody:revoke:db-expired'),
      'CUSTODY_GRANT_EXPIRED',
    );
    expect(store.grants[0]).toMatchObject({ revokedAt: null, closedAt: null });
    expect(store.revocations).toEqual([]);
  });

  it('usa el timestamp autoritativo de la base aunque el reloj de aplicación esté adelantado', async () => {
    const store = setup();
    let serviceNow = START;
    const service = new CustodyGrantService(store, () => new Date(serviceNow));
    const grant = request(35, 10, new Date(START + 60 * 60_000).toISOString());
    await service.create(actor(1, 1), 1, grant, 'custody:create:35');
    serviceNow = START + 20 * 60_000;
    store.databaseNowMs = START + 5 * 60_000;

    await expect(service.revoke(1, grant.grantId, 'custody:revoke:db-time')).resolves.toMatchObject({
      status: 'revoked',
      revokedAt: new Date(START + 5 * 60_000).toISOString(),
    });
    expect(store.grants[0].revokedAt).toBe(new Date(START + 5 * 60_000).toISOString());
    expect(store.revocations[0].revokedAt).toBe(new Date(START + 5 * 60_000).toISOString());
  });
});
