import { createHash } from 'node:crypto';
import { z } from 'zod';

import {
  canonicalJson,
  civicIdempotencyKeySchema,
  civicUuidV4Schema,
  normalizePublicEventPayload,
} from './contracts';
import { custodyTimestampToIsoUtc } from './custody-timestamps';
import {
  custodyPageCursorStringSchema,
  decodeCustodyPageCursor,
  encodeCustodyPageCursor,
  type CustodyPageRequest,
} from './custody-pagination';
import { CivicApiError } from './service';

const MIN_GRANT_TTL_MS = 5 * 60_000;
const MAX_GRANT_TTL_MS = 90 * 24 * 60 * 60_000;
export const custodyUuidV4Schema = civicUuidV4Schema;

export const custodyNeedCategorySchema = z.enum([
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
 * No acepta texto libre. Una unidad desconocida puede viajar como `other`,
 * pero su explicación queda fuera de este primer grant.
 */
export const custodyNeedUnitSchema = z.enum([
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

const custodyLocationSchema = z.object({
  lat: z.number().finite().min(-90).max(90),
  lng: z.number().finite().min(-180).max(180),
  /** Un pedido sensible nunca sale de este canal con precisión de domicilio. */
  precision: z.enum(['500m', 'neighborhood', 'city']),
}).strict();

const custodyNeedInputSchema = z.object({
  category: custodyNeedCategorySchema,
  quantity: z.number().finite().positive().max(1_000_000_000).nullable().optional(),
  unit: custodyNeedUnitSchema.nullable().optional(),
  urgency: z.number().int().min(1).max(5),
  location: custodyLocationSchema.nullable().optional(),
}).strict().superRefine((value, ctx) => {
  if (value.unit != null && value.quantity == null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['unit'],
      message: 'unit requiere quantity.',
    });
  }
});

const custodyRecipientSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('circle'), id: z.number().int().positive() }).strict(),
  // Se reconoce para poder fallar con una explicación honesta. No habilita
  // organizaciones hasta contar con identidad y representación verificables.
  z.object({ type: z.literal('organization'), id: custodyUuidV4Schema }).strict(),
]);

export const createCustodyGrantSchema = z.object({
  grantId: custodyUuidV4Schema,
  needId: custodyUuidV4Schema,
  recipient: custodyRecipientSchema,
  expiresAt: z.string().datetime(),
  need: custodyNeedInputSchema,
}).strict();

export const custodyGrantListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  cursor: custodyPageCursorStringSchema.optional(),
}).strict();

export const custodyGrantResponseDispositionSchema = z.enum([
  'assessing',
  'support_available',
]);

export const createCustodyGrantResponseSchema = z.object({
  grantId: custodyUuidV4Schema,
  responseId: custodyUuidV4Schema,
  disposition: custodyGrantResponseDispositionSchema,
  quantity: z.number().finite().positive().max(1_000_000_000).nullable().optional(),
}).strict().superRefine((value, ctx) => {
  if (value.disposition === 'assessing' && value.quantity != null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['quantity'],
      message: 'assessing no admite quantity.',
    });
  }
});

export const custodyGrantIdSchema = custodyUuidV4Schema;
export { civicIdempotencyKeySchema as custodyIdempotencyKeySchema };

export const custodyGrantPayloadSchema = z.object({
  category: custodyNeedCategorySchema,
  quantity: z.number().finite().positive().max(1_000_000_000).nullable(),
  unit: custodyNeedUnitSchema.nullable(),
  urgency: z.number().int().min(1).max(5),
  location: custodyLocationSchema.nullable(),
}).strict();

export type CreateCustodyGrantInput = z.infer<typeof createCustodyGrantSchema>;
export type CreateCustodyGrantResponseInput = z.infer<typeof createCustodyGrantResponseSchema>;
export type CustodyGrantPayload = z.infer<typeof custodyGrantPayloadSchema>;
export type CustodyGrantResponseDisposition = z.infer<typeof custodyGrantResponseDispositionSchema>;
export type CustodyCircleRole = 'coordinador' | 'miembro';

export interface CustodyDeviceRecord {
  actorKey: string;
  linkedUserId: number | null;
  revokedAt: string | null;
}

export interface CustodyNeedOwnerRecord {
  actorKey: string;
  linkedUserId: number | null;
}

export interface CustodyCircleAccess {
  circleId: number;
  kind: 'territorial' | 'tematica' | 'celula';
  isPrivate: boolean;
  membershipRole: CustodyCircleRole | null;
  hasCoordinator: boolean;
}

