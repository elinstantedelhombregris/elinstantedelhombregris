import { decimal, integer, text } from 'drizzle-orm/pg-core';

import { geoCalles } from './geo-calles';
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

/**
 * La dirección normalizada de una señal (spec A §2.5 y §3.4).
 *
 * Se spread-ea en **`senales` y en ninguna otra tabla**, en la migración que
 * crea la tabla. Sigue siendo un objeto exportado aunque hoy tenga un solo
 * consumidor: es el vehículo de la partición «A define, B aplica», y por eso
 * NO se spread-ea en `dreams`, `pulse_signals` ni `proposals` — defender con
 * nueve CHECK tres tablas que dejan de recibir escrituras y están en cero era
 * escribir la defensa entera sobre el lado que se apaga.
 *
 * Regla que gobierna todo lo de acá: **lo que se guarda es lo PUBLICABLE**. Lo
 * que la política de §2.6 no deja publicar no se guarda, igual que el punto
 * crudo, y tampoco se marca como reservado —un estado que dijera «hay una
 * altura que no te muestro» filtraría que el registro es preciso y está
 * protegido—. Y lo hace cumplir la base, no la costumbre: los nueve CHECK de
 * `senales`.
 */
export const direccionColumns = {
  calleId: integer('calle_id').references(() => geoCalles.id),

  /** Siempre > 0. El 0 es el «no sé» de georef y acá no significa nada. */
  altura: integer('altura'),

  /**
   * La unión discriminada de A §2.5 —`sin_direccion` · `calle` ·
   * `altura_en_rango` · `altura_sin_rango` · `altura_fuera_de_rango` ·
   * `texto_libre`—, verificada por el CHECK `senales_direccion_chk`, que de paso
   * cierra el dominio: un valor desconocido no satisface ninguna rama. Por eso
   * no hay un CHECK de enum aparte. `sin_direccion` es el default: una señal sin
   * dirección nace válida.
   */
  direccionEstado: text('direccion_estado').notNull().default('sin_direccion'),

  /**
   * El texto presentable, compuesto AL ESCRIBIR —y después de degradar— y
   * guardado. No se compone al leer a propósito: el catálogo se re-siembra y una
   * calle puede cambiar de nombre, y el registro de una persona tiene que seguir
   * diciendo lo que decía. Tope 120, el mismo de `normalizedLocationLabel`, y
   * acá sí hecho cumplir por CHECK: esa función recorta la copia que viaja como
   * etiqueta, no la columna.
   */
  direccionTexto: text('direccion_texto'),

  /**
   * De dónde salió la jerarquía (A §2.7): `catalogo` · `punto` · `declarada` ·
   * `ninguna`. `punto` es exactamente el conjunto de filas cuya provincia sale
   * del polígono que D-011 puede estar atribuyendo mal: convierte esa deuda de
   * anécdota en consulta exacta.
   */
  ubicacionOrigen: text('ubicacion_origen').notNull().default('ninguna'),
} as const;
