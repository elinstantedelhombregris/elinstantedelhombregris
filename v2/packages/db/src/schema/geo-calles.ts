/**
 * El callejero del Estado, espejado.
 *
 * Son 326.832 calles medidas contra la fuente el 2026-08-11, y viven acá y no
 * del otro lado de la red porque georef no puede estar en el camino de una
 * captura: la Constitución del producto pide offline-first, y una llamada HTTP
 * en el medio de cargar una señal es exactamente lo contrario.
 *
 * Se separa de `geographic_locations` porque una calle no es una unidad
 * territorial: no tiene hijos, no tiene centroide y no agrega nada. Meterla en
 * el mismo árbol habría multiplicado por veinte una tabla que todo el sistema
 * recorre.
 *
 * **Una calle no produce un punto.** Georef no da geometría de calle, así que
 * acá no hay latitud ni longitud y no las va a haber: una dirección dice dónde
 * mirar, no dónde clavar el alfiler. Lo que sí guarda es el rango de altura, y
 * el rango es la parte incómoda: el 36,8% de las calles no tiene nombre y solo
 * el 24,2% trae rango, así que «la altura cae en rango» va a ser la minoría de
 * los casos y no el caso normal. Un booleano ahí mentiría.
 */
import { sql } from 'drizzle-orm';
import { check, index, integer, pgTable, serial, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

import { geographicLocations } from './geographic';

export const geoCalles = pgTable(
  'geo_calles',
  {
    id: serial('id').primaryKey(),

    /**
     * 13 dígitos con prefijo jerárquico. El CHECK es barato y caza un payload
     * que cambió de forma antes de que entren 300.000 filas raras.
     */
    georefId: text('georef_id').notNull(),

    /**
     * La jerarquía DESNORMALIZADA: 12 bytes por fila que ahorran dos joins en
     * cada agregado por territorio. La asimetría con las señales es deliberada
     * — esto es un catálogo de solo lectura que se re-siembra entero por
     * provincia; una señal se escribe de a una fila.
     */
    localidadId: integer('localidad_id')
      .notNull()
      .references(() => geographicLocations.id),
    departamentoId: integer('departamento_id')
      .notNull()
      .references(() => geographicLocations.id),
    provinciaId: integer('provincia_id')
      .notNull()
      .references(() => geographicLocations.id),

    /** Tal como lo da el Estado ("AV JOSE MARIA MORENO"): lo que se MUESTRA. */
    nombre: text('nombre').notNull(),

    /**
     * Normalizado y sin el prefijo de categoría ("JOSE MARIA MORENO"): lo que
     * se BUSCA. La consulta le saca el mismo prefijo al texto de la persona,
     * así que «AV JOSE» también encuentra.
     */
    nombreNorm: text('nombre_norm').notNull(),

    /**
     * 'nominada' | 'sin_nombre'. «CALLE S N» es una calle que el Estado
     * registró SIN nombre: un hecho, no un vacío. Son 120.115 filas. No entran
     * en el autocompletado —elegirla no querría decir nada— y sí en los
     * totales, para que la auditoría contra la fuente cierre.
     */
    nombreClase: text('nombre_clase').notNull(),

    /**
     * 'CALLE' | 'AV' | lo que el Estado use. Sin CHECK a propósito: el dominio
     * lo descubre el seed y lo publica en `geo_calle_categorias`, porque el
     * normalizador de consultas necesita esa lista COMO DATO.
     */
    categoria: text('categoria').notNull(),

    /**
     * El rango, con el 0 de georef ya traducido a NULL en el borde del seed.
     * Los cuatro estados de la altura se derivan de estos dos NULL, y la
     * derivación es total: ausente / parcialDesde / parcialHasta / completo.
     */
    alturaDesde: integer('altura_desde'),
    alturaHasta: integer('altura_hasta'),

    /** Cuándo el Estado dejó de listarla. NULL = vigente. Nunca se borra. */
    vigenteHasta: timestamp('vigente_hasta', { withTimezone: true }),
    actualizadoEn: timestamp('actualizado_en', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    /** Se crea CON la tabla, no al final: el ON CONFLICT del seed lo necesita. */
    uniqueIndex('geo_calles_georef_unique').on(t.georefId),

    /**
     * Los tres índices del autocompletado, uno por scope. Los tres son
     * compuestos (territorio, nombre) porque el match es SUBSTRING sobre la
     * rebanada del territorio: el btree acota la rebanada y el filtro corre
     * sobre las entradas del índice, sin tocar el heap hasta el LIMIT. El peor
     * caso verificado es Córdoba capital con 8.542 calles — 2,7 veces CABA.
     */
    index('geo_calles_localidad_nombre_idx').on(t.localidadId, t.nombreNorm),
    index('geo_calles_departamento_nombre_idx').on(t.departamentoId, t.nombreNorm),
    index('geo_calles_provincia_nombre_idx').on(t.provinciaId, t.nombreNorm),

    check('geo_calles_georef_chk', sql`${t.georefId} ~ '^[0-9]{13}$'`),
    check('geo_calles_clase_chk', sql`${t.nombreClase} in ('nominada','sin_nombre')`),
    /** EL constraint de esta tabla: el 0 que georef usa por «no sé» no entra nunca más. */
    check('geo_calles_desde_chk', sql`${t.alturaDesde} is null or ${t.alturaDesde} > 0`),
    check('geo_calles_hasta_chk', sql`${t.alturaHasta} is null or ${t.alturaHasta} > 0`),
    check(
      'geo_calles_rango_chk',
      sql`${t.alturaDesde} is null or ${t.alturaHasta} is null or ${t.alturaDesde} <= ${t.alturaHasta}`,
    ),
  ],
);

/**
 * El dominio de `categoria`, como dato y no como literal en el código.
 *
 * Diez filas o menos. Existe porque el normalizador DE CONSULTAS necesita saber
 * qué tokens iniciales son categoría para sacárselos al texto que escribe la
 * persona, y porque esa lista sale de la fuente y no de la cabeza de nadie.
 *
 * El seed no la lee, y no es un descuido: carga de a una provincia y la tabla se
 * llena a medida que avanza, así que las primeras provincias se normalizarían
 * contra una lista incompleta. Cada fila se normaliza con su propio campo
 * `categoria`, que viene en el payload.
 */
export const geoCalleCategorias = pgTable('geo_calle_categorias', {
  categoria: text('categoria').primaryKey(),
  cantidad: integer('cantidad').notNull(),
  /** La corrida del seed que la contó. */
  corrida: text('corrida').notNull(),
});

export type GeoCalle = typeof geoCalles.$inferSelect;
export type NewGeoCalle = typeof geoCalles.$inferInsert;
export type GeoCalleCategoria = typeof geoCalleCategorias.$inferSelect;
export type NewGeoCalleCategoria = typeof geoCalleCategorias.$inferInsert;
