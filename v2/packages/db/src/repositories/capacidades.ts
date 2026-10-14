import { createHash } from 'node:crypto';

import { sql } from 'drizzle-orm';

import type { ConsultaPendiente, Db } from '../client.js';
import type {
  CapacidadPublica,
  ConsultaCapacidades,
  LecturaCapacidad,
  ListaCapacidades,
  NuevaCapacidad,
  ReservaCapacidad,
} from '@v2/shared';

export const hoyCapacidad = sql`(now() at time zone 'UTC')::date`;
export const senalDisponible = sql`exists(select 1 from users u where u.id=c.oferente_id and u.is_active) and exists(select 1 from senales s where s.id_publico=c.senal_id and s.estado not in ('retirada','caducada') and s.retenida_en is null and s.tipo in ('recurso','práctica'))`;
export const ocupacion = sql`coalesce((select sum(case when r.estado='entregada' then coalesce(r.cantidad_declarada,r.cantidad) else r.cantidad end) from reservas_capacidad r where r.capacidad_id=c.id and r.estado in ('reservada','entrega_declarada','discrepancia','entregada')),0)`;
export const huellaCapacidad = (v: unknown) =>
  createHash('sha256').update(JSON.stringify(v)).digest('hex');

/** El bloqueo y la lectura son sentencias distintas en una misma transacción:
 * después de esperar el bloqueo, READ COMMITTED ve lo confirmado por la anterior. */
export async function conCapacidadBloqueada<R>(
  db: Db,
  id: string,
  consulta: ConsultaPendiente<R>,
): Promise<R> {
  const resultados = await db.batch([
    db.execute(sql`select id from capacidades where id=${id}::uuid for update`),
    consulta,
  ]);
  return resultados[1] as R;
}
const campos = (
  uid?: number,
) => sql`c.id,c.senal_id as "senalId",c.titulo,c.tipo,c.unidad,c.cantidad,
  case when c.cantidad is null then null else coalesce((select sum(r.cantidad)::int from reservas_capacidad r where r.capacidad_id=c.id and r.estado in ('reservada','entrega_declarada','discrepancia')),0) end as reservada,
  case when c.cantidad is null then null else coalesce((select sum(coalesce(r.cantidad_declarada,r.cantidad))::int from reservas_capacidad r where r.capacidad_id=c.id and r.estado='entregada'),0) end as entregada,
  (c.cantidad-${ocupacion})::int as disponible,
  c.desde::text,c.hasta::text,c.territorio_id as "territorioId",c.zona,c.restricciones,c.firma,
  to_char(c.confirmada_en at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as "confirmadaEn",c.cerrada,
  (not c.cerrada and c.hasta>=${hoyCapacidad} and ${senalDisponible}) as vigente,
  (c.oferente_id=${uid ?? null}) is true as "esMia"`;
