/**
 * Schema barrel.
 *
 * Adding a new domain: create `domain.ts`, define tables there, then
 * re-export from this file. Drizzle's relational query API picks up
 * everything exported from the schema module passed to `drizzle()`.
 */
export * from './users.js';
