/**
 * Mirar — la tanda, las opiniones y los duelos (spec
 * 2026-10-19-mi-argentina-ideal-la-pila.md §4; plan de la entrega 1, tarea 5).
 * Los reportes y las decisiones de la administración están en `pila-gestion.ts`.
 *
 * Todo funciona con el actor del navegador y, si hay sesión, también con la
 * cuenta: una opinión por persona y por aporte, que se puede cambiar.
 *
 * El driver HTTP de Neon no tiene transacción interactiva, así que cada
 * escritura que necesita leer y escribir a la vez va en UNA sentencia con CTE.
 * Una CTE no ve lo que inserta otra CTE de la misma sentencia: por eso los
 * conteos de después se calculan como «los de antes, sin los míos, más el mío».
 */
import { OPINIONES_PARA_CONTAR, clavePar } from '@v2/civic-core';
import { PREGUNTA_MI_ARGENTINA_IDEAL, type ValorDeOpinion } from '@v2/shared';
import { sql } from 'drizzle-orm';

import { campanas } from '../schema/campanas.js';
import { senales } from '../schema/senales.js';

import { ajeno, campanaEnMirar, deQuienMira, elegible, iso } from './_pila.js';
import { textoDeSenalPublica } from './senal-publicacion.js';

import type { Db } from '../client.js';

export interface ProvinciaDePila {
  id: number;
  nombre: string;
  iso: string | null;
}

/** Un aporte que puede tocarle a quien mira, con lo que `armarTanda` necesita para ordenar. */
export interface CandidatoPila {
  id: string;
  texto: string;
  origen: string | null;
  provincia: ProvinciaDePila | null;
  tema: { clave: string; etiqueta: string } | null;
  /** Respuestas con valor (incluye «Paso»), de cualquier persona. */
  respuestas: number;
  /** «Yo también» + «Yo no» de la región de quien mira; 0 si no se sabe su región. */
  opinionesDeMiRegion: number;
  publicadaEn: string;
}

export interface EstadoDelActor {
  provincia: ProvinciaDePila | null;
  /** Contestó alguna vez: la provincia ya se le preguntó, aunque haya preferido no decirla. */
  yaPregunto: boolean;
  yaAporto: boolean;
  /** Como `clavePar(a, b)` de civic-core, con los ids públicos. */
  paresComparados: string[];
  /** Los aportes que dijo querer y siguen en Mirar, en orden de respuesta. */
  acuerdos: string[];
  respuestasDadas: number;
}

export interface OpinionGuardada {
  /** Otras personas con el mismo valor; `null` para «Paso». */
  coinciden: number | null;
  /** Con esta opinión, la región llegó a `OPINIONES_PARA_CONTAR` «Yo también» o «Yo no» en el aporte. */
  regionCompleta: boolean;
  /** Respuestas con valor de este actor, contando ésta. */
  respuestasDelActor: number;
}

interface FilaCandidato extends Record<string, unknown> {
  id: string;
  texto: string;
  origen: string | null;
  provincia_id: number | null;
  provincia_nombre: string | null;
  provincia_iso: string | null;
  tema_clave: string | null;
  tema_etiqueta: string | null;
  respuestas: number;
  de_mi_region: number;
  publicada_en: string;
}

const PROVINCIA_JSON = sql`jsonb_build_object('id', g.id, 'nombre', g.name, 'iso', g.iso_code)`;

export class PilaRepository {
  constructor(private readonly db: Db) {}

  /** La campaña, si existe y se está mirando. */
  async campanaParaMirar(slug: string): Promise<{ id: string } | null> {
    const r = await this.db.execute<{ id: string }>(sql`
      select k.id from ${campanas} k where k.slug = ${slug} and ${campanaEnMirar(sql`k`)}`);
    return r.rows[0] ?? null;
  }

