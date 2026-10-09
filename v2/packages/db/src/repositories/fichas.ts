import { and, desc, eq, inArray, sql } from 'drizzle-orm';

import { fichasFuturo, fichasRevisiones } from '../schema/fichas.js';
import { geographicLocations } from '../schema/geographic.js';
import { senales } from '../schema/senales.js';

import { ColaboracionRepository } from './colaboracion.js';
import { textoDeSenalPublica } from './senal-publicacion.js';

import type { Db } from '../client.js';
import type { ContenidoFicha, FichaFuturo } from '@v2/shared';

export class FichasRepository {
  constructor(private readonly db: Db) {}

  async listar(territorioId?: number, campanaId?: string) {
    const filtro =
      territorioId === undefined ? undefined : eq(fichasFuturo.territorioId, territorioId);
    const filas = await this.db
      .select({
        id: fichasFuturo.id,
        revision: fichasFuturo.revision,
        titulo: sql<string>`${fichasFuturo.contenido}->>'titulo'`,
        territorioId: fichasFuturo.territorioId,
        territorioNombre: geographicLocations.name,
        actualizadaEn: fichasFuturo.actualizadaEn,
        total: sql<number>`count(*) over()::int`,
      })
      .from(fichasFuturo)
      .leftJoin(geographicLocations, eq(fichasFuturo.territorioId, geographicLocations.id))
      .where(
        and(
          filtro,
          ...(campanaId ? [sql`${fichasFuturo.contenido}->>'campanaId'=${campanaId}`] : []),
        ),
      )
      .orderBy(desc(fichasFuturo.actualizadaEn), fichasFuturo.id)
      .limit(50);
    return { fichas: filas.map(({ total: _total, ...f }) => f), total: filas[0]?.total ?? 0 };
  }

  async porId(id: string, usuarioId?: number): Promise<FichaFuturo | null> {
    const [fila] = await this.db
      .select()
      .from(fichasFuturo)
      .where(eq(fichasFuturo.id, id))
      .limit(1);
    if (!fila) return null;
    const historial = await this.db
      .select({
        revision: fichasRevisiones.revision,
        fecha: fichasRevisiones.fecha,
        campos: fichasRevisiones.campos,
      })
      .from(fichasRevisiones)
      .where(eq(fichasRevisiones.fichaId, id))
      .orderBy(desc(fichasRevisiones.revision))
      .limit(100);
    const ids = fila.contenido.vinculos.map((v) => v.senalId);
    const fuentes = ids.length
      ? await this.db
          .select({ id: senales.idPublico, texto: textoDeSenalPublica, estado: senales.estado })
          .from(senales)
          .where(
            and(
              inArray(senales.idPublico, ids),
              sql`${senales.retenidaEn} is null and ${senales.estado} <> 'retirada'`,
            ),
          )
      : [];
    const [lugar] =
      fila.territorioId === null
        ? []
        : await this.db
            .select({ nombre: geographicLocations.name })
            .from(geographicLocations)
            .where(eq(geographicLocations.id, fila.territorioId))
            .limit(1);
    return {
      id: fila.id,
      revision: fila.revision,
      contenido: fila.contenido,
      creadaEn: fila.creadaEn.toISOString(),
      actualizadaEn: fila.actualizadaEn.toISOString(),
      puedoInvitar: fila.creadorId === usuarioId,
      puedoEditar:
        usuarioId !== undefined &&
        (await new ColaboracionRepository(this.db).puedeEditar('ficha', fila.id, usuarioId)),
      territorioNombre: lugar?.nombre ?? null,
      historial: historial.map((h) => ({ ...h, fecha: h.fecha.toISOString() })),
      aportes: fila.contenido.vinculos.map((v) => {
        const fuente = fuentes.find((f) => f.id === v.senalId);
        return {
          ...v,
          disponible: Boolean(fuente),
          texto: fuente?.texto ?? null,
          estado: fuente?.estado ?? null,
        };
      }),
    };
  }

