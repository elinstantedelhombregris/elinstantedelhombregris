/**
 * Side-effect-only module that loads env vars from `v2/.env` before any
 * other module reads `process.env`. Import this FIRST in entry points
 * (and only there) — never as a side effect of an importable module.
 *
 * In production, where there's no `.env` file, dotenv silently no-ops
 * and we rely on Vercel / the host's secret store.
 */
import { config } from 'dotenv';

config({ path: new URL('../../../.env', import.meta.url).pathname });
