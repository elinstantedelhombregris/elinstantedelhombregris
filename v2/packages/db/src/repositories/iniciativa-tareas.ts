import { sql } from 'drizzle-orm';

import { administra, miembro, operar, pagina, sinRecibo } from './gestion-iniciativas-base.js';

import type { Fila } from './gestion-iniciativas-base.js';
import type { Db } from '../client.js';
import type {
  EditarHito,
  EditarTarea,
  EstadoTarea,
  HitoIniciativa,
  NuevaTarea,
  NuevoHito,
  TareaIniciativa,
} from '@v2/shared';

export const camposTarea = sql`t.id,t.title as titulo,coalesce(t.description,'') as alcance,coalesce(to_char(t.due_date at time zone 'UTC','YYYY-MM-DD'),'') as fecha,
  t.milestone_id as "hitoId",t.revision,t.status as estado,t.accepted_name as firma,t.resources as recursos,t.escucha`;
const derivada = sql`exists(select 1 from prueba_ejecuciones e where e.tarea_id=t.id)`;
const lugarValido = (v: NuevaTarea | EditarTarea) =>
  sql`(${v.escucha?.territorioId ?? null}::int is null or exists(select 1 from geographic_locations where id=${v.escucha?.territorioId ?? null}))`;
const hitoValido = (id: number, v: NuevaTarea | EditarTarea) =>
  sql`(${v.hitoId}::int is null or exists(select 1 from iniciativa_milestones h where h.id=${v.hitoId} and h.iniciativa_id=${id} and h.completed_at is null and not exists(select 1 from prueba_ejecuciones e where e.hito_id=h.id)))`;

