/**
 * Mirar — reportes, retenciones y devoluciones (spec
 * 2026-10-19-mi-argentina-ideal-la-pila.md §4; plan de la entrega 1, tareas 5 y 7).
 *
 * Nadie revisa un aporte antes de que lo vean otros (D3). Un aporte sale de
 * Mirar con `UMBRAL_REPORTES` reportes que cuentan, de actores distintos, desde
 * la última devolución. Un reporte cuenta sólo si quien reporta ya contestó
 * `RESPUESTAS_PARA_REPORTAR` aportes: sin eso, trece pestañas privadas sacarían
 * de la pila lo que a alguien no le gusta, porque un actor nuevo cuesta un clic.
 *
 * Retener no borra ni toca `estado`: escribe `senales.retenida_en`, que saca el
 * aporte de toda lectura pública, y deja en `pila_decisiones` quién, cuándo y por qué.
 */
import {
  RESPUESTAS_PARA_REPORTAR,
  UMBRAL_REPORTES,
  type MotivoDeReporte,
  type PaginaGestionPila,
} from '@v2/shared';
import { sql, type SQL } from 'drizzle-orm';

import { senales } from '../schema/senales.js';

import { ajeno, elegible, iso } from './_pila.js';

import type { Db } from '../client.js';

export const TAMANO_DE_PAGINA_GESTION = 50;
const MOTIVO_POR_REPORTES = `${String(UMBRAL_REPORTES)} reportes de personas que ya habían contestado otros aportes`;

export interface ResultadoDeReporte {
  /** Con este reporte el aporte salió de Mirar. */
  retenido: boolean;
  /** Es el primer reporte por datos personales que recibe este aporte. */
  primerReporteDeDatos: boolean;
}

export type ResultadoDeDecision = 'ok' | 'no_esta' | 'sin_cambio';

/** Lo que la gestión de Mirar puede tocar: deseos que entraron por una campaña. */
const enGestion = sql`${senales.clase} = 'deseo' and ${senales.estado} <> 'retirada'
  and exists (select 1 from contribuciones c where c.senal_id = ${senales.idPublico} and c.campana_id is not null)`;

/** Desde cuándo cuentan los reportes de un aporte: su última devolución. */
const ultimaDevolucion = (senalId: SQL) => sql`(
  select coalesce(max(d.creada_en), '-infinity'::timestamptz) from pila_decisiones d
  where d.senal_id = ${senalId} and d.decision = 'devolver')`;

interface FilaGestion extends Record<string, unknown> {
  id: string;
  texto: string;
  provincia: string | null;
  publicado_en: string;
  reportes: { motivo: MotivoDeReporte; cuentan: number; noCuentan: number }[] | null;
  retenida_en: string | null;
  retencion: { origen: 'reportes' | 'gestion'; motivo: string } | null;
  retenida_motivo: string | null;
  ultima: { decision: 'retener' | 'devolver'; motivo: string; fecha: string } | null;
}

export class PilaGestionRepository {
  constructor(private readonly db: Db) {}

  /** La campaña por su slug, en cualquier estado: la gestión también mira las cerradas. */
  async campanaPorSlug(slug: string): Promise<string | null> {
    const r = await this.db.execute<{ id: string }>(
      sql`select id from campanas where slug = ${slug}`,
    );
    return r.rows[0]?.id ?? null;
  }

