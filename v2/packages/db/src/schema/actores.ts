/**
 * El actor: quién habló, contado sin saber quién es.
 *
 * Spec: `docs/specs/2026-08-11-b-la-senal.md` §2.9, §2.10 y §3.2.
 * Plan: `docs/plans/2026-08-11-tierra-senal-corroboracion-registro.md`, Task 11.
 *
 * La `actor_key` es un secreto opaco **que emite el servidor**, nunca el
 * cliente, la primera vez que alguien aporta. No deriva nada del dispositivo:
 * ni user-agent, ni canvas, ni fuentes, ni IP. Es un identificador que el
 * sistema le **da** a la persona, no uno que le **saca**. La base guarda
 * `HMAC(ACTOR_PEPPER, actor_key)`, y señal y adhesión llevan el subrogado
 * `actores.id` — nunca el hash, nunca la clave.
 *
 * **Ninguna columna derivada del dispositivo, y eso es un contrato.** Ni
 * user-agent, ni idioma, ni zona horaria, ni IP en ninguna forma. La guarda de
 * privacidad falla el día que alguien agregue una.
 *
 * **El retiro es un `UPDATE`, no un `DELETE`.** Retirar pone `actor_hash` y
 * `secreto_hash` en NULL y escribe `retirado_en`. El subrogado queda, así que
 * las cuentas históricas por celda no se mueven; lo que desaparece es la
 * capacidad de volver de una `actor_key` a sus filas, incluso con el pepper en
 * la mano. Eso hace verdadera la palabra «revocable» de la regla 9 sin
 * reescribir el pasado. Un `DELETE` con cascade movería RETROACTIVAMENTE el
 * brillo de todas las celdas donde esa persona habló.
 */
import { sql } from 'drizzle-orm';
import {
  bigserial,
  check,
  customType,
  integer,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  unique,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

import { users } from './users';

/**
 * `bytea`, que drizzle-orm no trae de fábrica.
 *
 * Los hash se guardan crudos y no en hex ni en base64: la mitad de los bytes y,
 * sobre todo, ninguna tentación de compararlos como texto — dos codificaciones
 * del mismo hash son dos strings distintos y un `=` que falla en silencio.
 */
const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType: () => 'bytea',
});

export const actores = pgTable(
  'actores',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),

    /** `HMAC(ACTOR_PEPPER, actor_key)`. NULL = retirado. Nunca sale a una respuesta. */
    actorHash: bytea('actor_hash'),

    /**
     * Sólo para `campo`: HMAC del portador que la app guarda en SecureStore.
     * Lo EMITE el servidor; no se deriva de nada del dispositivo.
     */
    secretoHash: bytea('secreto_hash'),

    pepperVersion: smallint('pepper_version').notNull().default(1),

    /**
     * `web` | `campo`. Sirve para declarar cobertura y sesgo (regla 5), no para
     * distinguir derechos: un actor de campo y uno de web valen lo mismo.
     */
    origen: text('origen').notNull(),

    /**
     * Cuando alguien seudónimo se hace cuenta, se linkea acá. Es la única
     * migración de identidad que existe, y va en un solo sentido.
     */
    userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),

    creadoEn: timestamp('creado_en', { withTimezone: true }).notNull().defaultNow(),

    /** Lo que el detector de ráfagas de C necesita. */
    primerEventoEn: timestamp('primer_evento_en', { withTimezone: true }),

    retiradoEn: timestamp('retirado_en', { withTimezone: true }),
  },
  (t) => [
    unique('actores_actor_hash_unique').on(t.actorHash),

    /**
     * **La restricción que impide lavar actores.** Sin ella: adherir, borrar la
     * cookie, repetir 20 veces, loguearse y linkear los 20 → veinte filas sobre
     * la misma señal, las veinte contadas como «cuentas verificadas», o sea el
     * bucket de mayor calidad convertido en el más fácil de inflar. Con ella,
     * linkear un actor nuevo a una cuenta que ya tiene actor no crea un segundo
     * vínculo: **fusiona**.
     */
    uniqueIndex('actores_user_unico')
      .on(t.userId)
      .where(sql`user_id is not null`),

    check('actores_origen_chk', sql`${t.origen} in ('web','campo')`),

    /** Retirado y con hash, o vivo y sin hash, son los dos estados imposibles. */
    check('actores_retiro_chk', sql`(${t.retiradoEn} is null) = (${t.actorHash} is not null)`),
  ],
);

/**
 * El contador de altas de actor por bucket de red y por hora — el techo de 20.
 *
 * Es tabla y no memoria de proceso porque la API corre serverless (ADR 0008):
 * un `MemoryStore` se resetea en cada cold start y cuenta por instancia, o sea
 * que un techo de ventana larga en memoria es decorativo.
 *
 * **Sin clave el contador no se puede upsertear**: cada alta insertaría una fila
 * nueva y el `where creados >= 20` no encontraría nunca nada. El techo existiría
 * en prosa y no en la base. Por eso la PK compuesta es la mitad de la pieza.
 *
 * **`bucket` es `bytea` y no `text` a propósito:** es el mismo HMAC con pepper
 * que `actor_hash` —del prefijo de red, /32 en IPv4 y /64 en IPv6—, así que rota
 * con el pepper y no hay ninguna fila del esquema desde la que se pueda
 * reconstruir un prefijo. **No tiene ninguna referencia a `actor_id`**: no
 * existe consulta que vincule un actor con su origen de red.
 *
 * Las filas viejas las barre el cron. Sin barrido, esta tabla es un registro
 * perpetuo de desde qué redes se habló, que es lo que la regla 3 prohíbe.
 */
export const actoresPorOrigen = pgTable(
  'actores_por_origen',
  {
    /** Truncada a la hora, no `now()` crudo: la hora es el bucket temporal. */
    hora: timestamp('hora', { withTimezone: true }).notNull(),
    bucket: bytea('bucket').notNull(),
    creados: integer('creados').notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.hora, t.bucket], name: 'actores_por_origen_pk' })],
);

export type Actor = typeof actores.$inferSelect;
export type NewActor = typeof actores.$inferInsert;
export type ActoresPorOrigen = typeof actoresPorOrigen.$inferSelect;
