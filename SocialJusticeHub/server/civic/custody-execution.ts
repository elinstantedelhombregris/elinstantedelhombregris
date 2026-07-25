import { createHash } from 'node:crypto';
import { z } from 'zod';

import { canonicalJson, civicIdempotencyKeySchema } from './contracts';
import {
  custodyNeedUnitSchema,
  custodyUuidV4Schema,
  type CustodyDeviceRecord,
  type StoredCustodyGrant,
} from './custody-grants';
import {
  type StoredCustodyCoordinationDecision,
  type StoredCustodyCoordinationProposal,
} from './custody-coordination';
import {
  custodyPageCursorStringSchema,
  decodeCustodyPageCursor,
  encodeCustodyPageCursor,
  type CustodyPageRequest,
} from './custody-pagination';
import { custodyTimestampToIsoUtc } from './custody-timestamps';
import { CivicApiError } from './service';

export const CUSTODY_EXECUTION_CONTRACT = 'basta-civic-custody-execution/v1' as const;
export const CUSTODY_EXECUTION_DELIVERY_DEADLINE_MS = 24 * 60 * 60_000;

const versionSchema = z.string().regex(/^[0-9a-f]{64}$/);
const quantitySchema = z.number().finite().positive().max(1_000_000_000);
const commonEventFields = {
  eventId: custodyUuidV4Schema,
  proposalId: custodyUuidV4Schema,
  expectedVersion: versionSchema,
} as const;

const noPayloadEvent = <T extends 'reserve' | 'grantor_ready' | 'coordinator_ready' | 'start_delivery' | 'withdraw'>(
  type: T,
) => z.object({ ...commonEventFields, type: z.literal(type) }).strict();

export const createCustodyExecutionEventSchema = z.discriminatedUnion('type', [
  noPayloadEvent('reserve'),
  noPayloadEvent('grantor_ready'),
  noPayloadEvent('coordinator_ready'),
  noPayloadEvent('start_delivery'),
  z.object({
    ...commonEventFields,
    type: z.literal('report_delivery'),
    quantity: quantitySchema.optional(),
  }).strict(),
  z.object({
    ...commonEventFields,
    type: z.literal('confirm_receipt'),
    receipt: z.enum(['full', 'partial', 'not_received']),
    quantity: quantitySchema.optional(),
  }).strict(),
  z.object({
    ...commonEventFields,
    type: z.literal('record_follow_up'),
    followUp: z.enum(['need_met', 'still_open']),
  }).strict(),
  noPayloadEvent('withdraw'),
]);

export const custodyExecutionStatusQuerySchema = z.object({
  proposalId: custodyUuidV4Schema,
}).strict();

export const custodyExecutionInboxQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  cursor: custodyPageCursorStringSchema.optional(),
}).strict();

export { civicIdempotencyKeySchema as custodyExecutionIdempotencyKeySchema };

export type CreateCustodyExecutionEventInput = z.infer<typeof createCustodyExecutionEventSchema>;
export type CustodyExecutionEventType = CreateCustodyExecutionEventInput['type'];
export type CustodyExecutionUnit = z.infer<typeof custodyNeedUnitSchema>;
export type CustodyExecutionActorRole = 'coordinator' | 'grantor';
export type CustodyExecutionReceiptOutcome = 'full' | 'partial' | 'not_received';
export type CustodyExecutionFollowUp = 'need_met' | 'still_open';
export type CustodyExecutionRejectionReason = 'version_changed' | 'transition_not_allowed';
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

export interface StoredCustodyExecutionRoot {
  rowId: number;
  proposalId: string;
  acceptedDecisionId: string;
  grantId: string;
  proposerUserId: number;
  grantorUserId: number;
  ownerActorKey: string;
  quantity: number | null;
  unit: CustodyExecutionUnit | null;
  expiresAt: string;
  acceptedAt: string;
  createdAt: string;
}

/**
 * Ledger durable de comandos. Sólo `applied=true` constituye un evento
 * operativo; los rechazos quedan para que una respuesta HTTP perdida nunca
 * convierta más tarde el mismo eventId en una mutación válida.
 */
export interface StoredCustodyExecutionCommand {
  rowId: number;
  eventId: string;
  proposalId: string;
  idempotencyKey: string;
  requestHash: string;
  actorRole: CustodyExecutionActorRole;
  actorUserId: number;
  ownerActorKey: string | null;
  eventType: CustodyExecutionEventType;
  expectedVersion: string;
  quantity: number | null;
  unit: CustodyExecutionUnit | null;
  receiptOutcome: CustodyExecutionReceiptOutcome | null;
  followUpOutcome: CustodyExecutionFollowUp | null;
  applied: boolean;
  rejectionReason: CustodyExecutionRejectionReason | null;
  sequence: number | null;
  eventVersion: string | null;
  createdAt: string;
}

