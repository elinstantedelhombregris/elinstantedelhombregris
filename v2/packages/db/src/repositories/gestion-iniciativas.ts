import { randomUUID } from 'node:crypto';

import { sql } from 'drizzle-orm';

import { administra, miembro, operar, pagina, sinRecibo } from './gestion-iniciativas-base.js';

import type { Fila } from './gestion-iniciativas-base.js';
import type { Db } from '../client.js';
import type {
  EditarIniciativa,
  EquipoIniciativa,
  MiembroIniciativa,
  NuevaIniciativa,
  PermisosIniciativa,
} from '@v2/shared';

export class GestionIniciativasRepository {
  constructor(private readonly db: Db) {}
  async permisos(id: number, uid?: number): Promise<PermisosIniciativa> {
    const r = await this.db.execute<Fila<PermisosIniciativa>>(sql`select ${miembro(uid)} as miembro,
      coalesce(${administra(uid)} and i.kind<>'plan',false) as administrar,
      coalesce(i.created_by_user_id=${uid ?? null} and i.kind<>'plan',false) as propietario,
      coalesce(i.proposed_owner_id=${uid ?? null},false) as "aceptarTraspaso" from iniciativas i where id=${id}`);
    return (
      r.rows[0] ?? {
        miembro: false,
        administrar: false,
        propietario: false,
        aceptarTraspaso: false,
      }
    );
  }
  crear(uid: number, v: NuevaIniciativa) {
    return operar(
      this.db,
      null,
      uid,
      v,
      'Iniciativa creada',
      sql`nueva as (
      insert into iniciativas(slug,title,summary,body_markdown,kind,created_by_user_id,member_count)
      select ${'comunidad-' + randomUUID()},${v.titulo},${v.resumen},${v.documento},'community',${uid},1 where ${sinRecibo(uid, v.idLocal)} returning *
    ), equipo as (insert into iniciativa_members(iniciativa_id,user_id,role) select id,${uid},'owner' from nueva returning iniciativa_id),
    cambio as (select jsonb_build_object('id',id,'slug',slug) as resultado from nueva)`,
    );
  }
  editar(id: number, uid: number, v: EditarIniciativa) {
    return operar(
      this.db,
      id,
      uid,
      v,
      'Iniciativa actualizada',
      sql`cambio as (
      update iniciativas i set title=${v.titulo},summary=${v.resumen},body_markdown=${v.documento},status=${v.estado},revision=revision+1,updated_at=now()
      where i.id=${id} and i.revision=${v.revision} and i.kind<>'plan' and ${administra(uid)} and ${sinRecibo(uid, v.idLocal)}
      and (${v.estado}<>'completed' or (exists(select 1 from iniciativa_tasks t where t.iniciativa_id=i.id and t.status<>'cancelled') and not exists(select 1 from iniciativa_tasks t where t.iniciativa_id=i.id and t.status<>'cancelled' and (
        t.status<>'done' or not (exists(select 1 from mission_evidence e where e.task_id=t.id and e.is_verified and e.withdrawn_at is null)
        or exists(select 1 from prueba_ejecuciones x join pruebas_territoriales p on p.id=x.prueba_id where x.tarea_id=t.id and p.estado='resultado_revisado'))))))
      returning jsonb_build_object('id',i.id,'slug',i.slug) as resultado)`,
    );
  }
  async equipo(id: number, uid: number, cursor?: number) {
    if (!(await this.permisos(id, uid)).administrar) return null;
    const r = await this.db.execute<Fila<MiembroIniciativa>>(
      sql`select u.id,u.username as usuario,m.role as rol from iniciativa_members m join users u on u.id=m.user_id join iniciativas i on i.id=m.iniciativa_id where i.id=${id} and ${administra(uid)} ${cursor ? sql`and u.id>${cursor}` : sql``} order by u.id limit 21`,
    );
    return pagina(r.rows);
  }
  cambiarEquipo(id: number, uid: number, v: EquipoIniciativa) {
    const persona = 'usuario' in v ? v.usuario : '';
    const destino = sql`select u.id from users u join iniciativa_members m on m.user_id=u.id where m.iniciativa_id=${id} and u.username=${persona} and u.is_active`;
    const base = sql`i.id=${id} and i.kind<>'plan' and i.revision=${v.revision} and ${sinRecibo(uid, v.idLocal)}`;
    const propietario = sql`${base} and i.created_by_user_id=${uid}`;
    const ctes =
      v.accion === 'proponer_traspaso'
        ? sql`cambio as (update iniciativas i set proposed_owner_id=(${destino}),revision=revision+1 where ${propietario} and exists(${destino}) and (${destino})<>${uid} returning jsonb_build_object('id',id) as resultado)`
        : v.accion === 'cancelar_traspaso'
          ? sql`cambio as (update iniciativas i set proposed_owner_id=null,revision=revision+1 where ${propietario} returning jsonb_build_object('id',id) as resultado)`
          : v.accion === 'aceptar_traspaso'
            ? sql`cambio as (update iniciativas i set created_by_user_id=${uid},proposed_owner_id=null,revision=revision+1 where ${base} and i.proposed_owner_id=${uid} and ${miembro(uid)} returning jsonb_build_object('id',id) as resultado),
        roles as (update iniciativa_members set role=case when user_id=${uid} then 'owner' else 'admin' end where iniciativa_id=${id} and (role='owner' or user_id=${uid} or user_id=(select created_by_user_id from iniciativas where id=${id})) and exists(select 1 from cambio) returning user_id)`
            : v.accion === 'rol'
              ? sql`cambio as (update iniciativas i set revision=revision+1 where ${propietario} and exists(${destino}) and (${destino})<>${uid} returning jsonb_build_object('id',id) as resultado),
        roles as (update iniciativa_members set role=${v.rol} where iniciativa_id=${id} and user_id=(${destino}) and exists(select 1 from cambio) returning user_id)`
              : sql`destino as (${destino}), cambio as (update iniciativas i set revision=revision+1,
          member_count=(select count(*)::int-1 from iniciativa_members where iniciativa_id=i.id),
          proposed_owner_id=case when proposed_owner_id=(select id from destino) then null else proposed_owner_id end
          where ${propietario} and exists(select 1 from destino) and (select id from destino)<>${uid}
          and not exists(select 1 from iniciativa_tasks where iniciativa_id=i.id and assignee_id=(select id from destino) and status not in('done','cancelled')) returning jsonb_build_object('id',id) as resultado),
        baja as (delete from iniciativa_members where iniciativa_id=${id} and user_id=(select id from destino) and exists(select 1 from cambio) returning user_id)`;
    const evento = {
      rol: 'Rol de integrante actualizado',
      retirar: 'Integrante retirado del equipo',
      proponer_traspaso: 'Transferencia de propiedad propuesta',
      cancelar_traspaso: 'Transferencia de propiedad cancelada',
      aceptar_traspaso: 'Transferencia de propiedad aceptada',
    }[v.accion];
    return operar(this.db, id, uid, v, evento, ctes);
  }
  async personales(uid: number, cursor?: number, soloAdministradas = true) {
    const r = await this.db.execute<{ id: number; slug: string; titulo: string }>(
      sql`select i.id,i.slug,i.title as titulo from iniciativas i where i.kind<>'plan' and (${administra(uid)} or ${soloAdministradas ? sql`false` : miembro(uid)}) ${cursor ? sql`and i.id>${cursor}` : sql``} order by i.id limit 21`,
    );
    return pagina(r.rows);
  }
  async actividad(id: number, cursor?: number) {
    const r = await this.db.execute<{
      id: number;
      tipo: string;
      fecha: string;
      nota: string | null;
    }>(
      sql`select id,kind as tipo,payload->>'nota' as nota,to_char(created_at at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS"Z"') as fecha from iniciativa_activity where iniciativa_id=${id} ${cursor ? sql`and id>${cursor}` : sql``} order by id limit 21`,
    );
    return pagina(r.rows);
  }
}
