/**
 * El paso previo de una campaña propuesta (spec 2026-10-19-mi-argentina-ideal-la-pila.md §11):
 * la llegada desde su página y la lista que revisa la administración.
 *
 * Se monta adentro de `campanasRouter`, antes de `GET /:slug`, así `/revision` no se lee
 * como un slug.
 */
import { CampanasRepository, ImpulsoRepository, getDb } from '@v2/db';
import { COOKIE_IMPULSO, DIAS_DE_IMPULSO, contratoCampanaSchema } from '@v2/shared';
import { Router, type Router as RouterType } from 'express';
import { z } from 'zod';

import { getConfig } from '../../lib/config.js';
import { authenticate, exigirAdmin } from '../../middleware/auth.js';
import { HttpError } from '../../middleware/error-handler.js';

import type { CampanaParaRevisar } from '@v2/shared';

const router: RouterType = Router();
const UN_DIA_MS = 24 * 60 * 60 * 1000;

/** Las propuestas que llegaron al umbral, con sus reglas y lo que escribieron las personas que trajeron. */
router.get('/revision', authenticate, exigirAdmin, async (_req, res, next) => {
  try {
    const lista = await new ImpulsoRepository(getDb()).paraRevisar();
    const data: CampanaParaRevisar[] = lista.map((c) => ({
      ...c,
      contrato: contratoCampanaSchema.parse(c.contrato),
    }));
    res.set('Cache-Control', 'no-store').json({ data });
  } catch (e) {
    next(e);
  }
});

/**
 * «Sumate»: marca la llegada en una cookie `httpOnly` con la campaña. No escribe nada en la
 * base; la persona cuenta recién cuando participa (`acreditarParticipacion`). Una llegada
 * nueva reemplaza la anterior: la marca es la última campaña que la trajo, y la base decide
 * después que cada persona cuente para una sola.
 */
router.post('/:slug/llegada', async (req, res, next) => {
  try {
    const slug = z.string().min(1).max(120).parse(req.params.slug);
    const c = await new CampanasRepository(getDb()).paraCambiar(slug);
    if (!c || c.estado === 'borrador')
      throw new HttpError(404, 'CAMPANA_NO_ENCONTRADA', 'Todavía no encontramos esa campaña.');
    if (c.estado !== 'reuniendo')
      throw new HttpError(
        409,
        'CAMPANA_SIN_IMPULSO',
        'Esta campaña ya no está juntando gente. Igual podés contar tu Argentina ideal.',
      );
    const cfg = getConfig();
    res
      .cookie(COOKIE_IMPULSO, c.id, {
        httpOnly: true,
        secure: cfg.auth.cookieSecure,
        sameSite: 'lax',
        path: '/',
        maxAge: DIAS_DE_IMPULSO * UN_DIA_MS,
        ...(cfg.auth.cookieDomain ? { domain: cfg.auth.cookieDomain } : {}),
      })
      .set('Cache-Control', 'no-store')
      .status(204)
      .end();
  } catch (e) {
    next(e);
  }
});

export { router as impulsoCampanasRouter };
