import { z } from 'zod';

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const civicUuidV4Schema = z.string()
  .regex(UUID_V4, 'UUID v4 inválido')
  .transform((value) => value.toLowerCase());

export const civicActorKeySchema = z.string().regex(
  /^actor_[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  'actorKey inválido',
).transform((value) => value.toLowerCase());

export const civicDeviceEnrollmentSchema = z.object({
  actorKey: civicActorKeySchema,
  /** 32 bytes aleatorios codificados como hexadecimal. */
  deviceSecret: z.string().regex(/^[0-9a-f]{64}$/i, 'deviceSecret inválido')
    .transform((value) => value.toLowerCase()),
  platform: z.enum(['ios', 'android', 'web']).optional(),
  clientVersion: z.string().trim().min(1).max(40).optional(),
}).strict();

export const civicEntitySchema = z.enum([
  'observation',
  'need',
  'resource',
  'verification',
  'match',
  'action',
  'territory',
  'consent',
]);

export const civicOperationSchema = z.enum(['create', 'update', 'transition', 'delete']);

export const civicEventSchema = z.object({
  eventId: civicUuidV4Schema,
  entityType: civicEntitySchema,
  entityId: civicUuidV4Schema,
  operation: civicOperationSchema,
  payload: z.record(z.unknown()),
  createdAt: z.string().datetime(),
}).strict();

export const civicIdempotencyKeySchema = z.string()
  .trim()
  .min(8)
  .max(180)
  .regex(/^[a-zA-Z0-9:._-]+$/, 'Idempotency-Key inválida');

export type CivicEntityType = z.infer<typeof civicEntitySchema>;
export type CivicOperation = z.infer<typeof civicOperationSchema>;
export type CivicEventInput = z.infer<typeof civicEventSchema>;
export type CivicDeviceEnrollment = z.infer<typeof civicDeviceEnrollmentSchema>;
export type CivicDeviceRole = 'contributor' | 'verifier' | 'coordinator';

const FORBIDDEN_KEYS = new Set([
  'exactlat',
  'exactlng',
  'exactlocation',
  'photouri',
  'localuri',
  'filepath',
  'exif',
  'gpslatitude',
  'gpslongitude',
  'phone',
  'phonenumber',
  'telefono',
  'email',
  'correo',
  'address',
  'direccion',
  'contact',
  'contactinfo',
]);

const LOCAL_MEDIA_PATTERN = /(file|content|ph|assets-library):\/\//i;
const INLINE_MEDIA_PATTERN = /data:(image|video|audio)\//i;
const EMAIL_PATTERN = /[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+/i;
const PHONE_CANDIDATE_PATTERN = /(?<![\w-])\+?\d[\d\s().-]{7,}\d(?![\w-])/g;

export interface PayloadSafetyIssue {
  code:
    | 'FORBIDDEN_FIELD'
    | 'EXACT_LOCATION_FORBIDDEN'
    | 'INVALID_PUBLIC_LOCATION'
    | 'INVALID_PUBLIC_PRECISION'
    | 'UNSUPPORTED_AUDIENCE'
    | 'NON_CANONICAL_LOCATION_FORBIDDEN'
    | 'PERSONAL_CONTACT_FORBIDDEN'
    | 'PUBLIC_LOCATION_TOO_PRECISE'
    | 'LOCAL_MEDIA_FORBIDDEN'
    | 'PAYLOAD_TOO_LARGE';
  path: string;
}

const MAX_PUBLIC_COORDINATE_DECIMALS = 6;
const METERS_PER_DEGREE_LAT = 111_320;
const PUBLIC_PRECISION_METERS = {
  '100m': 100,
  '500m': 500,
  neighborhood: 1_500,
  city: 5_000,
} as const;

type PublicPrecision = keyof typeof PUBLIC_PRECISION_METERS;

const normalizedKey = (key: string): string => key.replace(/[_-]/g, '').toLowerCase();

const containsPersonalContact = (value: string): boolean => {
  if (EMAIL_PATTERN.test(value)) return true;
  for (const match of value.matchAll(PHONE_CANDIDATE_PATTERN)) {
    const candidate = match[0].trim();
    const digits = candidate.replace(/\D/g, '');
    if (digits.length < 9 || digits.length > 15) continue;
    // Calendar dates can otherwise resemble short separated phone numbers.
    if (/^\d{4}-\d{2}-\d{2}$/.test(candidate)) continue;
    return true;
  }
  return false;
};

const fractionalDigits = (value: number): number => {
  const [coefficient, rawExponent] = value.toString().toLowerCase().split('e');
  const exponent = Number(rawExponent ?? 0);
  const decimals = coefficient.split('.')[1]?.length ?? 0;
  return Math.max(0, decimals - exponent);
};

const coordinateIssue = (
  value: unknown,
  axis: 'lat' | 'lng',
  path: string,
): PayloadSafetyIssue | null => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return { code: 'INVALID_PUBLIC_LOCATION', path };
  }
  const [minimum, maximum] = axis === 'lat' ? [-90, 90] : [-180, 180];
  if (value < minimum || value > maximum) {
    return { code: 'INVALID_PUBLIC_LOCATION', path };
  }
  // The mobile client represents reduced-grid centroids with up to six
  // decimals. A stricter decimal rule would reject valid 100 m/500 m cells;
  // this compatible ceiling still blocks meaningless sub-decimetre detail.
  if (fractionalDigits(value) > MAX_PUBLIC_COORDINATE_DECIMALS) {
    return { code: 'PUBLIC_LOCATION_TOO_PRECISE', path };
  }
  return null;
};

