export const CIVIC_PUBLIC_PERIOD_DAYS = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
} as const;

export type CivicPublicPeriod = keyof typeof CIVIC_PUBLIC_PERIOD_DAYS;

export const CIVIC_PUBLIC_MAX_EVENTS = 50_000;
export const CIVIC_PUBLIC_CACHE_TTL_MS = 60_000;

export function parseCivicPublicPeriod(value: unknown): CivicPublicPeriod {
  return typeof value === 'string' && value in CIVIC_PUBLIC_PERIOD_DAYS
    ? value as CivicPublicPeriod
    : '30d';
}

export function civicPublicSince(period: CivicPublicPeriod, now = Date.now()): string {
  return new Date(now - CIVIC_PUBLIC_PERIOD_DAYS[period] * 24 * 60 * 60_000).toISOString();
}

/** Public civic projections may be configured more conservatively, never below k=5. */
export function civicMinimumSourceContributors(configured: unknown = process.env.CIVIC_AGGREGATE_MIN_ACTORS): number {
  const value = Number(configured ?? 5);
  if (!Number.isFinite(value)) return 5;
  return Math.max(5, Math.min(20, Math.floor(value)));
}
