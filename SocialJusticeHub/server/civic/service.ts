import { createHash } from 'node:crypto';
import { z } from 'zod';

import {
  canonicalJson,
  civicActorKeySchema,
  civicUuidV4Schema,
  inspectPublicPayload,
  normalizePublicEventPayload,
  type CivicDeviceRole,
  type CivicEntityType,
  type CivicEventInput,
} from './contracts';

export interface CivicDeviceRecord {
  actorKey: string;
  secretHash: string;
  role: CivicDeviceRole;
  linkedUserId: number | null;
  revokedAt: string | null;
}

export interface StoredCivicEvent {
  eventId: string;
  idempotencyKey: string;
  actorKey: string;
  eventHash: string;
}

export interface CivicMatchParties {
  matchId: string;
  needActorKey: string;
  resourceActorKey: string;
  createdByActorKey: string;
  needAcceptedAt: string | null;
  resourceAcceptedAt: string | null;
  fulfilledAt: string | null;
  confirmedAt: string | null;
}

export interface CivicActionLinkRecord {
  actionId: string;
  matchId: string;
  createdByActorKey: string;
  completedAt: string | null;
  confirmedAt: string | null;
}

export type ClaimResult = 'claimed' | 'same' | 'conflict';
export type TransitionClaimResult = 'recorded' | 'already_recorded' | 'prerequisite_missing';

export interface CivicEventStore {
  /** El store productivo encierra autorización, claims y append en un commit. */
  runInTransaction?<T>(operation: (store: CivicEventStore) => Promise<T>): Promise<T>;
  getDevice(actorKey: string): Promise<CivicDeviceRecord | null>;
  createDevice(actorKey: string, secretHash: string): Promise<CivicDeviceRecord>;
  linkDevice(actorKey: string, userId: number): Promise<'linked' | 'same' | 'conflict' | 'missing'>;
  unlinkDevice(actorKey: string, userId: number): Promise<boolean>;
  touchDevice(actorKey: string): Promise<void>;
  findEvents(eventId: string, idempotencyKey: string): Promise<StoredCivicEvent[]>;
  appendEvent(input: {
    event: CivicEventInput;
    idempotencyKey: string;
    actorKey: string;
    eventHash: string;
  }): Promise<boolean>;
  getOwner(entityType: CivicEntityType, entityId: string): Promise<string | null>;
  claimOwner(entityType: CivicEntityType, entityId: string, actorKey: string): Promise<ClaimResult>;
  claimVerification(input: {
    observationId: string;
    verifierActorKey: string;
    verificationId: string;
  }): Promise<ClaimResult>;
  getMatchParties(matchId: string): Promise<CivicMatchParties | null>;
  claimMatchParties(parties: CivicMatchParties): Promise<ClaimResult>;
  recordMatchAcceptance(matchId: string, side: 'need' | 'resource'): Promise<TransitionClaimResult>;
  recordMatchFulfillment(matchId: string): Promise<TransitionClaimResult>;
  recordMatchConfirmation(matchId: string): Promise<TransitionClaimResult>;
  getActionLink(actionId: string): Promise<CivicActionLinkRecord | null>;
  claimActionLink(link: CivicActionLinkRecord): Promise<ClaimResult>;
  recordActionCompletion(actionId: string): Promise<TransitionClaimResult>;
  recordActionConfirmation(actionId: string): Promise<TransitionClaimResult>;
}

export class CivicApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly path?: string,
  ) {
    super(message);
    this.name = 'CivicApiError';
  }
}

export interface CivicActorContext {
  actorKey: string;
  role: CivicDeviceRole;
  linkedUserId: number | null;
}

function requiredUuid(payload: Record<string, unknown>, key: string): string {
  const parsed = civicUuidV4Schema.safeParse(payload[key]);
  if (!parsed.success) {
    throw new CivicApiError(422, 'INVALID_REFERENCE', `${key} debe ser un UUID válido.`, `$.${key}`);
  }
  return parsed.data;
}

