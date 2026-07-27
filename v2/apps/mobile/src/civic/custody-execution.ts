import { and, eq } from 'drizzle-orm';
import * as Crypto from 'expo-crypto';

import { db, flushWebDatabaseSnapshot } from '@/db/client';
import {
  civicNeedAccessGrants,
  type CivicCustodyExecutionIntentRow,
  type CivicNeedAccessGrantRow,
} from '@/db/schema';

import {
  clearVerifiedCustodyExecutionIntent,
  findCustodyExecutionIntent,
  listCustodyExecutionIntents,
  markCustodyExecutionIntentAttempt,
  reserveCustodyExecutionIntent,
  type CustodyExecutionIntentDatabase,
} from './custody-execution-intents';
import {
  communityErrorFromResponse,
  communityFetchForUser,
  getCommunitySession,
} from './community-auth';
import { CIVIC_API_URL } from './config';
import { ensureCivicDeviceToken } from './device-auth';
import type { CustodyExecutionEventType, NeedCoordinationUnit } from './types';

export type { CustodyExecutionEventType } from './types';

export const CUSTODY_EXECUTION_CONTRACT = 'basta-civic-custody-execution/v1' as const;
export const CUSTODY_EXECUTION_STATUS_SCOPE = 'private-custody-execution-status' as const;
export const CUSTODY_EXECUTION_INBOX_SCOPE = 'private-custody-execution-coordinator-inbox' as const;
export const CUSTODY_EXECUTION_EMPTY_VERSION = '4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945' as const;

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const SHA256_HEX = /^[0-9a-f]{64}$/;
const PRIVATE_PAGE_CURSOR = /^[A-Za-z0-9_-]{8,768}$/;
const UTC_DATETIME = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,9})?Z$/;
const CLOCK_TOLERANCE_MS = 5 * 60_000;
const RECEIPT_DEADLINE_MS = 24 * 60 * 60_000;
const MAX_QUANTITY = 1_000_000_000;
const MAX_PAGES = 20;
const PAGE_LIMIT = 50;

export type CustodyExecutionUnit = NeedCoordinationUnit;
export type CustodyExecutionState =
  | 'awaiting_reservation'
  | 'reserved'
  | 'ready'
  | 'in_transit'
  | 'delivery_reported'
  | 'received'
  | 'needs_follow_up'
  | 'completed'
  | 'disputed'
  | 'cancelled'
  | 'expired'
  | 'closed';
export type CustodyExecutionActorRole = 'coordinator' | 'grantor';
export type CustodyExecutionReceiptOutcome = 'full' | 'partial' | 'not_received';
export type CustodyExecutionFollowUp = 'need_met' | 'still_open';

const EVENT_TYPES = new Set<CustodyExecutionEventType>([
  'reserve',
  'grantor_ready',
  'coordinator_ready',
  'start_delivery',
  'report_delivery',
  'confirm_receipt',
  'record_follow_up',
  'withdraw',
]);
const STATES = new Set<CustodyExecutionState>([
  'awaiting_reservation',
  'reserved',
  'ready',
  'in_transit',
  'delivery_reported',
  'received',
  'needs_follow_up',
  'completed',
  'disputed',
  'cancelled',
  'expired',
  'closed',
]);
const UNITS = new Set<CustodyExecutionUnit>([
  'people',
  'meals',
  'units',
  'hours',
  'kilograms',
  'liters',
  'trips',
  'days',
  'beds',
  'kits',
  'other',
]);

export interface CustodyExecutionView {
  proposalId: string;
  state: CustodyExecutionState;
  version: string;
  capacity: { quantity: number | null; unit: CustodyExecutionUnit | null };
  readiness: { grantor: boolean; coordinator: boolean };
  milestones: {
    reservedAt: string | null;
    grantorReadyAt: string | null;
    coordinatorReadyAt: string | null;
    deliveryStartedAt: string | null;
    deliveryReportedAt: string | null;
    receiptRecordedAt: string | null;
    followUpRecordedAt: string | null;
    withdrawnAt: string | null;
  };
  delivery: { quantity: number | null; unit: CustodyExecutionUnit | null } | null;
  receipt: {
    outcome: CustodyExecutionReceiptOutcome;
    quantity: number | null;
    unit: CustodyExecutionUnit | null;
  } | null;
  followUp: CustodyExecutionFollowUp | null;
  reconciliation: {
    receiptAvailableAt: string | null;
    receiptWindowOpen: boolean;
    withdrawnBy: CustodyExecutionActorRole | null;
  };
  createdAt: string;
  expiresAt: string;
  updatedAt: string;
}

export interface CustodyExecutionSnapshot {
  execution: CustodyExecutionView;
  observedAt: string;
}

export interface CustodyExecutionStatus {
  contract: typeof CUSTODY_EXECUTION_CONTRACT;
  scope: typeof CUSTODY_EXECUTION_STATUS_SCOPE;
  execution: CustodyExecutionView;
  refreshedAt: string;
}

export interface CustodyExecutionCoordinatorInbox {
  contract: typeof CUSTODY_EXECUTION_CONTRACT;
  scope: typeof CUSTODY_EXECUTION_INBOX_SCOPE;
  executions: CustodyExecutionView[];
  refreshedAt: string;
  /** null implica lectura completa; no-null después de 1.000 implica corte local explícito. */
  nextCursor: string | null;
}

export interface CustodyExecutionRecordedEvent {
  eventId: string;
  proposalId: string;
  type: CustodyExecutionEventType;
  actorRole: CustodyExecutionActorRole;
  expectedVersion: string;
  quantity: number | null;
  unit: CustodyExecutionUnit | null;
  receipt: CustodyExecutionReceiptOutcome | null;
  followUp: CustodyExecutionFollowUp | null;
  recordedAt: string;
  version: string;
}

export type CustodyExecutionMutationReceipt = {
  contract: typeof CUSTODY_EXECUTION_CONTRACT;
  status: 'accepted' | 'duplicate';
  recordedEvent: CustodyExecutionRecordedEvent;
  execution: CustodyExecutionView;
  refreshedAt: string;
} | {
  contract: typeof CUSTODY_EXECUTION_CONTRACT;
  status: 'rejected';
  reason: 'version_changed' | 'transition_not_allowed';
  eventId: string;
  recordedEvent: null;
  execution: CustodyExecutionView;
  refreshedAt: string;
};

type SimpleExecutionEventType = Exclude<
  CustodyExecutionEventType,
  'report_delivery' | 'confirm_receipt' | 'record_follow_up'
>;

export type CustodyExecutionEventCommand = ({
  proposalId: string;
  type: SimpleExecutionEventType;
  snapshot?: CustodyExecutionSnapshot;
} | {
  proposalId: string;
  type: 'report_delivery';
  quantity?: number;
  snapshot?: CustodyExecutionSnapshot;
} | {
  proposalId: string;
  type: 'confirm_receipt';
  receipt: CustodyExecutionReceiptOutcome;
  quantity?: number;
  snapshot?: CustodyExecutionSnapshot;
} | {
  proposalId: string;
  type: 'record_follow_up';
  followUp: CustodyExecutionFollowUp;
  snapshot?: CustodyExecutionSnapshot;
});

interface CustodyExecutionEventRequest {
  eventId: string;
  proposalId: string;
  expectedVersion: string;
  type: CustodyExecutionEventType;
  quantity?: number;
  receipt?: CustodyExecutionReceiptOutcome;
  followUp?: CustodyExecutionFollowUp;
}

