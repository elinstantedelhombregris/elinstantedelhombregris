/**
 * Cron de rankings (ADR 0008 D3). El horario está en `v2/vercel.json`.
 *
 * Stub commiteado, igual que `api/index.mjs`: reexporta el bundle que genera
 * `pnpm api:bundle`. La guardia de `CRON_SECRET` vive en el handler.
 */
export { default } from '../../apps/api/dist-bundle/cron-rankings.mjs';
