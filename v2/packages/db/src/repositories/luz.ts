import { sql } from 'drizzle-orm';

import type { Db } from '../client.js';

/**
 * El conteo crudo de una provincia, con la forma exacta que pide `ConteoCelda`
 * de `civic-core/brillo.ts`.
 *
 * Los cinco campos y sus definiciones salen de la spec C §2.8, y no se
 * reinterpretan acá: este repositorio los CUENTA, y `brilloDeCelda` /
 * `nitidezDeCelda` los convierten en los dos números. Que el cálculo viva en el
 * núcleo y el conteo en la base es lo que impide que la web y el teléfono
 * midan distinto.
 */
export interface ConteoDeProvincia {
  readonly provinceId: number;
  readonly vocesDistintas: number;
  readonly senalesSinActor: number;
  readonly verificables: number;
  readonly confirmaciones: number;
}

/** El tope de §2.8: más de veinte hechos de un actor en un territorio no cuentan. */
export const TOPE_VERIFICABLES_POR_ACTOR = 20;

/** Los estados en que una señal está publicada y por lo tanto es verificable. */
const ESTADOS_PUBLICADOS = ['por_verificar', 'corroborada', 'resuelta', 'desactualizada'];
/** De esos, los que cuentan como confirmados. */
const ESTADOS_CONFIRMADOS = ['corroborada', 'resuelta'];

export class LuzRepository {
  constructor(private readonly db: Db) {}

  /**
   * Los cuatro conteos por provincia, en una sola consulta.
   *
   * Tres decisiones que la spec fija y que son fáciles de escribir mal:
   *
   * 1. **`vocesDistintas` cuenta identidades de participación, no señales.**
   *    La titularidad conocida se deduplica por cuenta; sin ella, por actor.
   *    Ninguna de las dos acredita identidad civil. Vincular una voz no permite
   *    apropiarse de todas las adhesiones del navegador que la escribió.
   * 2. **`senalesSinActor` va aparte y no se pliega a cero.** «No sé quién» no
   *    es «nadie», y plegarlo sesgaría justo contra lo que carga la app de
   *    campo, que es donde más falta la cookie.
   * 3. **El tope de veinte por identidad de participación** existe porque `verificables` es el
   *    denominador de la nitidez y cargar señales no cuesta nada: cien hechos
   *    de una sola persona apagarían la nitidez de su provincia a casi cero.
   *    Sin el tope, el denominador es el diario de alguien.
   */
  async conteosPorProvincia(): Promise<ConteoDeProvincia[]> {
    const crudo = await this.db.execute<{
      province_id: number;
      voces: number;
      sin_actor: number;
      verificables: number;
      confirmaciones: number;
    }>(sql`
      with vigentes as (
        select s.id,s.province_id,s.clase,s.estado,s.creada_en,
          case when s.user_id is not null then 'cuenta:'||s.user_id::text
          when s.actor_id is not null then 'actor:'||s.actor_id::text end as participante
        from senales s
        where s.retenida_en is null and s.estado<>'retirada' and s.province_id is not null
      ), publicadas as (
        select s.id, s.province_id, s.participante, s.clase, s.estado,
               row_number() over (
                 partition by s.province_id, s.participante order by s.creada_en
               ) as orden_por_actor
        from vigentes s
        where s.clase in ('hecho','acto')
          and s.estado = any(${sql.raw(`array['${ESTADOS_PUBLICADOS.join("','")}']`)})
      ),
      topeadas as (
        -- Sin cuenta ni actor no hay una identidad a la que aplicar el tope.
        select * from publicadas
        where participante is null or orden_por_actor <= ${TOPE_VERIFICABLES_POR_ACTOR}
      ),
      escritoras as (
        select province_id, participante from vigentes where participante is not null
      ),
      adherentes as (
        select s.province_id, case when actor.user_id is not null then 'cuenta:'||actor.user_id::text
          else 'actor:'||a.actor_id::text end as participante
        from adhesiones a join vigentes s on s.id=a.senal_id join actores actor on actor.id=a.actor_id
      ),
      personas as (
        select province_id, participante from escritoras
        union
        select province_id, participante from adherentes
      ), provincias as (
        select distinct province_id from vigentes
      )
      select
        p.province_id,
        coalesce((select count(*) from personas x where x.province_id = p.province_id), 0)::int as voces,
        coalesce((select count(*) from vigentes y
                  where y.province_id=p.province_id and y.participante is null), 0)::int as sin_actor,
        coalesce((select count(*) from topeadas t where t.province_id=p.province_id), 0)::int as verificables,
        coalesce((select count(*) from topeadas t where t.province_id=p.province_id
          and t.estado = any(${sql.raw(`array['${ESTADOS_CONFIRMADOS.join("','")}']`)})), 0)::int as confirmaciones
      from provincias p
    `);

    // `neon-http` devuelve `{ rows }`, no un array pelado.
    const filas = crudo.rows;
    const listadas: ConteoDeProvincia[] = filas.map((f) => ({
      provinceId: f.province_id,
      vocesDistintas: f.voces,
      senalesSinActor: f.sin_actor,
      verificables: f.verificables,
      confirmaciones: f.confirmaciones,
    }));

    return listadas;
  }
}