export interface PendingCustodyExecutionIntent {
  eventId: string;
  userId: number;
  proposalId: string;
  type: CustodyExecutionEventType;
  expectedVersion: string;
  request: CustodyExecutionEventRequest;
  snapshot: CustodyExecutionSnapshot;
  createdAt: string;
  lastAttemptAt: string | null;
}

export interface CustodyExecutionIntentIncident {
  kind: 'corrupt_local_intent';
  code: 'CUSTODY_EXECUTION_INTENT_CORRUPT';
  userId: number;
  /** Sólo se expone si la clave local todavía es un UUID v4 controlado. */
  proposalId: string | null;
  eventId: string | null;
  type: CustodyExecutionEventType | null;
  createdAt: string | null;
}

export interface CustodyExecutionIntentInventory {
  intents: PendingCustodyExecutionIntent[];
  incidents: CustodyExecutionIntentIncident[];
  /** Incluye intents sanos e incidentes que aún pueden atarse con seguridad. */
  lockedProposalIds: string[];
}

export class CustodyExecutionError extends Error {
  constructor(public readonly code: string, message = code) {
    super(message);
    this.name = 'CustodyExecutionError';
  }
}

const fail = (code = 'INVALID_CUSTODY_EXECUTION_RESPONSE'): never => {
  throw new CustodyExecutionError(code);
};

export const custodyExecutionErrorMessage = (error: unknown): string => {
  const code = error instanceof CustodyExecutionError
    ? error.code
    : error && typeof error === 'object' && 'code' in error && typeof error.code === 'string'
      ? error.code
      : error instanceof Error && /^[A-Z0-9_]+$/.test(error.message)
        ? error.message
        : '';
  if (code === 'API_NOT_CONFIGURED') return 'Esta instalación todavía no tiene conectado el canal privado de ejecución.';
  if (code === 'AUTH_REQUIRED' || code === 'AUTH_SESSION_CHANGED' || code === 'ACCOUNT_NOT_ACTIVE') {
    return 'Vinculá la misma cuenta habilitada antes de continuar esta coordinación privada.';
  }
  if (code.includes('DEVICE') || code === 'MISSING_CIVIC_PROOF' || code === 'INVALID_CIVIC_PROOF') {
    return 'Este dispositivo no pudo demostrar autoridad sobre la coordinación. No registramos un cambio.';
  }
  if (code === 'CUSTODY_EXECUTION_INTENT_PENDING_CONFLICT') {
    return 'Hay otro evento pendiente para esta coordinación. Recuperá primero su constancia exacta.';
  }
  if (code === 'CUSTODY_EXECUTION_INTENT_NOT_FOUND') {
    return 'No hay un evento pendiente para recuperar en esta coordinación.';
  }
  if (code === 'CUSTODY_EXECUTION_INTENT_CORRUPT') {
    return 'Hay una constancia local dañada para esta coordinación. La conservamos aislada: no será borrada ni reenviada como si fuera otro evento.';
  }
  if (code === 'CUSTODY_EXECUTION_VERSION_CHANGED') {
    return 'La coordinación cambió desde que la viste. La red confirmó que el evento pendiente no fue aplicado; actualizá antes de decidir otro.';
  }
  if (code === 'CUSTODY_EXECUTION_TRANSITION_NOT_ALLOWED') {
    return 'La red confirmó que ese paso no fue aplicado en el estado actual. Actualizá la coordinación.';
  }
  if (code === 'CUSTODY_EXECUTION_LOCAL_GRANT_MISMATCH') {
    return 'La copia local no conserva la autoridad grantora necesaria para guardar este estado.';
  }
  if (code === 'CUSTODY_EXECUTION_QUANTITY_INVALID') {
    return 'La cantidad no coincide con la capacidad o la entrega declarada.';
  }
  if (code === 'CUSTODY_EXECUTION_NOT_FOUND') {
    return 'La ejecución privada no existe o ya no está disponible para esta cuenta.';
  }
  if (code === 'CUSTODY_EXECUTION_IDEMPOTENCY_CONFLICT') {
    return 'El reintento no coincide con el evento original. Conservamos el comando pendiente sin enviarlo de nuevo.';
  }
  if (code === 'CUSTODY_EXECUTION_RATE_LIMITED') {
    return 'El canal privado recibió demasiadas consultas. Esperá un momento y reintentá.';
  }
  return 'La constancia de ejecución no pasó la verificación segura. El estado visible no cambió.';
};

const record = (value: unknown): Record<string, unknown> | null =>
  value != null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;

const exactKeys = (value: Record<string, unknown>, keys: readonly string[]): boolean => {
  const actual = Object.keys(value);
  return actual.length === keys.length && actual.every((key) => keys.includes(key));
};

const uuidV4 = (value: unknown): value is string => typeof value === 'string' && UUID_V4.test(value);
const sha256 = (value: unknown): value is string => typeof value === 'string' && SHA256_HEX.test(value);
const finiteNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);

const utcDate = (value: unknown): value is string => {
  if (typeof value !== 'string') return false;
  const matched = UTC_DATETIME.exec(value);
  if (!matched) return false;
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) return false;
  const date = new Date(parsed);
  return date.getUTCFullYear() === Number(matched[1])
    && date.getUTCMonth() + 1 === Number(matched[2])
    && date.getUTCDate() === Number(matched[3])
    && date.getUTCHours() === Number(matched[4])
    && date.getUTCMinutes() === Number(matched[5])
    && date.getUTCSeconds() === Number(matched[6]);
};

const controlledPair = (
  quantity: unknown,
  unit: unknown,
): quantity is number => finiteNumber(quantity)
  && quantity > 0
  && quantity <= MAX_QUANTITY
  && typeof unit === 'string'
  && UNITS.has(unit as CustodyExecutionUnit);

const nullableUtc = (value: unknown): value is string | null => value === null || utcDate(value);

const milestoneTimes = (execution: CustodyExecutionView): (string | null)[] => [
  execution.milestones.reservedAt,
  execution.milestones.grantorReadyAt,
  execution.milestones.coordinatorReadyAt,
  execution.milestones.deliveryStartedAt,
  execution.milestones.deliveryReportedAt,
  execution.milestones.receiptRecordedAt,
  execution.milestones.followUpRecordedAt,
  execution.milestones.withdrawnAt,
];

const samePair = (
  left: { quantity: number | null; unit: CustodyExecutionUnit | null },
  right: { quantity: number | null; unit: CustodyExecutionUnit | null },
): boolean => left.quantity === right.quantity && left.unit === right.unit;

