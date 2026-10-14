import { createHash } from 'node:crypto';

import { sql, type SQL } from 'drizzle-orm';

import type { Db } from '../client.js';
import type { PaginaGestion } from '@v2/shared';

export type Fila<T> = { [K in keyof T]: T[K] };
export const miembro = (uid: number | undefined) =>
  sql`exists(select 1 from iniciativa_members m where m.iniciativa_id=i.id and m.user_id=${uid ?? null})`;
export const administra = (uid: number | undefined) =>
  sql`(i.created_by_user_id=${uid ?? null} or exists(select 1 from iniciativa_members m where m.iniciativa_id=i.id and m.user_id=${uid ?? null} and m.role in('owner','admin')))`;
export const sinRecibo = (uid: number, idLocal: string) =>
  sql`not exists(select 1 from iniciativa_recibos where usuario_id=${uid} and id_local=${idLocal}::uuid)`;
export const independiente = (uid: number) =>
  sql`${miembro(uid)} and e.submitted_by<>${uid} and t.assignee_id is distinct from ${uid} and t.created_by_id is distinct from ${uid}`;
export function pagina<T extends { id: number }>(rows: T[]): PaginaGestion<T> {
  const items = rows.slice(0, 20);
  return { items, siguiente: rows.length > 20 ? (items.at(-1)?.id ?? null) : null };
}
export async function operar(
  db: Db,
  iniciativaId: number | null,
  uid: number,
  entrada: { idLocal: string },
  tipo: string,
  ctes: SQL,
  bloqueoPrevio: SQL = sql`select 1`,
  actividadPublica = true,
  bloqueoFinal: SQL = sql`select 1`,
) {
  const nota =
    tipo.startsWith('Tarea ') && 'nota' in entrada && typeof entrada.nota === 'string'
      ? entrada.nota
      : null;
  const huella = createHash('sha256')
    .update(JSON.stringify({ iniciativaId, tipo, entrada }))
    .digest('hex');
  // Orden de bloqueos: recibo, capacidad opcional, iniciativa y tarea opcional.
  // La última sentencia usa una foto nueva y encuentra las filas del turno anterior.
  const [, , , , r] = await db.batch([
    db.execute(
      sql`select pg_advisory_xact_lock(hashtextextended(${`${uid}:${entrada.idLocal}`},0))`,
    ),
    db.execute(bloqueoPrevio),
    db.execute(sql`select id from iniciativas where id=${iniciativaId} for update`),
    db.execute(bloqueoFinal),
    db.execute<{ resultado: { id: number; slug?: string }; huella: string }>(sql`with ${ctes},
      registro as (insert into iniciativa_recibos(usuario_id,id_local,huella,resultado)
        select ${uid},${entrada.idLocal}::uuid,${huella},resultado from cambio returning resultado,huella),
      actividad as (insert into iniciativa_activity(iniciativa_id,actor_id,kind,payload)
        select coalesce(${iniciativaId}::int,(resultado->>'id')::int),${uid},${tipo},json_build_object('objetoId',resultado->>'id','nota',${nota}::text) from registro where ${actividadPublica} returning id)
      select resultado,huella from registro union all select resultado,huella from iniciativa_recibos
        where usuario_id=${uid} and id_local=${entrada.idLocal}::uuid`),
  ]);
  const row = r.rows[0];
  return row?.huella === huella ? row.resultado : null;
}
