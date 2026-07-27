import { and, desc, eq } from 'drizzle-orm';

import { db, type DBExecutor } from '@/db/client';
import {
  civicDisclosureReceipts,
  civicMatches,
  civicNeedAccessGrants,
  civicNeedCustodies,
  civicNeeds,
  civicRecordContexts,
  syncOutbox,
} from '@/db/schema';
import type { CivicNeedAccessGrantRow, CivicNeedRow } from '@/db/schema';
import { ahoraISO, nuevoId } from '@/db/repos';

import type {
  LocationPrecision,
  NeedGrantPurpose,
  NeedGrantRecipientKind,
  NeedGrantRevocationReason,
  NeedGrantScope,
  NeedGrantStatus,
} from './types';

export const NEED_GRANT_POLICY_VERSION = 1;

export const NEED_GRANT_RECIPIENTS: readonly {
  key: NeedGrantRecipientKind;
  label: string;
  detail: string;
}[] = [
  { key: 'circle', label: 'Círculo', detail: 'Permiso offline; una entrega futura deberá resolver un ID numérico verificable.' },
  { key: 'organization', label: 'Organización', detail: 'Deja constancia offline; todavía no existe un canal verificable para entregarla.' },
];

export const NEED_GRANT_SCOPES: readonly {
  key: NeedGrantScope;
  label: string;
  detail: string;
}[] = [
  {
    key: 'essentials',
    label: 'Sólo lo esencial',
    detail: 'Categoría, cantidad segura, urgencia y vigencia. Sin ubicación.',
  },
  {
    key: 'essentials_and_safe_area',
    label: 'Esencial + zona segura',
    detail: 'Agrega la coordenada ya aproximada; nunca el punto exacto ni su nombre.',
  },
];

export const NEED_GRANT_PURPOSES: readonly {
  key: NeedGrantPurpose;
  label: string;
  detail: string;
}[] = [
  { key: 'assess_support', label: 'Evaluar capacidad', detail: 'Saber si el destinatario puede responder.' },
  { key: 'coordinate_support', label: 'Coordinar apoyo', detail: 'Preparar responsables, tiempos y recursos.' },
  { key: 'deliver_support', label: 'Entregar apoyo', detail: 'Habilitar sólo lo mínimo para una entrega acordada.' },
];

export const NEED_GRANT_REVOCATION_REASONS: readonly {
  key: NeedGrantRevocationReason;
  label: string;
}[] = [
  { key: 'custodian_decision', label: 'Decisión de quien custodia' },
  { key: 'recipient_changed', label: 'Cambiar destinatario' },
  { key: 'purpose_complete', label: 'Propósito cumplido' },
  { key: 'safety_concern', label: 'Riesgo o duda de seguridad' },
];

/** Motivo asentado por reconciliación; el response no revela quién cerró. */
export const NEED_GRANT_REMOTE_CLOSED_REASON: NeedGrantRevocationReason = 'remote_closed';

const ALLOWED_CATEGORIES = new Set([
  'food',
  'housing',
  'work',
  'care',
  'health',
  'education',
  'environment',
  'mobility',
  'safety',
  'culture',
  'democracy',
]);

/**
 * Una unidad es texto libre en el borrador privado. Sólo atraviesa el grant
 * si coincide con este vocabulario; una dirección o teléfono nunca se copia.
 */
export type NeedGrantUnitCode =
  | 'people'
  | 'meals'
  | 'units'
  | 'hours'
  | 'kilograms'
  | 'liters'
  | 'trips'
  | 'days'
  | 'beds'
  | 'kits';

const SAFE_UNITS = new Map<string, NeedGrantUnitCode>([
  ['persona', 'people'],
  ['personas', 'people'],
  ['unidad', 'units'],
  ['unidades', 'units'],
  ['ración', 'meals'],
  ['raciones', 'meals'],
  ['hora', 'hours'],
  ['horas', 'hours'],
  ['día', 'days'],
  ['días', 'days'],
  ['cama', 'beds'],
  ['camas', 'beds'],
  ['kit', 'kits'],
  ['kits', 'kits'],
  ['kg', 'kilograms'],
  ['kilo', 'kilograms'],
  ['kilos', 'kilograms'],
  ['litro', 'liters'],
  ['litros', 'liters'],
  ['traslado', 'trips'],
  ['traslados', 'trips'],
]);

// El canal destinatario nunca recibe granularidad inferior a 500 m.
const SAFE_PRECISIONS = new Set<LocationPrecision>(['500m', 'neighborhood', 'city']);
const RECIPIENT_REFERENCE = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,63}$/;