export const parseCustodyExecutionView = (
  value: unknown,
  observedAt?: string,
): CustodyExecutionView => {
  const execution = record(value);
  const capacity = execution ? record(execution.capacity) : null;
  const readiness = execution ? record(execution.readiness) : null;
  const milestones = execution ? record(execution.milestones) : null;
  const delivery = execution?.delivery === null ? null : record(execution?.delivery);
  const receipt = execution?.receipt === null ? null : record(execution?.receipt);
  const reconciliation = execution ? record(execution.reconciliation) : null;
  if (
    !execution
    || !exactKeys(execution, [
      'proposalId',
      'state',
      'version',
      'capacity',
      'readiness',
      'milestones',
      'delivery',
      'receipt',
      'followUp',
      'reconciliation',
      'createdAt',
      'expiresAt',
      'updatedAt',
    ])
    || !uuidV4(execution.proposalId)
    || typeof execution.state !== 'string'
    || !STATES.has(execution.state as CustodyExecutionState)
    || !sha256(execution.version)
    || !capacity
    || !exactKeys(capacity, ['quantity', 'unit'])
    || !readiness
    || !exactKeys(readiness, ['grantor', 'coordinator'])
    || typeof readiness.grantor !== 'boolean'
    || typeof readiness.coordinator !== 'boolean'
    || !milestones
    || !exactKeys(milestones, [
      'reservedAt',
      'grantorReadyAt',
      'coordinatorReadyAt',
      'deliveryStartedAt',
      'deliveryReportedAt',
      'receiptRecordedAt',
      'followUpRecordedAt',
      'withdrawnAt',
    ])
    || !Object.values(milestones).every(nullableUtc)
    || !(execution.followUp === null || execution.followUp === 'need_met' || execution.followUp === 'still_open')
    || !reconciliation
    || !exactKeys(reconciliation, ['receiptAvailableAt', 'receiptWindowOpen', 'withdrawnBy'])
    || !nullableUtc(reconciliation.receiptAvailableAt)
    || typeof reconciliation.receiptWindowOpen !== 'boolean'
    || !(
      reconciliation.withdrawnBy === null
      || reconciliation.withdrawnBy === 'coordinator'
      || reconciliation.withdrawnBy === 'grantor'
    )
    || !utcDate(execution.createdAt)
    || !utcDate(execution.expiresAt)
    || !utcDate(execution.updatedAt)
    || !(observedAt == null || utcDate(observedAt))
  ) return fail();

  const emptyCapacity = capacity.quantity === null && capacity.unit === null;
  if (!emptyCapacity && !controlledPair(capacity.quantity, capacity.unit)) return fail();

  if (delivery) {
    if (!exactKeys(delivery, ['quantity', 'unit'])) return fail();
    const emptyDelivery = delivery.quantity === null && delivery.unit === null;
    if (!emptyDelivery && !controlledPair(delivery.quantity, delivery.unit)) return fail();
    if (emptyCapacity !== emptyDelivery) return fail();
    if (!emptyCapacity && (
      delivery.unit !== capacity.unit
      || (delivery.quantity as number) > (capacity.quantity as number)
    )) return fail();
  } else if (execution.milestones && milestones.deliveryReportedAt !== null) return fail();

  if (receipt) {
    if (
      !exactKeys(receipt, ['outcome', 'quantity', 'unit'])
      || !(receipt.outcome === 'full' || receipt.outcome === 'partial' || receipt.outcome === 'not_received')
    ) return fail();
    if (receipt.outcome === 'not_received') {
      if (receipt.quantity !== null || receipt.unit !== null) return fail();
    } else {
      const reference = delivery ?? capacity;
      const emptyReceipt = receipt.quantity === null && receipt.unit === null;
      const emptyReference = reference.quantity === null && reference.unit === null;
      if (emptyReceipt !== emptyReference) return fail();
      if (!emptyReceipt && !controlledPair(receipt.quantity, receipt.unit)) return fail();
      if (receipt.unit !== reference.unit) return fail();
      if (receipt.outcome === 'full' && receipt.quantity !== reference.quantity) return fail();
      if (receipt.outcome === 'partial' && !emptyReceipt && (
        (receipt.quantity as number) >= (reference.quantity as number)
      )) return fail();
    }
  } else if (milestones.receiptRecordedAt !== null) return fail();

  const parsed: CustodyExecutionView = {
    proposalId: execution.proposalId,
    state: execution.state as CustodyExecutionState,
    version: execution.version,
    capacity: {
      quantity: capacity.quantity as number | null,
      unit: capacity.unit as CustodyExecutionUnit | null,
    },
    readiness: {
      grantor: readiness.grantor,
      coordinator: readiness.coordinator,
    },
    milestones: {
      reservedAt: milestones.reservedAt as string | null,
      grantorReadyAt: milestones.grantorReadyAt as string | null,
      coordinatorReadyAt: milestones.coordinatorReadyAt as string | null,
      deliveryStartedAt: milestones.deliveryStartedAt as string | null,
      deliveryReportedAt: milestones.deliveryReportedAt as string | null,
      receiptRecordedAt: milestones.receiptRecordedAt as string | null,
      followUpRecordedAt: milestones.followUpRecordedAt as string | null,
      withdrawnAt: milestones.withdrawnAt as string | null,
    },
    delivery: delivery ? {
      quantity: delivery.quantity as number | null,
      unit: delivery.unit as CustodyExecutionUnit | null,
    } : null,
    receipt: receipt ? {
      outcome: receipt.outcome as CustodyExecutionReceiptOutcome,
      quantity: receipt.quantity as number | null,
      unit: receipt.unit as CustodyExecutionUnit | null,
    } : null,
    followUp: execution.followUp as CustodyExecutionFollowUp | null,
    reconciliation: {
      receiptAvailableAt: reconciliation.receiptAvailableAt as string | null,
      receiptWindowOpen: reconciliation.receiptWindowOpen,
      withdrawnBy: reconciliation.withdrawnBy as CustodyExecutionActorRole | null,
    },
    createdAt: execution.createdAt,
    expiresAt: execution.expiresAt,
    updatedAt: execution.updatedAt,
  };

  const createdAtMs = Date.parse(parsed.createdAt);
  const expiresAtMs = Date.parse(parsed.expiresAt);
  const updatedAtMs = Date.parse(parsed.updatedAt);
  if (createdAtMs >= expiresAtMs || updatedAtMs < createdAtMs) return fail();
  if (observedAt && updatedAtMs > Date.parse(observedAt)) return fail();
  if (milestoneTimes(parsed).some((timestamp) => timestamp != null && (
    Date.parse(timestamp) < createdAtMs || Date.parse(timestamp) > updatedAtMs
  ))) return fail();
  const recordedMilestones = milestoneTimes(parsed).filter((timestamp): timestamp is string => timestamp !== null);
  if (
    (recordedMilestones.length === 0 && parsed.updatedAt !== parsed.createdAt)
    || (recordedMilestones.length > 0 && Math.max(...recordedMilestones.map(Date.parse)) !== updatedAtMs)
    || (recordedMilestones.length === 0 && parsed.version !== CUSTODY_EXECUTION_EMPTY_VERSION)
    || (recordedMilestones.length > 0 && parsed.version === CUSTODY_EXECUTION_EMPTY_VERSION)
  ) return fail();

  const m = parsed.milestones;
  const expectedReceiptAvailableAt = m.deliveryStartedAt === null
    ? null
    : new Date(Date.parse(m.deliveryStartedAt) + RECEIPT_DEADLINE_MS).toISOString();
  const deadlineObserved = expectedReceiptAvailableAt !== null
    && observedAt !== undefined
    && Date.parse(observedAt) >= Date.parse(expectedReceiptAvailableAt);
  const expectedReceiptWindowOpen = m.deliveryStartedAt !== null && (
    m.deliveryReportedAt !== null
    || parsed.reconciliation.withdrawnBy === 'coordinator'
    || deadlineObserved
  );
  if (
    parsed.readiness.grantor !== (m.grantorReadyAt !== null)
    || parsed.readiness.coordinator !== (m.coordinatorReadyAt !== null)
    || (m.deliveryStartedAt !== null && (
      m.reservedAt === null || !parsed.readiness.grantor || !parsed.readiness.coordinator
    ))
    || (m.deliveryReportedAt !== null && (m.deliveryStartedAt === null || parsed.delivery === null))
    || (m.receiptRecordedAt !== null && parsed.receipt === null)
    || (m.receiptRecordedAt !== null && m.deliveryReportedAt === null && (
      m.deliveryStartedAt === null
    ))
    || (m.followUpRecordedAt !== null && (
      m.receiptRecordedAt === null
      || parsed.followUp === null
      || parsed.receipt?.outcome === 'not_received'
    ))
    || ((m.followUpRecordedAt === null) !== (parsed.followUp === null))
    || parsed.reconciliation.receiptAvailableAt !== expectedReceiptAvailableAt
    || ((parsed.reconciliation.withdrawnBy === null) !== (m.withdrawnAt === null))
    || parsed.reconciliation.receiptWindowOpen !== expectedReceiptWindowOpen
  ) return fail();

  const atOrAfter = (later: string | null, earlier: string | null): boolean => (
    later === null || earlier === null || Date.parse(later) >= Date.parse(earlier)
  );
  if (
    !atOrAfter(m.deliveryStartedAt, m.reservedAt)
    || !atOrAfter(m.deliveryStartedAt, m.grantorReadyAt)
    || !atOrAfter(m.deliveryStartedAt, m.coordinatorReadyAt)
    || !atOrAfter(m.deliveryReportedAt, m.deliveryStartedAt)
    || !atOrAfter(m.receiptRecordedAt, m.deliveryStartedAt)
    || !atOrAfter(m.receiptRecordedAt, m.deliveryReportedAt)
    || !atOrAfter(m.receiptRecordedAt, m.withdrawnAt)
    || !atOrAfter(m.followUpRecordedAt, m.receiptRecordedAt)
  ) return fail();

  let eventDerivedState: CustodyExecutionState;
  if (parsed.followUp === 'need_met') eventDerivedState = 'completed';
  else if (parsed.followUp === 'still_open') eventDerivedState = 'needs_follow_up';
  else if (parsed.receipt?.outcome === 'not_received') eventDerivedState = 'disputed';
  else if (parsed.receipt !== null) eventDerivedState = 'received';
  else if (m.withdrawnAt !== null) eventDerivedState = 'cancelled';
  else if (parsed.state === 'closed' || parsed.state === 'expired') eventDerivedState = parsed.state;
  else if (m.deliveryReportedAt !== null) eventDerivedState = 'delivery_reported';
  else if (m.deliveryStartedAt !== null) eventDerivedState = 'in_transit';
  else if (m.reservedAt !== null && parsed.readiness.grantor && parsed.readiness.coordinator) {
    eventDerivedState = 'ready';
  } else if (m.reservedAt !== null) eventDerivedState = 'reserved';
  else eventDerivedState = 'awaiting_reservation';
  if (parsed.state !== eventDerivedState) return fail();

  return parsed;
};

