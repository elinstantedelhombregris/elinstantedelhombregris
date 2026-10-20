/**
 * Acreditar a una persona en la campaña que la trajo (spec
 * 2026-10-19-mi-argentina-ideal-la-pila.md §11).
 *
 * Lo llaman los dos momentos en que alguien participa por primera vez: el
 * aporte publicado (`contribuciones`) y la quinta opinión (`pila`). La marca de
 * llegada es la cookie `basta_impulso`, que pone `POST /campanas/:slug/llegada`.
 * Nunca hace fallar la participación: si algo sale mal, se registra y se sigue.
 */
import { ImpulsoRepository, getDb } from '@v2/db';
import { COOKIE_IMPULSO } from '@v2/shared';
import { z } from 'zod';

import { logger } from '../../lib/logger.js';

import { avisarQuePasoARevision } from './avisos.js';

import type { Request } from 'express';

const uuid = z.string().uuid();

export function campanaDeLlegada(req: Request): string | null {
  const cookies: unknown = (req as { cookies?: unknown }).cookies;
  if (typeof cookies !== 'object' || cookies === null) return null;
  const v = (cookies as Record<string, unknown>)[COOKIE_IMPULSO];
  const r = uuid.safeParse(v);
  return r.success ? r.data : null;
}

export async function acreditarParticipacion(
  req: Request,
  e: {
    actorId: number | null;
    userId: number | null;
    como: 'aporte' | 'opiniones';
    senalIdPublico: string | null;
  },
): Promise<void> {
  const campanaId = campanaDeLlegada(req);
  if (!campanaId || e.actorId === null) return;
  try {
    const repo = new ImpulsoRepository(getDb());
    const r = await repo.acreditar({
      campanaId,
      actorId: e.actorId,
      userId: e.userId,
      como: e.como,
      senalIdPublico: e.senalIdPublico,
    });
    if (!r.pasoARevision || !r.campana) return;
    await avisarQuePasoARevision(repo, r.campana);
  } catch (err) {
    logger.warn({ err, campanaId }, 'no se pudo acreditar el impulso');
  }
}
