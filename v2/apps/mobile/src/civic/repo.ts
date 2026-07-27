import { and, asc, eq, inArray } from 'drizzle-orm';

import { ahoraISO, ganarBrasasUnaVez, nuevoId } from '@/db/repos';
import { db, type DBExecutor } from '@/db/client';
import {
  civicActions,
  civicConsents,
  civicMatches,
  civicNeeds,
  civicObservations,
  civicResources,
  civicTerritories,
  civicVerifications,
  syncOutbox,
} from '@/db/schema';
import type {
  CivicActionRow,
  CivicConsentRow,
  CivicMatchRow,
  CivicNeedRow,
  CivicObservationRow,
  CivicResourceRow,
  CivicTerritoryRow,
  CivicVerificationRow,
  SyncOutboxRow,
} from '@/db/schema';
import { GANANCIAS, MOTIVOS } from '@/game/brasas';

import {
  appendDisclosureReceipt,
  appendDisclosureRevocation,
  disclosureReceiptsFor,
} from './disclosure-ledger';
import {
  CURRENT_DISCLOSURE_POLICY_VERSION,
  DISCLOSURE_PURPOSE,
} from './disclosure-receipt';
import { haversineKm, publicLocationUncertaintyKm } from './geo';
import { prepareRecordLocation } from './location-policy';
import { scoreMatch } from './matching';
import { redactPublicValue } from './safety';
import { syncMissionCellForObservation } from './missions';
import { assessObservation } from './quality';
import {
  canDiscloseRecordLocation,
  publicContextFields,
  recordContextFor,
  saveRecordContext,
  setRecordContextAudience,
} from './record-context';
import { canTransitionAction, canTransitionMatch, mergeActionOutcome } from './workflow';
import type {
  CivicActionStatus,
  CivicCampaignKey,
  CivicDisclosureEntity,
  CivicRecordContextInput,
  ConsentScope,
  GeoPoint,
  LocationPrecision,
  MatchStatus,
  NeedStatus,
  ResourceStatus,
  SyncEntity,
  SyncOperation,
  VerificationVerdict,
} from './types';

const json = (value: unknown): string => JSON.stringify(value);

/**
 * Los URI de cámara son rutas privadas del dispositivo. El servidor sólo
 * recibe que existe evidencia y su tipo; una futura cola de archivos pedirá
 * consentimiento explícito antes de subir el contenido.
 */
const publicEvidence = (items: Record<string, unknown>[]): Record<string, unknown>[] =>
  items.map((item) => ({
    kind: typeof item.kind === 'string' ? item.kind : 'evidence',
    present: true,
    capturedAt: typeof item.capturedAt === 'string' ? item.capturedAt : undefined,
  }));

const publicObservationPayload = (row: CivicObservationRow, contextOverride?: ReturnType<typeof recordContextFor>) => {
  const context = contextOverride === undefined ? recordContextFor('observation', row.id) : contextOverride;
  const discloseLocation = canDiscloseRecordLocation(context);
  const publicLat = context?.publicLat ?? null;
  const publicLng = context?.publicLng ?? null;
  return ({
  id: row.id,
  campaignKey: row.campaignKey,
  campaignVersion: row.campaignVersion,
  creatorKey: row.creatorKey,
  territoryId: row.territoryId,
  category: row.category,
  title: row.title,
  summary: row.summary,
  data: JSON.parse(row.dataJson) as unknown,
  evidence: publicEvidence(JSON.parse(row.evidenceJson) as Record<string, unknown>[]),
  status: row.status,
  confidence: row.confidence,
  location: !discloseLocation || publicLat == null || publicLng == null
    ? null
    : { lat: publicLat, lng: publicLng },
  locationPrecision: context?.sharedPrecision ?? row.publicPrecision,
  locationLabel: discloseLocation ? context?.locationLabel ?? null : null,
  observedAt: row.observedAt,
  expiresAt: row.expiresAt,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
  ...publicContextFields(context),
  });
};

const publicNeedPayload = (row: CivicNeedRow, contextOverride?: ReturnType<typeof recordContextFor>) => {
  const context = contextOverride === undefined ? recordContextFor('need', row.id) : contextOverride;
  const discloseLocation = canDiscloseRecordLocation(context);
  return ({
  id: row.id,
  observationId: row.observationId,
  territoryId: row.territoryId,
  category: row.category,
  title: row.title,
  description: row.description,
  quantity: row.quantity,
  unit: row.unit,
  urgency: row.urgency,
  status: row.status,
  publicLat: discloseLocation ? context?.publicLat ?? null : null,
  publicLng: discloseLocation ? context?.publicLng ?? null : null,
  publicPrecision: context?.sharedPrecision ?? row.publicPrecision,
  locationLabel: discloseLocation ? context?.locationLabel ?? null : null,
  expiresAt: row.expiresAt,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
  ...publicContextFields(context),
  });
};

const publicResourcePayload = (row: CivicResourceRow, contextOverride?: ReturnType<typeof recordContextFor>) => {
  const context = contextOverride === undefined ? recordContextFor('resource', row.id) : contextOverride;
  const discloseLocation = canDiscloseRecordLocation(context);
  return ({
  id: row.id,
  territoryId: row.territoryId,
  category: row.category,
  title: row.title,
  description: row.description,
  quantity: row.quantity,
  unit: row.unit,
  availabilityJson: row.availabilityJson,
  radiusKm: row.radiusKm,
  confidence: row.confidence,
  status: row.status,
  publicLat: discloseLocation ? context?.publicLat ?? null : null,
  publicLng: discloseLocation ? context?.publicLng ?? null : null,
  publicPrecision: context?.sharedPrecision ?? row.publicPrecision,
  locationLabel: discloseLocation ? context?.locationLabel ?? null : null,
  expiresAt: row.expiresAt,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
  ...publicContextFields(context),
  });
};

/** Una corrección de contexto no puede reescribir estados derivados por la red. */
const publicObservationCorrectionPayload = (
  row: CivicObservationRow,
  context: ReturnType<typeof recordContextFor>,
): Record<string, unknown> => {
  const { status: _status, confidence: _confidence, ...payload } = publicObservationPayload(row, context);
  return payload;
};

const publicNeedCorrectionPayload = (
  row: CivicNeedRow,
  context: ReturnType<typeof recordContextFor>,
): Record<string, unknown> => {
  const { status: _status, ...payload } = publicNeedPayload(row, context);
  return payload;
};

const publicResourceCorrectionPayload = (
  row: CivicResourceRow,
  context: ReturnType<typeof recordContextFor>,
): Record<string, unknown> => {
  const { status: _status, confidence: _confidence, ...payload } = publicResourcePayload(row, context);
  return payload;
};