export const parseCustodyExecutionStatus = (
  value: unknown,
  expectedProposalId: string,
  nowMs = Date.now(),
): CustodyExecutionStatus => {
  if (!uuidV4(expectedProposalId)) return fail('INVALID_CUSTODY_EXECUTION_PROPOSAL_ID');
  const status = record(value);
  if (
    !status
    || !exactKeys(status, ['contract', 'scope', 'execution', 'refreshedAt'])
    || status.contract !== CUSTODY_EXECUTION_CONTRACT
    || status.scope !== CUSTODY_EXECUTION_STATUS_SCOPE
    || !utcDate(status.refreshedAt)
    || Date.parse(status.refreshedAt) > nowMs + CLOCK_TOLERANCE_MS
  ) return fail();
  const execution = parseCustodyExecutionView(status.execution, status.refreshedAt);
  if (execution.proposalId !== expectedProposalId) return fail();
  return {
    contract: CUSTODY_EXECUTION_CONTRACT,
    scope: CUSTODY_EXECUTION_STATUS_SCOPE,
    execution,
    refreshedAt: status.refreshedAt,
  };
};

export const parseCustodyExecutionCoordinatorInboxPage = (
  value: unknown,
  limit = PAGE_LIMIT,
  nowMs = Date.now(),
): CustodyExecutionCoordinatorInbox => {
  const inbox = record(value);
  if (
    !Number.isSafeInteger(limit)
    || limit < 1
    || limit > 100
    || !inbox
    || !exactKeys(inbox, ['contract', 'scope', 'executions', 'refreshedAt', 'nextCursor'])
    || inbox.contract !== CUSTODY_EXECUTION_CONTRACT
    || inbox.scope !== CUSTODY_EXECUTION_INBOX_SCOPE
    || !Array.isArray(inbox.executions)
    || inbox.executions.length > limit
    || !utcDate(inbox.refreshedAt)
    || Date.parse(inbox.refreshedAt) > nowMs + CLOCK_TOLERANCE_MS
    || !(inbox.nextCursor === null || (
      typeof inbox.nextCursor === 'string' && PRIVATE_PAGE_CURSOR.test(inbox.nextCursor)
    ))
  ) return fail();
  const executions = inbox.executions.map((execution) => (
    parseCustodyExecutionView(execution, inbox.refreshedAt as string)
  ));
  if (
    new Set(executions.map((execution) => execution.proposalId)).size !== executions.length
    || (inbox.nextCursor !== null && executions.length !== limit)
  ) return fail();
  return {
    contract: CUSTODY_EXECUTION_CONTRACT,
    scope: CUSTODY_EXECUTION_INBOX_SCOPE,
    executions,
    refreshedAt: inbox.refreshedAt,
    nextCursor: inbox.nextCursor as string | null,
  };
};

const requestKeys = (type: CustodyExecutionEventType, value: Record<string, unknown>): string[] => {
  if (type === 'report_delivery') {
    return 'quantity' in value
      ? ['eventId', 'proposalId', 'expectedVersion', 'type', 'quantity']
      : ['eventId', 'proposalId', 'expectedVersion', 'type'];
  }
  if (type === 'confirm_receipt') {
    return 'quantity' in value
      ? ['eventId', 'proposalId', 'expectedVersion', 'type', 'receipt', 'quantity']
      : ['eventId', 'proposalId', 'expectedVersion', 'type', 'receipt'];
  }
  if (type === 'record_follow_up') {
    return ['eventId', 'proposalId', 'expectedVersion', 'type', 'followUp'];
  }
  return ['eventId', 'proposalId', 'expectedVersion', 'type'];
};

const parseEventRequest = (value: unknown): CustodyExecutionEventRequest => {
  const request = record(value);
  if (
    !request
    || typeof request.type !== 'string'
    || !EVENT_TYPES.has(request.type as CustodyExecutionEventType)
    || !exactKeys(request, requestKeys(request.type as CustodyExecutionEventType, request))
    || !uuidV4(request.eventId)
    || !uuidV4(request.proposalId)
    || !sha256(request.expectedVersion)
  ) return fail();
  if (request.type === 'report_delivery' && !(
    !('quantity' in request)
    || (finiteNumber(request.quantity) && request.quantity > 0 && request.quantity <= MAX_QUANTITY)
  )) return fail();
  if (request.type === 'confirm_receipt') {
    if (!(request.receipt === 'full' || request.receipt === 'partial' || request.receipt === 'not_received')) return fail();
    if ('quantity' in request && !(
      finiteNumber(request.quantity) && request.quantity > 0 && request.quantity <= MAX_QUANTITY
    )) return fail();
  }
  if (request.type === 'record_follow_up' && !(
    request.followUp === 'need_met' || request.followUp === 'still_open'
  )) return fail();
  return request as unknown as CustodyExecutionEventRequest;
};

