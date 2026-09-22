import { sql } from 'drizzle-orm';

import { dreams } from '../schema/dreams.js';
import { geographicLocations } from '../schema/geographic.js';
import { territoryMandates } from '../schema/mandato.js';
import { proposals, pulseSignals } from '../schema/pulso.js';
import { senales } from '../schema/senales.js';

import { textoDeSenalPublica } from './senal-publicacion.js';

import type { Db } from '../client.js';
import type { BBox, CapaMapa, SenalMapa } from './civic-map.js';

export interface ConsultaMapa {
  capas: readonly CapaMapa[];
  limite: number;
  hasta: Date;
  desde?: Date;
  bbox?: BBox;
  provinceId?: number;
  cityId?: number;
  lugarId?: number;
  tipo?: string;
  clase?: string;
  tema?: string;
  estado?: string;
  cursor?: { fecha: string; id: string };
}

export interface ResumenProvincia {
  provinceId: number | null;
  total: number;
  tipos: { tipo: string | null; total: number }[];
}

export interface LecturaMapa {
  signals: SenalMapa[];
  metadata: {
    total: number;
    entregados: number;
    completa: boolean;
    hasta: string;
    siguiente: { fecha: string; id: string } | null;
    unidad: 'registros';
    porProvincia: ResumenProvincia[];
    porDia: { dia: string; total: number }[];
    sinPunto: number;
  };
}

/** Las mismas fuentes y filtros para el agregado y el dibujo. Nunca agrega una página. */
export class MapaLecturaRepository {
  constructor(private readonly db: Db) {}