export interface CustodyExecutionRecord {
  root: StoredCustodyExecutionRoot;
  proposal: StoredCustodyCoordinationProposal;
  decision: StoredCustodyCoordinationDecision;
  grant: StoredCustodyGrant;
  commands: StoredCustodyExecutionCommand[];
  coordinatorAvailable: boolean;
}

export interface CustodyExecutionCoordinatorSnapshot {
  authorized: boolean;
  records: CustodyExecutionRecord[];
  refreshedAt: string | null;
}

export interface CustodyExecutionStore {
  runInTransaction?<T>(operation: (store: CustodyExecutionStore) => Promise<T>): Promise<T>;
  currentTimestamp(): Promise<string>;
  lockActiveUser(userId: number): Promise<boolean>;
  lockDevice(actorKey: string): Promise<CustodyDeviceRecord | null>;
  lockCircle(circleId: number): Promise<boolean>;
  lockCircleCoordinator(circleId: number, userId: number): Promise<boolean>;
  getGrantForUpdate(grantId: string): Promise<StoredCustodyGrant | null>;
  getProposal(proposalId: string): Promise<StoredCustodyCoordinationProposal | null>;
  getProposalForUpdate(proposalId: string): Promise<StoredCustodyCoordinationProposal | null>;
  getDecisionForUpdate(proposalId: string): Promise<StoredCustodyCoordinationDecision | null>;
  getExecutionRootForUpdate(proposalId: string): Promise<StoredCustodyExecutionRoot | null>;
  insertExecutionRoot(
    input: Omit<StoredCustodyExecutionRoot, 'rowId' | 'createdAt'>,
  ): Promise<StoredCustodyExecutionRoot | null>;
  getCommands(proposalId: string): Promise<StoredCustodyExecutionCommand[]>;
  findCommandConflicts(
    eventId: string,
    actorUserId: number,
    idempotencyKey: string,
  ): Promise<StoredCustodyExecutionCommand[]>;
  insertCommand(
    input: Omit<StoredCustodyExecutionCommand, 'rowId'>,
  ): Promise<StoredCustodyExecutionCommand | null>;
  getRecord(proposalId: string): Promise<CustodyExecutionRecord | null>;
  listCoordinatorRecords(
    userId: number,
    limit: number,
    page: CustodyPageRequest | null,
  ): Promise<CustodyExecutionCoordinatorSnapshot>;
}

export interface CustodyExecutionActorContext {
  actorKey: string | null;
}

