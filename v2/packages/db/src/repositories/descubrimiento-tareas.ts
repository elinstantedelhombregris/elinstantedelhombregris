import { sql } from 'drizzle-orm';

import { pagina, type Fila } from './gestion-iniciativas-base.js';

import type { Db } from '../client.js';
import type {
  FichaElegible,
  TareaDisponible,
  fichasEditablesQuerySchema,
  tareasDisponiblesQuerySchema,
} from '@v2/shared';
import type { z } from 'zod';

export class DescubrimientoTareasRepository {
  constructor(private readonly db: Db) {}

  async disponibles(q: z.infer<typeof tareasDisponiblesQuerySchema>) {
    const r = await this.db.execute<Fila<TareaDisponible>>(sql`
      select t.id,t.title as titulo,coalesce(t.description,'') as alcance,t.resources as recursos,
        coalesce(to_char(t.due_date at time zone 'UTC','YYYY-MM-DD'),'') as fecha,
        i.title as "iniciativaTitulo",i.slug as "iniciativaSlug",f.id as "fichaId",f.contenido->>'titulo' as "fichaTitulo"
      from iniciativa_tasks t join iniciativas i on i.id=t.iniciativa_id
      left join tareas_fichas tf on tf.tarea_id=t.id left join fichas_futuro f on f.id=tf.ficha_id
      where i.kind<>'plan' and i.status in('open','in_progress') and t.status='todo' and t.assignee_id is null
        and not exists(select 1 from prueba_ejecuciones e where e.tarea_id=t.id)
        ${q.cursor ? sql`and t.id>${q.cursor}` : sql``}
        ${q.fichaId ? sql`and f.id=${q.fichaId}::uuid` : sql``}
        and strpos(lower(concat_ws(' ',t.title,t.description,i.title)),lower(${q.buscar}))>0
      order by t.id limit 21`);
    return pagina(r.rows);
  }

  async fichasEditables(uid: number, q: z.infer<typeof fichasEditablesQuerySchema>) {
    const r = await this.db.execute<Fila<FichaElegible>>(sql`
      select f.id,f.contenido->>'titulo' as titulo,g.name as territorio
      from fichas_futuro f left join geographic_locations g on g.id=f.territorio_id
      where (f.creador_id=${uid} or exists(select 1 from colaboraciones c where c.tipo='ficha' and c.objeto=f.id
        and c.usuario_id=${uid} and c.rol='editor' and c.aceptada_en is not null and c.revocada_en is null))
        ${q.cursor ? sql`and f.id>${q.cursor}::uuid` : sql``}
        and strpos(lower(f.contenido->>'titulo'),lower(${q.buscar}))>0
      order by f.id limit 21`);
    const items = r.rows.slice(0, 20);
    return { items, siguiente: r.rows.length > 20 ? (items.at(-1)?.id ?? null) : null };
  }
}