export interface StoredCustodyGrant {
  rowId: number;
  grantId: string;
  idempotencyKey: string;
  requestHash: string;
  needId: string;
  ownerActorKey: string;
  grantorUserId: number;
  recipientType: 'circle';
  recipientCircleId: number;
  /** PostgreSQL jsonb; nunca conservar texto JSON crudo ni claves duplicadas. */
  payloadJson: Record<string, unknown>;
  expiresAt: string;
  revokedAt: string | null;
  closedAt: string | null;
  closedReason: 'revoked' | 'expired' | 'superseded' | null;
  createdAt: string;
}

export interface StoredCustodyRevocation {
  grantId: string;
  idempotencyKey: string;
  requestHash: string;
  revokedByUserId: number;
  revokedAt: string;
}

export interface StoredCustodyGrantResponse {
  rowId: number;
  responseId: string;
  idempotencyKey: string;
  requestHash: string;
  grantId: string;
  responderUserId: number;
  disposition: CustodyGrantResponseDisposition;
  quantity: number | null;
  unit: z.infer<typeof custodyNeedUnitSchema> | null;
  applied: boolean;
  createdAt: string;
}

export interface CustodyGrantInboxSnapshot {
  authorized: boolean;
  rows: Array<{
    grant: StoredCustodyGrant;
    response: StoredCustodyGrantResponse | null;
  }>;
  refreshedAt: string | null;
}

export interface CustodyGrantStore {
  runInTransaction?<T>(operation: (store: CustodyGrantStore) => Promise<T>): Promise<T>;
  getDevice(actorKey: string): Promise<CustodyDeviceRecord | null>;
  isActiveUser(userId: number): Promise<boolean>;
  getCircleAccess(circleId: number, userId: number): Promise<CustodyCircleAccess | null>;
  isCircleCoordinator(circleId: number, userId: number): Promise<boolean>;
  getNeedOwner(needId: string): Promise<CustodyNeedOwnerRecord | null>;
  claimNeedOwner(needId: string, actorKey: string): Promise<'claimed' | 'same' | 'conflict'>;
  findGrantConflicts(grantId: string, grantorUserId: number, idempotencyKey: string): Promise<StoredCustodyGrant[]>;
  insertGrant(input: Omit<StoredCustodyGrant, 'rowId' | 'revokedAt' | 'closedAt' | 'closedReason'>): Promise<boolean>;
  getGrant(grantId: string): Promise<StoredCustodyGrant | null>;
  getGrantForUpdate(grantId: string): Promise<StoredCustodyGrant | null>;
  getRespondableGrant(grantId: string, userId: number, now: string): Promise<StoredCustodyGrant | null>;
  getOpenGrantForNeed(needId: string): Promise<StoredCustodyGrant | null>;
  listActiveInbox(
    userId: number,
    limit: number,
    nowHint: string,
    page: CustodyPageRequest | null,
  ): Promise<CustodyGrantInboxSnapshot>;
  markGrantExpired(grantId: string, closedAt: string): Promise<boolean>;
  markGrantRevoked(grantId: string, userId: number, revokedAt: string): Promise<string | null>;
  isGrantExpired(grantId: string, now: string): Promise<boolean>;
  findRevocation(userId: number, idempotencyKey: string): Promise<StoredCustodyRevocation | null>;
  appendRevocation(input: StoredCustodyRevocation): Promise<boolean>;
  findResponseConflicts(
    responseId: string,
    responderUserId: number,
    idempotencyKey: string,
  ): Promise<StoredCustodyGrantResponse[]>;
  getLatestAppliedResponse(grantId: string): Promise<StoredCustodyGrantResponse | null>;
  listLatestAppliedResponses(grantIds: string[]): Promise<StoredCustodyGrantResponse[]>;
  insertResponse(
    input: Omit<StoredCustodyGrantResponse, 'rowId' | 'createdAt'>,
  ): Promise<StoredCustodyGrantResponse | null>;
  hasCoordinationProposal(grantId: string): Promise<boolean>;
}

export interface CustodyActorContext {
  actorKey: string;
  linkedUserId: number | null;
  revokedAt: string | null;
}

export interface CustodyGrantView {
  grantId: string;
  recipient: { type: 'circle'; id: number };
  payload: CustodyGrantPayload;
  expiresAt: string;
  createdAt: string;
  state: 'active' | 'expired' | 'revoked' | 'closed';
  response: CustodyGrantResponseView | null;
}