export interface CustodyExecutionEventView {
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

export interface CustodyExecutionView {
  proposalId: string;
  state: CustodyExecutionState;
  version: string;
  capacity: { quantity: number | null; unit: CustodyExecutionUnit | null };
  delivery: { quantity: number | null; unit: CustodyExecutionUnit | null } | null;
  receipt: {
    outcome: CustodyExecutionReceiptOutcome;
    quantity: number | null;
    unit: CustodyExecutionUnit | null;
  } | null;
  followUp: CustodyExecutionFollowUp | null;
  readiness: { grantor: boolean; coordinator: boolean };
  reconciliation: {
    receiptAvailableAt: string | null;
    receiptWindowOpen: boolean;
    withdrawnBy: CustodyExecutionActorRole | null;
  };
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
  createdAt: string;
  expiresAt: string;
  updatedAt: string;
}

const hash = (value: unknown): string => createHash('sha256')
  .update(canonicalJson(value))
  .digest('hex');

export const CUSTODY_EXECUTION_EMPTY_VERSION = hash([]);

const commandRecordedAt = (command: StoredCustodyExecutionCommand): string =>
  custodyTimestampToIsoUtc(command.createdAt, '$.recordedEvent.recordedAt');

const commandEventVersion = (command: StoredCustodyExecutionCommand): string => hash({
  previousVersion: command.expectedVersion,
  eventId: command.eventId,
  proposalId: command.proposalId,
  type: command.eventType,
  actorRole: command.actorRole,
  quantity: command.quantity,
  unit: command.unit,
  receipt: command.receiptOutcome,
  followUp: command.followUpOutcome,
  recordedAt: commandRecordedAt(command),
});

const eventView = (command: StoredCustodyExecutionCommand): CustodyExecutionEventView => {
  if (!command.applied || !command.eventVersion || command.sequence == null) {
    throw new CivicApiError(500, 'CUSTODY_EXECUTION_STATE_INVALID', 'El ledger de ejecución no es válido.');
  }
  const version = commandEventVersion(command);
  if (version !== command.eventVersion) {
    throw new CivicApiError(500, 'CUSTODY_EXECUTION_STATE_INVALID', 'La cadena de ejecución no es válida.');
  }
  return {
    eventId: command.eventId,
    proposalId: command.proposalId,
    type: command.eventType,
    actorRole: command.actorRole,
    expectedVersion: command.expectedVersion,
    quantity: command.quantity,
    unit: command.unit,
    receipt: command.receiptOutcome,
    followUp: command.followUpOutcome,
    recordedAt: commandRecordedAt(command),
    version,
  };
};

const appliedCommands = (
  commands: StoredCustodyExecutionCommand[],
): StoredCustodyExecutionCommand[] => commands
  .filter((command) => command.applied)
  .sort((left, right) => (left.sequence ?? 0) - (right.sequence ?? 0));

const assertRootSnapshot = (record: CustodyExecutionRecord): void => {
  const { root, proposal, decision, grant } = record;
  if (
    decision.decision !== 'accept'
    || root.proposalId !== proposal.proposalId
    || root.acceptedDecisionId !== decision.decisionId
    || root.grantId !== grant.grantId
    || proposal.grantId !== grant.grantId
    || decision.proposalId !== proposal.proposalId
    || root.proposerUserId !== proposal.proposerUserId
    || root.grantorUserId !== grant.grantorUserId
    || root.ownerActorKey !== grant.ownerActorKey
    || root.quantity !== proposal.quantity
    || root.unit !== proposal.unit
    || root.expiresAt !== proposal.expiresAt
    || root.acceptedAt !== decision.createdAt
  ) {
    throw new CivicApiError(500, 'CUSTODY_EXECUTION_STATE_INVALID', 'La raíz de ejecución no coincide con la coordinación aceptada.');
  }
};

const commandByType = (
  commands: StoredCustodyExecutionCommand[],
  type: CustodyExecutionEventType,
): StoredCustodyExecutionCommand | null => commands.find((command) => command.eventType === type) ?? null;

const executionIsExternallyClosed = (record: CustodyExecutionRecord): boolean => (
  record.grant.revokedAt != null
  || (record.grant.closedAt != null && record.grant.closedReason !== 'expired')
  || !record.coordinatorAvailable
);

const executionIsExpired = (record: CustodyExecutionRecord, nowMs: number): boolean => (
  record.grant.closedReason === 'expired'
  || Date.parse(record.grant.expiresAt) <= nowMs
  || Date.parse(record.root.expiresAt) <= nowMs
);

export const custodyExecutionView = (
  record: CustodyExecutionRecord,
  nowMs: number,
): CustodyExecutionView => {
  assertRootSnapshot(record);
  const commands = appliedCommands(record.commands);
  let expectedVersion = CUSTODY_EXECUTION_EMPTY_VERSION;
  const seen = new Set<CustodyExecutionEventType>();
  for (let index = 0; index < commands.length; index += 1) {
    const command = commands[index]!;
    if (
      command.sequence !== index + 1
      || command.expectedVersion !== expectedVersion
      || seen.has(command.eventType)
    ) {
      throw new CivicApiError(500, 'CUSTODY_EXECUTION_STATE_INVALID', 'La secuencia de ejecución no es válida.');
    }
    const view = eventView(command);
    expectedVersion = view.version;
    seen.add(command.eventType);
  }

  const reserve = commandByType(commands, 'reserve');
  const grantorReady = commandByType(commands, 'grantor_ready');
  const coordinatorReady = commandByType(commands, 'coordinator_ready');
  const start = commandByType(commands, 'start_delivery');
  const report = commandByType(commands, 'report_delivery');
  const receipt = commandByType(commands, 'confirm_receipt');
  const followUp = commandByType(commands, 'record_follow_up');
  const withdraw = commandByType(commands, 'withdraw');
  const deliveryDeadlineAt = start
    ? new Date(Date.parse(commandRecordedAt(start)) + CUSTODY_EXECUTION_DELIVERY_DEADLINE_MS).toISOString()
    : null;

  let state: CustodyExecutionState;
  if (followUp?.followUpOutcome === 'need_met') state = 'completed';
  else if (followUp?.followUpOutcome === 'still_open') state = 'needs_follow_up';
  else if (receipt?.receiptOutcome === 'not_received') state = 'disputed';
  else if (receipt) state = 'received';
  else if (withdraw) state = 'cancelled';
  else if (executionIsExternallyClosed(record)) state = 'closed';
  else if (executionIsExpired(record, nowMs)) state = 'expired';
  else if (report) state = 'delivery_reported';
  else if (start) state = 'in_transit';
  else if (reserve && grantorReady && coordinatorReady) state = 'ready';
  else if (reserve) state = 'reserved';
  else state = 'awaiting_reservation';

  const recordedAt = (command: StoredCustodyExecutionCommand | null): string | null => (
    command ? commandRecordedAt(command) : null
  );

  return {
    proposalId: record.root.proposalId,
    state,
    version: expectedVersion,
    capacity: { quantity: record.root.quantity, unit: record.root.unit },
    delivery: report ? { quantity: report.quantity, unit: report.unit } : null,
    receipt: receipt ? {
      outcome: receipt.receiptOutcome!,
      quantity: receipt.quantity,
      unit: receipt.unit,
    } : null,
    followUp: followUp?.followUpOutcome ?? null,
    readiness: { grantor: Boolean(grantorReady), coordinator: Boolean(coordinatorReady) },
    reconciliation: {
      receiptAvailableAt: deliveryDeadlineAt,
      receiptWindowOpen: Boolean(
        start && (
          report
          || withdraw?.actorRole === 'coordinator'
          || (deliveryDeadlineAt && nowMs >= Date.parse(deliveryDeadlineAt))
        )
      ),
      withdrawnBy: withdraw?.actorRole ?? null,
    },
    milestones: {
      reservedAt: recordedAt(reserve),
      grantorReadyAt: recordedAt(grantorReady),
      coordinatorReadyAt: recordedAt(coordinatorReady),
      deliveryStartedAt: recordedAt(start),
      deliveryReportedAt: recordedAt(report),
      receiptRecordedAt: recordedAt(receipt),
      followUpRecordedAt: recordedAt(followUp),
      withdrawnAt: recordedAt(withdraw),
    },
    createdAt: custodyTimestampToIsoUtc(record.root.acceptedAt, '$.execution.createdAt'),
    expiresAt: custodyTimestampToIsoUtc(record.root.expiresAt, '$.execution.expiresAt'),
    updatedAt: commands.length > 0
      ? commandRecordedAt(commands.at(-1)!)
      : custodyTimestampToIsoUtc(record.root.acceptedAt, '$.execution.updatedAt'),
  };
};

export const custodyExecutionRootFromAcceptedCoordination = (
  proposal: StoredCustodyCoordinationProposal,
  decision: StoredCustodyCoordinationDecision,
  grant: StoredCustodyGrant,
): Omit<StoredCustodyExecutionRoot, 'rowId' | 'createdAt'> => ({
  proposalId: proposal.proposalId,
  acceptedDecisionId: decision.decisionId,
  grantId: grant.grantId,
  proposerUserId: proposal.proposerUserId,
  grantorUserId: grant.grantorUserId,
  ownerActorKey: grant.ownerActorKey,
  quantity: proposal.quantity,
  unit: proposal.unit,
  expiresAt: proposal.expiresAt,
  acceptedAt: decision.createdAt,
});

export const virtualCustodyExecutionRoot = (
  proposal: StoredCustodyCoordinationProposal,
  decision: StoredCustodyCoordinationDecision,
  grant: StoredCustodyGrant,
): StoredCustodyExecutionRoot => ({
  rowId: 0,
  ...custodyExecutionRootFromAcceptedCoordination(proposal, decision, grant),
  createdAt: decision.createdAt,
});

const requiredRole = (
  type: CustodyExecutionEventType,
  userId: number,
  root: StoredCustodyExecutionRoot,
): CustodyExecutionActorRole | null => {
  if (['reserve', 'coordinator_ready', 'start_delivery', 'report_delivery'].includes(type)) {
    return userId === root.proposerUserId ? 'coordinator' : null;
  }
  if (['grantor_ready', 'confirm_receipt', 'record_follow_up'].includes(type)) {
    return userId === root.grantorUserId ? 'grantor' : null;
  }
  if (type === 'withdraw') {
    if (userId === root.proposerUserId) return 'coordinator';
    if (userId === root.grantorUserId) return 'grantor';
  }
  return null;
};

const normalizedPayload = (
  input: CreateCustodyExecutionEventInput,
  root: StoredCustodyExecutionRoot,
  commands: StoredCustodyExecutionCommand[],
): {
  quantity: number | null;
  unit: CustodyExecutionUnit | null;
  receiptOutcome: CustodyExecutionReceiptOutcome | null;
  followUpOutcome: CustodyExecutionFollowUp | null;
} => {
  if (input.type === 'report_delivery') return {
    quantity: input.quantity ?? null,
    unit: input.quantity == null ? null : root.unit,
    receiptOutcome: null,
    followUpOutcome: null,
  };
  if (input.type === 'confirm_receipt') {
    const report = commandByType(appliedCommands(commands), 'report_delivery');
    const referenceQuantity = report?.quantity ?? root.quantity;
    const quantity = input.receipt === 'not_received'
      ? null
      : input.receipt === 'full'
        ? input.quantity ?? referenceQuantity
        : input.quantity ?? null;
    return {
      quantity,
      unit: quantity == null ? null : report?.unit ?? root.unit,
      receiptOutcome: input.receipt,
      followUpOutcome: null,
    };
  }
  if (input.type === 'record_follow_up') return {
    quantity: null,
    unit: null,
    receiptOutcome: null,
    followUpOutcome: input.followUp,
  };
  return { quantity: null, unit: null, receiptOutcome: null, followUpOutcome: null };
};

const exactIdempotencyKey = (input: CreateCustodyExecutionEventInput): string =>
  `custody:${input.proposalId}:execution:event:${input.eventId}`;

const transitionAllowed = (
  input: CreateCustodyExecutionEventInput,
  actorRole: CustodyExecutionActorRole,
  record: CustodyExecutionRecord,
  nowMs: number,
): boolean => {
  const commands = appliedCommands(record.commands);
  if (commandByType(commands, input.type)) return false;
  const reserve = commandByType(commands, 'reserve');
  const grantorReady = commandByType(commands, 'grantor_ready');
  const coordinatorReady = commandByType(commands, 'coordinator_ready');
  const start = commandByType(commands, 'start_delivery');
  const report = commandByType(commands, 'report_delivery');
  const receipt = commandByType(commands, 'confirm_receipt');
  const followUp = commandByType(commands, 'record_follow_up');
  const withdraw = commandByType(commands, 'withdraw');
  if (followUp || receipt?.receiptOutcome === 'not_received') return false;

  const operational = !executionIsExternallyClosed(record)
    && !executionIsExpired(record, nowMs);

  if (input.type === 'reserve') {
    return actorRole === 'coordinator' && operational && !start && !withdraw;
  }
  if (input.type === 'grantor_ready' || input.type === 'coordinator_ready') {
    return operational && !start && !withdraw;
  }
  if (input.type === 'start_delivery') {
    return actorRole === 'coordinator'
      && operational
      && Boolean(reserve && grantorReady && coordinatorReady)
      && !withdraw;
  }
  if (input.type === 'report_delivery') {
    if (actorRole !== 'coordinator' || !operational || !start || withdraw || receipt) return false;
    if (record.root.quantity == null || record.root.unit == null) return input.quantity == null;
    return input.quantity != null && input.quantity <= record.root.quantity;
  }
  if (input.type === 'withdraw') {
    return !receipt;
  }
  if (input.type === 'confirm_receipt') {
    if (actorRole !== 'grantor' || !start || receipt) return false;
    const coordinatorWithdrew = withdraw?.actorRole === 'coordinator';
    const deadlinePassed = nowMs >= Date.parse(commandRecordedAt(start))
      + CUSTODY_EXECUTION_DELIVERY_DEADLINE_MS;
    if (!report && !coordinatorWithdrew && !deadlinePassed) return false;
    const referenceQuantity = report?.quantity ?? record.root.quantity;
    if (input.receipt === 'not_received') return input.quantity == null;
    if (referenceQuantity == null) return input.quantity == null;
    if (input.receipt === 'full') {
      return input.quantity == null || input.quantity === referenceQuantity;
    }
    return input.quantity != null && input.quantity < referenceQuantity;
  }
  if (input.type === 'record_follow_up') {
    return actorRole === 'grantor'
      && Boolean(receipt);
  }
  return false;
};

const currentRequestHash = (
  input: CreateCustodyExecutionEventInput,
  actorRole: CustodyExecutionActorRole,
  userId: number,
  ownerActorKey: string | null,
): string => hash({
  input,
  actorRole,
  actorUserId: userId,
  ownerActorKey,
});

const exactCommand = (
  rows: StoredCustodyExecutionCommand[],
  input: CreateCustodyExecutionEventInput,
  actorRole: CustodyExecutionActorRole,
  userId: number,
  ownerActorKey: string | null,
  idempotencyKey: string,
  requestHash: string,
): StoredCustodyExecutionCommand | null => {
  if (rows.length === 0) return null;
  if (
    rows.length === 1
    && rows[0]!.eventId === input.eventId
    && rows[0]!.proposalId === input.proposalId
    && rows[0]!.idempotencyKey === idempotencyKey
    && rows[0]!.requestHash === requestHash
    && rows[0]!.actorRole === actorRole
    && rows[0]!.actorUserId === userId
    && rows[0]!.ownerActorKey === ownerActorKey
    && rows[0]!.eventType === input.type
    && rows[0]!.expectedVersion === input.expectedVersion
  ) return rows[0]!;
  throw new CivicApiError(
    409,
    'CUSTODY_EXECUTION_IDEMPOTENCY_CONFLICT',
    'La identidad del comando ya fue usada con otro contenido.',
  );
};

type CustodyExecutionMutationResult = {
  contract: typeof CUSTODY_EXECUTION_CONTRACT;
  status: 'accepted' | 'duplicate';
  recordedEvent: CustodyExecutionEventView;
  execution: CustodyExecutionView;
  refreshedAt: string;
} | {
  contract: typeof CUSTODY_EXECUTION_CONTRACT;
  status: 'rejected';
  reason: CustodyExecutionRejectionReason;
  eventId: string;
  recordedEvent: null;
  execution: CustodyExecutionView;
  refreshedAt: string;
};

const mutationFromStored = (
  command: StoredCustodyExecutionCommand,
  execution: CustodyExecutionView,
  refreshedAt: string,
  replay: boolean,
): CustodyExecutionMutationResult => command.applied
  ? {
    contract: CUSTODY_EXECUTION_CONTRACT,
    status: replay ? 'duplicate' : 'accepted',
    recordedEvent: eventView(command),
    execution,
    refreshedAt,
  }
  : {
    contract: CUSTODY_EXECUTION_CONTRACT,
    status: 'rejected',
    reason: command.rejectionReason!,
    eventId: command.eventId,
    recordedEvent: null,
    execution,
    refreshedAt,
  };

export class CustodyExecutionService {
  constructor(private readonly store: CustodyExecutionStore) {}

