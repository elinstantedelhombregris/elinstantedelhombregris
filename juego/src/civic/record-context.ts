import { and, eq } from 'drizzle-orm';

import { db, type DBExecutor } from '@/db/client';
import { civicRecordContexts } from '@/db/schema';
import type { CivicRecordContextRow } from '@/db/schema';
import { ahoraISO, nuevoId } from '@/db/repos';

import {
  prepareRecordLocation,
  validGeoPoint,
} from './location-policy';
import type {
  AttributionMode,
  CivicContextEntity,
  CivicRecordContextDraft,
  CivicRecordContextInput,
  CivicSensitivity,
  LocationPrecision,
} from './types';

const finite = (value: number | null | undefined): value is number =>
  typeof value === 'number' && Number.isFinite(value);

export { validGeoPoint } from './location-policy';

const cleanName = (value?: string | null): string | null => value?.trim().slice(0, 80) || null;

export const sharedPrecisionLabel = (precision: LocationPrecision): string => {
  if (precision === 'exact') return 'punto exacto';
  if (precision === '100m') return 'radio de 100 m';
  if (precision === '500m') return 'radio de 500 m';
  if (precision === 'neighborhood') return 'escala de barrio';
  return 'escala de ciudad';
};

export const defaultRecordContextDraft = (input: {
  sensitivity?: CivicSensitivity;
  precision?: Exclude<LocationPrecision, 'exact'>;
  audience?: CivicRecordContextDraft['audience'];
} = {}): CivicRecordContextDraft => {
  return {
    point: null,
    locationSource: 'none',
    horizontalAccuracyM: null,
    capturedAt: null,
    sharedPrecision: input.precision ?? '500m',
    locationLabel: '',
    audience: input.audience ?? 'collective',
    attributionMode: 'anonymous',
    attributionName: '',
    sensitivity: input.sensitivity ?? 'moderate',
  };
};

export const recordContextDraftFor = (
  entityType: CivicContextEntity,
  entityId: string,
  fallback: Partial<CivicRecordContextDraft> = {},
): CivicRecordContextDraft => {
  const context = recordContextFor(entityType, entityId);
  if (!context) return { ...defaultRecordContextDraft(), ...fallback };
  const precisePoint = context.exactLat == null || context.exactLng == null
    ? null
    : { lat: context.exactLat, lng: context.exactLng };
  const publicPoint = context.publicLat == null || context.publicLng == null
    ? null
    : { lat: context.publicLat, lng: context.publicLng };
  return {
    point: precisePoint ?? publicPoint,
    locationSource: precisePoint ? context.locationSource : publicPoint ? 'imported_public' : 'none',
    horizontalAccuracyM: context.horizontalAccuracyM,
    capturedAt: context.capturedAt,
    sharedPrecision: context.sharedPrecision === 'exact' ? '100m' : context.sharedPrecision,
    locationLabel: context.locationLabel ?? '',
    audience: context.audience,
    attributionMode: context.attributionMode,
    attributionName: context.attributionName ?? '',
    sensitivity: context.sensitivity,
  };
};

export const saveRecordContext = (
  entityType: CivicContextEntity,
  entityId: string,
  input: CivicRecordContextInput,
  database: DBExecutor = db,
): CivicRecordContextRow => {
  const now = ahoraISO();
  const audience = input.audience ?? 'private';
  const prepared = prepareRecordLocation({
    point: input.point,
    precision: input.sharedPrecision,
    audience,
    locationLabel: input.locationLabel,
  });
  const { exact, sharedPrecision: precision, locationLabel } = prepared;
  const projected = input.publicPointOverride === undefined
    ? prepared.publicPoint
    : validGeoPoint(input.publicPointOverride);
  const requestedMode = input.attributionMode ?? 'anonymous';
  const name = cleanName(input.attributionName);
  const attributionMode: AttributionMode = requestedMode === 'anonymous' || !name
    ? 'anonymous'
    : requestedMode;
  const accuracy = finite(input.horizontalAccuracyM) && input.horizontalAccuracyM! >= 0
    ? Math.min(100_000, input.horizontalAccuracyM!)
    : null;
  const current = recordContextFor(entityType, entityId, database);
  const row: CivicRecordContextRow = {
    id: current?.id ?? nuevoId(),
    entityType,
    entityId,
    locationRole: input.locationRole ?? 'subject',
    locationSource: exact ? (input.locationSource ?? 'manual') : (input.locationSource ?? 'none'),
    exactLat: exact?.lat ?? null,
    exactLng: exact?.lng ?? null,
    horizontalAccuracyM: accuracy,
    capturedAt: exact ? (input.capturedAt ?? now) : null,
    publicLat: projected?.lat ?? null,
    publicLng: projected?.lng ?? null,
    sharedPrecision: precision,
    locationLabel,
    audience,
    attributionMode,
    attributionName: attributionMode === 'anonymous' ? null : name,
    sensitivity: input.sensitivity ?? 'moderate',
    // Consent is never inferred from the presence of data. Callers that are
    // actually publishing must provide the explicit decision made in the UI.
    locationConsent: input.locationConsent ?? false,
    attributionConsent: input.attributionConsent ?? false,
    confirmedAt: input.confirmedAt ?? now,
    createdAt: current?.createdAt ?? now,
    updatedAt: now,
  };
  database.insert(civicRecordContexts).values(row).onConflictDoUpdate({
    target: [civicRecordContexts.entityType, civicRecordContexts.entityId],
    set: row,
  }).run();
  return recordContextFor(entityType, entityId, database) ?? row;
};

