import { sql } from 'drizzle-orm';

import {
  administra,
  independiente,
  operar,
  pagina,
  sinRecibo,
} from './gestion-iniciativas-base.js';
import { camposTarea } from './iniciativa-tareas.js';

import type { Fila } from './gestion-iniciativas-base.js';
import type { Db } from '../client.js';
import type {
  EnvioCampo,
  EscuchaPublica,
  EvidenciaIniciativa,
  EvidenciaTareaInput,
  RevisarEvidencia,
} from '@v2/shared';

export class IniciativaEvidenciaRepository {
  constructor(private readonly db: Db) {}
  async listar(id: number, tareaId: number, uid?: number, cursor?: number) {
    const r = await this.db.execute<
      Fila<EvidenciaIniciativa>
    >(sql`select e.id,e.title as titulo,e.body as texto,e.url,e.revision,e.is_verified as revisada,e.reviewer_name as "firmaRevision",e.review_note as "notaRevision",e.resultado_escucha as "resultadoEscucha",
      coalesce((e.submitted_by=${uid ?? null} or ${administra(uid)}),false) as "puedoRetirar",
      coalesce(${independiente(uid ?? 0)} and not e.is_verified,false) as "puedoRevisar"
      from mission_evidence e join iniciativa_tasks t on t.id=e.task_id join iniciativas i on i.id=t.iniciativa_id where i.id=${id} and t.id=${tareaId} and e.withdrawn_at is null ${cursor ? sql`and e.id>${cursor}` : sql``} order by e.id limit 21`);
    return pagina(r.rows);
  }
  crear(id: number, tareaId: number, uid: number, v: EvidenciaTareaInput) {
    return operar(
      this.db,
      id,
      uid,
      v,
      `Evidencia de tarea ${tareaId}`,
      sql`cambio as (
      insert into mission_evidence(iniciativa_id,task_id,submitted_by,kind,title,body,url,resultado_escucha)
      select i.id,t.id,${uid},${v.url ? 'link' : 'text'},${v.titulo},${v.texto},${v.url},${v.resultadoEscucha ? JSON.stringify(v.resultadoEscucha) : null}::jsonb
      from iniciativa_tasks t join iniciativas i on i.id=t.iniciativa_id where i.id=${id} and t.id=${tareaId} and t.status='done'
      and i.kind<>'plan' and (t.assignee_id=${uid} or ${administra(uid)}) and ${sinRecibo(uid, v.idLocal)}
      and ((t.escucha is null and ${v.resultadoEscucha === null}) or (t.escucha is not null and ${v.resultadoEscucha !== null}))
      and not exists(select 1 from prueba_ejecuciones where tarea_id=t.id) returning jsonb_build_object('id',id) as resultado)`,
    );
  }
  campo(id: number, tareaId: number, uid: number, v: EnvioCampo) {
    return operar(
      this.db,
      id,
      uid,
      v,
      `Resultado de campo ${tareaId}`,
      sql`
      tarea as (update iniciativa_tasks t set status='done',completed_at=coalesce(t.completed_at,now()),revision=t.revision+1,updated_at=now()
      from iniciativas i where i.id=${id} and t.iniciativa_id=i.id and t.id=${tareaId} and t.revision=${v.revisionTarea}
      and ${v.usuarioId}=${uid} and i.kind<>'plan' and t.escucha is not null and i.status in('open','in_progress','paused')
      and ((t.status='in_progress' and t.assignee_id=${uid}) or (t.status='done' and (t.assignee_id=${uid} or ${administra(uid)})))
      and not exists(select 1 from prueba_ejecuciones where tarea_id=t.id) and ${sinRecibo(uid, v.idLocal)} returning t.id),
      cambio as (insert into mission_evidence(iniciativa_id,task_id,submitted_by,kind,title,body,url,resultado_escucha)
      select ${id},t.id,${uid},${v.url ? 'link' : 'text'},${v.titulo},${v.texto},${v.url},${JSON.stringify(v.resultadoEscucha)}::jsonb from tarea t
      returning jsonb_build_object('id',id) as resultado)`,
    );
  }
  revisar(id: number, evidenciaId: number, uid: number, v: RevisarEvidencia) {
    const retirar = v.accion === 'retirar';
    return operar(
      this.db,
      id,
      uid,
      v,
      `Evidencia ${evidenciaId}: ${v.accion}`,
      sql`cambio as (
      update mission_evidence e set revision=e.revision+1,
        withdrawn_at=case when ${retirar} then now() else null end,
        title=case when ${retirar} then '' else e.title end,body=case when ${retirar} then null else e.body end,url=case when ${retirar} then null else e.url end,
        resultado_escucha=case when ${retirar} then null else e.resultado_escucha end,is_verified=${!retirar},
        verified_by=${retirar ? null : uid},verified_at=case when ${retirar} then null else now() end,
        review_note=${retirar ? null : v.nota},reviewer_name=${retirar ? null : v.firma}
      from iniciativa_tasks t join iniciativas i on i.id=t.iniciativa_id where e.task_id=t.id and i.id=${id} and e.id=${evidenciaId} and e.revision=${v.revision} and e.withdrawn_at is null and ${sinRecibo(uid, v.idLocal)}
      and ${retirar ? sql`(e.submitted_by=${uid} or ${administra(uid)})` : sql`${independiente(uid)} and not e.is_verified`}
      returning jsonb_build_object('id',e.id) as resultado,e.task_id),
      reabrir_hito as (update iniciativa_milestones h set completed_at=null,revision=revision+1 where ${retirar} and exists(select 1 from cambio c join iniciativa_tasks t on t.id=c.task_id where t.milestone_id=h.id) returning h.id),
      reabrir_iniciativa as (update iniciativas set status='in_progress',revision=revision+1 where id=${id} and ${retirar} and status='completed' and exists(select 1 from cambio) returning id)`,
    );
  }
  async escuchas(q: {
    cursor?: number | undefined;
    territorioId?: number | undefined;
    estado?: 'pendiente' | 'realizada' | undefined;
  }) {
    const r = await this.db.execute<
      Fila<EscuchaPublica>
    >(sql`select ${camposTarea},i.slug as "iniciativaSlug",i.title as "iniciativaTitulo",
      (select count(*)::int from mission_evidence e where e.task_id=t.id and e.is_verified and e.withdrawn_at is null) as revisiones
      from iniciativa_tasks t join iniciativas i on i.id=t.iniciativa_id where t.escucha is not null and t.status<>'cancelled'
      ${q.cursor ? sql`and t.id>${q.cursor}` : sql``}
      ${q.territorioId ? sql`and (t.escucha->>'territorioId')::int=${q.territorioId}` : sql``}
      ${q.estado === 'realizada' ? sql`and t.status='done'` : q.estado === 'pendiente' ? sql`and t.status<>'done'` : sql``}
      order by t.id limit 21`);
    return pagina(r.rows);
  }
}
