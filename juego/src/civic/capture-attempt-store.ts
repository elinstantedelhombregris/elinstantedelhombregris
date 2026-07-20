import { getSetting, setSetting } from '@/db/repos';

import type { CivicRecordContextDraft, GeoPoint } from './types';

const VERSION = 1 as const;
const keyFor = (expeditionId: string): string => `civic.capture-attempt.v1:${expeditionId}`;

export interface StoredCivicCaptureAttempt {
  version: typeof VERSION;
  id: string;
  expeditionId: string;
  expeditionSlug: string;
  data: Record<string, unknown>;
  summary: string | null;
  coords: GeoPoint | null;
  context: CivicRecordContextDraft;
  publish: boolean;
  photoUri: string | null;
  multiplier: 1 | 2;
  eventActive: boolean;
  confirmedAt: string;
}

const record = (value: unknown): value is Record<string, unknown> =>
  value != null && typeof value === 'object' && !Array.isArray(value);

const geoPoint = (value: unknown): value is GeoPoint => record(value)
  && typeof value.lat === 'number'
  && Number.isFinite(value.lat)
  && value.lat >= -90
  && value.lat <= 90
  && typeof value.lng === 'number'
  && Number.isFinite(value.lng)
  && value.lng >= -180
  && value.lng <= 180;

const validContext = (value: unknown): value is CivicRecordContextDraft => {
  if (!record(value)) return false;
  const sources = ['gps_current', 'map_pin', 'manual', 'inherited', 'imported_public', 'none'];
  const precisions = ['100m', '500m', 'neighborhood', 'city'];
  const audiences = ['private', 'collective', 'circle', 'counterpart'];
  const attributions = ['anonymous', 'alias', 'named'];
  const sensitivities = ['low', 'moderate', 'high'];
  return (value.point === null || geoPoint(value.point))
    && typeof value.locationSource === 'string' && sources.includes(value.locationSource)
    && (value.horizontalAccuracyM === null || (
      typeof value.horizontalAccuracyM === 'number'
      && Number.isFinite(value.horizontalAccuracyM)
      && value.horizontalAccuracyM >= 0
    ))
    && (value.capturedAt === null || typeof value.capturedAt === 'string')
    && typeof value.sharedPrecision === 'string' && precisions.includes(value.sharedPrecision)
    && typeof value.locationLabel === 'string'
    && typeof value.audience === 'string' && audiences.includes(value.audience)
    && typeof value.attributionMode === 'string' && attributions.includes(value.attributionMode)
    && typeof value.attributionName === 'string'
    && typeof value.sensitivity === 'string' && sensitivities.includes(value.sensitivity);
};

const isStoredAttempt = (value: unknown): value is StoredCivicCaptureAttempt => {
  if (!record(value) || value.version !== VERSION) return false;
  if (
    typeof value.id !== 'string'
    || typeof value.expeditionId !== 'string'
    || typeof value.expeditionSlug !== 'string'
    || !record(value.data)
    || !validContext(value.context)
    || typeof value.publish !== 'boolean'
    || (value.summary !== null && typeof value.summary !== 'string')
    || (value.photoUri !== null && typeof value.photoUri !== 'string')
    || (value.multiplier !== 1 && value.multiplier !== 2)
    || typeof value.eventActive !== 'boolean'
    || typeof value.confirmedAt !== 'string'
  ) return false;
  return value.coords === null || geoPoint(value.coords);
};

export const saveStoredCivicCaptureAttempt = (attempt: StoredCivicCaptureAttempt): void => {
  const snapshot: StoredCivicCaptureAttempt = {
    version: VERSION,
    id: attempt.id,
    expeditionId: attempt.expeditionId,
    expeditionSlug: attempt.expeditionSlug,
    data: attempt.data,
    summary: attempt.summary,
    coords: attempt.coords,
    context: attempt.context,
    publish: attempt.publish,
    photoUri: attempt.photoUri,
    multiplier: attempt.multiplier,
    eventActive: attempt.eventActive,
    confirmedAt: attempt.confirmedAt,
  };
  setSetting(keyFor(attempt.expeditionId), JSON.stringify(snapshot));
};

export const loadStoredCivicCaptureAttempt = (
  expeditionId: string,
  expeditionSlug: string,
): StoredCivicCaptureAttempt | null => {
  const raw = getSetting(keyFor(expeditionId));
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isStoredAttempt(parsed)) return null;
    if (parsed.expeditionId !== expeditionId || parsed.expeditionSlug !== expeditionSlug) return null;
    return parsed;
  } catch {
    return null;
  }
};

/** Vacía el valor para no retener el snapshot sensible una vez finalizado. */
export const clearStoredCivicCaptureAttempt = (expeditionId: string): void => {
  setSetting(keyFor(expeditionId), '');
};