  async referenciasValidas(contenido: ContenidoFicha): Promise<boolean> {
    if (contenido.campanaId) {
      const c = await this.db.execute<{ id: string }>(
        sql`select id from campanas where id=${contenido.campanaId}::uuid and estado<>'borrador'`,
      );
      if (!c.rows.length) return false;
    }
    if (contenido.territorioId !== null) {
      const [lugar] = await this.db
        .select({ id: geographicLocations.id })
        .from(geographicLocations)
        .where(eq(geographicLocations.id, contenido.territorioId));
      if (!lugar) return false;
    }
    const ids = [...new Set(contenido.vinculos.map((v) => v.senalId))];
    if (!ids.length) return true;
    const existentes = await this.db
      .select({ id: senales.idPublico })
      .from(senales)
      .where(inArray(senales.idPublico, ids));
    return existentes.length === ids.length;
  }

  /** Una sentencia: no existe ficha creada sin su primera revisión. */
  async crear(
    usuarioId: number,
    idLocal: string,
    contenido: ContenidoFicha,
  ): Promise<string | null> {
    const resultado = await this.db.execute<{ id: string }>(sql`
      with nueva as (
        insert into ${fichasFuturo} (creador_id, id_local, territorio_id, contenido)
        values (${usuarioId}, ${idLocal}::uuid, ${contenido.territorioId}, ${JSON.stringify(contenido)}::jsonb)
        on conflict (creador_id, id_local) do nothing returning *
      ), rastro as (
        insert into ${fichasRevisiones} (ficha_id, revision, editor_id, contenido, campos)
        select id, revision, creador_id, contenido, ' ["creación"]'::jsonb from nueva returning ficha_id
      ) select id from nueva`);
    if (resultado.rows[0]) return resultado.rows[0].id;
    const [previa] = await this.db
      .select({ id: fichasFuturo.id })
      .from(fichasFuturo)
      .where(
        and(
          eq(fichasFuturo.creadorId, usuarioId),
          eq(fichasFuturo.idLocal, idLocal),
          sql`exists(select 1 from fichas_revisiones h where h.ficha_id=${fichasFuturo.id} and h.revision=1 and h.contenido=${JSON.stringify(contenido)}::jsonb)`,
        ),
      )
      .limit(1);
    return previa?.id ?? null;
  }

  /** Permiso y revisión se comprueban en el mismo UPDATE; historial y documento son atómicos. */
  async editar(
    id: string,
    usuarioId: number,
    revisionEsperada: number,
    contenido: ContenidoFicha,
  ): Promise<boolean> {
    const resultado = await this.db.execute<{ id: string }>(sql`
      with anterior as (select contenido from ${fichasFuturo} where id = ${id}::uuid), cambio as (
        update ${fichasFuturo} set contenido = ${JSON.stringify(contenido)}::jsonb,
          territorio_id = ${contenido.territorioId}, revision = revision + 1, actualizada_en = now()
        where id = ${id}::uuid and (creador_id = ${usuarioId} or exists(select 1 from colaboraciones col where col.tipo='ficha' and col.objeto=${id}::uuid and col.usuario_id=${usuarioId} and col.aceptada_en is not null and col.revocada_en is null and col.rol='editor')) and revision = ${revisionEsperada}
        returning *
      ), rastro as (
        insert into ${fichasRevisiones} (ficha_id, revision, editor_id, contenido, campos)
        select id, revision, ${usuarioId}, cambio.contenido,
          coalesce((select jsonb_agg(key order by key) from jsonb_each(cambio.contenido)
            where value is distinct from (select contenido->key from anterior)), '[]'::jsonb)
        from cambio returning ficha_id
      ), avisos as (insert into eventos_civicos(user_id,clave,titulo,href)
        select s.user_id,'ficha:'||c.id||':'||c.revision,'Un futuro que seguís tiene una nueva revisión.','/fichas/'||c.id from cambio c join seguimientos s on s.tipo='ficha' and s.objeto=c.id::text where not exists(select 1 from preferencias_civicas p where p.user_id=s.user_id and not p.avisos) on conflict do nothing returning id)
      select id from cambio`);
    return resultado.rows.length === 1;
  }
}
