import { describe, expect, it } from 'vitest';

import {
  custodyCoordinationDecisionId,
  custodyCoordinationProposalId,
  createCustodyCoordinationProposalSchema,
  CustodyCoordinationService,
  decideCustodyCoordinationProposalSchema,
  type CustodyCoordinationRecord,
  type CustodyCoordinationStore,
  type StoredCustodyCoordinationDecision,
  type StoredCustodyCoordinationProposal,
} from '../../server/civic/custody-coordination';
import {
  custodyResponseVersion,
  type CustodyDeviceRecord,
  type StoredCustodyGrant,
  type StoredCustodyGrantResponse,
} from '../../server/civic/custody-grants';
import { CivicApiError } from '../../server/civic/service';
import {
  encodeCustodyPageCursor,
  type CustodyPageRequest,
} from '../../server/civic/custody-pagination';

const uuid = (value: number): string => `00000000-0000-4000-8000-${String(value).padStart(12, '0')}`;
const actorKey = (value: number): string => `actor_${uuid(value)}`;
const START = Date.parse('2026-07-14T15:00:00.000Z');

interface MemoryCircle {
  custodial: boolean;
  coordinators: Set<number>;
}

class MemoryCoordinationStore implements CustodyCoordinationStore {
  nowMs = START;
  activeUsers = new Set<number>();
  devices = new Map<string, CustodyDeviceRecord>();
  circles = new Map<number, MemoryCircle>();
  grants = new Map<string, StoredCustodyGrant>();
  responses: StoredCustodyGrantResponse[] = [];
  proposals: StoredCustodyCoordinationProposal[] = [];
  decisions: StoredCustodyCoordinationDecision[] = [];
  nextProposalRowId = 1;
  nextDecisionRowId = 1;

  async runInTransaction<T>(operation: (store: CustodyCoordinationStore) => Promise<T>) {
    return operation(this);
  }
  async currentTimestamp() { return new Date(this.nowMs).toISOString(); }
  async isActiveUser(userId: number) { return this.activeUsers.has(userId); }
  async getDevice(key: string) { return this.devices.get(key) ?? null; }
  async isCircleCoordinator(circleId: number, userId: number) {
    const circle = this.circles.get(circleId);
    return Boolean(circle?.custodial && circle.coordinators.has(userId) && this.activeUsers.has(userId));
  }
  async hasAvailableCircleCoordinator(circleId: number, excludedUserId: number) {
    const circle = this.circles.get(circleId);
    return Boolean(circle?.custodial && [...circle.coordinators]
      .some((userId) => userId !== excludedUserId && this.activeUsers.has(userId)));
  }
  async getGrant(grantId: string) { return this.grants.get(grantId) ?? null; }
  async getGrantForUpdate(grantId: string) { return this.getGrant(grantId); }
  async getLatestAppliedResponse(grantId: string) {
    return [...this.responses].reverse().find((row) => row.grantId === grantId && row.applied) ?? null;
  }
  async findProposalConflicts(proposalId: string, userId: number, idempotencyKey: string) {
    return this.proposals.filter((row) => row.proposalId === proposalId
      || (row.proposerUserId === userId && row.idempotencyKey === idempotencyKey));
  }
  async getProposal(proposalId: string) {
    return this.proposals.find((row) => row.proposalId === proposalId) ?? null;
  }
  async getProposalForGrant(grantId: string) {
    return this.proposals.find((row) => row.grantId === grantId) ?? null;
  }
  async getProposalForUpdate(proposalId: string) { return this.getProposal(proposalId); }
  async insertProposal(input: Omit<StoredCustodyCoordinationProposal, 'rowId' | 'createdAt'>) {
    if ((await this.findProposalConflicts(input.proposalId, input.proposerUserId, input.idempotencyKey)).length) {
      return null;
    }
    if (await this.getProposalForGrant(input.grantId)) return null;
    const row: StoredCustodyCoordinationProposal = {
      ...input,
      rowId: this.nextProposalRowId++,
      createdAt: new Date(this.nowMs).toISOString(),
    };
    this.proposals.push(row);
    return row;
  }
  async findDecisionConflicts(decisionId: string, userId: number, idempotencyKey: string) {
    return this.decisions.filter((row) => row.decisionId === decisionId
      || (row.deciderUserId === userId && row.idempotencyKey === idempotencyKey));
  }
  async getDecision(proposalId: string) {
    return this.decisions.find((row) => row.proposalId === proposalId) ?? null;
  }
  async insertDecision(input: Omit<StoredCustodyCoordinationDecision, 'rowId' | 'createdAt'>) {
    if ((await this.findDecisionConflicts(input.decisionId, input.deciderUserId, input.idempotencyKey)).length) {
      return null;
    }
    if (await this.getDecision(input.proposalId)) return null;
    const row: StoredCustodyCoordinationDecision = {
      ...input,
      rowId: this.nextDecisionRowId++,
      createdAt: new Date(this.nowMs).toISOString(),
    };
    this.decisions.push(row);
    return row;
  }
  async listCoordinatorRecords(
    userId: number,
    limit: number,
    page: CustodyPageRequest | null = null,
  ) {
    const snapshotMs = page ? Math.min(Date.parse(page.asOf), this.nowMs) : this.nowMs;
    const refreshedAt = new Date(snapshotMs).toISOString();
    if (!this.activeUsers.has(userId)) {
      return { authorized: false, records: [], refreshedAt: null };
    }
    const records: CustodyCoordinationRecord[] = [];
    const ordered = [...this.proposals]
      .filter((proposal) => !page || proposal.rowId < page.after.rowId)
      .sort((left, right) => right.rowId - left.rowId);
    for (const proposal of ordered) {
      const grant = this.grants.get(proposal.grantId);
      if (
        !grant
        || grant.revokedAt
        || grant.closedAt
        || Date.parse(grant.createdAt) > snapshotMs
        || Date.parse(proposal.createdAt) > snapshotMs
        || Date.parse(grant.expiresAt) <= this.nowMs
        || Date.parse(proposal.expiresAt) <= this.nowMs
      ) continue;
      if (grant.grantorUserId === userId || !(await this.isCircleCoordinator(grant.recipientCircleId, userId))) continue;
      const decision = await this.getDecision(proposal.proposalId);
      records.push({
        proposal,
        grant,
        decision: decision && Date.parse(decision.createdAt) <= snapshotMs ? decision : null,
      });
      if (records.length === limit) break;
    }
    return { authorized: true, records, refreshedAt };
  }
}