  private async now(store: CustodyExecutionStore): Promise<{ iso: string; ms: number }> {
    const iso = custodyTimestampToIsoUtc(
      await store.currentTimestamp(),
      '$.execution.currentTimestamp',
    );
    return { iso, ms: Date.parse(iso) };
  }

  private notFound(): never {
    throw new CivicApiError(
      404,
      'CUSTODY_EXECUTION_NOT_FOUND',
      'La ejecución no existe o no está disponible.',
    );
  }

  private async lockedRecord(
    store: CustodyExecutionStore,
    proposalId: string,
  ): Promise<{
    record: CustodyExecutionRecord;
    ownerDevice: CustodyDeviceRecord | null;
    grantorActive: boolean;
    rootMissing: boolean;
  }> {
    // La primera lectura sólo ubica el lock padre. El orden autoritativo es
    // grant → execution root → proposal/decision → users/device/membership/circle.
    const located = await store.getProposal(proposalId);
    if (!located) return this.notFound();
    const grant = await store.getGrantForUpdate(located.grantId);
    if (!grant) return this.notFound();
    const storedRoot = await store.getExecutionRootForUpdate(proposalId);
    const proposal = await store.getProposalForUpdate(proposalId);
    const decision = await store.getDecisionForUpdate(proposalId);
    if (
      !proposal
      || proposal.grantId !== grant.grantId
      || !decision
      || decision.proposalId !== proposal.proposalId
      || decision.decision !== 'accept'
    ) return this.notFound();

    const activeUsers = new Map<number, boolean>();
    for (const participantId of [proposal.proposerUserId, grant.grantorUserId].sort((a, b) => a - b)) {
      activeUsers.set(participantId, await store.lockActiveUser(participantId));
    }
    const coordinatorActive = activeUsers.get(proposal.proposerUserId) ?? false;
    const grantorActive = activeUsers.get(grant.grantorUserId) ?? false;
    const ownerDevice = await store.lockDevice(grant.ownerActorKey);
    const coordinatorMember = await store.lockCircleCoordinator(
      grant.recipientCircleId,
      proposal.proposerUserId,
    );
    const circleAvailable = await store.lockCircle(grant.recipientCircleId);
    const coordinatorAvailable = coordinatorActive && coordinatorMember && circleAvailable;

    // La raíz virtual permite autorizar sin causar una escritura lateral. La
    // raíz durable se crea sólo después de que el primer comando fue
    // autenticado, todavía bajo el lock exclusivo del grant.
    const root = storedRoot ?? virtualCustodyExecutionRoot(proposal, decision, grant);
    const record: CustodyExecutionRecord = {
      root,
      proposal,
      decision,
      grant,
      commands: await store.getCommands(proposalId),
      coordinatorAvailable,
    };
    assertRootSnapshot(record);
    return { record, ownerDevice, grantorActive, rootMissing: storedRoot == null };
  }

