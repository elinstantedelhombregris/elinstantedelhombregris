/**
 * Drizzle client.
 *
 * - Pooled connection via @neondatabase/serverless for runtime app code.
 * - Unpooled connection (env DATABASE_URL_UNPOOLED) reserved for migrations
 *   and long-running scripts (see drizzle.config.ts).
 *
 * Construct exactly one instance per process: the pool is reused.
 */
import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

import * as schema from './schema/index.js';

neonConfig.fetchConnectionCache = true;

let cached: ReturnType<typeof createClient> | undefined;

function createClient(databaseUrl: string) {
  const sql = neon(databaseUrl);
  return drizzle(sql, { schema });
}

/**
 * Get (or lazily construct) the singleton Drizzle client.
 * Throws a clear error if DATABASE_URL is not set.
 */
export function getDb(): ReturnType<typeof createClient> {
  if (cached) return cached;

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is required to construct the Drizzle client');
  }

  cached = createClient(url);
  return cached;
}

/** Test-only: reset the cached client. Production code must not call this. */
export function resetDb(): void {
  cached = undefined;
}

export type Db = ReturnType<typeof getDb>;
