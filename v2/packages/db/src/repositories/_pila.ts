/**
 * Las piezas que comparten `pila.ts` y `pila-gestion.ts` (plan de Mi Argentina
 * ideal, entrega 1, tarea 5). Van acá y no en cada archivo porque son reglas:
 * si se escribieran dos veces, el día que cambie una la pila y su gestión
 * dejarían de mirar los mismos aportes.
 */
import { LARGO_LINEA } from '@v2/shared';
import { sql, type SQL } from 'drizzle-orm';

import { campanas, contribuciones } from '../schema/campanas.js';
import { senales } from '../schema/senales.js';

/**
 * Los estados de campaña cuyos aportes se miran. `pausada` y `borrador` están
 * porque una campaña ya publicada que prepara su próxima edición queda en
 * `borrador` (y en público se ve `pausada`): sus aportes siguen ahí. Una campaña
 * que nunca se publicó no tiene aportes, porque contribuir exige `abierta`.
 * Una campaña cerrada saca sus aportes de Mirar.
 */
export const ESTADOS_EN_MIRAR = ['abierta', 'pausada', 'en_devolucion', 'borrador'] as const;
const ESTADOS_SQL = sql.raw(`(${ESTADOS_EN_MIRAR.map((e) => `'${e}'`).join(',')})`);

/** Una campaña cuyo estado deja mirar sus aportes. `k` es el alias de `campanas`. */
export const campanaEnMirar = (k: SQL): SQL => sql`${k}.estado in ${ESTADOS_SQL}`;

/**
 * Lo que puede aparecer en Mirar (P3). Se escribe una sola vez y lo usan todas
 * las lecturas y escrituras de la pila. Va con referencias de columna de Drizzle
 * —no con alias— para que `textoDeSenalPublica` entre en la misma consulta: por
 * eso toda consulta que lo usa nombra la tabla `senales` sin alias.
 *
 * Sin `campanaId`, vale cualquier campaña que se esté mirando: es lo que usan
 * las opiniones, los duelos y los reportes, que llegan por el id del aporte.
 */
/**
 * Lo que tiene que cumplir el aporte mismo para entrar en Mirar y en Ver: un deseo sin
 * retirar ni retener, con el texto cedido y de hasta `LARGO_LINEA` letras. Es la única
 * definición; Ver la usa tal cual (D-140).
 */
export const aporteQueEntra: SQL = sql`${senales.clase} = 'deseo' and ${senales.estado} <> 'retirada'
    and ${senales.retenidaEn} is null and ${senales.cesionLicencia}
    and char_length(${senales.texto}) <= ${LARGO_LINEA}`;

export function elegible(campanaId?: string): SQL {
  return sql`${aporteQueEntra}
    and exists (select 1 from ${contribuciones} c join ${campanas} k on k.id = c.campana_id
      where c.senal_id = ${senales.idPublico} and ${campanaEnMirar(sql`k`)}
      ${campanaId === undefined ? sql`` : sql`and k.id = ${campanaId}::uuid`})`;
}

/**
 * El aporte NO es de quien mira. `is distinct from` y no `<>`: con la columna en
 * NULL, `<>` da NULL y el aporte anónimo quedaría afuera de la pila de todos.
 */
export function ajeno(actorId: number, userId: number | null): SQL {
  return sql`${senales.actorId} is distinct from ${actorId}::bigint
    and (${userId}::int is null or ${senales.userId} is distinct from ${userId}::int)`;
}

/**
 * Una fila de `pila_respuestas`, `pila_duelos` o `pila_reportes` es de quien
 * mira si es de su actor o de su cuenta: la misma persona en dos navegadores con
 * la misma cuenta no cuenta doble (lección de D-137). `t` es el alias de la tabla.
 */
export function deQuienMira(t: SQL, actorId: number | null, userId: number | null): SQL {
  return sql`(${t}.actor_id = ${actorId}::bigint
    or (${userId}::int is not null and ${t}.user_id = ${userId}::int))`;
}

/** Una fecha en ISO 8601 con milisegundos y en UTC, como la lee el resto de la API. */
export const iso = (columna: SQL): SQL<string> =>
  sql<string>`to_char(${columna} at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`;
