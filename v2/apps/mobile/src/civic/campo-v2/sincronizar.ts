import type { CuadernoNativo } from '@v2/shared';
import { guardarCuaderno, leerCuadernos } from './archivo';
import { ErrorCampo, pedirCampo, type ConexionCampo } from './conexion';

const activos = new Map<string, Promise<void>>();
export function sincronizarCuadernos(c: ConexionCampo, manual = false): Promise<void> {
  const clave = c.origen + ':' + c.usuarioId;
  const previo = activos.get(clave);
  if (previo) return previo;
  const p = ejecutar(c, manual).finally(() => {
    activos.delete(clave);
  });
  activos.set(clave, p);
  return p;
}
async function ejecutar(c: ConexionCampo, manual: boolean) {
  for (const original of leerCuadernos(c.usuarioId, c.origen)) {
    if (
      original.estado !== 'pendiente' ||
      (!manual && (original.intentos >= 5 || original.siguienteIntento > Date.now()))
    )
      continue;
    const d = guardarCuaderno({ ...original, intentos: original.intentos + 1 });
    let siguiente: CuadernoNativo;
    try {
      const ruta = d.retiro
        ? `/iniciativas/${d.tarea.iniciativaId}/evidencias/${d.evidenciaId}/retirar`
        : `/iniciativas/${d.tarea.iniciativaId}/tareas/${d.tarea.id}/campo`;
      if (!d.retiro && (!d.sobre || d.sobre.usuarioId !== c.usuarioId))
        throw new ErrorCampo(400, 'El sobre no corresponde a esta cuenta.');
      const r = (await pedirCampo(c, ruta, d.retiro ?? d.sobre)) as { id?: unknown } | null;
      if (!r || typeof r.id !== 'number' || !Number.isSafeInteger(r.id) || r.id <= 0)
        throw new Error('No pudimos confirmar el recibo.');
      if (d.retiro && r.id !== d.evidenciaId)
        throw new Error('El recibo de retiro no corresponde a esta evidencia.');
      siguiente = {
        ...d,
        estado: d.retiro ? 'retirado' : 'enviado',
        evidenciaId: r.id,
        mensaje: d.retiro
          ? 'Retiro confirmado en la iniciativa y su ficha.'
          : 'Recibo confirmado. Consultá el estado actual de la evidencia.',
      };
    } catch (e) {
      const conflicto = e instanceof ErrorCampo && [400, 409].includes(e.status);
      siguiente = {
        ...d,
        estado: conflicto ? 'conflicto' : 'pendiente',
        siguienteIntento: Date.now() + Math.min(300000, 5000 * 2 ** d.intentos),
        mensaje: e instanceof Error ? e.message : 'Sin conexión. El envío sigue guardado.',
      };
    }
    guardarCuaderno(siguiente);
  }
}
