/**
 * Barrido de sesiones vencidas.
 *
 * Existe porque la política de privacidad promete un plazo y hasta hoy no
 * había nada que lo cumpliera: `auth_sessions` guarda la dirección IP y el
 * navegador de cada inicio de sesión, y ninguna parte del sistema borraba una
 * fila por vieja. O sea que las IPs se guardaban para siempre, y el renglón de
 * la tabla de conservación era una intención, no un hecho.
 *
 * Con esto la promesa se puede afirmar: `content/legal/privacidad.mdx`,
 * sección «Cuánto tiempo los guardamos».
 *
 * Invocado desde:
 *   - `apps/api/src/vercel/cron-sesiones.ts`, que se empaqueta a
 *     `v2/api/cron/sesiones.mjs` y lo agenda `v2/vercel.json` (ADR 0008 D2, D3)
 */
import { AuthRepository, getDb } from '@v2/db';

import { logger } from '../../lib/logger.js';

/**
 * Los días que una sesión vencida sobrevive antes de que la borren.
 *
 * Es el mismo número que publica la política, y ese es el punto: si alguien lo
 * cambia acá sin cambiarlo allá, el documento pasa a mentir.
 */
export const DIAS_DE_RETENCION_DE_SESIONES = 90;

const MILISEGUNDOS_POR_DIA = 24 * 60 * 60 * 1000;

/** El instante antes del cual una sesión vencida ya no se conserva. */
export function corteDeRetencion(ahora: Date, dias: number = DIAS_DE_RETENCION_DE_SESIONES): Date {
  return new Date(ahora.getTime() - dias * MILISEGUNDOS_POR_DIA);
}

export interface ResultadoDelBarrido {
  /** Cuántas filas se borraron en esta corrida. */
  readonly borradas: number;
  /** El corte usado, en ISO, para que el log diga contra qué se comparó. */
  readonly corte: string;
}

/**
 * Borra toda sesión vencida hace más de {@link DIAS_DE_RETENCION_DE_SESIONES}
 * días. Idempotente: correrlo dos veces seguidas borra 0 la segunda vez.
 */
export async function barrerSesionesVencidas(
  ahora: Date = new Date(),
): Promise<ResultadoDelBarrido> {
  const corte = corteDeRetencion(ahora);
  const repo = new AuthRepository(getDb());
  const borradas = await repo.borrarSesionesVencidasAntesDe(corte);
  const resultado: ResultadoDelBarrido = { borradas, corte: corte.toISOString() };
  logger.info(resultado, 'sesiones: barrido de vencidas completo');
  return resultado;
}
