import { and, desc, eq, isNull, or, sql } from 'drizzle-orm';

import { campanas, contribuciones } from '../schema/campanas.js';
import { analisisGuardados, eventosCivicos, seguimientos } from '../schema/continuidad.js';
import { fichasFuturo } from '../schema/fichas.js';
import { geographicLocations } from '../schema/geographic.js';
import { senales } from '../schema/senales.js';

import { campanaPublicada, contratoPublicoCampana } from './participacion-consulta.js';

import type { Db } from '../client.js';
import type { AportePropio, EspacioPersonal, SeguimientoTipo } from '@v2/shared';

const PROPIOS = {
  id: senales.idPublico,
  texto: senales.texto,
  tipo: senales.tipo,
  estado: senales.estado,
  tema: senales.tema,
  creadaEn: senales.creadaEn,
  revision: senales.actualizadaEn,
  cedeLicencia: senales.cesionLicencia,
  precision: senales.precision,
  campanaId: contribuciones.campanaId,
  campanaTitulo: sql<string | null>`${campanas.contrato}->>'titulo'`,
  edicion: contribuciones.edicion,
};
export class MiEspacioRepository {
  constructor(private readonly db: Db) {}
  async aportePrivado(id: string, uid?: number, actorId?: number | null) {
    const r = await this.db.execute<{
      texto: string;
      revision: string;
      cedeLicencia: boolean;
      textoProtegido: boolean;
    }>(
      sql`select texto,to_char(date_trunc('milliseconds',actualizada_en) at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as revision,cesion_licencia as "cedeLicencia",(clase in('hecho','acto') or exists(select 1 from adhesiones a where a.senal_id=s.id)) as "textoProtegido" from senales s where id_publico=${id}::uuid and (user_id=${uid ?? null} or (user_id is null and actor_id=${actorId ?? null}))`,
    );
    return r.rows[0] ?? null;
  }
  async propios(
    uid: number,
    offset = 0,
  ): Promise<{ aportes: AportePropio[]; totalAportes: number }> {
    const filas = await this.db
      .select({ ...PROPIOS, total: sql<number>`count(*) over()::int` })
      .from(senales)
      .leftJoin(contribuciones, eq(senales.idPublico, contribuciones.senalId))
      .leftJoin(campanas, eq(contribuciones.campanaId, campanas.id))
      .where(eq(senales.userId, uid))
      .orderBy(desc(senales.creadaEn))
      .limit(200)
      .offset(offset);
    return {
      totalAportes: filas[0]?.total ?? 0,
      aportes: filas.map(({ total: _n, creadaEn, revision, ...f }) => ({
        ...f,
        creadaEn: creadaEn.toISOString(),
        revision: revision.toISOString(),
      })),
    };
  }
  async candidatos(actorId: number | null) {
    if (actorId === null) return [];
    return this.db
      .select({
        id: senales.idPublico,
        texto: senales.texto,
        tipo: senales.tipo,
        fecha: senales.creadaEn,
      })
      .from(senales)
      .where(
        and(
          eq(senales.actorId, actorId),
          isNull(senales.userId),
          sql`${senales.estado}<>'retirada'`,
        ),
      )
      .orderBy(desc(senales.creadaEn))
      .limit(100);
  }
  async vincular(uid: number, actorId: number | null, ids: string[]): Promise<boolean> {
    const r = await this.db.execute<{ id: string }>(sql`with elegibles as (
      select id_publico from ${senales} where (user_id=${uid} or (actor_id=${actorId} and user_id is null)) and id_publico in (${sql.join(
        ids.map((id) => sql`${id}::uuid`),
        sql`,`,
      )}) for update
    ) update ${senales} set user_id=${uid},actualizada_en=case when user_id is null then now() else actualizada_en end
      where id_publico in (select id_publico from elegibles) and (select count(*) from elegibles)=${ids.length} returning id_publico as id`);
    return r.rows.length === ids.length;
  }
  async esPropio(id: string, uid?: number, actorId?: number | null): Promise<boolean> {
    const condicion = or(
      uid ? eq(senales.userId, uid) : sql`false`,
      actorId ? and(isNull(senales.userId), eq(senales.actorId, actorId)) : sql`false`,
    );
    const [fila] = await this.db
      .select({ id: senales.idPublico })
      .from(senales)
      .where(and(eq(senales.idPublico, id), condicion))
      .limit(1);
    return Boolean(fila);
  }
  async corregir(
    id: string,
    revision: string,
    texto: string,
    cede: boolean,
    uid?: number,
    actorId?: number | null,
  ) {
    const r = await this.db.execute<{ id: string }>(sql`with cambio as (
      update ${senales} set texto=${texto},cesion_licencia=${cede},cesion_en=${cede ? new Date() : null},cesion_version=${cede ? 1 : null},actualizada_en=greatest(date_trunc('milliseconds',clock_timestamp()),date_trunc('milliseconds',actualizada_en)+interval '1 millisecond')
      where id_publico=${id}::uuid and date_trunc('milliseconds',actualizada_en)=${new Date(revision).toISOString()}::timestamptz and estado<>'retirada'
        and (texto=${texto} or (clase in('deseo','meta') and not exists(select 1 from adhesiones a where a.senal_id=senales.id)))
        and (user_id=${uid ?? null} or (user_id is null and actor_id=${actorId ?? null})) returning id_publico
    ), origen as (update ${contribuciones} set fragmentos='[]'::jsonb where senal_id in (select id_publico from cambio) returning senal_id), vectores as (delete from analisis_vectores where fuente='senales' and fuente_id in (select id_publico::text from cambio) returning fuente_id)
    select id_publico as id from cambio`);
    return r.rows.length === 1;
  }
  async retirar(id: string, uid?: number, actorId?: number | null) {
    const r = await this.db.execute<{ id: string }>(sql`with cambio as (
      update ${senales} set estado='retirada',texto='',titulo=null,firma=null,actualizada_en=now(),estado_desde=now()
      where id_publico=${id}::uuid and (user_id=${uid ?? null} or (user_id is null and actor_id=${actorId ?? null})) returning id_publico
    ), origen as (update ${contribuciones} set fragmentos='[]'::jsonb where senal_id in (select id_publico from cambio) returning senal_id), vectores as (delete from analisis_vectores where fuente='senales' and fuente_id in (select id_publico::text from cambio) returning fuente_id)
    select id_publico as id from cambio`);
    return r.rows.length === 1;
  }
  async referencia(
    tipo: SeguimientoTipo,
    objeto: string,
  ): Promise<{ titulo: string; href: string } | null> {
    if (tipo === 'campana') {
      const [c] = await this.db
        .select({
          titulo: sql<string>`(${contratoPublicoCampana})->>'titulo'`,
          slug: campanas.slug,
        })
        .from(campanas)
        .where(and(eq(campanas.id, objeto), campanaPublicada));
      return c ? { titulo: c.titulo, href: `/campanas/${c.slug}` } : null;
    }
    if (tipo === 'ficha') {
      const [f] = await this.db
        .select({ titulo: sql<string>`${fichasFuturo.contenido}->>'titulo'` })
        .from(fichasFuturo)
        .where(eq(fichasFuturo.id, objeto));
      return f ? { titulo: f.titulo, href: `/fichas/${objeto}` } : null;
    }
    if (tipo === 'territorio') {
      const [g] = await this.db
        .select({ nombre: geographicLocations.name })
        .from(geographicLocations)
        .where(eq(geographicLocations.id, Number(objeto)));
      return g ? { titulo: g.nombre, href: `/el-mapa?lugar=${objeto}` } : null;
    }
    return { titulo: objeto, href: `/el-mapa?tema=${encodeURIComponent(objeto)}` };
  }
  async seguir(uid: number, tipo: SeguimientoTipo, objeto: string) {
    await this.db.insert(seguimientos).values({ userId: uid, tipo, objeto }).onConflictDoNothing();
  }
  async dejar(uid: number, id: string) {
    await this.db
      .delete(seguimientos)
      .where(and(eq(seguimientos.userId, uid), eq(seguimientos.id, id)));
  }
  async espacio(uid: number): Promise<EspacioPersonal> {
    const [propios, lista, analisis] = await Promise.all([
      this.propios(uid),
      this.db.select().from(seguimientos).where(eq(seguimientos.userId, uid)).limit(200),
      this.db
        .select({
          id: analisisGuardados.id,
          nombre: analisisGuardados.nombre,
          consulta: analisisGuardados.consulta,
          corte: analisisGuardados.corte,
        })
        .from(analisisGuardados)
        .where(eq(analisisGuardados.userId, uid))
        .orderBy(desc(analisisGuardados.creadaEn))
        .limit(100),
    ]);
    const refs = await Promise.all(
      lista.map(async (f) => ({
        id: f.id,
        tipo: f.tipo,
        objeto: f.objeto,
        ...((await this.referencia(f.tipo as SeguimientoTipo, f.objeto)) ?? {
          titulo: 'Este proceso ya no está disponible.',
          href: '/mi-espacio',
        }),
      })),
    );
    const procesos = await this.db.execute<{
      id: string;
      tipo: string;
      titulo: string;
      href: string;
      revision: number;
    }>(sql`select id,'ficha' as tipo,contenido->>'titulo' as titulo,'/fichas/'||id as href,revision from fichas_futuro f where creador_id=${uid} or exists(select 1 from ficha_afirmaciones a where a.ficha_id=f.id and a.creador_id=${uid}) or exists(select 1 from ficha_alternativas a where a.ficha_id=f.id and (a.creador_id=${uid} or exists(select 1 from pruebas_territoriales p where p.alternativa_id=a.id and (p.creador_id=${uid} or p.responsable_id=${uid})))) or exists(select 1 from colaboraciones col where col.tipo='ficha' and col.objeto=f.id and col.usuario_id=${uid} and col.aceptada_en is not null and col.revocada_en is null)
      union all select id,'campana' as tipo,contrato->>'titulo' as titulo,'/campanas/'||slug as href,revision from campanas c where creador_id=${uid} or exists(select 1 from colaboraciones col where col.tipo='campana' and col.objeto=c.id and col.usuario_id=${uid} and col.aceptada_en is not null and col.revocada_en is null) order by titulo limit 200`);
    return {
      ...propios,
      procesos: procesos.rows,
      seguimientos: refs,
      analisis: analisis.map((a) => ({ ...a, corte: a.corte?.toISOString() ?? null })),
    };
  }
  async guardarAnalisis(
    uid: number,
    nombre: string,
    consulta: Record<string, string>,
    corte: string | null,
  ) {
    const [fila] = await this.db
      .insert(analisisGuardados)
      .values({ userId: uid, nombre, consulta, corte: corte ? new Date(corte) : null })
      .returning({ id: analisisGuardados.id });
    return fila?.id;
  }
  async borrarAnalisis(uid: number, id: string) {
    await this.db
      .delete(analisisGuardados)
      .where(and(eq(analisisGuardados.userId, uid), eq(analisisGuardados.id, id)));
  }
  async avisos(uid: number) {
    return this.db
      .select({
        id: eventosCivicos.id,
        titulo: eventosCivicos.titulo,
        href: eventosCivicos.href,
        leidoEn: eventosCivicos.leidoEn,
        fecha: eventosCivicos.creadaEn,
      })
      .from(eventosCivicos)
      .where(eq(eventosCivicos.userId, uid))
      .orderBy(desc(eventosCivicos.creadaEn))
      .limit(100);
  }
  async leer(uid: number, id: string) {
    await this.db
      .update(eventosCivicos)
      .set({ leidoEn: new Date() })
      .where(and(eq(eventosCivicos.userId, uid), eq(eventosCivicos.id, id)));
  }
  async exportarPropios(uid: number) {
    // Lectura privada por titular. No incluye contraseñas, cookies ni textos de terceros.
    const [aportes, seguidos, analisis, opinionesPropias] = await Promise.all([
      this.db
        .select({ ...PROPIOS, fragmentos: contribuciones.fragmentos })
        .from(senales)
        .leftJoin(contribuciones, eq(contribuciones.senalId, senales.idPublico))
        .leftJoin(campanas, eq(campanas.id, contribuciones.campanaId))
        .where(eq(senales.userId, uid)),
      this.db
        .select({ tipo: seguimientos.tipo, objeto: seguimientos.objeto })
        .from(seguimientos)
        .where(eq(seguimientos.userId, uid)),
      this.db
        .select({
          nombre: analisisGuardados.nombre,
          consulta: analisisGuardados.consulta,
          corte: analisisGuardados.corte,
        })
        .from(analisisGuardados)
        .where(eq(analisisGuardados.userId, uid)),
      this.db.execute<{ afirmacionId: string; valor: string; fecha: string }>(
        sql`select afirmacion_id as "afirmacionId",valor,respondida_en::text as fecha from opiniones where user_id=${uid}`,
      ),
    ]);
    const creaciones = await this.db.execute<{
      tipo: string;
      datos: unknown;
    }>(sql`select 'afirmacion' as tipo,jsonb_build_object('id',id,'fichaId',ficha_id,'texto',texto,'retiradaEn',retirada_en) as datos from ficha_afirmaciones where creador_id=${uid}
      union all select 'alternativa',jsonb_build_object('id',id,'fichaId',ficha_id,'contenido',contenido) from ficha_alternativas where creador_id=${uid}
      union all select 'prueba',jsonb_build_object('id',id,'alternativaId',alternativa_id,'titulo',titulo,'alcance',alcance,'estado',estado,'revision',revision,'plazo',plazo,'responsableNombre',responsable_nombre) from pruebas_territoriales where creador_id=${uid} or responsable_id=${uid}
      union all select 'evento_de_prueba',jsonb_build_object('pruebaId',prueba_id,'estado',estado,'observacion',observacion,'evidencia',evidencia,'fecha',fecha) from prueba_eventos where autor_id=${uid}`);
    const espacio = await this.espacio(uid);
    return {
      generadoEn: new Date().toISOString(),
      procesos: espacio.procesos,
      creaciones: creaciones.rows,
      aportes,
      seguimientos: seguidos,
      analisis,
      respuestasPropias: opinionesPropias.rows,
      borradores: 'Los borradores guardados solo en tu dispositivo no se subieron a la cuenta.',
    };
  }
}