  /** Una de las 24 provincias, con su ISO. Cualquier otro id es `null`. */
  async provincia(id: number): Promise<ProvinciaDePila | null> {
    const r = await this.db.execute<{ id: number; nombre: string; iso: string | null }>(sql`
      select id, name as nombre, iso_code as iso from geographic_locations
      where id = ${id} and level = 'province' and iso_code is not null`);
    return r.rows[0] ?? null;
  }

  /**
   * La provincia que ya se sabe de quien opina: la de su última opinión con provincia o, si
   * no, la de su último aporte. Sirve cuando una opinión llega sin provincia (desde la página
   * de un aporte), para no sacarla de su región.
   */
  async provinciaConocida(actorId: number, userId: number | null): Promise<ProvinciaDePila | null> {
    const r = await this.db.execute<{ p: ProvinciaDePila | null }>(sql`select coalesce(
      (select ${PROVINCIA_JSON} from pila_respuestas r join geographic_locations g on g.id = r.provincia_id
        where ${deQuienMira(sql.raw('r'), actorId, userId)} and r.valor is not null
        order by r.respondida_en desc limit 1),
      (select ${PROVINCIA_JSON} from senales s2 join geographic_locations g on g.id = s2.province_id
        where g.level = 'province' and g.iso_code is not null and s2.estado <> 'retirada'
          and (s2.actor_id = ${actorId}::bigint or (${userId}::int is not null and s2.user_id = ${userId}::int))
        order by s2.creada_en desc limit 1)) as p`);
    return r.rows[0]?.p ?? null;
  }

  /**
   * Los elegibles que le pueden tocar a quien mira: ni los propios, ni los que ya
   * contestó, ni los que ya reportó. El orden SQL es grueso; el fino lo hace
   * `armarTanda` de civic-core.
   */
  async candidatos(e: {
    campanaId: string;
    actorId: number;
    userId: number | null;
    region: string | null;
    limite?: number;
  }): Promise<CandidatoPila[]> {
    const r = await this.db.execute<FilaCandidato>(sql`
      select * from (
        select ${senales.idPublico} as id, ${textoDeSenalPublica} as texto,
          case when ${senales.cesionLicencia} then nullif((
            select f->>'respuesta' from contribuciones c, jsonb_array_elements(c.fragmentos) f
            where c.senal_id = ${senales.idPublico} and f->>'pregunta' = ${PREGUNTA_MI_ARGENTINA_IDEAL}
            limit 1), ${senales.texto}) end as origen,
          g.id as provincia_id, g.name as provincia_nombre, g.iso_code as provincia_iso,
          t.clave as tema_clave, t.etiqueta as tema_etiqueta,
          (select count(*)::int from pila_respuestas r
            where r.senal_id = ${senales.id} and r.valor is not null) as respuestas,
          (select count(*)::int from pila_respuestas r
            where r.senal_id = ${senales.id} and r.region = ${e.region}::text
              and r.valor in ('acuerdo', 'desacuerdo')) as de_mi_region,
          ${iso(sql`coalesce(${senales.publicadaEn}, ${senales.creadaEn})`)} as publicada_en
        from ${senales}
        left join geographic_locations g on g.id = ${senales.provinceId}
        left join temas t on t.clave = ${senales.tema}
        where ${elegible(e.campanaId)} and ${ajeno(e.actorId, e.userId)}
          and not exists (select 1 from pila_respuestas r where r.senal_id = ${senales.id}
            and r.valor is not null and ${deQuienMira(sql`r`, e.actorId, e.userId)})
          and not exists (select 1 from pila_reportes p
            where p.senal_id = ${senales.id} and p.actor_id = ${e.actorId}::bigint)
      ) x
      order by (${e.region}::text is not null and x.de_mi_region < ${OPINIONES_PARA_CONTAR}) desc,
        x.respuestas, x.publicada_en, x.id
      limit ${e.limite ?? 60}`);
    return r.rows.map((f) => ({
      id: f.id,
      texto: f.texto,
      origen: f.origen,
      provincia:
        f.provincia_id === null || f.provincia_nombre === null
          ? null
          : { id: f.provincia_id, nombre: f.provincia_nombre, iso: f.provincia_iso },
      tema:
        f.tema_clave === null || f.tema_etiqueta === null
          ? null
          : { clave: f.tema_clave, etiqueta: f.tema_etiqueta },
      respuestas: f.respuestas,
      opinionesDeMiRegion: e.region === null ? 0 : f.de_mi_region,
      publicadaEn: f.publicada_en,
    }));
  }