export class IniciativaTareasRepository {
  constructor(private readonly db: Db) {}
  async tareas(id: number, uid?: number, cursor?: number, tareaId?: number) {
    const r = await this.db.execute<
      Fila<TareaIniciativa>
    >(sql`select ${camposTarea},${derivada} as derivada,
      coalesce(t.assignee_id=${uid ?? null} and not ${derivada},false) as "puedoGestionar",
      (${miembro(uid)} and t.assignee_id is null and t.status='todo' and i.status in('open','in_progress') and not ${derivada}) as "puedoAceptar",
      coalesce(${administra(uid)} and t.assignee_id is null and t.status='todo' and not ${derivada},false) as "puedoEditar",
      coalesce((t.assignee_id=${uid ?? null} or ${administra(uid)}) and t.status='done' and not ${derivada},false) as "puedoEvidenciar"
      from iniciativa_tasks t join iniciativas i on i.id=t.iniciativa_id where i.id=${id} ${tareaId ? sql`and t.id=${tareaId}` : sql``} ${cursor ? sql`and t.id>${cursor}` : sql``} order by t.id limit 21`);
    return pagina(r.rows);
  }
  async hitos(id: number, cursor?: number) {
    const r = await this.db.execute<
      Fila<HitoIniciativa>
    >(sql`select h.id,h.title as titulo,coalesce(h.description,'') as descripcion,coalesce(to_char(h.target_date at time zone 'UTC','YYYY-MM-DD'),'') as fecha,h.revision,h.completed_at is not null as completado,
      exists(select 1 from prueba_ejecuciones e where e.hito_id=h.id) as derivado from iniciativa_milestones h where h.iniciativa_id=${id} ${cursor ? sql`and h.id>${cursor}` : sql``} order by h.id limit 21`);
    return pagina(r.rows);
  }
  hito(id: number, uid: number, v: NuevoHito | EditarHito, hitoId?: number) {
    const base = sql`i.id=${id} and i.kind<>'plan' and ${administra(uid)} and ${sinRecibo(uid, v.idLocal)}`;
    const ctes =
      hitoId && 'revision' in v
        ? sql`cambio as (update iniciativa_milestones h set title=${v.titulo},description=${v.descripcion},target_date=${v.fecha}::date,revision=h.revision+1,completed_at=case when ${v.completado} then now() else null end
      from iniciativas i where h.id=${hitoId} and h.iniciativa_id=i.id and h.revision=${v.revision} and ${base}
      and not exists(select 1 from prueba_ejecuciones where hito_id=h.id)
      and (not ${v.completado} or (exists(select 1 from iniciativa_tasks where milestone_id=h.id) and not exists(select 1 from iniciativa_tasks t where t.milestone_id=h.id and t.status<>'cancelled' and (t.status<>'done' or not exists(select 1 from mission_evidence e where e.task_id=t.id and e.is_verified and e.withdrawn_at is null)))))
      returning jsonb_build_object('id',h.id) as resultado)`
        : sql`cambio as (insert into iniciativa_milestones(iniciativa_id,title,description,target_date) select i.id,${v.titulo},${v.descripcion},${v.fecha}::date from iniciativas i where ${base} and i.status in('open','in_progress','paused') returning jsonb_build_object('id',id) as resultado)`;
    return operar(this.db, id, uid, v, hitoId ? `Hito ${hitoId} actualizado` : 'Hito creado', ctes);
  }
  tarea(id: number, uid: number, v: NuevaTarea | EditarTarea, tareaId?: number) {
    const base = sql`i.id=${id} and i.kind<>'plan' and ${administra(uid)} and i.status in('open','in_progress','paused') and ${sinRecibo(uid, v.idLocal)} and ${lugarValido(v)} and ${hitoValido(id, v)}`;
    const escucha = v.escucha ? JSON.stringify(v.escucha) : null;
    const ctes =
      tareaId && 'revision' in v
        ? sql`cambio as (update iniciativa_tasks t set title=${v.titulo},description=${v.alcance},resources=${v.recursos},due_date=${v.fecha}::date,milestone_id=${v.hitoId},escucha=${escucha}::jsonb,revision=t.revision+1,updated_at=now()
      from iniciativas i where t.id=${tareaId} and t.iniciativa_id=i.id and ${base} and t.revision=${v.revision} and t.assignee_id is null and t.status='todo' and not ${derivada} returning jsonb_build_object('id',t.id) as resultado)`
        : sql`cambio as (insert into iniciativa_tasks(iniciativa_id,title,description,resources,due_date,milestone_id,escucha,created_by_id) select i.id,${v.titulo},${v.alcance},${v.recursos},${v.fecha}::date,${v.hitoId},${escucha}::jsonb,${uid} from iniciativas i where ${base} returning jsonb_build_object('id',id) as resultado)`;
    return operar(this.db, id, uid, v, tareaId ? `Tarea ${tareaId} editada` : 'Tarea creada', ctes);
  }
  estado(id: number, tareaId: number, uid: number, v: EstadoTarea) {
    const accion = v.accion;
    const siguiente = {
      aceptar: 'todo',
      iniciar: 'in_progress',
      pausar: 'blocked',
      liberar: 'todo',
      realizada: 'done',
      cancelar: 'cancelled',
    }[accion];
    const permite =
      accion === 'aceptar'
        ? sql`i.status in('open','in_progress') and ${miembro(uid)} and t.assignee_id is null and t.status='todo'`
        : accion === 'cancelar'
          ? sql`${administra(uid)} and t.assignee_id is null and t.status='todo'`
          : sql`t.assignee_id=${uid} and ${accion === 'iniciar' ? sql`t.status in('todo','blocked')` : accion === 'pausar' ? sql`t.status='in_progress'` : accion === 'realizada' ? sql`t.status='in_progress'` : sql`t.status in('todo','in_progress','blocked')`}`;
    return operar(
      this.db,
      id,
      uid,
      v,
      `Tarea ${tareaId}: ${accion}`,
      sql`cambio as (update iniciativa_tasks t set status=${siguiente},revision=t.revision+1,updated_at=now(),
      assignee_id=case when ${accion}='aceptar' then ${uid} when ${accion}='liberar' then null else t.assignee_id end,
      accepted_name=case when ${accion}='aceptar' then ${v.firma} when ${accion}='liberar' then null else t.accepted_name end,
      completed_at=case when ${accion}='realizada' then now() else null end
      from iniciativas i where t.iniciativa_id=i.id and i.id=${id} and i.kind<>'plan' and t.id=${tareaId} and t.revision=${v.revision}
      and (${accion}='liberar' or i.status in('open','in_progress','paused')) and ${permite} and not ${derivada} and ${sinRecibo(uid, v.idLocal)} returning jsonb_build_object('id',t.id) as resultado)`,
    );
  }
}
