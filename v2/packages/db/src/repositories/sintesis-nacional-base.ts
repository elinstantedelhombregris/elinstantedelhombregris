import { sql, type SQL } from 'drizzle-orm';

/** Aliases f/r confined to each subquery. Same guards on create, review and every public read. */
export const apoyosVigentes = (contenido: SQL): SQL => sql`not exists (
  select 1 from jsonb_array_elements(${contenido}->'referencias') r
  left join fichas_futuro f on f.id=(r->>'fichaId')::uuid
  where f.id is null or f.revision<>(r->>'revision')::int
  or not exists(select 1 from jsonb_array_elements(coalesce(f.contenido->'cuaderno'->'objetivos','[]'::jsonb)) o where o->>'id'=r->>'objetivoId')
  or (r->>'tipo'='acuerdo_participantes' and (coalesce(f.contenido->'sintesis'->>'estado','')<>'publicada' or f.contenido->'proceso' is null or jsonb_array_length(coalesce(f.contenido->'sintesis'->'acuerdos','[]'::jsonb))=0))
  or exists(select 1 from jsonb_array_elements(coalesce(f.contenido->'sintesis'->'acuerdos','[]'::jsonb)) a cross join lateral jsonb_array_elements_text(a->'argumentoIds') ref where not exists(select 1 from ficha_argumentos fa where fa.id=ref::uuid and fa.ficha_id=f.id and fa.retirada_en is null))
  or exists(select 1 from jsonb_array_elements(coalesce(f.contenido->'vinculos','[]'::jsonb)) v where not exists(select 1 from senales s where s.id_publico=(v->>'senalId')::uuid and s.estado<>'retirada' and s.retenida_en is null and s.cesion_licencia))
  or (r->'resultadoCampo'<>'null'::jsonb and not exists(select 1 from mission_evidence e join tareas_fichas tf on tf.tarea_id=e.task_id where tf.ficha_id=f.id and e.id=(r->'resultadoCampo'->>'id')::int and e.revision=(r->'resultadoCampo'->>'revision')::int and e.is_verified and e.verified_by is not null and e.verified_by<>e.submitted_by and e.withdrawn_at is null))
)`;
export const editaApoyos = (contenido: SQL, uid: number): SQL => sql`not exists (
  select 1 from jsonb_array_elements(${contenido}->'referencias') r
  where not exists(select 1 from fichas_futuro f where f.id=(r->>'fichaId')::uuid and (f.creador_id=${uid} or exists(select 1 from colaboraciones c where c.tipo='ficha' and c.objeto=f.id and c.usuario_id=${uid} and c.rol='editor' and c.aceptada_en is not null and c.revocada_en is null)))
)`;
export const apoyosPublicos = (
  contenido: SQL,
): SQL => sql`coalesce((select jsonb_agg(jsonb_build_object(
  'fichaId',f.id,'objetivoId',o->>'id','titulo',f.contenido->>'titulo','territorio',g.name,'objetivo',o,
  'fuentes',coalesce((select jsonb_agg(fu) from jsonb_array_elements(coalesce(f.contenido->'cuaderno'->'fuentes','[]'::jsonb)) fu where o->'fuenteIds' @> jsonb_build_array(fu->>'id') or o->>'fuenteCompetencia'=fu->>'id'),'[]'::jsonb),
  'sintesis',case when r->>'tipo'='acuerdo_participantes' then f.contenido->'sintesis' else null end,
  'resultado',(select jsonb_build_object('titulo',e.title,'texto',e.body,'revision',e.revision,'nota',e.review_note) from mission_evidence e where e.id=(r->'resultadoCampo'->>'id')::int)
) order by orden) from jsonb_array_elements(${contenido}->'referencias') with ordinality refs(r,orden)
join fichas_futuro f on f.id=(r->>'fichaId')::uuid left join geographic_locations g on g.id=f.territorio_id
cross join lateral jsonb_array_elements(f.contenido->'cuaderno'->'objetivos') o where o->>'id'=r->>'objetivoId'),'[]'::jsonb)`;

/** El catálogo operativo aún es vivo: cualquier cambio en unidades citadas exige otra edición. */
export const huellaTerritorial = (
  contenido: SQL,
): SQL => sql`(select md5(coalesce(jsonb_agg(to_jsonb(g)-'created_at' order by g.id),'[]'::jsonb)::text) from geographic_locations g where g.id in (
  select f.territorio_id from jsonb_array_elements(${contenido}->'referencias') r join fichas_futuro f on f.id=(r->>'fichaId')::uuid
  union select (u #>> '{}')::int from jsonb_array_elements(${contenido}->'referencias') r join fichas_futuro f on f.id=(r->>'fichaId')::uuid cross join lateral jsonb_path_query(f.contenido,'$.cuaderno.objetivos[*].territorios[*]') u
  union select (u #>> '{}')::int from jsonb_array_elements(${contenido}->'referencias') r join fichas_futuro f on f.id=(r->>'fichaId')::uuid cross join lateral jsonb_path_query(f.contenido,'$.cuaderno.fuentes[*].territorioId') u
))`;