export interface CustodyGrantResponseView {
  disposition: CustodyGrantResponseDisposition;
  quantity: number | null;
  unit: z.infer<typeof custodyNeedUnitSchema> | null;
  /** Token opaco de precondición; nunca expone response_id. */
  responseVersion: string;
  recordedAt: string;
}

/**
 * Constancia exacta de la escritura que produjo este recibo. `grant.response`
 * sigue representando la respuesta aplicada más reciente y puede haber
 * avanzado antes de que un reintento idempotente recupere su HTTP original.
 * El identificador sólo vuelve a la cuenta que acaba de presentarlo; nunca se
 * incorpora al inbox ni a la coordinación.
 */
export interface CustodyGrantRecordedResponseView extends CustodyGrantResponseView {
  responseId: string;
}

const hash = (value: unknown): string => createHash('sha256')
  .update(canonicalJson(value))
  .digest('hex');

/**
 * Versión opaca y estable del response aplicado. Permite que una propuesta
 * diga "acepto exactamente lo que vi" sin revelar el response_id interno.
 */
export const custodyResponseVersion = (responseId: string): string => createHash('sha256')
  .update('basta-civic-custody-response-version/v1\0', 'utf8')
  .update(responseId, 'utf8')
  .digest('hex');

const safePayload = (need: CreateCustodyGrantInput['need']): CustodyGrantPayload => {
  let location: CustodyGrantPayload['location'] = null;
  if (need.location) {
    const normalized = normalizePublicEventPayload('need', {
      publicLat: need.location.lat,
      publicLng: need.location.lng,
      publicPrecision: need.location.precision,
    });
    if (normalized.issue) {
      throw new CivicApiError(422, normalized.issue.code, 'El punto seguro no es válido.', normalized.issue.path);
    }
    const normalizedLat = normalized.payload.publicLat as number;
    const normalizedLng = normalized.payload.publicLng as number;
    if (normalizedLat !== need.location.lat || normalizedLng !== need.location.lng) {
      throw new CivicApiError(
        422,
        'CUSTODY_LOCATION_NOT_REDUCED',
        'El cliente debe enviar únicamente el centro de una zona segura ya reducida.',
        '$.need.location',
      );
    }
    location = {
      lat: normalizedLat,
      lng: normalizedLng,
      precision: normalized.payload.publicPrecision as '500m' | 'neighborhood' | 'city',
    };
  }
  return custodyGrantPayloadSchema.parse({
    category: need.category,
    quantity: need.quantity ?? null,
    unit: need.unit ?? null,
    urgency: need.urgency,
    location,
  });
};

const payloadFromRow = (row: StoredCustodyGrant): CustodyGrantPayload => {
  const parsed = custodyGrantPayloadSchema.safeParse(row.payloadJson);
  if (!parsed.success) {
    throw new CivicApiError(500, 'CUSTODY_PAYLOAD_INVALID', 'El grant almacenado no cumple el contrato seguro.');
  }
  return parsed.data;
};

const grantState = (row: StoredCustodyGrant, nowMs: number): CustodyGrantView['state'] => {
  if (row.revokedAt || row.closedReason === 'revoked') return 'revoked';
  if (row.closedReason === 'expired') return 'expired';
  // `superseded` sólo nace del repair de una migración, pero un replay del
  // emisor todavía puede encontrar esa fila. Nunca presentarla como vigente.
  if (row.closedAt || row.closedReason === 'superseded') return 'closed';
  return Date.parse(row.expiresAt) <= nowMs ? 'expired' : 'active';
};

const responseViewFromRow = (
  row: StoredCustodyGrantResponse,
  recordedAtPath = '$.grant.response.recordedAt',
): CustodyGrantResponseView => ({
  disposition: row.disposition,
  quantity: row.quantity,
  unit: row.unit,
  responseVersion: custodyResponseVersion(row.responseId),
  recordedAt: custodyTimestampToIsoUtc(row.createdAt, recordedAtPath),
});

const recordedResponseViewFromRow = (
  row: StoredCustodyGrantResponse,
): CustodyGrantRecordedResponseView => ({
  responseId: row.responseId,
  ...responseViewFromRow(row, '$.recordedResponse.recordedAt'),
});

const viewFromRow = (
  row: StoredCustodyGrant,
  nowMs: number,
  response: StoredCustodyGrantResponse | null,
): CustodyGrantView => ({
  grantId: row.grantId,
  recipient: { type: 'circle', id: row.recipientCircleId },
  payload: payloadFromRow(row),
  expiresAt: custodyTimestampToIsoUtc(row.expiresAt, '$.grant.expiresAt'),
  createdAt: custodyTimestampToIsoUtc(row.createdAt, '$.grant.createdAt'),
  state: grantState(row, nowMs),
  response: response ? responseViewFromRow(response) : null,
});

