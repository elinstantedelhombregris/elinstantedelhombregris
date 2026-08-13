/**
 * Cron del barrido de sesiones vencidas (ADR 0008 D3). El horario está en
 * `v2/vercel.json`.
 *
 * Stub commiteado, igual que `api/cron/rankings.mjs`: reexporta el bundle que
 * genera `pnpm api:bundle`. La guardia de `CRON_SECRET` vive en el handler.
 */
export { default } from '../../apps/api/dist-bundle/cron-sesiones.mjs';
