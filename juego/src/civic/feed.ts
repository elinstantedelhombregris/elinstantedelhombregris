import { and, eq, inArray, like, or } from 'drizzle-orm';

import { ahoraISO, setSetting } from '@/db/repos';
import { db } from '@/db/client';
import {
  civicActions,
  civicMatches,
  civicNeeds,
  civicObservations,
  civicRecordContexts,
  civicResources,
  civicVerifications,
} from '@/db/schema';
import type {
  CivicActionRow,
  CivicMatchRow,
  CivicNeedRow,
  CivicObservationRow,
  CivicResourceRow,
  CivicVerificationRow,
} from '@/db/schema';

import { assessObservation } from './quality';
import { recordContextFor, saveRecordContext, setRecordContextAudience } from './record-context';
import type {
  AttributionMode,
  CivicAudience,
  CivicActionStatus,
  CivicCampaignKey,
  LocationPrecision,
  MatchStatus,
  NeedStatus,
  ResourceStatus,
  VerificationVerdict,
} from './types';

export interface CivicOperationalFeedEvent {
  cursor: number;
  eventId: string;
  entityType: 'observation' | 'need' | 'resource' | 'verification' | 'match' | 'action';
  entityId: string;
  operation: string;
  occurredAt: string;
  ownedByMe: boolean;
  payload: Record<string, unknown>;
  parties?: {
    needOwnedByMe: boolean;
    resourceOwnedByMe: boolean;
    needAccepted: boolean;
    resourceAccepted: boolean;
  };
}

const CAMPAIGNS = new Set<CivicCampaignKey>(['luminarias-v1', 'ollas-v1', 'senal-libre-v1', 'escucha-v1']);
const PRECISIONS = new Set<LocationPrecision>(['100m', '500m', 'neighborhood', 'city']);
const NEED_STATUSES = new Set<NeedStatus>(['draft', 'submitted', 'needs_review', 'corroborated', 'matched', 'in_progress', 'resolved', 'reopened', 'withdrawn']);
const RESOURCE_STATUSES = new Set<ResourceStatus>(['draft', 'available', 'reserved', 'depleted', 'expired', 'withdrawn']);
const MATCH_STATUSES = new Set<MatchStatus>(['proposed', 'accepted', 'in_progress', 'fulfilled', 'confirmed', 'declined', 'cancelled']);
const ACTION_STATUSES = new Set<CivicActionStatus>(['planned', 'in_progress', 'completed', 'confirmed', 'cancelled']);
const VERDICTS = new Set<VerificationVerdict>(['confirm', 'correct', 'duplicate', 'cannot_verify', 'stale', 'unsafe']);
const ATTRIBUTIONS = new Set<AttributionMode>(['anonymous', 'alias', 'named']);
const AUDIENCES = new Set<CivicAudience>(['private', 'collective', 'circle', 'counterpart']);
const hasOwn = (value: Record<string, unknown>, key: string): boolean =>
  Object.prototype.hasOwnProperty.call(value, key);

const stringValue = (value: unknown, fallback = ''): string =>
  typeof value === 'string' && value.trim() ? value.trim() : fallback;
const optionalString = (value: unknown): string | null => typeof value === 'string' && value.trim() ? value.trim() : null;
const finiteNumber = (value: unknown): number | null => typeof value === 'number' && Number.isFinite(value) ? value : null;
const json = (value: unknown, fallback: unknown): string => {
  try { return JSON.stringify(value ?? fallback); } catch { return JSON.stringify(fallback); }
};
const timestamp = (value: unknown, fallback: string): string => {
  if (typeof value !== 'string' || !Number.isFinite(Date.parse(value))) return fallback;
  return value;
};

const precision = (value: unknown): LocationPrecision =>
  PRECISIONS.has(value as LocationPrecision) ? value as LocationPrecision : 'city';
const attributionMode = (value: unknown): AttributionMode =>
  ATTRIBUTIONS.has(value as AttributionMode) ? value as AttributionMode : 'anonymous';