function idempotentGrant(
  rows: StoredCustodyGrant[],
  userId: number,
  requestHash: string,
): StoredCustodyGrant | null {
  if (rows.length === 0) return null;
  if (
    rows.length === 1
    && rows[0].grantorUserId === userId
    && rows[0].requestHash === requestHash
  ) return rows[0];
  throw new CivicApiError(409, 'CUSTODY_IDEMPOTENCY_CONFLICT', 'La identidad del grant ya fue usada con otro contenido.');
}

function idempotentResponse(
  rows: StoredCustodyGrantResponse[],
  userId: number,
  responseId: string,
  idempotencyKey: string,
  requestHash: string,
): StoredCustodyGrantResponse | null {
  if (rows.length === 0) return null;
  if (
    rows.length === 1
    && rows[0].responderUserId === userId
    && rows[0].responseId === responseId
    && rows[0].idempotencyKey === idempotencyKey
    && rows[0].requestHash === requestHash
  ) return rows[0];
  throw new CivicApiError(
    409,
    'CUSTODY_RESPONSE_IDEMPOTENCY_CONFLICT',
    'La identidad de la respuesta ya fue usada con otro contenido.',
  );
}

function idempotentRevocation(
  row: StoredCustodyRevocation | null,
  grantId: string,
  requestHash: string,
): StoredCustodyRevocation | null {
  if (!row) return null;
  if (row.grantId === grantId && row.requestHash === requestHash) return row;
  throw new CivicApiError(409, 'CUSTODY_IDEMPOTENCY_CONFLICT', 'La clave de revocación ya fue usada para otro grant.');
}

export class CustodyGrantService {
  constructor(
    private readonly store: CustodyGrantStore,
    private readonly clock: () => Date = () => new Date(),
  ) {}

  private async assertActiveUser(userId: number): Promise<void> {
    if (!(await this.store.isActiveUser(userId))) {
      throw new CivicApiError(403, 'ACCOUNT_NOT_ACTIVE', 'La cuenta no está habilitada para operar grants.');
    }
  }

  private async currentGrantView(
    store: CustodyGrantStore,
    grant: StoredCustodyGrant,
    nowMs: number,
  ): Promise<CustodyGrantView> {
    return viewFromRow(grant, nowMs, await store.getLatestAppliedResponse(grant.grantId));
  }

  private assertLinkedDevice(actor: CustodyActorContext, userId: number): void {
    if (actor.revokedAt) {
      throw new CivicApiError(403, 'DEVICE_REVOKED', 'El dispositivo no está habilitado.');
    }
    if (actor.linkedUserId !== userId) {
      throw new CivicApiError(
        403,
        'LINKED_DEVICE_REQUIRED',
        'La cuenta y el dispositivo deben estar vinculados para entregar una necesidad.',
      );
    }
  }

  private async resolveNeedOwner(
    store: CustodyGrantStore,
    needId: string,
    actor: CustodyActorContext,
    userId: number,
  ): Promise<string> {
    const current = await store.getNeedOwner(needId);
    if (current) {
      if (current.linkedUserId !== userId) {
        throw new CivicApiError(403, 'NEED_OWNERSHIP_UNPROVEN', 'La cuenta no puede demostrar control de esta necesidad.');
      }
      return current.actorKey;
    }

    const claimed = await store.claimNeedOwner(needId, actor.actorKey);
    if (claimed === 'claimed' || claimed === 'same') return actor.actorKey;

    const raced = await store.getNeedOwner(needId);
    if (!raced || raced.linkedUserId !== userId) {
      throw new CivicApiError(403, 'NEED_OWNERSHIP_UNPROVEN', 'La cuenta no puede demostrar control de esta necesidad.');
    }
    return raced.actorKey;
  }