const assertRequestMatchesSnapshot = (
  request: CustodyExecutionEventRequest,
  execution: CustodyExecutionView,
): void => {
  if (
    request.proposalId !== execution.proposalId
    || request.expectedVersion !== execution.version
  ) return fail('CUSTODY_EXECUTION_SNAPSHOT_MISMATCH');

  if (request.type === 'report_delivery') {
    if (execution.capacity.quantity === null) {
      if (request.quantity !== undefined) return fail('CUSTODY_EXECUTION_QUANTITY_INVALID');
    } else if (
      !finiteNumber(request.quantity)
      || request.quantity <= 0
      || request.quantity > execution.capacity.quantity
    ) return fail('CUSTODY_EXECUTION_QUANTITY_INVALID');
  }

  if (request.type === 'confirm_receipt') {
    if (request.receipt === 'not_received') {
      if (request.quantity !== undefined) return fail('CUSTODY_EXECUTION_QUANTITY_INVALID');
      return;
    }
    const reference = execution.delivery ?? execution.capacity;
    if (reference.quantity === null) {
      if (request.quantity !== undefined) return fail('CUSTODY_EXECUTION_QUANTITY_INVALID');
      return;
    }
    if (request.receipt === 'full') {
      if (request.quantity !== undefined && request.quantity !== reference.quantity) {
        return fail('CUSTODY_EXECUTION_QUANTITY_INVALID');
      }
      return;
    }
    if (
      !finiteNumber(request.quantity)
      || request.quantity <= 0
      || request.quantity >= reference.quantity
    ) return fail('CUSTODY_EXECUTION_QUANTITY_INVALID');
  }
};

const milestoneForEvent = (
  type: CustodyExecutionEventType,
): keyof CustodyExecutionView['milestones'] => {
  if (type === 'reserve') return 'reservedAt';
  if (type === 'grantor_ready') return 'grantorReadyAt';
  if (type === 'coordinator_ready') return 'coordinatorReadyAt';
  if (type === 'start_delivery') return 'deliveryStartedAt';
  if (type === 'report_delivery') return 'deliveryReportedAt';
  if (type === 'confirm_receipt') return 'receiptRecordedAt';
  if (type === 'record_follow_up') return 'followUpRecordedAt';
  return 'withdrawnAt';
};

const allowedActor = (type: CustodyExecutionEventType, actorRole: unknown): actorRole is CustodyExecutionActorRole => {
  if (type === 'withdraw') return actorRole === 'coordinator' || actorRole === 'grantor';
  if (['reserve', 'coordinator_ready', 'start_delivery', 'report_delivery'].includes(type)) {
    return actorRole === 'coordinator';
  }
  return actorRole === 'grantor';
};

const expectedRecordedPayload = (
  request: CustodyExecutionEventRequest,
  snapshot: CustodyExecutionView,
): Pick<CustodyExecutionRecordedEvent, 'quantity' | 'unit' | 'receipt' | 'followUp'> => {
  if (request.type === 'report_delivery') return {
    quantity: request.quantity ?? null,
    unit: request.quantity == null ? null : snapshot.capacity.unit,
    receipt: null,
    followUp: null,
  };
  if (request.type === 'confirm_receipt') {
    const reference = snapshot.delivery ?? snapshot.capacity;
    const quantity = request.receipt === 'not_received'
      ? null
      : request.receipt === 'full'
        ? request.quantity ?? reference.quantity
        : request.quantity ?? null;
    return {
      quantity,
      unit: quantity === null ? null : reference.unit,
      receipt: request.receipt ?? null,
      followUp: null,
    };
  }
  if (request.type === 'record_follow_up') return {
    quantity: null,
    unit: null,
    receipt: null,
    followUp: request.followUp ?? null,
  };
  return { quantity: null, unit: null, receipt: null, followUp: null };
};

const parseRecordedEvent = (
  value: unknown,
  request: CustodyExecutionEventRequest,
  snapshot: CustodyExecutionView,
  current: CustodyExecutionView,
  nowMs: number,
): CustodyExecutionRecordedEvent => {
  const event = record(value);
  if (
    !event
    || !exactKeys(event, [
      'eventId',
      'proposalId',
      'type',
      'actorRole',
      'expectedVersion',
      'quantity',
      'unit',
      'receipt',
      'followUp',
      'recordedAt',
      'version',
    ])
    || event.eventId !== request.eventId
    || event.proposalId !== request.proposalId
    || event.type !== request.type
    || event.expectedVersion !== request.expectedVersion
    || !allowedActor(request.type, event.actorRole)
    || !utcDate(event.recordedAt)
    || Date.parse(event.recordedAt) < Date.parse(snapshot.createdAt)
    || Date.parse(event.recordedAt) > nowMs
    || !sha256(event.version)
    || event.version === request.expectedVersion
  ) return fail();
  const expected = expectedRecordedPayload(request, snapshot);
  if (
    event.quantity !== expected.quantity
    || event.unit !== expected.unit
    || event.receipt !== expected.receipt
    || event.followUp !== expected.followUp
    || current.milestones[milestoneForEvent(request.type)] !== event.recordedAt
  ) return fail();
  return {
    eventId: event.eventId,
    proposalId: event.proposalId,
    type: event.type as CustodyExecutionEventType,
    actorRole: event.actorRole,
    expectedVersion: event.expectedVersion,
    quantity: event.quantity as number | null,
    unit: event.unit as CustodyExecutionUnit | null,
    receipt: event.receipt as CustodyExecutionReceiptOutcome | null,
    followUp: event.followUp as CustodyExecutionFollowUp | null,
    recordedAt: event.recordedAt,
    version: event.version,
  };
};

const assertImmutableExecution = (
  current: CustodyExecutionView,
  snapshot: CustodyExecutionView,
): void => {
  if (
    current.proposalId !== snapshot.proposalId
    || !samePair(current.capacity, snapshot.capacity)
    || current.createdAt !== snapshot.createdAt
    || current.expiresAt !== snapshot.expiresAt
    || Date.parse(current.updatedAt) < Date.parse(snapshot.updatedAt)
  ) return fail('CUSTODY_EXECUTION_SNAPSHOT_MISMATCH');
};

export const parseCustodyExecutionMutationReceipt = (
  value: unknown,
  request: CustodyExecutionEventRequest,
  snapshot: CustodyExecutionView,
  nowMs = Date.now(),
): CustodyExecutionMutationReceipt => {
  const receipt = record(value);
  if (
    !receipt
    || receipt.contract !== CUSTODY_EXECUTION_CONTRACT
    || typeof receipt.status !== 'string'
    || !utcDate(receipt.refreshedAt)
    || Date.parse(receipt.refreshedAt) > nowMs + CLOCK_TOLERANCE_MS
  ) return fail();
  if (receipt.status === 'accepted' || receipt.status === 'duplicate') {
    if (!exactKeys(receipt, ['contract', 'status', 'recordedEvent', 'execution', 'refreshedAt'])) return fail();
    const execution = parseCustodyExecutionView(receipt.execution, receipt.refreshedAt);
    assertImmutableExecution(execution, snapshot);
    const recordedEvent = parseRecordedEvent(
      receipt.recordedEvent,
      request,
      snapshot,
      execution,
      Date.parse(receipt.refreshedAt),
    );
    if (receipt.status === 'accepted' && execution.version !== recordedEvent.version) return fail();
    return {
      contract: CUSTODY_EXECUTION_CONTRACT,
      status: receipt.status,
      recordedEvent,
      execution,
      refreshedAt: receipt.refreshedAt,
    };
  }
  if (receipt.status === 'rejected') {
    if (
      !exactKeys(receipt, [
        'contract',
        'status',
        'reason',
        'eventId',
        'recordedEvent',
        'execution',
        'refreshedAt',
      ])
      || !(receipt.reason === 'version_changed' || receipt.reason === 'transition_not_allowed')
      || receipt.eventId !== request.eventId
      || receipt.recordedEvent !== null
    ) return fail();
    const execution = parseCustodyExecutionView(receipt.execution, receipt.refreshedAt);
    assertImmutableExecution(execution, snapshot);
    if (receipt.reason === 'version_changed' && execution.version === request.expectedVersion) return fail();
    return {
      contract: CUSTODY_EXECUTION_CONTRACT,
      status: 'rejected',
      reason: receipt.reason,
      eventId: receipt.eventId,
      recordedEvent: null,
      execution,
      refreshedAt: receipt.refreshedAt,
    };
  }
  return fail();
};

