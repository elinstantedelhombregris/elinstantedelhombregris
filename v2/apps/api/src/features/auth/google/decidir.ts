/**
 * Qué pasa cuando alguien vuelve de Google con su identidad verificada (spec
 * 2026-10-27-ingreso-con-google.md, «Vincular»). Es una función pura: la ruta busca, esto
 * decide, y la ruta escribe.
 */
import type { CuentaPorCorreo, IdentidadConCuenta } from '@v2/db';

export type Entrada =
  /** Ya había entrado con Google. */
  | { tipo: 'entrar'; userId: number; identidadId: number }
  /** Hay una cuenta con ese correo y ya lo había verificado: las dos pruebas coinciden. */
  | { tipo: 'vincular'; userId: number }
  /** Hay una cuenta con ese correo sin verificar: quien la creó no probó que fuera suyo. */
  | { tipo: 'limpiar-y-vincular'; userId: number }
  /** Nadie con esa identidad ni con ese correo: «Último paso». */
  | { tipo: 'alta' }
  | { tipo: 'rechazar'; error: 'cuenta_inactiva' };

export function decidirEntrada(
  identidad: IdentidadConCuenta | null,
  porCorreo: CuentaPorCorreo | null,
): Entrada {
  if (identidad)
    return identidad.activa
      ? { tipo: 'entrar', userId: identidad.userId, identidadId: identidad.identidadId }
      : { tipo: 'rechazar', error: 'cuenta_inactiva' };
  if (!porCorreo) return { tipo: 'alta' };
  if (!porCorreo.activa) return { tipo: 'rechazar', error: 'cuenta_inactiva' };
  return porCorreo.correoVerificado
    ? { tipo: 'vincular', userId: porCorreo.id }
    : { tipo: 'limpiar-y-vincular', userId: porCorreo.id };
}
