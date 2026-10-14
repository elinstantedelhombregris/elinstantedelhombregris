import { sql } from 'drizzle-orm';
import type { Db } from '../../src/client.js';

const APORTE_MANUAL = 'af81507f-f3fb-4a80-99f3-28f0f2377947';
/** Sólo recibe los IDs propios de una corrida o de una selección de fixtures previamente acreditada. */
export async function limpiarFixturesIdeales(db: Db, usuarios: number[], idLocales: string[] = []) {
  const propios = [...new Set(usuarios.filter((id) => Number.isSafeInteger(id) && id > 0))];
  if (!propios.length) return { usuarios: [], campanas: [], fichas: [], senales: [] };
  const I = sql`select u::uuid from jsonb_array_elements_text(${JSON.stringify(idLocales)}::jsonb) u`;
  const U = sql`select u::int from jsonb_array_elements_text(${JSON.stringify(propios)}::jsonb) u`;
  const [campanas, fichas, fuentes, verificados] = await Promise.all([
    db.execute<{ id: string }>(sql`select id from campanas where creador_id in(${U})`),
    db.execute<{ id: string }>(sql`select id from fichas_futuro where creador_id in(${U})`),
    db.execute<{ id: string }>(
      sql`select s.id_publico as id from senales s where s.user_id in(${U}) or s.id_local in(select u::uuid from jsonb_array_elements_text(${JSON.stringify(idLocales)}::jsonb) u) or exists(select 1 from contribuciones a join campanas c on c.id=a.campana_id where a.senal_id=s.id_publico and c.creador_id in(${U}))`,
    ),
    db.execute<{ id: number }>(
      sql`select id from users where id in(${U}) and ((username ~ '^[0-9a-f-]{36}b?$' and email=username||'@test.local') or (username ~ '^cerrada-[0-9a-f-]{36}$' and name='Cuenta cerrada' and is_active=false))`,
    ),
  ]);
  const existentes = (await db.execute<{ id: number }>(sql`select id from users where id in(${U})`))
    .rows;
  if (verificados.rows.length !== existentes.length)
    throw new Error('La limpieza encontró una cuenta sin marcador de fixture. No borró nada.');
  const cids = campanas.rows.map((c) => c.id),
    fids = fichas.rows.map((f) => f.id),
    sids = fuentes.rows.map((s) => s.id);
  if (sids.includes(APORTE_MANUAL))
    throw new Error('La selección alcanzó el aporte manual. No borró nada.');
  const C = sql`select u::uuid from jsonb_array_elements_text(${JSON.stringify(cids)}::jsonb) u`;
  const F = sql`select u::uuid from jsonb_array_elements_text(${JSON.stringify(fids)}::jsonb) u`;
  const S = sql`select u::uuid from jsonb_array_elements_text(${JSON.stringify(sids)}::jsonb) u`;
  const A = sql`select id from ficha_afirmaciones where ficha_id in(${F})`;
  const B = sql`select id from ficha_alternativas where ficha_id in(${F})`;
  const P = sql`select id from pruebas_territoriales where alternativa_id in(${B})`;
  const K = sql`select id from capacidades where oferente_id in(${U}) or senal_id in(${S})`;
  const ajeno = sql`exists(select 1 from capacidades where senal_id in(${S}) and oferente_id not in(${U}))
    or exists(select 1 from reservas_capacidad r join capacidades c on c.id=r.capacidad_id where (r.capacidad_id in(${K}) or r.ficha_id in(${F}) or r.solicitante_id in(${U})) and (r.solicitante_id not in(${U}) or c.oferente_id not in(${U})))
    or exists(select 1 from contribuciones c join senales s on s.id_publico=c.senal_id where c.campana_id in(${C}) and ((s.user_id is not null and s.user_id not in(${U})) or (s.user_id is null and s.id_local not in(${I}))))
    or exists(select 1 from revisiones_devolucion where campana_id in(${C}) and autor_id not in(${U}))
    or exists(select 1 from fichas_revisiones where ficha_id in(${F}) and editor_id not in(${U}))
    or exists(select 1 from ficha_argumentos where ficha_id in(${F}) and (autor_id not in(${U}) or moderador_id not in(${U})))
    or exists(select 1 from ficha_relaciones where (origen_id in(${F}) or destino_id in(${F})) and autor_id not in(${U}))
    or exists(select 1 from ficha_afirmaciones where ficha_id in(${F}) and creador_id not in(${U}))
    or exists(select 1 from opiniones where afirmacion_id in(${A}) and user_id not in(${U}))
    or exists(select 1 from ficha_alternativas where ficha_id in(${F}) and creador_id not in(${U}))
    or exists(select 1 from pruebas_territoriales where alternativa_id in(${B}) and (creador_id not in(${U}) or responsable_id not in(${U})))
    or exists(select 1 from prueba_eventos where prueba_id in(${P}) and autor_id not in(${U}))
    or exists(select 1 from colaboraciones where ((tipo='campana' and objeto in(${C})) or (tipo='ficha' and objeto in(${F}))) and (creador_id not in(${U}) or usuario_id not in(${U})))`;
  const guardia = await db.execute<{ ajeno: boolean }>(sql`select (${ajeno}) as ajeno`);
  if (guardia.rows[0]?.ajeno)
    throw new Error('Una persona ajena participó en estos objetos. No borró nada.');
  await db.batch([
    // La misma guarda corre dentro de la transacción: un cambio concurrente aborta todo el lote.
    db.execute(sql`select 1/(case when (${ajeno}) then 0 else 1 end)`),
    db.execute(sql`delete from reservas_capacidad where capacidad_id in(${K}) or solicitante_id in(${U}) or ficha_id in(${F})`),
    db.execute(sql`delete from capacidades where id in(${K})`),
    db.execute(sql`delete from ficha_argumentos where ficha_id in(${F}) or autor_id in(${U})`),
    db.execute(
      sql`delete from ficha_relaciones where origen_id in(${F}) or destino_id in(${F}) or autor_id in(${U})`,
    ),
    db.execute(sql`delete from opiniones where user_id in(${U}) or afirmacion_id in(${A})`),
    db.execute(sql`delete from prueba_eventos where prueba_id in(${P}) or autor_id in(${U})`),
    db.execute(sql`delete from pruebas_territoriales where alternativa_id in(${B})`),
    db.execute(sql`delete from ficha_alternativas where ficha_id in(${F})`),
    db.execute(sql`delete from ficha_afirmaciones where ficha_id in(${F})`),
    db.execute(sql`delete from fichas_revisiones where ficha_id in(${F}) or editor_id in(${U})`),
    db.execute(sql`delete from colaboraciones where creador_id in(${U}) or usuario_id in(${U})`),
    db.execute(
      sql`delete from revisiones_devolucion where campana_id in(${C}) or autor_id in(${U})`,
    ),
    db.execute(
      sql`delete from respuestas where pregunta_id in(select id from senales where id_publico in(${S})) or senal_id in(select id from senales where id_publico in(${S}))`,
    ),
    db.execute(
      sql`delete from confirmaciones where senal_id in(select id from senales where id_publico in(${S}))`,
    ),
    db.execute(
      sql`delete from analisis_vectores where fuente='senales' and fuente_id in(select id::text from senales where id_publico in(${S}) union select id_publico::text from senales where id_publico in(${S}))`,
    ),
    db.execute(
      sql`delete from senales where id_publico in(${S}) and id_publico<>${APORTE_MANUAL}::uuid`,
    ),
    db.execute(sql`delete from contribuciones where campana_id in(${C})`),
    db.execute(sql`delete from campanas where id in(${C})`),
    db.execute(sql`delete from fichas_futuro where id in(${F})`),
    db.execute(sql`delete from preferencias_civicas where user_id in(${U})`),
    db.execute(sql`delete from users where id in(${U})`),
  ]);
  return { usuarios: propios, campanas: cids, fichas: fids, senales: sids };
}