const parsePendingIntent = (
  row: CivicCustodyExecutionIntentRow,
): PendingCustodyExecutionIntent => {
  let requestValue: unknown;
  let executionValue: unknown;
  try {
    requestValue = JSON.parse(row.requestJson) as unknown;
    executionValue = JSON.parse(row.executionJson) as unknown;
  } catch {
    return fail();
  }
  if (
    !uuidV4(row.eventId)
    || !uuidV4(row.proposalId)
    || !Number.isSafeInteger(row.userId)
    || row.userId <= 0
    || !EVENT_TYPES.has(row.eventType)
    || !sha256(row.expectedVersion)
    || !utcDate(row.snapshotObservedAt)
    || !utcDate(row.createdAt)
    || !(row.lastAttemptAt === null || utcDate(row.lastAttemptAt))
  ) return fail();
  const request = parseEventRequest(requestValue);
  const execution = parseCustodyExecutionView(executionValue, row.snapshotObservedAt);
  if (
    request.eventId !== row.eventId
    || request.proposalId !== row.proposalId
    || request.type !== row.eventType
    || request.expectedVersion !== row.expectedVersion
  ) return fail();
  assertRequestMatchesSnapshot(request, execution);
  return {
    eventId: row.eventId,
    userId: row.userId,
    proposalId: row.proposalId,
    type: row.eventType,
    expectedVersion: row.expectedVersion,
    request,
    snapshot: { execution, observedAt: row.snapshotObservedAt },
    createdAt: row.createdAt,
    lastAttemptAt: row.lastAttemptAt,
  };
};

const parseStoredPendingIntent = (
  row: CivicCustodyExecutionIntentRow,
): PendingCustodyExecutionIntent => {
  try {
    return parsePendingIntent(row);
  } catch {
    return fail('CUSTODY_EXECUTION_INTENT_CORRUPT');
  }
};

const incidentFromRow = (
  row: CivicCustodyExecutionIntentRow,
  expectedUserId: number,
): CustodyExecutionIntentIncident => ({
  kind: 'corrupt_local_intent',
  code: 'CUSTODY_EXECUTION_INTENT_CORRUPT',
  userId: expectedUserId,
  proposalId: uuidV4(row.proposalId) ? row.proposalId : null,
  eventId: uuidV4(row.eventId) ? row.eventId : null,
  type: EVENT_TYPES.has(row.eventType) ? row.eventType : null,
  createdAt: utcDate(row.createdAt) ? row.createdAt : null,
});

export const loadCustodyExecutionIntentInventory = (
  userId: number,
  database?: CustodyExecutionIntentDatabase,
): CustodyExecutionIntentInventory => {
  const intents: PendingCustodyExecutionIntent[] = [];
  const incidents: CustodyExecutionIntentIncident[] = [];
  const lockedProposalIds = new Set<string>();
  for (const row of listCustodyExecutionIntents(userId, database)) {
    try {
      const intent = parsePendingIntent(row);
      intents.push(intent);
      lockedProposalIds.add(intent.proposalId);
    } catch {
      const incident = incidentFromRow(row, userId);
      incidents.push(incident);
      if (incident.proposalId) lockedProposalIds.add(incident.proposalId);
    }
  }
  return { intents, incidents, lockedProposalIds: [...lockedProposalIds] };
};

export const loadPendingCustodyExecutionIntents = (
  userId: number,
  database?: CustodyExecutionIntentDatabase,
): PendingCustodyExecutionIntent[] => loadCustodyExecutionIntentInventory(userId, database).intents;

const sameOptionalPair = (
  left: { quantity: number | null; unit: CustodyExecutionUnit | null } | null,
  right: { quantity: number | null; unit: CustodyExecutionUnit | null } | null,
): boolean => left === null
  ? right === null
  : right !== null && samePair(left, right);

const assertMonotonicExecution = (
  previous: CustodyExecutionView,
  next: CustodyExecutionView,
): void => {
  assertImmutableExecution(next, previous);
  const oldMilestones = previous.milestones;
  const newMilestones = next.milestones;
  for (const key of Object.keys(oldMilestones) as (keyof typeof oldMilestones)[]) {
    if (oldMilestones[key] !== null && oldMilestones[key] !== newMilestones[key]) {
      return fail('CUSTODY_EXECUTION_CACHE_REGRESSION');
    }
  }
  if (
    (previous.readiness.grantor && !next.readiness.grantor)
    || (previous.readiness.coordinator && !next.readiness.coordinator)
    || (previous.delivery !== null && !sameOptionalPair(previous.delivery, next.delivery))
    || (previous.receipt !== null && JSON.stringify(previous.receipt) !== JSON.stringify(next.receipt))
    || (previous.followUp !== null && previous.followUp !== next.followUp)
    || (previous.reconciliation.receiptAvailableAt !== null
      && previous.reconciliation.receiptAvailableAt !== next.reconciliation.receiptAvailableAt)
    || (previous.reconciliation.withdrawnBy !== null
      && previous.reconciliation.withdrawnBy !== next.reconciliation.withdrawnBy)
    || (previous.reconciliation.receiptWindowOpen && !next.reconciliation.receiptWindowOpen)
  ) return fail('CUSTODY_EXECUTION_CACHE_REGRESSION');
};

export const cachedCustodyExecutionForGrant = (
  grant: Pick<CivicNeedAccessGrantRow, 'remoteExecutionJson' | 'remoteExecutionObservedAt'>,
): CustodyExecutionSnapshot | null => {
  if (grant.remoteExecutionJson === null && grant.remoteExecutionObservedAt === null) return null;
  if (grant.remoteExecutionJson === null || !utcDate(grant.remoteExecutionObservedAt)) {
    return fail('CUSTODY_EXECUTION_CACHE_INVALID');
  }
  let value: unknown;
  try {
    value = JSON.parse(grant.remoteExecutionJson) as unknown;
  } catch {
    return fail('CUSTODY_EXECUTION_CACHE_INVALID');
  }
  return {
    execution: parseCustodyExecutionView(value, grant.remoteExecutionObservedAt),
    observedAt: grant.remoteExecutionObservedAt,
  };
};

const localGrantForProposal = (proposalId: string): CivicNeedAccessGrantRow | null =>
  db.select().from(civicNeedAccessGrants)
    .where(eq(civicNeedAccessGrants.remoteCoordinationProposalId, proposalId)).get() ?? null;