const enqueueSync = (
  entityType: SyncEntity,
  entityId: string,
  operation: SyncOperation,
  payload: unknown,
  idempotencyKey = `${entityType}:${entityId}:${operation}`,
  database: DBExecutor = db,
): SyncOutboxRow => {
  const now = ahoraISO();
  const payloadJson = json(redactPublicValue(payload));
  const row: SyncOutboxRow = {
    id: nuevoId(),
    idempotencyKey,
    entityType,
    entityId,
    operation,
    payloadJson,
    status: 'pending',
    attempts: 0,
    nextAttemptAt: null,
    lastError: null,
    createdAt: now,
    updatedAt: now,
  };
  database.insert(syncOutbox).values(row).onConflictDoNothing().run();
  const stored = database.select().from(syncOutbox)
    .where(eq(syncOutbox.idempotencyKey, idempotencyKey)).get() ?? row;
  if (
    stored.entityType !== entityType
    || stored.entityId !== entityId
    || stored.operation !== operation
    || stored.payloadJson !== payloadJson
  ) {
    throw new Error('sync_idempotency_conflict');
  }
  return stored;
};

/**
 * Barrera única para los tres registros divulgables: el recibo append-only se
 * asienta inmediatamente antes del outbox y comparte su clave idempotente.
 */
const enqueueRecordDisclosure = (
  entityType: CivicDisclosureEntity,
  entityId: string,
  payload: Record<string, unknown>,
  sharedPrecision: LocationPrecision,
  idempotencyKey = `${entityType}:${entityId}:create`,
  operation: Extract<SyncOperation, 'create' | 'update'> = 'create',
  purpose = DISCLOSURE_PURPOSE[entityType],
  database: DBExecutor = db,
  contextOverride?: ReturnType<typeof recordContextFor>,
): SyncOutboxRow => {
  const redactedPayload = redactPublicValue(payload) as Record<string, unknown>;
  const context = contextOverride === undefined
    ? recordContextFor(entityType, entityId, database)
    : contextOverride;
  if (!context || context.audience !== 'collective') {
    throw new Error('civic_disclosure_requires_collective_context');
  }
  appendDisclosureReceipt({
    disclosureKey: idempotencyKey,
    entityType,
    entityId,
    payload: redactedPayload,
    audience: context.audience,
    sharedPrecision: context.sharedPrecision ?? sharedPrecision,
    attributionMode: context.attributionConsent ? context.attributionMode : 'anonymous',
    attributionName: context.attributionConsent ? context.attributionName : null,
    purpose,
    policyVersion: CURRENT_DISCLOSURE_POLICY_VERSION,
  }, database);
  return enqueueSync(entityType, entityId, operation, redactedPayload, idempotencyKey, database);
};

const hasRecordDisclosure = (
  entityType: CivicDisclosureEntity,
  entityId: string,
  database: DBExecutor = db,
): boolean => disclosureReceiptsFor(entityType, entityId, database)
  .some((receipt) => receipt.kind === 'disclosure');

const recordWasDisclosed = (
  entityType: CivicDisclosureEntity,
  entityId: string,
  database: DBExecutor = db,
): boolean => {
  if (hasRecordDisclosure(entityType, entityId, database)) return true;
  return database.select({ id: syncOutbox.id }).from(syncOutbox).where(and(
    eq(syncOutbox.entityType, entityType),
    eq(syncOutbox.entityId, entityId),
    eq(syncOutbox.operation, 'create'),
  )).get() != null;
};

const appendActiveDisclosureRevocations = (
  entityType: CivicDisclosureEntity,
  entityId: string,
  purpose: string,
  database: DBExecutor = db,
): void => {
  const receipts = disclosureReceiptsFor(entityType, entityId, database);
  const revokedReceiptIds = new Set(
    receipts
      .filter((receipt) => receipt.kind === 'revocation' && receipt.revokesReceiptId)
      .map((receipt) => receipt.revokesReceiptId!),
  );
  receipts
    .filter((receipt) => receipt.kind === 'disclosure' && !revokedReceiptIds.has(receipt.id))
    .forEach((receipt) => appendDisclosureRevocation({
      receiptId: receipt.id,
      purpose,
      disclosureKey: `${entityType}:${entityId}:revoke-receipt:${receipt.id}`,
    }, database));
};

const correctionKey = (entityType: CivicDisclosureEntity, entityId: string, updatedAt: string): string =>
  `${entityType}:${entityId}:correction:${updatedAt}`;

const correctionPurpose = (entityType: CivicDisclosureEntity): string => {
  if (entityType === 'observation') return 'Corregir la ubicación, precisión o firma pública de una observación territorial.';
  if (entityType === 'need') return 'Corregir la ubicación, precisión o firma pública de una necesidad.';
  return 'Corregir la ubicación, precisión o firma pública de un recurso.';
};

const revocationPurpose = (entityType: CivicDisclosureEntity): string => {
  if (entityType === 'observation') return 'Retirar esta observación de las proyecciones y usos públicos futuros.';
  if (entityType === 'need') return 'Retirar esta necesidad de las proyecciones y conexiones futuras.';
  return 'Retirar este recurso de las proyecciones y conexiones futuras.';
};

/**
 * Los registros previos al pasaporte geográfico se pueden publicar, pero
 * fallan cerrados: sin un consentimiento por registro conservan la ficha y no
 * exponen ubicación ni firma. Las observaciones sí pueden reproyectar desde
 * su punto exacto local cuando existe.
 */
const collectiveContextForPublishing = (
  entityType: CivicDisclosureEntity,
  entityId: string,
  fallback: {
    point: GeoPoint | null;
    sharedPrecision: LocationPrecision;
    locationLabel: string | null;
    locationRole: 'subject' | 'service_area';
    sensitivity: 'low' | 'moderate' | 'high';
  },
  database: DBExecutor,
) => setRecordContextAudience(entityType, entityId, 'collective', database)
  ?? saveRecordContext(entityType, entityId, {
    point: fallback.point,
    locationRole: fallback.locationRole,
    locationSource: fallback.point ? 'inherited' : 'none',
    sharedPrecision: fallback.sharedPrecision,
    locationLabel: fallback.locationLabel,
    audience: 'collective',
    attributionMode: 'anonymous',
    sensitivity: fallback.sensitivity,
    locationConsent: false,
    attributionConsent: false,
  }, database);

