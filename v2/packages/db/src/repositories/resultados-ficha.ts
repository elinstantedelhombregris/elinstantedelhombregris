import { sql, type SQL } from 'drizzle-orm';

import { editorFichaSql } from './deliberacion-ficha.js';
import { administra, operar, pagina, sinRecibo, type Fila } from './gestion-iniciativas-base.js';

import type { Db } from '../client.js';
import type { ResultadoFichaCampo, vinculoFichaTareaSchema } from '@v2/shared';
import type { z } from 'zod';

/** Sólo identidad y estado: nunca copiar el resumen a un aviso. */
export const avisosCampo = (titulo: string): SQL => sql`avisos_campo as (
  insert into eventos_civicos(user_id,clave,titulo,href)
  select s.user_id,'campo:'||(c.resultado->>'id')||':'||c.revision,${titulo},'/fichas/'||tf.ficha_id
  from cambio c join tareas_fichas tf on tf.tarea_id=c.task_id join seguimientos s on s.tipo='ficha' and s.objeto=tf.ficha_id::text
  where not exists(select 1 from preferencias_civicas p where p.user_id=s.user_id and not p.avisos)
  on conflict do nothing returning id)`;
export class ResultadosFichaRepository {
  constructor(private readonly db: Db) {}
  async vinculo(id: number, tareaId: number) {
    return (
      (
        await this.db.execute<{ fichaId: string; titulo: string }>(
          sql`select f.id as "fichaId",coalesce(f.contenido->>'titulo','Ficha') as titulo from tareas_fichas tf join fichas_futuro f on f.id=tf.ficha_id join iniciativa_tasks t on t.id=tf.tarea_id where t.iniciativa_id=${id} and tf.tarea_id=${tareaId}`,
        )
      ).rows[0] ?? null
    );
  }
  vincular(id: number, tareaId: number, uid: number, v: z.infer<typeof vinculoFichaTareaSchema>) {
    return operar(
      this.db,
      id,
      uid,
      v,
      `Destino de tarea ${tareaId}`,
      sql`
      cambio as (update iniciativa_tasks t set revision=t.revision+1,updated_at=now() from iniciativas i
        where i.id=${id} and t.iniciativa_id=i.id and t.id=${tareaId} and t.revision=${v.revision}
        and i.kind<>'plan' and ${administra(uid)} and ${sinRecibo(uid, v.idLocal)}
        and not exists(select 1 from prueba_ejecuciones where tarea_id=t.id)
        and not exists(select 1 from mission_evidence where task_id=t.id)
        and ${v.fichaId ? editorFichaSql(v.fichaId, uid) : sql`true`}
        returning jsonb_build_object('id',t.id) as resultado,t.id),
      borrar as (delete from tareas_fichas where tarea_id in(select id from cambio) and ${v.fichaId === null} returning tarea_id),
      guardar as (insert into tareas_fichas(tarea_id,ficha_id) select id,${v.fichaId}::uuid from cambio where ${v.fichaId !== null}
        on conflict(tarea_id) do update set ficha_id=excluded.ficha_id returning tarea_id)`,
    );
  }
  async listar(fichaId: string, cursor?: number) {
    const r = await this.db.execute<
      Fila<ResultadoFichaCampo>
    >(sql`select e.id,e.title as titulo,e.body as texto,e.url,e.is_verified as revisada,e.withdrawn_at is not null as retirada,
      e.review_note as "notaRevision",e.reviewer_name as "firmaRevision",e.resultado_escucha as "resultadoEscucha",t.id as "tareaId",t.title as "tareaTitulo",i.slug as "iniciativaSlug"
      from tareas_fichas tf join iniciativa_tasks t on t.id=tf.tarea_id join iniciativas i on i.id=t.iniciativa_id join mission_evidence e on e.task_id=t.id
      where tf.ficha_id=${fichaId}::uuid ${cursor ? sql`and e.id>${cursor}` : sql``} order by e.id limit 21`);
    return pagina(r.rows);
  }
}
