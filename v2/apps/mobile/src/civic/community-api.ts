import {
  CommunityApiError,
  communityErrorFromResponse,
  communityFetchForUser,
  getCommunitySession,
  publicCommunityFetch,
} from './community-auth';
import { flushWebDatabaseSnapshot } from '@/db/client';
import type { CivicCustodyResponseIntentRow } from '@/db/schema';
import {
  clearVerifiedCustodyResponseIntent,
  findCustodyResponseIntent,
  listCustodyResponseIntents,
  markCustodyResponseIntentAttempt,
  reserveCustodyResponseIntent,
  type CustodyResponseIntentDatabase,
} from './custody-response-intents';

export interface CircleSummary {
  id: number;
  name: string;
  description: string | null;
  kind: 'territorial' | 'tematica' | 'celula';
  province: string | null;
  city: string | null;
  theme: string | null;
  governance: 'coordinado' | 'abierto';
  isPrivate: boolean | null;
  isOfficial: boolean | null;
  memberCount: number;
  isMember: boolean;
}

export interface CircleDetail extends CircleSummary {
  role: 'coordinador' | 'miembro' | null;
}

export interface NetworkCampaign {
  id: number;
  circleId: number;
  circleName: string;
  title: string;
  description: string | null;
  category: string | null;
  type: 'relevamiento' | 'consulta';
  status: 'borrador' | 'activa' | 'verificacion' | 'cerrada';
  targetEntries: number | null;
  deadline: string | null;
  entryCount: number;
  mapColor: string | null;
  mapIcon: string | null;
}

export interface CampaignProgress {
  campaignId: number;
  entries: number;
  targetEntries: number | null;
  progressPct: number | null;
  verified: number;
  verifiedPct: number;
}

export interface CommunityNotification {
  id: number;
  type: string;
  title: string;
  content: string;
  read: boolean | null;
  createdAt: string | null;
}

export type CustodyNeedCategory =
  | 'food'
  | 'housing'
  | 'work'
  | 'care'
  | 'health'
  | 'education'
  | 'environment'
  | 'mobility'
  | 'safety'
  | 'culture'
  | 'democracy';

export type CustodyNeedUnit =
  | 'people'
  | 'meals'
  | 'units'
  | 'hours'
  | 'kilograms'
  | 'liters'
  | 'trips'
  | 'days'
  | 'beds'
  | 'kits'
  | 'other';

export interface CustodyGrantLocation {
  lat: number;
  lng: number;
  precision: '500m' | 'neighborhood' | 'city';
}

export type CustodyGrantResponseDisposition = 'assessing' | 'support_available';

export interface CustodyGrantResponse {
  disposition: CustodyGrantResponseDisposition;
  quantity: number | null;
  unit: CustodyNeedUnit | null;
  /** Precondición opaca para proponer exactamente la capacidad observada. */
  responseVersion: string;
  recordedAt: string;
}

export type CustodyGrantState = 'active' | 'expired' | 'revoked' | 'closed';

export interface CustodyGrantProjection {
  grantId: string;
  recipient: { type: 'circle'; id: number };
  payload: {
    category: CustodyNeedCategory;
    quantity: number | null;
    unit: CustodyNeedUnit | null;
    urgency: number;
    location: CustodyGrantLocation | null;
  };
  expiresAt: string;
  createdAt: string;
  state: CustodyGrantState;
  response: CustodyGrantResponse | null;
}

export type CustodyInboxGrant = CustodyGrantProjection & { state: 'active' };

export interface CustodyGrantInbox {
  contract: 'basta-civic-custody-grants/v1';
  scope: 'private-circle-coordinator-inbox';
  grants: CustodyInboxGrant[];
  refreshedAt: string;
  truncated: boolean;
  nextCursor: string | null;
}

export interface CustodyGrantRevocationReceipt {
  status: 'revoked' | 'duplicate' | 'already_revoked';
  grantId: string;
  revokedAt: string;
}