const ownEntry = (
  value: Record<string, unknown>,
  wanted: string,
): [string, unknown] | null => Object.entries(value)
  .find(([key]) => normalizedKey(key) === wanted) ?? null;

const canonicalizeEntry = (
  target: Record<string, unknown>,
  entry: [string, unknown] | null,
  canonicalKey: string,
  value: unknown,
): void => {
  const wanted = entry ? normalizedKey(entry[0]) : normalizedKey(canonicalKey);
  for (const key of Object.keys(target)) {
    if (normalizedKey(key) === wanted) delete target[key];
  }
  target[canonicalKey] = value;
};

const publicPrecision = (
  value: unknown,
  path: string,
): { precision: PublicPrecision; issue: null } | { precision: null; issue: PayloadSafetyIssue } => {
  if (typeof value !== 'string') {
    return { precision: null, issue: { code: 'INVALID_PUBLIC_PRECISION', path } };
  }
  const normalized = value.trim().toLowerCase();
  if (normalized === 'exact') {
    return { precision: null, issue: { code: 'EXACT_LOCATION_FORBIDDEN', path } };
  }
  if (!Object.prototype.hasOwnProperty.call(PUBLIC_PRECISION_METERS, normalized)) {
    return { precision: null, issue: { code: 'INVALID_PUBLIC_PRECISION', path } };
  }
  return { precision: normalized as PublicPrecision, issue: null };
};

const validCoordinate = (value: unknown, axis: 'lat' | 'lng'): value is number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return false;
  return axis === 'lat' ? value >= -90 && value <= 90 : value >= -180 && value <= 180;
};

/**
 * The server, rather than the mobile client, defines the public grid. Using the
 * snapped latitude to derive the longitude step makes the cell deterministic
 * for every point in the same latitude band.
 */
const snapPublicPoint = (lat: number, lng: number, precision: PublicPrecision) => {
  const meters = PUBLIC_PRECISION_METERS[precision];
  const latStep = meters / METERS_PER_DEGREE_LAT;
  const latitudeIndex = Math.round(lat / latStep);
  const latitudeCenter = latitudeIndex * latStep;
  const longitudeScale = Math.max(0.2, Math.cos((latitudeCenter * Math.PI) / 180));
  const lngStep = meters / (METERS_PER_DEGREE_LAT * longitudeScale);
  const longitudeIndex = Math.round(lng / lngStep);
  return {
    lat: Number(Math.max(-90, Math.min(90, latitudeCenter)).toFixed(MAX_PUBLIC_COORDINATE_DECIMALS)),
    lng: Number(Math.max(-180, Math.min(180, longitudeIndex * lngStep)).toFixed(MAX_PUBLIC_COORDINATE_DECIMALS)),
  };
};