  async create(
    actor: CustodyActorContext,
    userId: number,
    input: CreateCustodyGrantInput,
    idempotencyKey: string,
  ): Promise<{ status: 'accepted' | 'duplicate'; grant: CustodyGrantView }> {
    await this.assertActiveUser(userId);
    this.assertLinkedDevice(actor, userId);

    if (input.recipient.type === 'organization') {
      throw new CivicApiError(
        422,
        'ORGANIZATION_IDENTITY_UNAVAILABLE',
        'Todavía no existe una identidad organizacional con representantes verificables; el grant falla cerrado.',
        '$.recipient',
      );
    }
    // Conserva el narrowing dentro del callback transaccional asíncrono.
    const recipientCircleId = input.recipient.id;

    const now = this.clock();
    const nowMs = now.getTime();
    const expiresAtMs = Date.parse(input.expiresAt);
    const expiresAt = new Date(expiresAtMs).toISOString();
    const payload = safePayload(input.need);
    const canonicalRequest = {
      grantId: input.grantId,
      needId: input.needId,
      recipient: input.recipient,
      expiresAt,
      payload,
    };
    const requestHash = hash(canonicalRequest);

    const commit = async (store: CustodyGrantStore) => {
      if (!(await store.isActiveUser(userId))) {
        throw new CivicApiError(403, 'ACCOUNT_NOT_ACTIVE', 'La cuenta no está habilitada para operar grants.');
      }
      const currentDevice = await store.getDevice(actor.actorKey);
      if (!currentDevice) {
        throw new CivicApiError(403, 'DEVICE_NOT_AVAILABLE', 'El dispositivo no está habilitado.');
      }
      this.assertLinkedDevice(currentDevice, userId);

      const raced = idempotentGrant(
        await store.findGrantConflicts(input.grantId, userId, idempotencyKey),
        userId,
        requestHash,
      );
      if (raced) {
        return {
          status: 'duplicate' as const,
          grant: await this.currentGrantView(store, raced, nowMs),
        };
      }

      // La ventana rige sólo para una escritura nueva. Un replay idéntico
      // debe conservar su respuesta idempotente aunque al grant le queden
      // menos de cinco minutos o ya haya vencido.
      if (expiresAtMs < nowMs + MIN_GRANT_TTL_MS || expiresAtMs > nowMs + MAX_GRANT_TTL_MS) {
        throw new CivicApiError(
          422,
          'INVALID_CUSTODY_EXPIRY',
          'El grant debe vencer entre cinco minutos y noventa días.',
          '$.expiresAt',
        );
      }

      const access = await store.getCircleAccess(recipientCircleId, userId);
      const custodialCircle = access && (access.kind === 'celula' || access.isPrivate);
      if (!custodialCircle || !access.membershipRole || !access.hasCoordinator) {
        // Un único error evita convertir ids secuenciales de círculos privados
        // en un oráculo de existencia o membresía.
        throw new CivicApiError(
          403,
          'CUSTODY_RECIPIENT_NOT_AVAILABLE',
          'El destinatario no es un círculo custodial verificable para esta cuenta.',
        );
      }

      const ownerActorKey = await this.resolveNeedOwner(store, input.needId, currentDevice, userId);
      const createdAt = now.toISOString();
      const previousOpen = await store.getOpenGrantForNeed(input.needId);
      if (previousOpen) {
        if (Date.parse(previousOpen.expiresAt) > nowMs) {
          throw new CivicApiError(
            409,
            'CUSTODY_ACTIVE_GRANT_EXISTS',
            'La necesidad ya tiene un grant vigente; debe revocarse o vencer antes de crear otro.',
          );
        }
        const closed = await store.markGrantExpired(previousOpen.grantId, createdAt);
        if (!closed) {
          const racedOpen = await store.getOpenGrantForNeed(input.needId);
          if (racedOpen) {
            throw new CivicApiError(409, 'CUSTODY_ACTIVE_GRANT_EXISTS', 'La necesidad ya tiene otro grant abierto.');
          }
        }
      }
      const inserted = await store.insertGrant({
        grantId: input.grantId,
        idempotencyKey,
        requestHash,
        needId: input.needId,
        ownerActorKey,
        grantorUserId: userId,
        recipientType: 'circle',
        recipientCircleId,
        payloadJson: payload,
        expiresAt,
        createdAt,
      });
      if (!inserted) {
        const afterRace = idempotentGrant(
          await store.findGrantConflicts(input.grantId, userId, idempotencyKey),
          userId,
          requestHash,
        );
        if (afterRace) {
          return {
            status: 'duplicate' as const,
            grant: await this.currentGrantView(store, afterRace, nowMs),
          };
        }
        if (await store.getOpenGrantForNeed(input.needId)) {
          throw new CivicApiError(
            409,
            'CUSTODY_ACTIVE_GRANT_EXISTS',
            'La necesidad ya tiene un grant vigente; debe revocarse o vencer antes de crear otro.',
          );
        }
        throw new CivicApiError(409, 'CUSTODY_IDEMPOTENCY_CONFLICT', 'El grant entró en conflicto con otra escritura.');
      }

      return {
        status: 'accepted' as const,
        grant: {
          grantId: input.grantId,
          recipient: { type: 'circle' as const, id: recipientCircleId },
          payload,
          expiresAt: custodyTimestampToIsoUtc(expiresAt, '$.grant.expiresAt'),
          createdAt: custodyTimestampToIsoUtc(createdAt, '$.grant.createdAt'),
          state: 'active' as const,
          response: null,
        },
      };
    };

    return this.store.runInTransaction
      ? this.store.runInTransaction(commit)
      : commit(this.store);
  }

