import { createHash } from 'node:crypto';

import { and, asc, eq, isNull, sql } from 'drizzle-orm';

import { fichaArgumentos } from '../schema/deliberacion.js';

import { ColaboracionRepository } from './colaboracion.js';

import type { Db } from '../client.js';
import type { fichasFuturo } from '../schema/fichas.js';
import type { LecturaDeliberacion, argumentoFichaSchema } from '@v2/shared';
import type { z } from 'zod';

export const editorFichaSql = (id: string, uid: number) =>
  sql`exists(select 1 from fichas_futuro f where f.id=${id}::uuid and (f.creador_id=${uid} or exists(select 1 from colaboraciones c where c.tipo='ficha' and c.objeto=f.id and c.usuario_id=${uid} and c.aceptada_en is not null and c.revocada_en is null and c.rol='editor')))`;
export class DeliberacionFichaRepository {
  constructor(private readonly db: Db) {}
  async leer(id: string, uid?: number, despues?: string): Promise<LecturaDeliberacion> {
    const [filas, cuenta, editor] = await Promise.all([
      this.db
        .select()
        .from(fichaArgumentos)
        .where(
          and(
            eq(fichaArgumentos.fichaId, id),
            despues
              ? sql`(${fichaArgumentos.creadaEn},${fichaArgumentos.id}) > (select creada_en,id from ficha_argumentos where id=${despues}::uuid and ficha_id=${id}::uuid)`
              : undefined,
          ),
        )
        .orderBy(asc(fichaArgumentos.creadaEn), asc(fichaArgumentos.id))
        .limit(201),
      this.db.execute<{ total: number; participantes: number }>(
        sql`select count(*)::int as total,count(distinct autor_id) filter(where retirada_en is null)::int as participantes from ficha_argumentos where ficha_id=${id}::uuid`,
      ),
      uid ? new ColaboracionRepository(this.db).puedeEditar('ficha', id, uid) : false,
    ]);
    return {
      total: cuenta.rows[0]?.total ?? 0,
      participantes: cuenta.rows[0]?.participantes ?? 0,
      completa: filas.length <= 200,
      argumentos: filas.slice(0, 200).map((a) => ({
        esMio: a.autorId === uid,
        id: a.id,
        tipo: a.tipo,
        texto: a.retiradaEn ? null : a.texto,
        firma: a.retiradaEn ? null : a.firma,
        fecha: a.creadaEn.toISOString(),
        respondeA: a.respondeA,
        alternativaId: a.alternativaId,
        fuenteIds: a.retiradaEn ? [] : a.fuenteIds,
        retirado: a.retiradaEn !== null,
        motivo: a.motivo,
        puedoRetirar: !a.retiradaEn && (a.autorId === uid || editor),
      })),
    };
  }
  async proponer(id: string, uid: number, v: z.infer<typeof argumentoFichaSchema>) {
    const huella = createHash('sha256')
      .update(JSON.stringify({ id, ...v }))
      .digest('hex');
    // Reintentar luego del cierre recupera el recibo, pero nunca recrea texto retirado.
    const [previo] = await this.db
      .select({ id: fichaArgumentos.id, huella: fichaArgumentos.huella })
      .from(fichaArgumentos)
      .where(and(eq(fichaArgumentos.autorId, uid), eq(fichaArgumentos.idLocal, v.idLocal)));
    if (previo) return previo.huella === huella ? previo.id : null;
    const r = await this.db.execute<{
      id: string;
    }>(sql`insert into ficha_argumentos(ficha_id,autor_id,id_local,tipo,texto,firma,responde_a,alternativa_id,fuente_ids,huella)
      select f.id,${uid},${v.idLocal}::uuid,${v.tipo},${v.texto},${v.firma},${v.respondeA}::uuid,${v.alternativaId}::uuid,${JSON.stringify(v.fuenteIds)}::jsonb,${huella}
      from fichas_futuro f where f.id=${id}::uuid and f.contenido->'proceso' is not null
      and (f.contenido->'proceso'->>'inicio')::date <= (now() at time zone 'UTC')::date and (f.contenido->'proceso'->>'cierre')::date >= (now() at time zone 'UTC')::date
      and (${v.respondeA}::uuid is null or exists(select 1 from ficha_argumentos a where a.id=${v.respondeA}::uuid and a.ficha_id=f.id and a.retirada_en is null))
      and (${v.alternativaId}::uuid is null or exists(select 1 from ficha_alternativas a where a.id=${v.alternativaId}::uuid and a.ficha_id=f.id))
      and not exists(select 1 from jsonb_array_elements_text(${JSON.stringify(v.fuenteIds)}::jsonb) ref where not exists(select 1 from jsonb_array_elements(coalesce(f.contenido->'cuaderno'->'fuentes','[]'::jsonb)) src where src->>'id'=ref))
      on conflict(autor_id,id_local) do nothing returning id`);
    if (r.rows[0]) return r.rows[0].id;
    const [concurrente] = await this.db
      .select({ id: fichaArgumentos.id, huella: fichaArgumentos.huella })
      .from(fichaArgumentos)
      .where(and(eq(fichaArgumentos.autorId, uid), eq(fichaArgumentos.idLocal, v.idLocal)));
    return concurrente?.huella === huella ? concurrente.id : null;
  }
  async retirar(id: string, uid: number, motivo: string) {
    const [a] = await this.db
      .select({ ficha: fichaArgumentos.fichaId })
      .from(fichaArgumentos)
      .where(eq(fichaArgumentos.id, id));
    if (!a) return false;
    const r = await this.db.execute<{
      id: string;
    }>(sql`update ficha_argumentos set retirada_en=coalesce(retirada_en,now()),texto='',firma='',fuente_ids='[]'::jsonb,motivo=coalesce(motivo,${motivo}),moderador_id=coalesce(moderador_id,${uid})
      where id=${id}::uuid and ((${motivo}='autoria' and autor_id=${uid}) or (${motivo}<>'autoria' and ${editorFichaSql(a.ficha, uid)})) returning id`);
    return r.rows.length === 1;
  }
  async referenciasSintesisValidas(
    contenido: typeof fichasFuturo.$inferSelect.contenido,
    id?: string,
  ) {
    if (!contenido.sintesis) return true;
    if (!contenido.proceso) return false;
    const ids = [...new Set(contenido.sintesis.acuerdos.flatMap((a) => a.argumentoIds))];
    if (!ids.length) return true;
    if (!id) return false;
    const r = await this.db
      .select({ id: fichaArgumentos.id })
      .from(fichaArgumentos)
      .where(
        and(
          eq(fichaArgumentos.fichaId, id),
          isNull(fichaArgumentos.retiradaEn),
          sql`${fichaArgumentos.id} in (select value::uuid from jsonb_array_elements_text(${JSON.stringify(ids)}::jsonb))`,
        ),
      );
    return r.length === ids.length;
  }
}
