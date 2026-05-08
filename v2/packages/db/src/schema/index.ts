/**
 * Schema barrel.
 *
 * Adding a new domain: create `domain.ts`, define tables there, then
 * re-export from this file. Drizzle's relational query API picks up
 * everything exported from the schema module passed to `drizzle()`.
 *
 * Also: add the file's path to `drizzle.config.ts` `schema` array.
 */
export * from './users.js';
export * from './auth.js';