const UUID_REFERENCE_FIELDS = new Set([
  'id',
  'observationId',
  'needId',
  'resourceId',
  'matchId',
  'actionId',
  'territoryId',
]);
const ACTOR_REFERENCE_FIELDS = new Set([
  'creatorKey',
  'verifierKey',
  'acceptedNeedBy',
  'acceptedResourceBy',
]);

const canonicalizePayloadReferences = (payload: Record<string, unknown>): Record<string, unknown> => {
  const canonical = { ...payload };
  for (const [key, value] of Object.entries(canonical)) {
    const schema = UUID_REFERENCE_FIELDS.has(key)
      ? civicUuidV4Schema
      : ACTOR_REFERENCE_FIELDS.has(key)
        ? civicActorKeySchema
        : null;
    if (!schema) continue;
    const parsed = schema.safeParse(value);
    if (parsed.success) canonical[key] = parsed.data;
  }
  return canonical;
};

function requiredString(payload: Record<string, unknown>, key: string): string {
  const value = payload[key];
  if (typeof value !== 'string' || value.length === 0) {
    throw new CivicApiError(422, 'INVALID_FIELD', `${key} es obligatorio.`, `$.${key}`);
  }
  return value;
}

function forbidden(message: string, code = 'AUTHORIZATION_FAILED'): never {
  throw new CivicApiError(403, code, message);
}

function validateRevocationEnvelope(event: CivicEventInput): void {
  if (!Object.prototype.hasOwnProperty.call(event.payload, 'revokedAt')) return;
  if (!['observation', 'need', 'resource'].includes(event.entityType) || event.operation !== 'update') {
    throw new CivicApiError(
      422,
      'INVALID_REVOCATION_OPERATION',
      'La revocación debe ser una actualización auditable de una entidad publicable.',
      '$.payload.revokedAt',
    );
  }
  const parsed = z.string().datetime().safeParse(event.payload.revokedAt);
  if (!parsed.success) {
    throw new CivicApiError(422, 'INVALID_REVOCATION_TIMESTAMP', 'revokedAt debe ser una fecha ISO válida.', '$.payload.revokedAt');
  }
  if (Date.parse(parsed.data) > Date.now() + 10 * 60_000) {
    throw new CivicApiError(422, 'FUTURE_REVOCATION', 'La revocación está demasiado adelantada.', '$.payload.revokedAt');
  }
  if (event.payload.audience !== 'collective') {
    throw new CivicApiError(
      422,
      'INVALID_REVOCATION_AUDIENCE',
      'La revocación debe circular por la misma audiencia colectiva para retirar su proyección.',
      '$.payload.audience',
    );
  }
  if (
    event.entityType === 'observation'
    && (typeof event.payload.campaignKey !== 'string' || event.payload.campaignKey.length === 0)
  ) {
    throw new CivicApiError(
      422,
      'MISSING_REVOCATION_CAMPAIGN',
      'La revocación de una observación debe conservar su campaña para respetar el canal de privacidad.',
      '$.payload.campaignKey',
    );
  }
  const allowed = new Set(['id', 'audience', 'revokedAt', 'updatedAt', 'campaignKey']);
  const unexpected = Object.keys(event.payload).find((key) => !allowed.has(key));
  if (unexpected) {
    throw new CivicApiError(
      422,
      'INVALID_REVOCATION_FIELDS',
      'La revocación sólo puede contener el sobre mínimo auditable.',
      `$.payload.${unexpected}`,
    );
  }
}

/**
 * Los clientes anteriores enviaban snapshots completos al corregir lugar o
 * firma. Para no romper esas correcciones y, a la vez, impedir que un dueño se
 * otorgue confianza o estados operativos, el servidor elimina exclusivamente
 * campos derivados antes de hashear y persistir el evento. Las transiciones
 * autorizadas conservan sus contratos separados.
 */
function withoutServerDerivedUpdateFields(event: CivicEventInput): CivicEventInput {
  if (event.operation !== 'update') return event;
  const forbidden = event.entityType === 'observation'
    ? ['status', 'confidence']
    : event.entityType === 'need'
      ? ['status']
      : event.entityType === 'resource'
        ? ['status', 'confidence']
        : [];
  if (forbidden.length === 0 || forbidden.every((key) => !(key in event.payload))) return event;
  const payload = { ...event.payload };
  for (const key of forbidden) delete payload[key];
  return { ...event, payload };
}

