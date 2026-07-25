import { createHash } from 'node:crypto';

import { LISTENING_CAMPAIGN_KEY } from './listening-insights';

export interface AggregateSourceEvent {
  /** Secuencia append-only del servidor; desempata eventos con igual fecha. */
  sequence?: number;
  eventId: string;
  actorKey: string;
  entityType: string;
  entityId: string;
  operation: string;
  payloadJson: string;
  occurredAt: string;
}

interface ObservationFact {
  id: string;
  actorKey: string;
  campaignKey: string;
  campaignVersion: number;
  category: string;
  locationLabel: string | null;
  precision: string;
  spatialKey: string;
  groupKey: string;
}

interface NeedFact {
  id: string;
  actorKey: string;
  observationId: string | null;
  category: string;
  locationLabel: string | null;
  precision: string;
  spatialKey: string;
}

interface ResourceFact {
  id: string;
  actorKey: string;
  category: string;
  locationLabel: string | null;
  precision: string;
  spatialKey: string;
}

interface MutableGroup {
  campaignKey: string;
  campaignVersion: number;
  category: string;
  locationLabels: Map<string, Set<string>>;
  precision: string;
  spatialKey: string;
  observations: Set<string>;
  corroborated: Set<string>;
  unsafe: Set<string>;
  needs: Set<string>;
  resources: Set<string>;
  resolvedNeeds: Set<string>;
  sourceContributors: Set<string>;
  updatedAt: string;
}

const PRECISIONS = new Set(['100m', '500m', 'neighborhood', 'city']);
const safeText = (value: unknown, fallback: string, max = 120): string =>
  typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : fallback;
const safeOptionalText = (value: unknown, max = 120): string | null =>
  typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : null;
const safePrecision = (value: unknown): string => PRECISIONS.has(String(value)) ? String(value) : 'city';
const isExpiredPayload = (payload: Record<string, unknown>, at = Date.now()): boolean => {
  if (payload.expiresAt == null) return false;
  if (typeof payload.expiresAt !== 'string') return true;
  const expiresAt = Date.parse(payload.expiresAt);
  return !Number.isFinite(expiresAt) || expiresAt <= at;
};
const asObject = (raw: string): Record<string, unknown> | null => {
  try {
    const value = JSON.parse(raw) as unknown;
    return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null;
  } catch { return null; }
};

interface PublicPoint {
  lat: number;
  lng: number;
}

type PublicPointResult =
  | { status: 'absent'; point: null }
  | { status: 'invalid'; point: null }
  | { status: 'valid'; point: PublicPoint };

const hasOwn = (value: Record<string, unknown>, key: string): boolean =>
  Object.prototype.hasOwnProperty.call(value, key);

const validatedPoint = (lat: unknown, lng: unknown): PublicPointResult => {
  const latMissing = lat == null;
  const lngMissing = lng == null;
  if (latMissing && lngMissing) return { status: 'absent', point: null };
  if (latMissing || lngMissing) return { status: 'invalid', point: null };
  if (typeof lat !== 'number' || typeof lng !== 'number') return { status: 'invalid', point: null };
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return { status: 'invalid', point: null };
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return { status: 'invalid', point: null };
  return { status: 'valid', point: { lat, lng } };
};

/**
 * Observations use `location: { lat, lng }`; needs and resources currently use
 * `publicLat/publicLng`. Both contracts converge here so malformed pairs can
 * never become a territorial grouping key.
 */
const publicPointFrom = (payload: Record<string, unknown>): PublicPointResult => {
  if (hasOwn(payload, 'location')) {
    if (payload.location == null) return { status: 'absent', point: null };
    if (typeof payload.location !== 'object' || Array.isArray(payload.location)) {
      return { status: 'invalid', point: null };
    }
    const location = payload.location as Record<string, unknown>;
    if (!hasOwn(location, 'lat') && !hasOwn(location, 'lng')) return { status: 'invalid', point: null };
    return validatedPoint(location.lat, location.lng);
  }
  if (hasOwn(payload, 'publicLat') || hasOwn(payload, 'publicLng')) {
    return validatedPoint(payload.publicLat, payload.publicLng);
  }
  return { status: 'absent', point: null };
};

