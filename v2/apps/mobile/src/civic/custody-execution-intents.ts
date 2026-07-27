import { and, eq } from 'drizzle-orm';

import { db, type DB } from '@/db/client';
import {
  civicCustodyExecutionIntents,
  type CivicCustodyExecutionIntentRow,
} from '@/db/schema';

import type { CustodyExecutionEventType } from './types';

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const SHA256_HEX = /^[0-9a-f]{64}$/;
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

export type CustodyExecutionIntentDatabase = Pick<
  DB,
  'select' | 'insert' | 'update' | 'delete'
>;

export interface NewCustodyExecutionIntent {
  eventId: string;
  userId: number;
  proposalId: string;
  eventType: CustodyExecutionEventType;
  expectedVersion: string;
  requestJson: string;
  executionJson: string;
  snapshotObservedAt: string;
  createdAt: string;
}

export class CustodyExecutionIntentError extends Error {
  constructor(public readonly code: string) {
    super(code);
    this.name = 'CustodyExecutionIntentError';
  }
}

const fail = (code: string): never => {
  throw new CustodyExecutionIntentError(code);
};

const validTimestamp = (value: string): boolean => Number.isFinite(Date.parse(value));

const assertNewIntent = (input: NewCustodyExecutionIntent): void => {
  if (
    !UUID_V4.test(input.eventId)
    || !UUID_V4.test(input.proposalId)
    || !Number.isSafeInteger(input.userId)
    || input.userId <= 0
    || !EVENT_TYPES.has(input.eventType)
    || !SHA256_HEX.test(input.expectedVersion)
    || input.requestJson.length === 0
    || input.executionJson.length === 0
    || !validTimestamp(input.snapshotObservedAt)
    || !validTimestamp(input.createdAt)
  ) fail('CUSTODY_EXECUTION_INTENT_INVALID');
};

const sameCommand = (
  row: CivicCustodyExecutionIntentRow,
  input: NewCustodyExecutionIntent,
): boolean => row.eventId === input.eventId
  && row.userId === input.userId
  && row.proposalId === input.proposalId
  && row.eventType === input.eventType
  && row.expectedVersion === input.expectedVersion
  && row.requestJson === input.requestJson
  && row.executionJson === input.executionJson
  && row.snapshotObservedAt === input.snapshotObservedAt
  && row.createdAt === input.createdAt;

const accountProposalWhere = (userId: number, proposalId: string) => and(
  eq(civicCustodyExecutionIntents.userId, userId),
  eq(civicCustodyExecutionIntents.proposalId, proposalId),
);

export const listCustodyExecutionIntents = (
  userId: number,
  database: CustodyExecutionIntentDatabase = db,
): CivicCustodyExecutionIntentRow[] => {
  if (!Number.isSafeInteger(userId) || userId <= 0) {
    return fail('CUSTODY_EXECUTION_INTENT_ACCOUNT_INVALID');
  }
  return database.select().from(civicCustodyExecutionIntents)
    .where(eq(civicCustodyExecutionIntents.userId, userId)).all();
};

export const findCustodyExecutionIntent = (
  userId: number,
  proposalId: string,
  database: CustodyExecutionIntentDatabase = db,
): CivicCustodyExecutionIntentRow | null => {
  if (
    !Number.isSafeInteger(userId)
    || userId <= 0
    || !UUID_V4.test(proposalId)
  ) return fail('CUSTODY_EXECUTION_INTENT_LOOKUP_INVALID');
  return database.select().from(civicCustodyExecutionIntents)
    .where(accountProposalWhere(userId, proposalId)).get() ?? null;
};

/**
 * Reserva una identidad antes de tocar la red. Una segunda operación para la
 * misma cuenta+propuesta sólo puede observar el comando exacto ya persistido.
 */
export const reserveCustodyExecutionIntent = (
  input: NewCustodyExecutionIntent,
  database: CustodyExecutionIntentDatabase = db,
): CivicCustodyExecutionIntentRow => {
  assertNewIntent(input);
  const current = findCustodyExecutionIntent(input.userId, input.proposalId, database);
  if (current) {
    if (!sameCommand(current, input)) return fail('CUSTODY_EXECUTION_INTENT_PENDING_CONFLICT');
    return current;
  }

  database.insert(civicCustodyExecutionIntents).values({
    ...input,
    lastAttemptAt: null,
  }).onConflictDoNothing().run();
  const authoritative = findCustodyExecutionIntent(input.userId, input.proposalId, database);
  if (!authoritative || !sameCommand(authoritative, input)) {
    return fail('CUSTODY_EXECUTION_INTENT_PENDING_CONFLICT');
  }
  return authoritative;
};

export const markCustodyExecutionIntentAttempt = (
  intent: CivicCustodyExecutionIntentRow,
  attemptedAt: string,
  database: CustodyExecutionIntentDatabase = db,
): CivicCustodyExecutionIntentRow => {
  if (!validTimestamp(attemptedAt)) return fail('CUSTODY_EXECUTION_INTENT_INVALID');
  database.update(civicCustodyExecutionIntents).set({ lastAttemptAt: attemptedAt }).where(and(
    eq(civicCustodyExecutionIntents.eventId, intent.eventId),
    accountProposalWhere(intent.userId, intent.proposalId),
  )).run();
  const updated = findCustodyExecutionIntent(intent.userId, intent.proposalId, database);
  if (!updated || updated.eventId !== intent.eventId) {
    return fail('CUSTODY_EXECUTION_INTENT_PENDING_CONFLICT');
  }
  return updated;
};

/** Sólo se limpia después de validar un recibo exacto aplicado o rechazado. */
export const clearVerifiedCustodyExecutionIntent = (
  intent: CivicCustodyExecutionIntentRow,
  database: CustodyExecutionIntentDatabase = db,
): boolean => database.delete(civicCustodyExecutionIntents).where(and(
  eq(civicCustodyExecutionIntents.eventId, intent.eventId),
  accountProposalWhere(intent.userId, intent.proposalId),
  eq(civicCustodyExecutionIntents.requestJson, intent.requestJson),
  eq(civicCustodyExecutionIntents.expectedVersion, intent.expectedVersion),
)).run().changes > 0;

export const countCustodyExecutionIntents = (
  userId?: number,
  database: CustodyExecutionIntentDatabase = db,
): number => {
  if (userId == null) return database.select().from(civicCustodyExecutionIntents).all().length;
  return listCustodyExecutionIntents(userId, database).length;
};
