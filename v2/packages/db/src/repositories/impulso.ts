/**
 * El paso previo de una campaña propuesta: las personas nuevas que trae (spec
 * 2026-10-19-mi-argentina-ideal-la-pila.md §11).
 *
 * Una persona cuenta cuando participa por primera vez en Mi Argentina ideal con la
 * marca de llegada de una campaña que está juntando gente:
 *   - con su primer aporte (y menos de cinco opiniones antes), o
 *   - con su quinta opinión (y ningún aporte).
 * Cuenta para una sola campaña: la primera que la trajo (`actor_id` es la clave).
 * Un aporte retirado o retenido deja de contar.
 */
import { UMBRAL_IMPULSO, type ContratoCampana } from '@v2/shared';
import { sql } from 'drizzle-orm';

import { campanaEdiciones, campanas } from '../schema/campanas.js';
import { campanaImpulsos } from '../schema/impulso.js';
import { senales } from '../schema/senales.js';
import { users } from '../schema/users.js';

import { textoDeSenalPublica } from './senal-publicacion.js';

import type { Db } from '../client.js';

export interface ResultadoDeImpulso {
  /** La persona quedó contada para la campaña. */
  acreditado: boolean;
  /** Con esta persona la campaña llegó al umbral y pasó a revisión. */
  pasoARevision: boolean;
  campana: { id: string; slug: string; creadorId: number } | null;
}

/** Las personas que cuentan, con la regla del aporte retirado o retenido. */
const personasQueCuentan = (campanaId: ReturnType<typeof sql>) => sql`(
  select count(*)::int from ${campanaImpulsos} i
  left join ${senales} s on s.id = i.senal_id
  where i.campana_id = ${campanaId}
    and (i.como = 'opiniones' or (s.id is not null and s.estado <> 'retirada' and s.retenida_en is null))
)`;

export class ImpulsoRepository {
  constructor(private readonly db: Db) {}

  /**
   * Cuenta a la persona si corresponde y, si con ella la campaña llega al umbral,
   * la pasa a revisión en la misma sentencia. Idempotente: llamarla dos veces no
   * cuenta dos veces.
   */
  async acreditar(e: {
    campanaId: string;
    actorId: number;
    userId: number | null;
    como: 'aporte' | 'opiniones';
    senalId: number | null;
  }): Promise<ResultadoDeImpulso> {
    const r = await this.db.execute<{
      id: string;
      slug: string;
      creador_id: number;
      paso: boolean;
    }>(sql`
      with nueva as (
        insert into ${campanaImpulsos} (actor_id, campana_id, user_id, como, senal_id)
        select ${e.actorId}, c.id, ${e.userId}, ${e.como}, ${e.como === 'aporte' ? e.senalId : null}
        from ${campanas} c
        where c.id = ${e.campanaId}::uuid and c.estado = 'reuniendo'
          and c.creador_id is distinct from ${e.userId}::int
          and (
            (${e.como} = 'aporte'
              and (select count(*) from ${senales} where actor_id = ${e.actorId}) = 1
              and (select count(*) from pila_respuestas where actor_id = ${e.actorId} and valor is not null) < 5)
            or (${e.como} = 'opiniones'
              and (select count(*) from ${senales} where actor_id = ${e.actorId}) = 0
              and (select count(*) from pila_respuestas where actor_id = ${e.actorId} and valor is not null) = 5)
          )
        on conflict (actor_id) do nothing
        returning campana_id
      ),
      total as (
        select ${personasQueCuentan(sql`${e.campanaId}::uuid`)} + (select count(*)::int from nueva) as n
      ),
      cambio as (
        update ${campanas} set estado = 'por_revisar', revision = revision + 1, actualizada_en = now()
        where id = ${e.campanaId}::uuid and estado = 'reuniendo'
          and exists (select 1 from nueva) and (select n from total) >= ${UMBRAL_IMPULSO}
        returning *
      ),
      historia as (
        insert into ${campanaEdiciones} (campana_id, revision, contrato, estado, motivo)
        select id, revision, contrato, estado, ${`Trajo ${UMBRAL_IMPULSO} personas nuevas: pasa a revisión.`} from cambio
        returning id
      )
      select c.id, c.slug, c.creador_id, exists (select 1 from cambio) as paso
      from ${campanas} c
      where c.id = ${e.campanaId}::uuid and exists (select 1 from nueva)
    `);
    const fila = r.rows[0];
    if (!fila) return { acreditado: false, pasoARevision: false, campana: null };
    return {
      acreditado: true,
      pasoARevision: fila.paso,
      campana: { id: fila.id, slug: fila.slug, creadorId: fila.creador_id },
    };
  }

