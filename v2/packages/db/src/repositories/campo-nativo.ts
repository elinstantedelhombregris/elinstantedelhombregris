import { createHash } from 'node:crypto';

import { sql } from 'drizzle-orm';

import { pagina, type Fila } from './gestion-iniciativas-base.js';

import type { Db } from '../client.js';
import type { DispositivoCampo, TareaCampoNativa } from '@v2/shared';

const hash = (token: string) => createHash('sha256').update(token).digest('hex');
export class CampoNativoRepository {
  constructor(private readonly db: Db) {}
  async crear(uid: number, nombre: string, token: string) {
    const r = await this.db.execute<{
      id: string;
    }>(sql`insert into dispositivos_campo(usuario_id,nombre,huella,expira)
      select ${uid},${nombre},${hash(token)},now()+interval '30 days' where (select count(*) from dispositivos_campo where usuario_id=${uid} and revocado_en is null and expira>now())<20 returning id`);
    return r.rows[0];
  }
  async listar(uid: number) {
    return (
      await this.db.execute<
        Fila<DispositivoCampo>
      >(sql`select id,nombre,to_char(expira at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as expira,revocado_en is not null as revocado
      from dispositivos_campo where usuario_id=${uid} order by expira desc`)
    ).rows;
  }
  async revocar(uid: number, id: string) {
    return (
      await this.db.execute(
        sql`update dispositivos_campo set revocado_en=coalesce(revocado_en,now()) where usuario_id=${uid} and id=${id}::uuid returning id`,
      )
    ).rows[0];
  }
  async autenticar(token: string) {
    if (!/^[a-f0-9]{64}$/.test(token)) return null;
    return (
      (
        await this.db.execute<{
          id: string;
          usuarioId: number;
        }>(sql`select d.id,d.usuario_id as "usuarioId" from dispositivos_campo d join users u on u.id=d.usuario_id
      where d.huella=${hash(token)} and d.revocado_en is null and d.expira>now() and u.is_active`)
      ).rows[0] ?? null
    );
  }
  async tareas(uid: number, cursor?: number) {
    const r = await this.db.execute<
      Fila<TareaCampoNativa>
    >(sql`select t.id,t.iniciativa_id as "iniciativaId",i.slug,t.title as titulo,coalesce(t.description,'') as alcance,t.revision,t.status as estado,t.escucha,
      f.id as "fichaId",f.contenido->>'titulo' as "fichaTitulo"
      from iniciativa_tasks t join iniciativas i on i.id=t.iniciativa_id left join tareas_fichas tf on tf.tarea_id=t.id left join fichas_futuro f on f.id=tf.ficha_id
      where t.assignee_id=${uid} and t.escucha is not null and t.status in('todo','in_progress','blocked','done') and i.kind<>'plan' and i.status in('open','in_progress','paused')
      and not exists(select 1 from prueba_ejecuciones where tarea_id=t.id) ${cursor ? sql`and t.id>${cursor}` : sql``} order by t.id limit 21`);
    return pagina(r.rows);
  }
  async evidencia(uid: number, id: number) {
    return (
      await this.db.execute<{ id: number; revision: number; retirada: boolean; revisada: boolean }>(
        sql`select id,revision,withdrawn_at is not null as retirada,is_verified as revisada from mission_evidence where id=${id} and submitted_by=${uid}`,
      )
    ).rows[0];
  }
}