  /**
   * Un reporte, en UNA sentencia: el driver HTTP de Neon no tiene transacción
   * interactiva, y contar y retener en dos pasos dejaría pasar dos retenciones
   * o ninguna. `null` si el aporte no está en Mirar o es de quien reporta. Un
   * segundo reporte del mismo actor no suma ni falla.
   */
  async reportar(e: {
    idPublico: string;
    actorId: number;
    userId: number | null;
    motivo: MotivoDeReporte;
  }): Promise<ResultadoDeReporte | null> {
    const r = await this.db.execute<{ existe: boolean; retenido: boolean; datos: boolean }>(sql`
      with s as (
        select ${senales.id} as id from ${senales}
        where ${senales.idPublico} = ${e.idPublico}::uuid and ${elegible()}
          and ${ajeno(e.actorId, e.userId)}
      ),
      habil as (
        select count(*) >= ${RESPUESTAS_PARA_REPORTAR} as ok from pila_respuestas
        where actor_id = ${e.actorId}::bigint and valor is not null
      ),
      nuevo as (
        insert into pila_reportes (senal_id, actor_id, motivo, cuenta)
        select id, ${e.actorId}::bigint, ${e.motivo}, (select ok from habil) from s
        on conflict do nothing
        returning senal_id, cuenta, motivo
      ),
      total as (
        select (select count(*) from pila_reportes p
                where p.senal_id = (select id from s) and p.cuenta
                  and p.creado_en > ${ultimaDevolucion(sql`(select id from s)`)})
             + (select count(*) from nuevo where cuenta) as n
      ),
      retenida as (
        update senales set retenida_en = now(), retenida_motivo = 'reportes', actualizada_en = now()
        where id = (select id from s) and retenida_en is null
          and (select n from total) >= ${UMBRAL_REPORTES}
        returning id
      ),
      decision as (
        insert into pila_decisiones (senal_id, decision, origen, motivo)
        select id, 'retener', 'reportes', ${MOTIVO_POR_REPORTES} from retenida
        returning senal_id
      )
      select exists (select 1 from s) as existe,
        exists (select 1 from decision) as retenido,
        (exists (select 1 from nuevo where motivo = 'datos_personales')
          and not exists (select 1 from pila_reportes p
            where p.senal_id = (select id from s) and p.motivo = 'datos_personales')) as datos`);
    const f = r.rows[0];
    if (!f?.existe) return null;
    return { retenido: f.retenido, primerReporteDeDatos: f.datos };
  }

  /**
   * Lo que ve la administración: los aportes con reportes desde su última
   * devolución, y los retenidos, ordenados por reportes que cuentan. El texto va
   * entero aunque esté reservado: es lo que se está juzgando. No se exporta.
   */
  async paraGestion(e: { campanaId?: string; desde?: number }): Promise<PaginaGestionPila> {
    const desde = Math.max(0, Math.trunc(e.desde ?? 0));
    const campana =
      e.campanaId === undefined
        ? sql``
        : sql`and exists (select 1 from contribuciones c
            where c.senal_id = ${senales.idPublico} and c.campana_id = ${e.campanaId}::uuid)`;
    const r = await this.db.execute<FilaGestion & { cuentan: number }>(sql`
      with base as (
        select ${senales.id} as id, ${senales.idPublico} as id_publico, ${senales.texto} as texto,
          g.name as provincia, ${iso(sql`coalesce(${senales.publicadaEn}, ${senales.creadaEn})`)} as publicado_en,
          ${senales.retenidaEn} as retenida_en_ts, ${senales.retenidaMotivo} as retenida_motivo,
          ${ultimaDevolucion(sql`${senales.id}`)} as devuelta
        from ${senales} left join geographic_locations g on g.id = ${senales.provinceId}
        where ${enGestion} ${campana}
      ),
      rep as (
        select p.senal_id, p.motivo, count(*) filter (where p.cuenta)::int as cuentan,
          count(*) filter (where not p.cuenta)::int as no_cuentan
        from pila_reportes p join base b on b.id = p.senal_id
        where p.creado_en > b.devuelta
        group by p.senal_id, p.motivo
      )
      select b.id_publico as id, b.texto, b.provincia, b.publicado_en,
        (select jsonb_agg(jsonb_build_object('motivo', rep.motivo, 'cuentan', rep.cuentan,
            'noCuentan', rep.no_cuentan) order by rep.cuentan desc, rep.motivo)
          from rep where rep.senal_id = b.id) as reportes,
        coalesce((select sum(rep.cuentan)::int from rep where rep.senal_id = b.id), 0) as cuentan,
        case when b.retenida_en_ts is null then null else ${iso(sql`b.retenida_en_ts`)} end as retenida_en,
        b.retenida_motivo,
        (select jsonb_build_object('origen', d.origen, 'motivo', d.motivo) from pila_decisiones d
          where d.senal_id = b.id and d.decision = 'retener' order by d.creada_en desc limit 1) as retencion,
        (select jsonb_build_object('decision', d.decision, 'motivo', d.motivo, 'fecha', ${iso(sql`d.creada_en`)})
          from pila_decisiones d where d.senal_id = b.id order by d.creada_en desc limit 1) as ultima
      from base b
      where b.retenida_en_ts is not null or exists (select 1 from rep where rep.senal_id = b.id)
      order by cuentan desc, (b.retenida_en_ts is not null) desc, b.id_publico
      limit ${TAMANO_DE_PAGINA_GESTION + 1} offset ${desde}`);
    const filas = r.rows.slice(0, TAMANO_DE_PAGINA_GESTION);
    return {
      siguiente: r.rows.length > TAMANO_DE_PAGINA_GESTION ? desde + TAMANO_DE_PAGINA_GESTION : null,
      aportes: filas.map((f) => ({
        id: f.id,
        texto: f.texto,
        provincia: f.provincia,
        publicadoEn: f.publicado_en,
        reportes: f.reportes ?? [],
        retenido:
          f.retenida_en === null
            ? null
            : {
                origen:
                  f.retencion?.origen ??
                  (f.retenida_motivo === 'reportes' ? 'reportes' : 'gestion'),
                desde: f.retenida_en,
                motivo: f.retencion?.motivo ?? f.retenida_motivo ?? '',
              },
        ultimaDecision: f.ultima,
      })),
    };
  }

