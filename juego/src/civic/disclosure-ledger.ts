import { and, desc, eq } from 'drizzle-orm';

import { db, type DBExecutor } from '@/db/client';
import { ahoraISO, nuevoId } from '@/db/repos';
import { civicDisclosureReceipts } from '@/db/schema';
import type { CivicDisclosureReceiptRow } from '@/db/schema';

import {
  buildRevocationReceipt,
  CURRENT_DISCLOSURE_POLICY_VERSION,
  disclosedFieldPaths,
  parseAuthorizedFields,
} from './disclosure-receipt';
import type {
  AttributionMode,
  CivicAudience,
  CivicDisclosureEntity,
  LocationPrecision,
} from './types';

export interface AppendDisclosureReceiptInput {
  disclosureKey: string;
  entityType: CivicDisclosureEntity;
  entityId: string;
  payload: Record<string, unknown>;
  audience: CivicAudience;
  sharedPrecision: LocationPrecision;
  attributionMode: AttributionMode;
  attributionName?: string | null;
  purpose: string;
  policyVersion?: number;
  recordedAt?: string;
}

/**
 * Única escritura permitida para una divulgación. La clave es la misma del
 * outbox: reintentar el mismo evento devuelve el recibo original sin mutarlo.
 */
export const appendDisclosureReceipt = (
  input: AppendDisclosureReceiptInput,
  database: DBExecutor = db,
): CivicDisclosureReceiptRow => {
  const authorizedFieldsJson = JSON.stringify(disclosedFieldPaths(input.payload));
  const attributionName = input.attributionMode === 'anonymous'
    ? null
    : input.attributionName?.trim().slice(0, 80) || null;
  const purpose = input.purpose.trim().slice(0, 500) || 'Registrar una divulgación territorial.';
  const policyVersion = Math.max(1, Math.round(input.policyVersion ?? CURRENT_DISCLOSURE_POLICY_VERSION));
  const existing = database.select().from(civicDisclosureReceipts)
    .where(eq(civicDisclosureReceipts.disclosureKey, input.disclosureKey)).get();
  if (existing) {
    if (
      existing.kind !== 'disclosure'
      || existing.entityType !== input.entityType
      || existing.entityId !== input.entityId
      || existing.audience !== input.audience
      || existing.authorizedFieldsJson !== authorizedFieldsJson
      || existing.sharedPrecision !== input.sharedPrecision
      || existing.attributionMode !== input.attributionMode
      || existing.attributionName !== attributionName
      || existing.purpose !== purpose
      || existing.policyVersion !== policyVersion
    ) throw new Error('disclosure_idempotency_conflict');
    return existing;
  }

  const row: CivicDisclosureReceiptRow = {
    id: nuevoId(),
    disclosureKey: input.disclosureKey,
    kind: 'disclosure',
    entityType: input.entityType,
    entityId: input.entityId,
    revokesReceiptId: null,
    audience: input.audience,
    authorizedFieldsJson,
    sharedPrecision: input.sharedPrecision,
    attributionMode: input.attributionMode,
    attributionName,
    purpose,
    policyVersion,
    recordedAt: input.recordedAt ?? ahoraISO(),
  };
  database.insert(civicDisclosureReceipts).values(row).run();
  return row;
};

export const disclosureReceiptById = (
  id: string,
  database: DBExecutor = db,
): CivicDisclosureReceiptRow | null =>
  database.select().from(civicDisclosureReceipts).where(eq(civicDisclosureReceipts.id, id)).get() ?? null;

export const disclosureReceiptsAll = (): CivicDisclosureReceiptRow[] =>
  db.select().from(civicDisclosureReceipts).orderBy(desc(civicDisclosureReceipts.recordedAt)).all();

export const disclosureReceiptsFor = (
  entityType: CivicDisclosureEntity,
  entityId: string,
  database: DBExecutor = db,
): CivicDisclosureReceiptRow[] => database.select().from(civicDisclosureReceipts).where(and(
  eq(civicDisclosureReceipts.entityType, entityType),
  eq(civicDisclosureReceipts.entityId, entityId),
)).orderBy(desc(civicDisclosureReceipts.recordedAt)).all();

export const authorizedFieldsForReceipt = (receipt: CivicDisclosureReceiptRow): string[] =>
  parseAuthorizedFields(receipt.authorizedFieldsJson);

/** Una revocación es un asiento nuevo; nunca actualiza ni borra el original. */
export const appendDisclosureRevocation = (input: {
  receiptId: string;
  purpose: string;
  policyVersion?: number;
  disclosureKey?: string;
  recordedAt?: string;
}, database: DBExecutor = db): CivicDisclosureReceiptRow => {
  const source = disclosureReceiptById(input.receiptId, database);
  if (!source) throw new Error('disclosure_receipt_not_found');
  const disclosureKey = input.disclosureKey ?? `revocation:${source.id}:${nuevoId()}`;
  const purpose = input.purpose.trim().slice(0, 500) || 'Revocar la divulgación registrada.';
  const policyVersion = Math.max(1, Math.round(input.policyVersion ?? CURRENT_DISCLOSURE_POLICY_VERSION));
  const existing = database.select().from(civicDisclosureReceipts)
    .where(eq(civicDisclosureReceipts.disclosureKey, disclosureKey)).get();
  if (existing) {
    if (
      existing.kind !== 'revocation'
      || existing.revokesReceiptId !== source.id
      || existing.entityType !== source.entityType
      || existing.entityId !== source.entityId
      || existing.purpose !== purpose
      || existing.policyVersion !== policyVersion
    ) throw new Error('disclosure_revocation_idempotency_conflict');
    return existing;
  }
  const row = buildRevocationReceipt(source, {
    id: nuevoId(),
    disclosureKey,
    purpose,
    policyVersion,
    recordedAt: input.recordedAt ?? ahoraISO(),
  });
  database.insert(civicDisclosureReceipts).values(row).run();
  return row;
};