export class CivicEventService {
  constructor(private readonly store: CivicEventStore) {}

  async ingest(
    actor: CivicActorContext,
    event: CivicEventInput,
    idempotencyKey: string,
  ): Promise<{ status: 'accepted' | 'duplicate'; eventId: string }> {
    const eventId = civicUuidV4Schema.safeParse(event.eventId);
    const entityId = civicUuidV4Schema.safeParse(event.entityId);
    if (!eventId.success || !entityId.success) {
      throw new CivicApiError(422, 'INVALID_REFERENCE', 'eventId y entityId deben ser UUID v4 válidos.');
    }
    const canonicalEvent: CivicEventInput = {
      ...event,
      eventId: eventId.data,
      entityId: entityId.data,
      payload: canonicalizePayloadReferences(event.payload),
    };
    const occurredAt = Date.parse(canonicalEvent.createdAt);
    if (occurredAt > Date.now() + 10 * 60_000) {
      throw new CivicApiError(422, 'FUTURE_EVENT', 'La fecha del evento está demasiado adelantada.', '$.createdAt');
    }

    validateRevocationEnvelope(canonicalEvent);

    const normalized = normalizePublicEventPayload(canonicalEvent.entityType, canonicalEvent.payload);
    if (normalized.issue) {
      throw new CivicApiError(
        422,
        normalized.issue.code,
        'El evento no tiene una proyección pública segura.',
        normalized.issue.path,
      );
    }
    const publicEvent = withoutServerDerivedUpdateFields({ ...canonicalEvent, payload: normalized.payload });
    const eventHash = createHash('sha256').update(canonicalJson({ ...publicEvent, idempotencyKey })).digest('hex');
    const existing = await this.store.findEvents(canonicalEvent.eventId, idempotencyKey);
    if (existing.length > 0) {
      if (existing.every((row) => row.eventHash === eventHash && row.actorKey === actor.actorKey)) {
        return { status: 'duplicate', eventId: canonicalEvent.eventId };
      }
      throw new CivicApiError(
        409,
        'IDEMPOTENCY_CONFLICT',
        'La identidad del evento ya fue usada con otro contenido.',
      );
    }

    const safetyIssue = inspectPublicPayload(publicEvent.payload);
    if (safetyIssue) {
      throw new CivicApiError(
        safetyIssue.code === 'PAYLOAD_TOO_LARGE' ? 413 : 422,
        safetyIssue.code,
        'El evento contiene datos que no pueden entrar al registro público.',
        safetyIssue.path,
      );
    }

    if (typeof publicEvent.payload.id === 'string' && publicEvent.payload.id !== publicEvent.entityId) {
      throw new CivicApiError(422, 'ENTITY_ID_MISMATCH', 'payload.id no coincide con entityId.', '$.payload.id');
    }

    const commit = async (store: CivicEventStore): Promise<{ status: 'accepted' | 'duplicate'; eventId: string }> => {
      // Relee dentro de la transacción: la comprobación temprana sólo evita
      // abrir un commit para el caso común de reintento ya asentado.
      const racedBeforeClaim = await store.findEvents(canonicalEvent.eventId, idempotencyKey);
      if (racedBeforeClaim.length > 0) {
        if (racedBeforeClaim.every((row) => row.eventHash === eventHash && row.actorKey === actor.actorKey)) {
          return { status: 'duplicate', eventId: canonicalEvent.eventId };
        }
        throw new CivicApiError(409, 'IDEMPOTENCY_CONFLICT', 'La identidad del evento ya fue usada con otro contenido.');
      }

      const transactionalService = store === this.store ? this : new CivicEventService(store);
      await transactionalService.authorizeAndClaim(actor, publicEvent);

      const inserted = await store.appendEvent({
        event: publicEvent,
        idempotencyKey,
        actorKey: actor.actorKey,
        eventHash,
      });
      if (!inserted) {
        const raced = await store.findEvents(canonicalEvent.eventId, idempotencyKey);
        if (raced.length > 0 && raced.every((row) => row.eventHash === eventHash && row.actorKey === actor.actorKey)) {
          return { status: 'duplicate', eventId: canonicalEvent.eventId };
        }
        throw new CivicApiError(409, 'IDEMPOTENCY_CONFLICT', 'El evento entró en conflicto con otra escritura.');
      }
      await store.touchDevice(actor.actorKey);
      return { status: 'accepted', eventId: canonicalEvent.eventId };
    };

    return this.store.runInTransaction
      ? this.store.runInTransaction(commit)
      : commit(this.store);
  }

