import { sql } from 'drizzle-orm';

import { administra, operar, sinRecibo } from './gestion-iniciativas-base.js';

import type { Fila } from './gestion-iniciativas-base.js';
import type { Db } from '../client.js';
import type { RecursoTarea, RecursosTarea, VinculoReserva } from '@v2/shared';

const fichaCompatible = sql`not exists(select 1 from prueba_ejecuciones p join pruebas_territoriales pt on pt.id=p.prueba_id join ficha_alternativas a on a.id=pt.alternativa_id where p.tarea_id=t.id and a.ficha_id<>r.ficha_id)`;
export class RecursosTareaRepository {
  constructor(private readonly db: Db) {}
  async listar(
    id: number,
    tarea: number,
    uid: number,
    disponibles = false,
    despues?: string,
  ): Promise<RecursosTarea> {
    const r = await this.db.execute<Fila<RecursoTarea>>(sql`
      select r.id,r.capacidad_id as "capacidadId",c.titulo,c.unidad,r.cantidad,r.cantidad_declarada as "cantidadDeclarada",
      r.para_fecha::text as "paraFecha",r.estado,r.revision,r.ficha_id as "fichaId",r.tarea_id as "tareaId",r.solicitante_id=${uid} as "soySolicitante"
      from reservas_capacidad r join capacidades c on c.id=r.capacidad_id
      join iniciativa_tasks t on t.id=${tarea} join iniciativas i on i.id=t.iniciativa_id
      where i.id=${id} and (r.solicitante_id=${uid} or c.oferente_id=${uid})
      and ${disponibles ? sql`r.solicitante_id=${uid} and r.tarea_id is null and r.estado in('reservada','entrega_declarada','entregada','discrepancia') and t.status not in('done','cancelled') and i.status in('open','in_progress','paused') and (t.assignee_id=${uid} or ${administra(uid)}) and ${fichaCompatible}` : sql`r.tarea_id=t.id`}
      ${despues ? sql`and r.id>${despues}::uuid` : sql``} order by r.id limit 21`);
    return {
      items: r.rows.slice(0, 20),
      siguiente: r.rows.length > 20 ? (r.rows[19]?.id ?? null) : null,
    };
  }
  vincular(id: number, tarea: number, uid: number, v: VinculoReserva) {
    const quitar = v.accion === 'desvincular';
    return operar(
      this.db,
      id,
      uid,
      v,
      `Recurso ${tarea}: ${v.accion}`,
      sql`
      cambio as (update reservas_capacidad r set tarea_id=${quitar ? null : tarea},revision=r.revision+1,actualizada_en=now()
      from iniciativa_tasks t join iniciativas i on i.id=t.iniciativa_id
      where r.id=${v.reservaId}::uuid and t.id=${tarea} and i.id=${id} and r.solicitante_id=${uid}
      and r.revision=${v.revisionReserva} and ${sinRecibo(uid, v.idLocal)}
      and ${quitar ? sql`r.tarea_id=t.id` : sql`r.tarea_id is null and t.revision=${v.revisionTarea} and t.status not in('done','cancelled') and i.kind<>'plan' and i.status in('open','in_progress','paused') and (t.assignee_id=${uid} or ${administra(uid)}) and r.estado in('reservada','entrega_declarada','entregada','discrepancia') and ${fichaCompatible}`}
      returning jsonb_build_object('id',t.id) as resultado)`,
      sql`select c.id from capacidades c join reservas_capacidad r on r.capacidad_id=c.id where r.id=${v.reservaId}::uuid for update of c`,
      false,
      sql`select id from iniciativa_tasks where id=${tarea} and iniciativa_id=${id} for update`,
    );
  }
}