export interface CreateObservationInput {
  campaignKey: CivicCampaignKey;
  campaignVersion?: number;
  territoryId?: string | null;
  starId?: string | null;
  creatorKey?: string | null;
  category: string;
  title: string;
  summary?: string | null;
  data?: Record<string, unknown>;
  evidence?: Record<string, unknown>[];
  exactLocation?: GeoPoint | null;
  publicPrecision?: LocationPrecision;
  locationLabel?: string | null;
  observedAt?: string;
  expiresAt?: string | null;
  publish?: boolean;
  context?: CivicRecordContextInput;
  /** Executor interno para componer una captura mayor en una sola transacción. */
  database?: DBExecutor;
}

export const createObservation = (input: CreateObservationInput): CivicObservationRow => {
  if (!input.database) {
    return db.transaction((tx) => createObservation({ ...input, database: tx }));
  }
  const database = input.database;
  const now = ahoraISO();
  const audience = input.context?.audience ?? (input.publish ? 'collective' : 'private');
  const preparedLocation = prepareRecordLocation({
    point: input.context?.point ?? input.exactLocation ?? null,
    precision: input.context?.sharedPrecision ?? input.publicPrecision ?? '500m',
    audience,
    locationLabel: input.context?.locationLabel ?? input.locationLabel ?? null,
  });
  const {
    exact,
    publicPoint,
    sharedPrecision: precision,
    locationLabel,
  } = preparedLocation;
  const evidence = input.evidence ?? [];
  const quality = assessObservation({
    evidenceCount: evidence.length,
    hasLocation: publicPoint !== null,
    verdicts: [],
  });
  const row: CivicObservationRow = {
    id: nuevoId(),
    campaignKey: input.campaignKey,
    campaignVersion: input.campaignVersion ?? 1,
    territoryId: input.territoryId ?? null,
    starId: input.starId ?? null,
    creatorKey: input.creatorKey ?? null,
    category: input.category,
    title: input.title,
    summary: input.summary ?? null,
    dataJson: json(input.data ?? {}),
    evidenceJson: json(evidence),
    status: input.publish ? 'queued' : 'draft',
    confidence: quality.confidence,
    exactLat: exact?.lat ?? null,
    exactLng: exact?.lng ?? null,
    publicLat: publicPoint?.lat ?? null,
    publicLng: publicPoint?.lng ?? null,
    publicPrecision: precision,
    locationLabel,
    observedAt: input.observedAt ?? now,
    expiresAt: input.expiresAt ?? null,
    createdAt: now,
    updatedAt: now,
    syncedAt: null,
  };
  database.insert(civicObservations).values(row).run();
  const context = saveRecordContext('observation', row.id, {
    point: exact,
    locationRole: input.context?.locationRole ?? 'subject',
    locationSource: input.context?.locationSource ?? (exact ? 'gps_current' : 'none'),
    horizontalAccuracyM: input.context?.horizontalAccuracyM,
    capturedAt: input.context?.capturedAt ?? row.observedAt,
    sharedPrecision: precision,
    locationLabel,
    audience,
    attributionMode: input.context?.attributionMode,
    attributionName: input.context?.attributionName,
    sensitivity: input.context?.sensitivity ?? 'moderate',
    locationConsent: input.context?.locationConsent ?? false,
    attributionConsent: input.context?.attributionConsent,
    confirmedAt: input.context?.confirmedAt,
  }, database);
  if (input.publish) enqueueRecordDisclosure(
    'observation', row.id, publicObservationPayload(row, context), row.publicPrecision,
    `observation:${row.id}:create`, 'create', DISCLOSURE_PURPOSE.observation,
    database, context,
  );
  return row;
};

export const observationsAll = (): CivicObservationRow[] =>
  db.select().from(civicObservations).orderBy(asc(civicObservations.createdAt)).all();

const observationByIdFrom = (id: string, database: DBExecutor): CivicObservationRow | null =>
  database.select().from(civicObservations).where(eq(civicObservations.id, id)).get() ?? null;

export const observationById = (id: string): CivicObservationRow | null => observationByIdFrom(id, db);

/** Enlace de recuperación local: una estrella cívica representa una captura. */
export const observationByStarId = (starId: string): CivicObservationRow | null =>
  db.select().from(civicObservations)
    .where(eq(civicObservations.starId, starId))
    .orderBy(asc(civicObservations.createdAt))
    .get() ?? null;

export const updateObservationContext = (
  id: string,
  input: CivicRecordContextInput,
): CivicObservationRow | null => db.transaction((tx) => {
  const current = observationByIdFrom(id, tx);
  if (
    !current
    || current.status === 'unsafe'
    || current.status === 'withdrawn'
    || current.creatorKey?.startsWith('remote:')
  ) return null;
  const previousContext = recordContextFor('observation', id, tx);
  const wasShared = recordWasDisclosed('observation', id, tx);
  const context = saveRecordContext('observation', id, {
    ...input,
    // Un registro ya publicado sólo abandona la audiencia colectiva mediante
    // withdrawObservation, que exige confirmación y deja tombstone auditable.
    audience: wasShared ? 'collective' : input.audience ?? previousContext?.audience ?? 'private',
    locationConsent: input.locationConsent ?? previousContext?.locationConsent ?? false,
    attributionConsent: input.attributionConsent ?? previousContext?.attributionConsent ?? false,
  }, tx);
  const next: Partial<CivicObservationRow> = {
    exactLat: context.exactLat,
    exactLng: context.exactLng,
    publicLat: context.publicLat,
    publicLng: context.publicLng,
    publicPrecision: context.sharedPrecision,
    locationLabel: context.locationLabel,
    updatedAt: ahoraISO(),
  };
  tx.update(civicObservations).set(next).where(eq(civicObservations.id, id)).run();
  const updated = observationByIdFrom(id, tx);
  if (updated && wasShared && context.audience === 'collective') {
    enqueueRecordDisclosure(
      'observation', id, publicObservationCorrectionPayload(updated, context), updated.publicPrecision,
      correctionKey('observation', id, next.updatedAt!), 'update', correctionPurpose('observation'),
      tx, context,
    );
  }
  return updated;
});

const needByIdFrom = (id: string, database: DBExecutor): CivicNeedRow | null =>
  database.select().from(civicNeeds).where(eq(civicNeeds.id, id)).get() ?? null;

export const needById = (id: string): CivicNeedRow | null => needByIdFrom(id, db);

const resourceByIdFrom = (id: string, database: DBExecutor): CivicResourceRow | null =>
  database.select().from(civicResources).where(eq(civicResources.id, id)).get() ?? null;

export const resourceById = (id: string): CivicResourceRow | null => resourceByIdFrom(id, db);

