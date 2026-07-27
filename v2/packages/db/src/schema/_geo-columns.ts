import { decimal, integer, text } from 'drizzle-orm/pg-core';

import { geographicLocations } from './geographic';

/**
 * Las columnas de ubicación que comparten todas las señales territoriales
 * (spec 2 §4.1 de `docs/specs/2026-07-26-mapa-2-la-verdad-de-la-ubicacion.md`).
 *
 * Se spread-ean dentro de la definición de cada tabla para que `dreams`,
 * `pulse_signals` y `proposals` no puedan divergir sobre qué significa
 * «dónde está esto».
 *
 * NO es un tipo de dato de Drizzle: es un objeto de constructores de columna.
 * Cada tabla lo expande y agrega sus propios índices.
 *
 * Los defaults dejan a toda fila existente exactamente donde está hoy —
 * precisión provincial, sin coordenada. Ninguna migración reinterpreta datos
 * viejos: una voz cargada antes de esto no se convierte en un punto que nadie
 * clavó.
 */
export const geoColumns = {
  /**
   * El punto PUBLICADO, es decir el resultado de aplicar `publishedPrecision`
   * y `publicLocation` de @v2/civic-core. El punto exacto crudo no vive de
   * este lado: cuando la precisión publicada es `exact` coinciden, y cuando no,
   * el crudo queda bajo custodia de quien lo capturó (spec 4).
   */
  lat: decimal('lat', { precision: 9, scale: 6 }),
  lng: decimal('lng', { precision: 9, scale: 6 }),

  /** `LocationPrecision` de @v2/civic-core. Ver `mapaPrecision` en el repo. */
  precision: text('precision').notNull().default('province'),

  /** `LocationRole` — el eje que gobierna la exactitud publicable (D7). */
  locationRole: text('location_role').notNull().default('subject'),

  /** `CivicSensitivity` — solo cambia algo cuando el rol es `subject`. */
  sensitivity: text('sensitivity').notNull().default('low'),
} as const;

/**
 * Localidad, cuando la señal se ubicó a ese nivel.
 *
 * La spec la llamaba `localidad_id`, pero `dreams` ya tenía `city_id`
 * apuntando a `geographic_locations` con `level: 'city'` — que es exactamente
 * lo mismo. Se reusa ese nombre en las tres tablas en vez de dejar dos
 * sinónimos conviviendo.
 */
export const cityColumn = {
  cityId: integer('city_id').references(() => geographicLocations.id, {
    onDelete: 'set null',
  }),
} as const;