export const recordContextFor = (
  entityType: CivicContextEntity,
  entityId: string,
  database: DBExecutor = db,
): CivicRecordContextRow | null => database.select().from(civicRecordContexts).where(and(
  eq(civicRecordContexts.entityType, entityType),
  eq(civicRecordContexts.entityId, entityId),
)).get() ?? null;

export const publicContextFields = (context: CivicRecordContextRow | null): Record<string, unknown> => {
  if (!context) return {};
  const locationAllowed = context.audience === 'collective' && context.locationConsent;
  const attributionAllowed = context.audience === 'collective' && context.attributionConsent;
  return {
    locationRole: locationAllowed ? context.locationRole : undefined,
    locationSource: locationAllowed
      ? (context.locationSource === 'imported_public' ? 'map_pin' : context.locationSource)
      : undefined,
    horizontalAccuracyM: !locationAllowed || context.horizontalAccuracyM == null
      ? null
      : Math.round(context.horizontalAccuracyM),
    audience: context.audience,
    attributionMode: attributionAllowed ? context.attributionMode : 'anonymous',
    attributionName: attributionAllowed ? context.attributionName : null,
  };
};

export const canDiscloseRecordLocation = (context: CivicRecordContextRow | null): boolean =>
  context?.audience === 'collective' && context.locationConsent;

export const setRecordContextAudience = (
  entityType: CivicContextEntity,
  entityId: string,
  audience: CivicRecordContextRow['audience'],
  database: DBExecutor = db,
): CivicRecordContextRow | null => {
  const current = recordContextFor(entityType, entityId, database);
  if (!current) return null;
  const precisePoint = current.exactLat == null || current.exactLng == null
    ? null
    : { lat: current.exactLat, lng: current.exactLng };
  return saveRecordContext(entityType, entityId, {
    point: precisePoint,
    // Al pasar de privado exacto a colectivo hay que volver a proyectar desde
    // el punto preciso. Sólo una proyección importada, sin exacto local, puede
    // conservar el punto público que ya redujo el servidor.
    publicPointOverride: precisePoint
      ? undefined
      : current.publicLat == null || current.publicLng == null
        ? null
        : { lat: current.publicLat, lng: current.publicLng },
    locationRole: current.locationRole,
    locationSource: current.locationSource,
    horizontalAccuracyM: current.horizontalAccuracyM,
    capturedAt: current.capturedAt,
    sharedPrecision: current.sharedPrecision,
    locationLabel: current.locationLabel,
    audience,
    attributionMode: current.attributionMode,
    attributionName: current.attributionName,
    sensitivity: current.sensitivity,
    locationConsent: audience === 'collective' && current.locationConsent,
    attributionConsent: audience === 'collective' && current.attributionConsent,
    confirmedAt: current.confirmedAt,
  }, database);
};

export const contextLocationSummary = (context: CivicRecordContextRow | null): string => {
  if (context?.publicLat == null || context.publicLng == null) return 'Sin lugar confirmado';
  const label = context.locationLabel ?? 'Punto sin nombre';
  const accuracy = context.horizontalAccuracyM == null ? '' : ` · GPS ±${Math.round(context.horizontalAccuracyM)} m`;
  return `${label} · ${sharedPrecisionLabel(context.sharedPrecision)}${accuracy}`;
};

export const contextAttributionSummary = (context: CivicRecordContextRow | null): string => {
  if (
    !context
    || context.audience !== 'collective'
    || !context.attributionConsent
    || context.attributionMode === 'anonymous'
    || !context.attributionName
  ) {
    return 'Sin firma visible · responsable interno seudónimo';
  }
  const kind = context.attributionMode === 'named' ? 'Nombre declarado' : 'Alias declarado';
  return `${context.attributionName} · ${kind}`;
};
