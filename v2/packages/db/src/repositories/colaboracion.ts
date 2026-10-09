import { createHash, randomBytes } from 'node:crypto';

import { and, eq, sql } from 'drizzle-orm';

import { colaboraciones, preferenciasCivicas, revisionesDevolucion } from '../schema/colaboracion';

import type { Db } from '../client';
const hash = (s: string) => createHash('sha256').update(s).digest('hex');
export class ColaboracionRepository {
  constructor(private readonly db: Db) {}
  async propietario(tipo: 'ficha' | 'campana', id: string, uid: number) {
    const tabla = tipo === 'ficha' ? sql`fichas_futuro` : sql`campanas`;
    const r = await this.db.execute<{ ok: boolean }>(
      sql`select true ok from ${tabla} where id=${id}::uuid and creador_id=${uid}`,
    );
    return Boolean(r.rows[0]);
  }
  async puedeEditar(tipo: 'ficha' | 'campana', id: string, uid: number) {
    if (await this.propietario(tipo, id, uid)) return true;
    const r = await this.db.execute<{ ok: boolean }>(
      sql`select true ok from colaboraciones where tipo=${tipo} and objeto=${id}::uuid and usuario_id=${uid} and aceptada_en is not null and revocada_en is null and rol='editor' limit 1`,
    );
    return Boolean(r.rows[0]);
  }
  async invitar(tipo: 'ficha' | 'campana', id: string, uid: number, rol: 'editor' | 'facilitador') {
    const codigo = randomBytes(32).toString('hex');
    const [r] = await this.db
      .insert(colaboraciones)
      .values({
        tipo,
        objeto: id,
        creadorId: uid,
        rol,
        codigoHash: hash(codigo),
        venceEn: new Date(Date.now() + 7 * 86400000),
      })
      .returning({ id: colaboraciones.id });
    if (!r) throw new Error('No pudimos crear la invitación.');
    return { id: r.id, codigo, venceEn: new Date(Date.now() + 7 * 86400000).toISOString() };
  }
  async invitacion(codigo: string) {
    const r = await this.db.execute<{ tipo: 'ficha' | 'campana'; objeto: string; rol: string }>(
      sql`select tipo,objeto,rol from colaboraciones where codigo_hash=${hash(codigo)} and aceptada_en is null and revocada_en is null and vence_en>now()`,
    );
    return r.rows[0] ?? null;
  }
  async aceptar(codigo: string, uid: number) {
    const r = await this.db.execute<{ id: string }>(
      sql`update colaboraciones set usuario_id=${uid},aceptada_en=now() where codigo_hash=${hash(codigo)} and usuario_id is null and creador_id<>${uid} and revocada_en is null and vence_en>now() returning id`,
    );
    if (r.rows[0]) return true;
    const [previa] = await this.db
      .select({ id: colaboraciones.id })
      .from(colaboraciones)
      .where(
        and(
          eq(colaboraciones.codigoHash, hash(codigo)),
          eq(colaboraciones.usuarioId, uid),
          sql`${colaboraciones.revocadaEn} is null`,
        ),
      );
    return Boolean(previa);
  }
  async listar(tipo: string, id: string, uid: number) {
    return this.db
      .select({
        id: colaboraciones.id,
        rol: colaboraciones.rol,
        aceptadaEn: colaboraciones.aceptadaEn,
        revocadaEn: colaboraciones.revocadaEn,
        venceEn: colaboraciones.venceEn,
      })
      .from(colaboraciones)
      .where(
        and(
          eq(colaboraciones.tipo, tipo),
          eq(colaboraciones.objeto, id),
          eq(colaboraciones.creadorId, uid),
        ),
      );
  }
  async revocar(id: string, uid: number) {
    const r = await this.db
      .update(colaboraciones)
      .set({ revocadaEn: new Date() })
      .where(and(eq(colaboraciones.id, id), eq(colaboraciones.creadorId, uid)))
      .returning({ id: colaboraciones.id });
    return Boolean(r[0]);
  }
  async correcciones(campana: string) {
    return this.db
      .select({
        id: revisionesDevolucion.id,
        texto: revisionesDevolucion.texto,
        respuesta: revisionesDevolucion.respuesta,
        fecha: revisionesDevolucion.creadaEn,
      })
      .from(revisionesDevolucion)
      .where(eq(revisionesDevolucion.campanaId, campana))
      .orderBy(revisionesDevolucion.creadaEn)
      .limit(200);
  }
  async corregir(campana: string, uid: number, idLocal: string, texto: string) {
    const r = await this.db.execute<{ id: string }>(
      sql`insert into revisiones_devolucion(campana_id,autor_id,id_local,texto) select c.id,${uid},${idLocal}::uuid,${texto} from campanas c where c.id=${campana}::uuid and c.estado<>'borrador' and exists(select 1 from contribuciones a join senales s on s.id_publico=a.senal_id where a.campana_id=c.id and s.user_id=${uid}) on conflict(autor_id,id_local) do update set id=revisiones_devolucion.id where revisiones_devolucion.campana_id=excluded.campana_id and revisiones_devolucion.texto=excluded.texto returning id`,
    );
    return r.rows[0]?.id;
  }
  async responderCorreccion(campana: string, id: string, uid: number, texto: string) {
    const r = await this.db.execute<{ id: string }>(
      sql`update revisiones_devolucion set respuesta=${texto},respondida_en=now() where id=${id}::uuid and campana_id=${campana}::uuid and exists(select 1 from campanas where id=${campana}::uuid and creador_id=${uid}) returning id`,
    );
    return Boolean(r.rows[0]);
  }
  async preferencias(uid: number) {
    const [p] = await this.db
      .select({ avisos: preferenciasCivicas.avisos })
      .from(preferenciasCivicas)
      .where(eq(preferenciasCivicas.userId, uid));
    return p ?? { avisos: true };
  }
  async preferir(uid: number, avisos: boolean) {
    await this.db
      .insert(preferenciasCivicas)
      .values({ userId: uid, avisos })
      .onConflictDoUpdate({ target: preferenciasCivicas.userId, set: { avisos } });
  }
}
