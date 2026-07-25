import type { AggregateSourceEvent } from './aggregates';

export const LISTENING_CAMPAIGN_KEY = 'escucha-v1';

export const LISTENING_THEMES = [
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
] as const;

export const LISTENING_KINDS = ['need', 'dream', 'proposal', 'capacity'] as const;
export const LISTENING_HORIZONS = ['now', 'year', 'generation'] as const;
export const LISTENING_SCOPES = ['personal', 'block', 'neighborhood', 'city', 'country'] as const;
export const LISTENING_PUBLIC_PRECISIONS = ['100m', '500m', 'neighborhood', 'city'] as const;

export type ListeningTheme = typeof LISTENING_THEMES[number];
export type ListeningKind = typeof LISTENING_KINDS[number];
export type ListeningHorizon = typeof LISTENING_HORIZONS[number];
export type ListeningScope = typeof LISTENING_SCOPES[number];
export type ListeningPublicPrecision = typeof LISTENING_PUBLIC_PRECISIONS[number];

type ListeningFacetName = 'theme' | 'kind' | 'horizon' | 'scope';

interface ListeningObservation {
  creatorKey: string;
  theme: ListeningTheme;
  kind: ListeningKind;
  horizon: ListeningHorizon;
  scope: ListeningScope;
  precision: ListeningPublicPrecision;
  spatialKey: string;
}

interface MutableFacetBucket<T extends string> {
  value: T;
  observations: number;
  creators: Set<string>;
}

interface MutableListeningFacets {
  theme: Map<ListeningTheme, MutableFacetBucket<ListeningTheme>>;
  kind: Map<ListeningKind, MutableFacetBucket<ListeningKind>>;
  horizon: Map<ListeningHorizon, MutableFacetBucket<ListeningHorizon>>;
  scope: Map<ListeningScope, MutableFacetBucket<ListeningScope>>;
}

interface MutableTerritory {
  precision: ListeningPublicPrecision;
  observations: number;
  creators: Set<string>;
  facets: MutableListeningFacets;
}

export interface PublicListeningFacetBucket<T extends string> {
  value: T;
  observations: number;
  contributors: {
    band: string;
    minimumApplied: number;
  };
}

export interface PublicListeningFacets {
  theme: PublicListeningFacetBucket<ListeningTheme>[];
  kind: PublicListeningFacetBucket<ListeningKind>[];
  horizon: PublicListeningFacetBucket<ListeningHorizon>[];
  scope: PublicListeningFacetBucket<ListeningScope>[];
}

/**
 * A protected territorial cohort. The grid key deliberately remains internal:
 * consumers receive neither a point, a label nor an identifier that could be
 * joined back to a person or a small place.
 */
export interface PublicListeningTerritory {
  precision: ListeningPublicPrecision;
  observations: number;
  contributors: {
    band: string;
    minimumApplied: number;
  };
  facets: PublicListeningFacets;
}

export interface PublicListeningInsightsResult {
  facets: PublicListeningFacets;
  territories: PublicListeningTerritory[];
  suppressedBuckets: Record<ListeningFacetName, number>;
  suppressedTerritories: number;
}

interface PublicPoint {
  lat: number;
  lng: number;
}

const THEME_SET = new Set<string>(LISTENING_THEMES);
const KIND_SET = new Set<string>(LISTENING_KINDS);
const HORIZON_SET = new Set<string>(LISTENING_HORIZONS);
const SCOPE_SET = new Set<string>(LISTENING_SCOPES);
const PRECISION_SET = new Set<string>(LISTENING_PUBLIC_PRECISIONS);

const METERS_PER_DEGREE_LAT = 111_320;
const PRECISION_METERS: Record<ListeningPublicPrecision, number> = {
  '100m': 100,
  '500m': 500,
  neighborhood: 1_500,
  city: 5_000,
};
const PRECISION_ORDER = new Map<ListeningPublicPrecision, number>(
  LISTENING_PUBLIC_PRECISIONS.map((precision, index) => [precision, index]),
);

const parseObject = (value: unknown): Record<string, unknown> | null =>
  value != null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;

