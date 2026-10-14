import { and, desc, eq, inArray, sql } from 'drizzle-orm';

import { fichaArgumentos } from '../schema/deliberacion.js';
import { fichaAfirmaciones } from '../schema/diseno.js';
import { fichasFuturo, fichasRevisiones } from '../schema/fichas.js';
import { geographicLocations } from '../schema/geographic.js';
import { senales } from '../schema/senales.js';

import { ColaboracionRepository } from './colaboracion.js';
import { DeliberacionFichaRepository } from './deliberacion-ficha.js';
import { textoDeSenalPublica } from './senal-publicacion.js';

import type { Db } from '../client.js';
import type { ContenidoFicha, FichaFuturo } from '@v2/shared';

/** Cuánto del futuro deseado entra en la tarjeta de la lista. */
const LARGO_EXTRACTO = 180;

/**
 * El comienzo del futuro deseado, para que la lista diga de qué trata cada ficha.
 *
 * Junta los espacios y saltos de línea, corta en el borde de una palabra y marca el
 * corte con «…». Una ficha vieja puede no tener `futuro` o tenerlo con otra forma:
 * en ese caso no hay extracto y devuelve `''`.
 */
export function extractoDeFuturo(futuro: unknown): string {
  if (typeof futuro !== 'string') return '';
  const texto = futuro.replace(/\s+/g, ' ').trim();
  if (texto.length <= LARGO_EXTRACTO) return texto;
  const borde =
    texto[LARGO_EXTRACTO] === ' ' ? LARGO_EXTRACTO : texto.lastIndexOf(' ', LARGO_EXTRACTO);
  const corte = borde > LARGO_EXTRACTO / 2 ? borde : LARGO_EXTRACTO;
  const cabeza = texto.slice(0, corte).replace(/[\s,;:.–—-]+$/u, '');
  // Un corte duro no parte un carácter fuera del plano básico por la mitad.
  return `${/[\uD800-\uDBFF]$/.test(cabeza) ? cabeza.slice(0, -1) : cabeza}…`;
}

/** Las claves de tema de una ficha: sin repetidas ni textos vacíos, y `[]` si la forma es otra. */
export function temasDeLaFicha(temas: unknown): string[] {
  if (!Array.isArray(temas)) return [];
  const claves = temas.filter((t): t is string => typeof t === 'string' && t.trim() !== '');
  return [...new Set(claves)];
}

/** Lo que la lista muestra de cada ficha, sin abrirla. */
export interface FichaDeLista {
  id: string;
  revision: number;
  titulo: string;
  territorioId: number | null;
  territorioNombre: string | null;
  actualizadaEn: Date;
  /** El comienzo del futuro deseado; `''` si la ficha no lo tiene. */
  extracto: string;
  /** Claves del catálogo de temas (una ficha vieja puede traer texto escrito a mano). */
  temas: string[];
  /** Afirmaciones vigentes: las mismas que lista el diseño de la ficha (sin las retiradas). */
  afirmaciones: number;
}

export class FichasRepository {
  constructor(private readonly db: Db) {}

  async listar(
    territorioId?: number,
    campanaId?: string,
  ): Promise<{ fichas: FichaDeLista[]; total: number }> {
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
        futuro: sql<unknown>`${fichasFuturo.contenido}->'futuro'`,
        temas: sql<unknown>`${fichasFuturo.contenido}->'temas'`,
        afirmaciones: sql<number>`(select count(*)::int from ${fichaAfirmaciones} where ${fichaAfirmaciones.fichaId} = ${fichasFuturo.id} and ${fichaAfirmaciones.retiradaEn} is null)`,
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
    return {
      fichas: filas.map(({ total: _total, futuro, temas, ...f }) => ({
        ...f,
        extracto: extractoDeFuturo(futuro),
        temas: temasDeLaFicha(temas),
      })),
      total: filas[0]?.total ?? 0,
    };
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
    const referencias = [
      ...new Set(fila.contenido.sintesis?.acuerdos.flatMap((a) => a.argumentoIds) ?? []),
    ];
    const vigentes = referencias.length
      ? await this.db
          .select({ id: fichaArgumentos.id })
          .from(fichaArgumentos)
          .where(
            and(
              eq(fichaArgumentos.fichaId, id),
              inArray(fichaArgumentos.id, referencias),
              sql`${fichaArgumentos.retiradaEn} is null`,
            ),
          )
      : [];
    const idsVigentes = new Set(vigentes.map((a) => a.id));
    const sintesisRevisar = referencias.some((ref) => !idsVigentes.has(ref));
    const contenidoPublico = sintesisRevisar
      ? { ...fila.contenido, sintesis: undefined }
      : fila.contenido;
    const { sintesis: sintesisPublica, ...contenidoSinSintesis } = contenidoPublico;
    return {
      sintesisRevisar,
      id: fila.id,
      revision: fila.revision,
      contenido: {
        ...contenidoSinSintesis,
        ...(sintesisPublica ? { sintesis: sintesisPublica } : {}),
      },
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

  async referenciasValidas(contenido: ContenidoFicha, fichaId?: string): Promise<boolean> {
    if (
      !(await new DeliberacionFichaRepository(this.db).referenciasSintesisValidas(
        contenido,
        fichaId,
      ))
    )
      return false;
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
    const territorios = [
      ...new Set([
        ...(contenido.cuaderno?.fuentes.flatMap((f) =>
          f.territorioId === null ? [] : [f.territorioId],
        ) ?? []),
        ...(contenido.cuaderno?.objetivos.flatMap((o) => o.territorios) ?? []),
      ]),
    ];
    if (territorios.length) {
      const lugares = await this.db
        .select({ id: geographicLocations.id })
        .from(geographicLocations)
        .where(inArray(geographicLocations.id, territorios));
      if (lugares.length !== territorios.length) return false;
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
          coalesce((select jsonb_agg(key order by key) from jsonb_object_keys(cambio.contenido || (select contenido from anterior)) as key
            where cambio.contenido->key is distinct from (select contenido->key from anterior)), '[]'::jsonb)
        from cambio returning ficha_id
      ), avisos as (insert into eventos_civicos(user_id,clave,titulo,href)
        select s.user_id,'ficha:'||c.id||':'||c.revision,'Un futuro que seguís tiene una nueva revisión.','/fichas/'||c.id from cambio c join seguimientos s on s.tipo='ficha' and s.objeto=c.id::text where not exists(select 1 from preferencias_civicas p where p.user_id=s.user_id and not p.avisos) on conflict do nothing returning id)
      select id from cambio`);
    return resultado.rows.length === 1;
  }
}
