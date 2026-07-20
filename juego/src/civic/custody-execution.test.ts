import { describe, expect, it, vi } from 'vitest';

import {
  CUSTODY_EXECUTION_CONTRACT,
  CUSTODY_EXECUTION_EMPTY_VERSION,
  CUSTODY_EXECUTION_INBOX_SCOPE,
  CUSTODY_EXECUTION_STATUS_SCOPE,
  parseCustodyExecutionCoordinatorInboxPage,
  parseCustodyExecutionMutationReceipt,
  parseCustodyExecutionStatus,
  parseCustodyExecutionView,
  type CustodyExecutionMutationReceipt,
  type CustodyExecutionView,
} from './custody-execution';

vi.mock('expo-crypto', () => ({
  randomUUID: () => '7dc827ec-bd89-4ccd-9353-f8b69193fd41',
}));
vi.mock('@/db/client', () => ({
  db: {},
  flushWebDatabaseSnapshot: vi.fn(async () => undefined),
}));
vi.mock('./community-auth', () => ({
  communityErrorFromResponse: vi.fn(),
  communityFetchForUser: vi.fn(),
  getCommunitySession: vi.fn(),
}));
vi.mock('./config', () => ({ CIVIC_API_URL: 'https://civic.example' }));
vi.mock('./device-auth', () => ({ ensureCivicDeviceToken: vi.fn() }));

const proposalId = '2c69a5cc-d9fb-4afb-9b78-f56ca7a11b1e';
const eventId = '1dc827ec-bd89-4ccd-9353-f8b69193fd41';
const createdAt = '2026-07-14T12:00:00.000Z';
const expiresAt = '2026-07-20T12:00:00.000Z';
const reserveAt = '2026-07-14T12:01:00.000Z';
const grantorReadyAt = '2026-07-14T12:02:00.000Z';
const coordinatorReadyAt = '2026-07-14T12:03:00.000Z';
const startedAt = '2026-07-14T12:04:00.000Z';
const availableAt = '2026-07-15T12:04:00.000Z';
const reportedAt = '2026-07-14T12:05:00.000Z';
const withdrawnAt = '2026-07-14T12:06:00.000Z';
const receiptAt = '2026-07-15T12:05:00.000Z';
const refreshedBeforeDeadline = '2026-07-14T13:00:00.000Z';
const refreshedAfterDeadline = '2026-07-15T13:00:00.000Z';

const version = (letter: string): string => letter.repeat(64);
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const initialExecution = (id = proposalId): CustodyExecutionView => ({
  proposalId: id,
  state: 'awaiting_reservation',
  version: CUSTODY_EXECUTION_EMPTY_VERSION,
  capacity: { quantity: 12, unit: 'meals' },
  readiness: { grantor: false, coordinator: false },
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
  delivery: null,
  receipt: null,
  followUp: null,
  reconciliation: {
    receiptAvailableAt: null,
    receiptWindowOpen: false,
    withdrawnBy: null,
  },
  createdAt,
  expiresAt,
  updatedAt: createdAt,
});

const startedExecution = (): CustodyExecutionView => ({
  ...initialExecution(),
  state: 'in_transit',
  version: version('d'),
  readiness: { grantor: true, coordinator: true },
  milestones: {
    ...initialExecution().milestones,
    reservedAt: reserveAt,
    grantorReadyAt,
    coordinatorReadyAt,
    deliveryStartedAt: startedAt,
  },
  reconciliation: {
    receiptAvailableAt: availableAt,
    receiptWindowOpen: false,
    withdrawnBy: null,
  },
  updatedAt: startedAt,
});

const reportedExecution = (): CustodyExecutionView => ({
  ...startedExecution(),
  state: 'delivery_reported',
  version: version('e'),
  milestones: { ...startedExecution().milestones, deliveryReportedAt: reportedAt },
  delivery: { quantity: 10, unit: 'meals' },
  reconciliation: {
    receiptAvailableAt: availableAt,
    receiptWindowOpen: true,
    withdrawnBy: null,
  },
  updatedAt: reportedAt,
});