export const updateNeedContext = (
  id: string,
  input: CivicRecordContextInput,
): CivicNeedRow | null => db.transaction((tx) => {
  const current = needByIdFrom(id, tx);
  if (!current?.ownedByMe || current.status === 'withdrawn') return null;
  const previousContext = recordContextFor('need', id, tx);
  const wasShared = recordWasDisclosed('need', id, tx);
  const context = saveRecordContext('need', id, {
    ...input,
    audience: wasShared ? 'collective' : input.audience ?? previousContext?.audience ?? 'private',
    locationConsent: input.locationConsent ?? previousContext?.locationConsent ?? false,
    attributionConsent: input.attributionConsent ?? previousContext?.attributionConsent ?? false,
  }, tx);
  const updatedAt = ahoraISO();
  tx.update(civicNeeds).set({
    publicLat: context.publicLat,
    publicLng: context.publicLng,
    publicPrecision: context.sharedPrecision,
    locationLabel: context.locationLabel,
    updatedAt,
  }).where(eq(civicNeeds.id, id)).run();
  const updated = needByIdFrom(id, tx);
  if (updated && wasShared && context.audience === 'collective') {
    enqueueRecordDisclosure(
      'need', id, publicNeedCorrectionPayload(updated, context), updated.publicPrecision,
      correctionKey('need', id, updatedAt), 'update', correctionPurpose('need'),
      tx, context,
    );
  }
  return updated;
});

export const updateResourceContext = (
  id: string,
  input: CivicRecordContextInput,
): CivicResourceRow | null => db.transaction((tx) => {
  const current = resourceByIdFrom(id, tx);
  if (!current?.ownedByMe || current.status === 'withdrawn') return null;
  const previousContext = recordContextFor('resource', id, tx);
  const wasShared = recordWasDisclosed('resource', id, tx);
  const context = saveRecordContext('resource', id, {
    ...input,
    audience: wasShared ? 'collective' : input.audience ?? previousContext?.audience ?? 'private',
    locationConsent: input.locationConsent ?? previousContext?.locationConsent ?? false,
    attributionConsent: input.attributionConsent ?? previousContext?.attributionConsent ?? false,
  }, tx);
  const updatedAt = ahoraISO();
  tx.update(civicResources).set({
    publicLat: context.publicLat,
    publicLng: context.publicLng,
    publicPrecision: context.sharedPrecision,
    locationLabel: context.locationLabel,
    updatedAt,
  }).where(eq(civicResources.id, id)).run();
  const updated = resourceByIdFrom(id, tx);
  if (updated && wasShared && context.audience === 'collective') {
    enqueueRecordDisclosure(
      'resource', id, publicResourceCorrectionPayload(updated, context), updated.publicPrecision,
      correctionKey('resource', id, updatedAt), 'update', correctionPurpose('resource'),
      tx, context,
    );
  }
  return updated;
});

export const publishObservation = (id: string): CivicObservationRow | null => {
  const current = observationById(id);
  if (!current || current.status === 'unsafe' || current.status === 'withdrawn') return null;
  if (current.status !== 'draft') return current;
  return db.transaction((tx) => {
    const updatedAt = ahoraISO();
    const observationContext = collectiveContextForPublishing('observation', id, {
      point: current.exactLat == null || current.exactLng == null
        ? null
        : { lat: current.exactLat, lng: current.exactLng },
      sharedPrecision: current.publicPrecision,
      locationLabel: current.locationLabel,
      locationRole: 'subject',
      sensitivity: 'moderate',
    }, tx);
    const next = {
      status: 'queued' as const,
      publicLat: observationContext.publicLat,
      publicLng: observationContext.publicLng,
      publicPrecision: observationContext.sharedPrecision,
      locationLabel: observationContext.locationLabel,
      updatedAt,
    };
    tx.update(civicObservations).set(next).where(eq(civicObservations.id, id)).run();
    const published = { ...current, ...next };
    enqueueRecordDisclosure(
      'observation', id, publicObservationPayload(published, observationContext), published.publicPrecision,
      `observation:${id}:publish`, 'create', DISCLOSURE_PURPOSE.observation, tx, observationContext,
    );
    tx.select().from(civicNeeds).where(eq(civicNeeds.observationId, id)).all().forEach((need) => {
      const needContext = collectiveContextForPublishing('need', need.id, {
        point: null,
        sharedPrecision: need.publicPrecision,
        locationLabel: need.locationLabel,
        locationRole: 'subject',
        sensitivity: 'high',
      }, tx);
      const publishedNeed = {
        ...need,
        publicLat: needContext.publicLat,
        publicLng: needContext.publicLng,
        publicPrecision: needContext.sharedPrecision,
        locationLabel: needContext.locationLabel,
        updatedAt,
      };
      tx.update(civicNeeds).set({
        publicLat: publishedNeed.publicLat,
        publicLng: publishedNeed.publicLng,
        publicPrecision: publishedNeed.publicPrecision,
        locationLabel: publishedNeed.locationLabel,
        updatedAt,
      }).where(eq(civicNeeds.id, need.id)).run();
      enqueueRecordDisclosure(
        'need', need.id, publicNeedPayload(publishedNeed, needContext), publishedNeed.publicPrecision,
        `need:${need.id}:publish`, 'create', DISCLOSURE_PURPOSE.need, tx, needContext,
      );
    });
    return published;
  });
};

export const observationsToVerify = (excludeCreatorKey?: string | null): CivicObservationRow[] =>
  db.select().from(civicObservations)
    .where(inArray(civicObservations.status, ['queued', 'synced', 'needs_review']))
    .orderBy(asc(civicObservations.createdAt)).all()
    // Sueños, necesidades expresadas y propuestas se deliberan: no se
    // "verifican" como hechos de campo. Sólo sus facetas entran al pulso.
    .filter((row) => row.campaignKey !== 'escucha-v1')
    .filter((row) => !isCivicRecordExpired(row))
    .filter((row) => !excludeCreatorKey || row.creatorKey !== excludeCreatorKey);

