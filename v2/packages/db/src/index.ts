/**
 * Public surface of @v2/db.
 *
 * Consumers import from this module rather than reaching into
 * `./schema` or `./repositories` directly. Future domains add their
 * exports here.
 */
export { getDb, resetDb } from './client.js';
export type { Db } from './client.js';

export * from './schema/index.js';
export * from './repositories/index.js';

// Re-export common drizzle helpers so consumers don't need to depend
// on `drizzle-orm` directly for the basics. Add operators here as the
// app needs them.
export { and, asc, desc, eq, gt, gte, ilike, inArray, isNull, lt, lte, or } from 'drizzle-orm';