  private async claimNewOwner(entityType: CivicEntityType, entityId: string, actorKey: string): Promise<void> {
    const current = await this.store.getOwner(entityType, entityId);
    if (current) {
      if (current !== actorKey) forbidden('La entidad pertenece a otro actor.');
      throw new CivicApiError(409, 'ENTITY_ALREADY_EXISTS', 'La entidad ya fue creada.');
    }
    const result = await this.store.claimOwner(entityType, entityId, actorKey);
    if (result === 'conflict') forbidden('La entidad pertenece a otro actor.');
    if (result === 'same') throw new CivicApiError(409, 'ENTITY_ALREADY_EXISTS', 'La entidad ya fue creada.');
  }

  private async requireOwner(
    entityType: CivicEntityType,
    entityId: string,
    actorKey: string,
    allowFirstClaim = false,
  ): Promise<void> {
    const current = await this.store.getOwner(entityType, entityId);
    if (!current && allowFirstClaim) {
      const result = await this.store.claimOwner(entityType, entityId, actorKey);
      if (result === 'conflict') forbidden('La entidad pertenece a otro actor.');
      return;
    }
    if (!current) throw new CivicApiError(409, 'ENTITY_NOT_FOUND', 'La entidad todavía no existe en el servidor.');
    if (current !== actorKey) forbidden('Sólo el actor de origen puede modificar esta entidad.');
  }