const audience = (value: unknown): CivicAudience =>
  AUDIENCES.has(value as CivicAudience) ? value as CivicAudience : 'collective';

const saveImportedContext = (
  entityType: 'observation' | 'need' | 'resource',
  entityId: string,
  p: Record<string, unknown>,
  publicPoint: { lat: number; lng: number } | null,
  sharedPrecision: LocationPrecision,
  label: string | null,
): void => {
  const existing = recordContextFor(entityType, entityId);
  if (existing?.exactLat != null && existing.exactLng != null) return;
  const mode = attributionMode(p.attributionMode);
  saveRecordContext(entityType, entityId, {
    point: null,
    publicPointOverride: publicPoint,
    locationSource: 'imported_public',
    horizontalAccuracyM: finiteNumber(p.horizontalAccuracyM),
    sharedPrecision,
    locationLabel: label,
    audience: audience(p.audience),
    attributionMode: mode,
    attributionName: optionalString(p.attributionName),
    locationConsent: publicPoint != null,
    attributionConsent: mode !== 'anonymous',
    sensitivity: entityType === 'resource' ? 'low' : entityType === 'need' ? 'high' : 'moderate',
    confirmedAt: eventTimestamp(p),
  });
};

const eventTimestamp = (payload: Record<string, unknown>): string =>
  timestamp(payload.updatedAt ?? payload.createdAt, new Date().toISOString());

const revocationTimestamp = (payload: Record<string, unknown>): string | null => {
  if (typeof payload.revokedAt !== 'string' || !Number.isFinite(Date.parse(payload.revokedAt))) return null;
  return payload.revokedAt;
};

const refreshQuality = (observationId: string): void => {
  const observation = db.select().from(civicObservations).where(eq(civicObservations.id, observationId)).get();
  if (!observation) return;
  const verdicts = db.select({ verdict: civicVerifications.verdict }).from(civicVerifications)
    .where(eq(civicVerifications.observationId, observationId)).all().map((item) => item.verdict);
  const quality = assessObservation({
    evidenceCount: (JSON.parse(observation.evidenceJson) as unknown[]).length,
    hasLocation: observation.publicLat != null && observation.publicLng != null,
    verdicts,
  });
  db.update(civicObservations).set({
    status: quality.status,
    confidence: quality.confidence,
    updatedAt: ahoraISO(),
  }).where(eq(civicObservations.id, observationId)).run();
};