const METERS_PER_DEGREE_LAT = 111_320;
const PRECISION_METERS: Record<string, number> = {
  '100m': 100,
  '500m': 500,
  neighborhood: 1_500,
  city: 5_000,
};

/**
 * Stable geographic grouping derived from the public point, never from a
 * user-controlled label. Re-normalizing also prevents extra decimals from
 * silently creating finer public cells than the declared precision.
 */
const spatialKeyFor = (point: PublicPoint | null, precision: string): string => {
  if (!point) return 'no-public-point';
  const meters = PRECISION_METERS[precision] ?? PRECISION_METERS.city;
  const latStep = meters / METERS_PER_DEGREE_LAT;
  const latitudeIndex = Math.round(point.lat / latStep);
  const latitudeCenter = latitudeIndex * latStep;
  const longitudeScale = Math.max(0.2, Math.cos((latitudeCenter * Math.PI) / 180));
  const lngStep = meters / (METERS_PER_DEGREE_LAT * longitudeScale);
  const longitudeIndex = Math.round(point.lng / lngStep);
  return `grid:${precision}:${latitudeIndex}:${longitudeIndex}`;
};

const keyFor = (
  campaignKey: string,
  version: number,
  category: string,
  spatialKey: string,
  precision: string,
): string => JSON.stringify([campaignKey, version, category, spatialKey, precision]);

const addLocationLabel = (group: MutableGroup, label: string | null, actorKey: string): void => {
  if (!label) return;
  const contributors = group.locationLabels.get(label) ?? new Set<string>();
  contributors.add(actorKey);
  group.locationLabels.set(label, contributors);
};

const preferredLocationLabel = (group: MutableGroup, minimumSourceContributors: number): string | null => {
  const labels = [...group.locationLabels.entries()]
    .filter(([, contributors]) => contributors.size >= minimumSourceContributors);
  labels.sort(([leftLabel, leftContributors], [rightLabel, rightContributors]) =>
    rightContributors.size - leftContributors.size || leftLabel.localeCompare(rightLabel, 'es'),
  );
  return labels[0]?.[0] ?? null;
};

const band = (count: number): string => {
  if (count < 10) return '5–9';
  if (count < 25) return '10–24';
  if (count < 50) return '25–49';
  if (count < 100) return '50–99';
  return '100+';
};

export interface PublicCivicAggregate {
  id: string;
  campaignKey: string;
  campaignVersion: number;
  category: string;
  territory: { label: string | null; precision: string };
  coverage: { observed: number; target: null; pct: null };
  quality: {
    corroborated: number;
    needsReview: number;
    unsafe: number;
    confidencePct: number;
    method: 'two-independent-confirmations';
  };
  needs: { open: number; resolved: number };
  resources: { available: number };
  contributors: { band: string; minimumApplied: number };
  updatedAt: string;
}

export interface PublicCivicAggregateResult {
  groups: PublicCivicAggregate[];
  suppressedGroups: number;
  processedEvents: number;
}

/**
 * Proyección pública con k-anonimato básico. El umbral cuenta únicamente a
 * quienes originaron observaciones, necesidades o recursos; verificadores
 * independientes afectan la calidad, nunca la publicación del grupo. El
 * resultado no contiene ids de filas, actores, puntos, evidencia, contacto ni
 * grupos por debajo del umbral.
 */
