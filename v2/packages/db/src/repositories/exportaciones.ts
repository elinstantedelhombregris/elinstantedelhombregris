import { createHash, randomUUID } from 'node:crypto';

import { and, asc, eq, gt, sql } from 'drizzle-orm';

import { exportaciones, exportacionPartes, exportacionRevision } from '../schema/exportaciones.js';

import type { Db } from '../client.js';
import type { SolicitudExportacion, TrabajoExportacion } from '@v2/shared';

export type ExportacionFila = typeof exportaciones.$inferSelect;
export const MAX_BYTES_EXPORTACION = 256 * 1024 * 1024;
export const MAX_REGISTROS_EXPORTACION = 100_000;
export class ExportacionesRepository {
  constructor(private readonly db: Db) {}
  async revision() {
    const r = await this.db.select().from(exportacionRevision).where(eq(exportacionRevision.id, 1));
    if (!r[0]) throw new Error('Falta la revisión de exportaciones. Aplicá la migración.');
    return r[0].revision;
  }
  async crear(solicitud: SolicitudExportacion, huella: string) {
    const [_, r] = await this.db.batch([
      this.db.execute(sql`select pg_advisory_xact_lock(830071)`),
      this.db.execute<{
        id: string;
      }>(sql`insert into exportaciones(id_solicitud,huella,solicitud,revision_publica,vence_en)
        select ${solicitud.idSolicitud}::uuid,${huella},${JSON.stringify(solicitud)}::jsonb,revision,now()+interval '24 hours'
        from exportacion_revision where id=1 and
        (select count(*) from exportaciones where estado in ('solicitado','preparando') and vence_en>now())<100
        on conflict(id_solicitud) do nothing returning id`),
    ]);
    const fila = r.rows[0]
      ? await this.porId(r.rows[0].id)
      : (
          await this.db
            .select()
            .from(exportaciones)
            .where(eq(exportaciones.idSolicitud, solicitud.idSolicitud))
        )[0];
    if (fila && fila.huella !== huella) throw new Error('SOLICITUD_CAMBIADA');
    return fila ?? null;
  }
  async porId(id: string) {
    return (await this.db.select().from(exportaciones).where(eq(exportaciones.id, id)))[0] ?? null;
  }
  async vigencia(id: string) {
    await this.db
      .execute(sql`update exportaciones set estado='vencido',mensaje='El archivo venció. Pedí una nueva lectura.',lease=null,lease_hasta=null
      where id=${id}::uuid and vence_en<=now() and estado<>'vencido'`);
    await this.db
      .execute(sql`update exportaciones set estado='fallido',mensaje='Cambió una fuente o su permiso. Pedí una lectura nueva.',lease=null,lease_hasta=null
      where id=${id}::uuid and estado in ('solicitado','preparando','disponible')
      and revision_publica<>(select revision from exportacion_revision where id=1)`);
    await this.db.execute(sql`delete from exportacion_partes where trabajo_id=${id}::uuid and exists
      (select 1 from exportaciones where id=${id}::uuid and estado in ('fallido','vencido'))`);
    return this.porId(id);
  }
  dto(f: ExportacionFila): TrabajoExportacion {
    return {
      id: f.id,
      estado: f.estado,
      formato: f.solicitud.formato,
      corte: f.corte.toISOString(),
      venceEn: f.venceEn.toISOString(),
      registros: f.registros,
      total: f.total,
      bytes: f.bytes,
      mensaje: f.mensaje,
      archivoUrl:
        f.estado === 'disponible' ? `/api/v1/exportaciones/trabajos/${f.id}/archivo` : null,
    };
  }
  async cancelar(id: string, idSolicitud: string) {
    const propia = await this.porId(id);
    if (propia?.idSolicitud !== idSolicitud) return null;
    await this.db
      .execute(sql`update exportaciones set estado='fallido',mensaje='Cancelaste la preparación. Podés pedir otro archivo.',lease=null,lease_hasta=null
      where id=${id}::uuid and estado in ('solicitado','preparando')`);
    return this.vigencia(id);
  }
  async limpiar() {
    await this.db.execute(
      sql`update exportaciones set estado='vencido',mensaje='El archivo venció. Pedí una nueva lectura.',lease=null,lease_hasta=null where vence_en<=now() and estado<>'vencido'`,
    );
    await this.db.execute(
      sql`delete from exportacion_partes where trabajo_id in(select id from exportaciones where estado in ('fallido','vencido'))`,
    );
    await this.db.execute(sql`delete from exportaciones where vence_en<now()-interval '7 days'`);
  }
  async tomar() {
    const lease = randomUUID();
    const r = await this.db.execute<{ id: string }>(sql`with candidato as
      (select id from exportaciones where estado in ('solicitado','preparando') and vence_en>now()
      and (lease_hasta is null or lease_hasta<now()) order by actualizada_en,id for update skip locked limit 1)
      update exportaciones set estado='preparando',lease=${lease}::uuid,lease_hasta=now()+interval '90 seconds',
      intentos=intentos+1,actualizada_en=now() where id in(select id from candidato) returning id`);
    return r.rows[0] ? this.porId(r.rows[0].id) : null;
  }
  async liberar(f: ExportacionFila) {
    await this.db
      .execute(sql`update exportaciones set lease=null,lease_hasta=null,actualizada_en=now()
      where id=${f.id}::uuid and lease=${f.lease}::uuid and estado='preparando'`);
  }
  async errorTemporal(f: ExportacionFila) {
    await this.db
      .execute(sql`update exportaciones set fallos=fallos+1,lease=null,lease_hasta=null,actualizada_en=now(),
      estado=case when fallos>=2 then 'fallido' else 'preparando' end,
      mensaje=case when fallos>=2 then 'No pudimos completar el archivo después de tres intentos. Pedí otro.' else 'La preparación encontró una interrupción y volverá a intentar.' end
      where id=${f.id}::uuid and lease=${f.lease}::uuid and estado='preparando'`);
    await this.vigencia(f.id);
  }
  /** Un fragmento y su cursor avanzan en una única sentencia: un corte de proceso se reanuda sin duplicación. */
  async agregar(
    f: ExportacionFila,
    v: {
      archivo: string;
      contenido: string;
      fase: string;
      cursor: string | null;
      registros?: number;
      total?: number;
      reservados?: number;
    },
  ) {
    const bytes = Buffer.byteLength(v.contenido, 'utf8');
    const hash = createHash('sha256').update(v.contenido, 'utf8').digest('hex');
    if (bytes > 2 * 1024 * 1024) throw new Error('FRAGMENTO_EXCESIVO');
    const r = await this.db.execute<{ id: string }>(sql`with avance as (
      update exportaciones set orden=orden+1,fase=${v.fase},cursor=${v.cursor}::uuid,
      registros=registros+${v.registros ?? 0},total=${v.total ?? f.total},textos_reservados=${v.reservados ?? f.textosReservados},
      bytes=bytes+${bytes},fallos=0,mensaje=null,actualizada_en=now(),lease_hasta=now()+interval '90 seconds'
      where id=${f.id}::uuid and lease=${f.lease}::uuid and orden=${f.orden} and estado='preparando' and vence_en>now()
      and revision_publica=(select revision from exportacion_revision where id=1)
      and bytes+${bytes}<=${MAX_BYTES_EXPORTACION} and registros+${v.registros ?? 0}<=${MAX_REGISTROS_EXPORTACION} and orden<10000
      returning id,orden)
      insert into exportacion_partes(trabajo_id,orden,archivo,contenido,bytes,sha256)
      select id,orden,${v.archivo},${v.contenido},${bytes},${hash} from avance returning trabajo_id as id`);
    if (!r.rows[0]) throw new Error('AVANCE_RECHAZADO');
    const actualizado = await this.porId(f.id);
    if (!actualizado) throw new Error('TRABAJO_AUSENTE');
    return actualizado;
  }
  async disponible(f: ExportacionFila) {
    await this.db
      .execute(sql`update exportaciones set estado='disponible',lease=null,lease_hasta=null,mensaje=null
      where id=${f.id}::uuid and lease=${f.lease}::uuid and estado='preparando' and vence_en>now()
      and revision_publica=(select revision from exportacion_revision where id=1)`);
  }
  async fallar(f: ExportacionFila, mensaje: string) {
    await this.db
      .execute(sql`update exportaciones set estado='fallido',mensaje=${mensaje},lease=null,lease_hasta=null
      where id=${f.id}::uuid and lease=${f.lease}::uuid and estado='preparando'`);
    await this.vigencia(f.id);
  }
  async partes(id: string, despues = 0) {
    return this.db
      .select()
      .from(exportacionPartes)
      .where(and(eq(exportacionPartes.trabajoId, id), gt(exportacionPartes.orden, despues)))
      .orderBy(asc(exportacionPartes.orden))
      .limit(1);
  }
  async indice(id: string) {
    return this.db
      .select({
        orden: exportacionPartes.orden,
        archivo: exportacionPartes.archivo,
        bytes: exportacionPartes.bytes,
        sha256: exportacionPartes.sha256,
      })
      .from(exportacionPartes)
      .where(eq(exportacionPartes.trabajoId, id))
      .orderBy(asc(exportacionPartes.orden))
      .limit(10000);
  }
  async *leer(id: string, revision: number) {
    let orden = 0;
    for (let pagina = 0; pagina <= 10000; pagina++) {
      const lectura = (
        await this.db
          .select({
            vigente: sql<boolean>`
          ${exportaciones.estado}='disponible' and ${exportaciones.venceEn}>now()
          and ${exportaciones.revisionPublica}=${revision}
          and ${exportaciones.revisionPublica}=(select revision from exportacion_revision where id=1)`,
            orden: exportacionPartes.orden,
            nombre: exportacionPartes.archivo,
            contenido: exportacionPartes.contenido,
          })
          .from(exportaciones)
          .leftJoin(
            exportacionPartes,
            and(
              eq(exportacionPartes.trabajoId, exportaciones.id),
              sql`${exportacionPartes.orden}=(select min(p.orden) from exportacion_partes p where p.trabajo_id=${id}::uuid and p.orden>${orden})`,
            ),
          )
          .where(eq(exportaciones.id, id))
      )[0];
      if (!lectura?.vigente) {
        await this.vigencia(id);
        throw new Error('ARCHIVO_INVALIDADO');
      }
      if (lectura.orden === null || lectura.nombre === null || lectura.contenido === null) return;
      orden = lectura.orden;
      yield { nombre: lectura.nombre, contenido: Buffer.from(lectura.contenido, 'utf8') };
    }
    throw new Error('ARCHIVO_EXCEDE_FRAGMENTOS');
  }
}