const importObservation = (event: CivicOperationalFeedEvent, actorKey: string): void => {
  const p = event.payload;
  const revokedAt = event.operation === 'update' ? revocationTimestamp(p) : null;
  if (revokedAt) {
    db.update(civicObservations).set({ status: 'withdrawn', updatedAt: revokedAt })
      .where(eq(civicObservations.id, event.entityId)).run();
    setRecordContextAudience('observation', event.entityId, 'private');
    return;
  }
  if (!['create', 'update'].includes(event.operation)) return;
  const now = timestamp(p.createdAt, event.occurredAt);
  const location = p.location && typeof p.location === 'object' && !Array.isArray(p.location)
    ? p.location as Record<string, unknown>
    : {};
  const campaign = CAMPAIGNS.has(p.campaignKey as CivicCampaignKey)
    ? p.campaignKey as CivicCampaignKey
    : 'senal-libre-v1';
  const row: CivicObservationRow = {
    id: event.entityId,
    campaignKey: campaign,
    campaignVersion: finiteNumber(p.campaignVersion) ?? 1,
    territoryId: optionalString(p.territoryId),
    starId: null,
    creatorKey: event.ownedByMe ? actorKey : `remote:${event.entityId}`,
    category: stringValue(p.category, 'sin-categoria'),
    title: stringValue(p.title, 'Señal territorial'),
    summary: optionalString(p.summary),
    dataJson: json(p.data, {}),
    evidenceJson: json(p.evidence, []),
    status: event.ownedByMe ? 'synced' : 'needs_review',
    confidence: 0.35,
    exactLat: null,
    exactLng: null,
    publicLat: finiteNumber(location.lat),
    publicLng: finiteNumber(location.lng),
    publicPrecision: precision(p.locationPrecision),
    locationLabel: optionalString(p.locationLabel),
    observedAt: timestamp(p.observedAt, event.occurredAt),
    expiresAt: optionalString(p.expiresAt),
    createdAt: now,
    updatedAt: timestamp(p.updatedAt, now),
    syncedAt: event.ownedByMe ? event.occurredAt : null,
  };
  if (event.operation === 'create') {
    db.insert(civicObservations).values(row).onConflictDoNothing().run();
  } else {
    const current = db.select().from(civicObservations).where(eq(civicObservations.id, event.entityId)).get();
    if (!current) return;
    const update: Partial<CivicObservationRow> = { updatedAt: timestamp(p.updatedAt, event.occurredAt) };
    if (CAMPAIGNS.has(p.campaignKey as CivicCampaignKey)) update.campaignKey = p.campaignKey as CivicCampaignKey;
    if (finiteNumber(p.campaignVersion) != null) update.campaignVersion = finiteNumber(p.campaignVersion)!;
    if (hasOwn(p, 'territoryId')) update.territoryId = optionalString(p.territoryId);
    if (hasOwn(p, 'category')) update.category = stringValue(p.category, current.category);
    if (hasOwn(p, 'title')) update.title = stringValue(p.title, current.title);
    if (hasOwn(p, 'summary')) update.summary = optionalString(p.summary);
    if (hasOwn(p, 'data')) update.dataJson = json(p.data, {});
    if (hasOwn(p, 'evidence')) update.evidenceJson = json(p.evidence, []);
    if (hasOwn(p, 'location')) {
      update.publicLat = finiteNumber(location.lat);
      update.publicLng = finiteNumber(location.lng);
    }
    if (hasOwn(p, 'locationPrecision')) update.publicPrecision = precision(p.locationPrecision);
    if (hasOwn(p, 'locationLabel')) update.locationLabel = optionalString(p.locationLabel);
    if (hasOwn(p, 'observedAt')) update.observedAt = timestamp(p.observedAt, current.observedAt);
    if (hasOwn(p, 'expiresAt')) update.expiresAt = optionalString(p.expiresAt);
    db.update(civicObservations).set(update).where(eq(civicObservations.id, event.entityId)).run();
    Object.assign(row, current, update);
  }
  saveImportedContext(
    'observation', row.id, p,
    row.publicLat == null || row.publicLng == null ? null : { lat: row.publicLat, lng: row.publicLng },
    row.publicPrecision,
    row.locationLabel,
  );
};

