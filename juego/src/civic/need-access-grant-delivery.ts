import { and, eq, isNull } from 'drizzle-orm';

import {
  db,
  flushWebDatabaseSnapshot,
  readPersistedWebTableRowsForSafety,
} from '@/db/client';
import { civicNeedAccessGrants } from '@/db/schema';
import type { CivicNeedAccessGrantRow } from '@/db/schema';
import { ahoraISO } from '@/db/repos';

import {
  CommunityApiError,
  communityErrorFromResponse,
  communityFetchForUser,
  getCommunitySession,
} from './community-auth';
import { CIVIC_API_URL } from './config';
import { ensureCivicDeviceToken } from './device-auth';
import {
  NEED_GRANT_PURPOSES,
  NEED_GRANT_REMOTE_CLOSED_REASON,
  NEED_GRANT_REVOCATION_REASONS,
  NEED_GRANT_SCOPES,
  needGrantStatusAt,
  revokeCustodiedNeedAccess,
  type NeedGrantProjectionV1,
  type NeedGrantUnitCode,
} from './need-access-grants';
import type { NeedGrantRevocationReason } from './types';

const CONTRACT = 'basta-civic-custody-grants/v1';
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SHA256_HEX = /^[0-9a-f]{64}$/;
const CIRCLE_KEY = /^circle:([1-9][0-9]*)$/;
const SAFE_ERROR_CODE = /^[A-Z][A-Z0-9_:-]{0,79}$/;
const CATEGORIES = new Set([
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
const UNIT_CODES = new Set<NeedGrantUnitCode>([
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
]);
const LOCATION_PRECISIONS = new Set(['500m', 'neighborhood', 'city']);
const NEED_GRANT_REMOTE_OPERATION_LOCK = 'basta-need-grant-remote-operation-v1';

const withNeedGrantRemoteOperationLock = async <T>(
  mode: 'shared' | 'exclusive',
  work: () => Promise<T>,
): Promise<T> => {
  if (
    typeof navigator !== 'undefined'
    && navigator.locks?.request
  ) {
    return navigator.locks.request(NEED_GRANT_REMOTE_OPERATION_LOCK, { mode }, work);
  }
  return work();
};

/** El borrado toma exclusividad frente a entregas/retiros de otras pestañas. */
export const withNeedGrantSafeLocalEraseLock = <T>(work: () => Promise<T>): Promise<T> =>
  withNeedGrantRemoteOperationLock('exclusive', work);

export class NeedGrantDeliveryError extends Error {
  constructor(public readonly code: string, message = code) {
    super(message);
    this.name = 'NeedGrantDeliveryError';
  }
}

const fail = (code: string): never => {
  throw new NeedGrantDeliveryError(code);
};

const record = (value: unknown): Record<string, unknown> | null =>
  value != null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;

const exactKeys = (value: Record<string, unknown>, allowed: readonly string[]): boolean => {
  const keys = Object.keys(value);
  return keys.length === allowed.length && keys.every((key) => allowed.includes(key));
};

const subsetKeys = (value: Record<string, unknown>, allowed: readonly string[]): boolean =>
  Object.keys(value).every((key) => allowed.includes(key));

const finiteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const validDate = (value: unknown): value is string =>
  typeof value === 'string' && Number.isFinite(Date.parse(value));

const uuidV4 = (value: unknown): value is string =>
  typeof value === 'string' && UUID_V4.test(value);

const safeCode = (error: unknown): string => {
  const candidate = error instanceof NeedGrantDeliveryError || error instanceof CommunityApiError
    ? error.code
    : error instanceof Error && error.message.startsWith('civic_device_')
      ? error.message.replace(/[^A-Za-z0-9_:-]/g, '_').toUpperCase()
      : 'CUSTODY_NETWORK_OR_RESPONSE_FAILED';
  return SAFE_ERROR_CODE.test(candidate) ? candidate : 'CUSTODY_NETWORK_OR_RESPONSE_FAILED';
};

const circleIdFromKey = (key: string): number => {
  const match = CIRCLE_KEY.exec(key);
  if (!match) return fail('NEED_GRANT_VERIFIED_CIRCLE_REQUIRED');
  const id = Number(match[1]);
  if (!Number.isSafeInteger(id) || id <= 0) return fail('NEED_GRANT_VERIFIED_CIRCLE_REQUIRED');
  return id;
};

export interface CustodyGrantDeliveryRequest {
  grantId: string;
  needId: string;
  recipient: { type: 'circle'; id: number };
  expiresAt: string;
  need: {
    category: string;
    urgency: number;
    quantity?: number;
    unit?: NeedGrantUnitCode;
    location?: {
      lat: number;
      lng: number;
      precision: '500m' | 'neighborhood' | 'city';
    };
  };
}

/**
 * Reconstruye el request exclusivamente desde la proyección congelada y una
 * lista permitida. Si SQLite fue alterado o contiene texto inesperado, falla
 * cerrado antes de tocar la red.
 */
export const buildCustodyGrantDeliveryRequest = (
  grant: CivicNeedAccessGrantRow,
): CustodyGrantDeliveryRequest => {
  if (!uuidV4(grant.id) || !uuidV4(grant.needId)) return fail('NEED_GRANT_ID_INVALID');
  if (grant.recipientKind !== 'circle') return fail('NEED_GRANT_VERIFIED_CIRCLE_REQUIRED');
  const circleId = circleIdFromKey(grant.recipientKey);
  if (!validDate(grant.expiresAt)) return fail('NEED_GRANT_EXPIRY_INVALID');

  let parsed: unknown;
  try {
    parsed = JSON.parse(grant.projectionJson) as unknown;
  } catch {
    return fail('NEED_GRANT_PROJECTION_INVALID');
  }
  const projection = record(parsed);
  if (!projection || !exactKeys(projection, [
    'schema',
    'policyVersion',
    'grantId',
    'recipient',
    'purpose',
    'scope',
    'need',
  ])) return fail('NEED_GRANT_PROJECTION_INVALID');
  if (
    projection.schema !== 'basta.need-grant.v1'
    || projection.policyVersion !== 1
    || projection.grantId !== grant.id
    || !NEED_GRANT_PURPOSES.some((item) => item.key === projection.purpose)
    || !NEED_GRANT_SCOPES.some((item) => item.key === projection.scope)
  ) return fail('NEED_GRANT_PROJECTION_INVALID');

  const recipient = record(projection.recipient);
  if (
    !recipient
    || !exactKeys(recipient, ['kind', 'key'])
    || recipient.kind !== 'circle'
    || recipient.key !== grant.recipientKey
  ) return fail('NEED_GRANT_PROJECTION_INVALID');

  const projectedNeed = record(projection.need);
  if (!projectedNeed || !subsetKeys(projectedNeed, [
    'category',
    'quantity',
    'unitCode',
    'urgency',
    'expiresAt',
    'safeArea',
  ])) return fail('NEED_GRANT_PROJECTION_INVALID');
  if (
    typeof projectedNeed.category !== 'string'
    || !CATEGORIES.has(projectedNeed.category)
    || !Number.isInteger(projectedNeed.urgency)
    || !finiteNumber(projectedNeed.urgency)
    || projectedNeed.urgency < 1
    || projectedNeed.urgency > 5
    || !validDate(projectedNeed.expiresAt)
  ) return fail('NEED_GRANT_PROJECTION_INVALID');

  const need: CustodyGrantDeliveryRequest['need'] = {
    category: projectedNeed.category,
    urgency: projectedNeed.urgency,
  };
  if ('quantity' in projectedNeed) {
    if (
      !finiteNumber(projectedNeed.quantity)
      || projectedNeed.quantity <= 0
      || projectedNeed.quantity > 1_000_000
    ) return fail('NEED_GRANT_PROJECTION_INVALID');
    need.quantity = projectedNeed.quantity;
  }
  if ('unitCode' in projectedNeed) {
    if (
      typeof projectedNeed.unitCode !== 'string'
      || !UNIT_CODES.has(projectedNeed.unitCode as NeedGrantUnitCode)
      || need.quantity == null
    ) return fail('NEED_GRANT_PROJECTION_INVALID');
    need.unit = projectedNeed.unitCode as NeedGrantUnitCode;
  }
  if ('safeArea' in projectedNeed) {
    const area = record(projectedNeed.safeArea);
    if (
      !area
      || !exactKeys(area, ['lat', 'lng', 'precision'])
      || !finiteNumber(area.lat)
      || area.lat < -90
      || area.lat > 90
      || !finiteNumber(area.lng)
      || area.lng < -180
      || area.lng > 180
      || typeof area.precision !== 'string'
      || !LOCATION_PRECISIONS.has(area.precision)
    ) return fail('NEED_GRANT_PROJECTION_INVALID');
    need.location = {
      lat: area.lat,
      lng: area.lng,
      precision: area.precision as '500m' | 'neighborhood' | 'city',
    };
  }

  return {
    grantId: grant.id.toLowerCase(),
    needId: grant.needId.toLowerCase(),
    recipient: { type: 'circle', id: circleId },
    expiresAt: new Date(grant.expiresAt).toISOString(),
    need,
  };
};

interface DeliveryReceipt {
  status: 'accepted' | 'duplicate';
  createdAt: string;
  state: 'active' | 'expired' | 'revoked' | 'closed';
  response: CustodyGrantRemoteResponse | null;
}

export interface CustodyGrantRemoteResponse {
  disposition: 'assessing' | 'support_available';
  quantity: number | null;
  unit: NeedGrantUnitCode | null;
  /** Presente en toda constancia remota; no se conserva aún en SQLite. */
  responseVersion?: string;
  recordedAt: string;
}

const parseRemoteResponse = (
  value: unknown,
  expectedNeed: CustodyGrantDeliveryRequest['need'],
): CustodyGrantRemoteResponse | null => {
  if (value === null) return null;
  const response = record(value);
  if (
    !response
    || !exactKeys(response, ['disposition', 'quantity', 'unit', 'responseVersion', 'recordedAt'])
    || !['assessing', 'support_available'].includes(String(response.disposition))
    || typeof response.responseVersion !== 'string'
    || !SHA256_HEX.test(response.responseVersion)
    || !validDate(response.recordedAt)
  ) return fail('CUSTODY_DELIVERY_RECEIPT_INVALID');
  if (response.disposition === 'assessing') {
    if (response.quantity !== null || response.unit !== null) {
      return fail('CUSTODY_DELIVERY_RECEIPT_INVALID');
    }
  } else {
    const noQuantity = response.quantity === null && response.unit === null;
    const comparableQuantity = expectedNeed.quantity != null && expectedNeed.unit != null
      && finiteNumber(response.quantity)
      && response.quantity > 0
      && response.quantity <= expectedNeed.quantity
      && response.unit === expectedNeed.unit;
    if (!noQuantity && !comparableQuantity) return fail('CUSTODY_DELIVERY_RECEIPT_INVALID');
  }
  return {
    disposition: response.disposition as CustodyGrantRemoteResponse['disposition'],
    quantity: response.quantity as number | null,
    unit: response.unit as NeedGrantUnitCode | null,
    responseVersion: response.responseVersion,
    recordedAt: new Date(response.recordedAt).toISOString(),
  };
};

export const parseCustodyGrantDeliveryResponse = (
  value: unknown,
  expected: {
    grantId: string;
    circleId: number;
    expiresAt: string;
    need: CustodyGrantDeliveryRequest['need'];
  },
): DeliveryReceipt => {
  const body = record(value);
  const grant = body ? record(body.grant) : null;
  const recipient = grant ? record(grant.recipient) : null;
  const payload = grant ? record(grant.payload) : null;
  const location = payload ? record(payload.location) : null;
  const expectedLocation = expected.need.location ?? null;
  if (
    !body
    || !exactKeys(body, ['contract', 'status', 'grant'])
    || body.contract !== CONTRACT
    || (body.status !== 'accepted' && body.status !== 'duplicate')
    || !grant
    || !exactKeys(grant, ['grantId', 'recipient', 'payload', 'expiresAt', 'createdAt', 'state', 'response'])
    || grant.grantId !== expected.grantId
    || !['active', 'expired', 'revoked', 'closed'].includes(String(grant.state))
    || (body.status === 'accepted' && grant.state !== 'active')
    || grant.expiresAt !== expected.expiresAt
    || !validDate(grant.createdAt)
    || !recipient
    || !exactKeys(recipient, ['type', 'id'])
    || recipient.type !== 'circle'
    || recipient.id !== expected.circleId
    || !payload
    || !exactKeys(payload, ['category', 'quantity', 'unit', 'urgency', 'location'])
    || payload.category !== expected.need.category
    || payload.quantity !== (expected.need.quantity ?? null)
    || payload.unit !== (expected.need.unit ?? null)
    || payload.urgency !== expected.need.urgency
    || (expectedLocation === null && payload.location !== null)
    || (expectedLocation !== null && (
      !location
      || !exactKeys(location, ['lat', 'lng', 'precision'])
      || location.lat !== expectedLocation.lat
      || location.lng !== expectedLocation.lng
      || location.precision !== expectedLocation.precision
    ))
  ) return fail('CUSTODY_DELIVERY_RECEIPT_INVALID');
  const remoteResponse = parseRemoteResponse(grant.response, expected.need);
  if (remoteResponse && Date.parse(remoteResponse.recordedAt) < Date.parse(grant.createdAt)) {
    return fail('CUSTODY_DELIVERY_RECEIPT_INVALID');
  }
  return {
    status: body.status,
    createdAt: new Date(grant.createdAt).toISOString(),
    state: grant.state as DeliveryReceipt['state'],
    response: remoteResponse,
  };
};

const remoteResponsePatch = (response: CustodyGrantRemoteResponse | null) => ({
  remoteResponseDisposition: response?.disposition ?? null,
  remoteResponseQuantity: response?.quantity ?? null,
  remoteResponseUnit: response?.unit ?? null,
  remoteResponseAt: response?.recordedAt ?? null,
});

const terminalCoordinationPatch = (
  grant: CivicNeedAccessGrantRow,
  state: 'expired' | 'closed',
  refreshedAt: string,
): Partial<CivicNeedAccessGrantRow> => grant.remoteCoordinationProposalId
  ? {
    remoteCoordinationState: state,
    remoteCoordinationRefreshedAt: refreshedAt,
  }
  : {};

interface RevocationReceipt {
  status: 'revoked' | 'duplicate' | 'already_revoked';
  revokedAt: string;
}

export const parseCustodyGrantRevocationResponse = (
  value: unknown,
  expectedGrantId: string,
): RevocationReceipt => {
  const body = record(value);
  if (
    !body
    || !exactKeys(body, ['status', 'grantId', 'revokedAt'])
    || !['revoked', 'duplicate', 'already_revoked'].includes(String(body.status))
    || body.grantId !== expectedGrantId
    || !validDate(body.revokedAt)
  ) return fail('CUSTODY_REVOCATION_RECEIPT_INVALID');
  return {
    status: body.status as RevocationReceipt['status'],
    revokedAt: new Date(body.revokedAt).toISOString(),
  };
};

const grantById = (grantId: string): CivicNeedAccessGrantRow | null =>
  db.select().from(civicNeedAccessGrants)
    .where(eq(civicNeedAccessGrants.id, grantId)).get() ?? null;

const REMOTE_REVOCATION_DEBT = new Set<CivicNeedAccessGrantRow['deliveryStatus']>([
  'delivering',
  'delivered',
  'failed',
  'revocation_pending',
]);

/**
 * Una vez iniciado el transporte, ni el estado ni el vencimiento calculados
 * por el reloj local prueban que el capability remoto haya cerrado. La única
 * salida segura para borrar esta credencial es un acuse remoto que haya dejado
 * la fila en `revoked_remote`.
 */
export const needGrantHasRemoteRevocationDebt = (
  grant: Pick<CivicNeedAccessGrantRow, 'deliveryStatus'>,
): boolean => REMOTE_REVOCATION_DEBT.has(grant.deliveryStatus);

/** Grants que pudieron llegar a la red y todavía necesitan conservar su id
 * local para poder retirarse. Se usa antes de borrar el dispositivo y no
 * confía en `status`, `expiresAt` ni en el reloj de este dispositivo. */
export const pendingNeedGrantRemoteRevocations = (grantorUserId?: number): CivicNeedAccessGrantRow[] =>
  db.select().from(civicNeedAccessGrants).all().filter((grant) => (
    needGrantHasRemoteRevocationDebt(grant)
    && (grantorUserId == null || grant.remoteGrantorUserId === grantorUserId)
  ));

export const countPendingNeedGrantRemoteRevocations = (grantorUserId?: number): number =>
  pendingNeedGrantRemoteRevocations(grantorUserId).length;

/**
 * Cuenta la deuda que ya quedó confirmada en la fotografía IndexedDB común.
 * En nativo SQLite es durable por sí misma y la comprobación local es suficiente.
 */
export const countPersistedWebNeedGrantRemoteRevocations = async (): Promise<number> => {
  const rows = await readPersistedWebTableRowsForSafety('civic_need_access_grants');
  return rows.filter((row) => (
    typeof row.delivery_status === 'string'
    && REMOTE_REVOCATION_DEBT.has(row.delivery_status as CivicNeedAccessGrantRow['deliveryStatus'])
  )).length;
};

/** Última barrera sincrónica antes de destruir filas o credenciales locales. */
export const assertNoPendingNeedGrantRemoteRevocationsBeforeLocalErase = (): void => {
  if (countPendingNeedGrantRemoteRevocations() > 0) {
    return fail('NEED_GRANT_REMOTE_REVOCATION_REQUIRED_BEFORE_LOCAL_ERASE');
  }
};

let localEraseInProgress = false;

const assertNeedGrantDeliveryAllowed = (): void => {
  if (localEraseInProgress) return fail('NEED_GRANT_DELIVERY_BLOCKED_BY_LOCAL_ERASE');
};

/**
 * Cierra la carrera entre el chequeo y un `deliver` que estaba esperando
 * sesión/token. El caller debe liberar el cerrojo en `finally` si la app sigue
 * viva; mientras está tomado, ningún nuevo intento puede alcanzar la red.
 */
export const beginNeedGrantSafeLocalErase = (): (() => void) => {
  if (localEraseInProgress) return fail('NEED_GRANT_LOCAL_ERASE_ALREADY_IN_PROGRESS');
  assertNoPendingNeedGrantRemoteRevocationsBeforeLocalErase();
  localEraseInProgress = true;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    localEraseInProgress = false;
  };
};

const requireGrant = (grantId: string): CivicNeedAccessGrantRow => {
  const grant = grantById(grantId);
  if (!grant) return fail('NEED_GRANT_NOT_FOUND');
  return grant;
};

const markDeliveryFailure = (
  grantId: string,
  code: string,
  now: string,
  priorStatus: CivicNeedAccessGrantRow['deliveryStatus'],
): CivicNeedAccessGrantRow => {
  db.update(civicNeedAccessGrants).set({
    deliveryStatus: priorStatus === 'delivered' ? 'delivered' : 'failed',
    deliveryLastError: code,
    updatedAt: now,
  }).where(and(
    eq(civicNeedAccessGrants.id, grantId),
    eq(civicNeedAccessGrants.deliveryStatus, 'delivering'),
  )).run();
  return requireGrant(grantId);
};

const deliverCustodiedNeedAccessUnlocked = async (
  input: { grantId: string; expectedUserId: number },
): Promise<CivicNeedAccessGrantRow> => {
  if (!Number.isSafeInteger(input.expectedUserId) || input.expectedUserId <= 0) {
    return fail('NEED_GRANT_DELIVERY_ACCOUNT_MISMATCH');
  }
  assertNeedGrantDeliveryAllowed();
  let grant = requireGrant(input.grantId);
  if (grant.deliveryStatus === 'revocation_pending' || grant.deliveryStatus === 'revoked_remote') {
    return fail('NEED_GRANT_DELIVERY_BLOCKED_BY_REVOCATION');
  }
  if (grant.status !== 'active' || needGrantStatusAt(grant) !== 'active') {
    return fail('NEED_GRANT_NOT_ACTIVE');
  }
  const request = buildCustodyGrantDeliveryRequest(grant);
  if (!CIVIC_API_URL) return fail('API_NOT_CONFIGURED');
  const session = await getCommunitySession();
  if (!session) return fail('AUTH_REQUIRED');
  if (session.user.id !== input.expectedUserId) {
    return fail('NEED_GRANT_DELIVERY_ACCOUNT_MISMATCH');
  }
  if (grant.remoteGrantorUserId != null && grant.remoteGrantorUserId !== session.user.id) {
    return fail('NEED_GRANT_DELIVERY_ACCOUNT_MISMATCH');
  }

  // Obtener la prueba antes de marcar intento: si el enrolamiento falla, no
  // pudo existir un grant remoto ambiguo.
  const civicToken = await ensureCivicDeviceToken(CIVIC_API_URL);
  // Puede haberse iniciado un borrado mientras esperábamos sesión o token.
  // Desde este chequeo hasta marcar `delivering` no hay ningún `await`.
  assertNeedGrantDeliveryAllowed();
  const now = ahoraISO();
  if (grant.remoteGrantorUserId == null) {
    db.update(civicNeedAccessGrants).set({ remoteGrantorUserId: session.user.id, updatedAt: now })
      .where(and(
        eq(civicNeedAccessGrants.id, grant.id),
        isNull(civicNeedAccessGrants.remoteGrantorUserId),
      )).run();
    grant = requireGrant(grant.id);
  }
  if (grant.remoteGrantorUserId !== session.user.id) {
    return fail('NEED_GRANT_DELIVERY_ACCOUNT_MISMATCH');
  }
  if (
    grant.remoteRecipientCircleId != null
    && grant.remoteRecipientCircleId !== request.recipient.id
  ) return fail('NEED_GRANT_REMOTE_RECIPIENT_MISMATCH');

  const priorDeliveryStatus = grant.deliveryStatus;
  db.update(civicNeedAccessGrants).set({
    deliveryStatus: 'delivering',
    remoteRecipientCircleId: request.recipient.id,
    deliveryLastAttemptAt: now,
    deliveryLastError: null,
    updatedAt: now,
  }).where(eq(civicNeedAccessGrants.id, grant.id)).run();

  try {
    // En web SQLite vive en memoria y el change listener persiste por lotes.
    // Confirmar primero la deuda evita que un cierre/crash pierda la cuenta y
    // el grantId después de que el servidor ya pudo aceptar el capability.
    await flushWebDatabaseSnapshot();
    const response = await communityFetchForUser(session.user.id, '/api/v1/civic/custody/grants', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'idempotency-key': `custody:${request.grantId}:deliver:v1`,
        'x-civic-device-token': civicToken,
      },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw await communityErrorFromResponse(response);
    const receipt = parseCustodyGrantDeliveryResponse(
      await response.json().catch(() => null) as unknown,
      {
        grantId: request.grantId,
        circleId: request.recipient.id,
        expiresAt: request.expiresAt,
        need: request.need,
      },
    );
    const observedAt = ahoraISO();
    if (receipt.state === 'expired') {
      db.update(civicNeedAccessGrants).set({
        status: 'expired',
        deliveryStatus: 'delivered',
        deliveredAt: receipt.createdAt,
        ...remoteResponsePatch(receipt.response),
        ...terminalCoordinationPatch(grant, 'expired', observedAt),
        deliveryLastError: null,
        updatedAt: observedAt,
      }).where(eq(civicNeedAccessGrants.id, grant.id)).run();
      return requireGrant(grant.id);
    }
    if (receipt.state === 'revoked' || receipt.state === 'closed') {
      return finishRemoteRevocation(
        grant,
        NEED_GRANT_REMOTE_CLOSED_REASON,
        observedAt,
        receipt.createdAt,
        receipt.response,
      );
    }
    db.update(civicNeedAccessGrants).set({
      deliveryStatus: 'delivered',
      deliveredAt: receipt.createdAt,
      ...remoteResponsePatch(receipt.response),
      deliveryLastError: null,
      updatedAt: observedAt,
    }).where(and(
      eq(civicNeedAccessGrants.id, grant.id),
      eq(civicNeedAccessGrants.deliveryStatus, 'delivering'),
    )).run();
    return requireGrant(grant.id);
  } catch (error) {
    markDeliveryFailure(grant.id, safeCode(error), ahoraISO(), priorDeliveryStatus);
    throw error;
  }
};

export const deliverCustodiedNeedAccess = (
  input: { grantId: string; expectedUserId: number },
): Promise<CivicNeedAccessGrantRow> => withNeedGrantRemoteOperationLock(
  'shared',
  () => deliverCustodiedNeedAccessUnlocked(input),
);

const finishRemoteRevocation = (
  grant: CivicNeedAccessGrantRow,
  reason: NeedGrantRevocationReason,
  remoteRevokedAt: string,
  deliveredAt: string | null = grant.deliveredAt,
  response: CustodyGrantRemoteResponse | null = grant.remoteResponseDisposition && grant.remoteResponseAt
    ? {
      disposition: grant.remoteResponseDisposition,
      quantity: grant.remoteResponseQuantity,
      unit: grant.remoteResponseUnit as NeedGrantUnitCode | null,
      recordedAt: grant.remoteResponseAt,
    }
    : null,
): CivicNeedAccessGrantRow => db.transaction((tx) => {
  const locallyRevoked = revokeCustodiedNeedAccess({
    grantId: grant.id,
    reason,
    now: remoteRevokedAt,
    database: tx,
  });
  tx.update(civicNeedAccessGrants).set({
    deliveryStatus: 'revoked_remote',
    deliveredAt,
    ...remoteResponsePatch(response),
    ...terminalCoordinationPatch(grant, 'closed', remoteRevokedAt),
    remoteRevokedAt,
    deliveryLastError: null,
    updatedAt: remoteRevokedAt,
  }).where(eq(civicNeedAccessGrants.id, grant.id)).run();
  return {
    ...locallyRevoked,
    deliveryStatus: 'revoked_remote' as const,
    deliveredAt,
    ...remoteResponsePatch(response),
    ...terminalCoordinationPatch(grant, 'closed', remoteRevokedAt),
    remoteRevokedAt,
    deliveryLastError: null,
    updatedAt: remoteRevokedAt,
  };
});

/**
 * Revoca primero el capability remoto cuando pudo haber sido creado. Ante una
 * duda de red mantiene la ACL local activa y visible como pendiente, para no
 * afirmar que el destinatario perdió acceso sin tener evidencia.
 */
const revokeCustodiedNeedAccessEverywhereUnlocked = async (input: {
  grantId: string;
  reason: NeedGrantRevocationReason;
}): Promise<CivicNeedAccessGrantRow> => {
  if (!NEED_GRANT_REVOCATION_REASONS.some((item) => item.key === input.reason)) {
    return fail('NEED_GRANT_REVOCATION_REASON_INVALID');
  }
  const grant = requireGrant(input.grantId);
  if (grant.deliveryStatus === 'revoked_remote') return grant;
  if (!uuidV4(grant.id)) return fail('NEED_GRANT_ID_INVALID');
  const remoteGrantId = grant.id.toLowerCase();

  const neverAttempted = grant.deliveryStatus === 'local'
    && grant.remoteGrantorUserId == null
    && grant.remoteRecipientCircleId == null
    && grant.deliveryLastAttemptAt == null;
  if (neverAttempted) {
    return revokeCustodiedNeedAccess({ grantId: grant.id, reason: input.reason });
  }
  if (!CIVIC_API_URL) {
    const now = ahoraISO();
    db.update(civicNeedAccessGrants).set({
      deliveryStatus: 'revocation_pending',
      deliveryLastError: 'API_NOT_CONFIGURED',
      updatedAt: now,
    }).where(eq(civicNeedAccessGrants.id, grant.id)).run();
    return fail('API_NOT_CONFIGURED');
  }
  const session = await getCommunitySession();
  if (!session || grant.remoteGrantorUserId == null || session.user.id !== grant.remoteGrantorUserId) {
    const now = ahoraISO();
    const code = session ? 'NEED_GRANT_DELIVERY_ACCOUNT_MISMATCH' : 'AUTH_REQUIRED';
    db.update(civicNeedAccessGrants).set({
      deliveryStatus: 'revocation_pending',
      deliveryLastError: code,
      updatedAt: now,
    }).where(eq(civicNeedAccessGrants.id, grant.id)).run();
    return fail(code);
  }

  const attemptAt = ahoraISO();
  db.update(civicNeedAccessGrants).set({
    deliveryStatus: 'revocation_pending',
    deliveryLastAttemptAt: attemptAt,
    deliveryLastError: null,
    updatedAt: attemptAt,
  }).where(eq(civicNeedAccessGrants.id, grant.id)).run();

  try {
    // La marca `revocation_pending` debe compartir la misma durabilidad previa
    // al HTTP que una entrega: otra pestaña no puede borrarla mientras la red
    // todavía puede producir un efecto.
    await flushWebDatabaseSnapshot();
    const response = await communityFetchForUser(session.user.id, '/api/v1/civic/custody/grants/revoke', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'idempotency-key': `custody:${remoteGrantId}:revoke:v1`,
      },
      body: JSON.stringify({ grantId: remoteGrantId }),
    });
    if (response.status === 404) {
      // Con la misma cuenta que inició el intento, 404 confirma que no existe
      // un capability operable por ese grantor. No se infiere esto para otra cuenta.
      return finishRemoteRevocation(grant, input.reason, ahoraISO());
    }
    if (!response.ok) {
      const remoteError = await communityErrorFromResponse(response);
      if (remoteError.code === 'CUSTODY_GRANT_EXPIRED') {
        // El cierre se desprende de una respuesta autoritativa del servidor,
        // no de comparar `expiresAt` con el reloj potencialmente adelantado
        // del dispositivo. El instante contractual de cierre es el `expiresAt`
        // que el servidor aceptó para este grant, no `ahoraISO()` local.
        return finishRemoteRevocation(grant, input.reason, grant.expiresAt);
      }
      throw remoteError;
    }
    const receipt = parseCustodyGrantRevocationResponse(
      await response.json().catch(() => null) as unknown,
      remoteGrantId,
    );
    return finishRemoteRevocation(grant, input.reason, receipt.revokedAt);
  } catch (error) {
    const now = ahoraISO();
    db.update(civicNeedAccessGrants).set({
      deliveryStatus: 'revocation_pending',
      deliveryLastError: safeCode(error),
      updatedAt: now,
    }).where(eq(civicNeedAccessGrants.id, grant.id)).run();
    throw error;
  }
};

