import { and, eq } from 'drizzle-orm';

import { db, type DB } from '@/db/client';
import {
  civicCustodyResponseIntents,
  type CivicCustodyResponseIntentRow,
} from '@/db/schema';

import type { NeedGrantResponseDisposition } from './types';

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

export type CustodyResponseIntentDatabase = Pick<
  DB,
  'select' | 'insert' | 'update' | 'delete'
>;

export interface NewCustodyResponseIntent {
  responseId: string;
  responderUserId: number;
  grantId: string;
  disposition: NeedGrantResponseDisposition;
  quantity: number | null;
  requestJson: string;
  grantJson: string;
  createdAt: string;
}

export class CustodyResponseIntentError extends Error {
  constructor(public readonly code: string) {
    super(code);
    this.name = 'CustodyResponseIntentError';
  }
}

const fail = (code: string): never => {
  throw new CustodyResponseIntentError(code);
};

const validTimestamp = (value: string): boolean => Number.isFinite(Date.parse(value));

const assertNewIntent = (input: NewCustodyResponseIntent): void => {
  if (
    !UUID_V4.test(input.responseId)
    || !UUID_V4.test(input.grantId)
    || !Number.isSafeInteger(input.responderUserId)
    || input.responderUserId <= 0
    || !['assessing', 'support_available'].includes(input.disposition)
    || !(input.quantity === null || (Number.isFinite(input.quantity) && input.quantity > 0))
    || (input.disposition === 'assessing' && input.quantity !== null)
    || input.requestJson.length === 0
    || input.grantJson.length === 0
    || !validTimestamp(input.createdAt)
  ) fail('CUSTODY_RESPONSE_INTENT_INVALID');
};

const sameCommand = (
  row: CivicCustodyResponseIntentRow,
  input: NewCustodyResponseIntent,
): boolean => row.responderUserId === input.responderUserId
  && row.grantId === input.grantId
  && row.disposition === input.disposition
  && row.quantity === input.quantity
  && row.requestJson === input.requestJson;

const accountGrantWhere = (responderUserId: number, grantId: string) => and(
  eq(civicCustodyResponseIntents.responderUserId, responderUserId),
  eq(civicCustodyResponseIntents.grantId, grantId),
);

/** Devuelve únicamente comandos de la cuenta indicada; nunca cruza sesiones. */
export const listCustodyResponseIntents = (
  responderUserId: number,
  database: CustodyResponseIntentDatabase = db,
): CivicCustodyResponseIntentRow[] => {
  if (!Number.isSafeInteger(responderUserId) || responderUserId <= 0) {
    return fail('CUSTODY_RESPONSE_INTENT_ACCOUNT_INVALID');
  }
  return database.select().from(civicCustodyResponseIntents)
    .where(eq(civicCustodyResponseIntents.responderUserId, responderUserId)).all();
};

export const findCustodyResponseIntent = (
  responderUserId: number,
  grantId: string,
  database: CustodyResponseIntentDatabase = db,
): CivicCustodyResponseIntentRow | null => {
  if (
    !Number.isSafeInteger(responderUserId)
    || responderUserId <= 0
    || !UUID_V4.test(grantId)
  ) return fail('CUSTODY_RESPONSE_INTENT_LOOKUP_INVALID');
  return database.select().from(civicCustodyResponseIntents)
    .where(accountGrantWhere(responderUserId, grantId)).get() ?? null;
};

/**
 * Reserva una identidad antes del HTTP. La unicidad cuenta+grant resuelve una
 * carrera local: si ya existe un comando, sólo puede reutilizarse si el cuerpo
 * exacto coincide. El snapshot original nunca se sustituye silenciosamente.
 */
export const reserveCustodyResponseIntent = (
  input: NewCustodyResponseIntent,
  database: CustodyResponseIntentDatabase = db,
): CivicCustodyResponseIntentRow => {
  assertNewIntent(input);
  const current = findCustodyResponseIntent(input.responderUserId, input.grantId, database);
  if (current) {
    if (!sameCommand(current, input)) return fail('CUSTODY_RESPONSE_INTENT_PENDING_CONFLICT');
    return current;
  }

  database.insert(civicCustodyResponseIntents).values({
    ...input,
    lastAttemptAt: null,
  }).onConflictDoNothing().run();
  const authoritative = findCustodyResponseIntent(input.responderUserId, input.grantId, database);
  if (!authoritative || !sameCommand(authoritative, input)) {
    return fail('CUSTODY_RESPONSE_INTENT_PENDING_CONFLICT');
  }
  return authoritative;
};

export const markCustodyResponseIntentAttempt = (
  intent: CivicCustodyResponseIntentRow,
  attemptedAt: string,
  database: CustodyResponseIntentDatabase = db,
): CivicCustodyResponseIntentRow => {
  if (!validTimestamp(attemptedAt)) return fail('CUSTODY_RESPONSE_INTENT_INVALID');
  database.update(civicCustodyResponseIntents).set({ lastAttemptAt: attemptedAt }).where(and(
    eq(civicCustodyResponseIntents.responseId, intent.responseId),
    accountGrantWhere(intent.responderUserId, intent.grantId),
  )).run();
  const updated = findCustodyResponseIntent(intent.responderUserId, intent.grantId, database);
  if (!updated || updated.responseId !== intent.responseId) {
    return fail('CUSTODY_RESPONSE_INTENT_PENDING_CONFLICT');
  }
  return updated;
};

/** Sólo debe invocarse después de validar el recibo remoto contra el snapshot. */
export const clearVerifiedCustodyResponseIntent = (
  intent: CivicCustodyResponseIntentRow,
  database: CustodyResponseIntentDatabase = db,
): boolean => database.delete(civicCustodyResponseIntents).where(and(
  eq(civicCustodyResponseIntents.responseId, intent.responseId),
  accountGrantWhere(intent.responderUserId, intent.grantId),
  eq(civicCustodyResponseIntents.requestJson, intent.requestJson),
)).run().changes > 0;