  /** Lo que se le mostró a quien mira. Un INSERT; lo ya mostrado no se toca. */
  async registrarExposicion(
    idsPublicos: readonly string[],
    actorId: number,
    userId: number | null,
  ): Promise<void> {
    if (!idsPublicos.length) return;
    await this.db.execute(sql`
      insert into pila_respuestas (senal_id, actor_id, user_id)
      select id, ${actorId}::bigint, ${userId}::int from ${senales}
      where id_publico in (${sql.join(
        idsPublicos.map((id) => sql`${id}::uuid`),
        sql`, `,
      )})
      on conflict do nothing`);
  }

  /**
   * Guardar o cambiar una opinión. `null` si el aporte no es elegible o es propio.
   *
   * Si la cuenta ya opinó desde otro actor, se cambia ESA fila y no se escribe
   * otra: la persona es una aunque llegue desde dos navegadores.
   */
  async opinar(e: {
    idPublico: string;
    actorId: number;
    userId: number | null;
    valor: ValorDeOpinion;
    provinciaId: number | null;
    region: string | null;
  }): Promise<OpinionGuardada | null> {
    const mia = deQuienMira(sql`r`, e.actorId, e.userId);
    const deMiRegion = sql`r.senal_id = (select id from s) and r.region = ${e.region}::text
      and r.valor in ('acuerdo', 'desacuerdo')`;
    const r = await this.db.execute<{
      existe: number;
      coinciden: number | null;
      antes_region: number;
      otros_region: number;
      respuestas_actor: number;
    }>(sql`
      with s as (
        select ${senales.id} as id from ${senales}
        where ${senales.idPublico} = ${e.idPublico}::uuid and ${elegible()}
          and ${ajeno(e.actorId, e.userId)}
      ),
      por_cuenta as (
        update pila_respuestas r set valor = ${e.valor}, respondida_en = now(),
          provincia_id = ${e.provinciaId}::int, region = ${e.region}::text
        where r.senal_id = (select id from s) and ${e.userId}::int is not null
          and r.user_id = ${e.userId}::int and r.actor_id <> ${e.actorId}::bigint
        returning r.senal_id
      ),
      escrita as (
        insert into pila_respuestas (senal_id, actor_id, user_id, valor, provincia_id, region, respondida_en)
        select id, ${e.actorId}::bigint, ${e.userId}::int, ${e.valor}, ${e.provinciaId}::int, ${e.region}::text, now()
        from s where not exists (select 1 from por_cuenta)
        on conflict (senal_id, actor_id) do update set valor = excluded.valor,
          provincia_id = excluded.provincia_id, region = excluded.region,
          respondida_en = excluded.respondida_en,
          user_id = coalesce(pila_respuestas.user_id, excluded.user_id)
        returning senal_id
      )
      select (select count(*)::int from s) as existe,
        case when ${e.valor} = 'paso' then null else (
          select count(*)::int from pila_respuestas r
          where r.senal_id = (select id from s) and r.valor = ${e.valor} and not ${mia}) end as coinciden,
        (select count(*)::int from pila_respuestas r where ${deMiRegion}) as antes_region,
        (select count(*)::int from pila_respuestas r where ${deMiRegion} and not ${mia}) as otros_region,
        (select count(*)::int from pila_respuestas r where r.actor_id = ${e.actorId}::bigint
          and r.valor is not null and r.senal_id <> (select id from s)) + 1 as respuestas_actor`);
    const f = r.rows[0];
    if (!f || f.existe === 0) return null;
    const cuentaLaMia = e.region !== null && e.valor !== 'paso';
    return {
      coinciden: f.coinciden,
      regionCompleta:
        cuentaLaMia &&
        f.antes_region < OPINIONES_PARA_CONTAR &&
        f.otros_region + 1 === OPINIONES_PARA_CONTAR,
      respuestasDelActor: f.respuestas_actor,
    };
  }