  private async authorizeAndClaim(actor: CivicActorContext, event: CivicEventInput): Promise<void> {
    if (event.operation === 'delete') {
      forbidden('El borrado remoto requiere un flujo de revocación auditable.', 'AUDITED_REVOCATION_REQUIRED');
    }

    const payload = event.payload;
    switch (event.entityType) {
      case 'observation': {
        if (event.operation === 'create') {
          if (requiredString(payload, 'creatorKey') !== actor.actorKey) {
            forbidden('creatorKey debe coincidir con el dispositivo autenticado.', 'ACTOR_MISMATCH');
          }
          await this.claimNewOwner('observation', event.entityId, actor.actorKey);
          return;
        }
        if (event.operation === 'transition') {
          forbidden('La confianza de una observación se deriva de verificaciones en el servidor.', 'SERVER_DERIVED_STATE');
        }
        await this.requireOwner('observation', event.entityId, actor.actorKey);
        return;
      }
      case 'need': {
        if (event.operation === 'create') {
          if (payload.observationId != null) {
            const observationId = requiredUuid(payload, 'observationId');
            const observationOwner = await this.store.getOwner('observation', observationId);
            if (!observationOwner) throw new CivicApiError(409, 'RELATED_ENTITY_NOT_FOUND', 'La observación vinculada todavía no existe.');
            if (observationOwner !== actor.actorKey) forbidden('No podés crear una necesidad derivada de otra persona.');
          }
          await this.claimNewOwner('need', event.entityId, actor.actorKey);
          return;
        }
        await this.requireOwner('need', event.entityId, actor.actorKey);
        if (['matched', 'in_progress', 'resolved'].includes(String(payload.status))) {
          forbidden('Ese estado de necesidad se deriva de una conexión confirmada.', 'SERVER_DERIVED_STATE');
        }
        return;
      }
      case 'resource': {
        if (event.operation === 'create') {
          await this.claimNewOwner('resource', event.entityId, actor.actorKey);
          return;
        }
        await this.requireOwner('resource', event.entityId, actor.actorKey);
        if (['reserved', 'depleted'].includes(String(payload.status))) {
          forbidden('Ese estado de recurso se deriva de una conexión confirmada.', 'SERVER_DERIVED_STATE');
        }
        return;
      }
      case 'territory': {
        if (event.operation === 'create') {
          await this.claimNewOwner('territory', event.entityId, actor.actorKey);
        } else {
          await this.requireOwner('territory', event.entityId, actor.actorKey);
        }
        return;
      }
      case 'consent': {
        if (event.operation !== 'update') {
          throw new CivicApiError(422, 'INVALID_OPERATION', 'El consentimiento se registra como una actualización versionada.');
        }
        await this.requireOwner('consent', event.entityId, actor.actorKey, true);
        return;
      }
      case 'verification': {
        if (event.operation !== 'create') {
          throw new CivicApiError(422, 'INVALID_OPERATION', 'Una verificación es un evento append-only.');
        }
        const observationId = requiredUuid(payload, 'observationId');
        if (requiredString(payload, 'verifierKey') !== actor.actorKey) {
          forbidden('verifierKey debe coincidir con el dispositivo autenticado.', 'ACTOR_MISMATCH');
        }
        const observationOwner = await this.store.getOwner('observation', observationId);
        if (!observationOwner) throw new CivicApiError(409, 'RELATED_ENTITY_NOT_FOUND', 'La observación todavía no existe.');
        if (observationOwner === actor.actorKey) {
          forbidden('Nadie puede verificar su propia observación.', 'SELF_VERIFICATION_FORBIDDEN');
        }
        const ownerDevice = await this.store.getDevice(observationOwner);
        if (
          actor.linkedUserId != null
          && ownerDevice?.linkedUserId != null
          && actor.linkedUserId === ownerDevice.linkedUserId
        ) {
          forbidden('La verificación debe provenir de otra cuenta.', 'SELF_VERIFICATION_FORBIDDEN');
        }
        const claim = await this.store.claimVerification({
          observationId,
          verifierActorKey: actor.actorKey,
          verificationId: event.entityId,
        });
        if (claim === 'conflict') {
          throw new CivicApiError(409, 'ALREADY_VERIFIED', 'Este actor ya verificó la observación.');
        }
        return;
      }
      case 'match':
        await this.authorizeMatch(actor.actorKey, event);
        return;
      case 'action':
        await this.authorizeAction(actor.actorKey, event);
        return;
    }
  }