export const revokeCustodiedNeedAccessEverywhere = (input: {
  grantId: string;
  reason: NeedGrantRevocationReason;
}): Promise<CivicNeedAccessGrantRow> => withNeedGrantRemoteOperationLock(
  'shared',
  () => revokeCustodiedNeedAccessEverywhereUnlocked(input),
);

/**
 * Mejor esfuerzo explícito antes de un borrado local. No borra filas: las
 * conserva para que el caller pueda volver a contar y mantener bloqueado el
 * borrado si alguna revocación no recibió acuse remoto.
 */
export const revokePendingNeedGrantsBeforeLocalErase = async (): Promise<{
  attempted: number;
  remaining: number;
}> => {
  const pending = pendingNeedGrantRemoteRevocations();
  for (const grant of pending) {
    try {
      await revokeCustodiedNeedAccessEverywhere({
        grantId: grant.id,
        reason: 'custodian_decision',
      });
    } catch {
      // La fila queda revocation_pending; no se descarta la deuda.
    }
  }
  return { attempted: pending.length, remaining: countPendingNeedGrantRemoteRevocations() };
};

export const needGrantDeliveryErrorMessage = (error: unknown): string => {
  const code = safeCode(error);
  if (code === 'AUTH_REQUIRED') {
    return 'Vinculá la misma cuenta comunitaria para entregar o retirar este permiso.';
  }
  if (code === 'API_NOT_CONFIGURED') {
    return 'Esta instalación todavía no tiene una red segura configurada. El permiso no fue entregado.';
  }
  if (code === 'NEED_GRANT_VERIFIED_CIRCLE_REQUIRED') {
    return 'Elegí un círculo custodio verificado de tu cuenta. Un nombre o ID escrito a mano no demuestra identidad.';
  }
  if (code === 'NEED_GRANT_DELIVERY_ACCOUNT_MISMATCH') {
    return 'Usá la misma cuenta que inició la entrega. El posible permiso remoto queda visible hasta poder retirarlo.';
  }
  if (code === 'CUSTODY_RECIPIENT_NOT_AVAILABLE') {
    return 'El círculo ya no cumple las condiciones de custodia o membresía. No se entregó un nuevo permiso.';
  }
  if (code === 'CUSTODY_ACTIVE_GRANT_EXISTS') {
    return 'La red ya conserva un permiso vigente para esta necesidad. Retiralo antes de intentar otro.';
  }
  if (code === 'CUSTODY_GRANT_EXPIRED' || code === 'NEED_GRANT_NOT_ACTIVE') {
    return 'El permiso ya venció o dejó de estar activo.';
  }
  if (code.includes('DEVICE') || code.includes('PROOF')) {
    return 'La red no pudo verificar este dispositivo. Revisá la vinculación de la cuenta antes de reintentar.';
  }
  if (code.includes('PROJECTION') || code.includes('RECEIPT') || code.includes('ID_INVALID')) {
    return 'La comprobación de integridad falló. No afirmaremos una entrega o revocación sin un acuse válido.';
  }
  return 'La red no confirmó la operación. Si pudo existir una entrega, el permiso queda marcado para reintentar su revocación.';
};

// Mantiene la interfaz serializada documentable sin exportar un parser laxo.
export type { NeedGrantProjectionV1 };