  /**
   * ¿Cuál va primero? Exige que los dos sean elegibles, ajenos y que quien mira
   * haya dicho «Yo también» a los dos. El par se guarda una vez por persona, con
   * `a_id < b_id`, y se puede cambiar. `false` si no corresponde.
   */
  async comparar(e: {
    a: string;
    b: string;
    primero: string | null;
    actorId: number;
    userId: number | null;
  }): Promise<boolean> {
    const mia = (t: string) => deQuienMira(sql.raw(t), e.actorId, e.userId);
    const r = await this.db.execute<{ ok: boolean }>(sql`
      with par as (
        select ${senales.id} as id, ${senales.idPublico} as id_publico from ${senales}
        where ${senales.idPublico} in (${e.a}::uuid, ${e.b}::uuid) and ${elegible()}
          and ${ajeno(e.actorId, e.userId)}
          and exists (select 1 from pila_respuestas r where r.senal_id = ${senales.id}
            and r.valor = 'acuerdo' and ${mia('r')})
      ),
      ok as (select count(*) = 2 as ok, min(id) as a_id, max(id) as b_id from par),
      primero as (select id from par where id_publico = ${e.primero}::uuid),
      mi_region as (
        select r.region from pila_respuestas r where ${mia('r')} and r.valor is not null
        order by r.respondida_en desc limit 1
      ),
      por_cuenta as (
        update pila_duelos d set primero_id = (select id from primero), cambiado_en = now(),
          region = (select region from mi_region)
        where (select ok from ok) and d.a_id = (select a_id from ok) and d.b_id = (select b_id from ok)
          and ${e.userId}::int is not null and d.user_id = ${e.userId}::int
          and d.actor_id <> ${e.actorId}::bigint
        returning d.a_id
      ),
      escrito as (
        insert into pila_duelos (a_id, b_id, actor_id, user_id, primero_id, region)
        select a_id, b_id, ${e.actorId}::bigint, ${e.userId}::int, (select id from primero),
          (select region from mi_region)
        from ok where ok and not exists (select 1 from por_cuenta)
        on conflict (a_id, b_id, actor_id) do update set primero_id = excluded.primero_id,
          region = excluded.region, cambiado_en = now(),
          user_id = coalesce(pila_duelos.user_id, excluded.user_id)
        returning a_id
      )
      select ok from ok`);
    return r.rows[0]?.ok ?? false;
  }