export interface CustodyGrantResponseReceipt {
  contract: 'basta-civic-custody-grants/v1';
  status: 'accepted' | 'duplicate' | 'already_recorded';
  grant: CustodyGrantProjection;
  /** Constancia exacta de la identidad idempotente enviada, no la vista vigente. */
  recordedResponse: CustodyGrantResponse & { responseId: string };
}

export interface PendingCustodyGrantResponse {
  grant: CustodyInboxGrant;
  disposition: CustodyGrantResponseDisposition;
  quantity: number | null;
  createdAt: string;
  lastAttemptAt: string | null;
}

const jsonHeaders = { 'content-type': 'application/json' };
const CUSTODY_CONTRACT = 'basta-civic-custody-grants/v1';
const CUSTODY_INBOX_SCOPE = 'private-circle-coordinator-inbox';
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const SHA256_HEX = /^[0-9a-f]{64}$/;
const PRIVATE_PAGE_CURSOR = /^[A-Za-z0-9_-]{8,768}$/;
const UTC_DATETIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?Z$/;
const CUSTODY_CATEGORIES = new Set<CustodyNeedCategory>([
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
const CUSTODY_UNITS = new Set<CustodyNeedUnit>([
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
const CUSTODY_PRECISIONS = new Set<CustodyGrantLocation['precision']>(['500m', 'neighborhood', 'city']);

const record = (value: unknown): Record<string, unknown> | null =>
  value != null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;

const exactKeys = (value: Record<string, unknown>, allowed: readonly string[]): boolean => {
  const keys = Object.keys(value);
  return keys.length === allowed.length && keys.every((key) => allowed.includes(key));
};

const finiteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const utcDate = (value: unknown): value is string =>
  typeof value === 'string' && UTC_DATETIME.test(value) && Number.isFinite(Date.parse(value));

const custodyResponseError = (): never => {
  throw new CommunityApiError(
    'INVALID_CUSTODY_RESPONSE',
    'La bandeja de custodia recibió una respuesta que no cumple el contrato seguro.',
  );
};

const custodyUuid = (value: unknown): value is string =>
  typeof value === 'string' && UUID_V4.test(value);

const parseCustodyLocation = (value: unknown): CustodyGrantLocation | null => {
  if (value === null) return null;
  const location = record(value);
  if (
    !location
    || !exactKeys(location, ['lat', 'lng', 'precision'])
    || !finiteNumber(location.lat)
    || location.lat < -90
    || location.lat > 90
    || !finiteNumber(location.lng)
    || location.lng < -180
    || location.lng > 180
    || typeof location.precision !== 'string'
    || !CUSTODY_PRECISIONS.has(location.precision as CustodyGrantLocation['precision'])
  ) return custodyResponseError();
  return {
    lat: location.lat,
    lng: location.lng,
    precision: location.precision as CustodyGrantLocation['precision'],
  };
};

const parseCustodyResponse = (
  value: unknown,
  payload: CustodyGrantProjection['payload'],
  createdAtMs: number,
  observedAtMs: number,
): CustodyGrantResponse | null => {
  if (value === null) return null;
  const response = record(value);
  if (
    !response
    || !exactKeys(response, ['disposition', 'quantity', 'unit', 'responseVersion', 'recordedAt'])
    || !['assessing', 'support_available'].includes(String(response.disposition))
    || typeof response.responseVersion !== 'string'
    || !SHA256_HEX.test(response.responseVersion)
    || !utcDate(response.recordedAt)
  ) return custodyResponseError();

  const recordedAtMs = Date.parse(response.recordedAt);
  if (recordedAtMs < createdAtMs || recordedAtMs > observedAtMs) return custodyResponseError();

  if (response.disposition === 'assessing') {
    if (response.quantity !== null || response.unit !== null) return custodyResponseError();
  } else {
    const noQuantity = response.quantity === null && response.unit === null;
    const comparableQuantity = payload.quantity != null && payload.unit != null
      && finiteNumber(response.quantity)
      && response.quantity > 0
      && response.quantity <= payload.quantity
      && response.unit === payload.unit;
    if (!noQuantity && !comparableQuantity) return custodyResponseError();
  }

  return {
    disposition: response.disposition as CustodyGrantResponseDisposition,
    quantity: response.quantity as number | null,
    unit: response.unit as CustodyNeedUnit | null,
    responseVersion: response.responseVersion,
    recordedAt: response.recordedAt,
  };
};

const parseCustodyGrant = (
  value: unknown,
  activeAtMs: number,
  observedAtMs = activeAtMs,
  responseObservedAtMs = observedAtMs,
  allowedStates: readonly CustodyGrantState[] = ['active'],
): CustodyGrantProjection => {
  const grant = record(value);
  const recipient = grant ? record(grant.recipient) : null;
  const payload = grant ? record(grant.payload) : null;
  if (
    !grant
    || !exactKeys(grant, ['grantId', 'recipient', 'payload', 'expiresAt', 'createdAt', 'state', 'response'])
    || !custodyUuid(grant.grantId)
    || !recipient
    || !exactKeys(recipient, ['type', 'id'])
    || recipient.type !== 'circle'
    || !Number.isSafeInteger(recipient.id)
    || (recipient.id as number) <= 0
    || !payload
    || !exactKeys(payload, ['category', 'quantity', 'unit', 'urgency', 'location'])
    || typeof payload.category !== 'string'
    || !CUSTODY_CATEGORIES.has(payload.category as CustodyNeedCategory)
    || !(payload.quantity === null || (
      finiteNumber(payload.quantity)
      && payload.quantity > 0
      && payload.quantity <= 1_000_000_000
    ))
    || !(payload.unit === null || (
      typeof payload.unit === 'string'
      && CUSTODY_UNITS.has(payload.unit as CustodyNeedUnit)
    ))
    || (payload.unit !== null && payload.quantity === null)
    || !Number.isInteger(payload.urgency)
    || !finiteNumber(payload.urgency)
    || payload.urgency < 1
    || payload.urgency > 5
    || !utcDate(grant.expiresAt)
    || !utcDate(grant.createdAt)
    || typeof grant.state !== 'string'
    || !allowedStates.includes(grant.state as CustodyGrantState)
  ) return custodyResponseError();

  const createdAtMs = Date.parse(grant.createdAt);
  const expiresAtMs = Date.parse(grant.expiresAt);
  if (
    createdAtMs > observedAtMs
    || expiresAtMs <= createdAtMs
    || (grant.state === 'active' && expiresAtMs <= activeAtMs)
    || (grant.state === 'expired' && expiresAtMs > observedAtMs)
  ) {
    return custodyResponseError();
  }

  const safePayload: CustodyGrantProjection['payload'] = {
    category: payload.category as CustodyNeedCategory,
    quantity: payload.quantity as number | null,
    unit: payload.unit as CustodyNeedUnit | null,
    urgency: payload.urgency,
    location: parseCustodyLocation(payload.location),
  };
  const parsedResponse = parseCustodyResponse(
    grant.response,
    safePayload,
    createdAtMs,
    responseObservedAtMs,
  );
  if (parsedResponse && Date.parse(parsedResponse.recordedAt) >= expiresAtMs) {
    return custodyResponseError();
  }

  return {
    grantId: grant.grantId,
    recipient: { type: 'circle', id: recipient.id as number },
    payload: safePayload,
    expiresAt: grant.expiresAt,
    createdAt: grant.createdAt,
    state: grant.state as CustodyGrantState,
    response: parsedResponse,
  };
};

export const parseCustodyGrantInbox = (value: unknown): CustodyGrantInbox => {
  const inbox = record(value);
  if (
    !inbox
    || !exactKeys(inbox, ['contract', 'scope', 'grants', 'refreshedAt', 'truncated', 'nextCursor'])
    || inbox.contract !== CUSTODY_CONTRACT
    || inbox.scope !== CUSTODY_INBOX_SCOPE
    || !Array.isArray(inbox.grants)
    || inbox.grants.length > 50
    || !utcDate(inbox.refreshedAt)
    || typeof inbox.truncated !== 'boolean'
    || !(inbox.nextCursor === null
      || (typeof inbox.nextCursor === 'string' && PRIVATE_PAGE_CURSOR.test(inbox.nextCursor)))
  ) return custodyResponseError();
  const refreshedAtMs = Date.parse(inbox.refreshedAt);
  // El backend construye grant, respuesta y `refreshedAt` dentro de la misma
  // instantánea de PostgreSQL. Ninguna fila observada puede ser posterior al
  // corte autoritativo del inbox.
  const grants = inbox.grants.map((grant): CustodyInboxGrant => {
    const parsed = parseCustodyGrant(
      grant,
      refreshedAtMs,
      refreshedAtMs,
      refreshedAtMs,
      ['active'],
    );
    if (parsed.state !== 'active') return custodyResponseError();
    return parsed as CustodyInboxGrant;
  });
  if (
    new Set(grants.map((grant) => grant.grantId)).size !== grants.length
    || (inbox.truncated !== (inbox.nextCursor !== null))
    || (inbox.truncated && grants.length !== 50)
  ) return custodyResponseError();
  return {
    contract: CUSTODY_CONTRACT,
    scope: CUSTODY_INBOX_SCOPE,
    grants,
    refreshedAt: inbox.refreshedAt,
    truncated: inbox.truncated,
    nextCursor: inbox.nextCursor as string | null,
  };
};

export const parseCustodyGrantRevocationReceipt = (
  value: unknown,
  expectedGrantId: string,
): CustodyGrantRevocationReceipt => {
  if (!custodyUuid(expectedGrantId)) return custodyResponseError();
  const receipt = record(value);
  if (
    !receipt
    || !exactKeys(receipt, ['status', 'grantId', 'revokedAt'])
    || !['revoked', 'duplicate', 'already_revoked'].includes(String(receipt.status))
    || receipt.grantId !== expectedGrantId
    || !utcDate(receipt.revokedAt)
  ) return custodyResponseError();
  return {
    status: receipt.status as CustodyGrantRevocationReceipt['status'],
    grantId: expectedGrantId,
    revokedAt: receipt.revokedAt,
  };
};

const sameCustodyLocation = (
  left: CustodyGrantLocation | null,
  right: CustodyGrantLocation | null,
): boolean => left === null || right === null
  ? left === right
  : left.lat === right.lat && left.lng === right.lng && left.precision === right.precision;

export const parseCustodyGrantResponseReceipt = (
  value: unknown,
  expectedGrant: CustodyInboxGrant,
  expectedResponseId: string,
  expectedDisposition: CustodyGrantResponseDisposition,
  expectedQuantity: number | null,
  nowMs = Date.now(),
): CustodyGrantResponseReceipt => {
  const receipt = record(value);
  const recordedResponse = receipt ? record(receipt.recordedResponse) : null;
  if (
    !receipt
    || !exactKeys(receipt, ['contract', 'status', 'grant', 'recordedResponse'])
    || receipt.contract !== CUSTODY_CONTRACT
    || !['accepted', 'duplicate', 'already_recorded'].includes(String(receipt.status))
    || !custodyUuid(expectedResponseId)
    || !recordedResponse
    || !exactKeys(recordedResponse, [
      'responseId',
      'disposition',
      'quantity',
      'unit',
      'responseVersion',
      'recordedAt',
    ])
    || recordedResponse.responseId !== expectedResponseId
  ) return custodyResponseError();

  // Una escritura nueva debe seguir activa. Sólo un replay exacto puede traer
  // la vista terminal actual si el HTTP original se perdió y el grant venció,
  // fue revocado o se cerró antes del reintento.
  const allowedStates: readonly CustodyGrantState[] = receipt.status === 'duplicate'
    ? ['active', 'expired', 'revoked', 'closed']
    : ['active'];
  const grant = parseCustodyGrant(
    receipt.grant,
    nowMs - 5 * 60_000,
    nowMs + 5 * 60_000,
    nowMs + 5 * 60_000,
    allowedStates,
  );
  if (
    !(expectedQuantity === null || (finiteNumber(expectedQuantity) && expectedQuantity > 0))
    || (expectedDisposition === 'assessing' && expectedQuantity !== null)
  ) return custodyResponseError();
  const expectedUnit = expectedQuantity === null ? null : expectedGrant.payload.unit;
  if (expectedQuantity !== null && expectedUnit === null) return custodyResponseError();
  const exactRecordedResponse = parseCustodyResponse(
    {
      disposition: recordedResponse.disposition,
      quantity: recordedResponse.quantity,
      unit: recordedResponse.unit,
      responseVersion: recordedResponse.responseVersion,
      recordedAt: recordedResponse.recordedAt,
    },
    expectedGrant.payload,
    Date.parse(expectedGrant.createdAt),
    nowMs + 5 * 60_000,
  );
  const recordedResponseIsExact = exactRecordedResponse != null
    && exactRecordedResponse.disposition === expectedDisposition
    && exactRecordedResponse.quantity === expectedQuantity
    && exactRecordedResponse.unit === expectedUnit
    && Date.parse(exactRecordedResponse.recordedAt) < Date.parse(expectedGrant.expiresAt);
  // `grant.response` es la proyección vigente y puede haber avanzado después
  // del HTTP perdido. Sólo exigimos monotonicidad: assessing puede avanzar a
  // support_available; una oferta sólo puede seguir en support_available.
  const currentResponseIsMonotonic = expectedDisposition === 'assessing'
    ? grant.response?.disposition === 'assessing'
      || grant.response?.disposition === 'support_available'
    : grant.response?.disposition === 'support_available';
  if (
    grant.grantId !== expectedGrant.grantId
    || grant.recipient.id !== expectedGrant.recipient.id
    || grant.payload.category !== expectedGrant.payload.category
    || grant.payload.quantity !== expectedGrant.payload.quantity
    || grant.payload.unit !== expectedGrant.payload.unit
    || grant.payload.urgency !== expectedGrant.payload.urgency
    || !sameCustodyLocation(grant.payload.location, expectedGrant.payload.location)
    || grant.expiresAt !== expectedGrant.expiresAt
    || grant.createdAt !== expectedGrant.createdAt
    || !recordedResponseIsExact
    || !currentResponseIsMonotonic
  ) return custodyResponseError();

  return {
    contract: CUSTODY_CONTRACT,
    status: receipt.status as CustodyGrantResponseReceipt['status'],
    grant,
    recordedResponse: {
      responseId: expectedResponseId,
      ...exactRecordedResponse,
    },
  };
};

export const newCustodyResponseId = (): string => {
  const randomUuid = globalThis.crypto?.randomUUID?.();
  if (randomUuid && custodyUuid(randomUuid)) return randomUuid;
  const bytes = new Uint8Array(16);
  if (globalThis.crypto?.getRandomValues) globalThis.crypto.getRandomValues(bytes);
  else for (let index = 0; index < bytes.length; index += 1) bytes[index] = Math.floor(Math.random() * 256);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};

interface CustodyResponseRequest {
  grantId: string;
  responseId: string;
  disposition: CustodyGrantResponseDisposition;
  quantity?: number;
}

const custodyResponseRequest = (
  grantId: string,
  responseId: string,
  disposition: CustodyGrantResponseDisposition,
  quantity: number | null,
): CustodyResponseRequest => quantity === null
  ? { grantId, responseId, disposition }
  : { grantId, responseId, disposition, quantity };

const parsePendingCustodyResponse = (
  row: CivicCustodyResponseIntentRow,
  nowMs = Date.now(),
): PendingCustodyGrantResponse => {
  let requestValue: unknown;
  let grantValue: unknown;
  try {
    requestValue = JSON.parse(row.requestJson) as unknown;
    grantValue = JSON.parse(row.grantJson) as unknown;
  } catch {
    return custodyResponseError();
  }
  const request = record(requestValue);
  const expectedKeys = row.quantity === null
    ? ['grantId', 'responseId', 'disposition']
    : ['grantId', 'responseId', 'disposition', 'quantity'];
  if (
    !custodyUuid(row.responseId)
    || !custodyUuid(row.grantId)
    || !Number.isSafeInteger(row.responderUserId)
    || row.responderUserId <= 0
    || !['assessing', 'support_available'].includes(row.disposition)
    || !(row.quantity === null || (finiteNumber(row.quantity) && row.quantity > 0))
    || (row.disposition === 'assessing' && row.quantity !== null)
    || !utcDate(row.createdAt)
    || !(row.lastAttemptAt === null || utcDate(row.lastAttemptAt))
    || !request
    || !exactKeys(request, expectedKeys)
    || request.grantId !== row.grantId
    || request.responseId !== row.responseId
    || request.disposition !== row.disposition
    || (row.quantity === null ? 'quantity' in request : request.quantity !== row.quantity)
  ) return custodyResponseError();

  const storedGrant = record(grantValue);
  if (!storedGrant || storedGrant.grantId !== row.grantId || !utcDate(storedGrant.expiresAt)) {
    return custodyResponseError();
  }
  // El snapshot nació activo. Para validar un replay después del vencimiento
  // conservamos ese corte histórico, sin presentarlo como estado remoto actual.
  const historicalActiveAt = Math.min(nowMs, Date.parse(storedGrant.expiresAt) - 1);
  const observedAt = Math.max(nowMs + 5 * 60_000, Date.parse(row.createdAt));
  const grant = parseCustodyGrant(
    grantValue,
    historicalActiveAt,
    observedAt,
    observedAt,
    ['active'],
  );
  if (grant.state !== 'active') return custodyResponseError();
  return {
    grant: grant as CustodyInboxGrant,
    disposition: row.disposition,
    quantity: row.quantity,
    createdAt: row.createdAt,
    lastAttemptAt: row.lastAttemptAt,
  };
};

/** Intenciones de la cuenta activa; las de otra cuenta nunca se leen ni muestran. */
export const loadPendingCustodyGrantResponses = (
  responderUserId: number,
  database?: CustodyResponseIntentDatabase,
): PendingCustodyGrantResponse[] => listCustodyResponseIntents(responderUserId, database)
  .map((row) => parsePendingCustodyResponse(row));

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) throw await communityErrorFromResponse(response);
  return response.json() as Promise<T>;
}

async function optionalAccountFetch(path: string, expectedUserId?: number): Promise<Response> {
  return expectedUserId == null
    ? publicCommunityFetch(path)
    : communityFetchForUser(expectedUserId, path);
}

export const loadCircles = async (expectedUserId?: number): Promise<CircleSummary[]> => {
  const response = await optionalAccountFetch('/api/circulos', expectedUserId);
  const body = await readJson<{ circulos?: CircleSummary[] }>(response);
  return Array.isArray(body.circulos) ? body.circulos : [];
};

export const loadCircleDetail = (id: number, expectedUserId?: number): Promise<CircleDetail> =>
  optionalAccountFetch(`/api/circulos/${id}`, expectedUserId).then(readJson<CircleDetail>);

export const joinCircle = async (id: number, expectedUserId: number): Promise<void> => {
  await readJson(await communityFetchForUser(expectedUserId, `/api/circulos/${id}/unirse`, { method: 'POST' }));
};

export const redeemCircleInvite = async (code: string, expectedUserId: number): Promise<{ circulo: { id: number; name: string } }> =>
  readJson(await communityFetchForUser(expectedUserId, '/api/circulos/invitaciones/canjear', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({ code: code.trim() }),
  }));

export const reportCircle = async (id: number, reason: string, expectedUserId: number): Promise<void> => {
  await readJson(await communityFetchForUser(expectedUserId, `/api/circulos/${id}/reportar`, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({ reason: reason.trim() }),
  }));
};