const parsePayload = (raw: string): Record<string, unknown> | null => {
  try {
    return parseObject(JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
};

const allowed = <T extends string>(value: unknown, values: Set<string>): T | null =>
  typeof value === 'string' && values.has(value) ? value as T : null;

const publicPoint = (value: unknown): PublicPoint | null => {
  const location = parseObject(value);
  if (!location) return null;
  const { lat, lng } = location;
  if (typeof lat !== 'number' || typeof lng !== 'number') return null;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat, lng };
};

/**
 * Recomputes the grid server-side even if a stored client point contains extra
 * decimals. The returned key is only an internal grouping primitive and must
 * never cross the public API boundary.
 */
const spatialKeyFor = (point: PublicPoint, precision: ListeningPublicPrecision): string => {
  const meters = PRECISION_METERS[precision];
  const latStep = meters / METERS_PER_DEGREE_LAT;
  const latitudeIndex = Math.round(point.lat / latStep);
  const latitudeCenter = latitudeIndex * latStep;
  const longitudeScale = Math.max(0.2, Math.cos((latitudeCenter * Math.PI) / 180));
  const lngStep = meters / (METERS_PER_DEGREE_LAT * longitudeScale);
  const longitudeIndex = Math.round(point.lng / lngStep);
  return `grid:${precision}:${latitudeIndex}:${longitudeIndex}`;
};

const contributorBand = (count: number): string => {
  if (count < 10) return '5–9';
  if (count < 25) return '10–24';
  if (count < 50) return '25–49';
  if (count < 100) return '50–99';
  return '100+';
};

const minimumThreshold = (minimumCreators: number): number => {
  if (!Number.isFinite(minimumCreators)) return 5;
  return Math.max(5, Math.floor(minimumCreators));
};

const emptyFacets = (): MutableListeningFacets => ({
  theme: new Map<ListeningTheme, MutableFacetBucket<ListeningTheme>>(),
  kind: new Map<ListeningKind, MutableFacetBucket<ListeningKind>>(),
  horizon: new Map<ListeningHorizon, MutableFacetBucket<ListeningHorizon>>(),
  scope: new Map<ListeningScope, MutableFacetBucket<ListeningScope>>(),
});

const addBucket = <T extends string>(
  buckets: Map<T, MutableFacetBucket<T>>,
  value: T,
  creatorKey: string,
): void => {
  const bucket = buckets.get(value) ?? { value, observations: 0, creators: new Set<string>() };
  bucket.observations += 1;
  bucket.creators.add(creatorKey);
  buckets.set(value, bucket);
};

const addObservationToFacets = (
  facets: MutableListeningFacets,
  observation: ListeningObservation,
): void => {
  addBucket(facets.theme, observation.theme, observation.creatorKey);
  addBucket(facets.kind, observation.kind, observation.creatorKey);
  addBucket(facets.horizon, observation.horizon, observation.creatorKey);
  addBucket(facets.scope, observation.scope, observation.creatorKey);
};

const publicBuckets = <T extends string>(
  buckets: Map<T, MutableFacetBucket<T>>,
  minimumCreators: number,
): { rows: PublicListeningFacetBucket<T>[]; suppressed: number } => {
  const rows: PublicListeningFacetBucket<T>[] = [];
  let suppressed = 0;
  for (const bucket of buckets.values()) {
    if (bucket.creators.size < minimumCreators) {
      suppressed += 1;
      continue;
    }
    rows.push({
      value: bucket.value,
      observations: bucket.observations,
      contributors: {
        band: contributorBand(bucket.creators.size),
        minimumApplied: minimumCreators,
      },
    });
  }
  rows.sort((left, right) => right.observations - left.observations || left.value.localeCompare(right.value));
  return { rows, suppressed };
};

const publicFacets = (
  facets: MutableListeningFacets,
  minimumCreators: number,
): { facets: PublicListeningFacets; suppressed: Record<ListeningFacetName, number> } => {
  const theme = publicBuckets(facets.theme, minimumCreators);
  const kind = publicBuckets(facets.kind, minimumCreators);
  const horizon = publicBuckets(facets.horizon, minimumCreators);
  const scope = publicBuckets(facets.scope, minimumCreators);
  return {
    facets: { theme: theme.rows, kind: kind.rows, horizon: horizon.rows, scope: scope.rows },
    suppressed: {
      theme: theme.suppressed,
      kind: kind.suppressed,
      horizon: horizon.suppressed,
      scope: scope.suppressed,
    },
  };
};

/**
 * Public listening projection for `escucha-v1`.
 *
 * Inclusion fails closed: an observation must explicitly be collective, carry
 * a valid canonical public point plus an allowlisted public precision, and
 * contain all four allowlisted facets. Global facets enforce k per value.
 * Territorial cohorts additionally enforce k for the internal public cell and
 * then again for every exposed facet value inside that cell. Free text,
 * location labels, points, cell keys and all source identifiers are ignored.
 */
export function buildPublicListeningInsights(
  events: AggregateSourceEvent[],
  minimumCreators = 5,
): PublicListeningInsightsResult {
  const threshold = minimumThreshold(minimumCreators);
  const observations = new Map<string, ListeningObservation>();
  const orderedEvents = events
    .map((event, sourceIndex) => ({ event, sourceIndex }))
    .sort((left, right) => {
      const byOccurredAt = left.event.occurredAt.localeCompare(right.event.occurredAt);
      if (byOccurredAt !== 0) return byOccurredAt;
      return (left.event.sequence ?? left.sourceIndex) - (right.event.sequence ?? right.sourceIndex);
    })
    .map(({ event }) => event);

  for (const event of orderedEvents) {
    if (event.entityType !== 'observation' || !['create', 'update'].includes(event.operation)) continue;
    const payload = parsePayload(event.payloadJson);
    if (!payload) continue;
    const revoked = event.operation === 'update'
      && typeof payload.revokedAt === 'string'
      && Number.isFinite(Date.parse(payload.revokedAt));
    // También tratamos un cambio explícito fuera de la audiencia colectiva
    // como retiro de la proyección, aunque el ledger append-only permanezca.
    if (event.operation === 'update' && (revoked || payload.audience !== 'collective')) {
      observations.delete(event.entityId);
      continue;
    }
    if (
      payload.campaignKey !== LISTENING_CAMPAIGN_KEY
      || payload.audience !== 'collective'
    ) continue;
    const data = parseObject(payload.data);
    const point = publicPoint(payload.location);
    const precision = allowed<ListeningPublicPrecision>(payload.locationPrecision, PRECISION_SET);
    if (!data || !point || !precision) continue;

    const theme = allowed<ListeningTheme>(data.theme, THEME_SET);
    const kind = allowed<ListeningKind>(data.kind, KIND_SET);
    const horizon = allowed<ListeningHorizon>(data.horizon, HORIZON_SET);
    const scope = allowed<ListeningScope>(data.scope, SCOPE_SET);
    if (!theme || !kind || !horizon || !scope) continue;

    // Entity IDs are used only to make the projection idempotent and are
    // never copied, hashed or otherwise represented in the result.
    observations.set(event.entityId, {
      creatorKey: event.actorKey,
      theme,
      kind,
      horizon,
      scope,
      precision,
      spatialKey: spatialKeyFor(point, precision),
    });
  }

  const globalFacets = emptyFacets();
  const territories = new Map<string, MutableTerritory>();
  for (const observation of observations.values()) {
    addObservationToFacets(globalFacets, observation);

    const territory = territories.get(observation.spatialKey) ?? {
      precision: observation.precision,
      observations: 0,
      creators: new Set<string>(),
      facets: emptyFacets(),
    };
    territory.observations += 1;
    territory.creators.add(observation.creatorKey);
    addObservationToFacets(territory.facets, observation);
    territories.set(observation.spatialKey, territory);
  }

  const global = publicFacets(globalFacets, threshold);
  const publicTerritories: PublicListeningTerritory[] = [];
  let suppressedTerritories = 0;
  for (const territory of territories.values()) {
    if (territory.creators.size < threshold) {
      suppressedTerritories += 1;
      continue;
    }
    const projected = publicFacets(territory.facets, threshold);
    publicTerritories.push({
      precision: territory.precision,
      observations: territory.observations,
      contributors: {
        band: contributorBand(territory.creators.size),
        minimumApplied: threshold,
      },
      // Suppressed facet counts are intentionally not exposed per territory:
      // for small allowlists they could reveal a rare value by elimination.
      facets: projected.facets,
    });
  }
  publicTerritories.sort((left, right) =>
    (PRECISION_ORDER.get(left.precision) ?? Number.MAX_SAFE_INTEGER)
      - (PRECISION_ORDER.get(right.precision) ?? Number.MAX_SAFE_INTEGER)
    || right.observations - left.observations
    || JSON.stringify(left.facets).localeCompare(JSON.stringify(right.facets)),
  );

  return {
    facets: global.facets,
    territories: publicTerritories,
    suppressedBuckets: global.suppressed,
    suppressedTerritories,
  };
}