  private async authorizeMatch(actorKey: string, event: CivicEventInput): Promise<void> {
    const payload = event.payload;
    if (event.operation === 'create') {
      const needId = requiredUuid(payload, 'needId');
      const resourceId = requiredUuid(payload, 'resourceId');
      const [needActorKey, resourceActorKey] = await Promise.all([
        this.store.getOwner('need', needId),
        this.store.getOwner('resource', resourceId),
      ]);
      if (!needActorKey || !resourceActorKey) {
        throw new CivicApiError(409, 'RELATED_ENTITY_NOT_FOUND', 'La necesidad o el recurso todavía no existe.');
      }
      if (needActorKey === resourceActorKey) {
        forbidden('Una misma identidad no puede ocupar los dos lados de una conexión.', 'DISTINCT_PARTIES_REQUIRED');
      }
      const [needDevice, resourceDevice] = await Promise.all([
        this.store.getDevice(needActorKey),
        this.store.getDevice(resourceActorKey),
      ]);
      if (
        needDevice?.linkedUserId != null
        && resourceDevice?.linkedUserId != null
        && needDevice.linkedUserId === resourceDevice.linkedUserId
      ) {
        forbidden('Las dos partes deben pertenecer a cuentas distintas.', 'DISTINCT_PARTIES_REQUIRED');
      }
      if (actorKey !== needActorKey && actorKey !== resourceActorKey) {
        forbidden('Sólo una de las partes puede proponer la conexión.');
      }
      const claim = await this.store.claimMatchParties({
        matchId: event.entityId,
        needActorKey,
        resourceActorKey,
        createdByActorKey: actorKey,
        needAcceptedAt: null,
        resourceAcceptedAt: null,
        fulfilledAt: null,
        confirmedAt: null,
      });
      if (claim === 'conflict') forbidden('La conexión ya está vinculada a otras partes.');
      if (claim === 'same') throw new CivicApiError(409, 'ENTITY_ALREADY_EXISTS', 'La conexión ya fue creada.');
      return;
    }

    if (event.operation !== 'transition') {
      throw new CivicApiError(422, 'INVALID_OPERATION', 'La conexión sólo admite creación o transición.');
    }
    const parties = await this.store.getMatchParties(event.entityId);
    if (!parties) throw new CivicApiError(409, 'ENTITY_NOT_FOUND', 'La conexión todavía no existe.');
    if (actorKey !== parties.needActorKey && actorKey !== parties.resourceActorKey) {
      forbidden('Sólo las dos partes pueden operar esta conexión.');
    }

    const acceptsNeed = typeof event.payload.acceptedNeedBy === 'string';
    const acceptsResource = typeof event.payload.acceptedResourceBy === 'string';
    if (acceptsNeed && acceptsResource) {
      forbidden('Cada evento sólo puede aceptar un lado.', 'DISTINCT_ACCEPTANCE_REQUIRED');
    }
    if (acceptsNeed && (event.payload.acceptedNeedBy !== actorKey || actorKey !== parties.needActorKey)) {
      forbidden('Sólo quien expresó la necesidad puede aceptar ese lado.');
    }
    if (acceptsResource && (event.payload.acceptedResourceBy !== actorKey || actorKey !== parties.resourceActorKey)) {
      forbidden('Sólo quien ofrece el recurso puede aceptar ese lado.');
    }

    const status = typeof event.payload.status === 'string' ? event.payload.status : null;
    if (status && !['accepted', 'in_progress', 'fulfilled', 'confirmed', 'declined', 'cancelled'].includes(status)) {
      throw new CivicApiError(422, 'INVALID_STATE', 'La transición de conexión no es válida.', '$.status');
    }
    if ((acceptsNeed || acceptsResource) && status && status !== 'accepted') {
      throw new CivicApiError(422, 'ONE_TRANSITION_PER_EVENT', 'La aceptación y el cambio de etapa deben registrarse por separado.');
    }
    if (status === 'accepted') {
      if (!acceptsNeed && !acceptsResource) {
        forbidden('El estado aceptado requiere una aceptación de parte verificable.', 'DISTINCT_ACCEPTANCE_REQUIRED');
      }
      const oppositeAccepted = acceptsNeed ? parties.resourceAcceptedAt : parties.needAcceptedAt;
      if (!oppositeAccepted) {
        throw new CivicApiError(409, 'BOTH_ACCEPTANCES_REQUIRED', 'La conexión requiere la aceptación previa de la otra parte.');
      }
    }
    if (acceptsNeed || acceptsResource) {
      const result = await this.store.recordMatchAcceptance(event.entityId, acceptsNeed ? 'need' : 'resource');
      if (result === 'already_recorded') {
        throw new CivicApiError(409, 'SIDE_ALREADY_ACCEPTED', 'Ese lado ya había aceptado la conexión.');
      }
    }
    if (status === 'in_progress') {
      if (!parties.needAcceptedAt || !parties.resourceAcceptedAt) {
        throw new CivicApiError(409, 'BOTH_ACCEPTANCES_REQUIRED', 'La conexión requiere la aceptación previa de ambas partes.');
      }
    }
    if (status === 'fulfilled' && actorKey !== parties.resourceActorKey) {
      forbidden('Sólo quien aporta puede marcar la entrega.');
    }
    if (status === 'fulfilled') {
      const result = await this.store.recordMatchFulfillment(event.entityId);
      if (result === 'prerequisite_missing') {
        throw new CivicApiError(409, 'BOTH_ACCEPTANCES_REQUIRED', 'La entrega requiere la aceptación previa de ambas partes.');
      }
      if (result === 'already_recorded') {
        throw new CivicApiError(409, 'MATCH_ALREADY_FULFILLED', 'La entrega ya había sido registrada.');
      }
    }
    if (status === 'confirmed' && actorKey !== parties.needActorKey) {
      forbidden('Sólo quien recibe puede confirmar la resolución.');
    }
    if (status === 'confirmed') {
      const result = await this.store.recordMatchConfirmation(event.entityId);
      if (result === 'prerequisite_missing') {
        throw new CivicApiError(409, 'FULFILLMENT_REQUIRED', 'La recepción sólo puede confirmarse después de la entrega.');
      }
      if (result === 'already_recorded') {
        throw new CivicApiError(409, 'MATCH_ALREADY_CONFIRMED', 'La resolución ya había sido confirmada.');
      }
    }
  }

