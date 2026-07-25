import { describe, expect, it } from 'vitest';

import {
  CUSTODY_EXECUTION_CONTRACT,
  CUSTODY_EXECUTION_DELIVERY_DEADLINE_MS,
  CUSTODY_EXECUTION_EMPTY_VERSION,
  createCustodyExecutionEventSchema,
  CustodyExecutionService,
  virtualCustodyExecutionRoot,
  type CreateCustodyExecutionEventInput,
  type CustodyExecutionRecord,
  type CustodyExecutionStore,
  type StoredCustodyExecutionCommand,
  type StoredCustodyExecutionRoot,
} from '../../server/civic/custody-execution';
import type {
  StoredCustodyCoordinationDecision,
  StoredCustodyCoordinationProposal,
} from '../../server/civic/custody-coordination';
import type { CustodyDeviceRecord, StoredCustodyGrant } from '../../server/civic/custody-grants';
import type { CustodyPageRequest } from '../../server/civic/custody-pagination';
import { CivicApiError } from '../../server/civic/service';

const uuid = (value: number): string => `00000000-0000-4000-8000-${String(value).padStart(12, '0')}`;
const actorKey = (value: number): string => `actor_${uuid(value)}`;
const START = Date.parse('2026-07-14T15:00:00.000Z');

class MemoryExecutionStore implements CustodyExecutionStore {
  nowMs = START;
  activeUsers = new Set([1, 2, 3]);
  devices = new Map<string, CustodyDeviceRecord>([
    [actorKey(1), { actorKey: actorKey(1), linkedUserId: 1, revokedAt: null }],
    [actorKey(2), { actorKey: actorKey(2), linkedUserId: 1, revokedAt: null }],
  ]);
  circleAvailable = true;
  coordinators = new Set([2, 3]);
  grants = new Map<string, StoredCustodyGrant>();
  proposals = new Map<string, StoredCustodyCoordinationProposal>();
  decisions = new Map<string, StoredCustodyCoordinationDecision>();
  roots = new Map<string, StoredCustodyExecutionRoot>();
  commands: StoredCustodyExecutionCommand[] = [];
  nextRootRowId = 1;
  nextCommandRowId = 1;

  async runInTransaction<T>(operation: (store: CustodyExecutionStore) => Promise<T>) {
    return operation(this);
  }
  async currentTimestamp() { return new Date(this.nowMs).toISOString(); }
  async lockActiveUser(userId: number) { return this.activeUsers.has(userId); }
  async lockDevice(key: string) { return this.devices.get(key) ?? null; }
  async lockCircle(circleId: number) { return circleId === 10 && this.circleAvailable; }
  async lockCircleCoordinator(circleId: number, userId: number) {
    return circleId === 10 && this.circleAvailable
      && this.coordinators.has(userId) && this.activeUsers.has(userId);
  }
  async getGrantForUpdate(grantId: string) { return this.grants.get(grantId) ?? null; }
  async getProposal(proposalId: string) { return this.proposals.get(proposalId) ?? null; }
  async getProposalForUpdate(proposalId: string) { return this.getProposal(proposalId); }
  async getDecisionForUpdate(proposalId: string) { return this.decisions.get(proposalId) ?? null; }
  async getExecutionRootForUpdate(proposalId: string) { return this.roots.get(proposalId) ?? null; }
  async insertExecutionRoot(input: Omit<StoredCustodyExecutionRoot, 'rowId' | 'createdAt'>) {
    if (this.roots.has(input.proposalId)) return null;
    const row: StoredCustodyExecutionRoot = {
      ...input,
      rowId: this.nextRootRowId++,
      createdAt: new Date(this.nowMs).toISOString(),
    };
    this.roots.set(row.proposalId, row);
    return row;
  }
  async getCommands(proposalId: string) {
    return this.commands.filter((command) => command.proposalId === proposalId);
  }
  async findCommandConflicts(eventId: string, actorUserId: number, idempotencyKey: string) {
    return this.commands.filter((command) => command.eventId === eventId
      || (command.actorUserId === actorUserId && command.idempotencyKey === idempotencyKey));
  }
  async insertCommand(input: Omit<StoredCustodyExecutionCommand, 'rowId'>) {
    if ((await this.findCommandConflicts(input.eventId, input.actorUserId, input.idempotencyKey)).length) {
      return null;
    }
    if (input.applied && this.commands.some((command) => command.proposalId === input.proposalId
      && command.applied && (command.eventType === input.eventType || command.sequence === input.sequence))) {
      return null;
    }
    const row = { ...input, rowId: this.nextCommandRowId++ };
    this.commands.push(row);
    return row;
  }
  async getRecord(proposalId: string): Promise<CustodyExecutionRecord | null> {
    const proposal = this.proposals.get(proposalId);
    const decision = this.decisions.get(proposalId);
    if (!proposal || !decision || decision.decision !== 'accept') return null;
    const grant = this.grants.get(proposal.grantId);
    if (!grant) return null;
    return {
      proposal,
      decision,
      grant,
      root: this.roots.get(proposalId) ?? virtualCustodyExecutionRoot(proposal, decision, grant),
      commands: await this.getCommands(proposalId),
      coordinatorAvailable: await this.lockCircleCoordinator(grant.recipientCircleId, proposal.proposerUserId),
    };
  }
  async listCoordinatorRecords(userId: number, limit: number, page: CustodyPageRequest | null) {
    const snapshotMs = page ? Math.min(Date.parse(page.asOf), this.nowMs) : this.nowMs;
    const refreshedAt = new Date(snapshotMs).toISOString();
    if (!this.activeUsers.has(userId)) return { authorized: false, records: [], refreshedAt: null };
    const records: CustodyExecutionRecord[] = [];
    for (const proposal of [...this.proposals.values()]
      .filter((row) => !page || row.rowId < page.after.rowId)
      .sort((left, right) => right.rowId - left.rowId)) {
      const record = await this.getRecord(proposal.proposalId);
      if (!record || proposal.proposerUserId !== userId || !record.coordinatorAvailable) continue;
      records.push(record);
      if (records.length === limit) break;
    }
    return { authorized: true, records, refreshedAt };
  }
}