  async listInbox(userId: number, limit: number, cursor?: string): Promise<{
    contract: 'basta-civic-custody-grants/v1';
    scope: 'private-circle-coordinator-inbox';
    grants: CustodyGrantView[];
    refreshedAt: string;
    truncated: boolean;
    nextCursor: string | null;
  }> {
    const page = decodeCustodyPageCursor(cursor, 'grant-inbox');
    const snapshot = await this.store.listActiveInbox(
      userId,
      limit + 1,
      this.clock().toISOString(),
      page,
    );
    if (!snapshot.authorized) {
      throw new CivicApiError(403, 'ACCOUNT_NOT_ACTIVE', 'La cuenta no está habilitada para operar grants.');
    }
    if (!snapshot.refreshedAt) {
      throw new CivicApiError(500, 'CUSTODY_INBOX_SNAPSHOT_INVALID', 'No se pudo fijar el reloj de la bandeja.');
    }
    const refreshedAt = custodyTimestampToIsoUtc(snapshot.refreshedAt, '$.refreshedAt');
    if (page && refreshedAt !== page.asOf) {
      throw new CivicApiError(
        422,
        'INVALID_CUSTODY_CURSOR',
        'El cursor no pertenece a un corte temporal válido.',
      );
    }
    const refreshedAtMs = Date.parse(refreshedAt);
    const visibleRows = snapshot.rows.slice(0, limit);
    const hasMore = snapshot.rows.length > limit;
    const last = visibleRows.at(-1);
    const nextCursor = hasMore && last
      ? encodeCustodyPageCursor('grant-inbox', {
        asOf: refreshedAt,
        after: {
          rowId: last.grant.rowId,
        },
      })
      : null;
    return {
      contract: 'basta-civic-custody-grants/v1',
      scope: 'private-circle-coordinator-inbox',
      grants: visibleRows.map(({ grant, response }) => viewFromRow(
        grant,
        refreshedAtMs,
        response,
      )),
      refreshedAt,
      truncated: hasMore,
      nextCursor,
    };
  }