type FilaCapacidad = { [K in keyof CapacidadPublica]: CapacidadPublica[K] };
export class CapacidadesRepository {
  constructor(private readonly db: Db) {}
  async listar(q: ConsultaCapacidades, uid?: number): Promise<ListaCapacidades> {
    const r = await this.db.execute<FilaCapacidad>(sql`select ${campos(uid)} from capacidades c
      where (${senalDisponible} or c.oferente_id=${uid ?? null} or exists(select 1 from reservas_capacidad r where r.capacidad_id=c.id and r.solicitante_id=${uid ?? null}))
      ${q.senalId ? sql`and c.senal_id=${q.senalId}::uuid` : sql``}
      ${q.territorioId ? sql`and c.territorio_id=${q.territorioId}` : sql``}
      ${q.fichaId ? sql`and exists(select 1 from reservas_capacidad r where r.capacidad_id=c.id and r.ficha_id=${q.fichaId}::uuid and (c.oferente_id=${uid ?? null} or r.solicitante_id=${uid ?? null}))` : sql``}
      ${q.propias ? sql`and (c.oferente_id=${uid ?? null} or exists(select 1 from reservas_capacidad r where r.capacidad_id=c.id and r.solicitante_id=${uid ?? null}))` : sql``}
      ${q.despues ? sql`and c.id>${q.despues}::uuid` : sql``}
      order by c.id limit 21`);
    return {
      capacidades: r.rows.slice(0, 20),
      siguiente: r.rows.length > 20 ? (r.rows[19]?.id ?? null) : null,
    };
  }
  async leer(id: string, uid?: number, despues?: string): Promise<LecturaCapacidad | null> {
    const r = await this.db
      .execute<FilaCapacidad>(sql`select ${campos(uid)} from capacidades c where c.id=${id}::uuid and
      (${senalDisponible} or c.oferente_id=${uid ?? null} or exists(select 1 from reservas_capacidad r where r.capacidad_id=c.id and r.solicitante_id=${uid ?? null}))`);
    const capacidad = r.rows[0];
    if (!capacidad) return null;
    const reservas = uid
      ? (
          await this.db.execute<{ [K in keyof ReservaCapacidad]: ReservaCapacidad[K] }>(sql`
      select (select json_build_object('id',t.id,'slug',i.slug,'titulo',t.title) from iniciativa_tasks t join iniciativas i on i.id=t.iniciativa_id where t.id=r.tarea_id) as "tareaVinculada",r.id,r.revision,r.cantidad_declarada as "cantidadDeclarada",r.ficha_id as "fichaId",r.cantidad,r.para_fecha::text as "paraFecha",r.necesidad,r.compatibilidad,r.estado,
      r.nota_entrega as "notaEntrega",r.discrepancia,to_char(r.creada_en at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as "creadaEn",to_char(r.actualizada_en at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as "actualizadaEn",(r.solicitante_id=${uid}) as "soySolicitante"
      from reservas_capacidad r join capacidades c on c.id=r.capacidad_id where c.id=${id}::uuid
      and (c.oferente_id=${uid} or r.solicitante_id=${uid})
      ${despues ? sql`and r.id>${despues}::uuid` : sql``} order by r.id limit 21`)
        ).rows
      : [];
    return {
      capacidad,
      reservas: reservas.slice(0, 20),
      siguiente: reservas.length > 20 ? (reservas[19]?.id ?? null) : null,
    };
  }
  async crear(uid: number, v: NuevaCapacidad) {
    const huella = huellaCapacidad(v);
    const r = await this.db.execute<{
      id: string;
    }>(sql`insert into capacidades(senal_id,oferente_id,id_local,huella,titulo,tipo,unidad,cantidad,desde,hasta,territorio_id,zona,restricciones,firma)
      select ${v.senalId}::uuid,${uid},${v.idLocal}::uuid,${huella},${v.titulo},${v.tipo},${v.unidad},${v.cantidad},${v.desde}::date,${v.hasta}::date,${v.territorioId},${v.zona},${v.restricciones},${v.firma}
      where ${v.hasta}::date>=${hoyCapacidad} and exists(select 1 from senales s where s.id_publico=${v.senalId}::uuid and s.user_id=${uid} and s.tipo in ('recurso','práctica') and s.estado not in ('retirada','caducada') and s.retenida_en is null)
      and (${v.territorioId}::int is null or exists(select 1 from geographic_locations where id=${v.territorioId}))
      on conflict(oferente_id,id_local) do nothing returning id`);
    if (r.rows[0]) return r.rows[0].id;
    const previo = await this.db.execute<{ id: string }>(
      sql`select id from capacidades where oferente_id=${uid} and id_local=${v.idLocal}::uuid and huella=${huella}`,
    );
    return previo.rows[0]?.id ?? null;
  }
  async actuar(id: string, uid: number, accion: 'cerrar' | 'confirmar') {
    const r = await conCapacidadBloqueada(
      this.db,
      id,
      this.db.execute<{ id: string }>(sql`
      update capacidades c set ${accion === 'cerrar' ? sql`cerrada=true` : sql`confirmada_en=now()`}
      where id=${id}::uuid and oferente_id=${uid}
      ${accion === 'confirmar' ? sql`and not cerrada and hasta>=${hoyCapacidad} and ${senalDisponible}` : sql``} returning id`),
    );
    return r.rows.length > 0;
  }
}