const importNeed = (event: CivicOperationalFeedEvent): void => {
  const p = event.payload;
  const revokedAt = event.operation === 'update' ? revocationTimestamp(p) : null;
  if (revokedAt) {
    db.update(civicNeeds).set({ status: 'withdrawn', updatedAt: revokedAt })
      .where(eq(civicNeeds.id, event.entityId)).run();
    setRecordContextAudience('need', event.entityId, 'private');
    return;
  }
  if (!['create', 'update'].includes(event.operation)) return;
  const now = timestamp(p.createdAt, event.occurredAt);
  const status = NEED_STATUSES.has(p.status as NeedStatus) ? p.status as NeedStatus : 'submitted';
  const row: CivicNeedRow = {
    id: event.entityId,
    observationId: optionalString(p.observationId),
    territoryId: optionalString(p.territoryId),
    ownedByMe: event.ownedByMe,
    category: stringValue(p.category, 'sin-categoria'),
    title: stringValue(p.title, 'Necesidad territorial'),
    description: optionalString(p.description),
    quantity: finiteNumber(p.quantity),
    unit: optionalString(p.unit),
    urgency: Math.max(1, Math.min(5, finiteNumber(p.urgency) ?? 3)),
    status,
    publicLat: finiteNumber(p.publicLat),
    publicLng: finiteNumber(p.publicLng),
    publicPrecision: precision(p.publicPrecision),
    locationLabel: optionalString(p.locationLabel),
    contactConsent: false,
    expiresAt: optionalString(p.expiresAt),
    createdAt: now,
    updatedAt: timestamp(p.updatedAt, now),
  };
  if (event.operation === 'create') {
    db.insert(civicNeeds).values(row).onConflictDoNothing().run();
  } else {
    const current = db.select().from(civicNeeds).where(eq(civicNeeds.id, event.entityId)).get();
    if (!current) return;
    const update: Partial<CivicNeedRow> = { updatedAt: timestamp(p.updatedAt, event.occurredAt) };
    if (hasOwn(p, 'observationId')) update.observationId = optionalString(p.observationId);
    if (hasOwn(p, 'territoryId')) update.territoryId = optionalString(p.territoryId);
    if (hasOwn(p, 'category')) update.category = stringValue(p.category, current.category);
    if (hasOwn(p, 'title')) update.title = stringValue(p.title, current.title);
    if (hasOwn(p, 'description')) update.description = optionalString(p.description);
    if (hasOwn(p, 'quantity')) update.quantity = finiteNumber(p.quantity);
    if (hasOwn(p, 'unit')) update.unit = optionalString(p.unit);
    if (hasOwn(p, 'urgency')) update.urgency = Math.max(1, Math.min(5, finiteNumber(p.urgency) ?? current.urgency));
    if (NEED_STATUSES.has(p.status as NeedStatus)) update.status = p.status as NeedStatus;
    if (hasOwn(p, 'publicLat')) update.publicLat = finiteNumber(p.publicLat);
    if (hasOwn(p, 'publicLng')) update.publicLng = finiteNumber(p.publicLng);
    if (hasOwn(p, 'publicPrecision')) update.publicPrecision = precision(p.publicPrecision);
    if (hasOwn(p, 'locationLabel')) update.locationLabel = optionalString(p.locationLabel);
    if (hasOwn(p, 'expiresAt')) update.expiresAt = optionalString(p.expiresAt);
    db.update(civicNeeds).set(update).where(eq(civicNeeds.id, event.entityId)).run();
    Object.assign(row, current, update);
  }
  saveImportedContext(
    'need', row.id, p,
    row.publicLat == null || row.publicLng == null ? null : { lat: row.publicLat, lng: row.publicLng },
    row.publicPrecision,
    row.locationLabel,
  );
};

