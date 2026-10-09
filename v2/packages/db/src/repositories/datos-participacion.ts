import { and, asc, eq, gt, sql } from 'drizzle-orm';

import { campanas, contribuciones } from '../schema/campanas.js';
import { fichasFuturo } from '../schema/fichas.js';
import { senales } from '../schema/senales.js';

import {
  condicionesParticipacion,
  campanaPublicada,
  contratoPublicoCampana,
  revisionPublicaCampana,
  estadoPublicoCampana,
} from './participacion-consulta.js';

import type { Db } from '../client.js';
import type { ConsultaParticipacion } from '@v2/shared';

export class DatosParticipacionRepository {
  constructor(private readonly db: Db) {}
  async contextoPagina(
    q: Partial<ConsultaParticipacion>,
    corte: Date,
    tipo: 'campanas' | 'fichas',
    cursor: string | null,
  ) {
    if (tipo === 'campanas') {
      const filas = await this.db
        .select({
          id: campanas.id,
          slug: campanas.slug,
          estado: estadoPublicoCampana,
          revision: revisionPublicaCampana,
          territorios: sql<number[]>`(${contratoPublicoCampana})->'territorios'`,
          temas: sql<string[]>`(${contratoPublicoCampana})->'temas'`,
        })
        .from(campanas)
        .where(
          and(
            campanaPublicada,
            sql`${campanas.creadaEn}<=${corte.toISOString()}`,
            ...(cursor ? [gt(campanas.id, cursor)] : []),
            ...(q.campana ? [eq(campanas.id, q.campana)] : []),
            ...(q.territorio
              ? [
                  sql`(${contratoPublicoCampana})->'territorios' @> ${JSON.stringify([q.territorio])}::jsonb`,
                ]
              : []),
            ...(q.tema
              ? [sql`(${contratoPublicoCampana})->'temas' @> ${JSON.stringify([q.tema])}::jsonb`]
              : []),
          ),
        )
        .orderBy(asc(campanas.id))
        .limit(101);
      const datos = filas.slice(0, 100);
      return { datos, siguiente: filas.length > 100 ? (datos.at(-1)?.id ?? null) : null };
    }
    const filas = await this.db
      .select({
        id: fichasFuturo.id,
        revision: fichasFuturo.revision,
        contenido: sql<{
          territorioId: number | null;
          temas: string[];
          vinculos: unknown[];
        }>`jsonb_build_object('territorioId',${fichasFuturo.territorioId},'temas',${fichasFuturo.contenido}->'temas','vinculos',${fichasFuturo.contenido}->'vinculos')`,
        actualizadaEn: fichasFuturo.actualizadaEn,
      })
      .from(fichasFuturo)
      .where(
        and(
          sql`${fichasFuturo.creadaEn}<=${corte.toISOString()}`,
          ...(cursor ? [gt(fichasFuturo.id, cursor)] : []),
          ...(q.territorio ? [eq(fichasFuturo.territorioId, q.territorio)] : []),
          ...(q.campana ? [sql`${fichasFuturo.contenido}->>'campanaId'=${q.campana}`] : []),
          ...(q.tema
            ? [sql`${fichasFuturo.contenido}->'temas' @> ${JSON.stringify([q.tema])}::jsonb`]
            : []),
        ),
      )
      .orderBy(asc(fichasFuturo.id))
      .limit(101);
    const datos = filas
      .slice(0, 100)
      .map((f) => ({ ...f, actualizadaEn: f.actualizadaEn.toISOString() }));
    return { datos, siguiente: filas.length > 100 ? (datos.at(-1)?.id ?? null) : null };
  }
  async pagina(q: ConsultaParticipacion, corte: Date) {
    const condiciones = condicionesParticipacion(q, corte);
    const [conteos, filas] = await Promise.all([
      this.db
        .select({
          total: sql<number>`count(*)::int`,
          textoOmitido: sql<number>`count(*) filter(where not ${senales.cesionLicencia})::int`,
        })
        .from(senales)
        .where(and(...condiciones)),
      this.db
        .select({
          id: senales.idPublico,
          tipo: senales.tipo,
          clase: senales.clase,
          estado: senales.estado,
          tema: senales.tema,
          texto: sql<
            string | null
          >`case when ${senales.cesionLicencia} then ${senales.texto} else null end`,
          textoOmitido: sql<
            string | null
          >`case when not ${senales.cesionLicencia} then 'sin cesión de licencia' else null end`,
          provinceId: senales.provinceId,
          cityId: senales.cityId,
          lat: sql<
            number | null
          >`case when ${senales.precision} in ('province','city','neighborhood') then null else round(${senales.lat}::numeric,2)::float end`,
          lng: sql<
            number | null
          >`case when ${senales.precision} in ('province','city','neighborhood') then null else round(${senales.lng}::numeric,2)::float end`,
          precisionOrigen: senales.precision,
          creadaEn: senales.creadaEn,
          campanaId: contribuciones.campanaId,
          edicion: contribuciones.edicion,
          modo: contribuciones.modo,
        })
        .from(senales)
        .leftJoin(contribuciones, eq(senales.idPublico, contribuciones.senalId))
        .where(and(...condiciones, ...(q.cursor ? [gt(senales.idPublico, q.cursor)] : [])))
        .orderBy(asc(senales.idPublico))
        .limit(q.limite + 1),
    ]);
    const hayMas = filas.length > q.limite;
    const registros = filas.slice(0, q.limite).map((f) => ({
      ...f,
      creadaEn: f.creadaEn.toISOString(),
      precisionExportada:
        f.lat === null ? 'ámbito territorial sin punto' : 'coordenadas redondeadas a dos decimales',
    }));
    return {
      registros,
      total: conteos[0]?.total ?? 0,
      textoOmitido: conteos[0]?.textoOmitido ?? 0,
      siguiente: hayMas ? (registros.at(-1)?.id ?? null) : null,
    };
  }
  async contexto(q: Partial<ConsultaParticipacion>, corte: Date) {
    const [cs, fs] = await Promise.all([
      this.db
        .select({
          id: campanas.id,
          slug: campanas.slug,
          estado: estadoPublicoCampana,
          revision: revisionPublicaCampana,
          territorios: sql<number[]>`(${contratoPublicoCampana})->'territorios'`,
          temas: sql<string[]>`(${contratoPublicoCampana})->'temas'`,
        })
        .from(campanas)
        .where(
          and(
            campanaPublicada,
            sql`${campanas.creadaEn}<=${corte.toISOString()}`,
            ...(q.territorio
              ? [
                  sql`(${contratoPublicoCampana})->'territorios' @> ${JSON.stringify([q.territorio])}::jsonb`,
                ]
              : []),
            ...(q.tema
              ? [sql`(${contratoPublicoCampana})->'temas' @> ${JSON.stringify([q.tema])}::jsonb`]
              : []),
            ...(q.campana ? [eq(campanas.id, q.campana)] : []),
          ),
        )
        .orderBy(campanas.id),
      this.db
        .select({
          id: fichasFuturo.id,
          revision: fichasFuturo.revision,
          contenido: sql<{
            territorioId: number | null;
            temas: string[];
            vinculos: unknown[];
          }>`jsonb_build_object('territorioId',${fichasFuturo.territorioId},'temas',${fichasFuturo.contenido}->'temas','vinculos',${fichasFuturo.contenido}->'vinculos')`,
          actualizadaEn: fichasFuturo.actualizadaEn,
        })
        .from(fichasFuturo)
        .where(
          and(
            sql`${fichasFuturo.creadaEn}<=${corte.toISOString()}`,
            ...(q.territorio ? [eq(fichasFuturo.territorioId, q.territorio)] : []),
            ...(q.campana ? [sql`${fichasFuturo.contenido}->>'campanaId'=${q.campana}`] : []),
            ...(q.tema
              ? [sql`${fichasFuturo.contenido}->'temas' @> ${JSON.stringify([q.tema])}::jsonb`]
              : []),
          ),
        )
        .orderBy(fichasFuturo.id),
    ]);
    return {
      corte: corte.toISOString(),
      nota: 'Metadatos de procesos creados antes del corte, con revisión y permisos vigentes al descargar. No es una instantánea histórica. No incluye textos sin licencia explícita.',
      campanas: cs,
      fichas: fs.map((f) => ({ ...f, actualizadaEn: f.actualizadaEn.toISOString() })),
    };
  }
}
