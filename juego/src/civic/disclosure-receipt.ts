import type {
  AttributionMode,
  CivicAudience,
  CivicDisclosureEntity,
  LocationPrecision,
} from './types';

export const CURRENT_DISCLOSURE_POLICY_VERSION = 1;

export const DISCLOSURE_PURPOSE: Record<CivicDisclosureEntity, string> = {
  observation: 'Publicar una observación para conocimiento y verificación territorial.',
  need: 'Publicar una necesidad para encontrar recursos compatibles y coordinar apoyo.',
  resource: 'Publicar un recurso para encontrar necesidades compatibles y coordinar apoyo.',
};

const collectFieldPaths = (value: unknown, path: string, output: Set<string>): void => {
  if (value == null) return;
  if (Array.isArray(value)) {
    if (value.length === 0) {
      if (path) output.add(path);
      return;
    }
    value.forEach((item) => collectFieldPaths(item, `${path}[]`, output));
    return;
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, child]) => child != null);
    if (entries.length === 0) {
      if (path) output.add(path);
      return;
    }
    entries.forEach(([key, child]) => collectFieldPaths(child, path ? `${path}.${key}` : key, output));
    return;
  }
  if (path) output.add(path);
};

/** Rutas hoja exactas que efectivamente llevan un valor en el payload. */
export const disclosedFieldPaths = (payload: Record<string, unknown>): string[] => {
  const output = new Set<string>();
  collectFieldPaths(payload, '', output);
  return [...output].sort((left, right) => left.localeCompare(right));
};

export const parseAuthorizedFields = (value: string): string[] => {
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return [...new Set(parsed.filter((item): item is string => typeof item === 'string' && item.length > 0))]
      .sort((left, right) => left.localeCompare(right));
  } catch {
    return [];
  }
};

const readableField = (path: string): string => {
  if (path === 'id') return 'identificador del registro';
  if (path === 'title') return 'título';
  if (path === 'summary' || path === 'description') return 'descripción';
  if (path === 'category') return 'categoría';
  if (path.startsWith('data')) return 'datos categóricos';
  if (path.startsWith('evidence')) return 'metadatos de evidencia';
  if (path === 'locationLabel') return 'nombre del lugar';
  if (path.startsWith('location.') || path === 'publicLat' || path === 'publicLng') return 'ubicación reducida';
  if (path === 'locationPrecision' || path === 'publicPrecision') return 'precisión pública';
  if (path === 'locationRole' || path === 'locationSource' || path === 'horizontalAccuracyM') return 'procedencia del lugar';
  if (path === 'attributionMode' || path === 'attributionName') return 'firma visible';
  if (path === 'audience') return 'audiencia';
  if (path === 'quantity' || path === 'unit') return 'cantidad';
  if (path === 'urgency') return 'urgencia';
  if (path === 'availabilityJson' || path === 'radiusKm') return 'disponibilidad';
  if (path === 'observedAt' || path === 'createdAt' || path === 'updatedAt' || path === 'expiresAt') return 'fechas';
  if (path === 'territoryId') return 'territorio';
  if (path === 'campaignKey' || path === 'campaignVersion') return 'campaña';
  if (path === 'status' || path === 'confidence') return 'estado y confianza';
  if (path === 'observationId') return 'observación vinculada';
  if (path === 'creatorKey') return 'responsable técnico seudónimo';
  return path;
};

/** Etiquetas humanas, agrupadas sin ocultar el detalle técnico del JSON exportable. */
export const readableAuthorizedFields = (paths: string[]): string[] => {
  const output: string[] = [];
  paths.forEach((path) => {
    const label = readableField(path);
    if (!output.includes(label)) output.push(label);
  });
  return output;
};

export interface DisclosureReceiptSnapshot {
  id: string;
  disclosureKey: string;
  kind: 'disclosure' | 'revocation';
  entityType: CivicDisclosureEntity;
  entityId: string;
  revokesReceiptId: string | null;
  audience: CivicAudience;
  authorizedFieldsJson: string;
  sharedPrecision: LocationPrecision;
  attributionMode: AttributionMode;
  attributionName: string | null;
  purpose: string;
  policyVersion: number;
  recordedAt: string;
}

export const buildRevocationReceipt = (
  source: DisclosureReceiptSnapshot,
  input: {
    id: string;
    disclosureKey: string;
    purpose: string;
    policyVersion?: number;
    recordedAt: string;
  },
): DisclosureReceiptSnapshot => {
  if (source.kind !== 'disclosure') throw new Error('revocation_requires_disclosure_receipt');
  return {
    ...source,
    id: input.id,
    disclosureKey: input.disclosureKey,
    kind: 'revocation',
    revokesReceiptId: source.id,
    purpose: input.purpose.trim().slice(0, 500) || 'Revocar la divulgación registrada.',
    policyVersion: Math.max(1, Math.round(input.policyVersion ?? CURRENT_DISCLOSURE_POLICY_VERSION)),
    recordedAt: input.recordedAt,
  };
};