  /** Lo que la pila necesita saber de quien mira antes de armar la tanda. */
  async estadoDelActor(
    campanaId: string,
    actorId: number,
    userId: number | null,
  ): Promise<EstadoDelActor> {
    const mia = (t: string) => deQuienMira(sql.raw(t), actorId, userId);
    const propio = sql`(s2.actor_id = ${actorId}::bigint
      or (${userId}::int is not null and s2.user_id = ${userId}::int))`;
    const enCampana = sql`c.campana_id = ${campanaId}::uuid and s2.estado <> 'retirada' and ${propio}`;
    const [estado, pares, acuerdos] = await Promise.all([
      this.db.execute<{
        de_respuesta: ProvinciaDePila | null;
        de_aporte: ProvinciaDePila | null;
        ya_pregunto: boolean;
        ya_aporto: boolean;
        respuestas: number;
      }>(sql`select
        (select ${PROVINCIA_JSON} from pila_respuestas r join geographic_locations g on g.id = r.provincia_id
          where ${mia('r')} and r.valor is not null order by r.respondida_en desc limit 1) as de_respuesta,
        (select ${PROVINCIA_JSON} from senales s2 join contribuciones c on c.senal_id = s2.id_publico
          join geographic_locations g on g.id = s2.province_id and g.level = 'province'
          where ${enCampana} order by s2.creada_en desc limit 1) as de_aporte,
        exists (select 1 from pila_respuestas r where ${mia('r')} and r.valor is not null) as ya_pregunto,
        exists (select 1 from senales s2 join contribuciones c on c.senal_id = s2.id_publico
          where ${enCampana}) as ya_aporto,
        (select count(*)::int from pila_respuestas r where ${mia('r')} and r.valor is not null) as respuestas`),
      this.db.execute<{ a: string; b: string }>(sql`
        select a.id_publico as a, b.id_publico as b from pila_duelos d
        join senales a on a.id = d.a_id join senales b on b.id = d.b_id
        where ${mia('d')} order by d.cambiado_en desc limit 500`),
      this.db.execute<{ id: string }>(sql`
        select ${senales.idPublico} as id from pila_respuestas r join ${senales} on ${senales.id} = r.senal_id
        where ${mia('r')} and r.valor = 'acuerdo' and ${elegible(campanaId)}
        order by r.respondida_en desc limit 200`),
    ]);
    const f = estado.rows[0];
    return {
      provincia: f?.de_respuesta ?? f?.de_aporte ?? null,
      yaPregunto: f?.ya_pregunto ?? false,
      yaAporto: f?.ya_aporto ?? false,
      paresComparados: pares.rows.map((p) => clavePar(p.a, p.b)),
      acuerdos: acuerdos.rows.map((a) => a.id).reverse(),
      respuestasDadas: f?.respuestas ?? 0,
    };
  }

  /** Para `/senal/:id`: si el aporte está en Mirar y qué contestó quien mira. */
  async opinionDe(
    idPublico: string,
    actorId: number | null,
    userId: number | null,
  ): Promise<{ enMirar: boolean; miOpinion: ValorDeOpinion | null }> {
    const r = await this.db.execute<{ en_mirar: boolean; mi_opinion: ValorDeOpinion | null }>(sql`
      select exists (select 1 from ${senales} where ${senales.idPublico} = ${idPublico}::uuid
          and ${elegible()}) as en_mirar,
        (select r.valor from pila_respuestas r join senales s2 on s2.id = r.senal_id
          where s2.id_publico = ${idPublico}::uuid and r.valor is not null
            and ${deQuienMira(sql`r`, actorId, userId)}
          order by r.respondida_en desc limit 1) as mi_opinion`);
    const f = r.rows[0];
    return { enMirar: f?.en_mirar ?? false, miOpinion: f?.mi_opinion ?? null };
  }

  /**
   * Lo que hizo este actor en la última hora (opiniones y tandas) y en el último
   * día (reportes), para los techos del servicio. Se cuenta en la base y no en
   * memoria: la API corre serverless (ADR 0008) y un contador de proceso se
   * resetea en cada arranque.
   *
   * Una tanda se cuenta por el instante en que registró lo que mostró: todas las
   * filas de una tanda llevan el mismo `now()`. Una tanda que sólo vuelve a
   * mostrar lo ya mostrado no escribe nada, y no se cuenta. Una opinión que no
   * pasó por una tanda (la de `/senal/:id`) nace mostrada y contestada en el
   * mismo instante, y tampoco se cuenta como tanda.
   */
  async actividadReciente(
    actorId: number,
  ): Promise<{ opiniones: number; tandas: number; reportes: number }> {
    const r = await this.db.execute<{ opiniones: number; tandas: number; reportes: number }>(sql`
      select
        (select count(*)::int from pila_respuestas where actor_id = ${actorId}::bigint
          and respondida_en > now() - interval '1 hour') as opiniones,
        (select count(distinct mostrada_en)::int from pila_respuestas where actor_id = ${actorId}::bigint
          and mostrada_en > now() - interval '1 hour'
          and respondida_en is distinct from mostrada_en) as tandas,
        (select count(*)::int from pila_reportes where actor_id = ${actorId}::bigint
          and creado_en > now() - interval '1 day') as reportes`);
    return r.rows[0] ?? { opiniones: 0, tandas: 0, reportes: 0 };
  }
}
