import { createHash } from 'node:crypto';

import { GEOGRAFIA } from '@v2/shared';
import { sql } from 'drizzle-orm';

import {
  apoyosPublicos,
  apoyosVigentes,
  editaApoyos,
  huellaTerritorial,
} from './sintesis-nacional-base.js';

import type { Db } from '../client.js';
import type {
  CrearSintesisNacional,
  EdicionSintesisNacional,
  ListaSintesisNacional,
} from '@v2/shared';

export class SintesisNacionalRepository {
  constructor(private readonly db: Db) {}
  async crear(uid: number, v: CrearSintesisNacional, versionCenso: string): Promise<string | null> {
    const contenido = sql`${JSON.stringify(v.contenido)}::jsonb`;
    const huella = createHash('sha256')
      .update(JSON.stringify({ anteriorId: v.anteriorId, contenido: v.contenido }))
      .digest('hex');
    const r = await this.db.execute<{ id: string }>(sql`with nueva as (
      insert into sintesis_nacionales(autor_id,id_local,anterior_id,contenido,huella,version_geo,version_censo,huella_territorial)
      select ${uid},${v.idLocal}::uuid,${v.anteriorId}::uuid,${contenido},${huella},${GEOGRAFIA.version},${versionCenso},${huellaTerritorial(contenido)}
      where ${apoyosVigentes(contenido)} and ${editaApoyos(contenido, uid)}
      and (${v.anteriorId}::uuid is null or exists(select 1 from sintesis_nacionales where id=${v.anteriorId}::uuid and autor_id=${uid}))
      on conflict(autor_id,id_local) do nothing returning id)
      select id from nueva union all select id from sintesis_nacionales where autor_id=${uid} and id_local=${v.idLocal}::uuid and huella=${huella} limit 1`);
    if (r.rows[0]) return r.rows[0].id;
    // ON CONFLICT puede esperar a otro envío cuya fila no estaba en la instantánea inicial.
    const previo = await this.db.execute<{ id: string }>(
      sql`select id from sintesis_nacionales where autor_id=${uid} and id_local=${v.idLocal}::uuid and huella=${huella}`,
    );
    return previo.rows[0]?.id ?? null;
  }
  async porId(id: string, uid = 0): Promise<EdicionSintesisNacional | null> {
    const c = sql`n.contenido`;
    const r = await this.db.execute<{ data: EdicionSintesisNacional }>(sql`with lectura as (
      select n.*,(${apoyosVigentes(c)} and n.huella_territorial=${huellaTerritorial(c)}) as vigente,${editaApoyos(c, uid)} as editor
      from sintesis_nacionales n where n.id=${id}::uuid
    ) select jsonb_build_object('id',n.id,'anteriorId',n.anterior_id,'huella',n.huella,'creadaEn',n.creada_en,'versionGeo',n.version_geo,'versionCenso',n.version_censo,
      'revisadaEn',n.revisada_en,'autor',a.username,'revisor',rv.username,
      'estado',case when n.retirada_en is not null then 'retirada' when not n.vigente then 'requiere_revision' when n.revisada_en is null then 'pendiente' else 'revisada' end,
      'revisionVencida',(n.contenido->>'proximaRevision')::date<current_date,
      'contenido',case when n.retirada_en is null and n.vigente then n.contenido else null end,
      'apoyos',case when n.retirada_en is null and n.vigente then ${apoyosPublicos(c)} else '[]'::jsonb end,
      'puedoRevisar',n.editor and n.autor_id<>${uid} and n.revisada_en is null and n.retirada_en is null and n.vigente,
      'puedoRetirar',n.retirada_en is null and (n.autor_id=${uid} or n.revisor_id=${uid}),
      'puedoDerivar',n.autor_id=${uid} and n.editor,'consultadaEn',now()
    ) as data from lectura n join users a on a.id=n.autor_id left join users rv on rv.id=n.revisor_id
    where n.revisada_en is not null or n.autor_id=${uid} or n.editor`);
    return r.rows[0]?.data ?? null;
  }
  async listar(uid = 0, despues?: string): Promise<ListaSintesisNacional> {
    const r = await this.db.execute<{ id: string }>(
      sql`select n.id from sintesis_nacionales n where (n.revisada_en is not null or n.autor_id=${uid} or ${editaApoyos(sql`n.contenido`, uid)}) and ${despues ? sql`n.id>${despues}::uuid` : sql`true`} order by n.id limit 21`,
    );
    const ediciones = await Promise.all(r.rows.slice(0, 20).map((x) => this.porId(x.id, uid)));
    return {
      ediciones: ediciones.filter((e): e is EdicionSintesisNacional => e !== null),
      siguiente: r.rows.length > 20 ? (r.rows[19]?.id ?? null) : null,
    };
  }
  async actuar(id: string, uid: number, accion: 'revisar' | 'retirar'): Promise<boolean> {
    const r = await this.db.execute<{ id: string }>(
      accion === 'retirar'
        ? sql`update sintesis_nacionales set retirada_en=coalesce(retirada_en,now()) where id=${id}::uuid and (autor_id=${uid} or revisor_id=${uid}) returning id`
        : sql`update sintesis_nacionales n set revisor_id=${uid},revisada_en=coalesce(revisada_en,now())
        where id=${id}::uuid and autor_id<>${uid} and (revisor_id is null or revisor_id=${uid}) and retirada_en is null
        and (contenido->>'proximaRevision')::date>=current_date
        and n.huella_territorial=${huellaTerritorial(sql`n.contenido`)} and ${apoyosVigentes(sql`n.contenido`)} and ${editaApoyos(sql`n.contenido`, uid)} returning id`,
    );
    return r.rows.length === 1;
  }
}
