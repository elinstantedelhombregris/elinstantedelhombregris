import { USO_DATOS_CONTRATO_ANTERIOR, METODO_LECTURA_CONTRATO_ANTERIOR } from '@v2/shared';
import { and, desc, eq, or, sql } from 'drizzle-orm';

import {
  campanas,
  campanaEdiciones,
  campanaDevoluciones,
  contribuciones,
} from '../schema/campanas.js';
import { geographicLocations } from '../schema/geographic.js';
import { senales } from '../schema/senales.js';

import { ColaboracionRepository } from './colaboracion.js';
import {
  campanaPublicada,
  contratoPublicoCampana,
  revisionPublicaCampana,
  estadoPublicoCampana,
} from './participacion-consulta.js';

import type { Db } from '../client.js';
import type { CampanaPublica, ContratoCampana, EstadoCampana } from '@v2/shared';

export class CampanasRepository {
  constructor(private readonly db: Db) {}
  async territoriosValidos(ids: number[]): Promise<boolean> {
    if (!ids.length) return true;
    const r = await this.db.execute<{ n: number }>(
      sql`select count(*)::int n from ${geographicLocations} where id in (${sql.join(
        ids.map((id) => sql`${id}`),
        sql`,`,
      )})`,
    );
    return r.rows[0]?.n === ids.length;
  }
  async listar(usuario?: number, propias = false) {
    return this.db
      .select({
        id: campanas.id,
        slug: campanas.slug,
        revision: propias ? campanas.revision : revisionPublicaCampana,
        estado: propias ? campanas.estado : estadoPublicoCampana,
        contrato: propias ? campanas.contrato : contratoPublicoCampana,
        actualizadaEn: campanas.actualizadaEn,
      })
      .from(campanas)
      .where(
        propias && usuario
          ? or(
              eq(campanas.creadorId, usuario),
              sql`exists(select 1 from colaboraciones col where col.tipo='campana' and col.objeto=${campanas.id} and col.usuario_id=${usuario} and col.aceptada_en is not null and col.revocada_en is null and col.rol='editor')`,
            )
          : campanaPublicada,
      )
      .orderBy(desc(campanas.actualizadaEn), campanas.id)
      .limit(100);
  }
  async porId(id: string, usuario?: number, edicion?: number): Promise<CampanaPublica | null> {
    const filtro = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
      ? eq(campanas.id, id)
      : eq(campanas.slug, id);
    let [fila] = await this.db
      .select()
      .from(campanas)
      .where(
        and(
          filtro,
          or(
            campanaPublicada,
            eq(campanas.creadorId, usuario ?? -1),
            sql`exists(select 1 from colaboraciones col where col.tipo='campana' and col.objeto=${campanas.id} and col.usuario_id=${usuario ?? -1} and col.aceptada_en is not null and col.revocada_en is null and col.rol='editor')`,
          ),
        ),
      )
      .limit(1);
    if (!fila) return null;
    const editable =
      usuario !== undefined &&
      (await new ColaboracionRepository(this.db).puedeEditar('campana', fila.id, usuario));
    if (
      (fila.estado === 'borrador' && !editable) ||
      (edicion !== undefined && edicion !== fila.revision)
    ) {
      const [publicada] = await this.db
        .select()
        .from(campanaEdiciones)
        .where(
          and(
            eq(campanaEdiciones.campanaId, fila.id),
            sql`${campanaEdiciones.estado}<>'borrador'`,
            ...(edicion === undefined ? [] : [eq(campanaEdiciones.revision, edicion)]),
          ),
        )
        .orderBy(desc(campanaEdiciones.revision))
        .limit(1);
      if (!publicada) return null;
      fila = {
        ...fila,
        contrato: publicada.contrato,
        revision: publicada.revision,
        estado: 'pausada',
      };
    }
    const [devoluciones, historial, cuenta] = await Promise.all([
      this.db
        .select({
          id: campanaDevoluciones.id,
          edicion: campanaDevoluciones.edicion,
          texto: campanaDevoluciones.texto,
          limites: campanaDevoluciones.limites,
          senales: campanaDevoluciones.senalIds,
          fecha: campanaDevoluciones.fecha,
        })
        .from(campanaDevoluciones)
        .where(eq(campanaDevoluciones.campanaId, fila.id))
        .orderBy(desc(campanaDevoluciones.fecha)),
      this.db
        .select({
          revision: campanaEdiciones.revision,
          estado: campanaEdiciones.estado,
          motivo: campanaEdiciones.motivo,
          fecha: campanaEdiciones.fecha,
        })
        .from(campanaEdiciones)
        .where(eq(campanaEdiciones.campanaId, fila.id))
        .orderBy(desc(campanaEdiciones.revision))
        .limit(100),
      this.db.execute<{ n: number }>(
        sql`select count(*)::int n from ${contribuciones} c join ${senales} s on s.id_publico=c.senal_id where c.campana_id=${fila.id}::uuid and s.estado<>'retirada' and s.retenida_en is null`,
      ),
    ]);
    return {
      id: fila.id,
      slug: fila.slug,
      revision: fila.revision,
      estado: fila.estado,
      contrato: fila.contrato,
      puedoEditar: fila.creadorId === usuario,
      puedoInvitar: fila.creadorId === usuario,
      puedoEditarContrato:
        usuario !== undefined &&
        (await new ColaboracionRepository(this.db).puedeEditar('campana', fila.id, usuario)),
      creadaEn: fila.creadaEn.toISOString(),
      actualizadaEn: fila.actualizadaEn.toISOString(),
      aportes: cuenta.rows[0]?.n ?? 0,
      devoluciones: devoluciones.map((d) => ({ ...d, fecha: d.fecha.toISOString() })),
      historial: historial.map((h) => ({ ...h, fecha: h.fecha.toISOString() })),
    };
  }
  async crear(uid: number, idLocal: string, contrato: ContratoCampana): Promise<string> {
    const valoresAnteriores = JSON.stringify({ usoDatos: USO_DATOS_CONTRATO_ANTERIOR, metodoLectura: METODO_LECTURA_CONTRATO_ANTERIOR, institucion: '' });
    const r = await this.db.execute<{ id: string }>(sql`with nueva as (
      insert into ${campanas} (creador_id,id_local,slug,contrato) values (${uid},${idLocal}::uuid,${`campana-${idLocal}`},${JSON.stringify(contrato)}::jsonb)
      on conflict (creador_id,id_local) do nothing returning *
    ), historia as (insert into ${campanaEdiciones} (campana_id,revision,contrato,estado,motivo) select id,revision,contrato,estado,'Se abrió el borrador.' from nueva returning id)
    select id from nueva union all select id from ${campanas} where creador_id=${uid} and id_local=${idLocal}::uuid and exists(select 1 from campana_ediciones h where h.campana_id=campanas.id and h.revision=1 and (${valoresAnteriores}::jsonb || h.contrato)=${JSON.stringify(contrato)}::jsonb) limit 1`);
    const id = r.rows[0]?.id;
    if (!id) throw new Error('REINTENTO_DISTINTO');
    return id;
  }
  async revisar(
    id: string,
    uid: number,
    revision: number,
    contrato: ContratoCampana,
  ): Promise<boolean> {
    const r = await this.db.execute<{ id: string }>(sql`with cambio as (
      update ${campanas} set contrato=${JSON.stringify(contrato)}::jsonb,revision=revision+1,estado='borrador',actualizada_en=now()
      where id=${id}::uuid and (creador_id=${uid} or exists(select 1 from colaboraciones col where col.tipo='campana' and col.objeto=${id}::uuid and col.usuario_id=${uid} and col.aceptada_en is not null and col.revocada_en is null and col.rol='editor')) and revision=${revision} returning *
    ), historia as (insert into ${campanaEdiciones} (campana_id,revision,contrato,estado,motivo) select id,revision,contrato,estado,'Nueva edición: cambió la pregunta o su contrato.' from cambio returning id)
    select id from cambio`);
    return r.rows.length === 1;
  }
  async cambiarEstado(
    id: string,
    uid: number,
    revision: number,
    estado: EstadoCampana,
    motivo: string,
  ): Promise<boolean> {
    const r = await this.db.execute<{ id: string }>(sql`with cambio as (
      update ${campanas} set estado=${estado},revision=revision+1,actualizada_en=now()
      where id=${id}::uuid and creador_id=${uid} and revision=${revision} returning *
    ), historia as (insert into ${campanaEdiciones} (campana_id,revision,contrato,estado,motivo) select id,revision,contrato,estado,${motivo} from cambio returning id),
    avisos as (insert into eventos_civicos(user_id,clave,titulo,href)
      select s.user_id,'campana:'||c.id||':'||c.revision,'La campaña que seguís cambió de fase.','/campanas/'||c.slug
      from cambio c join seguimientos s on s.tipo='campana' and s.objeto=c.id::text where not exists(select 1 from preferencias_civicas pref where pref.user_id=s.user_id and not pref.avisos) on conflict do nothing returning id)
    select id from cambio`);
    return r.rows.length === 1;
  }
  async devolver(
    id: string,
    uid: number,
    idLocal: string,
    revision: number,
    texto: string,
    limites: string,
    ids: string[],
  ): Promise<boolean> {
    const r = await this.db.execute<{ id: string }>(sql`with nueva as (
      insert into ${campanaDevoluciones} (id,campana_id,edicion,texto,limites,senal_ids)
      select ${idLocal}::uuid,id,${revision},${texto},${limites},${JSON.stringify(ids)}::jsonb from ${campanas}
      where id=${id}::uuid and creador_id=${uid} and (
        (revision=${revision} and estado<>'borrador' and not exists(select 1 from jsonb_array_elements_text(${JSON.stringify(ids)}::jsonb) fuente where not exists(select 1 from contribuciones c where c.campana_id=${id}::uuid and c.senal_id=fuente::uuid)))
        or exists(select 1 from ${campanaDevoluciones} d where d.id=${idLocal}::uuid and d.campana_id=${id}::uuid)
      )
      on conflict(id) do update set id=excluded.id where campana_devoluciones.campana_id=excluded.campana_id and campana_devoluciones.edicion=excluded.edicion and campana_devoluciones.texto=excluded.texto and campana_devoluciones.limites=excluded.limites and campana_devoluciones.senal_ids=excluded.senal_ids
      returning *
    ), avisos as (insert into eventos_civicos(user_id,clave,titulo,href)
      select s.user_id,'devolucion:'||d.id,'Hay una devolución para la campaña que seguís.','/campanas/'||c.slug||'/devolucion'
      from nueva d join ${campanas} c on c.id=d.campana_id join seguimientos s on s.tipo='campana' and s.objeto=c.id::text where not exists(select 1 from preferencias_civicas pref where pref.user_id=s.user_id and not pref.avisos) on conflict do nothing returning id)
    select id from nueva`);
    return r.rows.length === 1;
  }
}