const device = (value: number, userId: number | null): CustodyDeviceRecord => ({
  actorKey: actorKey(value),
  linkedUserId: userId,
  revokedAt: null,
});

const grant = (
  value: number,
  expiresAt = new Date(START + 24 * 60 * 60_000).toISOString(),
): StoredCustodyGrant => ({
  rowId: value,
  grantId: uuid(value),
  idempotencyKey: `custody:grant:${value}`,
  requestHash: 'a'.repeat(64),
  needId: uuid(10_000 + value),
  ownerActorKey: actorKey(1),
  grantorUserId: 1,
  recipientType: 'circle',
  recipientCircleId: 10,
  payloadJson: {
    category: 'food', quantity: 12, unit: 'meals', urgency: 4, location: null,
  },
  expiresAt,
  revokedAt: null,
  closedAt: null,
  closedReason: null,
  createdAt: new Date(START - 60_000).toISOString(),
});

const response = (
  grantId: string,
  value: number,
  disposition: 'assessing' | 'support_available',
  quantity: number | null = null,
): StoredCustodyGrantResponse => ({
  rowId: value,
  responseId: uuid(20_000 + value),
  idempotencyKey: `custody:response:${value}`,
  requestHash: 'b'.repeat(64),
  grantId,
  responderUserId: 2,
  disposition,
  quantity,
  unit: quantity == null ? null : 'meals',
  applied: true,
  createdAt: new Date(START + value).toISOString(),
});

const proposalInput = (
  grantId: string,
  observedResponse?: StoredCustodyGrantResponse,
) => ({
  proposalId: custodyCoordinationProposalId(grantId),
  grantId,
  expectedResponseVersion: custodyResponseVersion(observedResponse?.responseId ?? uuid(99_999)),
});

const decisionInput = (
  proposalId: string,
  decision: 'accept' | 'decline',
) => ({
  proposalId,
  decisionId: custodyCoordinationDecisionId(proposalId),
  decision,
});

const setup = () => {
  const store = new MemoryCoordinationStore();
  store.activeUsers.add(1);
  store.activeUsers.add(2);
  store.activeUsers.add(3);
  store.devices.set(actorKey(1), device(1, 1));
  store.devices.set(actorKey(2), device(2, 2));
  store.devices.set(actorKey(3), device(3, 3));
  store.devices.set(actorKey(4), device(4, 1));
  store.circles.set(10, { custodial: true, coordinators: new Set([2]) });
  const firstGrant = grant(100);
  store.grants.set(firstGrant.grantId, firstGrant);
  return { store, firstGrant };
};

const expectCode = async (promise: Promise<unknown>, code: string) => {
  await expect(promise).rejects.toMatchObject<CivicApiError>({ code });
};

