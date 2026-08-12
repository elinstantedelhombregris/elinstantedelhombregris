/**
 * Lo que falta — el registro público del canal de escucha.
 *
 * Spec: `docs/specs/2026-08-12-lo-que-falta.md` §3.
 *
 * Una sola tabla para las dos cosas que le faltan a esto: la deuda que
 * encontró quien programa (`origen = 'adentro'`, importada de
 * `docs/DEUDAS.md`) y la idea que dejó quien usa (`origen = 'afuera'`,
 * entrada por el panel público). Son la misma clase de objeto y por eso
 * comparten ficha, estados y descarga; lo único que las separa es el prefijo
 * del id público, que hace que las dos numeraciones corran sin coordinarse.
 *
 * **Qué NO se guarda acá, y es deliberado:** ni IP, ni hash de IP, ni
 * user-agent, ni un solo dato de contacto. La `platform_feedback` que esta
 * tabla reemplaza guardaba `user_agent` crudo y ataba cada envío a `users.id`.
 * La lección que la ordena es la de `submittedAs` publicando el UUID del
 * teléfono como nombre de autor (spec `2026-08-11-d-el-registro-publico.md`
 * §1.6): lo que no se guarda no se filtra.
 *
 * El vocabulario y la máquina de estados viven en `@v2/civic-core`
 * (`faltas.ts`), no acá. Los CHECK de abajo son la segunda línea: afirman en
 * la base lo mismo que la función pura afirma antes de llegar.
 */
import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

/** Contexto de dónde se dejó la falta. Nunca lleva nada que identifique a nadie. */
export interface ContextoDeFalta {
  /** La ruta de la SPA desde la que se abrió el panel. */
  ruta?: string | undefined;
  /** Si vino del instrumento del mapa: el encuadre que se estaba mirando. */
  encuadre?: { oeste: number; sur: number; este: number; norte: number } | undefined;
  /** Si vino del instrumento del mapa: la capa activa. */
  capa?: string | undefined;
}

export const faltas = pgTable(
  'faltas',
  {
    id: serial('id').primaryKey(),

    /** `D-034` (adentro) | `I-007` (afuera). Es la identidad pública y la URL. */
    idPublico: text('id_publico').notNull(),
    origen: text('origen').notNull(),
    superficie: text('superficie').notNull(),

    titulo: text('titulo').notNull(),
    cuerpo: text('cuerpo').notNull(),
    contexto: jsonb('contexto').$type<ContextoDeFalta>(),

    /**
     * Sólo las de adentro. Nadie califica desde afuera la gravedad de lo suyo:
     * eso es un juicio, y el juicio es de quien sostiene el sistema.
     */
    severidad: text('severidad'),

    estado: text('estado').notNull().default('dicha'),
    /** Obligatoria para `no_va` y `bajada` — el CHECK de abajo la impone. */
    razon: text('razon'),
    /** El `D-0NN` de `docs/DEUDAS.md` cuando una idea de afuera se acepta. */
    anotadaComo: text('anotada_como'),
    /** Commit o entrada de Bitácora cuando se hizo. */
    cierreUrl: text('cierre_url'),

    /**
     * SHA-256 de la llave que se devolvió una sola vez al dejar la falta.
     * Nunca sale en una respuesta. Sirve para retirar lo propio y para
     * deduplicar firmas — no para identificar a nadie.
     */
    llaveHash: text('llave_hash'),

    /** Estaba en `docs/DEUDAS.md` y dejó de estar. No se borra: se marca. */
    huerfana: boolean('huerfana').notNull().default(false),

    /** Denormalizado; lo mantiene el POST de firma dentro de su transacción. */
    firmas: integer('firmas').notNull().default(0),

    creadaEn: timestamp('creada_en', { withTimezone: true }).notNull().defaultNow(),
    movidaEn: timestamp('movida_en', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('faltas_id_publico_unique').on(t.idPublico),
    /** El listado es cronológico descendente y sin ranking (§2.4). */
    index('faltas_creada_idx').on(t.creadaEn),
    index('faltas_estado_idx').on(t.estado),
    index('faltas_superficie_idx').on(t.superficie),

    check('faltas_origen_chk', sql`${t.origen} in ('adentro','afuera')`),
    check(
      'faltas_superficie_chk',
      sql`${t.superficie} in ('el-mapa','los-planes','la-biblioteca','los-entrenamientos','la-plataforma')`,
    ),
    check(
      'faltas_estado_chk',
      sql`${t.estado} in ('dicha','anotada','en_curso','hecha','no_va','bajada')`,
    ),
    /** La severidad existe sólo del lado de adentro, y sólo con los cuatro valores. */
    check(
      'faltas_severidad_chk',
      sql`${t.severidad} is null or (${t.origen} = 'adentro' and ${t.severidad} in ('bloqueante','alta','media','baja'))`,
    ),
    /**
     * EL constraint de esta tabla: cerrar sin hacer exige decir por qué. Es la
     * promesa entera del canal, afirmada donde no la puede saltear ningún
     * cliente futuro.
     */
    check(
      'faltas_razon_chk',
      sql`${t.estado} not in ('no_va','bajada') or (${t.razon} is not null and length(btrim(${t.razon})) > 0)`,
    ),
    /** El prefijo del id público concuerda con el origen, o no entra. */
    check(
      'faltas_id_publico_chk',
      sql`${t.idPublico} ~ (case when ${t.origen} = 'adentro' then '^D-[0-9]{3,6}$' else '^I-[0-9]{3,6}$' end)`,
    ),
  ],
);

/**
 * Una firma es «me pasa lo mismo». Una por llave por falta — el unique de
 * abajo es lo que lo hace cierto, no el contador de `faltas.firmas`, que es
 * una denormalización que se puede recomputar desde acá.
 *
 * No hay `user_id` y no lo va a haber: firmar no requiere cuenta, y atar la
 * firma a una cuenta convertiría el conteo en un padrón de quién apoya qué.
 */
export const faltasFirmas = pgTable(
  'faltas_firmas',
  {
    id: serial('id').primaryKey(),
    faltaId: integer('falta_id')
      .notNull()
      .references(() => faltas.id, { onDelete: 'cascade' }),
    llaveHash: text('llave_hash').notNull(),
    creadaEn: timestamp('creada_en', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('faltas_firmas_unique').on(t.faltaId, t.llaveHash)],
);

export type Falta = typeof faltas.$inferSelect;
export type NuevaFalta = typeof faltas.$inferInsert;
export type FirmaDeFalta = typeof faltasFirmas.$inferSelect;