  private authorizeActor(
    actor: CustodyExecutionActorContext,
    userId: number,
    type: CustodyExecutionEventType,
    record: CustodyExecutionRecord,
    ownerDevice: CustodyDeviceRecord | null,
    grantorActive: boolean,
  ): { role: CustodyExecutionActorRole; ownerActorKey: string | null } {
    const role = requiredRole(type, userId, record.root);
    if (!role) return this.notFound();
    if (role === 'coordinator') {
      if (!record.coordinatorAvailable) return this.notFound();
      return { role, ownerActorKey: null };
    }
    if (!actor.actorKey) {
      throw new CivicApiError(401, 'MISSING_CIVIC_PROOF', 'Falta demostrar el dispositivo dueño de la necesidad.');
    }
    if (
      !grantorActive
      || !ownerDevice
      || ownerDevice.revokedAt != null
      || ownerDevice.actorKey !== record.root.ownerActorKey
      || actor.actorKey !== ownerDevice.actorKey
      || ownerDevice.linkedUserId !== userId
      || record.root.grantorUserId !== userId
    ) return this.notFound();
    return { role, ownerActorKey: ownerDevice.actorKey };
  }

  async recordEvent(
    actor: CustodyExecutionActorContext,
    userId: number,
    input: CreateCustodyExecutionEventInput,
    idempotencyKey: string,
  ): Promise<CustodyExecutionMutationResult> {
    if (idempotencyKey !== exactIdempotencyKey(input)) {
      throw new CivicApiError(
        422,
        'INVALID_CUSTODY_EXECUTION_IDEMPOTENCY_KEY',
        'La clave idempotente no corresponde al evento.',
        '$.headers.idempotency-key',
      );
    }

    const commit = async (store: CustodyExecutionStore): Promise<CustodyExecutionMutationResult> => {
      const locked = await this.lockedRecord(store, input.proposalId);
      const authorization = this.authorizeActor(
        actor,
        userId,
        input.type,
        locked.record,
        locked.ownerDevice,
        locked.grantorActive,
      );
      if (locked.rootMissing) {
        let root = await store.insertExecutionRoot(custodyExecutionRootFromAcceptedCoordination(
          locked.record.proposal,
          locked.record.decision,
          locked.record.grant,
        ));
        if (!root) root = await store.getExecutionRootForUpdate(input.proposalId);
        if (!root) {
          throw new CivicApiError(
            409,
            'CUSTODY_EXECUTION_ROOT_CONFLICT',
            'No se pudo fijar la raíz de ejecución.',
          );
        }
        locked.record.root = root;
        assertRootSnapshot(locked.record);
      }
      const requestHash = currentRequestHash(
        input,
        authorization.role,
        userId,
        authorization.ownerActorKey,
      );
      const replay = exactCommand(
        await store.findCommandConflicts(input.eventId, userId, idempotencyKey),
        input,
        authorization.role,
        userId,
        authorization.ownerActorKey,
        idempotencyKey,
        requestHash,
      );
      const now = await this.now(store);
      if (replay) {
        // Otro evento puede haber avanzado después del HTTP perdido. La
        // constancia exacta queda separada de esta proyección actual.
        locked.record.commands = await store.getCommands(input.proposalId);
        return mutationFromStored(
          replay,
          custodyExecutionView(locked.record, now.ms),
          now.iso,
          true,
        );
      }

      const currentExecution = custodyExecutionView(locked.record, now.ms);
      const rejectionReason: CustodyExecutionRejectionReason | null =
        input.expectedVersion !== currentExecution.version
          ? 'version_changed'
          : transitionAllowed(input, authorization.role, locked.record, now.ms)
            ? null
            : 'transition_not_allowed';
      const payload = normalizedPayload(input, locked.record.root, locked.record.commands);
      const applied = rejectionReason == null;
      const sequence = applied ? appliedCommands(locked.record.commands).length + 1 : null;
      const draft: StoredCustodyExecutionCommand = {
        rowId: 0,
        eventId: input.eventId,
        proposalId: input.proposalId,
        idempotencyKey,
        requestHash,
        actorRole: authorization.role,
        actorUserId: userId,
        ownerActorKey: authorization.ownerActorKey,
        eventType: input.type,
        expectedVersion: input.expectedVersion,
        ...payload,
        applied,
        rejectionReason,
        sequence,
        eventVersion: null,
        createdAt: now.iso,
      };
      if (applied) draft.eventVersion = commandEventVersion(draft);

      let duplicate = false;
      let inserted = await store.insertCommand({
        eventId: draft.eventId,
        proposalId: draft.proposalId,
        idempotencyKey: draft.idempotencyKey,
        requestHash: draft.requestHash,
        actorRole: draft.actorRole,
        actorUserId: draft.actorUserId,
        ownerActorKey: draft.ownerActorKey,
        eventType: draft.eventType,
        expectedVersion: draft.expectedVersion,
        quantity: draft.quantity,
        unit: draft.unit,
        receiptOutcome: draft.receiptOutcome,
        followUpOutcome: draft.followUpOutcome,
        applied: draft.applied,
        rejectionReason: draft.rejectionReason,
        sequence: draft.sequence,
        eventVersion: draft.eventVersion,
        createdAt: draft.createdAt,
      });
      if (!inserted) {
        duplicate = true;
        inserted = exactCommand(
          await store.findCommandConflicts(input.eventId, userId, idempotencyKey),
          input,
          authorization.role,
          userId,
          authorization.ownerActorKey,
          idempotencyKey,
          requestHash,
        );
      }
      if (!inserted) {
        throw new CivicApiError(
          409,
          'CUSTODY_EXECUTION_COMMAND_CONFLICT',
          'El comando entró en conflicto con otra escritura.',
        );
      }
      locked.record.commands = await store.getCommands(input.proposalId);
      return mutationFromStored(
        inserted,
        custodyExecutionView(locked.record, now.ms),
        now.iso,
        duplicate,
      );
    };

    return this.store.runInTransaction
      ? this.store.runInTransaction(commit)
      : commit(this.store);
  }

