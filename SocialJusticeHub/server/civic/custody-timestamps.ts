import { CivicApiError } from './service';

/**
 * PostgreSQL puede devolver `timestamptz` como `YYYY-MM-DD HH:mm:ss.ffffff+00`.
 * Los contratos cívicos exponen siempre ISO 8601 UTC, sin cambiar el valor
 * almacenado. Una fecha interna inválida falla cerrada en lugar de filtrarse al
 * cliente o producir un `Invalid Date` ambiguo.
 */
export const custodyTimestampToIsoUtc = (value: unknown, path: string): string => {
  if (typeof value !== 'string') {
    throw new CivicApiError(
      500,
      'CUSTODY_TIMESTAMP_INVALID',
      'Una fecha interna de custodia no es válida.',
      path,
    );
  }
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) {
    throw new CivicApiError(
      500,
      'CUSTODY_TIMESTAMP_INVALID',
      'Una fecha interna de custodia no es válida.',
      path,
    );
  }
  return new Date(timestamp).toISOString();
};