export const addVerification = (input: {
  observationId: string;
  verdict: VerificationVerdict;
  verifierKey: string;
  note?: string | null;
  evidence?: Record<string, unknown>[];
}): CivicVerificationRow => {
  return db.transaction((tx) => {
    const row: CivicVerificationRow = {
      id: nuevoId(),
      observationId: input.observationId,
      verdict: input.verdict,
      note: input.note ?? null,
      evidenceJson: json(input.evidence ?? []),
      verifierKey: input.verifierKey,
      createdAt: ahoraISO(),
    };
    tx.insert(civicVerifications).values(row).run();
    const observation = tx.select().from(civicObservations)
      .where(eq(civicObservations.id, input.observationId)).get();
    if (observation) {
      const verdicts = tx.select({ verdict: civicVerifications.verdict })
        .from(civicVerifications)
        .where(eq(civicVerifications.observationId, input.observationId)).all()
        .map((v) => v.verdict);
      const quality = assessObservation({
        evidenceCount: (JSON.parse(observation.evidenceJson) as unknown[]).length,
        hasLocation: observation.publicLat != null && observation.publicLng != null,
        verdicts,
      });
      const updated = { status: quality.status, confidence: quality.confidence, updatedAt: ahoraISO() };
      tx.update(civicObservations).set(updated).where(eq(civicObservations.id, observation.id)).run();
      syncMissionCellForObservation(observation.id, quality.status, tx);
      if (quality.status === 'corroborated' && observation.status !== 'corroborated') {
        ganarBrasasUnaVez(
          `civic-observation:${observation.id}:corroborated`,
          GANANCIAS.corroboracionUtil,
          MOTIVOS.corroboracionUtil,
          { database: tx },
        );
      }
      // La vista local se actualiza al instante; el estado compartido lo deriva
      // el servidor desde verificaciones append-only, nunca desde este cliente.
    }
    enqueueSync('verification', row.id, 'create', {
      id: row.id,
      observationId: row.observationId,
      verdict: row.verdict,
      evidenceJson: json(publicEvidence(input.evidence ?? [])),
      verifierKey: row.verifierKey,
      createdAt: row.createdAt,
    }, undefined, tx);
    return row;
  });
};

export const verificationsFor = (observationId: string): CivicVerificationRow[] =>
  db.select().from(civicVerifications).where(eq(civicVerifications.observationId, observationId)).all();

export interface CreateNeedInput {
  observationId?: string | null;
  territoryId?: string | null;
  category: string;
  title: string;
  description?: string | null;
  quantity?: number | null;
  unit?: string | null;
  urgency?: number;
  status?: NeedStatus;
  publicLocation?: GeoPoint | null;
  publicPrecision?: LocationPrecision;
  locationLabel?: string | null;
  contactConsent?: boolean;
  expiresAt?: string | null;
  publish?: boolean;
  context?: CivicRecordContextInput;
  database?: DBExecutor;
}

export const createNeed = (input: CreateNeedInput): CivicNeedRow => {
  if (!input.database) return db.transaction((tx) => createNeed({ ...input, database: tx }));
  const database = input.database;
  const now = ahoraISO();
  const audience = input.context?.audience ?? (input.publish ? 'collective' : 'private');
  const preparedLocation = prepareRecordLocation({
    point: input.context?.point ?? input.publicLocation ?? null,
    precision: input.context?.sharedPrecision ?? input.publicPrecision ?? 'neighborhood',
    audience,
    locationLabel: input.context?.locationLabel ?? input.locationLabel ?? null,
  });
  const {
    exact,
    publicPoint,
    sharedPrecision: precision,
    locationLabel,
  } = preparedLocation;
  const row: CivicNeedRow = {
    id: nuevoId(), observationId: input.observationId ?? null, territoryId: input.territoryId ?? null,
    ownedByMe: true,
    category: input.category, title: input.title, description: input.description ?? null,
    quantity: input.quantity ?? null, unit: input.unit ?? null, urgency: input.urgency ?? 3,
    status: input.status ?? 'submitted', publicLat: publicPoint?.lat ?? null,
    publicLng: publicPoint?.lng ?? null, publicPrecision: precision, locationLabel,
    contactConsent: input.contactConsent ?? false, expiresAt: input.expiresAt ?? null,
    createdAt: now, updatedAt: now,
  };
  database.insert(civicNeeds).values(row).run();
  const context = saveRecordContext('need', row.id, {
    point: exact,
    locationRole: input.context?.locationRole ?? 'subject',
    locationSource: input.context?.locationSource ?? (exact ? 'gps_current' : 'none'),
    horizontalAccuracyM: input.context?.horizontalAccuracyM,
    capturedAt: input.context?.capturedAt ?? now,
    sharedPrecision: precision,
    locationLabel,
    audience,
    attributionMode: input.context?.attributionMode,
    attributionName: input.context?.attributionName,
    sensitivity: input.context?.sensitivity ?? 'high',
    locationConsent: input.context?.locationConsent ?? false,
    attributionConsent: input.context?.attributionConsent,
    confirmedAt: input.context?.confirmedAt,
  }, database);
  if (input.publish) enqueueRecordDisclosure(
    'need', row.id, publicNeedPayload(row, context), row.publicPrecision,
    `need:${row.id}:create`, 'create', DISCLOSURE_PURPOSE.need,
    database, context,
  );
  return row;
};

/** La campaña crea un único faltante operativo por observación de campo. */
export const needByObservationId = (observationId: string): CivicNeedRow | null =>
  db.select().from(civicNeeds)
    .where(eq(civicNeeds.observationId, observationId))
    .orderBy(asc(civicNeeds.createdAt))
    .get() ?? null;

export interface CreateResourceInput {
  territoryId?: string | null;
  category: string;
  title: string;
  description?: string | null;
  quantity?: number | null;
  unit?: string | null;
  availability?: Record<string, unknown>;
  radiusKm?: number;
  confidence?: number;
  status?: ResourceStatus;
  publicLocation?: GeoPoint | null;
  publicPrecision?: LocationPrecision;
  locationLabel?: string | null;
  contactConsent?: boolean;
  expiresAt?: string | null;
  publish?: boolean;
  context?: CivicRecordContextInput;
  database?: DBExecutor;
}