export const createCircleInvite = async (id: number, expectedUserId: number): Promise<{ code: string; expiresAt: string | null }> =>
  readJson(await communityFetchForUser(expectedUserId, `/api/circulos/${id}/invitaciones`, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({ maxUses: 20, expiresInDays: 7 }),
  }));

export const loadNetworkCampaigns = async (): Promise<NetworkCampaign[]> => {
  const response = await publicCommunityFetch('/api/campanas?status=activa');
  const body = await readJson<{ campanas?: NetworkCampaign[] }>(response);
  return Array.isArray(body.campanas) ? body.campanas : [];
};

export const loadCampaignProgress = (id: number): Promise<CampaignProgress> =>
  publicCommunityFetch(`/api/campanas/${id}/progreso`).then(readJson<CampaignProgress>);

export const loadCommunityNotifications = (expectedUserId: number): Promise<CommunityNotification[]> =>
  communityFetchForUser(expectedUserId, '/api/notifications?unreadOnly=true').then(readJson<CommunityNotification[]>);

export const markAllCommunityNotificationsRead = async (expectedUserId: number): Promise<void> => {
  await readJson(await communityFetchForUser(expectedUserId, '/api/notifications/read-all', { method: 'POST' }));
};

export const loadCustodyGrantInbox = async (
  expectedUserId: number,
): Promise<CustodyGrantInbox> => {
  if (!Number.isSafeInteger(expectedUserId) || expectedUserId <= 0) return custodyResponseError();
  const assertSameSession = async (): Promise<void> => {
    const current = await getCommunitySession();
    if (!current || current.user.id !== expectedUserId) {
      throw new CommunityApiError(
        'AUTH_SESSION_CHANGED',
        'La cuenta activa cambió durante la lectura privada.',
      );
    }
  };
  const grants: CustodyInboxGrant[] = [];
  const seenGrantIds = new Set<string>();
  const seenCursors = new Set<string>();
  let cursor: string | null = null;
  let refreshedAt: string | null = null;

  // 20 páginas = 1.000 permisos como máximo por refresco. Si existe una página
  // 21, `truncated` queda explícito para que la UI no convierta el tope local
  // en una falsa bandeja completa.
  for (let pageNumber = 0; pageNumber < 20; pageNumber += 1) {
    const path = cursor
      ? `/api/v1/civic/custody/grants?limit=50&cursor=${encodeURIComponent(cursor)}`
      : '/api/v1/civic/custody/grants?limit=50';
    const response = await communityFetchForUser(expectedUserId, path);
    const page = parseCustodyGrantInbox(await readJson<unknown>(response));
    if (refreshedAt != null && page.refreshedAt !== refreshedAt) return custodyResponseError();
    refreshedAt ??= page.refreshedAt;
    for (const grant of page.grants) {
      if (seenGrantIds.has(grant.grantId)) return custodyResponseError();
      seenGrantIds.add(grant.grantId);
      grants.push(grant);
    }
    if (page.nextCursor == null) {
      await assertSameSession();
      return {
        contract: CUSTODY_CONTRACT,
        scope: CUSTODY_INBOX_SCOPE,
        grants,
        refreshedAt,
        truncated: false,
        nextCursor: null,
      };
    }
    if (seenCursors.has(page.nextCursor)) return custodyResponseError();
    seenCursors.add(page.nextCursor);
    cursor = page.nextCursor;
  }

  await assertSameSession();
  return {
    contract: CUSTODY_CONTRACT,
    scope: CUSTODY_INBOX_SCOPE,
    grants,
    refreshedAt: refreshedAt ?? new Date(0).toISOString(),
    truncated: true,
    nextCursor: cursor,
  };
};