  async respond(
    userId: number,
    input: CreateCustodyGrantResponseInput,
    idempotencyKey: string,
  ): Promise<{
    contract: 'basta-civic-custody-grants/v1';
    status: 'accepted' | 'duplicate' | 'already_recorded';
    grant: CustodyGrantView;
    recordedResponse: CustodyGrantRecordedResponseView;
  }> {
    await this.assertActiveUser(userId);
    const normalizedQuantity = input.quantity ?? null;
    const requestHash = hash({
      grantId: input.grantId,
      responseId: input.responseId,
      disposition: input.disposition,
      quantity: normalizedQuantity,
      responderUserId: userId,
    });

    const commit = async (store: CustodyGrantStore) => {
      if (!(await store.isActiveUser(userId))) {
        throw new CivicApiError(403, 'ACCOUNT_NOT_ACTIVE', 'La cuenta no está habilitada para responder grants.');
      }

      // Primero se bloquea la identidad estable del grant y se revalida la
      // capability actual. Así un tercero no puede usar el replay como oráculo,
      // pero una coordinación todavía autorizada puede recuperar una constancia
      // exacta aunque el grant haya vencido o sido revocado mientras se perdió
      // la respuesta HTTP original.
      const locatedGrant = await store.getGrantForUpdate(input.grantId);
      if (
        !locatedGrant
        || !(await store.isCircleCoordinator(locatedGrant.recipientCircleId, userId))
      ) {
        throw new CivicApiError(404, 'CUSTODY_GRANT_NOT_FOUND', 'El grant no existe o no está disponible.');
      }

      const replay = idempotentResponse(
        await store.findResponseConflicts(input.responseId, userId, idempotencyKey),
        userId,
        input.responseId,
        idempotencyKey,
        requestHash,
      );
      if (replay) {
        const observedAt = this.clock();
        return {
          contract: 'basta-civic-custody-grants/v1' as const,
          status: 'duplicate' as const,
          grant: await this.currentGrantView(store, locatedGrant, observedAt.getTime()),
          recordedResponse: recordedResponseViewFromRow(replay),
        };
      }

      // Sólo una mutación nueva necesita que el grant continúe operativo. El
      // store vuelve a comprobar cuenta, rol, círculo, cierre y vencimiento en
      // la misma transacción antes de aceptar otra respuesta.
      const now = this.clock();
      const grant = await store.getRespondableGrant(input.grantId, userId, now.toISOString());
      if (!grant) {
        throw new CivicApiError(404, 'CUSTODY_GRANT_NOT_FOUND', 'El grant no existe o no está disponible.');
      }

      const latest = await store.getLatestAppliedResponse(grant.grantId);
      let applied = true;
      let status: 'accepted' | 'already_recorded' = 'accepted';

      if (!latest && input.disposition !== 'assessing') {
        throw new CivicApiError(
          409,
          'CUSTODY_RESPONSE_ASSESSING_REQUIRED',
          'La coordinación debe registrar assessing antes de ofrecer apoyo.',
        );
      }
      if (latest?.disposition === 'support_available' && input.disposition === 'assessing') {
        throw new CivicApiError(
          409,
          'CUSTODY_RESPONSE_REGRESSION',
          'La respuesta no puede regresar de support_available a assessing.',
        );
      }
      if (latest?.disposition === 'assessing' && input.disposition === 'assessing') {
        applied = false;
        status = 'already_recorded';
      }

      // La propuesta congela la última capacidad ofrecida. Una revisión
      // posterior volvería ambiguo qué aceptó la persona dueña del grant.
      if (input.disposition === 'support_available' && await store.hasCoordinationProposal(grant.grantId)) {
        throw new CivicApiError(
          409,
          'CUSTODY_COORDINATION_PROPOSAL_EXISTS',
          'La capacidad quedó congelada por una propuesta de coordinación existente.',
        );
      }

      const payload = payloadFromRow(grant);
      let quantity: number | null = null;
      let unit: z.infer<typeof custodyNeedUnitSchema> | null = null;
      if (input.disposition === 'support_available') {
        const requestedQuantity = payload.quantity;
        const requestedUnit = payload.unit;
        if (requestedQuantity != null && requestedUnit != null) {
          if (normalizedQuantity != null && normalizedQuantity > requestedQuantity) {
            throw new CivicApiError(
              422,
              'INVALID_CUSTODY_RESPONSE_QUANTITY',
              'La cantidad ofrecida debe ser positiva y no superar la solicitada.',
              '$.quantity',
            );
          }
          if (normalizedQuantity != null) {
            quantity = normalizedQuantity;
            unit = requestedUnit;
          }
        } else if (normalizedQuantity != null) {
          throw new CivicApiError(
            422,
            'INVALID_CUSTODY_RESPONSE_QUANTITY',
            'Este grant no admite una cantidad de respuesta.',
            '$.quantity',
          );
        }
      }

      const inserted = await store.insertResponse({
        responseId: input.responseId,
        idempotencyKey,
        requestHash,
        grantId: grant.grantId,
        responderUserId: userId,
        disposition: input.disposition,
        quantity,
        unit,
        applied,
      });
      if (!inserted) {
        const afterRace = idempotentResponse(
          await store.findResponseConflicts(input.responseId, userId, idempotencyKey),
          userId,
          input.responseId,
          idempotencyKey,
          requestHash,
        );
        if (afterRace) {
          return {
            contract: 'basta-civic-custody-grants/v1' as const,
            status: 'duplicate' as const,
            grant: await this.currentGrantView(store, grant, now.getTime()),
            recordedResponse: recordedResponseViewFromRow(afterRace),
          };
        }
        throw new CivicApiError(
          409,
          'CUSTODY_RESPONSE_IDEMPOTENCY_CONFLICT',
          'La respuesta entró en conflicto con otra escritura.',
        );
      }

      const effectiveResponse = inserted.applied ? inserted : latest;
      if (!effectiveResponse) {
        throw new CivicApiError(
          500,
          'CUSTODY_RESPONSE_STATE_INVALID',
          'No se pudo resolver la respuesta vigente del grant.',
        );
      }
      return {
        contract: 'basta-civic-custody-grants/v1' as const,
        status,
        grant: viewFromRow(grant, now.getTime(), effectiveResponse),
        recordedResponse: recordedResponseViewFromRow(inserted),
      };
    };

    return this.store.runInTransaction
      ? this.store.runInTransaction(commit)
      : commit(this.store);
  }

