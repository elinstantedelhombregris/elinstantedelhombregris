import { cuadernoNativoSchema, type CuadernoNativo } from '@v2/shared';
import { expoDb } from '@/db/client';

export function leerCuadernos(usuarioId: number, origen: string): CuadernoNativo[] {
  return expoDb
    .getAllSync<{
      contenido: string;
    }>(
      'select contenido from cuadernos_campo_v2 where usuario_id=? and origen=? order by rowid desc',
      usuarioId,
      origen,
    )
    .map((r) => cuadernoNativoSchema.parse(JSON.parse(r.contenido)));
}
export function guardarCuaderno(c: CuadernoNativo): CuadernoNativo {
  const siguiente = cuadernoNativoSchema.parse({ ...c, version: c.version + 1 });
  const contenido = JSON.stringify(siguiente);
  const r =
    c.version === 0
      ? expoDb.runSync(
          'insert or ignore into cuadernos_campo_v2(id,usuario_id,origen,version,contenido) values(?,?,?,?,?)',
          c.id,
          c.usuarioId,
          c.origen,
          1,
          contenido,
        )
      : expoDb.runSync(
          'update cuadernos_campo_v2 set contenido=?,version=version+1 where id=? and usuario_id=? and origen=? and version=?',
          contenido,
          c.id,
          c.usuarioId,
          c.origen,
          c.version,
        );
  if (r.changes !== 1) throw new Error('El cuaderno cambió. Conservá tus notas y volvé a abrirlo.');
  return siguiente;
}
export function borrarCuaderno(c: CuadernoNativo): void {
  if (!['borrador', 'enviado', 'retirado'].includes(c.estado))
    throw new Error('Primero resolvé el envío pendiente.');
  const r = expoDb.runSync(
    'delete from cuadernos_campo_v2 where id=? and usuario_id=? and origen=? and version=?',
    c.id,
    c.usuarioId,
    c.origen,
    c.version,
  );
  if (r.changes !== 1) throw new Error('El cuaderno cambió; volvé a abrirlo.');
}