const validTimestamp = (value: string | null | undefined): number | null => {
  if (!value) return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const finiteCoordinate = (value: number | null): value is number =>
  typeof value === 'number' && Number.isFinite(value);

export const normalizeNeedGrantUnit = (value: string | null): NeedGrantUnitCode | null => {
  if (!value) return null;
  return SAFE_UNITS.get(value.trim().toLocaleLowerCase('es-AR')) ?? null;
};

export interface NormalizedNeedGrantRecipient {
  kind: NeedGrantRecipientKind;
  key: string;
  label: string;
  reference: string;
}

export const normalizeNeedGrantRecipient = (input: {
  kind: NeedGrantRecipientKind;
  reference: string;
  label: string;
}): NormalizedNeedGrantRecipient => {
  if (input.kind !== 'circle' && input.kind !== 'organization') {
    throw new Error('need_grant_recipient_kind_invalid');
  }
  const reference = input.reference.trim();
  if (!RECIPIENT_REFERENCE.test(reference)) {
    throw new Error('need_grant_recipient_reference_invalid');
  }
  const label = input.label.trim().replace(/\s+/g, ' ').slice(0, 80);
  const digitCount = label.replace(/\D/g, '').length;
  if (
    label.length < 2
    || label.includes('@')
    || /(?:https?:\/\/|www\.)/i.test(label)
    || digitCount >= 7
  ) {
    throw new Error('need_grant_recipient_label_unsafe');
  }
  return {
    kind: input.kind,
    reference,
    key: `${input.kind}:${reference.toLocaleLowerCase('en-US')}`,
    label,
  };
};

export interface NeedGrantProjectionV1 {
  schema: 'basta.need-grant.v1';
  policyVersion: 1;
  grantId: string;
  recipient: {
    kind: NeedGrantRecipientKind;
    key: string;
  };
  purpose: NeedGrantPurpose;
  scope: NeedGrantScope;
  need: {
    category: string;
    quantity?: number;
    unitCode?: NeedGrantUnitCode;
    urgency: number;
    expiresAt: string;
    safeArea?: {
      lat: number;
      lng: number;
      precision: Exclude<LocationPrecision, 'exact'>;
    };
  };
}

export interface BuiltNeedGrantProjection {
  projection: NeedGrantProjectionV1;
  authorizedFields: string[];
}

/**
 * Constructor por lista permitida. Aunque el objeto recibido contenga relato,
 * custodia, contacto o etiquetas, la salida sólo puede tener estas claves.
 */
export const buildNeedGrantProjection = (input: {
  grantId: string;
  recipient: Pick<NormalizedNeedGrantRecipient, 'kind' | 'key'>;
  purpose: NeedGrantPurpose;
  scope: NeedGrantScope;
  need: Pick<CivicNeedRow,
    'category' | 'quantity' | 'unit' | 'urgency' | 'expiresAt' | 'publicLat' | 'publicLng' | 'publicPrecision'>;
}): BuiltNeedGrantProjection => {
  if (!ALLOWED_CATEGORIES.has(input.need.category)) {
    throw new Error('need_grant_category_not_allowed');
  }
  if (!NEED_GRANT_PURPOSES.some((item) => item.key === input.purpose)) {
    throw new Error('need_grant_purpose_invalid');
  }
  if (!NEED_GRANT_SCOPES.some((item) => item.key === input.scope)) {
    throw new Error('need_grant_scope_invalid');
  }
  if (validTimestamp(input.need.expiresAt) == null) {
    throw new Error('need_grant_need_expiry_invalid');
  }

  const quantity = typeof input.need.quantity === 'number'
    && Number.isFinite(input.need.quantity)
    && input.need.quantity > 0
    && input.need.quantity <= 1_000_000
    ? input.need.quantity
    : null;
  const unit = normalizeNeedGrantUnit(input.need.unit);
  const need: NeedGrantProjectionV1['need'] = {
    category: input.need.category,
    urgency: Math.max(1, Math.min(5, Math.round(input.need.urgency))),
    expiresAt: input.need.expiresAt!,
  };
  const authorizedFields = ['category', 'urgency', 'expiresAt'];
  if (quantity != null) {
    need.quantity = quantity;
    authorizedFields.push('quantity');
  }
  if (unit != null && quantity != null) {
    need.unitCode = unit;
    authorizedFields.push('unitCode');
  }

  if (input.scope === 'essentials_and_safe_area') {
    const precision = input.need.publicPrecision;
    if (
      !SAFE_PRECISIONS.has(precision)
      || !finiteCoordinate(input.need.publicLat)
      || !finiteCoordinate(input.need.publicLng)
      || input.need.publicLat < -90
      || input.need.publicLat > 90
      || input.need.publicLng < -180
      || input.need.publicLng > 180
    ) {
      throw new Error('need_grant_safe_area_unavailable');
    }
    need.safeArea = {
      lat: input.need.publicLat,
      lng: input.need.publicLng,
      precision: precision as Exclude<LocationPrecision, 'exact'>,
    };
    authorizedFields.push('safeArea.lat', 'safeArea.lng', 'safeArea.precision');
  }

  return {
    projection: {
      schema: 'basta.need-grant.v1',
      policyVersion: NEED_GRANT_POLICY_VERSION,
      grantId: input.grantId,
      recipient: input.recipient,
      purpose: input.purpose,
      scope: input.scope,
      need,
    },
    authorizedFields,
  };
};

/**
 * Estado de vigencia local para la UX y para impedir nuevas entregas. No es
 * evidencia de cierre remoto: un reloj adelantado puede devolver `expired`
 * mientras el servidor todavía considera operativo el grant.
 */
export const needGrantStatusAt = (
  grant: Pick<CivicNeedAccessGrantRow, 'status' | 'expiresAt'>,
  now = ahoraISO(),
): NeedGrantStatus => {
  if (grant.status !== 'active') return grant.status;
  const expiresAt = validTimestamp(grant.expiresAt);
  const current = validTimestamp(now);
  return expiresAt == null || current == null || expiresAt <= current ? 'expired' : 'active';
};

const grantExpiry = (now: string, days: number, needExpiresAt: string | null): string => {
  const nowMs = validTimestamp(now);
  const needExpiryMs = validTimestamp(needExpiresAt);
  if (nowMs == null || needExpiryMs == null || needExpiryMs <= nowMs) {
    throw new Error('need_grant_need_expired');
  }
  const boundedDays = Math.max(1, Math.min(30, Math.round(days)));
  return new Date(Math.min(nowMs + boundedDays * 86_400_000, needExpiryMs)).toISOString();
};

export interface GrantCustodiedNeedAccessInput {
  needId: string;
  recipientKind: NeedGrantRecipientKind;
  recipientReference: string;
  recipientLabel: string;
  scope: NeedGrantScope;
  purpose: NeedGrantPurpose;
  expiresInDays: number;
  now?: string;
  database?: DBExecutor;
}

const grantCustodiedNeedAccessIn = (
  input: GrantCustodiedNeedAccessInput,
  database: DBExecutor,
): CivicNeedAccessGrantRow => {
  const now = input.now ?? ahoraISO();
  const recipient = normalizeNeedGrantRecipient({
    kind: input.recipientKind,
    reference: input.recipientReference,
    label: input.recipientLabel,
  });
  const need = database.select().from(civicNeeds).where(eq(civicNeeds.id, input.needId)).get() ?? null;
  const custody = database.select().from(civicNeedCustodies)
    .where(eq(civicNeedCustodies.needId, input.needId)).get() ?? null;
  const context = database.select().from(civicRecordContexts).where(and(
    eq(civicRecordContexts.entityType, 'need'),
    eq(civicRecordContexts.entityId, input.needId),
  )).get() ?? null;

  if (
    !need?.ownedByMe
    || need.status !== 'draft'
    || need.description != null
    || need.contactConsent
    || !custody
    || custody.status !== 'active'
    || context?.audience !== 'private'
  ) {
    throw new Error('need_grant_private_custody_required');
  }

  const disclosed = database.select().from(civicDisclosureReceipts).where(and(
    eq(civicDisclosureReceipts.entityType, 'need'),
    eq(civicDisclosureReceipts.entityId, input.needId),
  )).get();
  const queued = database.select().from(syncOutbox).where(and(
    eq(syncOutbox.entityType, 'need'),
    eq(syncOutbox.entityId, input.needId),
  )).get();
  const connected = database.select().from(civicMatches)
    .where(eq(civicMatches.needId, input.needId)).get();
  if (disclosed || queued || connected) throw new Error('need_grant_collective_state_detected');

  const previousActive = database.select().from(civicNeedAccessGrants).where(and(
    eq(civicNeedAccessGrants.needId, input.needId),
    eq(civicNeedAccessGrants.status, 'active'),
  )).all();
  for (const previous of previousActive) {
    if (needGrantStatusAt(previous, now) === 'active') {
      throw new Error('need_grant_active_recipient_exists');
    }
    database.update(civicNeedAccessGrants).set({ status: 'expired', updatedAt: now })
      .where(eq(civicNeedAccessGrants.id, previous.id)).run();
  }

  const expiresAt = grantExpiry(now, input.expiresInDays, need.expiresAt);
  const id = nuevoId();
  const built = buildNeedGrantProjection({
    grantId: id,
    recipient,
    purpose: input.purpose,
    scope: input.scope,
    need,
  });
  const row: CivicNeedAccessGrantRow = {
    id,
    needId: need.id,
    recipientKind: recipient.kind,
    recipientKey: recipient.key,
    recipientLabel: recipient.label,
    scope: input.scope,
    purpose: input.purpose,
    authorizedFieldsJson: JSON.stringify(built.authorizedFields),
    projectionJson: JSON.stringify(built.projection),
    policyVersion: NEED_GRANT_POLICY_VERSION,
    status: 'active',
    expiresAt,
    grantedAt: now,
    revokedAt: null,
    revocationReason: null,
    deliveryStatus: 'local',
    remoteRecipientCircleId: null,
    remoteGrantorUserId: null,
    deliveredAt: null,
    remoteRevokedAt: null,
    deliveryLastAttemptAt: null,
    deliveryLastError: null,
    remoteResponseDisposition: null,
    remoteResponseQuantity: null,
    remoteResponseUnit: null,
    remoteResponseAt: null,
    remoteCoordinationProposalId: null,
    remoteCoordinationState: null,
    remoteCoordinationTerminalDecision: null,
    remoteCoordinationQuantity: null,
    remoteCoordinationUnit: null,
    remoteCoordinationCreatedAt: null,
    remoteCoordinationExpiresAt: null,
    remoteCoordinationDecidedAt: null,
    remoteCoordinationRefreshedAt: null,
    remoteExecutionJson: null,
    remoteExecutionObservedAt: null,
    createdAt: now,
    updatedAt: now,
  };
  database.insert(civicNeedAccessGrants).values(row).run();
  return row;
};

/**
 * Crea sólo una ACL local. No registra divulgación colectiva, no cambia la
 * audiencia del pedido y no encola ninguna operación de red.
 */
export const grantCustodiedNeedAccess = (
  input: GrantCustodiedNeedAccessInput,
): CivicNeedAccessGrantRow => {
  if (input.database) return grantCustodiedNeedAccessIn(input, input.database);
  return db.transaction((tx) => grantCustodiedNeedAccessIn(input, tx));
};

export const needAccessGrantsForNeed = (needId: string): CivicNeedAccessGrantRow[] =>
  db.select().from(civicNeedAccessGrants)
    .where(eq(civicNeedAccessGrants.needId, needId))
    .orderBy(desc(civicNeedAccessGrants.grantedAt)).all();

export interface RevokeCustodiedNeedAccessInput {
  grantId: string;
  reason: NeedGrantRevocationReason;
  now?: string;
  database?: DBExecutor;
}

const revokeCustodiedNeedAccessIn = (
  input: RevokeCustodiedNeedAccessInput,
  database: DBExecutor,
): CivicNeedAccessGrantRow => {
  if (
    input.reason !== NEED_GRANT_REMOTE_CLOSED_REASON
    && !NEED_GRANT_REVOCATION_REASONS.some((item) => item.key === input.reason)
  ) {
    throw new Error('need_grant_revocation_reason_invalid');
  }
  const now = input.now ?? ahoraISO();
  const current = database.select().from(civicNeedAccessGrants)
    .where(eq(civicNeedAccessGrants.id, input.grantId)).get() ?? null;
  if (!current) throw new Error('need_grant_not_found');
  if (current.status === 'revoked') return current;
  if (needGrantStatusAt(current, now) === 'expired') {
    const expired = { ...current, status: 'expired' as const, updatedAt: now };
    database.update(civicNeedAccessGrants).set({ status: 'expired', updatedAt: now })
      .where(eq(civicNeedAccessGrants.id, current.id)).run();
    return expired;
  }
  if (current.status !== 'active') throw new Error('need_grant_not_active');
  const revoked: CivicNeedAccessGrantRow = {
    ...current,
    status: 'revoked',
    revokedAt: now,
    revocationReason: input.reason,
    updatedAt: now,
  };
  database.update(civicNeedAccessGrants).set({
    status: revoked.status,
    revokedAt: revoked.revokedAt,
    revocationReason: revoked.revocationReason,
    updatedAt: now,
  }).where(eq(civicNeedAccessGrants.id, current.id)).run();
  return revoked;
};

export const revokeCustodiedNeedAccess = (
  input: RevokeCustodiedNeedAccessInput,
): CivicNeedAccessGrantRow => {
  if (input.database) return revokeCustodiedNeedAccessIn(input, input.database);
  return db.transaction((tx) => revokeCustodiedNeedAccessIn(input, tx));
};
