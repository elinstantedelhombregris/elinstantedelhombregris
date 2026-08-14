/**
 * El vocabulario de una señal, en la base: tipos, estados y temas.
 *
 * Spec: `docs/specs/2026-08-11-b-la-senal.md` §3.1.
 * Plan: `docs/plans/2026-08-11-tierra-senal-corroboracion-registro.md`, Task 11.
 *
 * ── Por qué son tablas y no CHECK ──────────────────────────────────────────
 *
 * `tipos_senal` y `estados_senal` existen para que `senales` les cuelgue **dos
 * claves foráneas compuestas** —`(tipo, clase)` y `(estado, clase)`—. Esa es la
 * regla 11 escrita en Postgres: un `sueño` no puede ser `hecho` y una
 * `propuesta` no puede estar `corroborada` porque **esos pares no existen en el
 * catálogo**, no porque el código se acuerde de mirarlos. Un CHECK de enum
 * sobre `estado` no diría lo mismo: diría qué estados hay, no qué estado va con
 * qué clase, y la combinación es justo lo que hay que prohibir.
 *
 * ── Estos archivos NO importan `@v2/civic-core`, y es a propósito ───────────
 *
 * El canon de los nueve tipos y las cuatro clases vive en
 * `packages/civic-core/src/senal/vocabulario.ts` y **no se copia acá como
 * import**: si el schema derivara del código TypeScript, la guarda de la Task 12
 * —que compara la tabla contra `TIPOS_SENAL` con una consulta real— compararía
 * una cosa contra sí misma y estaría siempre verde. Las filas se siembran a mano
 * dentro de la migración y el test `tests/senales-imposibles.test.ts` afirma que
 * el `.sql` y `civic-core` dicen lo mismo. Dos fuentes, una guarda: es la única
 * forma de que no deriven.
 *
 * El único CHECK que sí nombra las cuatro clases es el de la columna `clase` de
 * estas dos tablas, y es el piso: sin él, una fila de catálogo con una clase
 * inventada abriría la puerta que las FK compuestas cierran.
 */
import { sql } from 'drizzle-orm';
import { check, integer, pgTable, primaryKey, text, unique } from 'drizzle-orm/pg-core';

/** Las cuatro clases, para los dos CHECK de piso. El canon está en civic-core. */
const CLASES = sql`('hecho','deseo','acto','meta')`;

/**
 * Los nueve tipos con su clase. Nueve filas, sembradas en la migración.
 *
 * `orden` es el orden del panel y de la barra de composición, y es único: dos
 * tipos en la misma posición dejan el panel a merced del planner.
 */
export const tiposSenal = pgTable(
  'tipos_senal',
  {
    tipo: text('tipo').primaryKey(),
    clase: text('clase').notNull(),
    orden: integer('orden').notNull(),
  },
  (t) => [
    unique('tipos_senal_orden_unique').on(t.orden),
    /**
     * Existe SÓLO para colgarle la FK compuesta de `senales`: Postgres exige
     * un único sobre las columnas referenciadas, y la PK es `tipo` sola.
     */
    unique('tipos_senal_tipo_clase_unique').on(t.tipo, t.clase),
    check('tipos_senal_clase_chk', sql`${t.clase} in ${CLASES}`),
  ],
);

/**
 * Qué estado puede tener qué clase. **20 filas**: 6 de `hecho`, 7 de `acto`,
 * 3 de `deseo`, 4 de `meta`.
 *
 * `acto` corre la máquina completa igual que `hecho` —con `por_verificar` y
 * `corroborada`—: sin esos dos pares, la sentencia de confirmación de C no
 * inserta nunca, `desenlace` no sale jamás de `abierto`, y `acto_coherente`
 * pincha a todo compromiso para siempre. Un bloqueo total del único tipo de la
 * clase `acto`, y en silencio.
 *
 * `borrador` **no está**, y esa ausencia es la decisión: un borrador vive en el
 * dispositivo y nunca llega al servidor. Si el servidor lo tuviera, tendría
 * copia de lo que la persona todavía no decidió publicar — las reglas 3 y 12
 * rotas de un saque. `EstadoSenal` de civic-core sí lo incluye para que las dos
 * superficies usen la misma palabra; la columna acepta el subconjunto publicado
 * **por FK compuesta y no por default**.
 *
 * `orden` reinicia en 1 dentro de cada clase y sigue el ciclo de vida, no el
 * alfabeto. La guarda de la Task 12 lee `order by clase, orden`: sin un criterio
 * escrito, el primero que reordene una sub-unión de TypeScript la pone roja sin
 * haber roto nada.
 */
export const estadosSenal = pgTable(
  'estados_senal',
  {
    estado: text('estado').notNull(),
    clase: text('clase').notNull(),
    orden: integer('orden').notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.estado, t.clase], name: 'estados_senal_pk' }),
    check('estados_senal_clase_chk', sql`${t.clase} in ${CLASES}`),
  ],
);

/**
 * Los once temas. Catálogo **cerrado** y no abierto: un vocabulario abierto es
 * lo que produjo `salud_publica`, `salud_pública` y `sistema_de_salud` como tres
 * temas distintos.
 *
 * `etiqueta` es cómo se escribe en pantalla, con tilde y mayúscula inicial. Es
 * texto de usuario: se cambia acá el día que el producto quiera otra cosa.
 */
export const temas = pgTable(
  'temas',
  {
    clave: text('clave').primaryKey(),
    etiqueta: text('etiqueta').notNull(),
    orden: integer('orden').notNull(),
  },
  (t) => [unique('temas_orden_unique').on(t.orden)],
);

export type TipoSenalFila = typeof tiposSenal.$inferSelect;
export type EstadoSenalFila = typeof estadosSenal.$inferSelect;
export type TemaFila = typeof temas.$inferSelect;