  async leer(q: ConsultaMapa): Promise<LecturaMapa> {
    const fuentes = sql`
      select 'voz:' || ${senales.idPublico}::text as id, 'voz' as capa,
        ${senales.tipo} as tipo, ${senales.clase} as clase,
        ${textoDeSenalPublica} as texto,
        ${senales.lat}::double precision as lat, ${senales.lng}::double precision as lng,
        ${senales.precision} as precision, ${senales.locationRole} as role,
        ${senales.provinceId} as provincia, ${senales.cityId} as ciudad, ${senales.creadaEn} as fecha, ${senales.tema} as tema, ${senales.estado} as estado
      from ${senales} where ${senales.retenidaEn} is null and ${senales.estado} <> 'retirada'
      union all
      select 'voz-v1:' || ${dreams.id}::text, 'voz', ${dreams.category}, null, ${dreams.body},
        ${dreams.lat}::double precision, ${dreams.lng}::double precision, ${dreams.precision},
        ${dreams.locationRole}, ${dreams.provinceId}, ${dreams.cityId}, ${dreams.createdAt}, null, ${dreams.status}
      from ${dreams} where ${dreams.status} = 'approved'
      union all
      select 'pulso:' || ${pulseSignals.id}::text, 'pulso', ${pulseSignals.theme}, null, ${pulseSignals.body},
        ${pulseSignals.lat}::double precision, ${pulseSignals.lng}::double precision, ${pulseSignals.precision},
        ${pulseSignals.locationRole}, ${pulseSignals.provinceId}, ${pulseSignals.cityId}, ${pulseSignals.createdAt}, ${pulseSignals.theme}, null
      from ${pulseSignals}
      union all
      select 'propuesta:' || ${proposals.id}::text, 'propuesta', ${proposals.theme}, null,
        ${proposals.title} || ' — ' || ${proposals.summary}, ${proposals.lat}::double precision,
        ${proposals.lng}::double precision, ${proposals.precision}, ${proposals.locationRole},
        ${proposals.provinceId}, ${proposals.cityId}, ${proposals.createdAt}, ${proposals.theme}, ${proposals.status}
      from ${proposals}
      union all
      select 'mandato:' || ${territoryMandates.id}::text, 'mandato', 'mandato', null,
        'Registro territorial · ' || ${territoryMandates.pulseCount}::text || ' señales',
        null::double precision, null::double precision, 'province', 'capture',
        ${territoryMandates.provinceId}, null::integer, ${territoryMandates.updatedAt}, null, null
      from ${territoryMandates}`;
    const filtros = [sql`fecha <= ${q.hasta.toISOString()}::timestamptz`];
    if (q.capas.length)
      filtros.push(
        sql`capa in (${sql.join(
          q.capas.map((c) => sql`${c}`),
          sql`, `,
        )})`,
      );
    if (q.desde) filtros.push(sql`fecha >= ${q.desde.toISOString()}::timestamptz`);
    if (q.provinceId !== undefined) filtros.push(sql`provincia = ${q.provinceId}`);
    if (q.cityId !== undefined) filtros.push(sql`ciudad = ${q.cityId}`);
    if (q.bbox)
      filtros.push(
        sql`lat between ${q.bbox.sur} and ${q.bbox.norte} and lng between ${q.bbox.oeste} and ${q.bbox.este}`,
      );
    if (q.lugarId !== undefined)
      filtros.push(sql`(provincia = ${q.lugarId} or ciudad in (
      select ${geographicLocations.id} from ${geographicLocations}
      where ${geographicLocations.id} = ${q.lugarId} or ${geographicLocations.departmentId} = ${q.lugarId}
        or ${geographicLocations.municipalityId} = ${q.lugarId} or ${geographicLocations.parentId} = ${q.lugarId}
    ))`);
    if (q.tipo) filtros.push(sql`tipo = ${q.tipo}`);
    if (q.clase) filtros.push(sql`clase = ${q.clase}`);
    if (q.tema) filtros.push(sql`tema = ${q.tema}`);
    if (q.estado) filtros.push(sql`estado = ${q.estado}`);
    const cursor = q.cursor
      ? sql`where (fecha, id) < (${q.cursor.fecha}::timestamptz, ${q.cursor.id})`
      : sql``;
    const result = await this.db.execute<{ lectura: LecturaMapa }>(sql`
      with fuentes as (${fuentes}), elegibles as (
        select * from fuentes where ${sql.join(filtros, sql` and `)}
      ), pagina as (
        select * from elegibles ${cursor} order by fecha desc, id desc limit ${q.limite + 1}
      ), entregada as (
        select * from pagina order by fecha desc, id desc limit ${q.limite}
      ), por_tipo as (
        select provincia, tipo, count(*)::int as total from elegibles group by provincia, tipo
      ), provincias as (
        select provincia, sum(total)::int as total,
          jsonb_agg(jsonb_build_object('tipo', tipo, 'total', total) order by tipo) as tipos
        from por_tipo group by provincia
      ), dias as (
        select to_char(fecha at time zone 'UTC', 'YYYY-MM-DD') as dia, count(*)::int as total
        from elegibles group by 1
      )
      select jsonb_build_object(
        'signals', coalesce((select jsonb_agg(jsonb_build_object(
          'id', id, 'capa', capa, 'tipo', tipo, 'clase', clase, 'texto', texto,
          'lat', lat, 'lng', lng, 'precision', precision, 'role', role,
          'provinceId', provincia, 'cityId', ciudad,
          'estado', estado, 'tema', tema,
          'createdAt', to_char(fecha at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"')
        ) order by fecha desc, id desc) from entregada), '[]'::jsonb),
        'metadata', jsonb_build_object(
          'total', (select count(*)::int from elegibles),
          'entregados', (select count(*)::int from entregada),
          'completa', (select count(*) from elegibles) = (select count(*) from entregada),
          'hasta', ${q.hasta.toISOString()}::text, 'unidad', 'registros',
          'sinPunto', (select count(*)::int from elegibles where lat is null or lng is null),
          'siguiente', case when (select count(*) from pagina) > ${q.limite} then (
            select jsonb_build_object('fecha', to_char(fecha at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'), 'id', id)
            from entregada order by fecha asc, id asc limit 1
          ) else null end,
          'porProvincia', coalesce((select jsonb_agg(jsonb_build_object('provinceId', provincia, 'total', total, 'tipos', tipos) order by provincia) from provincias), '[]'::jsonb),
          'porDia', coalesce((select jsonb_agg(jsonb_build_object('dia', dia, 'total', total) order by dia) from dias), '[]'::jsonb)
        )
      ) as lectura`);
    const fila = result.rows[0];
    if (!fila) throw new Error('El agregado del mapa no devolvió una lectura.');
    return fila.lectura;
  }
}
