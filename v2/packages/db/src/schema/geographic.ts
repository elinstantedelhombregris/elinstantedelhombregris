/**
 * El territorio.
 *
 * Hasta la migración `0013` esta tabla tenía un solo escalón vivo —las 24
 * provincias— y `province_id` era un `serial`: una secuencia propia le ponía a
 * cada fila un número que no apuntaba a ninguna provincia. Nadie lo notó porque
 * las provincias son las únicas filas que hay. Desde `0013` la tabla es el árbol
 * entero del Estado —provincia, departamento, municipio, localidad censal,
 * asentamiento— espejado de georef, y `province_id` es una clave foránea contra
 * esta misma tabla.
 *
 * Una provincia se pertenece a sí misma a propósito (`province_id = id`): así
 * `where province_id = 6` devuelve la provincia Y todo lo que cuelga de ella, en
 * vez de obligar a escribir `where id = 6 or province_id = 6` en cada agregado
 * del sistema.
 *
 * `province_id` quedó `NOT NULL` y SIN default, así que todo INSERT tiene que
 * traer el valor. Una provincia es su propio padre: hay que reservarle el id con
 * `nextval` antes de insertarla (ver `scripts/seed-provinces.ts`). Sin eso,
 * sembrar una base vacía muere en la primera fila.
 *
 * El nombre dejó de ser identidad. Con 4.027 localidades censales el país tiene
 * decenas de «San Martín» y de «25 de Mayo», así que el único unique que queda
 * es el del id del Estado. La búsqueda por nombre va por `name_norm`, que
 * escribe el seed con la misma función con la que después se normaliza la
 * consulta: si fueran dos funciones, la diferencia se vería como resultados que
 * faltan y nadie sabría por qué.
 *
 * Normalización de provincias: los datasets del Estado dicen «Ciudad Autónoma de
 * Buenos Aires» y la gente escribe «Ciudad de Buenos Aires». El normalizador de
 * CABA en `apps/api/src/features/geographic` mapea la entrada a la forma
 * canónica antes de buscar.
 */
import { sql } from 'drizzle-orm';
import {
  type AnyPgColumn,
  check,
  decimal,
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const geographicLocations = pgTable(
  'geographic_locations',
  {
    id: serial('id').primaryKey(),

    /**
     * 'province' | 'department' | 'municipality' | 'locality' | 'settlement'.
     * Cerrado por CHECK desde `0013`. `city` no está: nunca hubo una sola fila
     * con ese valor, y el término del Estado para ese escalón es `locality`.
     */
    level: text('level').notNull(),

    /** El nombre tal como lo publica el Estado ("Zapala", "25 de Mayo"). */
    name: text('name').notNull(),

    /** ISO 3166-2 cuando aplica (AR-B, AR-X, AR-C…). Solo lo tienen las provincias. */
    isoCode: text('iso_code'),

    /**
     * La provincia a la que pertenece. Una provincia apunta a sí misma. No hay
     * unidad territorial argentina que no pertenezca a una provincia: por eso
     * es NOT NULL, y ahora además con clave foránea, que es lo que nunca tuvo.
     */
    provinceId: integer('province_id')
      .notNull()
      .references((): AnyPgColumn => geographicLocations.id),

    /**
     * El padre en el ÁRBOL. Vale distinto en cada nivel y por eso la tabla de
     * abajo no es opcional: provincia NULL —es la raíz, y es el único nivel
     * donde NULL significa eso—, departamento y municipio cuelgan de la
     * provincia, localidad del departamento, asentamiento de su localidad
     * censal o del departamento si BAHRA no la trae.
     */
    parentId: integer('parent_id').references((): AnyPgColumn => geographicLocations.id),

    /** El departamento ancestro, desnormalizado para no encadenar joins. */
    departmentId: integer('department_id').references((): AnyPgColumn => geographicLocations.id),

    /**
     * Pertenencia CRUZADA, no escalón del árbol: en Buenos Aires el partido es
     * departamento y municipio a la vez, y en Córdoba los municipios cruzan
     * límites departamentales. NULL significa «el Estado no la lista dentro de
     * ningún municipio» — un hecho sobre el país, no un dato faltante.
     */
    municipalityId: integer('municipality_id').references((): AnyPgColumn => geographicLocations.id),

    /**
     * El id del Estado (georef). UNIQUE y no clave primaria: la identidad
     * interna no se le presta a una fuente externa. Entra nullable porque las
     * 24 filas vivas todavía no lo tienen; se hace NOT NULL después del seed.
     */
    georefId: text('georef_id'),

    /** Normalizado por el mismo normalizador con el que se consulta. Lo escribe el seed. */
    nameNorm: text('name_norm'),

    /** WGS84. Nullable: los escalones de abajo todavía no traen centroide. */
    latitude: decimal('latitude', { precision: 9, scale: 6 }),
    longitude: decimal('longitude', { precision: 9, scale: 6 }),

    /**
     * Cuándo el Estado dejó de listarla. NULL = vigente. Nunca se borra una
     * fila: puede haber señales apuntando, y que el Estado deje de listar un
     * paraje no lo hace desaparecer del mapa.
     */
    vigenteHasta: timestamp('vigente_hasta', { withTimezone: true }),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    /** El id del Estado es la única clave natural que sobrevive a la escala. */
    uniqueIndex('geographic_locations_georef_unique').on(t.georefId),
    index('geographic_locations_province_idx').on(t.provinceId),
    index('geographic_locations_parent_idx').on(t.parentId),
    index('geographic_locations_municipality_idx').on(t.municipalityId),
    index('geographic_locations_level_norm_idx').on(t.level, t.nameNorm),
    /**
     * En trece migraciones no hubo un solo CHECK. Acá empieza: el vocabulario
     * de niveles es éste y estos cinco valores son los únicos que existen.
     */
    check(
      'geographic_locations_level_chk',
      sql`${t.level} in ('province','department','municipality','locality','settlement')`,
    ),
  ],
);

export type GeographicLocation = typeof geographicLocations.$inferSelect;
export type NewGeographicLocation = typeof geographicLocations.$inferInsert;