export type PublicPayloadNormalizationResult =
  | { payload: Record<string, unknown>; issue: null }
  | { payload: null; issue: PayloadSafetyIssue };

const nonCanonicalLocationIssue = (
  payload: Record<string, unknown>,
  entityType: 'observation' | 'need' | 'resource',
): PayloadSafetyIssue | null => {
  const visit = (
    value: unknown,
    path: string,
    allowLatLng: boolean,
    allowPublicLatLng: boolean,
  ): PayloadSafetyIssue | null => {
    if (Array.isArray(value)) {
      for (let index = 0; index < value.length; index += 1) {
        const issue = visit(value[index], `${path}[${index}]`, false, false);
        if (issue) return issue;
      }
      return null;
    }
    if (!value || typeof value !== 'object') return null;

    const record = value as Record<string, unknown>;
    const hasLatLng = ownEntry(record, 'lat') != null || ownEntry(record, 'lng') != null;
    const hasLongForm = ownEntry(record, 'latitude') != null || ownEntry(record, 'longitude') != null;
    const hasPublicLatLng = ownEntry(record, 'publiclat') != null || ownEntry(record, 'publiclng') != null;
    if ((hasLatLng && !allowLatLng) || hasLongForm || (hasPublicLatLng && !allowPublicLatLng)) {
      return { code: 'NON_CANONICAL_LOCATION_FORBIDDEN', path };
    }

    for (const [key, child] of Object.entries(record)) {
      const canonicalObservationLocation = entityType === 'observation'
        && path === '$'
        && normalizedKey(key) === 'location';
      const issue = visit(child, `${path}.${key}`, canonicalObservationLocation, false);
      if (issue) return issue;
    }
    return null;
  };

  return visit(payload, '$', false, entityType !== 'observation');
};

/**
 * Canonicalizes the record-level release envelope before hashing or storage.
 * Missing audience remains accepted for legacy ingestion but is deliberately
 * invisible to the operational feed. Explicit non-collective audiences are not
 * supported by this shared log until they have a real ACL/recipient reference.
 */