const setup = (quantity: number | null = 10) => {
  const store = new MemoryExecutionStore();
  const grantId = uuid(100);
  const proposalId = uuid(200);
  const decisionId = uuid(300);
  const expiresAt = new Date(START + 7 * 24 * 60 * 60_000).toISOString();
  const grant: StoredCustodyGrant = {
    rowId: 1,
    grantId,
    idempotencyKey: 'custody:grant:100',
    requestHash: 'a'.repeat(64),
    needId: uuid(400),
    ownerActorKey: actorKey(1),
    grantorUserId: 1,
    recipientType: 'circle',
    recipientCircleId: 10,
    payloadJson: {
      category: 'food', quantity, unit: quantity == null ? null : 'meals', urgency: 4, location: null,
    },
    expiresAt,
    revokedAt: null,
    closedAt: null,
    closedReason: null,
    createdAt: new Date(START - 60_000).toISOString(),
  };
  const proposal: StoredCustodyCoordinationProposal = {
    rowId: 1,
    proposalId,
    grantId,
    sourceResponseId: uuid(500),
    idempotencyKey: 'coordination:create:execution',
    requestHash: 'b'.repeat(64),
    proposerUserId: 2,
    quantity,
    unit: quantity == null ? null : 'meals',
    expiresAt,
    createdAt: new Date(START - 30_000).toISOString(),
  };
  const decision: StoredCustodyCoordinationDecision = {
    rowId: 1,
    decisionId,
    proposalId,
    idempotencyKey: 'coordination:accept:execution',
    requestHash: 'c'.repeat(64),
    deciderUserId: 1,
    ownerActorKey: actorKey(1),
    decision: 'accept',
    createdAt: new Date(START - 10_000).toISOString(),
  };
  store.grants.set(grantId, grant);
  store.proposals.set(proposalId, proposal);
  store.decisions.set(proposalId, decision);
  return { store, grant, proposal, decision, service: new CustodyExecutionService(store) };
};

const coordinator = { actorKey: null };
const grantor = { actorKey: actorKey(1) };
const key = (proposalId: string, eventId: string) =>
  `custody:${proposalId}:execution:event:${eventId}`;

