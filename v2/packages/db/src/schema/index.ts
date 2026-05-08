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
export * from './notifications.js';
export * from './geographic.js';
export * from './community.js';
export * from './blog.js';
export * from './ensayos.js';
export * from './civic-assessment.js';
export * from './goals.js';
export * from './coaching.js';
export * from './resources.js';
export * from './dreams.js';
export * from './feedback.js';
export * from './courses.js';
export * from './iniciativas.js';
export * from './mandato.js';
export * from './pulso.js';
export * from './gamification.js';
export * from './life-areas.js';
