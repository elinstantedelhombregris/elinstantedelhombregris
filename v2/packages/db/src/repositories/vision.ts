/**
 * Ver — lo que la visión de una campaña necesita leer de la base (spec
 * 2026-10-19-mi-argentina-ideal-la-pila.md §5), y los aportes parecidos a lo que
 * alguien está escribiendo (§3).
 *
 * **Todo sale agregado.** Las opiniones y los duelos llegan contados por aporte y
 * por región; las personas, contadas por provincia. Nunca se trae a memoria una
 * fila por persona ajena: lo único individual que sale es lo de quien mira (su
 * aporte, su región y sus opiniones), y sólo para devolvérselo a esa persona.
 * Las reglas que deciden qué entra en cada sección viven en `@v2/civic-core`
 * (`leerVision`), y la supresión de números chicos (D-088) la hace la API.
 *
 * **Qué aporte entra.** La misma regla que Mirar (P3 del plan de la entrega 1):
 * un deseo, sin retirar ni retener, con el texto cedido, que entra en la línea y
 * tiene su contribución en la campaña. El texto pasa por `textoDeSenalPublica`.
 *
 * **`senales` va sin alias en todas las consultas**, y no es estilo:
 * `textoDeSenalPublica` se escribe como `"senales"."texto"`, y Postgres rechaza
 * esa referencia si la tabla tiene alias.
 */
import { type ContratoCampana, type ValorDeOpinion } from '@v2/shared';
import { and, eq, sql, type SQL } from 'drizzle-orm';

import { campanas, contribuciones } from '../schema/campanas.js';
import { geographicLocations } from '../schema/geographic.js';
import { pilaDuelos, pilaRespuestas } from '../schema/pila.js';
import { senales } from '../schema/senales.js';

import { aporteQueEntra } from './_pila.js';
import {
  campanaPublicada,
  contratoPublicoCampana,
  revisionPublicaCampana,
} from './participacion-consulta.js';
import { textoDeSenalPublica } from './senal-publicacion.js';

import type { Db } from '../client.js';

/** Quien mira. Sin cookie de actor ni cuenta, los dos van nulos y nada es «tuyo». */
export interface QuienMira {
  actorId: number | null;
  userId: number | null;
}

export interface CampanaDeVision {
  id: string;
  slug: string;
  /** La revisión pública de las reglas: es la edición que se muestra. */
  edicion: number;
  contrato: ContratoCampana;
}

/** Un aporte que entra en la visión. `texto` ya pasó por `textoDeSenalPublica`. */
export interface AporteDeVision {
  id: string;
  texto: string;
  provincia: string | null;
  tema: string | null;
  publicadaEn: string;
}

/** Las opiniones de un aporte desde una región. `region` nula: quien opinó no dijo su provincia. */
export interface ConteoPorRegion {
  id: string;
  region: string | null;
  /** «Yo también» + «Yo no». */
  opiniones: number;
  acuerdos: number;
  pasos: number;
}

export interface ConteoDeDuelos {
  id: string;
  /** Duelos entre dos aportes que entran; «los dos por igual» también es una comparación. */
  comparaciones: number;
  primero: number;
}

/** Personas que participaron, por provincia. `provinciaId` nulo: no se sabe de dónde son. */
export interface PersonasPorProvincia {
  provinciaId: number | null;
  personas: number;
}

export interface ProvinciaDeLaBase {
  id: number;
  nombre: string;
  iso: string | null;
}

export interface TemaDeLaBase {
  clave: string;
  etiqueta: string;
}

/** El aporte propio, con sus conteos crudos: sólo se le devuelve a su autor. */
export interface AportePropioEnVision {
  id: string;
  texto: string;
  provincia: string | null;
  tema: { clave: string; etiqueta: string } | null;
  opiniones: number;
  acuerdos: number;
  pasos: number;
}

interface FilaPropia extends Omit<AportePropioEnVision, 'tema'> {
  temaClave: string | null;
  temaEtiqueta: string | null;
}

