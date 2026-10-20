/**
 * Quién puede dar cada paso de una campaña (spec 2026-10-19-mi-argentina-ideal-la-pila.md §11).
 *
 * `PASOS` (en `routes.ts`) dice qué pasos existen; esta regla dice quién los da:
 *   - la administración, en sus propias campañas, todos (como hasta el 20/10/2026);
 *   - la administración, en una campaña ajena, sólo decidir una propuesta revisada y abrir o
 *     pausar la que programó (`PASOS_DE_LA_REVISION`);
 *   - quien impulsa sin ser de la administración, los de `PASOS_DE_QUIEN_IMPULSA`. Abrir o
 *     programar no lo hace nunca;
 *   - nadie más.
 * `reuniendo → por_revisar` no pasa por acá: lo da el sistema al llegar al umbral.
 *
 * Es pura a propósito (no importa el manejador de errores, que lee la configuración): la ruta
 * convierte la negativa en `HttpError`.
 */
import { PASOS_DE_LA_REVISION, PASOS_DE_QUIEN_IMPULSA } from '@v2/shared';

import type { EstadoCampana } from '@v2/shared';

export interface QuienPide {
  desde: EstadoCampana;
  hacia: EstadoCampana;
  /** Figura en `ADMIN_USERNAMES` por su nombre en la base. */
  admin: boolean;
  /** Es quien creó la campaña. */
  impulsa: boolean;
}

export interface NegativaDePaso {
  status: 403;
  code: 'NOT_ADMIN' | 'SIN_PERMISO';
  message: string;
}

const AJENA: NegativaDePaso = {
  status: 403,
  code: 'SIN_PERMISO',
  message: 'Esta etapa la cuida quien impulsa la campaña.',
};

/** `null` si el paso está permitido; si no, lo que se responde. */
export function negarPaso({ desde, hacia, admin, impulsa }: QuienPide): NegativaDePaso | null {
  if (admin && impulsa) return null;
  if (admin) return PASOS_DE_LA_REVISION[desde]?.includes(hacia) ? null : AJENA;
  if ((hacia === 'abierta' || hacia === 'programada') && desde !== 'pausada')
    return {
      status: 403,
      code: 'NOT_ADMIN',
      message: 'Abrir o programar una campaña lo hace la coordinación de ¡BASTA!',
    };
  if (!impulsa) return AJENA;
  return PASOS_DE_QUIEN_IMPULSA[desde]?.includes(hacia)
    ? null
    : { status: 403, code: 'NOT_ADMIN', message: 'Ese paso lo da la coordinación de ¡BASTA!' };
}
