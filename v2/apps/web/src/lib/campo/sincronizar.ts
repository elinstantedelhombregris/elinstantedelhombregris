import { z } from 'zod';

import { guardarCuaderno, leerCuadernos } from './archivo';

import type { Cuaderno } from './modelo';

import { api, ApiError } from '~/lib/api';
import { tokenParticipacion } from '~/lib/queries/participacion';

const recibo = z.object({ id: z.number().int().positive() });
const vuelos = new Map<number, Promise<void>>();
async function enviar(uid: number, vigente: () => boolean, manual: boolean) {
  const lista = await leerCuadernos(uid);
  for (const c of lista) {
    if (!vigente()) return;
    if (c.sobre?.usuarioId !== uid || !['pendiente', 'enviando', 'espera'].includes(c.estado))
      continue;
    if (!manual && (c.intentos >= 5 || c.siguienteIntento > Date.now())) continue;
    // Adquirir la versión antes de enviar; un cambio simultáneo no puede sobrescribir el sobre.
    let actual: Cuaderno;
    try {
      actual = await guardarCuaderno({
        ...c,
        estado: 'enviando',
        intentos: c.intentos + 1,
        mensaje: 'Enviando el resumen autorizado…',
      });
    } catch {
      continue;
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, 15000);
    try {
      const csrfToken = await tokenParticipacion(controller.signal);
      if (!vigente()) throw new Error('sesion_cambiada');
      const r = recibo.parse(
        await api.post<unknown>(
          `/api/iniciativas/${c.iniciativaId}/tareas/${c.tareaId}/campo`,
          c.sobre,
          { csrfToken, signal: controller.signal },
        ),
      );
      actual = {
        ...actual,
        estado: 'enviado',
        evidenciaId: r.id,
        mensaje:
          'El servidor confirmó el recibo. Consultá en la tarea el estado actual de la evidencia.',
      };
    } catch (e) {
      const conflicto = e instanceof ApiError && [400, 409].includes(e.status);
      const sesion = e instanceof ApiError && [401, 403].includes(e.status);
      actual = {
        ...actual,
        estado: conflicto ? 'conflicto' : 'espera',
        siguienteIntento: Date.now() + Math.min(300000, 5000 * 2 ** Math.min(actual.intentos, 6)),
        mensaje: conflicto
          ? 'Cambió la tarea o el envío no es válido. Recuperá la versión actual antes de autorizar nuevamente.'
          : sesion
            ? 'La sesión o sus permisos cambiaron. Ingresá con la cuenta que preparó el resumen y reintentá.'
            : 'No pudimos confirmar la recepción. Conservamos el mismo recibo para reintentar sin duplicar.',
      };
    } finally {
      clearTimeout(timeout);
    }
    // Si guardar falla después del commit, el sobre original permite reconciliarlo.
    await guardarCuaderno(actual);
    if (actual.estado === 'espera') break;
  }
}
export function sincronizarCampo(
  uid: number,
  vigente: () => boolean,
  manual = false,
): Promise<void> {
  const vuelo = vuelos.get(uid);
  if (vuelo) return vuelo;
  const promesa = enviar(uid, vigente, manual).finally(() => {
    vuelos.delete(uid);
  });
  vuelos.set(uid, promesa);
  return promesa;
}