export interface MiradaPropia {
  /** La región de la última opinión de quien mira que tiene provincia. */
  regionDeOpinion: string | null;
  /** El ISO de la provincia de su último aporte con provincia, si no opinó con una. */
  isoDeAporte: string | null;
  tuyo: AportePropioEnVision | null;
  opiniones: { id: string; valor: ValorDeOpinion }[];
}

export interface DatosDeVision {
  aportes: AporteDeVision[];
  conteos: ConteoPorRegion[];
  duelos: ConteoDeDuelos[];
  personas: PersonasPorProvincia[];
  provincias: ProvinciaDeLaBase[];
  temas: TemaDeLaBase[];
  propia: MiradaPropia;
}

export interface AporteParecidoDeLaBase {
  id: string;
  texto: string;
  provincia: string | null;
}

/** Lo que `similarity` de `pg_trgm` tiene que alcanzar para que dos textos «se parezcan en las palabras». */
export const UMBRAL_DE_PARECIDO = 0.2;

/** `execute` pide un tipo con índice de cadena; una interfaz no lo tiene. */
type Fila<T> = { [K in keyof T]: T[K] };

const ISO = `'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'`;

/** Un aporte que entra en Mirar y en Ver. Sin la condición de campaña: va en el join. */
/** La regla de Mirar, la misma (D-140). */
const aporteElegible = aporteQueEntra;

/** La contribución del aporte en la campaña. */
const enLaCampana = (campanaId: string) =>
  sql`join ${contribuciones} c on c.senal_id = ${senales.idPublico} and c.campana_id = ${campanaId}::uuid`;

/** Los aportes que entran, como CTE `e (sid, id)`: `sid` es el id interno, `id` el público. */
const elegibles = (campanaId: string) => sql`e as (
  select ${senales.id} as sid, ${senales.idPublico} as id
  from ${senales} ${enLaCampana(campanaId)}
  where ${aporteElegible}
)`;

/** El aporte es de quien mira: por la cuenta o, sin cuenta, por el actor. Nunca nulo. */
const esDeQuienMira = (q: QuienMira): SQL =>
  sql`coalesce(${senales.userId} = ${q.userId}::int
    or (${senales.userId} is null and ${senales.actorId} = ${q.actorId}::bigint), false)`;

/** La opinión es de quien mira, por el actor o por la cuenta. Nunca nulo. */
const opinionDeQuienMira = (q: QuienMira): SQL =>
  sql`coalesce(r.actor_id = ${q.actorId}::bigint or r.user_id = ${q.userId}::int, false)`;

export class VisionRepository {
  constructor(private readonly db: Db) {}

  /** La campaña por su slug, con sus reglas públicas. Un borrador nunca publicado no existe. */
  async campanaPorSlug(slug: string): Promise<CampanaDeVision | null> {
    const [fila] = await this.db
      .select({
        id: campanas.id,
        slug: campanas.slug,
        edicion: revisionPublicaCampana,
        contrato: contratoPublicoCampana,
      })
      .from(campanas)
      .where(and(eq(campanas.slug, slug), campanaPublicada))
      .limit(1);
    if (!fila) return null;
    return { id: fila.id, slug: fila.slug, edicion: fila.edicion, contrato: fila.contrato };
  }

