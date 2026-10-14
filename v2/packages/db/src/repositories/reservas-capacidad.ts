import { sql } from 'drizzle-orm';

import {
  conCapacidadBloqueada,
  hoyCapacidad,
  huellaCapacidad,
  ocupacion,
  senalDisponible,
} from './capacidades.js';
import { editorFichaSql } from './deliberacion-ficha.js';

import type { Db } from '../client.js';
import type { AccionReserva, SolicitudCapacidad } from '@v2/shared';

export class ReservasCapacidadRepository {
  constructor(private readonly db: Db) {}
  async solicitar(id: string, uid: number, v: SolicitudCapacidad) {
    const huella = huellaCapacidad({ id, ...v });
    const r = await conCapacidadBloqueada(
      this.db,
      id,
      this.db.execute<{ id: string }>(sql`
      insert into reservas_capacidad(capacidad_id,solicitante_id,ficha_id,id_local,huella,cantidad,para_fecha,necesidad,compatibilidad)
      select c.id,${uid},${v.fichaId}::uuid,${v.idLocal}::uuid,${huella},${v.cantidad},${v.paraFecha}::date,${v.necesidad},${v.compatibilidad}
      from capacidades c where c.id=${id}::uuid and c.oferente_id<>${uid} and not c.cerrada and ${senalDisponible}
      and ${v.paraFecha}::date between c.desde and c.hasta and ${v.paraFecha}::date>=${hoyCapacidad}
      and ((c.cantidad is null and ${v.cantidad}::int is null) or (c.cantidad is not null and ${v.cantidad}::int between 1 and c.cantidad))
      and ${editorFichaSql(v.fichaId, uid)}
      on conflict(solicitante_id,id_local) do nothing returning id`),
    );
    if (r.rows[0]) return r.rows[0].id;
    const previo = await this.db.execute<{ id: string }>(
      sql`select id from reservas_capacidad where solicitante_id=${uid} and id_local=${v.idLocal}::uuid and huella=${huella}`,
    );
    return previo.rows[0]?.id ?? null;
  }
  async actuar(capacidadId: string, id: string, uid: number, v: AccionReserva) {
    // El estado actual se evalúa después del bloqueo; el cliente nunca fija un estado arbitrario.
    const oferente = sql`c.oferente_id=${uid}`;
    const solicitante = sql`r.solicitante_id=${uid}`;
    const autorizada =
      v.accion === 'confirmar_recepcion' || v.accion === 'discrepar'
        ? solicitante
        : v.accion === 'cancelar'
          ? sql`(${oferente} or ${solicitante})`
          : oferente;
    const estado = {
      aceptar: 'reservada',
      rechazar: 'rechazada',
      cancelar: 'cancelada',
      declarar_entrega: 'entrega_declarada',
      confirmar_recepcion: 'entregada',
      discrepar: 'discrepancia',
    }[v.accion];
    const condicion = {
      aceptar: sql`r.estado='propuesta' and exists(select 1 from users u where u.id=r.solicitante_id and u.is_active) and not c.cerrada and ${senalDisponible} and r.para_fecha>=${hoyCapacidad} and (c.cantidad is null or ${ocupacion}+r.cantidad<=c.cantidad)`,
      rechazar: sql`r.estado='propuesta'`,
      cancelar: sql`r.estado in ('propuesta','reservada','discrepancia')`,
      declarar_entrega: sql`r.estado in ('reservada','discrepancia')`,
      confirmar_recepcion: sql`r.estado='entrega_declarada'`,
      discrepar: sql`r.estado='entrega_declarada'`,
    }[v.accion];
    const r = await conCapacidadBloqueada(
      this.db,
      capacidadId,
      this.db.execute<{ id: string }>(sql`
      update reservas_capacidad r set estado=${estado},actualizada_en=now()
      ${v.accion === 'declarar_entrega' ? sql`,nota_entrega=${v.nota}` : sql``}
      ${v.accion === 'discrepar' ? sql`,discrepancia=${v.nota}` : sql``}
      from capacidades c where c.id=${capacidadId}::uuid and r.capacidad_id=c.id and r.id=${id}::uuid
      and ${autorizada} and (${condicion}) returning r.id`),
    );
    if (r.rows.length) return true;
    // Un reintento solo reconoce el mismo resultado; jamás repite el movimiento.
    const anterior = await this.db.execute<{
      id: string;
    }>(sql`select r.id from reservas_capacidad r join capacidades c on c.id=r.capacidad_id
      where c.id=${capacidadId}::uuid and r.id=${id}::uuid and ${autorizada} and r.estado=${estado}
      ${v.accion === 'declarar_entrega' ? sql`and r.nota_entrega=${v.nota}` : sql``}
      ${v.accion === 'discrepar' ? sql`and r.discrepancia=${v.nota}` : sql``}`);
    return anterior.rows.length > 0;
  }
}
