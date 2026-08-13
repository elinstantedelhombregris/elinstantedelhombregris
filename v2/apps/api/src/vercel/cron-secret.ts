/**
 * La guarda que separa a los crons del internet abierto (ADR 0008 D3).
 *
 * Los paths de cron están **excluidos** del rewrite de `vercel.json`
 * (`"source": "/api/((?!cron/).*)"`), así que cada función de `api/cron/` es
 * alcanzable por GET desde cualquier lado. Sin esto, un `while true; do curl …`
 * corre el job en loop contra la misma base que sirve el sitio.
 *
 * Vive en su propio módulo y no copiada en cada handler para que dos crons no
 * puedan tener dos guardas distintas: la que se endurece se endurece para
 * todos.
 */
import type { IncomingMessage } from 'node:http';

/** Devuelve true si el request trae el `CRON_SECRET` esperado. */
export function autorizadoPorCronSecret(req: IncomingMessage): boolean {
  const esperado = process.env.CRON_SECRET;
  // Sin secreto configurado no se corre: es preferible un cron muerto y
  // ruidoso a un endpoint abierto que quema base y cuota.
  if (!esperado) return false;
  return req.headers.authorization === `Bearer ${esperado}`;
}
