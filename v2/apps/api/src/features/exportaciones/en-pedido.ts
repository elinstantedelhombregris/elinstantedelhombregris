import { getConfig } from '../../lib/config.js';
import { logger } from '../../lib/logger.js';

import { prepararExportaciones } from './worker.js';

import type { ExportacionesRepository, ExportacionFila } from '@v2/db';

/** Un tramo en pedido es corto a propósito: la persona espera la respuesta. */
export const TRAMO_EN_PEDIDO = { maxPasos: 20, presupuestoMs: 10_000, limpiar: false } as const;

/**
 * Avanza, antes de responder, un tramo acotado de la cola de exportaciones y devuelve el estado
 * vigente del trabajo consultado.
 *
 * - Se espera con `await`: en la función de Vercel no hay `waitUntil`, y cualquier trabajo que
 *   siga después de `res.end()` queda congelado.
 * - Es seguro con consultas concurrentes: `tomar()` reclama con `for update skip locked` y un
 *   lease de 90 s, y cada fragmento avanza sólo si lease, orden y estado coinciden. Quien no
 *   consigue el lease no hace nada y devuelve el estado.
 * - Toma el trabajo más antiguo de la cola, no necesariamente el consultado: todos los que
 *   consultan colaboran con la cola entera.
 * - Un fallo del worker nunca llega a la respuesta. Se registra y se devuelve el estado
 *   actual; la contabilidad de errores del propio trabajo (`errorTemporal`) decide si reintenta
 *   o falla.
 *
 * Con `EXPORTACIONES_EN_PEDIDO=0`, o si el trabajo ya no está en la cola, devuelve la fila tal
 * cual. Devuelve `null` sólo si el trabajo desapareció mientras tanto.
 */
export async function avanzarEnPedido(
  repo: ExportacionesRepository,
  fila: ExportacionFila,
): Promise<ExportacionFila | null> {
  if (!getConfig().exportacionesEnPedido) return fila;
  if (fila.estado !== 'solicitado' && fila.estado !== 'preparando') return fila;
  try {
    await prepararExportaciones({ ...TRAMO_EN_PEDIDO });
  } catch (error) {
    logger.warn(
      { trabajo: fila.id, errorName: error instanceof Error ? error.name : 'Error' },
      'Exportaciones: el avance en pedido falló; se devuelve el estado actual',
    );
  }
  return repo.vigencia(fila.id);
}