  async status(
    actor: CustodyExecutionActorContext,
    userId: number,
    proposalId: string,
  ): Promise<{
    contract: typeof CUSTODY_EXECUTION_CONTRACT;
    scope: 'private-custody-execution-status';
    execution: CustodyExecutionView;
    refreshedAt: string;
  }> {
    const read = async (store: CustodyExecutionStore) => {
      // Status usa el mismo lock padre y el mismo orden que una mutación. Así
      // commands, cierre y `refreshedAt` pertenecen a un único corte y el
      // cliente nunca recibe un watermark nuevo para una vista vieja.
      const locked = await this.lockedRecord(store, proposalId);
      const { record } = locked;
      if (userId === record.root.proposerUserId) {
        if (!record.coordinatorAvailable) return this.notFound();
      } else if (userId === record.root.grantorUserId) {
        if (!actor.actorKey) {
          throw new CivicApiError(401, 'MISSING_CIVIC_PROOF', 'Falta demostrar el dispositivo dueño de la necesidad.');
        }
        if (
          !locked.grantorActive
          || !locked.ownerDevice
          || locked.ownerDevice.revokedAt != null
          || actor.actorKey !== record.root.ownerActorKey
          || locked.ownerDevice.actorKey !== record.root.ownerActorKey
          || locked.ownerDevice.linkedUserId !== userId
        ) return this.notFound();
      } else return this.notFound();
      const now = await this.now(store);
      return {
        contract: CUSTODY_EXECUTION_CONTRACT,
        scope: 'private-custody-execution-status' as const,
        execution: custodyExecutionView(record, now.ms),
        refreshedAt: now.iso,
      };
    };
    return this.store.runInTransaction ? this.store.runInTransaction(read) : read(this.store);
  }

