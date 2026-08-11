/**
 * La contabilidad del seed del callejero.
 *
 * Dos tablas que no guardan territorio: guardan qué se trajo, de dónde y hasta
 * dónde se llegó. Existen porque bajar 326.832 calles son 349 requests
 * serializadas contra una API que corta a la tercera llamada concurrente, y una
 * corrida que se muere a la mitad tiene que costar una página y no una corrida.
 *
 * Y porque una siembra sin registro no se puede auditar: «completa» acá no
 * significa «el script terminó», significa que cada partición cerró Y que las
 * filas escritas coinciden con el total que declaró la propia fuente.
 */
import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  integer,
  json,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const geoSeedProgreso = pgTable(
  'geo_seed_progreso',
  {
    corrida: text('corrida').notNull(),

    /**
     * 'provincias' | 'departamentos' | 'municipios' | 'localidades_censales'
     * | 'asentamientos' | 'calles'.
     */
    recurso: text('recurso').notNull(),

    /**
     * Id del departamento (o de la provincia) que delimita la partición; '00'
     * para los recursos que no se parten. Las calles se parten por
     * departamento —529 particiones— porque la API topea `inicio` en 10.000 y
     * `max` en 5.000: 15.000 filas por combinación de filtros, y una provincia
     * grande no entra.
     */
    particion: text('particion').notNull(),

    /** Lo que dijo la API en `total`. Es contra esto que cierra la auditoría. */
    totalDeclarado: integer('total_declarado'),
    filasEscritas: integer('filas_escritas').notNull().default(0),
    offsetSiguiente: integer('offset_siguiente').notNull().default(0),

    /** 'pendiente' | 'en_curso' | 'completa' | 'fallida'. */
    estado: text('estado').notNull(),

    /** sha256 del payload normalizado de la partición: el insumo del diff. */
    hashFuente: text('hash_fuente'),

    actualizadoEn: timestamp('actualizado_en', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    /**
     * La corrida va DENTRO de la clave: si no, una segunda siembra pisa el
     * registro de la primera con su `hash_fuente`, que es justo lo que hace
     * falta para saber qué cambió.
     */
    primaryKey({ columns: [t.corrida, t.recurso, t.particion] }),
    check('geo_seed_estado_chk', sql`${t.estado} in ('pendiente','en_curso','completa','fallida')`),
  ],
);

/**
 * La versión del catálogo: lo que citan `/api/v1/geo/version` y el volcado
 * público, para que dos personas que descargan el mismo día sepan que están
 * mirando el mismo callejero.
 *
 * La forma de `totales` y `cobertura` la fija el seed (Task 5 del plan de la
 * tierra): acá se declaran como json y no se les inventa un tipo que después
 * habría que romper.
 */
export const geoCatalogoVersion = pgTable(
  'geo_catalogo_version',
  {
    corrida: text('corrida').primaryKey(),
    fuente: text('fuente').notNull(),
    fechaDeCorte: timestamp('fecha_de_corte', { withTimezone: true }).notNull(),
    /** Por recurso. */
    totales: json('totales').notNull(),
    /** Rango de altura por provincia, y cuántas calles sin nombre. */
    cobertura: json('cobertura').notNull(),
    /**
     * La corrida nueva se marca vigente al final, en la misma transacción que
     * cierra la última partición: hasta que termine, los endpoints siguen
     * sirviendo el catálogo anterior.
     */
    vigente: boolean('vigente').notNull().default(false),
  },
  (t) => [
    /**
     * Una sola fila vigente, y hecho cumplir por el motor: dos vigentes harían
     * que `/version` y el volcado citaran versiones distintas del mismo
     * catálogo, que es exactamente lo que `corrida` existe para impedir.
     */
    uniqueIndex('geo_catalogo_version_vigente_unique')
      .on(t.vigente)
      .where(sql`${t.vigente}`),
  ],
);

export type GeoSeedProgreso = typeof geoSeedProgreso.$inferSelect;
export type NewGeoSeedProgreso = typeof geoSeedProgreso.$inferInsert;
export type GeoCatalogoVersion = typeof geoCatalogoVersion.$inferSelect;
export type NewGeoCatalogoVersion = typeof geoCatalogoVersion.$inferInsert;
