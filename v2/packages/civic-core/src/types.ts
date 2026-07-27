/**
 * El vocabulario de la ubicación, compartido entre la web (v2) y la app de
 * campo (`juego/`). Extraído de `juego/src/civic/types.ts` — ver la spec
 * paraguas `docs/specs/2026-07-26-el-mapa-instrumento-territorial.md` §3.
 *
 * Acá vive SOLO el subconjunto geográfico. Los tipos de sync, misiones,
 * custodia y feed siguen siendo de la app de campo: son su dominio, no el
 * contrato entre las dos aplicaciones.
 */

/**
 * Hasta dónde se localiza un registro.
 *
 * `'province'` es el agregado de v2: es donde vive el 100% de las voces web
 * cargadas antes de que existiera este paquete, y es el default del esquema.
 * El móvil nunca lo emite — su registro más grueso es `'city'`.
 */
export type LocationPrecision =
  | 'exact'
  | '100m'
  | '500m'
  | 'neighborhood'
  | 'city'
  | 'province';

/**
 * De qué habla la ubicación. Es el eje que gobierna la exactitud (§3.2 del
 * paraguas): no se engrosa por precisión pedida, se engrosa por rol.
 *
 * - `subject`       — el lugar del que trata el registro
 * - `capture`       — dónde estaba parado quien observó
 * - `service_area`  — zona donde un recurso funciona
 * - `meeting_point` — dónde se entrega, se retira, o se junta la gente
 */
export type LocationRole = 'subject' | 'capture' | 'service_area' | 'meeting_point';

/** Quién puede ver el registro. `private` nunca sale del dispositivo. */
export type CivicAudience = 'private' | 'collective' | 'circle' | 'counterpart';

/** Cuánto daño puede hacer que este registro se lea con precisión. */
export type CivicSensitivity = 'low' | 'moderate' | 'high';

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface PublicLocation {
  point: GeoPoint | null;
  precision: LocationPrecision;
  label: string | null;
}

/** Las precisiones de la más fina a la más gruesa. El orden es la escala. */
export const PRECISION_ORDER: readonly LocationPrecision[] = [
  'exact',
  '100m',
  '500m',
  'neighborhood',
  'city',
  'province',
];

/** `true` si `a` es al menos tan gruesa como `b`. */
export function isCoarserOrEqual(a: LocationPrecision, b: LocationPrecision): boolean {
  return PRECISION_ORDER.indexOf(a) >= PRECISION_ORDER.indexOf(b);
}
