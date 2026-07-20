export interface PendingOutboxLike {
  entityType: string;
  operation: string;
  payloadJson: string;
}

const REVOCABLE_ENTITY_TYPES = new Set(['observation', 'need', 'resource']);

/** Distingue una deuda de retiro remoto de otros reintentos de sincronización. */
export const isPendingNetworkRevocation = (row: PendingOutboxLike): boolean => {
  if (row.operation !== 'update' || !REVOCABLE_ENTITY_TYPES.has(row.entityType)) return false;
  try {
    const payload: unknown = JSON.parse(row.payloadJson);
    if (!payload || typeof payload !== 'object') return false;
    const revokedAt = (payload as { revokedAt?: unknown }).revokedAt;
    return typeof revokedAt === 'string' && revokedAt.trim().length > 0;
  } catch {
    return false;
  }
};

export const countPendingNetworkRevocations = (rows: readonly PendingOutboxLike[]): number =>
  rows.filter(isPendingNetworkRevocation).length;

const stringsFromEvidence = (value: unknown): string[] => {
  if (typeof value !== 'string') return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((item) => (
      item && typeof item === 'object' && typeof (item as { uri?: unknown }).uri === 'string'
        ? [(item as { uri: string }).uri]
        : []
    ));
  } catch {
    return [];
  }
};

/**
 * Extrae sólo archivos dentro del cache que controla la app. Nunca borra una
 * URI externa o elegida por la persona aunque aparezca en una fila importada.
 */
export const cachedEvidenceUrisFromExport = (
  exported: Record<string, unknown>,
  cacheUri: string,
): string[] => {
  const candidates: string[] = [];
  if (Array.isArray(exported.stars)) {
    for (const row of exported.stars) {
      if (row && typeof row === 'object' && typeof (row as { photoUri?: unknown }).photoUri === 'string') {
        candidates.push((row as { photoUri: string }).photoUri);
      }
    }
  }
  if (Array.isArray(exported.observations)) {
    for (const row of exported.observations) {
      if (row && typeof row === 'object') {
        candidates.push(...stringsFromEvidence((row as { evidenceJson?: unknown }).evidenceJson));
      }
    }
  }
  if (Array.isArray(exported.pvObras)) {
    for (const row of exported.pvObras) {
      if (row && typeof row === 'object' && typeof (row as { evidenciaUri?: unknown }).evidenciaUri === 'string') {
        candidates.push((row as { evidenciaUri: string }).evidenciaUri);
      }
    }
  }
  const prefix = cacheUri.endsWith('/') ? cacheUri : `${cacheUri}/`;
  return [...new Set(candidates.filter((uri) => uri.startsWith(prefix)))];
};