export const createResource = (input: CreateResourceInput): CivicResourceRow => {
  if (!input.database) return db.transaction((tx) => createResource({ ...input, database: tx }));
  const database = input.database;
  const now = ahoraISO();
  const audience = input.context?.audience ?? (input.publish ? 'collective' : 'private');
  const preparedLocation = prepareRecordLocation({
    point: input.context?.point ?? input.publicLocation ?? null,
    precision: input.context?.sharedPrecision ?? input.publicPrecision ?? 'neighborhood',
    audience,
    locationLabel: input.context?.locationLabel ?? input.locationLabel ?? null,
  });
  const {
    exact,
    publicPoint,
    sharedPrecision: precision,
    locationLabel,
  } = preparedLocation;
  const row: CivicResourceRow = {
    id: nuevoId(), territoryId: input.territoryId ?? null, ownedByMe: true, category: input.category,
    title: input.title, description: input.description ?? null, quantity: input.quantity ?? null,
    unit: input.unit ?? null, availabilityJson: json(input.availability ?? {}),
    radiusKm: input.radiusKm ?? 5, confidence: input.confidence ?? 0.5,
    status: input.status ?? 'available', publicLat: publicPoint?.lat ?? null,
    publicLng: publicPoint?.lng ?? null, publicPrecision: precision, locationLabel,
    contactConsent: input.contactConsent ?? false, expiresAt: input.expiresAt ?? null,
    createdAt: now, updatedAt: now,
  };
  database.insert(civicResources).values(row).run();
  const context = saveRecordContext('resource', row.id, {
    point: exact,
    locationRole: input.context?.locationRole ?? 'service_area',
    locationSource: input.context?.locationSource ?? (exact ? 'gps_current' : 'none'),
    horizontalAccuracyM: input.context?.horizontalAccuracyM,
    capturedAt: input.context?.capturedAt ?? now,
    sharedPrecision: precision,
    locationLabel,
    audience,
    attributionMode: input.context?.attributionMode,
    attributionName: input.context?.attributionName,
    sensitivity: input.context?.sensitivity ?? 'low',
    locationConsent: input.context?.locationConsent ?? false,
    attributionConsent: input.context?.attributionConsent,
    confirmedAt: input.context?.confirmedAt,
  }, database);
  if (input.publish) enqueueRecordDisclosure(
    'resource', row.id, publicResourcePayload(row, context), row.publicPrecision,
    `resource:${row.id}:create`, 'create', DISCLOSURE_PURPOSE.resource,
    database, context,
  );
  return row;
};

export const needsAll = (): CivicNeedRow[] => db.select().from(civicNeeds).orderBy(asc(civicNeeds.createdAt)).all();
export const resourcesAll = (): CivicResourceRow[] => db.select().from(civicResources).orderBy(asc(civicResources.createdAt)).all();

/** Un vencimiento inválido se trata como no vigente: nunca debe activar un puente. */
export const isCivicRecordExpired = (
  record: Pick<CivicObservationRow | CivicNeedRow | CivicResourceRow, 'expiresAt'>,
  at = Date.now(),
): boolean => {
  if (record.expiresAt == null) return false;
  const expiresAt = Date.parse(record.expiresAt);
  return !Number.isFinite(expiresAt) || expiresAt <= at;
};

const ensureLegacyDisclosureReceipt = (
  entityType: CivicDisclosureEntity,
  entityId: string,
  payload: Record<string, unknown>,
  sharedPrecision: LocationPrecision,
  database: DBExecutor = db,
): void => {
  if (hasRecordDisclosure(entityType, entityId, database)) return;
  const context = recordContextFor(entityType, entityId, database);
  appendDisclosureReceipt({
    disclosureKey: `${entityType}:${entityId}:legacy-disclosure`,
    entityType,
    entityId,
    payload: redactPublicValue(payload) as Record<string, unknown>,
    audience: 'collective',
    sharedPrecision: context?.sharedPrecision ?? sharedPrecision,
    attributionMode: context?.attributionConsent ? context.attributionMode : 'anonymous',
    attributionName: context?.attributionConsent ? context.attributionName : null,
    purpose: `Reconstruir el recibo local de una publicación anterior para poder retirarla con trazabilidad. ${DISCLOSURE_PURPOSE[entityType]}`,
    policyVersion: CURRENT_DISCLOSURE_POLICY_VERSION,
  }, database);
};

export const withdrawObservation = (id: string): CivicObservationRow | null => db.transaction((tx) => {
  const current = observationByIdFrom(id, tx);
  if (
    !current
    || current.status === 'withdrawn'
    || current.creatorKey?.startsWith('remote:')
    || !recordWasDisclosed('observation', id, tx)
  ) return null;
  const context = recordContextFor('observation', id, tx);
  ensureLegacyDisclosureReceipt(
    'observation', id, publicObservationPayload(current, context), current.publicPrecision, tx,
  );
  appendActiveDisclosureRevocations('observation', id, revocationPurpose('observation'), tx);
  const revokedAt = ahoraISO();
  enqueueSync('observation', id, 'update', {
    id,
    campaignKey: current.campaignKey,
    audience: 'collective',
    revokedAt,
    updatedAt: revokedAt,
  }, `observation:${id}:revoke`, tx);
  tx.update(civicObservations).set({ status: 'withdrawn', updatedAt: revokedAt })
    .where(eq(civicObservations.id, id)).run();
  setRecordContextAudience('observation', id, 'private', tx);
  syncMissionCellForObservation(id, 'withdrawn', tx);
  return observationByIdFrom(id, tx);
});

export const withdrawNeed = (id: string): CivicNeedRow | null => db.transaction((tx) => {
  const current = needByIdFrom(id, tx);
  if (!current?.ownedByMe || current.status === 'withdrawn' || !recordWasDisclosed('need', id, tx)) return null;
  const context = recordContextFor('need', id, tx);
  ensureLegacyDisclosureReceipt('need', id, publicNeedPayload(current, context), current.publicPrecision, tx);
  appendActiveDisclosureRevocations('need', id, revocationPurpose('need'), tx);
  const revokedAt = ahoraISO();
  enqueueSync('need', id, 'update', {
    id,
    audience: 'collective',
    revokedAt,
    updatedAt: revokedAt,
  }, `need:${id}:revoke`, tx);
  tx.update(civicNeeds).set({ status: 'withdrawn', updatedAt: revokedAt })
    .where(eq(civicNeeds.id, id)).run();
  setRecordContextAudience('need', id, 'private', tx);
  return needByIdFrom(id, tx);
});

export const withdrawResource = (id: string): CivicResourceRow | null => db.transaction((tx) => {
  const current = resourceByIdFrom(id, tx);
  if (!current?.ownedByMe || current.status === 'withdrawn' || !recordWasDisclosed('resource', id, tx)) return null;
  const context = recordContextFor('resource', id, tx);
  ensureLegacyDisclosureReceipt('resource', id, publicResourcePayload(current, context), current.publicPrecision, tx);
  appendActiveDisclosureRevocations('resource', id, revocationPurpose('resource'), tx);
  const revokedAt = ahoraISO();
  enqueueSync('resource', id, 'update', {
    id,
    audience: 'collective',
    revokedAt,
    updatedAt: revokedAt,
  }, `resource:${id}:revoke`, tx);
  tx.update(civicResources).set({ status: 'withdrawn', updatedAt: revokedAt })
    .where(eq(civicResources.id, id)).run();
  setRecordContextAudience('resource', id, 'private', tx);
  return resourceByIdFrom(id, tx);
});

export interface MatchSuggestion {
  need: CivicNeedRow;
  resource: CivicResourceRow;
  score: number;
  reasons: string[];
}