const GRANTOR_ONLY_EVENTS = new Set<CustodyExecutionEventType>([
  'grantor_ready',
  'confirm_receipt',
  'record_follow_up',
]);

const assertLocalGrantorAuthority = (
  proposalId: string,
  expectedUserId: number,
): CivicNeedAccessGrantRow => {
  const grant = localGrantForProposal(proposalId);
  if (
    !grant
    || grant.remoteGrantorUserId !== expectedUserId
    || grant.remoteCoordinationProposalId !== proposalId
    || grant.remoteCoordinationTerminalDecision !== 'accept'
  ) return fail('CUSTODY_EXECUTION_LOCAL_GRANT_MISMATCH');
  return grant;
};

const cacheGrantorExecution = (
  snapshot: CustodyExecutionSnapshot,
  expectedUserId: number,
  required: boolean,
): void => {
  const availableAt = snapshot.execution.reconciliation.receiptAvailableAt;
  const dynamicWindowIsProvableAtObservation = !snapshot.execution.reconciliation.receiptWindowOpen
    || snapshot.execution.milestones.deliveryReportedAt !== null
    || snapshot.execution.reconciliation.withdrawnBy === 'coordinator'
    || (availableAt !== null && Date.parse(snapshot.observedAt) >= Date.parse(availableAt));
  if (!dynamicWindowIsProvableAtObservation) {
    if (required) return fail('CUSTODY_EXECUTION_CACHE_INVALID');
    return;
  }
  const grant = localGrantForProposal(snapshot.execution.proposalId);
  if (!grant) {
    if (required) return fail('CUSTODY_EXECUTION_LOCAL_GRANT_MISMATCH');
    return;
  }
  if (!required && grant.remoteGrantorUserId !== expectedUserId) return;
  if (
    grant.remoteGrantorUserId !== expectedUserId
    || grant.remoteCoordinationProposalId !== snapshot.execution.proposalId
    || grant.remoteCoordinationTerminalDecision !== 'accept'
  ) return fail('CUSTODY_EXECUTION_LOCAL_GRANT_MISMATCH');
  const previous = cachedCustodyExecutionForGrant(grant);
  if (previous) {
    if (Date.parse(snapshot.observedAt) < Date.parse(previous.observedAt)) return;
    assertMonotonicExecution(previous.execution, snapshot.execution);
  }
  db.update(civicNeedAccessGrants).set({
    remoteExecutionJson: JSON.stringify(snapshot.execution),
    remoteExecutionObservedAt: snapshot.observedAt,
    updatedAt: new Date().toISOString(),
  }).where(and(
    eq(civicNeedAccessGrants.id, grant.id),
    eq(civicNeedAccessGrants.remoteGrantorUserId, expectedUserId),
    eq(civicNeedAccessGrants.remoteCoordinationProposalId, snapshot.execution.proposalId),
  )).run();
};

const assertExpectedSession = async (expectedUserId: number): Promise<void> => {
  if (!Number.isSafeInteger(expectedUserId) || expectedUserId <= 0) return fail('AUTH_SESSION_CHANGED');
  const session = await getCommunitySession();
  if (!session || session.user.id !== expectedUserId) return fail('AUTH_SESSION_CHANGED');
};

const civicProof = async (): Promise<string> => {
  if (!CIVIC_API_URL) return fail('API_NOT_CONFIGURED');
  return ensureCivicDeviceToken(CIVIC_API_URL);
};

const readJson = async (response: Response): Promise<unknown> => {
  if (!response.ok) throw await communityErrorFromResponse(response);
  return response.json() as Promise<unknown>;
};

export const loadCustodyExecutionStatus = async (
  proposalId: string,
  expectedUserId: number,
): Promise<CustodyExecutionStatus> => {
  if (!uuidV4(proposalId)) return fail('INVALID_CUSTODY_EXECUTION_PROPOSAL_ID');
  await assertExpectedSession(expectedUserId);
  assertLocalGrantorAuthority(proposalId, expectedUserId);
  const proof = await civicProof();
  const response = await communityFetchForUser(
    expectedUserId,
    `/api/v1/civic/custody/execution/status?proposalId=${encodeURIComponent(proposalId)}`,
    { headers: { 'x-civic-device-token': proof } },
  );
  const status = parseCustodyExecutionStatus(await readJson(response), proposalId);
  await assertExpectedSession(expectedUserId);
  cacheGrantorExecution({ execution: status.execution, observedAt: status.refreshedAt }, expectedUserId, true);
  return status;
};

export const loadCustodyExecutionCoordinatorInbox = async (
  expectedUserId: number,
): Promise<CustodyExecutionCoordinatorInbox> => {
  await assertExpectedSession(expectedUserId);
  const proof = await civicProof();
  const executions: CustodyExecutionView[] = [];
  const proposalIds = new Set<string>();
  const cursors = new Set<string>();
  let cursor: string | null = null;
  let refreshedAt: string | null = null;

  for (let pageNumber = 0; pageNumber < MAX_PAGES; pageNumber += 1) {
    const path = cursor
      ? `/api/v1/civic/custody/execution/inbox?limit=${PAGE_LIMIT}&cursor=${encodeURIComponent(cursor)}`
      : `/api/v1/civic/custody/execution/inbox?limit=${PAGE_LIMIT}`;
    const response = await communityFetchForUser(expectedUserId, path, {
      headers: { 'x-civic-device-token': proof },
    });
    const page = parseCustodyExecutionCoordinatorInboxPage(await readJson(response));
    if (refreshedAt !== null && page.refreshedAt !== refreshedAt) return fail();
    refreshedAt ??= page.refreshedAt;
    for (const execution of page.executions) {
      if (proposalIds.has(execution.proposalId)) return fail();
      proposalIds.add(execution.proposalId);
      executions.push(execution);
    }
    if (page.nextCursor === null) {
      await assertExpectedSession(expectedUserId);
      return {
        contract: CUSTODY_EXECUTION_CONTRACT,
        scope: CUSTODY_EXECUTION_INBOX_SCOPE,
        executions,
        refreshedAt,
        nextCursor: null,
      };
    }
    if (cursors.has(page.nextCursor)) return fail();
    cursors.add(page.nextCursor);
    cursor = page.nextCursor;
  }

  await assertExpectedSession(expectedUserId);
  return {
    contract: CUSTODY_EXECUTION_CONTRACT,
    scope: CUSTODY_EXECUTION_INBOX_SCOPE,
    executions,
    refreshedAt: refreshedAt ?? new Date(0).toISOString(),
    nextCursor: cursor,
  };
};

const newEventId = (): string => {
  const eventId = Crypto.randomUUID().toLowerCase();
  if (!uuidV4(eventId)) return fail('CUSTODY_EXECUTION_EVENT_ID_GENERATION_FAILED');
  return eventId;
};

const semanticCommandMatchesPending = (
  command: CustodyExecutionEventCommand,
  pending: PendingCustodyExecutionIntent,
): boolean => command.proposalId === pending.proposalId
  && command.type === pending.type
  && (command.type !== 'report_delivery' || command.quantity === pending.request.quantity)
  && (command.type !== 'confirm_receipt' || (
    command.receipt === pending.request.receipt
    && command.quantity === pending.request.quantity
  ))
  && (command.type !== 'record_follow_up' || command.followUp === pending.request.followUp);