export function normalizePublicEventPayload(
  entityType: CivicEntityType,
  payload: Record<string, unknown>,
): PublicPayloadNormalizationResult {
  if (!['observation', 'need', 'resource'].includes(entityType)) {
    return { payload: { ...payload }, issue: null };
  }

  const envelopeIssue = nonCanonicalLocationIssue(
    payload,
    entityType as 'observation' | 'need' | 'resource',
  );
  if (envelopeIssue) return { payload: null, issue: envelopeIssue };

  const normalized = { ...payload };
  const audienceEntry = ownEntry(normalized, 'audience');
  if (audienceEntry && audienceEntry[1] != null) {
    if (typeof audienceEntry[1] !== 'string' || audienceEntry[1].trim().toLowerCase() !== 'collective') {
      return { payload: null, issue: { code: 'UNSUPPORTED_AUDIENCE', path: `$.${audienceEntry[0]}` } };
    }
    canonicalizeEntry(normalized, audienceEntry, 'audience', 'collective');
  }

  if (entityType === 'observation') {
    const locationEntry = ownEntry(normalized, 'location');
    const precisionEntry = ownEntry(normalized, 'locationprecision');
    if (!locationEntry) {
      if (!precisionEntry) return { payload: normalized, issue: null };
      const parsed = publicPrecision(precisionEntry[1], `$.${precisionEntry[0]}`);
      if (parsed.issue) return { payload: null, issue: parsed.issue };
      canonicalizeEntry(normalized, precisionEntry, 'locationPrecision', parsed.precision);
      return { payload: normalized, issue: null };
    }
    if (locationEntry[1] == null) {
      canonicalizeEntry(normalized, locationEntry, 'location', null);
      if (precisionEntry) {
        const parsed = publicPrecision(precisionEntry[1], `$.${precisionEntry[0]}`);
        if (parsed.issue) return { payload: null, issue: parsed.issue };
        canonicalizeEntry(normalized, precisionEntry, 'locationPrecision', parsed.precision);
      }
      return { payload: normalized, issue: null };
    }
    if (typeof locationEntry[1] !== 'object' || Array.isArray(locationEntry[1])) {
      return { payload: null, issue: { code: 'INVALID_PUBLIC_LOCATION', path: `$.${locationEntry[0]}` } };
    }
    const location = locationEntry[1] as Record<string, unknown>;
    const latEntry = ownEntry(location, 'lat');
    const lngEntry = ownEntry(location, 'lng');
    if (!latEntry || !lngEntry || !validCoordinate(latEntry[1], 'lat') || !validCoordinate(lngEntry[1], 'lng')) {
      return { payload: null, issue: { code: 'INVALID_PUBLIC_LOCATION', path: `$.${locationEntry[0]}` } };
    }
    if (!precisionEntry) {
      return { payload: null, issue: { code: 'INVALID_PUBLIC_PRECISION', path: '$.locationPrecision' } };
    }
    const parsed = publicPrecision(precisionEntry[1], `$.${precisionEntry[0]}`);
    if (parsed.issue) return { payload: null, issue: parsed.issue };
    const point = snapPublicPoint(latEntry[1], lngEntry[1], parsed.precision);
    const canonicalLocation = { ...location };
    canonicalizeEntry(canonicalLocation, latEntry, 'lat', point.lat);
    canonicalizeEntry(canonicalLocation, lngEntry, 'lng', point.lng);
    canonicalizeEntry(normalized, locationEntry, 'location', canonicalLocation);
    canonicalizeEntry(normalized, precisionEntry, 'locationPrecision', parsed.precision);
    return { payload: normalized, issue: null };
  }

  const latEntry = ownEntry(normalized, 'publiclat');
  const lngEntry = ownEntry(normalized, 'publiclng');
  const precisionEntry = ownEntry(normalized, 'publicprecision');
  if (!latEntry && !lngEntry) {
    if (!precisionEntry) return { payload: normalized, issue: null };
    const parsed = publicPrecision(precisionEntry[1], `$.${precisionEntry[0]}`);
    if (parsed.issue) return { payload: null, issue: parsed.issue };
    canonicalizeEntry(normalized, precisionEntry, 'publicPrecision', parsed.precision);
    return { payload: normalized, issue: null };
  }
  if (!latEntry || !lngEntry) {
    return { payload: null, issue: { code: 'INVALID_PUBLIC_LOCATION', path: '$' } };
  }
  if (latEntry[1] == null && lngEntry[1] == null) {
    canonicalizeEntry(normalized, latEntry, 'publicLat', null);
    canonicalizeEntry(normalized, lngEntry, 'publicLng', null);
    if (precisionEntry) {
      const parsed = publicPrecision(precisionEntry[1], `$.${precisionEntry[0]}`);
      if (parsed.issue) return { payload: null, issue: parsed.issue };
      canonicalizeEntry(normalized, precisionEntry, 'publicPrecision', parsed.precision);
    }
    return { payload: normalized, issue: null };
  }
  if (!validCoordinate(latEntry[1], 'lat') || !validCoordinate(lngEntry[1], 'lng')) {
    return { payload: null, issue: { code: 'INVALID_PUBLIC_LOCATION', path: '$' } };
  }
  if (!precisionEntry) {
    return { payload: null, issue: { code: 'INVALID_PUBLIC_PRECISION', path: '$.publicPrecision' } };
  }
  const parsed = publicPrecision(precisionEntry[1], `$.${precisionEntry[0]}`);
  if (parsed.issue) return { payload: null, issue: parsed.issue };
  const point = snapPublicPoint(latEntry[1], lngEntry[1], parsed.precision);
  canonicalizeEntry(normalized, latEntry, 'publicLat', point.lat);
  canonicalizeEntry(normalized, lngEntry, 'publicLng', point.lng);
  canonicalizeEntry(normalized, precisionEntry, 'publicPrecision', parsed.precision);
  return { payload: normalized, issue: null };
}

