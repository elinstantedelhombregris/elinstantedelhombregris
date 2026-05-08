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