export const suggestMatches = (): MatchSuggestion[] => {
  const needs = needsAll().filter((n) => {
    if (!['submitted', 'needs_review', 'corroborated', 'reopened'].includes(n.status)) return false;
    if (isCivicRecordExpired(n)) return false;
    if (!n.observationId) return true;
    const observation = observationById(n.observationId);
    return observation?.status !== 'draft' && (!observation || !isCivicRecordExpired(observation));
  });
  const resources = resourcesAll().filter((r) =>
    r.status === 'available'
    && !isCivicRecordExpired(r)
    && (r.quantity == null || r.quantity > 0));
  const suggestions: MatchSuggestion[] = [];
  for (const need of needs) {
    for (const resource of resources) {
      // El dispositivo puede proponer únicamente cuando representa a uno de
      // los lados. El servidor vuelve a imponer esta regla con los owners.
      if (need.ownedByMe === resource.ownedByMe) continue;
      const distanceKm =
        need.publicLat != null && need.publicLng != null &&
        resource.publicLat != null && resource.publicLng != null
          ? haversineKm(
              { lat: need.publicLat, lng: need.publicLng },
              { lat: resource.publicLat, lng: resource.publicLng },
            )
          : null;
      const uncertaintyKm = publicLocationUncertaintyKm(need.publicPrecision)
        + publicLocationUncertaintyKm(resource.publicPrecision);
      const result = scoreMatch({
        needCategory: need.category,
        resourceCategory: resource.category,
        needQuantity: need.quantity,
        resourceQuantity: resource.quantity,
        distanceKm,
        distanceMinKm: distanceKm == null ? null : Math.max(0, distanceKm - uncertaintyKm),
        distanceMaxKm: distanceKm == null ? null : distanceKm + uncertaintyKm,
        radiusKm: resource.radiusKm,
        needUrgency: need.urgency,
        resourceConfidence: resource.confidence,
      });
      if (result.eligible) suggestions.push({ need, resource, score: result.score, reasons: result.reasons });
    }
  }
  return suggestions.sort((a, b) => b.score - a.score);
};

export const createMatch = (suggestion: MatchSuggestion): CivicMatchRow => {
  return db.transaction((tx) => {
    const now = ahoraISO();
    const row: CivicMatchRow = {
      id: nuevoId(), needId: suggestion.need.id, resourceId: suggestion.resource.id,
      score: suggestion.score, reasonsJson: json(suggestion.reasons), status: 'proposed',
      acceptedNeedAt: null, acceptedResourceAt: null, acceptedNeedBy: null,
      acceptedResourceBy: null, createdAt: now, updatedAt: now,
    };
    tx.insert(civicMatches).values(row).onConflictDoNothing().run();
    const stored = tx.select().from(civicMatches)
      .where(and(eq(civicMatches.needId, row.needId), eq(civicMatches.resourceId, row.resourceId))).get() ?? row;
    if (stored.id !== row.id) return stored;
    enqueueSync('match', stored.id, 'create', stored, undefined, tx);
    return stored;
  });
};

export const matchesAll = (): CivicMatchRow[] => db.select().from(civicMatches).orderBy(asc(civicMatches.createdAt)).all();

export const transitionMatch = (id: string, status: MatchStatus): CivicMatchRow | null => {
  return db.transaction((tx) => {
    const current = tx.select().from(civicMatches).where(eq(civicMatches.id, id)).get();
    if (!current) return null;
    if (!canTransitionMatch(current.status, status) || current.status === status) return current;
    const now = ahoraISO();
    const update: Partial<CivicMatchRow> = { status, updatedAt: now };
    tx.update(civicMatches).set(update).where(eq(civicMatches.id, id)).run();
    if (status === 'accepted' || status === 'in_progress') {
      tx.update(civicNeeds).set({ status: 'matched', updatedAt: now }).where(eq(civicNeeds.id, current.needId)).run();
      tx.update(civicResources).set({ status: 'reserved', updatedAt: now }).where(eq(civicResources.id, current.resourceId)).run();
    }
    if (status === 'confirmed') {
      tx.update(civicNeeds).set({ status: 'resolved', updatedAt: now }).where(eq(civicNeeds.id, current.needId)).run();
      tx.update(civicResources).set({ status: 'depleted', updatedAt: now }).where(eq(civicResources.id, current.resourceId)).run();
    }
    if ((status === 'declined' || status === 'cancelled') && current.status !== 'confirmed') {
      const need = tx.select().from(civicNeeds).where(eq(civicNeeds.id, current.needId)).get();
      const resource = tx.select().from(civicResources).where(eq(civicResources.id, current.resourceId)).get();
      if (need && ['matched', 'in_progress'].includes(need.status)) {
        tx.update(civicNeeds).set({ status: 'reopened', updatedAt: now }).where(eq(civicNeeds.id, current.needId)).run();
      }
      if (resource?.status === 'reserved') {
        tx.update(civicResources).set({
          status: current.status === 'fulfilled' ? 'depleted' : 'available',
          updatedAt: now,
        }).where(eq(civicResources.id, current.resourceId)).run();
      }
    }
    enqueueSync('match', id, 'transition', update, `match:${id}:${status}`, tx);
    return tx.select().from(civicMatches).where(eq(civicMatches.id, id)).get() ?? null;
  });
};

/** Cada lado acepta por separado; el motor propone, nunca consiente por ellos. */
export const acceptMatchSide = (id: string, side: 'need' | 'resource', actorKey: string): CivicMatchRow | null => {
  return db.transaction((tx) => {
    const current = tx.select().from(civicMatches).where(eq(civicMatches.id, id)).get();
    if (!current) return null;
    if (!['proposed', 'accepted'].includes(current.status)) return current;
    const need = tx.select().from(civicNeeds).where(eq(civicNeeds.id, current.needId)).get();
    const resource = tx.select().from(civicResources).where(eq(civicResources.id, current.resourceId)).get();
    if ((side === 'need' && !need?.ownedByMe) || (side === 'resource' && !resource?.ownedByMe)) return current;
    if (
      (side === 'need' && current.acceptedResourceBy === actorKey) ||
      (side === 'resource' && current.acceptedNeedBy === actorKey)
    ) return current;
    if (
      (side === 'need' && current.acceptedNeedAt != null) ||
      (side === 'resource' && current.acceptedResourceAt != null)
    ) return current;
    const now = ahoraISO();
    const update: Partial<CivicMatchRow> = side === 'need'
      ? { acceptedNeedAt: current.acceptedNeedAt ?? now, acceptedNeedBy: current.acceptedNeedBy ?? actorKey, updatedAt: now }
      : { acceptedResourceAt: current.acceptedResourceAt ?? now, acceptedResourceBy: current.acceptedResourceBy ?? actorKey, updatedAt: now };
    const bothAccepted =
      (side === 'need' || current.acceptedNeedAt != null) &&
      (side === 'resource' || current.acceptedResourceAt != null);
    if (bothAccepted) update.status = 'accepted';
    tx.update(civicMatches).set(update).where(eq(civicMatches.id, id)).run();
    if (bothAccepted) {
      tx.update(civicNeeds).set({ status: 'matched', updatedAt: now }).where(eq(civicNeeds.id, current.needId)).run();
      tx.update(civicResources).set({ status: 'reserved', updatedAt: now }).where(eq(civicResources.id, current.resourceId)).run();
    }
    enqueueSync('match', id, 'transition', update, `match:${id}:accept:${side}`, tx);
    return tx.select().from(civicMatches).where(eq(civicMatches.id, id)).get() ?? null;
  });
};