  async revoke(userId: number, grantId: string, idempotencyKey: string): Promise<{
    status: 'revoked' | 'duplicate' | 'already_revoked';
    grantId: string;
    revokedAt: string;
  }> {
    await this.assertActiveUser(userId);
    const requestHash = hash({ grantId, userId });

    const commit = async (store: CustodyGrantStore) => {
      const result = (
        status: 'revoked' | 'duplicate' | 'already_revoked',
        revokedAt: string,
      ) => ({
        status,
        grantId,
        revokedAt: custodyTimestampToIsoUtc(revokedAt, '$.revokedAt'),
      });
      const rememberAlreadyRevoked = async (revokedAt: string) => {
        const appended = await store.appendRevocation({
          grantId,
          idempotencyKey,
          requestHash,
          revokedByUserId: userId,
          revokedAt,
        });
        if (appended) {
          return result('already_revoked', revokedAt);
        }
        const replay = idempotentRevocation(
          await store.findRevocation(userId, idempotencyKey),
          grantId,
          requestHash,
        );
        if (replay) return result('duplicate', replay.revokedAt);
        throw new CivicApiError(409, 'CUSTODY_IDEMPOTENCY_CONFLICT', 'La revocación entró en conflicto con otra escritura.');
      };

      if (!(await store.isActiveUser(userId))) {
        throw new CivicApiError(403, 'ACCOUNT_NOT_ACTIVE', 'La cuenta no está habilitada para operar grants.');
      }
      const raced = idempotentRevocation(
        await store.findRevocation(userId, idempotencyKey),
        grantId,
        requestHash,
      );
      if (raced) return result('duplicate', raced.revokedAt);

      const grant = await store.getGrant(grantId);
      if (!grant) {
        throw new CivicApiError(404, 'CUSTODY_GRANT_NOT_FOUND', 'El grant no existe o no está disponible.');
      }
      const grantorCanRevoke = grant.grantorUserId === userId;
      const stillOpenForRecipient = grant.closedAt == null
        && Date.parse(grant.expiresAt) > this.clock().getTime();
      const recipientCanRevoke = stillOpenForRecipient
        && await store.isCircleCoordinator(grant.recipientCircleId, userId);
      if (!grantorCanRevoke && !recipientCanRevoke) {
        // La misma respuesta que un id inexistente no filtra la existencia de
        // grants a cuentas ajenas al emisor o al círculo destinatario.
        throw new CivicApiError(404, 'CUSTODY_GRANT_NOT_FOUND', 'El grant no existe o no está disponible.');
      }
      if (
        grant.closedReason === 'expired'
        || (!grant.revokedAt && Date.parse(grant.expiresAt) <= this.clock().getTime())
      ) {
        throw new CivicApiError(409, 'CUSTODY_GRANT_EXPIRED', 'El grant ya venció y no puede revocarse.');
      }
      if (grant.revokedAt) {
        return rememberAlreadyRevoked(grant.revokedAt);
      }

      const revokedAt = this.clock().toISOString();
      const authoritativeRevokedAt = await store.markGrantRevoked(grantId, userId, revokedAt);
      if (!authoritativeRevokedAt) {
        const afterRace = await store.getGrant(grantId);
        if (afterRace?.revokedAt) {
          return rememberAlreadyRevoked(afterRace.revokedAt);
        }
        if (
          afterRace?.closedReason === 'expired'
          || await store.isGrantExpired(grantId, revokedAt)
        ) {
          throw new CivicApiError(409, 'CUSTODY_GRANT_EXPIRED', 'El grant ya venció y no puede revocarse.');
        }
        throw new CivicApiError(409, 'CUSTODY_REVOCATION_CONFLICT', 'No se pudo asentar la revocación.');
      }

      const appended = await store.appendRevocation({
        grantId,
        idempotencyKey,
        requestHash,
        revokedByUserId: userId,
        revokedAt: authoritativeRevokedAt,
      });
      if (!appended) {
        const replay = idempotentRevocation(
          await store.findRevocation(userId, idempotencyKey),
          grantId,
          requestHash,
        );
        if (replay) return result('duplicate', replay.revokedAt);
        throw new CivicApiError(409, 'CUSTODY_IDEMPOTENCY_CONFLICT', 'La revocación entró en conflicto con otra escritura.');
      }
      return result('revoked', authoritativeRevokedAt);
    };

    return this.store.runInTransaction
      ? this.store.runInTransaction(commit)
      : commit(this.store);
  }
}
