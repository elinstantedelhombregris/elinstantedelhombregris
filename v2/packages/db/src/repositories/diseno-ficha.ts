import { analizarOpiniones, type RespuestaParaAnalisis } from '@v2/civic-core';
import { and, desc, eq, inArray, isNull, sql } from 'drizzle-orm';

import {
  fichaAfirmaciones,
  fichaAlternativas,
  opiniones,
  pruebaEventos,
  pruebasTerritoriales,
} from '../schema/diseno.js';

import { EjecucionRepository } from './ejecucion.js';

import type { Db } from '../client.js';
import type { DisenoFicha, alternativaSchema } from '@v2/shared';
import type { z } from 'zod';

export class DisenoFichaRepository {
  constructor(private readonly db: Db) {}
  async leer(
    fichaId: string,
    uid?: number,
  ): Promise<DisenoFicha & { analisisOpiniones: ReturnType<typeof analizarOpiniones> }> {
    const [afirmaciones, alternativas] = await Promise.all([
      this.db
        .select()
        .from(fichaAfirmaciones)
        .where(and(eq(fichaAfirmaciones.fichaId, fichaId), isNull(fichaAfirmaciones.retiradaEn)))
        .orderBy(fichaAfirmaciones.creadaEn)
        .limit(100),
      this.db
        .select()
        .from(fichaAlternativas)
        .where(eq(fichaAlternativas.fichaId, fichaId))
        .orderBy(fichaAlternativas.creadaEn)
        .limit(100),
    ]);
    const objeciones = await this.db.execute<{ id: string }>(
      sql`select id from ficha_argumentos where ficha_id=${fichaId}::uuid and tipo='objecion' and retirada_en is null and id in(select (x->>'objecionId')::uuid from jsonb_array_elements(${JSON.stringify(alternativas.flatMap((a) => (a.contenido.revisionDe ? [a.contenido.revisionDe] : [])))}::jsonb) x)`,
    );
    const activas = new Set(objeciones.rows.map((a) => a.id));
    const ids = afirmaciones.map((a) => a.id);
    const totales = ids.length
      ? await this.db
          .select({
            afirmacion: opiniones.afirmacionId,
            respuestas: sql<number>`count(*) filter(where ${opiniones.valor} is not null)::int`,
            acuerdo: sql<number>`count(*) filter(where ${opiniones.valor}='acuerdo')::int`,
            desacuerdo: sql<number>`count(*) filter(where ${opiniones.valor}='desacuerdo')::int`,
            paso: sql<number>`count(*) filter(where ${opiniones.valor}='paso')::int`,
          })
          .from(opiniones)
          .where(inArray(opiniones.afirmacionId, ids))
          .groupBy(opiniones.afirmacionId)
      : [];
    const [cuentas] = ids.length
      ? await this.db
          .select({ n: sql<number>`count(distinct ${opiniones.userId})::int` })
          .from(opiniones)
          .where(inArray(opiniones.afirmacionId, ids))
      : [];
    const cantidad = cuentas?.n ?? 0;
    const propios =
      uid && ids.length
        ? await this.db
            .select({ afirmacion: opiniones.afirmacionId, valor: opiniones.valor })
            .from(opiniones)
            .where(and(inArray(opiniones.afirmacionId, ids), eq(opiniones.userId, uid)))
        : [];
    // El conteo completo vive en SQL. Nunca cargamos una matriz ilimitada en una función web.
    const votos =
      ids.length && cantidad <= 400
        ? await this.db
            .select({
              afirmacion: opiniones.afirmacionId,
              usuario: opiniones.userId,
              valor: opiniones.valor,
            })
            .from(opiniones)
            .where(inArray(opiniones.afirmacionId, ids))
            .limit(40000)
        : [];
    const pruebas = alternativas.length
      ? await this.db
          .select()
          .from(pruebasTerritoriales)
          .where(
            inArray(
              pruebasTerritoriales.alternativaId,
              alternativas.map((a) => a.id),
            ),
          )
          .orderBy(pruebasTerritoriales.creadaEn)
          .limit(100)
      : [];
    const ejecuciones = await new EjecucionRepository(this.db).dePruebas(
      pruebas.map((p) => p.id),
      uid,
    );
    const eventos = pruebas.length
      ? await this.db
          .select({
            pruebaId: pruebaEventos.pruebaId,
            estado: pruebaEventos.estado,
            observacion: pruebaEventos.observacion,
            evidencia: pruebaEventos.evidencia,
            fecha: pruebaEventos.fecha,
          })
          .from(pruebaEventos)
          .where(
            inArray(
              pruebaEventos.pruebaId,
              pruebas.map((p) => p.id),
            ),
          )
          .orderBy(desc(pruebaEventos.fecha))
      : [];
    const paraAnalisis: RespuestaParaAnalisis[] = votos.map((v) => ({
      participante: String(v.usuario),
      afirmacion: v.afirmacion,
      valor:
        v.valor === 'acuerdo' || v.valor === 'desacuerdo' || v.valor === 'paso' ? v.valor : null,
    }));
    return {
      analisisOpiniones:
        cantidad > 400
          ? {
              ...analizarOpiniones([]),
              participantes: cantidad,
              afirmaciones: ids.length,
              motivo:
                'Este conjunto requiere un cálculo desacoplado. Los apoyos generales siguen disponibles.',
            }
          : analizarOpiniones(paraAnalisis),
      afirmaciones: afirmaciones.map((a) => {
        const r = totales.find((v) => v.afirmacion === a.id);
        const respuestas = r?.respuestas ?? 0;
        const propio = propios.find((v) => v.afirmacion === a.id);
        return {
          id: a.id,
          texto: a.texto,
          respuestas,
          acuerdo: respuestas >= 5 ? (r?.acuerdo ?? 0) : null,
          desacuerdo: respuestas >= 5 ? (r?.desacuerdo ?? 0) : null,
          paso: respuestas >= 5 ? (r?.paso ?? 0) : null,
          miRespuesta: propio?.valor ?? null,
          miExpuesta: Boolean(propio),
          puedoRetirar: a.creadorId === uid,
        };
      }),
      alternativas: alternativas.map((a) => {
        const { idLocal: _recibo, detalle, revisionDe: revision, ...contenido } = a.contenido;
        return {
          id: a.id,
          ...contenido,
          ...(detalle ? { detalle } : {}),
          ...(revision ? { revisionDe: revision } : {}),
          ...(revision && !activas.has(revision.objecionId)
            ? { revisionDe: { ...revision, motivo: '' }, revisionPendiente: true }
            : {}),
        };
      }),
      pruebas: pruebas.map((p) => {
        const ejecucion = ejecuciones.find((e) => e.pruebaId === p.id)?.ejecucion;
        return {
          ...(ejecucion ? { ejecucion } : {}),
          id: p.id,
          titulo: p.titulo,
          alternativaId: p.alternativaId,
          plazo: p.plazo,
          alcance: p.alcance,
          responsableNombre: p.responsableNombre,
          estado: p.estado,
          revision: p.revision,
          puedoGestionar:
            p.creadorId === uid ||
            p.responsableId === uid ||
            (p.estado === 'propuesta' &&
              ejecuciones.some((e) => e.pruebaId === p.id && e.puedoAceptar)),
          puedoRevisar: Boolean(
            uid &&
            uid !== p.creadorId &&
            uid !== p.responsableId &&
            p.estado === 'resultado_observado',
          ),
          eventos: eventos
            .filter((e) => e.pruebaId === p.id)
            .map(({ pruebaId: _id, fecha, ...e }) => ({ ...e, fecha: fecha.toISOString() })),
        };
      }),
    };
  }
  async afirmar(fichaId: string, uid: number, idLocal: string, texto: string) {
    const [r] = await this.db
      .insert(fichaAfirmaciones)
      .values({ fichaId, creadorId: uid, idLocal, texto })
      .onConflictDoNothing()
      .returning({ id: fichaAfirmaciones.id });
    if (r) return r.id;
    const [previa] = await this.db
      .select({ id: fichaAfirmaciones.id })
      .from(fichaAfirmaciones)
      .where(
        and(
          eq(fichaAfirmaciones.creadorId, uid),
          eq(fichaAfirmaciones.idLocal, idLocal),
          eq(fichaAfirmaciones.fichaId, fichaId),
          eq(fichaAfirmaciones.texto, texto),
          isNull(fichaAfirmaciones.retiradaEn),
        ),
      );
    return previa?.id;
  }
  async retirarAfirmacion(id: string, uid: number) {
    const r = await this.db
      .update(fichaAfirmaciones)
      .set({ retiradaEn: new Date(), texto: '' })
      .where(and(eq(fichaAfirmaciones.id, id), eq(fichaAfirmaciones.creadorId, uid)))
      .returning({ id: fichaAfirmaciones.id });
    return r.length === 1;
  }
  async exponer(id: string, uid: number): Promise<boolean> {
    const r = await this.db.execute<{
      id: string;
    }>(sql`insert into opiniones(afirmacion_id,user_id,valor)
      select id,${uid},null from ficha_afirmaciones where id=${id}::uuid and retirada_en is null
      on conflict(afirmacion_id,user_id) do update set mostrada_en=opiniones.mostrada_en returning id`);
    return r.rows.length === 1;
  }
  async responder(id: string, uid: number, valor: 'acuerdo' | 'desacuerdo' | 'paso') {
    const r = await this.db.execute<{
      id: string;
    }>(sql`insert into opiniones(afirmacion_id,user_id,valor,respondida_en)
      select id,${uid},${valor},now() from ficha_afirmaciones where id=${id}::uuid and retirada_en is null
      on conflict(afirmacion_id,user_id) do update set valor=excluded.valor,respondida_en=excluded.respondida_en returning id`);
    return r.rows.length === 1;
  }
  async alternativa(fichaId: string, uid: number, contenido: z.infer<typeof alternativaSchema>) {
    const revision = contenido.revisionDe;
    const r = await this.db.execute<{
      id: string;
    }>(sql`insert into ficha_alternativas(ficha_id,creador_id,id_local,contenido)
      select ${fichaId}::uuid,${uid},${contenido.idLocal}::uuid,${JSON.stringify(contenido)}::jsonb
      where exists(select 1 from fichas_futuro where id=${fichaId}::uuid)
      ${
        revision
          ? sql`and exists(select 1 from ficha_alternativas a where a.id=${revision.anteriorId}::uuid and a.ficha_id=${fichaId}::uuid)
      and exists(select 1 from ficha_argumentos a where a.id=${revision.objecionId}::uuid and a.ficha_id=${fichaId}::uuid and a.tipo='objecion' and a.retirada_en is null)`
          : sql``
      }
      on conflict(creador_id,id_local) do nothing returning id`);
    if (r.rows[0]) return r.rows[0].id;
    const [p] = await this.db
      .select({ id: fichaAlternativas.id })
      .from(fichaAlternativas)
      .where(
        and(
          eq(fichaAlternativas.creadorId, uid),
          eq(fichaAlternativas.idLocal, contenido.idLocal),
          eq(fichaAlternativas.fichaId, fichaId),
          sql`${fichaAlternativas.contenido}=${JSON.stringify(contenido)}::jsonb`,
        ),
      );
    return p?.id;
  }
}
