import { createHash } from 'node:crypto';

import { sql } from 'drizzle-orm';

import { editorFichaSql } from './deliberacion-ficha.js';

import type { Db } from '../client.js';
import type { RelacionEntreFichas, relacionEntreFichasSchema } from '@v2/shared';
import type { z } from 'zod';

export class RelacionesFichaRepository {
  constructor(private readonly db: Db) {}
  async leer(
    id: string,
    uid?: number,
  ): Promise<{ relaciones: RelacionEntreFichas[]; completa: boolean }> {
    const r = await this.db.execute<{
      [K in keyof RelacionEntreFichas]: RelacionEntreFichas[K];
    }>(sql`select r.id,r.origen_id as "origenId",o.contenido->>'titulo' as "origenTitulo",
      r.destino_id as "destinoId",d.contenido->>'titulo' as "destinoTitulo",r.tipo,r.justificacion,r.fuente,
      ${uid ? sql`(o.creador_id=${uid} or exists(select 1 from colaboraciones c where c.tipo='ficha' and c.objeto=o.id and c.usuario_id=${uid} and c.rol='editor' and c.aceptada_en is not null and c.revocada_en is null))` : sql`false`} as "puedoRetirar"
      from ficha_relaciones r join fichas_futuro o on o.id=r.origen_id join fichas_futuro d on d.id=r.destino_id
      where r.retirada_en is null and (r.origen_id=${id}::uuid or r.destino_id=${id}::uuid) order by r.creada_en,r.id limit 201`);
    return { relaciones: r.rows.slice(0, 200), completa: r.rows.length <= 200 };
  }
  async crear(id: string, uid: number, v: z.infer<typeof relacionEntreFichasSchema>) {
    const huella = createHash('sha256')
      .update(JSON.stringify({ id, ...v }))
      .digest('hex');
    const r = await this.db.execute<{
      id: string;
    }>(sql`insert into ficha_relaciones(origen_id,destino_id,autor_id,id_local,tipo,justificacion,fuente,huella)
      select ${id}::uuid,${v.destinoId}::uuid,${uid},${v.idLocal}::uuid,${v.tipo},${v.justificacion},${v.fuente},${huella}
      where ${id}::uuid<>${v.destinoId}::uuid and ${editorFichaSql(id, uid)} and exists(select 1 from fichas_futuro where id=${v.destinoId}::uuid)
      on conflict(autor_id,id_local) do nothing returning id`);
    if (r.rows[0]) return r.rows[0].id;
    const previo = await this.db.execute<{ id: string }>(
      sql`select id from ficha_relaciones where autor_id=${uid} and id_local=${v.idLocal}::uuid and huella=${huella} and retirada_en is null and ${editorFichaSql(id, uid)}`,
    );
    return previo.rows[0]?.id ?? null;
  }
  async retirar(id: string, uid: number) {
    const r = await this.db.execute<{ id: string }>(
      sql`update ficha_relaciones r set retirada_en=now(),justificacion='',fuente=null where id=${id}::uuid and exists(select 1 from fichas_futuro f where f.id=r.origen_id and (f.creador_id=${uid} or exists(select 1 from colaboraciones c where c.tipo='ficha' and c.objeto=f.id and c.usuario_id=${uid} and c.rol='editor' and c.aceptada_en is not null and c.revocada_en is null))) returning id`,
    );
    return r.rows.length === 1;
  }
}