  /** Retener ahora, sin esperar los reportes. `sin_cambio` si ya estaba retenido. */
  async retener(idPublico: string, adminId: number, motivo: string): Promise<ResultadoDeDecision> {
    return this.decidir(idPublico, adminId, motivo, 'retener');
  }

  /** Devolver a Mirar. Desde acá, los reportes vuelven a contar desde cero. */
  async devolver(idPublico: string, adminId: number, motivo: string): Promise<ResultadoDeDecision> {
    return this.decidir(idPublico, adminId, motivo, 'devolver');
  }

  /**
   * La retención y su registro, en una sentencia: no puede quedar un aporte
   * retenido sin decisión ni una decisión sin cambio.
   */
  private async decidir(
    idPublico: string,
    adminId: number,
    motivo: string,
    decision: 'retener' | 'devolver',
  ): Promise<ResultadoDeDecision> {
    const cambio =
      decision === 'retener'
        ? sql`set retenida_en = now(), retenida_motivo = 'gestion', actualizada_en = now()
            where ${senales.id} = (select id from s) and ${senales.retenidaEn} is null`
        : sql`set retenida_en = null, retenida_motivo = null, actualizada_en = now()
            where ${senales.id} = (select id from s) and ${senales.retenidaEn} is not null`;
    const r = await this.db.execute<{ existe: boolean; cambio: boolean }>(sql`
      with s as (
        select ${senales.id} as id from ${senales}
        where ${senales.idPublico} = ${idPublico}::uuid and ${enGestion}
      ),
      cambio as (update ${senales} ${cambio} returning ${senales.id} as id),
      registro as (
        insert into pila_decisiones (senal_id, decision, origen, admin_id, motivo)
        select id, ${decision}, 'gestion', ${adminId}::int, ${motivo} from cambio
        returning senal_id
      )
      select exists (select 1 from s) as existe, exists (select 1 from registro) as cambio`);
    const f = r.rows[0];
    if (!f?.existe) return 'no_esta';
    return f.cambio ? 'ok' : 'sin_cambio';
  }
}