const importResource = (event: CivicOperationalFeedEvent): void => {
  const p = event.payload;
  const revokedAt = event.operation === 'update' ? revocationTimestamp(p) : null;
  if (revokedAt) {
    db.update(civicResources).set({ status: 'withdrawn', updatedAt: revokedAt })
      .where(eq(civicResources.id, event.entityId)).run();
    setRecordContextAudience('resource', event.entityId, 'private');
    return;
  }
  if (!['create', 'update'].includes(event.operation)) return;
  const now = timestamp(p.createdAt, event.occurredAt);
  const status = RESOURCE_STATUSES.has(p.status as ResourceStatus) ? p.status as ResourceStatus : 'available';
  const row: CivicResourceRow = {
    id: event.entityId,
    territoryId: optionalString(p.territoryId),
    ownedByMe: event.ownedByMe,
    category: stringValue(p.category, 'sin-categoria'),
    title: stringValue(p.title, 'Recurso disponible'),
    description: optionalString(p.description),
    quantity: finiteNumber(p.quantity),
    unit: optionalString(p.unit),
    availabilityJson: stringValue(p.availabilityJson, '{}'),
    radiusKm: Math.max(1, Math.min(50, finiteNumber(p.radiusKm) ?? 5)),
    confidence: Math.max(0, Math.min(1, finiteNumber(p.confidence) ?? 0.5)),
    status,
    publicLat: finiteNumber(p.publicLat),
    publicLng: finiteNumber(p.publicLng),
    publicPrecision: precision(p.publicPrecision),
    locationLabel: optionalString(p.locationLabel),
    contactConsent: false,
    expiresAt: optionalString(p.expiresAt),
    createdAt: now,
    updatedAt: timestamp(p.updatedAt, now),
  };
  if (event.operation === 'create') {
    db.insert(civicResources).values(row).onConflictDoNothing().run();
  } else {
    const current = db.select().from(civicResources).where(eq(civicResources.id, event.entityId)).get();
    if (!current) return;
    const update: Partial<CivicResourceRow> = { updatedAt: timestamp(p.updatedAt, event.occurredAt) };
    if (hasOwn(p, 'territoryId')) update.territoryId = optionalString(p.territoryId);
    if (hasOwn(p, 'category')) update.category = stringValue(p.category, current.category);
    if (hasOwn(p, 'title')) update.title = stringValue(p.title, current.title);
    if (hasOwn(p, 'description')) update.description = optionalString(p.description);
    if (hasOwn(p, 'quantity')) update.quantity = finiteNumber(p.quantity);
    if (hasOwn(p, 'unit')) update.unit = optionalString(p.unit);
    if (hasOwn(p, 'availabilityJson')) update.availabilityJson = stringValue(p.availabilityJson, current.availabilityJson);
    if (hasOwn(p, 'radiusKm')) update.radiusKm = Math.max(1, Math.min(50, finiteNumber(p.radiusKm) ?? current.radiusKm));
    if (hasOwn(p, 'confidence')) update.confidence = Math.max(0, Math.min(1, finiteNumber(p.confidence) ?? current.confidence));
    if (RESOURCE_STATUSES.has(p.status as ResourceStatus)) update.status = p.status as ResourceStatus;
    if (hasOwn(p, 'publicLat')) update.publicLat = finiteNumber(p.publicLat);
    if (hasOwn(p, 'publicLng')) update.publicLng = finiteNumber(p.publicLng);
    if (hasOwn(p, 'publicPrecision')) update.publicPrecision = precision(p.publicPrecision);
    if (hasOwn(p, 'locationLabel')) update.locationLabel = optionalString(p.locationLabel);
    if (hasOwn(p, 'expiresAt')) update.expiresAt = optionalString(p.expiresAt);
    db.update(civicResources).set(update).where(eq(civicResources.id, event.entityId)).run();
    Object.assign(row, current, update);
  }
  saveImportedContext(
    'resource', row.id, p,
    row.publicLat == null || row.publicLng == null ? null : { lat: row.publicLat, lng: row.publicLng },
    row.publicPrecision,
    row.locationLabel,
  );
};

const importVerification = (event: CivicOperationalFeedEvent, actorKey: string): void => {
  if (event.operation !== 'create') return;
  const p = event.payload;
  const observationId = optionalString(p.observationId);
  if (!observationId || !VERDICTS.has(p.verdict as VerificationVerdict)) return;
  const row: CivicVerificationRow = {
    id: event.entityId,
    observationId,
    verdict: p.verdict as VerificationVerdict,
    note: null,
    evidenceJson: '[]',
    verifierKey: event.ownedByMe ? actorKey : `remote:${event.entityId}`,
    createdAt: timestamp(p.createdAt, event.occurredAt),
  };
  db.insert(civicVerifications).values(row).onConflictDoNothing().run();
  refreshQuality(observationId);
};