const snapshotFromCommand = async (
  command: CustodyExecutionEventCommand,
  expectedUserId: number,
): Promise<CustodyExecutionSnapshot> => {
  if (command.snapshot) {
    if (
      !utcDate(command.snapshot.observedAt)
      || Date.parse(command.snapshot.observedAt) > Date.now() + CLOCK_TOLERANCE_MS
    ) return fail('CUSTODY_EXECUTION_SNAPSHOT_MISMATCH');
    const execution = parseCustodyExecutionView(
      JSON.parse(JSON.stringify(command.snapshot.execution)) as unknown,
      command.snapshot.observedAt,
    );
    if (execution.proposalId !== command.proposalId) return fail('CUSTODY_EXECUTION_SNAPSHOT_MISMATCH');
    return { execution, observedAt: command.snapshot.observedAt };
  }
  const status = await loadCustodyExecutionStatus(command.proposalId, expectedUserId);
  return { execution: status.execution, observedAt: status.refreshedAt };
};

const buildEventRequest = (
  command: CustodyExecutionEventCommand,
  snapshot: CustodyExecutionSnapshot,
  eventId: string,
): CustodyExecutionEventRequest => {
  const common = {
    eventId,
    proposalId: command.proposalId,
    expectedVersion: snapshot.execution.version,
    type: command.type,
  };
  let request: CustodyExecutionEventRequest;
  if (command.type === 'report_delivery') {
    request = command.quantity === undefined ? common : { ...common, quantity: command.quantity };
  } else if (command.type === 'confirm_receipt') {
    request = command.quantity === undefined
      ? { ...common, receipt: command.receipt }
      : { ...common, receipt: command.receipt, quantity: command.quantity };
  } else if (command.type === 'record_follow_up') {
    request = { ...common, followUp: command.followUp };
  } else {
    request = common;
  }
  const parsed = parseEventRequest(request);
  assertRequestMatchesSnapshot(parsed, snapshot.execution);
  return parsed;
};

const restoreIntentAfterCleanupFailure = async (
  intent: CivicCustodyExecutionIntentRow,
  database?: CustodyExecutionIntentDatabase,
): Promise<void> => {
  reserveCustodyExecutionIntent({
    eventId: intent.eventId,
    userId: intent.userId,
    proposalId: intent.proposalId,
    eventType: intent.eventType,
    expectedVersion: intent.expectedVersion,
    requestJson: intent.requestJson,
    executionJson: intent.executionJson,
    snapshotObservedAt: intent.snapshotObservedAt,
    createdAt: intent.createdAt,
  }, database);
  await flushWebDatabaseSnapshot();
};

const sendPendingExecutionIntent = async (
  intent: CivicCustodyExecutionIntentRow,
  expectedUserId: number,
  proof: string,
  database?: CustodyExecutionIntentDatabase,
): Promise<CustodyExecutionMutationReceipt> => {
  const pending = parseStoredPendingIntent(intent);
  if (pending.userId !== expectedUserId) return fail('AUTH_SESSION_CHANGED');
  markCustodyExecutionIntentAttempt(intent, new Date().toISOString(), database);
  await flushWebDatabaseSnapshot();

  const response = await communityFetchForUser(
    expectedUserId,
    '/api/v1/civic/custody/execution/events',
    {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'idempotency-key': `custody:${intent.proposalId}:execution:event:${intent.eventId}`,
        'x-civic-device-token': proof,
      },
      body: intent.requestJson,
    },
  );

  let receipt: CustodyExecutionMutationReceipt;
  if (response.status === 409) {
    const body = await response.json().catch(() => null) as unknown;
    receipt = parseCustodyExecutionMutationReceipt(
      body,
      pending.request,
      pending.snapshot.execution,
    );
    if (receipt.status !== 'rejected') return fail();
  } else {
    receipt = parseCustodyExecutionMutationReceipt(
      await readJson(response),
      pending.request,
      pending.snapshot.execution,
    );
    if (receipt.status === 'rejected') return fail();
  }

  await assertExpectedSession(expectedUserId);
  cacheGrantorExecution({
    execution: receipt.execution,
    observedAt: receipt.refreshedAt,
  }, expectedUserId, false);
  const cleared = clearVerifiedCustodyExecutionIntent(intent, database);
  if (!cleared) return fail('CUSTODY_EXECUTION_INTENT_PENDING_CONFLICT');
  try {
    await flushWebDatabaseSnapshot();
  } catch (error) {
    await restoreIntentAfterCleanupFailure(intent, database).catch(() => undefined);
    throw error;
  }
  return receipt;
};

export const submitCustodyExecutionEvent = async (
  command: CustodyExecutionEventCommand,
  expectedUserId: number,
  database?: CustodyExecutionIntentDatabase,
): Promise<CustodyExecutionMutationReceipt> => {
  if (!uuidV4(command.proposalId) || !EVENT_TYPES.has(command.type)) {
    return fail('INVALID_CUSTODY_EXECUTION_EVENT');
  }
  await assertExpectedSession(expectedUserId);
  if (GRANTOR_ONLY_EVENTS.has(command.type)) {
    assertLocalGrantorAuthority(command.proposalId, expectedUserId);
  }
  const proof = await civicProof();
  const existing = findCustodyExecutionIntent(expectedUserId, command.proposalId, database);
  if (existing) {
    const pending = parseStoredPendingIntent(existing);
    if (!semanticCommandMatchesPending(command, pending)) {
      return fail('CUSTODY_EXECUTION_INTENT_PENDING_CONFLICT');
    }
    return sendPendingExecutionIntent(existing, expectedUserId, proof, database);
  }

  const snapshot = await snapshotFromCommand(command, expectedUserId);
  await assertExpectedSession(expectedUserId);
  // Otra llamada pudo reservar el proposal mientras esperábamos el snapshot.
  const raced = findCustodyExecutionIntent(expectedUserId, command.proposalId, database);
  if (raced) {
    const pending = parseStoredPendingIntent(raced);
    if (!semanticCommandMatchesPending(command, pending)) {
      return fail('CUSTODY_EXECUTION_INTENT_PENDING_CONFLICT');
    }
    return sendPendingExecutionIntent(raced, expectedUserId, proof, database);
  }

  const eventId = newEventId();
  const request = buildEventRequest(command, snapshot, eventId);
  const createdAt = new Date().toISOString();
  const intent = reserveCustodyExecutionIntent({
    eventId,
    userId: expectedUserId,
    proposalId: command.proposalId,
    eventType: command.type,
    expectedVersion: snapshot.execution.version,
    requestJson: JSON.stringify(request),
    executionJson: JSON.stringify(snapshot.execution),
    snapshotObservedAt: snapshot.observedAt,
    createdAt,
  }, database);
  return sendPendingExecutionIntent(intent, expectedUserId, proof, database);
};

export const retryCustodyExecutionEvent = async (
  proposalId: string,
  expectedUserId: number,
  database?: CustodyExecutionIntentDatabase,
): Promise<CustodyExecutionMutationReceipt> => {
  if (!uuidV4(proposalId)) return fail('INVALID_CUSTODY_EXECUTION_PROPOSAL_ID');
  await assertExpectedSession(expectedUserId);
  const intent = findCustodyExecutionIntent(expectedUserId, proposalId, database);
  if (!intent) return fail('CUSTODY_EXECUTION_INTENT_NOT_FOUND');
  if (GRANTOR_ONLY_EVENTS.has(intent.eventType)) {
    assertLocalGrantorAuthority(proposalId, expectedUserId);
  }
  const proof = await civicProof();
  return sendPendingExecutionIntent(intent, expectedUserId, proof, database);
};