const publicPointIssue = (
  value: Record<string, unknown>,
  path: string,
): PayloadSafetyIssue | null => {
  const lat = ownEntry(value, 'lat');
  const lng = ownEntry(value, 'lng');
  if (Boolean(lat) !== Boolean(lng)) {
    return { code: 'INVALID_PUBLIC_LOCATION', path };
  }
  if (lat && lng) {
    const issue = coordinateIssue(lat[1], 'lat', `${path}.${lat[0]}`)
      ?? coordinateIssue(lng[1], 'lng', `${path}.${lng[0]}`);
    if (issue) return issue;
  }

  const publicLat = ownEntry(value, 'publiclat');
  const publicLng = ownEntry(value, 'publiclng');
  if (Boolean(publicLat) !== Boolean(publicLng)) {
    return { code: 'INVALID_PUBLIC_LOCATION', path };
  }
  if (!publicLat || !publicLng) return null;
  if (publicLat[1] == null && publicLng[1] == null) return null;
  if (publicLat[1] == null || publicLng[1] == null) {
    return { code: 'INVALID_PUBLIC_LOCATION', path };
  }
  return coordinateIssue(publicLat[1], 'lat', `${path}.${publicLat[0]}`)
    ?? coordinateIssue(publicLng[1], 'lng', `${path}.${publicLng[0]}`);
};

/**
 * Defense in depth for the public event boundary. Client-side redaction is a
 * convenience; this scan is the authority that prevents raw device evidence
 * and exact personal coordinates from entering the shared event log.
 */
export function inspectPublicPayload(payload: Record<string, unknown>): PayloadSafetyIssue | null {
  if (Buffer.byteLength(JSON.stringify(payload), 'utf8') > 64 * 1024) {
    return { code: 'PAYLOAD_TOO_LARGE', path: '$' };
  }

  const visit = (value: unknown, path: string, key?: string): PayloadSafetyIssue | null => {
    const normalized = key ? normalizedKey(key) : undefined;
    if (normalized && FORBIDDEN_KEYS.has(normalized)) {
      return { code: 'FORBIDDEN_FIELD', path };
    }
    if (
      normalized?.endsWith('precision')
      && typeof value === 'string'
      && value.trim().toLowerCase() === 'exact'
    ) {
      return { code: 'EXACT_LOCATION_FORBIDDEN', path };
    }
    if (typeof value === 'string') {
      if (containsPersonalContact(value)) {
        return { code: 'PERSONAL_CONTACT_FORBIDDEN', path };
      }
      if (LOCAL_MEDIA_PATTERN.test(value) || INLINE_MEDIA_PATTERN.test(value)) {
        return { code: 'LOCAL_MEDIA_FORBIDDEN', path };
      }
    }
    if (Array.isArray(value)) {
      for (let index = 0; index < value.length; index += 1) {
        const issue = visit(value[index], `${path}[${index}]`);
        if (issue) return issue;
      }
      return null;
    }
    if (value && typeof value === 'object') {
      const record = value as Record<string, unknown>;
      const locationIssue = publicPointIssue(record, path);
      if (locationIssue) return locationIssue;
      for (const [childKey, childValue] of Object.entries(record)) {
        const issue = visit(childValue, `${path}.${childKey}`, childKey);
        if (issue) return issue;
      }
    }
    return null;
  };

  return visit(payload, '$');
}

/** JSON estable para hashes de idempotencia reproducibles. */
export function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, child]) => `${JSON.stringify(key)}:${canonicalJson(child)}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}