const withdrawnExecution = (role: 'coordinator' | 'grantor' = 'coordinator'): CustodyExecutionView => ({
  ...startedExecution(),
  state: 'cancelled',
  version: version('e'),
  milestones: { ...startedExecution().milestones, withdrawnAt },
  reconciliation: {
    receiptAvailableAt: availableAt,
    receiptWindowOpen: role === 'coordinator',
    withdrawnBy: role,
  },
  updatedAt: withdrawnAt,
});

const receivedWithoutReport = (
  outcome: 'full' | 'partial' = 'full',
): CustodyExecutionView => ({
  ...startedExecution(),
  state: 'received',
  version: version('f'),
  milestones: { ...startedExecution().milestones, receiptRecordedAt: receiptAt },
  receipt: {
    outcome,
    quantity: outcome === 'full' ? 12 : 6,
    unit: 'meals',
  },
  reconciliation: {
    receiptAvailableAt: availableAt,
    receiptWindowOpen: true,
    withdrawnBy: null,
  },
  updatedAt: receiptAt,
});

type EventRequest = Parameters<typeof parseCustodyExecutionMutationReceipt>[1];

describe('contrato privado de ejecución custodial', () => {
  it('acepta readiness antes de reserve sin confundirla con una reserva', () => {
    const readinessFirst: CustodyExecutionView = {
      ...initialExecution(),
      version: version('a'),
      readiness: { grantor: true, coordinator: false },
      milestones: { ...initialExecution().milestones, grantorReadyAt },
      updatedAt: grantorReadyAt,
    };

    expect(parseCustodyExecutionView(readinessFirst, refreshedBeforeDeadline)).toEqual(readinessFirst);
  });

  it('acepta recepción full o partial sin report después de abrirse la ventana', () => {
    expect(parseCustodyExecutionView(receivedWithoutReport('full'), refreshedAfterDeadline).receipt)
      .toEqual({ outcome: 'full', quantity: 12, unit: 'meals' });
    expect(parseCustodyExecutionView(receivedWithoutReport('partial'), refreshedAfterDeadline).state)
      .toBe('received');

    const wrongState = { ...receivedWithoutReport('partial'), state: 'disputed' };
    expect(() => parseCustodyExecutionView(wrongState, refreshedAfterDeadline)).toThrow();
  });

  it('valida reconciliación contra inicio, report, retiro y tiempo autoritativo', () => {
    expect(parseCustodyExecutionView(startedExecution(), refreshedBeforeDeadline)
      .reconciliation.receiptWindowOpen).toBe(false);

    const deadlineOpen = startedExecution();
    deadlineOpen.reconciliation.receiptWindowOpen = true;
    expect(parseCustodyExecutionView(deadlineOpen, refreshedAfterDeadline)
      .reconciliation.receiptWindowOpen).toBe(true);
    expect(() => parseCustodyExecutionView(deadlineOpen, refreshedBeforeDeadline)).toThrow();

    expect(parseCustodyExecutionView(reportedExecution(), refreshedBeforeDeadline)
      .reconciliation.receiptWindowOpen).toBe(true);
    expect(parseCustodyExecutionView(withdrawnExecution('coordinator'), refreshedBeforeDeadline)
      .reconciliation.receiptWindowOpen).toBe(true);
    expect(parseCustodyExecutionView(withdrawnExecution('grantor'), refreshedBeforeDeadline)
      .reconciliation.receiptWindowOpen).toBe(false);

    const wrongDeadline = clone(startedExecution());
    wrongDeadline.reconciliation.receiptAvailableAt = '2026-07-15T12:03:59.000Z';
    expect(() => parseCustodyExecutionView(wrongDeadline, refreshedBeforeDeadline)).toThrow();

    const missingActor = clone(withdrawnExecution());
    missingActor.reconciliation.withdrawnBy = null;
    expect(() => parseCustodyExecutionView(missingActor, refreshedBeforeDeadline)).toThrow();
  });

  it('falla cerrado ante PII, claves nuevas o una cronología imposible', () => {
    const withContact = clone(initialExecution()) as CustodyExecutionView & { contact?: string };
    withContact.contact = 'dato privado';
    expect(() => parseCustodyExecutionView(withContact, refreshedBeforeDeadline)).toThrow();

    const nestedExtra = clone(initialExecution()) as CustodyExecutionView;
    Object.assign(nestedExtra.reconciliation, { note: 'texto libre' });
    expect(() => parseCustodyExecutionView(nestedExtra, refreshedBeforeDeadline)).toThrow();

    const reversed = clone(reportedExecution());
    reversed.milestones.deliveryReportedAt = '2026-07-14T12:03:30.000Z';
    reversed.updatedAt = reversed.milestones.deliveryReportedAt;
    expect(() => parseCustodyExecutionView(reversed, refreshedBeforeDeadline)).toThrow();
  });

  it('valida el envelope status exacto y ata la respuesta a proposalId', () => {
    const status = {
      contract: CUSTODY_EXECUTION_CONTRACT,
      scope: CUSTODY_EXECUTION_STATUS_SCOPE,
      execution: initialExecution(),
      refreshedAt: refreshedBeforeDeadline,
    };
    expect(parseCustodyExecutionStatus(status, proposalId, Date.parse(refreshedBeforeDeadline)))
      .toEqual(status);
    expect(() => parseCustodyExecutionStatus({ ...status, grantId: eventId }, proposalId)).toThrow();
    expect(() => parseCustodyExecutionStatus(status, eventId)).toThrow();
  });

  it('valida páginas cerradas, cursores y unicidad de la bandeja', () => {
    const page = {
      contract: CUSTODY_EXECUTION_CONTRACT,
      scope: CUSTODY_EXECUTION_INBOX_SCOPE,
      executions: [initialExecution()],
      refreshedAt: refreshedBeforeDeadline,
      nextCursor: 'cursor_01',
    };
    expect(parseCustodyExecutionCoordinatorInboxPage(page, 1, Date.parse(refreshedBeforeDeadline)))
      .toEqual(page);
    expect(() => parseCustodyExecutionCoordinatorInboxPage({
      ...page,
      executions: [initialExecution(), initialExecution()],
      nextCursor: null,
    }, 2)).toThrow();
    expect(() => parseCustodyExecutionCoordinatorInboxPage({ ...page, nextCursor: 'x' }, 1)).toThrow();
  });

  it('normaliza en la constancia full omitido contra report o capacidad', () => {
    const snapshot = withdrawnExecution('coordinator');
    const current: CustodyExecutionView = {
      ...snapshot,
      state: 'received',
      version: version('f'),
      milestones: { ...snapshot.milestones, receiptRecordedAt: '2026-07-14T12:07:00.000Z' },
      receipt: { outcome: 'full', quantity: 12, unit: 'meals' },
      updatedAt: '2026-07-14T12:07:00.000Z',
    };
    const request: EventRequest = {
      eventId,
      proposalId,
      expectedVersion: snapshot.version,
      type: 'confirm_receipt',
      receipt: 'full',
    };
    const receipt: CustodyExecutionMutationReceipt = {
      contract: CUSTODY_EXECUTION_CONTRACT,
      status: 'accepted',
      recordedEvent: {
        eventId,
        proposalId,
        type: 'confirm_receipt',
        actorRole: 'grantor',
        expectedVersion: snapshot.version,
        quantity: 12,
        unit: 'meals',
        receipt: 'full',
        followUp: null,
        recordedAt: '2026-07-14T12:07:00.000Z',
        version: version('f'),
      },
      execution: current,
      refreshedAt: refreshedAfterDeadline,
    };

    expect(parseCustodyExecutionMutationReceipt(
      receipt,
      request,
      snapshot,
      Date.parse(refreshedAfterDeadline),
    )).toEqual(receipt);

    const notNormalized = clone(receipt);
    notNormalized.recordedEvent.quantity = null;
    notNormalized.recordedEvent.unit = null;
    expect(() => parseCustodyExecutionMutationReceipt(
      notNormalized,
      request,
      snapshot,
      Date.parse(refreshedAfterDeadline),
    )).toThrow();
  });

  it('separa el evento duplicado histórico de la ejecución actual más nueva', () => {
    const snapshot = withdrawnExecution('coordinator');
    const received: CustodyExecutionView = {
      ...snapshot,
      state: 'received',
      version: version('f'),
      milestones: { ...snapshot.milestones, receiptRecordedAt: '2026-07-14T12:07:00.000Z' },
      receipt: { outcome: 'full', quantity: 12, unit: 'meals' },
      updatedAt: '2026-07-14T12:07:00.000Z',
    };
    const current: CustodyExecutionView = {
      ...received,
      state: 'completed',
      version: version('9'),
      milestones: { ...received.milestones, followUpRecordedAt: '2026-07-14T12:08:00.000Z' },
      followUp: 'need_met',
      updatedAt: '2026-07-14T12:08:00.000Z',
    };
    const request: EventRequest = {
      eventId,
      proposalId,
      expectedVersion: snapshot.version,
      type: 'confirm_receipt',
      receipt: 'full',
    };
    const duplicate = {
      contract: CUSTODY_EXECUTION_CONTRACT,
      status: 'duplicate',
      recordedEvent: {
        eventId,
        proposalId,
        type: 'confirm_receipt',
        actorRole: 'grantor',
        expectedVersion: snapshot.version,
        quantity: 12,
        unit: 'meals',
        receipt: 'full',
        followUp: null,
        recordedAt: '2026-07-14T12:07:00.000Z',
        version: version('f'),
      },
      execution: current,
      refreshedAt: refreshedAfterDeadline,
    };

    expect(parseCustodyExecutionMutationReceipt(
      duplicate,
      request,
      snapshot,
      Date.parse(refreshedAfterDeadline),
    ).execution.version).toBe(version('9'));

    expect(() => parseCustodyExecutionMutationReceipt(
      { ...duplicate, status: 'accepted' },
      request,
      snapshot,
      Date.parse(refreshedAfterDeadline),
    )).toThrow();
  });

  it('acepta sólo un rechazo exacto que demuestre no aplicación', () => {
    const snapshot = initialExecution();
    const current: CustodyExecutionView = {
      ...snapshot,
      state: 'reserved',
      version: version('a'),
      milestones: { ...snapshot.milestones, reservedAt: reserveAt },
      updatedAt: reserveAt,
    };
    const request: EventRequest = {
      eventId,
      proposalId,
      expectedVersion: snapshot.version,
      type: 'grantor_ready',
    };
    const rejected = {
      contract: CUSTODY_EXECUTION_CONTRACT,
      status: 'rejected',
      reason: 'version_changed',
      eventId,
      recordedEvent: null,
      execution: current,
      refreshedAt: refreshedBeforeDeadline,
    } as const;
    expect(parseCustodyExecutionMutationReceipt(
      rejected,
      request,
      snapshot,
      Date.parse(refreshedBeforeDeadline),
    )).toEqual(rejected);
    expect(() => parseCustodyExecutionMutationReceipt(
      { ...rejected, execution: snapshot },
      request,
      snapshot,
    )).toThrow();
    expect(() => parseCustodyExecutionMutationReceipt(
      { ...rejected, recordedEvent: {} },
      request,
      snapshot,
    )).toThrow();
  });
});
