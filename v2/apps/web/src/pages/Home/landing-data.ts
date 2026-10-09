import { PLANES } from '~/pages/Planes/la-prueba-data';

/**
 * Datos de la landing «Papel y Tinta».
 *
 * Las voces, propuestas y señales de la home vienen de la API real
 * (ver `~/lib/queries/analytics`) — no hay datos de demostración acá.
 * Los planes son reales: salen de PLAN_REGISTRY (MDX), a través de
 * `Planes/la-prueba-data`, que es la única fuente de PLANES y de PLAN_COUNT.
 */

/** Los tres planes destacados del teaser. */
export const PLANES_TEASER = PLANES.slice(0, 3);
