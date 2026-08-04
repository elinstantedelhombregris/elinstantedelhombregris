/**
 * Función de Vercel para todo `/api/*` (ADR 0008 D1, D2).
 *
 * Este archivo se commitea y no hace nada más que reexportar: así Vercel
 * siempre encuentra la función, y lo único generado es el bundle que importa
 * —`pnpm api:bundle`, dentro del `build`—.
 *
 * El bundle vive en `apps/api/` y no acá porque sus dependencias de npm quedan
 * externas y con pnpm sólo resuelven desde `apps/api/node_modules`. Ver la
 * cabecera de `scripts/build/bundle-api.ts`.
 */
export { default } from '../apps/api/dist-bundle/handler.mjs';