const send = async (
  fixture: ReturnType<typeof setup>,
  userId: number,
  actor: { actorKey: string | null },
  type: CreateCustodyExecutionEventInput['type'],
  value: number,
  expectedVersion: string,
  payload: Record<string, unknown> = {},
) => {
  fixture.store.nowMs += 1;
  const eventId = uuid(1_000 + value);
  const input = createCustodyExecutionEventSchema.parse({
    eventId,
    proposalId: fixture.proposal.proposalId,
    expectedVersion,
    type,
    ...payload,
  });
  return fixture.service.recordEvent(actor, userId, input, key(input.proposalId, input.eventId));
};

const prepareStart = async (fixture: ReturnType<typeof setup>, offset = 0) => {
  let version = CUSTODY_EXECUTION_EMPTY_VERSION;
  version = (await send(fixture, 2, coordinator, 'reserve', offset + 1, version)).execution.version;
  version = (await send(fixture, 1, grantor, 'grantor_ready', offset + 2, version)).execution.version;
  version = (await send(fixture, 2, coordinator, 'coordinator_ready', offset + 3, version)).execution.version;
  const started = await send(fixture, 2, coordinator, 'start_delivery', offset + 4, version);
  return started;
};

const expectCode = async (promise: Promise<unknown>, code: string) => {
  await expect(promise).rejects.toMatchObject<CivicApiError>({ code });
};

