import { createHash, randomUUID } from 'node:crypto';

import { sql } from 'drizzle-orm';

import type { Db } from '../client.js';
import type {
  AccionIniciativa,
  EjecucionPrueba,
  PaginaAccionesIniciativa,
  VincularEjecucion,
} from '@v2/shared';

const lectura = sql`jsonb_build_object(
  'iniciativa',jsonb_build_object('slug',i.slug,'titulo',i.title),
  'tareaId',t.id,'estadoTarea',t.status,'hito',h.title,
  'revisionRealizada',h.completed_at is not null,'recursos',e.recursos)`;
const tablas = sql`prueba_ejecuciones e join iniciativas i on i.id=e.iniciativa_id
  join iniciativa_tasks t on t.id=e.tarea_id join iniciativa_milestones h on h.id=e.hito_id`;

export class EjecucionRepository {
  constructor(private readonly db: Db) {}

  async dePruebas(ids: string[], uid?: number) {
    if (!ids.length) return [];
    const r = await this.db.execute<{
      pruebaId: string;
      ejecucion: EjecucionPrueba;
      puedoAceptar: boolean;
    }>(sql`
      select e.prueba_id as "pruebaId",${lectura} as ejecucion,
      exists(select 1 from iniciativa_members m where m.iniciativa_id=i.id and m.user_id=${uid ?? null}) as "puedoAceptar"
      from ${tablas} where e.prueba_id in(select x::uuid from jsonb_array_elements_text(${JSON.stringify(ids)}::jsonb) x)`);
    return r.rows;
  }

  async deIniciativa(slug: string, cursor?: number): Promise<PaginaAccionesIniciativa | null> {
    const existe = await this.db.execute<{ id: number }>(
      sql`select id from iniciativas where slug=${slug}`,
    );
    if (!existe.rows.length) return null;
    const r = await this.db.execute<{
      accion: AccionIniciativa;
    }>(sql`select ${lectura} || jsonb_build_object(
      'pruebaId',p.id,'fichaId',a.ficha_id,'alternativaId',a.id,'titulo',p.titulo,'alcance',p.alcance,
      'plazo',p.plazo::text,'estado',p.estado,'responsableNombre',p.responsable_nombre) as accion
      from ${tablas} join pruebas_territoriales p on p.id=e.prueba_id join ficha_alternativas a on a.id=p.alternativa_id
      where i.slug=${slug} ${cursor ? sql`and t.id>${cursor}` : sql``} order by t.id limit 21`);
    const items = r.rows.slice(0, 20).map((r) => r.accion);
    return { items, siguiente: r.rows.length > 20 ? (items.at(-1)?.tareaId ?? null) : null };
  }

  async vincular(pruebaId: string, uid: number, v: VincularEjecucion): Promise<boolean> {
    const huella = createHash('sha256').update(JSON.stringify(v)).digest('hex');
    const nueva = v.iniciativa.tipo === 'nueva' ? v.iniciativa : null;
    const slug = v.iniciativa.tipo === 'existente' ? v.iniciativa.slug : null;
    // Cada paso que cambia una prueba toma este mismo bloqueo. La segunda sentencia
    // ve lo confirmado por quien esperó antes: también evita tareas desactualizadas.
    try {
      const [, resultado] = await this.db.batch([
        this.db.execute(
          sql`select id from pruebas_territoriales where id=${pruebaId}::uuid for update`,
        ),
        this.db.execute<{ id: string }>(sql`with prueba as (
          select p.* from pruebas_territoriales p where p.id=${pruebaId}::uuid
          and (p.creador_id=${uid} or p.responsable_id=${uid}) and p.revision=${v.revision}
          and not exists(select 1 from prueba_ejecuciones e where e.prueba_id=p.id or (e.creador_id=${uid} and e.id_local=${v.idLocal}::uuid))
        ), nueva as (
          insert into iniciativas(slug,title,summary,kind,status,created_by_user_id,member_count)
          select ${'accion-' + randomUUID()},${nueva?.titulo ?? ''},${nueva?.resumen ?? ''},'community','open',${uid},1 from prueba
          where ${Boolean(nueva)} returning id
        ), destino as (
          select id from nueva union all
          select i.id from iniciativas i where i.slug=${slug} and i.kind<>'plan' and i.status in('open','in_progress','paused')
          and (i.created_by_user_id=${uid} or exists(select 1 from iniciativa_members m where m.iniciativa_id=i.id and m.user_id=${uid} and m.role in('owner','admin')))
          and exists(select 1 from prueba)
        ), miembro as (
          insert into iniciativa_members(iniciativa_id,user_id,role) select id,${uid},'owner' from nueva returning iniciativa_id
        ), hito as (
          insert into iniciativa_milestones(iniciativa_id,title,description,target_date,completed_at)
          select d.id,${v.hito},'Revisar el resultado y sus límites; no implica un resultado favorable.',p.plazo::timestamp at time zone 'UTC',
            case when p.estado='resultado_revisado' then now() else null end
          from destino d cross join prueba p returning id,iniciativa_id
        ), tarea as (
          insert into iniciativa_tasks(iniciativa_id,milestone_id,title,description,assignee_id,status,due_date,completed_at)
          select h.iniciativa_id,h.id,p.titulo,p.alcance,p.responsable_id,
            case when p.estado='en_curso' then 'in_progress' when p.estado='pausada' then 'blocked'
              when p.estado in('implementada','resultado_observado','resultado_revisado') then 'done' else 'todo' end,
            p.plazo::timestamp at time zone 'UTC',case when p.estado in('implementada','resultado_observado','resultado_revisado') then now() else null end
          from hito h cross join prueba p returning id,iniciativa_id,milestone_id
        ), vinculo as (
          insert into prueba_ejecuciones(prueba_id,iniciativa_id,tarea_id,hito_id,creador_id,id_local,huella,recursos)
          select p.id,t.iniciativa_id,t.id,t.milestone_id,${uid},${v.idLocal}::uuid,${huella},${v.recursos}
          from tarea t cross join prueba p returning prueba_id as id
        ) select id from vinculo union all select e.prueba_id as id from prueba_ejecuciones e
          where e.prueba_id=${pruebaId}::uuid and e.creador_id=${uid} and e.id_local=${v.idLocal}::uuid and e.huella=${huella}`),
      ]);
      return resultado.rows.length === 1;
    } catch (e) {
      // Un recibo concurrente en otra prueba no puede dejar iniciativa/hito/tarea huérfanos.
      if (e && typeof e === 'object' && 'code' in e && e.code === '23505') return false;
      throw e;
    }
  }
}
