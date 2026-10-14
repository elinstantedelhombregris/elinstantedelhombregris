import { sql } from 'drizzle-orm';

import type { Db } from '../client.js';
import type { VisionCompartida } from '@v2/shared';

export class VisionCompartidaRepository {
  constructor(private readonly db: Db) {}
  async leer(despues?: string, territorioId?: number): Promise<VisionCompartida> {
    const r = await this.db.execute<{ data: VisionCompartida }>(sql`with conjunto as (
      select f.*,g.name as territorio from fichas_futuro f left join geographic_locations g on g.id=f.territorio_id
      where ${territorioId ? sql`f.territorio_id=${territorioId} or exists(select 1 from jsonb_array_elements(coalesce(f.contenido->'cuaderno'->'objetivos','[]'::jsonb)) ob where ob->'territorios' @> ${JSON.stringify([territorioId])}::jsonb)` : sql`true`}
    ), pagina as (select * from conjunto where ${despues ? sql`id>${despues}::uuid` : sql`true`} order by id limit 21), visibles as (select * from pagina order by id limit 20)
    select jsonb_build_object('fichas',coalesce((select jsonb_agg(jsonb_build_object('id',id,'titulo',contenido->>'titulo','revision',revision,'territorio',territorio,'futuro',contenido->>'futuro','proximaTarea',contenido->>'proximaTarea',
      'objetivos',coalesce((select jsonb_agg(jsonb_build_object('id',o->>'id','titulo',o->>'titulo','resultado',o->>'resultado','escala',o->>'escala','horizonte',o->>'horizonte')) from jsonb_array_elements(coalesce(contenido->'cuaderno'->'objetivos','[]'::jsonb)) o),'[]'::jsonb),
      'fuentes',jsonb_array_length(coalesce(contenido->'cuaderno'->'fuentes','[]'::jsonb)), 'sintesis',case when exists(select 1 from jsonb_array_elements(coalesce(contenido->'sintesis'->'acuerdos','[]'::jsonb)) ac cross join lateral jsonb_array_elements_text(ac->'argumentoIds') ref where not exists(select 1 from ficha_argumentos a where a.id=ref::uuid and a.ficha_id=visibles.id and a.retirada_en is null)) then 'requiere_revision' else contenido->'sintesis'->>'estado' end) order by id) from visibles),'[]'::jsonb),
      'total',(select count(*)::int from conjunto),'territorios',(select count(distinct territorio_id)::int from conjunto),
      'objetivos',(select coalesce(sum(jsonb_array_length(coalesce(contenido->'cuaderno'->'objetivos','[]'::jsonb))),0)::int from conjunto),
      'siguiente',case when (select count(*) from pagina)>20 then (select id::text from visibles order by id desc limit 1) else null end,
      'fecha',now()) as data`);
    const data = r.rows[0]?.data;
    if (!data) throw new Error('La lectura conjunta no devolvió una respuesta.');
    return data;
  }
}