export function buildPublicCivicAggregates(
  events: AggregateSourceEvent[],
  configuredMinimumSourceContributors = 5,
): PublicCivicAggregateResult {
  const minimumSourceContributors = Number.isFinite(configuredMinimumSourceContributors)
    ? Math.max(5, Math.floor(configuredMinimumSourceContributors))
    : 5;
  const observations = new Map<string, ObservationFact>();
  const needs = new Map<string, NeedFact>();
  const resources = new Map<string, ResourceFact>();
  const verifications = new Map<string, Array<{ actorKey: string; verdict: string }>>();
  const matchNeeds = new Map<string, string>();
  const matchResources = new Map<string, string>();
  const matchStatuses = new Map<string, string>();
  const confirmedMatches = new Set<string>();
  const actionMatches = new Map<string, string>();
  const confirmedActions = new Set<string>();

  // La consulta pública prioriza los eventos más recientes para respetar el
  // límite de lectura, pero la proyección debe reconstruir el estado en orden
  // append-only: create -> corrección -> revocación.
  const orderedEvents = events
    .map((event, sourceIndex) => ({ event, sourceIndex }))
    .sort((left, right) => {
      const byOccurredAt = left.event.occurredAt.localeCompare(right.event.occurredAt);
      if (byOccurredAt !== 0) return byOccurredAt;
      const leftSequence = left.event.sequence ?? left.sourceIndex;
      const rightSequence = right.event.sequence ?? right.sourceIndex;
      return leftSequence - rightSequence;
    })
    .map(({ event }) => event);

  for (const event of orderedEvents) {
    const payload = asObject(event.payloadJson);
    if (!payload) continue;
    const isPublicEntity = ['observation', 'need', 'resource'].includes(event.entityType);
    const isRevocation = event.operation === 'update'
      && typeof payload.revokedAt === 'string'
      && Number.isFinite(Date.parse(payload.revokedAt));
    if (isPublicEntity && event.operation === 'update' && (isRevocation || payload.audience !== 'collective')) {
      if (event.entityType === 'observation') observations.delete(event.entityId);
      if (event.entityType === 'need') needs.delete(event.entityId);
      if (event.entityType === 'resource') resources.delete(event.entityId);
      continue;
    }
    if (isPublicEntity && payload.audience !== 'collective') continue;
    if (event.entityType === 'observation' && ['create', 'update'].includes(event.operation)) {
      if (isExpiredPayload(payload) || ['stale', 'withdrawn'].includes(String(payload.status))) {
        observations.delete(event.entityId);
        continue;
      }
      const campaignKey = safeText(payload.campaignKey, 'senal-libre-v1', 64);
      // Listening has a stricter aggregate-only contract with no territorial
      // labels or arbitrary categories. It must never fall through to this
      // general-purpose Radiografía projection.
      if (campaignKey === LISTENING_CAMPAIGN_KEY) continue;
      const campaignVersion = Number.isInteger(payload.campaignVersion) ? Number(payload.campaignVersion) : 1;
      const category = safeText(payload.category, 'sin-categoria', 80);
      const locationLabel = safeOptionalText(payload.locationLabel);
      const precision = safePrecision(payload.locationPrecision ?? payload.publicPrecision);
      const location = publicPointFrom(payload);
      if (location.status !== 'valid') continue;
      const spatialKey = spatialKeyFor(location.point, precision);
      observations.set(event.entityId, {
        id: event.entityId, actorKey: event.actorKey, campaignKey, campaignVersion,
        category, locationLabel, precision, spatialKey,
        groupKey: keyFor(campaignKey, campaignVersion, category, spatialKey, precision),
      });
    }
    if (event.entityType === 'need' && ['create', 'update'].includes(event.operation)) {
      if (isExpiredPayload(payload) || ['draft', 'withdrawn'].includes(String(payload.status))) {
        needs.delete(event.entityId);
        continue;
      }
      const precision = safePrecision(payload.publicPrecision ?? payload.locationPrecision);
      const location = publicPointFrom(payload);
      if (location.status !== 'valid') continue;
      needs.set(event.entityId, {
        id: event.entityId,
        actorKey: event.actorKey,
        observationId: typeof payload.observationId === 'string' ? payload.observationId : null,
        category: safeText(payload.category, 'sin-categoria', 80),
        locationLabel: safeOptionalText(payload.locationLabel),
        precision,
        spatialKey: spatialKeyFor(location.point, precision),
      });
    }
    if (event.entityType === 'resource' && ['create', 'update'].includes(event.operation)) {
      const quantity = payload.quantity;
      if (
        isExpiredPayload(payload)
        || (payload.status != null && payload.status !== 'available')
        || (typeof quantity === 'number' && quantity <= 0)
      ) {
        resources.delete(event.entityId);
        continue;
      }
      const precision = safePrecision(payload.publicPrecision ?? payload.locationPrecision);
      const location = publicPointFrom(payload);
      if (location.status !== 'valid') continue;
      resources.set(event.entityId, {
        id: event.entityId,
        actorKey: event.actorKey,
        category: safeText(payload.category, 'sin-categoria', 80),
        locationLabel: safeOptionalText(payload.locationLabel),
        precision,
        spatialKey: spatialKeyFor(location.point, precision),
      });
    }
    if (event.entityType === 'verification' && event.operation === 'create' && typeof payload.observationId === 'string') {
      const rows = verifications.get(payload.observationId) ?? [];
      rows.push({ actorKey: event.actorKey, verdict: safeText(payload.verdict, 'cannot_verify', 32) });
      verifications.set(payload.observationId, rows);
    }
    if (event.entityType === 'match' && event.operation === 'create' && typeof payload.needId === 'string') {
      matchNeeds.set(event.entityId, payload.needId);
      if (typeof payload.resourceId === 'string') matchResources.set(event.entityId, payload.resourceId);
      matchStatuses.set(event.entityId, safeText(payload.status, 'proposed', 32));
    }
    if (event.entityType === 'match' && event.operation === 'transition' && typeof payload.status === 'string') {
      matchStatuses.set(event.entityId, payload.status);
      if (payload.status === 'confirmed') confirmedMatches.add(event.entityId);
    }
    if (event.entityType === 'action' && event.operation === 'create' && typeof payload.matchId === 'string') {
      actionMatches.set(event.entityId, payload.matchId);
    }
    if (event.entityType === 'action' && event.operation === 'transition' && payload.status === 'confirmed') {
      confirmedActions.add(event.entityId);
    }
  }

  const groups = new Map<string, MutableGroup>();
  const ensure = (
    campaignKey: string,
    campaignVersion: number,
    category: string,
    locationLabel: string | null,
    precision: string,
    spatialKey: string,
    sourceActorKey: string,
    updatedAt: string,
  ): MutableGroup => {
    const key = keyFor(campaignKey, campaignVersion, category, spatialKey, precision);
    let group = groups.get(key);
    if (!group) {
      group = {
        campaignKey, campaignVersion, category, locationLabels: new Map(), precision, spatialKey,
        observations: new Set(), corroborated: new Set(), unsafe: new Set(), needs: new Set(),
        resources: new Set(), resolvedNeeds: new Set(), sourceContributors: new Set(), updatedAt,
      };
      groups.set(key, group);
    }
    addLocationLabel(group, locationLabel, sourceActorKey);
    if (updatedAt > group.updatedAt) group.updatedAt = updatedAt;
    return group;
  };

  const occurredByEntity = new Map(orderedEvents.map((event) => [`${event.entityType}:${event.entityId}`, event.occurredAt]));
  for (const observation of observations.values()) {
    const group = ensure(
      observation.campaignKey, observation.campaignVersion, observation.category,
      observation.locationLabel, observation.precision, observation.spatialKey,
      observation.actorKey,
      occurredByEntity.get(`observation:${observation.id}`) ?? '',
    );
    group.observations.add(observation.id);
    group.sourceContributors.add(observation.actorKey);
    const verdictRows = verifications.get(observation.id) ?? [];
    const confirmationActors = new Set(verdictRows.filter((row) => row.verdict === 'confirm').map((row) => row.actorKey));
    if (verdictRows.some((row) => row.verdict === 'unsafe')) group.unsafe.add(observation.id);
    else if (confirmationActors.size >= 2 && !verdictRows.some((row) => row.verdict === 'correct')) group.corroborated.add(observation.id);
  }

  const groupForNeed = new Map<string, MutableGroup>();
  for (const need of needs.values()) {
    const observation = need.observationId ? observations.get(need.observationId) : null;
    const sharesObservationGroup = observation != null
      && observation.spatialKey === need.spatialKey
      && observation.precision === need.precision;
    const group = sharesObservationGroup
      ? groups.get(observation.groupKey)!
      : ensure(
          observation?.campaignKey ?? 'red-operativa-v1',
          observation?.campaignVersion ?? 1,
          need.category,
          need.locationLabel,
          need.precision,
          need.spatialKey,
          need.actorKey,
          occurredByEntity.get(`need:${need.id}`) ?? '',
        );
    if (sharesObservationGroup) addLocationLabel(group, need.locationLabel, need.actorKey);
    group.needs.add(need.id);
    group.sourceContributors.add(need.actorKey);
    groupForNeed.set(need.id, group);
  }

  const unavailableResourceIds = new Set(
    [...matchStatuses.entries()]
      .filter(([, status]) => ['accepted', 'in_progress', 'fulfilled', 'confirmed'].includes(status))
      .map(([matchId]) => matchResources.get(matchId))
      .filter((resourceId): resourceId is string => resourceId != null),
  );
  for (const resource of resources.values()) {
    if (unavailableResourceIds.has(resource.id)) continue;
    const group = ensure('red-recursos-v1', 1, resource.category, resource.locationLabel, resource.precision, resource.spatialKey, resource.actorKey, occurredByEntity.get(`resource:${resource.id}`) ?? '');
    group.resources.add(resource.id);
    group.sourceContributors.add(resource.actorKey);
  }

  const resolvedMatchIds = new Set(confirmedMatches);
  for (const actionId of confirmedActions) {
    const matchId = actionMatches.get(actionId);
    if (matchId) resolvedMatchIds.add(matchId);
  }
  for (const matchId of resolvedMatchIds) {
    const needId = matchNeeds.get(matchId);
    const group = needId ? groupForNeed.get(needId) : null;
    if (needId && group) group.resolvedNeeds.add(needId);
  }

  let suppressedGroups = 0;
  const publicGroups: PublicCivicAggregate[] = [];
  for (const [rawKey, group] of groups) {
    if (group.sourceContributors.size < minimumSourceContributors) {
      suppressedGroups += 1;
      continue;
    }
    const observationCount = group.observations.size;
    const unsafeCount = group.unsafe.size;
    const corroboratedCount = group.corroborated.size;
    const needsReview = Math.max(0, observationCount - unsafeCount - corroboratedCount);
    const confidencePct = observationCount > 0
      ? Math.round(((corroboratedCount + needsReview * 0.35) / observationCount) * 100)
      : 0;
    publicGroups.push({
      id: createHash('sha256').update(rawKey).digest('hex').slice(0, 16),
      campaignKey: group.campaignKey,
      campaignVersion: group.campaignVersion,
      category: group.category,
      territory: { label: preferredLocationLabel(group, minimumSourceContributors), precision: group.precision },
      coverage: { observed: observationCount, target: null, pct: null },
      quality: {
        corroborated: corroboratedCount,
        needsReview,
        unsafe: unsafeCount,
        confidencePct,
        method: 'two-independent-confirmations',
      },
      needs: { open: Math.max(0, group.needs.size - group.resolvedNeeds.size), resolved: group.resolvedNeeds.size },
      resources: { available: group.resources.size },
      contributors: { band: band(group.sourceContributors.size), minimumApplied: minimumSourceContributors },
      updatedAt: group.updatedAt,
    });
  }

  publicGroups.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  return { groups: publicGroups, suppressedGroups, processedEvents: events.length };
}