  async inbox(
    userId: number,
    limit: number,
    cursor?: string,
  ): Promise<{
    contract: typeof CUSTODY_EXECUTION_CONTRACT;
    scope: 'private-custody-execution-coordinator-inbox';
    executions: CustodyExecutionView[];
    refreshedAt: string;
    nextCursor: string | null;
  }> {
    const page = decodeCustodyPageCursor(cursor, 'execution-inbox');
    const snapshot = await this.store.listCoordinatorRecords(userId, limit + 1, page);
    if (!snapshot.authorized) {
      throw new CivicApiError(403, 'ACCOUNT_NOT_ACTIVE', 'La cuenta no está habilitada para coordinar.');
    }
    if (!snapshot.refreshedAt) {
      throw new CivicApiError(500, 'CUSTODY_EXECUTION_SNAPSHOT_INVALID', 'No se pudo fijar el corte de ejecución.');
    }
    const refreshedAt = custodyTimestampToIsoUtc(snapshot.refreshedAt, '$.refreshedAt');
    if (page && page.asOf !== refreshedAt) {
      throw new CivicApiError(422, 'INVALID_CUSTODY_CURSOR', 'El cursor no pertenece a este corte privado.');
    }
    const records = snapshot.records.slice(0, limit);
    const hasMore = snapshot.records.length > limit;
    const last = records.at(-1);
    return {
      contract: CUSTODY_EXECUTION_CONTRACT,
      scope: 'private-custody-execution-coordinator-inbox',
      executions: records.map((record) => custodyExecutionView(record, Date.parse(refreshedAt))),
      refreshedAt,
      nextCursor: hasMore && last
        ? encodeCustodyPageCursor('execution-inbox', {
          asOf: refreshedAt,
          after: { rowId: last.proposal.rowId },
        })
        : null,
    };
  }
}