  /**
   * Todo lo que Ver necesita, en un solo viaje: un `batch` es una transacción,
   * así que los conteos, las personas y lo propio salen de la misma foto.
   */
  async leer(campanaId: string, quien: QuienMira): Promise<DatosDeVision> {
    const e = elegibles(campanaId);
    const [aportes, conteos, duelos, personas, provincias, temas, mias, propio, tuyo] =
      await this.db.batch([
        this.db.execute<Fila<AporteDeVision>>(sql`
          select ${senales.idPublico} as id, ${textoDeSenalPublica} as texto, g.name as provincia,
            ${senales.tema} as tema,
            to_char(coalesce(${senales.publicadaEn}, ${senales.creadaEn}) at time zone 'UTC', ${sql.raw(ISO)}) as "publicadaEn"
          from ${senales} ${enLaCampana(campanaId)}
          left join ${geographicLocations} g on g.id = ${senales.provinceId}
          where ${aporteElegible}
          order by ${senales.id}`),
        this.db.execute<Fila<ConteoPorRegion>>(sql`
          with ${e}
          select e.id, r.region,
            count(*) filter (where r.valor in ('acuerdo', 'desacuerdo'))::int as opiniones,
            count(*) filter (where r.valor = 'acuerdo')::int as acuerdos,
            count(*) filter (where r.valor = 'paso')::int as pasos
          from ${pilaRespuestas} r join e on e.sid = r.senal_id
          where r.valor is not null
          group by e.id, r.region`),
        this.db.execute<Fila<ConteoDeDuelos>>(sql`
          with ${e}
          select x.id, count(*)::int as comparaciones,
            count(*) filter (where d.primero_id = x.sid)::int as primero
          from ${pilaDuelos} d
          join e ea on ea.sid = d.a_id
          join e eb on eb.sid = d.b_id
          cross join lateral (values (ea.sid, ea.id), (eb.sid, eb.id)) as x(sid, id)
          group by x.id`),
        this.db.execute<Fila<PersonasPorProvincia>>(sql`
          with ${e},
          autores as (
            select ${senales.actorId} as actor_id, ${senales.provinceId} as provincia_id,
              ${senales.creadaEn} as fecha
            from ${senales} ${enLaCampana(campanaId)}
            where ${senales.estado} <> 'retirada' and ${senales.retenidaEn} is null
              and ${senales.actorId} is not null
          ),
          opinantes as (
            select r.actor_id, r.provincia_id, r.respondida_en as fecha
            from ${pilaRespuestas} r join e on e.sid = r.senal_id
            where r.valor is not null
          ),
          personas as (select actor_id from autores union select actor_id from opinantes),
          por_opinion as (
            select distinct on (actor_id) actor_id, provincia_id from opinantes
            where provincia_id is not null order by actor_id, fecha desc
          ),
          por_aporte as (
            select distinct on (actor_id) actor_id, provincia_id from autores
            where provincia_id is not null order by actor_id, fecha desc
          )
          select coalesce(o.provincia_id, a.provincia_id) as "provinciaId", count(*)::int as personas
          from personas p
          left join por_opinion o on o.actor_id = p.actor_id
          left join por_aporte a on a.actor_id = p.actor_id
          group by 1`),
        this.db.execute<Fila<ProvinciaDeLaBase>>(sql`
          select id, name as nombre, iso_code as iso from ${geographicLocations}
          where level = 'province' order by name`),
        this.db.execute<Fila<TemaDeLaBase>>(sql`select clave, etiqueta from temas order by orden`),
        this.db.execute<{ id: string; valor: ValorDeOpinion }>(sql`
          with ${e}
          select distinct on (e.id) e.id, r.valor
          from ${pilaRespuestas} r join e on e.sid = r.senal_id
          where r.valor is not null and ${opinionDeQuienMira(quien)}
          order by e.id, (r.user_id is not distinct from ${quien.userId}::int) desc, r.respondida_en desc`),
        this.db.execute<{ region: string | null; iso: string | null }>(sql`
          select
            (select r.region from ${pilaRespuestas} r
              join ${senales} on ${senales.id} = r.senal_id ${enLaCampana(campanaId)}
              where r.valor is not null and r.region is not null and ${opinionDeQuienMira(quien)}
              order by r.respondida_en desc limit 1) as region,
            (select g.iso_code from ${senales} ${enLaCampana(campanaId)}
              join ${geographicLocations} g on g.id = ${senales.provinceId}
              where ${esDeQuienMira(quien)} and ${senales.estado} <> 'retirada'
              order by ${senales.creadaEn} desc limit 1) as iso`),
        this.db.execute<Fila<FilaPropia>>(sql`
          select ${senales.idPublico} as id, ${senales.texto} as texto,
            g.name as provincia, t.clave as "temaClave", t.etiqueta as "temaEtiqueta",
            count(r.valor) filter (where r.valor in ('acuerdo', 'desacuerdo'))::int as opiniones,
            count(r.valor) filter (where r.valor = 'acuerdo')::int as acuerdos,
            count(r.valor) filter (where r.valor = 'paso')::int as pasos
          from ${senales} ${enLaCampana(campanaId)}
          left join ${pilaRespuestas} r on r.senal_id = ${senales.id}
          left join ${geographicLocations} g on g.id = ${senales.provinceId}
          left join temas t on t.clave = ${senales.tema}
          where ${senales.clase} = 'deseo' and ${senales.estado} <> 'retirada'
            and ${senales.retenidaEn} is null and ${esDeQuienMira(quien)}
          group by ${senales.id}, g.name, t.clave, t.etiqueta
          order by ${senales.creadaEn} desc, ${senales.id} desc
          limit 1`),
      ]);
    const lugar = propio.rows[0];
    return {
      aportes: aportes.rows,
      conteos: conteos.rows,
      duelos: duelos.rows,
      personas: personas.rows,
      provincias: provincias.rows,
      temas: temas.rows,
      propia: {
        regionDeOpinion: lugar?.region ?? null,
        isoDeAporte: lugar?.iso ?? null,
        tuyo: propiaDe(tuyo.rows[0]),
        opiniones: mias.rows,
      },
    };
  }