  async personas(campanaId: string): Promise<number> {
    const r = await this.db.execute<{ n: number }>(
      sql`select ${personasQueCuentan(sql`${campanaId}::uuid`)} as n`,
    );
    return r.rows[0]?.n ?? 0;
  }

  /** Para `GET /campanas/:slug` y las listas: personas que cuentan por campaña. */
  async personasDe(campanaIds: readonly string[]): Promise<Map<string, number>> {
    if (!campanaIds.length) return new Map();
    const ids = sql.raw(
      `'{${campanaIds.map((id) => id.replace(/[^0-9a-f-]/gi, '')).join(',')}}'::uuid[]`,
    );
    const r = await this.db.execute<{ campana_id: string; n: number }>(sql`
      select i.campana_id, count(*)::int as n from ${campanaImpulsos} i
      left join ${senales} s on s.id = i.senal_id
      where i.campana_id = any(${ids})
        and (i.como = 'opiniones' or (s.id is not null and s.estado <> 'retirada' and s.retenida_en is null))
      group by i.campana_id`);
    return new Map(r.rows.map((f) => [f.campana_id, f.n]));
  }

  /** Lo que ve la administración para decidir: reglas, personas y lo que escribieron. */
  async paraRevisar(): Promise<
    {
      id: string;
      slug: string;
      revision: number;
      contrato: ContratoCampana;
      impulsadaPor: string;
      personas: number;
      presentadaEn: string;
      aportesTraidos: { id: string; texto: string; provincia: string | null }[];
    }[]
  > {
    const r = await this.db.execute<{
      id: string;
      slug: string;
      revision: number;
      contrato: ContratoCampana;
      impulsada_por: string;
      personas: number;
      presentada_en: string;
      aportes: { id: string; texto: string; provincia: string | null }[] | null;
    }>(sql`
      select c.id, c.slug, c.revision, c.contrato, coalesce(nullif(c.contrato->>'responsable', ''), u.name) as impulsada_por,
        ${personasQueCuentan(sql`c.id`)} as personas,
        to_char(c.actualizada_en at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as presentada_en,
        (select jsonb_agg(jsonb_build_object('id', s.id_publico, 'texto', ${textoDeSenalPublica}, 'provincia', g.name) order by s.creada_en)
           from ${campanaImpulsos} i join ${senales} s on s.id = i.senal_id
           left join geographic_locations g on g.id = s.province_id
           where i.campana_id = c.id and s.estado <> 'retirada' and s.retenida_en is null) as aportes
      from ${campanas} c join ${users} u on u.id = c.creador_id
      where c.estado = 'por_revisar'
      order by c.actualizada_en`);
    return r.rows.map((f) => ({
      id: f.id,
      slug: f.slug,
      revision: f.revision,
      contrato: f.contrato,
      impulsadaPor: f.impulsada_por,
      personas: f.personas,
      presentadaEn: f.presentada_en,
      aportesTraidos: f.aportes ?? [],
    }));
  }

  /** Las campañas que una cuenta tiene juntando gente o en revisión: una por vez. */
  async activasDe(uid: number): Promise<number> {
    const r = await this.db.execute<{ n: number }>(sql`
      select count(*)::int as n from ${campanas}
      where creador_id = ${uid} and estado in ('reuniendo', 'por_revisar')`);
    return r.rows[0]?.n ?? 0;
  }

  /** Avisos en Mi espacio (`eventos_civicos`), idempotentes por clave. */
  async avisar(
    userIds: readonly number[],
    clave: string,
    titulo: string,
    href: string,
  ): Promise<void> {
    if (!userIds.length) return;
    const ids = sql.raw(`'{${userIds.map((n) => Math.trunc(n)).join(',')}}'::int[]`);
    await this.db.execute(sql`
      insert into eventos_civicos (user_id, clave, titulo, href)
      select u, ${clave}, ${titulo}, ${href} from unnest(${ids}) as u
      where not exists (select 1 from preferencias_civicas p where p.user_id = u and not p.avisos)
      on conflict do nothing`);
  }

  /** Los ids de las cuentas administradoras, por su nombre de usuario. */
  async idsDe(usernames: readonly string[]): Promise<number[]> {
    if (!usernames.length) return [];
    const r = await this.db.execute<{ id: number }>(sql`
      select id from ${users} where username = any(${sql.raw(`array[${usernames.map((u) => `'${u.replace(/'/g, "''")}'`).join(',')}]::text[]`)})`);
    return r.rows.map((f) => f.id);
  }
}