describe('contrato privado de coordinación', () => {
  it('canoniza timestamps PostgreSQL en status, batch y replays sin mutar persistencia', async () => {
    const { store, firstGrant } = setup();
    const support = response(firstGrant.grantId, 50, 'support_available', 6);
    store.responses.push(support);
    const service = new CustodyCoordinationService(store);
    const proposalRequest = proposalInput(firstGrant.grantId, support);
    const decisionRequest = decisionInput(proposalRequest.proposalId, 'accept');
    await service.create(2, proposalRequest, 'coordination:create:50');
    await service.decide(device(1, 1), 1, decisionRequest, 'coordination:decide:50');

    const pgCreatedAt = '2026-07-14 21:59:36.430138+00';
    const pgExpiresAt = '2026-07-15 21:59:36.430138+00';
    const pgDecidedAt = '2026-07-14 22:01:02.987654+00';
    store.proposals[0].createdAt = pgCreatedAt;
    store.proposals[0].expiresAt = pgExpiresAt;
    store.decisions[0].createdAt = pgDecidedAt;
    // Las filas ya confirmadas no pueden estar por delante del snapshot SQL
    // que las devuelve.
    store.nowMs = Date.parse('2026-07-14T22:02:00.000Z');

    const status = await service.ownerStatus(device(1, 1), 1, firstGrant.grantId);
    const batch = await service.listCoordinator(2, 50);
    const createReplay = await service.create(2, proposalRequest, 'coordination:create:50');
    const decisionReplay = await service.decide(
      device(1, 1),
      1,
      decisionRequest,
      'coordination:decide:50',
    );
    for (const view of [
      status.proposal,
      batch.proposals[0],
      createReplay.proposal,
      decisionReplay.proposal,
    ]) {
      expect(view).toMatchObject({
        terminalDecision: 'accept',
        createdAt: '2026-07-14T21:59:36.430Z',
        expiresAt: '2026-07-15T21:59:36.430Z',
        decidedAt: '2026-07-14T22:01:02.987Z',
      });
    }

    expect(store.proposals[0].createdAt).toBe(pgCreatedAt);
    expect(store.proposals[0].expiresAt).toBe(pgExpiresAt);
    expect(store.decisions[0].createdAt).toBe(pgDecidedAt);
  });

  it('falla cerrada si status encuentra una fecha almacenada inválida', async () => {
    const { store, firstGrant } = setup();
    const support = response(firstGrant.grantId, 51, 'support_available');
    store.responses.push(support);
    const service = new CustodyCoordinationService(store);
    await service.create(2, proposalInput(firstGrant.grantId, support), 'coordination:create:51');
    store.proposals[0].createdAt = 'not-a-postgresql-timestamp';

    await expectCode(
      service.ownerStatus(device(1, 1), 1, firstGrant.grantId),
      'CUSTODY_TIMESTAMP_INVALID',
    );
  });

  it('acepta sólo UUID v4 y cuerpos exactos sin términos aportados por el cliente', () => {
    const grantId = uuid(2);
    const create = {
      proposalId: custodyCoordinationProposalId(grantId),
      grantId,
      expectedResponseVersion: custodyResponseVersion(uuid(20_002)),
    };
    expect(createCustodyCoordinationProposalSchema.safeParse(create).success).toBe(true);
    const canonical = createCustodyCoordinationProposalSchema.parse({
      proposalId: create.proposalId.toUpperCase(),
      grantId: create.grantId.toUpperCase(),
      expectedResponseVersion: create.expectedResponseVersion,
    });
    expect(canonical).toEqual(create);
    expect(createCustodyCoordinationProposalSchema.safeParse({
      ...create,
      needId: uuid(3),
    }).success).toBe(false);
    expect(createCustodyCoordinationProposalSchema.safeParse({
      ...create,
      contact: '+54 261 555 5555',
    }).success).toBe(false);
    expect(createCustodyCoordinationProposalSchema.safeParse({
      ...create,
      proposalId: uuid(99),
    }).success).toBe(false);
    expect(createCustodyCoordinationProposalSchema.safeParse({
      ...create,
      expectedResponseVersion: 'not-a-version',
    }).success).toBe(false);

    const decide = decisionInput(create.proposalId, 'accept');
    expect(decideCustodyCoordinationProposalSchema.safeParse(decide).success).toBe(true);
    expect(decideCustodyCoordinationProposalSchema.safeParse({ ...decide, decision: 'delivered' }).success)
      .toBe(false);
    expect(decideCustodyCoordinationProposalSchema.safeParse({ ...decide, note: 'texto' }).success)
      .toBe(false);
    expect(decideCustodyCoordinationProposalSchema.safeParse({ ...decide, decisionId: uuid(98) }).success)
      .toBe(false);
  });

  it('rechaza si cambió la respuesta desde la vista y sólo congela la versión confirmada', async () => {
    const { store, firstGrant } = setup();
    const observed = response(firstGrant.grantId, 52, 'support_available', 8);
    const revised = response(firstGrant.grantId, 53, 'support_available', 5);
    store.responses.push(observed, revised);
    const service = new CustodyCoordinationService(store);

    await expectCode(
      service.create(2, proposalInput(firstGrant.grantId, observed), 'coordination:create:stale-response'),
      'CUSTODY_COORDINATION_RESPONSE_CHANGED',
    );
    expect(store.proposals).toHaveLength(0);

    await expect(service.create(
      2,
      proposalInput(firstGrant.grantId, revised),
      'coordination:create:current-response',
    )).resolves.toMatchObject({
      status: 'accepted',
      proposal: { capacity: { quantity: 5, unit: 'meals' } },
    });
  });

  it('requiere support_available y una coordinación distinta del grantor', async () => {
    const { store, firstGrant } = setup();
    const service = new CustodyCoordinationService(store);
    const input = proposalInput(firstGrant.grantId);

    await expectCode(service.create(2, input, 'coordination:create:1'), 'CUSTODY_COORDINATION_SUPPORT_REQUIRED');
    store.responses.push(response(firstGrant.grantId, 1, 'assessing'));
    await expectCode(service.create(2, input, 'coordination:create:1'), 'CUSTODY_COORDINATION_SUPPORT_REQUIRED');
    store.responses.push(response(firstGrant.grantId, 2, 'support_available', 6));
    store.circles.get(10)!.coordinators.add(1);
    await expectCode(
      service.create(1, input, 'coordination:create:owner'),
      'CUSTODY_COORDINATION_DISTINCT_PARTY_REQUIRED',
    );
  });

  it('congela capacidad y vencimiento sin exponer identidades ni referencias internas', async () => {
    const { store, firstGrant } = setup();
    const latest = response(firstGrant.grantId, 3, 'support_available', 6);
    store.responses.push(response(firstGrant.grantId, 2, 'support_available', 8), latest);
    const service = new CustodyCoordinationService(store);
    const result = await service.create(2, proposalInput(firstGrant.grantId, latest), 'coordination:create:2');

    expect(result).toMatchObject({
      contract: 'basta-civic-custody-coordination/v1',
      status: 'accepted',
      proposal: {
        state: 'proposed',
        terminalDecision: null,
        capacity: { quantity: 6, unit: 'meals' },
        expiresAt: firstGrant.expiresAt,
        decidedAt: null,
      },
    });
    expect(store.proposals[0]).toMatchObject({
      sourceResponseId: latest.responseId,
      quantity: 6,
      unit: 'meals',
    });
    expect(JSON.stringify(result.proposal)).not.toMatch(/needId|responseId|userId|actorKey|location|contact|story/i);
    expect(Object.keys(result.proposal).sort()).toEqual([
      'capacity', 'createdAt', 'decidedAt', 'expiresAt', 'grantId', 'proposalId', 'state',
      'terminalDecision',
    ]);
  });

  it('exige juntas ambas identidades idempotentes y una sola propuesta por grant', async () => {
    const { store, firstGrant } = setup();
    const support = response(firstGrant.grantId, 4, 'support_available', 5);
    store.responses.push(support);
    const service = new CustodyCoordinationService(store);
    const input = proposalInput(firstGrant.grantId, support);
    await service.create(2, input, 'coordination:create:3');
    await expect(service.create(2, input, 'coordination:create:3'))
      .resolves.toMatchObject({ status: 'duplicate' });
    await expectCode(
      service.create(2, input, 'coordination:create:different'),
      'CUSTODY_COORDINATION_IDEMPOTENCY_CONFLICT',
    );
    await expectCode(
      service.create(2, { ...input, proposalId: uuid(30_004) }, 'coordination:create:3'),
      'INVALID_CUSTODY_COORDINATION_PROPOSAL_ID',
    );
    await expectCode(
      service.create(2, { ...input, proposalId: uuid(30_005) }, 'coordination:create:5'),
      'INVALID_CUSTODY_COORDINATION_PROPOSAL_ID',
    );
  });

  it('acepta o declina sólo con la cuenta y el dispositivo owner exactos', async () => {
    const { store, firstGrant } = setup();
    const support = response(firstGrant.grantId, 5, 'support_available', 4);
    store.responses.push(support);
    const service = new CustodyCoordinationService(store);
    const proposalId = custodyCoordinationProposalId(firstGrant.grantId);
    await service.create(2, proposalInput(firstGrant.grantId, support), 'coordination:create:6');
    const decision = decisionInput(proposalId, 'accept');

    await expectCode(
      service.decide(device(4, 1), 1, decision, 'coordination:decide:1'),
      'CUSTODY_COORDINATION_NOT_FOUND',
    );
    await expectCode(
      service.decide(device(1, 1), 3, decision, 'coordination:decide:1'),
      'CUSTODY_COORDINATION_NOT_FOUND',
    );
    const accepted = await service.decide(device(1, 1), 1, decision, 'coordination:decide:1');
    expect(accepted).toMatchObject({
      status: 'accepted',
      proposal: { state: 'accepted', terminalDecision: 'accept', decidedAt: expect.any(String) },
    });
    expect(JSON.stringify(accepted.proposal)).not.toMatch(/owner|decider|actor|user|need|response/i);
  });

  it('hace terminal la decisión y exige proposalId/decisionId/key como una sola identidad', async () => {
    const { store, firstGrant } = setup();
    const support = response(firstGrant.grantId, 6, 'support_available');
    store.responses.push(support);
    const service = new CustodyCoordinationService(store);
    const proposalId = custodyCoordinationProposalId(firstGrant.grantId);
    await service.create(2, proposalInput(firstGrant.grantId, support), 'coordination:create:7');
    const decision = decisionInput(proposalId, 'decline');
    await service.decide(device(1, 1), 1, decision, 'coordination:decide:2');
    await expect(service.decide(device(1, 1), 1, decision, 'coordination:decide:2'))
      .resolves.toMatchObject({
        status: 'duplicate',
        proposal: { state: 'declined', terminalDecision: 'decline' },
      });
    await expectCode(
      service.decide(device(1, 1), 1, decision, 'coordination:decide:different'),
      'CUSTODY_COORDINATION_DECISION_IDEMPOTENCY_CONFLICT',
    );
    await expectCode(service.decide(device(1, 1), 1, {
      ...decision,
      decisionId: uuid(40_003),
    }, 'coordination:decide:2'), 'INVALID_CUSTODY_COORDINATION_DECISION_ID');
    await expectCode(service.decide(device(1, 1), 1, {
      ...decision,
      decisionId: uuid(40_004),
      decision: 'accept',
    }, 'coordination:decide:4'), 'INVALID_CUSTODY_COORDINATION_DECISION_ID');
  });

  it('recupera el replay exacto de una decisión cuya respuesta se perdió antes de revoke', async () => {
    const { store, firstGrant } = setup();
    const support = response(firstGrant.grantId, 61, 'support_available', 4);
    store.responses.push(support);
    const service = new CustodyCoordinationService(store);
    const proposalId = custodyCoordinationProposalId(firstGrant.grantId);
    const input = decisionInput(proposalId, 'accept');
    const key = 'coordination:decide:lost-before-revoke';
    await service.create(2, proposalInput(firstGrant.grantId, support), 'coordination:create:lost-before-revoke');

    // El servidor confirma, pero el caller no alcanza a observar el receipt.
    await service.decide(device(1, 1), 1, input, key);
    firstGrant.revokedAt = new Date(START + 5_000).toISOString();
    firstGrant.closedAt = firstGrant.revokedAt;
    firstGrant.closedReason = 'revoked';

    await expect(service.decide(device(1, 1), 1, input, key)).resolves.toMatchObject({
      status: 'duplicate',
      proposal: {
        state: 'closed',
        terminalDecision: 'accept',
        decidedAt: expect.any(String),
      },
    });
    expect(store.decisions).toHaveLength(1);
  });

  it('recupera el replay exacto y status de una decisión decline después de expiry', async () => {
    const { store, firstGrant } = setup();
    const support = response(firstGrant.grantId, 62, 'support_available', 2);
    store.responses.push(support);
    const service = new CustodyCoordinationService(store);
    const proposalId = custodyCoordinationProposalId(firstGrant.grantId);
    const input = decisionInput(proposalId, 'decline');
    const key = 'coordination:decide:lost-before-expiry';
    await service.create(2, proposalInput(firstGrant.grantId, support), 'coordination:create:lost-before-expiry');
    await service.decide(device(1, 1), 1, input, key);
    store.nowMs = Date.parse(firstGrant.expiresAt) + 1;

    await expect(service.decide(device(1, 1), 1, input, key)).resolves.toMatchObject({
      status: 'duplicate',
      proposal: {
        state: 'expired',
        terminalDecision: 'decline',
        decidedAt: expect.any(String),
      },
    });
    await expect(service.ownerStatus(device(1, 1), 1, firstGrant.grantId)).resolves.toMatchObject({
      proposal: { state: 'expired', terminalDecision: 'decline' },
      refreshedAt: new Date(store.nowMs).toISOString(),
    });
    expect(store.decisions).toHaveLength(1);
  });

  it('recupera un replay exacto de create tras cierre o vencimiento sin crear otra propuesta', async () => {
    const revokedSetup = setup();
    const revokedSupport = response(revokedSetup.firstGrant.grantId, 63, 'support_available', 3);
    revokedSetup.store.responses.push(revokedSupport);
    const revokedService = new CustodyCoordinationService(revokedSetup.store);
    const revokedInput = proposalInput(revokedSetup.firstGrant.grantId, revokedSupport);
    const revokedKey = 'coordination:create:lost-before-revoke';
    await revokedService.create(2, revokedInput, revokedKey);
    revokedSetup.firstGrant.revokedAt = new Date(START + 5_000).toISOString();
    revokedSetup.firstGrant.closedAt = revokedSetup.firstGrant.revokedAt;
    revokedSetup.firstGrant.closedReason = 'revoked';
    await expect(revokedService.create(2, revokedInput, revokedKey)).resolves.toMatchObject({
      status: 'duplicate',
      proposal: { state: 'closed', terminalDecision: null },
    });
    expect(revokedSetup.store.proposals).toHaveLength(1);

    const expiredSetup = setup();
    const expiredSupport = response(expiredSetup.firstGrant.grantId, 64, 'support_available', 3);
    expiredSetup.store.responses.push(expiredSupport);
    const expiredService = new CustodyCoordinationService(expiredSetup.store);
    const expiredInput = proposalInput(expiredSetup.firstGrant.grantId, expiredSupport);
    const expiredKey = 'coordination:create:lost-before-expiry';
    await expiredService.create(2, expiredInput, expiredKey);
    expiredSetup.store.nowMs = Date.parse(expiredSetup.firstGrant.expiresAt) + 1;
    await expect(expiredService.create(2, expiredInput, expiredKey)).resolves.toMatchObject({
      status: 'duplicate',
      proposal: { state: 'expired', terminalDecision: null },
    });
    expect(expiredSetup.store.proposals).toHaveLength(1);
  });

  it('lista coordinación con un único snapshot autoritativo para ACL, filas y reloj', async () => {
    const { store, firstGrant } = setup();
    const support = response(firstGrant.grantId, 66, 'support_available', 3);
    store.responses.push(support);
    const service = new CustodyCoordinationService(store);
    await service.create(
      2,
      proposalInput(firstGrant.grantId, support),
      'coordination:create:batch-snapshot',
    );

    // Una fila posterior al corte no puede aparecer bajo un refreshedAt
    // anterior. El servicio tampoco debe leer un reloj independiente.
    store.proposals[0].createdAt = new Date(START + 1).toISOString();
    store.currentTimestamp = async () => {
      throw new Error('listCoordinator must use the snapshot clock');
    };
    await expect(service.listCoordinator(2, 50)).resolves.toMatchObject({
      proposals: [],
      refreshedAt: new Date(START).toISOString(),
    });

    store.nowMs = START + 1;
    await expect(service.listCoordinator(2, 50)).resolves.toMatchObject({
      proposals: [{ proposalId: store.proposals[0].proposalId }],
      refreshedAt: new Date(START + 1).toISOString(),
    });

    // La desactivación se evalúa dentro del mismo envelope, incluso si la
    // bandeja visible habría quedado vacía.
    store.activeUsers.delete(2);
    await expectCode(service.listCoordinator(2, 50), 'ACCOUNT_NOT_ACTIVE');
  });

  it('pagina más de 50 propuestas sin omitir ni duplicar cuando createdAt empata', async () => {
    const { store } = setup();
    store.grants.clear();
    store.responses = [];
    store.proposals = [];
    const service = new CustodyCoordinationService(store);
    for (let index = 1; index <= 60; index += 1) {
      const currentGrant = grant(3_000 + index);
      const support = response(currentGrant.grantId, 3_000 + index, 'support_available', 3);
      store.grants.set(currentGrant.grantId, currentGrant);
      store.responses.push(support);
      await service.create(
        2,
        proposalInput(currentGrant.grantId, support),
        `coordination:create:page:${index}`,
      );
    }

    const first = await service.listCoordinator(2, 50);
    const second = await service.listCoordinator(2, 50, first.nextCursor!);
    const grantIds = [...first.proposals, ...second.proposals].map((item) => item.grantId);

    expect(first).toMatchObject({ truncated: true, nextCursor: expect.any(String) });
    expect(first.proposals).toHaveLength(50);
    expect(second).toMatchObject({ truncated: false, nextCursor: null });
    expect(second.proposals).toHaveLength(10);
    expect(second.refreshedAt).toBe(first.refreshedAt);
    expect(new Set(grantIds).size).toBe(60);
    expect(grantIds).toEqual(Array.from({ length: 60 }, (_, index) => uuid(3_060 - index)));
  });

  it('el keyset por serial conserva propuestas separadas sólo por microsegundos', async () => {
    const { store } = setup();
    store.grants.clear();
    store.responses = [];
    store.proposals = [];
    const service = new CustodyCoordinationService(store);
    for (const value of [4_001, 4_002]) {
      const currentGrant = grant(value);
      const support = response(currentGrant.grantId, value, 'support_available', 3);
      store.grants.set(currentGrant.grantId, currentGrant);
      store.responses.push(support);
      await service.create(2, proposalInput(currentGrant.grantId, support), `coordination:create:micro:${value}`);
    }
    store.proposals[0].createdAt = '2026-07-14 15:00:00.000100+00';
    store.proposals[1].createdAt = '2026-07-14 15:00:00.000900+00';
    store.nowMs = START + 1;

    const first = await service.listCoordinator(2, 1);
    const second = await service.listCoordinator(2, 1, first.nextCursor!);

    expect([...first.proposals, ...second.proposals].map((item) => item.grantId))
      .toEqual([uuid(4_002), uuid(4_001)]);
    expect(second.nextCursor).toBeNull();
  });

  it('rechaza cursor inválido o futuro y el asOf histórico no reabre una propuesta vencida', async () => {
    const { store, firstGrant } = setup();
    const support = response(firstGrant.grantId, 77, 'support_available', 3);
    store.responses.push(support);
    const service = new CustodyCoordinationService(store);
    await service.create(2, proposalInput(firstGrant.grantId, support), 'coordination:create:cursor-security');

    await expectCode(service.listCoordinator(2, 50, '%%%'), 'INVALID_CUSTODY_CURSOR');
    await expectCode(service.listCoordinator(2, 50, encodeCustodyPageCursor('grant-inbox', {
      asOf: new Date(START).toISOString(),
      after: { rowId: Number.MAX_SAFE_INTEGER },
    })), 'INVALID_CUSTODY_CURSOR');

    store.nowMs = Date.parse(firstGrant.expiresAt) + 1;
    const historical = encodeCustodyPageCursor('coordination-inbox', {
      asOf: new Date(START).toISOString(),
      after: { rowId: Number.MAX_SAFE_INTEGER },
    });
    await expect(service.listCoordinator(2, 50, historical)).resolves.toMatchObject({ proposals: [] });

    store.nowMs = START;
    const future = encodeCustodyPageCursor('coordination-inbox', {
      asOf: new Date(START + 60_000).toISOString(),
      after: { rowId: Number.MAX_SAFE_INTEGER },
    });
    await expectCode(service.listCoordinator(2, 50, future), 'INVALID_CUSTODY_CURSOR');
  });

  it('el batch sólo muestra grants activos a coordinadores actuales y status reconcilia cierre', async () => {
    const { store, firstGrant } = setup();
    const support = response(firstGrant.grantId, 7, 'support_available', 3);
    store.responses.push(support);
    const service = new CustodyCoordinationService(store);
    const proposalId = custodyCoordinationProposalId(firstGrant.grantId);
    await service.create(2, proposalInput(firstGrant.grantId, support), 'coordination:create:8');
    await service.decide(device(1, 1), 1, decisionInput(proposalId, 'accept'), 'coordination:decide:5');

    await expect(service.listCoordinator(2, 50)).resolves.toMatchObject({
      scope: 'private-circle-coordinator-coordination',
      proposals: [{ state: 'accepted', terminalDecision: 'accept' }],
    });
    await expect(service.listCoordinator(3, 50)).resolves.toMatchObject({ proposals: [] });

    firstGrant.revokedAt = new Date(START + 5_000).toISOString();
    firstGrant.closedAt = firstGrant.revokedAt;
    firstGrant.closedReason = 'revoked';
    await expect(service.listCoordinator(2, 50)).resolves.toMatchObject({ proposals: [] });
    await expect(service.ownerStatus(device(1, 1), 1, firstGrant.grantId)).resolves.toMatchObject({
      scope: 'private-grantor-coordination-status',
      proposal: { state: 'closed', terminalDecision: 'accept', decidedAt: expect.any(String) },
    });
  });

  it('ownerStatus toma un snapshot transaccional grant→proposal→decision antes del reloj DB', async () => {
    const { store, firstGrant } = setup();
    const support = response(firstGrant.grantId, 65, 'support_available', 3);
    store.responses.push(support);
    const service = new CustodyCoordinationService(store);
    const proposalId = custodyCoordinationProposalId(firstGrant.grantId);
    await service.create(2, proposalInput(firstGrant.grantId, support), 'coordination:create:snapshot');
    await service.decide(
      device(1, 1),
      1,
      decisionInput(proposalId, 'accept'),
      'coordination:decide:snapshot',
    );

    const events: string[] = [];
    const getProposalForUpdate = store.getProposalForUpdate.bind(store);
    const getDecision = store.getDecision.bind(store);
    const currentTimestamp = store.currentTimestamp.bind(store);
    store.getGrant = async () => { throw new Error('ownerStatus must not perform an unlocked grant read'); };
    store.getGrantForUpdate = async (id) => {
      events.push('grant:lock');
      return store.grants.get(id) ?? null;
    };
    store.getProposalForUpdate = async (id) => {
      events.push('proposal:lock');
      return getProposalForUpdate(id);
    };
    store.getDecision = async (id) => {
      events.push('decision:read');
      return getDecision(id);
    };
    store.currentTimestamp = async () => {
      events.push('clock:read');
      return currentTimestamp();
    };
    store.runInTransaction = async (operation) => {
      events.push('transaction:start');
      const result = await operation(store);
      events.push('transaction:commit');
      // Simula una revocación que esperaba el lock y confirma apenas termina
      // el snapshot. No puede contaminar el refreshedAt ya devuelto.
      firstGrant.revokedAt = new Date(START + 5_000).toISOString();
      firstGrant.closedAt = firstGrant.revokedAt;
      firstGrant.closedReason = 'revoked';
      return result;
    };

    const status = await service.ownerStatus(device(1, 1), 1, firstGrant.grantId);

    expect(status).toMatchObject({
      proposal: { state: 'accepted', terminalDecision: 'accept' },
      refreshedAt: new Date(START).toISOString(),
    });
    expect(events).toEqual([
      'transaction:start',
      'grant:lock',
      'proposal:lock',
      'decision:read',
      'clock:read',
      'transaction:commit',
    ]);
    expect(firstGrant.closedReason).toBe('revoked');
  });

  it('owner status devuelve null antes de propuesta y expired sin reabrir mutaciones', async () => {
    const { store, firstGrant } = setup();
    const service = new CustodyCoordinationService(store);
    await expect(service.ownerStatus(device(1, 1), 1, firstGrant.grantId)).resolves.toMatchObject({
      grantId: firstGrant.grantId,
      proposal: null,
    });
    store.responses.push(response(firstGrant.grantId, 8, 'support_available', 2));
    const support = store.responses.at(-1)!;
    const proposalId = custodyCoordinationProposalId(firstGrant.grantId);
    await service.create(2, proposalInput(firstGrant.grantId, support), 'coordination:create:9');
    store.nowMs = Date.parse(firstGrant.expiresAt) + 1;
    await expect(service.ownerStatus(device(1, 1), 1, firstGrant.grantId)).resolves.toMatchObject({
      proposal: { state: 'expired', terminalDecision: null, decidedAt: null },
    });
    await expectCode(
      service.decide(device(1, 1), 1, decisionInput(proposalId, 'accept'), 'coordination:decide:6'),
      'CUSTODY_COORDINATION_NOT_FOUND',
    );
  });

  it('cierra la proyección cuando ya no existe una coordinación autorizada', async () => {
    const { store, firstGrant } = setup();
    const support = response(firstGrant.grantId, 54, 'support_available', 2);
    store.responses.push(support);
    const service = new CustodyCoordinationService(store);
    const proposalId = custodyCoordinationProposalId(firstGrant.grantId);
    await service.create(2, proposalInput(firstGrant.grantId, support), 'coordination:create:no-side');
    await service.decide(
      device(1, 1),
      1,
      decisionInput(proposalId, 'accept'),
      'coordination:decide:no-side',
    );

    store.circles.get(10)!.coordinators.clear();
    await expect(service.ownerStatus(device(1, 1), 1, firstGrant.grantId)).resolves.toMatchObject({
      proposal: { state: 'closed', terminalDecision: 'accept' },
    });
    await expect(service.listCoordinator(2, 50)).resolves.toMatchObject({ proposals: [] });
  });
});