  /**
   * Hasta `tope` aportes que entran en Mirar y se parecen a `texto`, sin los de
   * quien escribe, del más parecido al menos.
   *
   * Dos maneras de parecerse, las dos con los índices de la migración 0042:
   * trigramas (`%`, que con el umbral local vale `similarity >= 0.2`) para lo
   * que se escribe casi igual, y búsqueda de texto en castellano con las
   * palabras de lo escrito unidas por «o» para lo que comparte palabras. El
   * umbral se fija con `set_config(…, true)`, que dura lo que dura el `batch`.
   *
   * `texto` viaja como parámetro y no se guarda en ningún lado.
   */
  async parecidos(
    slugCampana: string,
    texto: string,
    quien: QuienMira,
    tope: number,
  ): Promise<AporteParecidoDeLaBase[]> {
    const consulta = sql`replace(plainto_tsquery('spanish', ${texto})::text, ' & ', ' | ')::tsquery`;
    const vector = sql`to_tsvector('spanish', ${senales.texto})`;
    const [, r] = await this.db.batch([
      this.db.execute(
        sql`select set_config('pg_trgm.similarity_threshold', ${String(UMBRAL_DE_PARECIDO)}, true)`,
      ),
      this.db.execute<Fila<AporteParecidoDeLaBase>>(sql`
        select ${senales.idPublico} as id, ${textoDeSenalPublica} as texto, g.name as provincia
        from ${senales}
        join ${contribuciones} c on c.senal_id = ${senales.idPublico}
        join ${campanas} k on k.id = c.campana_id and k.slug = ${slugCampana}
        left join ${geographicLocations} g on g.id = ${senales.provinceId}
        where ${aporteElegible} and not ${esDeQuienMira(quien)}
          and (${senales.texto} % ${texto} or ${vector} @@ ${consulta})
        order by similarity(${senales.texto}, ${texto}) desc,
          ts_rank(${vector}, ${consulta}) desc, ${senales.id}
        limit ${tope}`),
    ]);
    return r.rows;
  }
}

function propiaDe(f: Fila<FilaPropia> | undefined): AportePropioEnVision | null {
  if (!f) return null;
  const { temaClave, temaEtiqueta, ...resto } = f;
  return {
    ...resto,
    tema: temaClave && temaEtiqueta ? { clave: temaClave, etiqueta: temaEtiqueta } : null,
  };
}