describe('contrato privado de ejecución custodial', () => {
  it('acepta sólo el union discriminado exacto y no admite texto, contacto, ubicación ni payload libre', () => {
    const common = {
      eventId: uuid(1), proposalId: uuid(2), expectedVersion: CUSTODY_EXECUTION_EMPTY_VERSION,
    };
    expect(createCustodyExecutionEventSchema.safeParse({ ...common, type: 'reserve' }).success).toBe(true);
    expect(createCustodyExecutionEventSchema.safeParse({
      ...common, type: 'confirm_receipt', receipt: 'partial', quantity: 2,
    }).success).toBe(true);
    for (const extra of [
      { note: 'texto' }, { contact: '+54 261' }, { location: { lat: -32 } }, { payload: {} },
    ]) {
      expect(createCustodyExecutionEventSchema.safeParse({ ...common, type: 'reserve', ...extra }).success)
        .toBe(false);
    }
    expect(createCustodyExecutionEventSchema.safeParse({ ...common, type: 'report_delivery', unit: 'meals' }).success)
      .toBe(false);
    expect(createCustodyExecutionEventSchema.safeParse({
      ...common, type: 'confirm_receipt', receipt: 'not_received', quantity: 1,
    }).success).toBe(true); // la máquina de estados lo rechaza y conserva, no el parser.
  });

  it('proyecta una aceptación sin eventos como awaiting_reservation sin identidades ni PII', async () => {
    const fixture = setup();
    const result = await fixture.service.status(coordinator, 2, fixture.proposal.proposalId);
    expect(result).toEqual({
      contract: CUSTODY_EXECUTION_CONTRACT,
      scope: 'private-custody-execution-status',
      execution: {
        proposalId: fixture.proposal.proposalId,
        state: 'awaiting_reservation',
        version: CUSTODY_EXECUTION_EMPTY_VERSION,
        capacity: { quantity: 10, unit: 'meals' },
        delivery: null,
        receipt: null,
        followUp: null,
        readiness: { grantor: false, coordinator: false },
        reconciliation: { receiptAvailableAt: null, receiptWindowOpen: false, withdrawnBy: null },
        milestones: {
          reservedAt: null,
          grantorReadyAt: null,
          coordinatorReadyAt: null,
          deliveryStartedAt: null,
          deliveryReportedAt: null,
          receiptRecordedAt: null,
          followUpRecordedAt: null,
          withdrawnAt: null,
        },
        createdAt: fixture.decision.createdAt,
        expiresAt: fixture.proposal.expiresAt,
        updatedAt: fixture.decision.createdAt,
      },
      refreshedAt: new Date(fixture.store.nowMs).toISOString(),
    });
    expect(JSON.stringify(result)).not.toMatch(/needId|grantId|userId|actorKey|contact|location|payload/i);
    expect(fixture.store.roots.size).toBe(0);
  });

  it('status toma el lock padre y lee ledger antes del reloj que etiqueta la respuesta', async () => {
    const fixture = setup();
    const calls: string[] = [];
    const getGrant = fixture.store.getGrantForUpdate.bind(fixture.store);
    const getRoot = fixture.store.getExecutionRootForUpdate.bind(fixture.store);
    const getProposal = fixture.store.getProposalForUpdate.bind(fixture.store);
    const getDecision = fixture.store.getDecisionForUpdate.bind(fixture.store);
    const getCommands = fixture.store.getCommands.bind(fixture.store);
    const currentTimestamp = fixture.store.currentTimestamp.bind(fixture.store);
    fixture.store.getGrantForUpdate = async (...args) => { calls.push('grant'); return getGrant(...args); };
    fixture.store.getExecutionRootForUpdate = async (...args) => { calls.push('root'); return getRoot(...args); };
    fixture.store.getProposalForUpdate = async (...args) => { calls.push('proposal'); return getProposal(...args); };
    fixture.store.getDecisionForUpdate = async (...args) => { calls.push('decision'); return getDecision(...args); };
    fixture.store.getCommands = async (...args) => { calls.push('commands'); return getCommands(...args); };
    fixture.store.currentTimestamp = async () => { calls.push('now'); return currentTimestamp(); };
    fixture.store.getRecord = async () => { throw new Error('status must not use unlocked getRecord'); };

    await expect(fixture.service.status(coordinator, 2, fixture.proposal.proposalId)).resolves.toMatchObject({
      execution: { state: 'awaiting_reservation' },
    });
    expect(calls.indexOf('grant')).toBeLessThan(calls.indexOf('root'));
    expect(calls.indexOf('root')).toBeLessThan(calls.indexOf('proposal'));
    expect(calls.indexOf('proposal')).toBeLessThan(calls.indexOf('decision'));
    expect(calls.indexOf('decision')).toBeLessThan(calls.indexOf('commands'));
    expect(calls.indexOf('commands')).toBeLessThan(calls.indexOf('now'));
  });

  it('permite readiness antes de reserva y completa toda la cadena con reloj DB y conciliación monotónica', async () => {
    const fixture = setup();
    let version = CUSTODY_EXECUTION_EMPTY_VERSION;
    let result = await send(fixture, 2, coordinator, 'coordinator_ready', 1, version);
    version = result.execution.version;
    expect(result.execution).toMatchObject({
      state: 'awaiting_reservation', readiness: { coordinator: true, grantor: false },
    });
    result = await send(fixture, 1, grantor, 'grantor_ready', 2, version);
    version = result.execution.version;
    expect(result.execution.state).toBe('awaiting_reservation');
    result = await send(fixture, 2, coordinator, 'reserve', 3, version);
    version = result.execution.version;
    expect(result.execution.state).toBe('ready');
    result = await send(fixture, 2, coordinator, 'start_delivery', 4, version);
    version = result.execution.version;
    const deadline = new Date(
      Date.parse(result.recordedEvent!.recordedAt) + CUSTODY_EXECUTION_DELIVERY_DEADLINE_MS,
    ).toISOString();
    expect(result).toMatchObject({
      status: 'accepted',
      refreshedAt: new Date(fixture.store.nowMs).toISOString(),
      execution: {
        state: 'in_transit',
        reconciliation: { receiptAvailableAt: deadline, receiptWindowOpen: false, withdrawnBy: null },
      },
    });
    result = await send(fixture, 2, coordinator, 'report_delivery', 5, version, { quantity: 8 });
    version = result.execution.version;
    expect(result.execution).toMatchObject({
      state: 'delivery_reported', delivery: { quantity: 8, unit: 'meals' },
      reconciliation: { receiptAvailableAt: deadline, receiptWindowOpen: true },
    });
    result = await send(fixture, 1, grantor, 'confirm_receipt', 6, version, { receipt: 'full' });
    version = result.execution.version;
    expect(result.recordedEvent).toMatchObject({ quantity: 8, unit: 'meals', receipt: 'full' });
    expect(result.execution).toMatchObject({
      state: 'received', receipt: { outcome: 'full', quantity: 8, unit: 'meals' },
      reconciliation: { receiptWindowOpen: true },
    });
    result = await send(fixture, 1, grantor, 'record_follow_up', 7, version, { followUp: 'need_met' });
    expect(result.execution).toMatchObject({ state: 'completed', followUp: 'need_met' });
    expect(fixture.store.commands.filter((command) => command.applied)).toHaveLength(7);
  });

  it('persiste un rechazo de transición y su replay nunca se vuelve aplicable', async () => {
    const fixture = setup();
    const eventId = uuid(1_100);
    const input = createCustodyExecutionEventSchema.parse({
      eventId,
      proposalId: fixture.proposal.proposalId,
      expectedVersion: CUSTODY_EXECUTION_EMPTY_VERSION,
      type: 'start_delivery',
    });
    const idem = key(input.proposalId, input.eventId);
    const rejected = await fixture.service.recordEvent(coordinator, 2, input, idem);
    expect(rejected).toMatchObject({
      contract: CUSTODY_EXECUTION_CONTRACT,
      status: 'rejected', reason: 'transition_not_allowed', eventId, recordedEvent: null,
      refreshedAt: new Date(fixture.store.nowMs).toISOString(),
    });
    expect(fixture.store.commands[0]).toMatchObject({ applied: false, sequence: null, eventVersion: null });

    const started = await prepareStart(fixture, 20);
    const replay = await fixture.service.recordEvent(coordinator, 2, input, idem);
    expect(replay).toMatchObject({
      status: 'rejected', reason: 'transition_not_allowed', recordedEvent: null,
      execution: { state: 'in_transit', version: started.execution.version },
    });
    expect(fixture.store.commands.filter((command) => command.eventId === eventId)).toHaveLength(1);
  });

  it('da precedencia a version_changed y trata eventId/key/body como identidad indivisible', async () => {
    const fixture = setup();
    const eventId = uuid(1_200);
    const stale = createCustodyExecutionEventSchema.parse({
      eventId,
      proposalId: fixture.proposal.proposalId,
      expectedVersion: 'd'.repeat(64),
      type: 'reserve',
    });
    const idem = key(stale.proposalId, stale.eventId);
    await expect(fixture.service.recordEvent(coordinator, 2, stale, idem)).resolves.toMatchObject({
      status: 'rejected', reason: 'version_changed',
    });
    await expectCode(fixture.service.recordEvent(coordinator, 2, {
      ...stale,
      expectedVersion: CUSTODY_EXECUTION_EMPTY_VERSION,
    }, idem), 'CUSTODY_EXECUTION_IDEMPOTENCY_CONFLICT');
    await expectCode(fixture.service.recordEvent(
      coordinator,
      2,
      { ...stale, eventId: uuid(1_201) },
      idem,
    ), 'INVALID_CUSTODY_EXECUTION_IDEMPOTENCY_KEY');
  });

  it('conserva el recordedEvent histórico exacto aunque el replay proyecte el estado actual', async () => {
    const fixture = setup();
    const eventId = uuid(1_300);
    const reserve = createCustodyExecutionEventSchema.parse({
      eventId,
      proposalId: fixture.proposal.proposalId,
      expectedVersion: CUSTODY_EXECUTION_EMPTY_VERSION,
      type: 'reserve',
    });
    const idem = key(reserve.proposalId, reserve.eventId);
    const first = await fixture.service.recordEvent(coordinator, 2, reserve, idem);
    await send(fixture, 1, grantor, 'grantor_ready', 301, first.execution.version);
    fixture.store.nowMs += 5_000;
    const replay = await fixture.service.recordEvent(coordinator, 2, reserve, idem);
    expect(replay.status).toBe('duplicate');
    if (first.status === 'rejected' || replay.status === 'rejected') throw new Error('unexpected rejection');
    expect(replay.recordedEvent).toEqual(first.recordedEvent);
    expect(replay.execution.version).not.toBe(first.execution.version);
    expect(replay.refreshedAt).toBe(new Date(fixture.store.nowMs).toISOString());
  });

  it('fija coordinador, grantor y dispositivo exactos sin takeover por otro coordinador', async () => {
    const fixture = setup();
    const reserve = {
      eventId: uuid(1_400), proposalId: fixture.proposal.proposalId,
      expectedVersion: CUSTODY_EXECUTION_EMPTY_VERSION, type: 'reserve' as const,
    };
    await expectCode(
      fixture.service.recordEvent(coordinator, 3, reserve, key(reserve.proposalId, reserve.eventId)),
      'CUSTODY_EXECUTION_NOT_FOUND',
    );
    const ready = {
      eventId: uuid(1_401), proposalId: fixture.proposal.proposalId,
      expectedVersion: CUSTODY_EXECUTION_EMPTY_VERSION, type: 'grantor_ready' as const,
    };
    await expectCode(
      fixture.service.recordEvent({ actorKey: null }, 1, ready, key(ready.proposalId, ready.eventId)),
      'MISSING_CIVIC_PROOF',
    );
    await expectCode(
      fixture.service.recordEvent({ actorKey: actorKey(2) }, 1, ready, key(ready.proposalId, ready.eventId)),
      'CUSTODY_EXECUTION_NOT_FOUND',
    );
    expect(fixture.store.roots.size).toBe(0);
  });

  it('valida cantidades contra la capacidad congelada y normaliza full a la referencia', async () => {
    const fixture = setup(10);
    let version = (await prepareStart(fixture, 400)).execution.version;
    let rejected = await send(fixture, 2, coordinator, 'report_delivery', 405, version);
    expect(rejected).toMatchObject({ status: 'rejected', reason: 'transition_not_allowed' });
    rejected = await send(fixture, 2, coordinator, 'report_delivery', 406, version, { quantity: 11 });
    expect(rejected).toMatchObject({ status: 'rejected', reason: 'transition_not_allowed' });
    const report = await send(fixture, 2, coordinator, 'report_delivery', 407, version, { quantity: 7 });
    version = report.execution.version;
    rejected = await send(fixture, 1, grantor, 'confirm_receipt', 408, version, {
      receipt: 'partial', quantity: 7,
    });
    expect(rejected).toMatchObject({ status: 'rejected', reason: 'transition_not_allowed' });
    const receipt = await send(fixture, 1, grantor, 'confirm_receipt', 409, version, {
      receipt: 'partial', quantity: 3,
    });
    expect(receipt).toMatchObject({
      recordedEvent: { quantity: 3, unit: 'meals' },
      execution: { state: 'received', receipt: { outcome: 'partial', quantity: 3, unit: 'meals' } },
    });
  });

  it('admite ejecución no cuantificada sin inventar unidad ni cantidad', async () => {
    const fixture = setup(null);
    let version = (await prepareStart(fixture, 500)).execution.version;
    const invalidReport = await send(
      fixture, 2, coordinator, 'report_delivery', 508, version, { quantity: 1 },
    );
    expect(invalidReport).toMatchObject({ status: 'rejected', reason: 'transition_not_allowed' });
    expect(fixture.store.commands.at(-1)).toMatchObject({
      applied: false, quantity: 1, unit: null,
    });
    const report = await send(fixture, 2, coordinator, 'report_delivery', 509, version);
    version = report.execution.version;
    expect(report.recordedEvent).toMatchObject({ quantity: null, unit: null });
    const invalidReceipt = await send(fixture, 1, grantor, 'confirm_receipt', 510, version, {
      receipt: 'full', quantity: 1,
    });
    expect(invalidReceipt).toMatchObject({ status: 'rejected', reason: 'transition_not_allowed' });
    expect(fixture.store.commands.at(-1)).toMatchObject({
      applied: false, quantity: 1, unit: null,
    });
    const receipt = await send(fixture, 1, grantor, 'confirm_receipt', 511, version, {
      receipt: 'partial',
    });
    expect(receipt).toMatchObject({
      recordedEvent: { quantity: null, unit: null },
      execution: { receipt: { outcome: 'partial', quantity: null, unit: null } },
    });
  });

  it('abre la conciliación sin reporte sólo por retiro del coordinador o deadline DB', async () => {
    const preStart = setup(10);
    const preStartWithdrawal = await send(
      preStart,
      2,
      coordinator,
      'withdraw',
      599,
      CUSTODY_EXECUTION_EMPTY_VERSION,
    );
    expect(preStartWithdrawal.execution).toMatchObject({
      state: 'cancelled',
      reconciliation: {
        receiptAvailableAt: null,
        receiptWindowOpen: false,
        withdrawnBy: 'coordinator',
      },
    });

    const withdrawn = setup(10);
    let version = (await prepareStart(withdrawn, 600)).execution.version;
    const withdrawal = await send(withdrawn, 2, coordinator, 'withdraw', 605, version);
    version = withdrawal.execution.version;
    expect(withdrawal.execution).toMatchObject({
      state: 'cancelled',
      reconciliation: { receiptWindowOpen: true, withdrawnBy: 'coordinator' },
    });
    const receipt = await send(withdrawn, 1, grantor, 'confirm_receipt', 606, version, { receipt: 'full' });
    expect(receipt.execution).toMatchObject({
      state: 'received', delivery: null,
      receipt: { outcome: 'full', quantity: 10, unit: 'meals' },
      reconciliation: { receiptWindowOpen: true, withdrawnBy: 'coordinator' },
    });

    const timed = setup(10);
    const started = await prepareStart(timed, 700);
    const earlyEventId = uuid(1_706);
    const earlyInput = createCustodyExecutionEventSchema.parse({
      eventId: earlyEventId,
      proposalId: timed.proposal.proposalId,
      expectedVersion: started.execution.version,
      type: 'confirm_receipt',
      receipt: 'not_received',
    });
    const earlyKey = key(earlyInput.proposalId, earlyInput.eventId);
    await expect(timed.service.recordEvent(grantor, 1, earlyInput, earlyKey)).resolves.toMatchObject({
      status: 'rejected', reason: 'transition_not_allowed',
      execution: { reconciliation: { receiptWindowOpen: false } },
    });
    timed.store.nowMs = Date.parse(started.execution.reconciliation.receiptAvailableAt!);
    await expect(timed.service.recordEvent(grantor, 1, earlyInput, earlyKey)).resolves.toMatchObject({
      status: 'rejected', reason: 'transition_not_allowed',
      execution: { reconciliation: { receiptWindowOpen: true } },
    });
    const disputed = await send(
      timed, 1, grantor, 'confirm_receipt', 707, started.execution.version, { receipt: 'not_received' },
    );
    expect(disputed.execution).toMatchObject({ state: 'disputed', delivery: null });
    const follow = await send(
      timed, 1, grantor, 'record_follow_up', 708, disputed.execution.version, { followUp: 'still_open' },
    );
    expect(follow).toMatchObject({ status: 'rejected', reason: 'transition_not_allowed' });
  });

  it('el retiro del grantor no abre la ventana y la conciliación terminal prevalece sobre cierre externo', async () => {
    const fixture = setup(10);
    let version = (await prepareStart(fixture, 800)).execution.version;
    const withdrawal = await send(fixture, 1, grantor, 'withdraw', 805, version);
    version = withdrawal.execution.version;
    expect(withdrawal.execution.reconciliation).toMatchObject({
      receiptWindowOpen: false, withdrawnBy: 'grantor',
    });
    const early = await send(fixture, 1, grantor, 'confirm_receipt', 806, version, { receipt: 'full' });
    expect(early).toMatchObject({ status: 'rejected', reason: 'transition_not_allowed' });
    fixture.grant.revokedAt = new Date(fixture.store.nowMs).toISOString();
    fixture.grant.closedAt = fixture.grant.revokedAt;
    fixture.grant.closedReason = 'revoked';
    fixture.store.nowMs = Date.parse(withdrawal.execution.reconciliation.receiptAvailableAt!);
    const received = await send(fixture, 1, grantor, 'confirm_receipt', 807, version, { receipt: 'full' });
    expect(received.execution).toMatchObject({
      state: 'received', delivery: null,
      reconciliation: { receiptWindowOpen: true, withdrawnBy: 'grantor' },
    });
    const completed = await send(
      fixture, 1, grantor, 'record_follow_up', 808, received.execution.version, { followUp: 'need_met' },
    );
    expect(completed.execution.state).toBe('completed');
  });

  it('la bandeja incluye aceptaciones sin raíz/eventos y usa cursor opaco específico', async () => {
    const fixture = setup();
    const inbox = await fixture.service.inbox(2, 50);
    expect(inbox).toMatchObject({
      contract: CUSTODY_EXECUTION_CONTRACT,
      scope: 'private-custody-execution-coordinator-inbox',
      executions: [{ proposalId: fixture.proposal.proposalId, state: 'awaiting_reservation' }],
      refreshedAt: new Date(fixture.store.nowMs).toISOString(),
      nextCursor: null,
    });
    fixture.store.activeUsers.delete(2);
    await expectCode(fixture.service.inbox(2, 50), 'ACCOUNT_NOT_ACTIVE');
  });
});