const importMatch = (event: CivicOperationalFeedEvent, actorKey: string): void => {
  const p = event.payload;
  const parties = event.parties;
  if (!parties) return;
  if (event.operation === 'create') {
    const needId = optionalString(p.needId);
    const resourceId = optionalString(p.resourceId);
    if (!needId || !resourceId) return;
    const now = timestamp(p.createdAt, event.occurredAt);
    const row: CivicMatchRow = {
      id: event.entityId,
      needId,
      resourceId,
      score: Math.round(Math.max(0, Math.min(100, finiteNumber(p.score) ?? 0))),
      reasonsJson: stringValue(p.reasonsJson, '[]'),
      status: 'proposed',
      acceptedNeedAt: null,
      acceptedResourceAt: null,
      acceptedNeedBy: null,
      acceptedResourceBy: null,
      createdAt: now,
      updatedAt: timestamp(p.updatedAt, now),
    };
    db.insert(civicMatches).values(row).onConflictDoNothing().run();
  }
  const current = db.select().from(civicMatches).where(eq(civicMatches.id, event.entityId)).get();
  if (!current) return;
  const nextStatus = MATCH_STATUSES.has(p.status as MatchStatus) ? p.status as MatchStatus : current.status;
  const update: Partial<CivicMatchRow> = {
    status: nextStatus,
    acceptedNeedAt: parties.needAccepted ? current.acceptedNeedAt ?? event.occurredAt : null,
    acceptedResourceAt: parties.resourceAccepted ? current.acceptedResourceAt ?? event.occurredAt : null,
    acceptedNeedBy: parties.needAccepted ? (parties.needOwnedByMe ? actorKey : 'remote') : null,
    acceptedResourceBy: parties.resourceAccepted ? (parties.resourceOwnedByMe ? actorKey : 'remote') : null,
    updatedAt: event.occurredAt,
  };
  db.update(civicMatches).set(update).where(eq(civicMatches.id, event.entityId)).run();
  if (['accepted', 'in_progress', 'fulfilled'].includes(nextStatus)) {
    db.update(civicNeeds).set({ status: 'matched', updatedAt: event.occurredAt }).where(eq(civicNeeds.id, current.needId)).run();
    db.update(civicResources).set({ status: 'reserved', updatedAt: event.occurredAt }).where(eq(civicResources.id, current.resourceId)).run();
  }
  if (nextStatus === 'confirmed') {
    db.update(civicNeeds).set({ status: 'resolved', updatedAt: event.occurredAt }).where(eq(civicNeeds.id, current.needId)).run();
    db.update(civicResources).set({ status: 'depleted', updatedAt: event.occurredAt }).where(eq(civicResources.id, current.resourceId)).run();
  }
};

const importAction = (event: CivicOperationalFeedEvent): void => {
  const p = event.payload;
  if (event.operation === 'create') {
    const matchId = optionalString(p.matchId);
    if (!matchId) return;
    const now = timestamp(p.createdAt, event.occurredAt);
    const row: CivicActionRow = {
      id: event.entityId,
      matchId,
      title: stringValue(p.title, 'Coordinar entrega y recepción'),
      description: optionalString(p.description),
      status: 'planned',
      scheduledAt: optionalString(p.scheduledAt),
      completedAt: null,
      confirmedAt: null,
      outcomeJson: '{}',
      createdAt: now,
      updatedAt: timestamp(p.updatedAt, now),
    };
    db.insert(civicActions).values(row).onConflictDoNothing().run();
  }
  const current = db.select().from(civicActions).where(eq(civicActions.id, event.entityId)).get();
  if (!current) return;
  const status = ACTION_STATUSES.has(p.status as CivicActionStatus) ? p.status as CivicActionStatus : current.status;
  db.update(civicActions).set({
    status,
    completedAt: status === 'completed' || status === 'confirmed' ? current.completedAt ?? event.occurredAt : current.completedAt,
    confirmedAt: status === 'confirmed' ? current.confirmedAt ?? event.occurredAt : current.confirmedAt,
    updatedAt: event.occurredAt,
  }).where(eq(civicActions.id, event.entityId)).run();
};

