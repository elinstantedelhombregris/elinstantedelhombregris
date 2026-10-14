import { sql } from 'drizzle-orm';

import type { Db } from '../client.js';

export class IniciativaMembresiaRepository {
  constructor(private readonly db: Db) {}
  async cambiar(
    id: number,
    uid: number,
    entrar: boolean,
  ): Promise<'cambiada' | 'igual' | 'impedida'> {
    const cte = entrar
      ? sql`cambio as (insert into iniciativa_members(iniciativa_id,user_id,role)
      select id,${uid},'member' from iniciativas where id=${id} and status in('open','in_progress') on conflict(iniciativa_id,user_id) do nothing returning user_id)`
      : sql`cambio as (delete from iniciativa_members m where m.iniciativa_id=${id} and m.user_id=${uid} and m.role<>'owner'
        and not exists(select 1 from iniciativas i where i.id=${id} and i.kind<>'plan' and i.created_by_user_id=${uid})
        and not exists(select 1 from iniciativa_tasks t where t.iniciativa_id=${id} and t.assignee_id=${uid} and t.status not in('done','cancelled')) returning user_id)`;
    const [, r] = await this.db.batch([
      this.db.execute(sql`select id from iniciativas where id=${id} for update`),
      this.db.execute<{ estado: 'cambiada' | 'igual' | 'impedida' }>(sql`with ${cte}, cuenta as (
        update iniciativas set member_count=(select count(*)::int from iniciativa_members where iniciativa_id=${id})+${entrar ? 1 : -1},
          proposed_owner_id=case when proposed_owner_id=${uid} and not ${entrar} then null else proposed_owner_id end,revision=revision+1,updated_at=now()
        where id=${id} and exists(select 1 from cambio) returning id), actividad as (insert into iniciativa_activity(iniciativa_id,actor_id,kind,payload) select id,${uid},${entrar ? 'Integrante ingresó' : 'Integrante salió'},'{}'::json from cuenta returning id)
        select case when exists(select 1 from cambio) then 'cambiada'
          when exists(select 1 from iniciativas where id=${id}) and ${entrar ? sql`exists(select 1 from iniciativa_members where iniciativa_id=${id} and user_id=${uid})` : sql`not exists(select 1 from iniciativa_members where iniciativa_id=${id} and user_id=${uid})`} then 'igual'
          else 'impedida' end as estado`),
    ]);
    return r.rows[0]?.estado ?? 'impedida';
  }
}