export const createAction = (input: { matchId: string; title: string; description?: string | null; scheduledAt?: string | null }): CivicActionRow => {
  return db.transaction((tx) => {
    const existing = tx.select().from(civicActions).where(eq(civicActions.matchId, input.matchId)).get();
    if (existing) return existing;
    const match = tx.select().from(civicMatches).where(eq(civicMatches.id, input.matchId)).get();
    if (!match || !['accepted', 'in_progress'].includes(match.status)) throw new Error('action_requires_accepted_match');
    const now = ahoraISO();
    const row: CivicActionRow = {
      id: nuevoId(), matchId: input.matchId, title: input.title,
      description: input.description ?? null, status: 'planned', scheduledAt: input.scheduledAt ?? null,
      completedAt: null, confirmedAt: null, outcomeJson: '{}', createdAt: now, updatedAt: now,
    };
    tx.insert(civicActions).values(row).run();
    enqueueSync('action', row.id, 'create', row, undefined, tx);
    return row;
  });
};

export const transitionAction = (id: string, status: CivicActionStatus, outcome: Record<string, unknown> = {}): CivicActionRow | null => {
  return db.transaction((tx) => {
    const current = tx.select().from(civicActions).where(eq(civicActions.id, id)).get();
    if (!current) return null;
    if (!canTransitionAction(current.status, status) || current.status === status) return current;
    const now = ahoraISO();
    const update: Partial<CivicActionRow> = {
      status,
      outcomeJson: json(mergeActionOutcome(current.outcomeJson, outcome)),
      updatedAt: now,
    };
    if (status === 'completed') update.completedAt = now;
    if (status === 'confirmed') update.confirmedAt = now;
    tx.update(civicActions).set(update).where(eq(civicActions.id, id)).run();
    if (status === 'confirmed') {
      ganarBrasasUnaVez(
        `civic-action:${id}:confirmed`,
        GANANCIAS.resultadoConfirmado,
        MOTIVOS.resultadoConfirmado,
        { database: tx },
      );
    }
    enqueueSync('action', id, 'transition', update, `action:${id}:${status}`, tx);
    return tx.select().from(civicActions).where(eq(civicActions.id, id)).get() ?? null;
  });
};

export const actionsAll = (): CivicActionRow[] => db.select().from(civicActions).orderBy(asc(civicActions.createdAt)).all();

export const saveTerritory = (input: {
  name: string;
  geometry?: unknown;
  center?: GeoPoint | null;
  radiusKm?: number | null;
  database?: DBExecutor;
}): CivicTerritoryRow => {
  if (!input.database) return db.transaction((tx) => saveTerritory({ ...input, database: tx }));
  const database = input.database;
    const now = ahoraISO();
    const row: CivicTerritoryRow = {
      id: nuevoId(), name: input.name, geometryJson: input.geometry ? json(input.geometry) : null,
      centerLat: input.center?.lat ?? null, centerLng: input.center?.lng ?? null,
      radiusKm: input.radiusKm ?? null, createdAt: now, updatedAt: now,
    };
    database.insert(civicTerritories).values(row).run();
    // El lazo puede revelar hogar, recorridos o zonas de organización. Sigue
    // local hasta que exista una audiencia con ACL territorial verificable.
    return row;
};

export const territoriesAll = (): CivicTerritoryRow[] => db.select().from(civicTerritories).orderBy(asc(civicTerritories.createdAt)).all();

export const recordConsent = (input: {
  scope: ConsentScope;
  purpose: string;
  granted: boolean;
  version?: number;
  idempotencyKey?: string;
  database?: DBExecutor;
}): CivicConsentRow => {
  if (!input.database) return db.transaction((tx) => recordConsent({ ...input, database: tx }));
  const database = input.database;
  const now = ahoraISO();
  const version = input.version ?? 1;
  const existing = database.select().from(civicConsents)
    .where(and(eq(civicConsents.scope, input.scope), eq(civicConsents.version, version))).get();
  const row: CivicConsentRow = {
    id: existing?.id ?? nuevoId(), scope: input.scope, purpose: input.purpose,
    version, granted: input.granted, grantedAt: input.granted ? existing?.grantedAt ?? now : existing?.grantedAt ?? null,
    revokedAt: input.granted ? null : now, createdAt: existing?.createdAt ?? now,
  };
  database.insert(civicConsents).values(row)
    .onConflictDoUpdate({ target: [civicConsents.scope, civicConsents.version], set: row }).run();
  enqueueSync(
    'consent',
    row.id,
    'update',
    row,
    input.idempotencyKey ?? `consent:${row.scope}:${row.version}:${now}`,
    database,
  );
  return row;
};

export const pendingOutbox = (): SyncOutboxRow[] => db.select().from(syncOutbox)
  .where(inArray(syncOutbox.status, ['pending', 'failed'])).orderBy(asc(syncOutbox.createdAt)).all();

/** Toda fila que sigue en la tabla carece de acuse, también `sending` o dead-letter. */
export const unacknowledgedOutbox = (): SyncOutboxRow[] => db.select().from(syncOutbox)
  .orderBy(asc(syncOutbox.createdAt)).all();

export interface CivicOutboxHealth {
  pending: number;
  sending: number;
  failed: number;
  deadLetter: number;
}

/** Foto completa de la cola; la UI no debe ocultar envíos varados o agotados. */
export const outboxHealth = (): CivicOutboxHealth => {
  const health: CivicOutboxHealth = { pending: 0, sending: 0, failed: 0, deadLetter: 0 };
  for (const row of db.select({ status: syncOutbox.status }).from(syncOutbox).all()) {
    if (row.status === 'dead_letter') health.deadLetter += 1;
    else health[row.status] += 1;
  }
  return health;
};
