/**
 * Las acciones que no tienen vuelta atrás —cerrar la cuenta, apagar el doble factor— piden
 * volver a probar quién es (ADR 0012). Con contraseña, la contraseña. Sin contraseña (la cuenta
 * entra sólo con Google), una confirmación reciente con Google: la cookie `eihg_confirmado`,
 * de cinco minutos y atada a esta cuenta.
 */
import { COOKIE_CONFIRMADO, confirmoRecien } from './google/estado.js';
import { verifyPassword } from './password.js';

import type { Request } from 'express';

export type Confirmacion = 'ok' | 'contrasena_incorrecta' | 'falta_confirmar';

export async function confirmarIdentidad(
  req: Request,
  cuenta: { id: number; passwordHash: string | null },
  contrasena: string | undefined,
): Promise<Confirmacion> {
  if (cuenta.passwordHash !== null)
    return contrasena !== undefined && (await verifyPassword(contrasena, cuenta.passwordHash))
      ? 'ok'
      : 'contrasena_incorrecta';
  const cookies = req.cookies as Record<string, unknown>;
  return confirmoRecien(cookies[COOKIE_CONFIRMADO], cuenta.id) ? 'ok' : 'falta_confirmar';
}