/** Aplica una página idempotentemente; el cursor se persiste fuera de acá. */
export const applyOperationalFeed = (events: CivicOperationalFeedEvent[], actorKey: string): number => {
  let applied = 0;
  for (const event of events) {
    if (!event.entityId || !event.payload || typeof event.payload !== 'object') continue;
    if (event.entityType === 'observation') importObservation(event, actorKey);
    else if (event.entityType === 'need') importNeed(event);
    else if (event.entityType === 'resource') importResource(event);
    else if (event.entityType === 'verification') importVerification(event, actorKey);
    else if (event.entityType === 'match') importMatch(event, actorKey);
    else if (event.entityType === 'action') importAction(event);
    applied += 1;
  }
  return applied;
};

export const isOperationalFeedEvent = (value: unknown): value is CivicOperationalFeedEvent => {
  if (!value || typeof value !== 'object') return false;
  const event = value as Partial<CivicOperationalFeedEvent>;
  return typeof event.cursor === 'number'
    && typeof event.eventId === 'string'
    && typeof event.entityId === 'string'
    && typeof event.entityType === 'string'
    && ['observation', 'need', 'resource', 'verification', 'match', 'action'].includes(event.entityType)
    && typeof event.operation === 'string'
    && typeof event.occurredAt === 'string'
    && typeof event.ownedByMe === 'boolean'
    && !!event.payload
    && typeof event.payload === 'object'
    && !Array.isArray(event.payload);
};

/** El logout conserva lo propio y retira la proyección recibida de la red. */
export const clearOperationalFeed = (): void => {
  const remoteObservationIds = db.select({ id: civicObservations.id }).from(civicObservations)
    .where(like(civicObservations.creatorKey, 'remote:%')).all().map((item) => item.id);
  const remoteNeedIds = db.select({ id: civicNeeds.id }).from(civicNeeds)
    .where(eq(civicNeeds.ownedByMe, false)).all().map((item) => item.id);
  const remoteResourceIds = db.select({ id: civicResources.id }).from(civicResources)
    .where(eq(civicResources.ownedByMe, false)).all().map((item) => item.id);
  const remoteMatchIds = remoteNeedIds.length === 0 && remoteResourceIds.length === 0
    ? []
    : db.select({ id: civicMatches.id }).from(civicMatches).where(or(
      ...(remoteNeedIds.length > 0 ? [inArray(civicMatches.needId, remoteNeedIds)] : []),
      ...(remoteResourceIds.length > 0 ? [inArray(civicMatches.resourceId, remoteResourceIds)] : []),
    )).all().map((item) => item.id);
  if (remoteMatchIds.length > 0) {
    db.delete(civicActions).where(inArray(civicActions.matchId, remoteMatchIds)).run();
    db.delete(civicMatches).where(inArray(civicMatches.id, remoteMatchIds)).run();
  }
  if (remoteObservationIds.length > 0) {
    db.delete(civicRecordContexts).where(and(
      eq(civicRecordContexts.entityType, 'observation'),
      inArray(civicRecordContexts.entityId, remoteObservationIds),
    )).run();
  }
  if (remoteNeedIds.length > 0) {
    db.delete(civicRecordContexts).where(and(
      eq(civicRecordContexts.entityType, 'need'),
      inArray(civicRecordContexts.entityId, remoteNeedIds),
    )).run();
  }
  if (remoteResourceIds.length > 0) {
    db.delete(civicRecordContexts).where(and(
      eq(civicRecordContexts.entityType, 'resource'),
      inArray(civicRecordContexts.entityId, remoteResourceIds),
    )).run();
  }
  db.delete(civicNeeds).where(eq(civicNeeds.ownedByMe, false)).run();
  db.delete(civicResources).where(eq(civicResources.ownedByMe, false)).run();
  db.delete(civicVerifications).where(like(civicVerifications.verifierKey, 'remote:%')).run();
  if (remoteObservationIds.length > 0) {
    db.delete(civicVerifications).where(inArray(civicVerifications.observationId, remoteObservationIds)).run();
    db.delete(civicObservations).where(inArray(civicObservations.id, remoteObservationIds)).run();
  }
  setSetting('civic_feed_cursor_v1', '0');
};