export const revokeCustodyInboxGrant = async (
  grantId: string,
  expectedUserId: number,
): Promise<CustodyGrantRevocationReceipt> => {
  if (
    !custodyUuid(grantId)
    || !Number.isSafeInteger(expectedUserId)
    || expectedUserId <= 0
  ) return custodyResponseError();
  const response = await communityFetchForUser(expectedUserId, '/api/v1/civic/custody/grants/revoke', {
    method: 'POST',
    headers: {
      ...jsonHeaders,
      'idempotency-key': `custody:${grantId}:recipient-withdraw:v1`,
    },
    body: JSON.stringify({ grantId }),
  });
  return parseCustodyGrantRevocationReceipt(await readJson<unknown>(response), grantId);
};

export const respondToCustodyGrant = async (
  grant: CustodyInboxGrant,
  responderUserId: number,
  disposition: CustodyGrantResponseDisposition,
  quantity?: number,
  database?: CustodyResponseIntentDatabase,
): Promise<CustodyGrantResponseReceipt> => {
  const normalizedQuantity = quantity ?? null;
  if (
    !custodyUuid(grant.grantId)
    || !Number.isSafeInteger(responderUserId)
    || responderUserId <= 0
    || !['assessing', 'support_available'].includes(disposition)
    || (disposition === 'assessing' && quantity !== undefined)
    || (quantity !== undefined && (!finiteNumber(quantity) || quantity <= 0))
  ) return custodyResponseError();

  const startingSession = await getCommunitySession();
  if (!startingSession || startingSession.user.id !== responderUserId) {
    throw new CommunityApiError(
      'AUTH_SESSION_CHANGED',
      'La cuenta activa cambió. La respuesta no fue enviada.',
    );
  }

  const existing = findCustodyResponseIntent(responderUserId, grant.grantId, database);
  // `response_id` es globalmente único en el servidor. También assessing usa
  // UUID aleatorio: derivarlo sólo del grant haría colisionar a dos cuentas
  // coordinadoras. La tabla durable aporta estabilidad entre reintentos.
  const responseId = existing?.responseId ?? newCustodyResponseId();
  const body = custodyResponseRequest(grant.grantId, responseId, disposition, normalizedQuantity);
  const intent = reserveCustodyResponseIntent({
    responseId,
    responderUserId,
    grantId: grant.grantId,
    disposition,
    quantity: normalizedQuantity,
    requestJson: JSON.stringify(body),
    // Ésta ya es la proyección estrictamente parseada del contrato: no tiene
    // needId, relato, contacto, identidad ni coordenada exacta.
    grantJson: JSON.stringify(grant),
    createdAt: new Date().toISOString(),
  }, database);
  const pending = parsePendingCustodyResponse(intent);
  markCustodyResponseIntentAttempt(intent, new Date().toISOString(), database);
  // En web SQLite vive en memoria. La fotografía IndexedDB debe confirmar la
  // intención antes de que exista cualquier posibilidad de efecto remoto.
  await flushWebDatabaseSnapshot();

  const response = await communityFetchForUser(responderUserId, '/api/v1/civic/custody/grants/respond', {
    method: 'POST',
    headers: {
      ...jsonHeaders,
      'idempotency-key': `custody:${intent.grantId}:respond:${intent.responseId}`,
    },
    body: intent.requestJson,
  });
  const receipt = parseCustodyGrantResponseReceipt(
    await readJson<unknown>(response),
    pending.grant,
    intent.responseId,
    pending.disposition,
    pending.quantity,
  );
  const completionSession = await getCommunitySession();
  if (!completionSession || completionSession.user.id !== responderUserId) {
    throw new CommunityApiError(
      'AUTH_SESSION_CHANGED',
      'La cuenta activa cambió. La constancia se recuperará con la cuenta original.',
    );
  }
  clearVerifiedCustodyResponseIntent(intent, database);
  try {
    await flushWebDatabaseSnapshot();
  } catch (error) {
    // Si no pudimos hacer durable la limpieza, restauramos el mismo comando.
    // Repetirlo es seguro; inventar que quedó cerrado localmente no lo sería.
    reserveCustodyResponseIntent({
      responseId: intent.responseId,
      responderUserId: intent.responderUserId,
      grantId: intent.grantId,
      disposition: intent.disposition,
      quantity: intent.quantity,
      requestJson: intent.requestJson,
      grantJson: intent.grantJson,
      createdAt: intent.createdAt,
    }, database);
    await flushWebDatabaseSnapshot().catch(() => undefined);
    throw error;
  }
  return receipt;
};