  private async authorizeAction(actorKey: string, event: CivicEventInput): Promise<void> {
    const payload = event.payload;
    if (event.operation === 'create') {
      const matchId = requiredUuid(payload, 'matchId');
      const parties = await this.store.getMatchParties(matchId);
      if (!parties) throw new CivicApiError(409, 'RELATED_ENTITY_NOT_FOUND', 'La conexión todavía no existe.');
      if (actorKey !== parties.needActorKey && actorKey !== parties.resourceActorKey) {
        forbidden('Sólo una de las partes puede crear una acción.');
      }
      if (!parties.needAcceptedAt || !parties.resourceAcceptedAt) {
        throw new CivicApiError(409, 'BOTH_ACCEPTANCES_REQUIRED', 'La acción requiere la aceptación previa de ambas partes.');
      }
      const claim = await this.store.claimActionLink({
        actionId: event.entityId,
        matchId,
        createdByActorKey: actorKey,
        completedAt: null,
        confirmedAt: null,
      });
      if (claim === 'conflict') forbidden('La acción ya está vinculada a otra conexión.');
      if (claim === 'same') throw new CivicApiError(409, 'ENTITY_ALREADY_EXISTS', 'La acción ya fue creada.');
      return;
    }

    if (event.operation !== 'transition') {
      throw new CivicApiError(422, 'INVALID_OPERATION', 'La acción sólo admite creación o transición.');
    }
    const link = await this.store.getActionLink(event.entityId);
    if (!link) throw new CivicApiError(409, 'ENTITY_NOT_FOUND', 'La acción todavía no existe.');
    const parties = await this.store.getMatchParties(link.matchId);
    if (!parties) throw new CivicApiError(409, 'RELATED_ENTITY_NOT_FOUND', 'La conexión de la acción no existe.');
    if (actorKey !== parties.needActorKey && actorKey !== parties.resourceActorKey) {
      forbidden('Sólo las partes pueden operar esta acción.');
    }
    const status = typeof payload.status === 'string' ? payload.status : null;
    if (status && !['in_progress', 'completed', 'confirmed', 'cancelled'].includes(status)) {
      throw new CivicApiError(422, 'INVALID_STATE', 'La transición de acción no es válida.', '$.status');
    }
    if (status === 'completed' && actorKey !== parties.resourceActorKey) {
      forbidden('Sólo quien aporta puede marcar la entrega.');
    }
    if (status === 'completed') {
      const result = await this.store.recordActionCompletion(event.entityId);
      if (result === 'already_recorded') {
        throw new CivicApiError(409, 'ACTION_ALREADY_COMPLETED', 'La entrega ya había sido registrada.');
      }
    }
    if (status === 'confirmed' && actorKey !== parties.needActorKey) {
      forbidden('Sólo quien recibe puede confirmar el resultado.');
    }
    if (status === 'confirmed') {
      const result = await this.store.recordActionConfirmation(event.entityId);
      if (result === 'prerequisite_missing') {
        throw new CivicApiError(409, 'ACTION_COMPLETION_REQUIRED', 'El resultado sólo puede confirmarse después de la entrega.');
      }
      if (result === 'already_recorded') {
        throw new CivicApiError(409, 'ACTION_ALREADY_CONFIRMED', 'El resultado ya había sido confirmado.');
      }
    }
  }
}
