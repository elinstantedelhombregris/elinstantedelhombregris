/**
 * Ver — la visión de Mi Argentina ideal y los aportes parecidos (spec
 * 2026-10-19-mi-argentina-ideal-la-pila.md §5 y §3).
 *
 *   GET  /api/v1/vision?campana=<slug>  — la visión, nacional por defecto
 *   POST /api/v1/vision/parecidos       — hasta tres aportes parecidos a lo escrito
 *
 * Las dos respuestas son personales (`tuyo`, `miRegion`, `miOpinion`, «sin los
 * propios»), así que van con `Cache-Control: no-store`. Mirar no crea actor:
 * se lee el de la cookie o el de la cuenta, si existe (`actorSiExiste`).
 */
import { getDb, VisionRepository } from '@v2/db';
import {
  pedidoParecidosSchema,
  pedidoVisionSchema,
  SLUG_CAMPANA_NACIONAL,
  TOPE_PARECIDOS,
  type AporteParecido,
  type VisionCampana,
} from '@v2/shared';
import { Router, type Request, type Router as RouterType } from 'express';
import { rateLimit } from 'express-rate-limit';

import { optionalAuthenticate } from '../../middleware/auth.js';
import { HttpError } from '../../middleware/error-handler.js';
import { actorSiExiste } from '../senales/actor.js';

import { armarVision } from './service.js';

import type { QuienMira } from '@v2/db';

const router: RouterType = Router();
router.use(optionalAuthenticate);

/**
 * Los parecidos se piden mientras alguien escribe, así que el techo es más
 * holgado que el de publicar (`anonSubmitRateLimit`, 30 por hora): una escuela
 * entera detrás de una misma conexión tiene que poder usarlo. Si se pasa, la
 * pantalla sigue sin parecidos; no se pierde nada.
 */
const limiteParecidos = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 240,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    error: {
      code: 'RATE_LIMITED',
      message: 'Buscaste parecidos muchas veces seguidas. Esperá un rato y probá de nuevo.',
    },
  },
});

async function quienMira(req: Request): Promise<QuienMira> {
  return { actorId: await actorSiExiste(req), userId: req.user?.id ?? null };
}

router.get('/', async (req, res, next) => {
  try {
    const { campana: slug } = pedidoVisionSchema.parse(req.query);
    const repo = new VisionRepository(getDb());
    const campana = await repo.campanaPorSlug(slug ?? SLUG_CAMPANA_NACIONAL);
    if (!campana) {
      throw new HttpError(
        404,
        'CAMPANA_NO_DISPONIBLE',
        'No encontramos esa campaña. Puede que todavía no esté abierta.',
      );
    }
    const datos = await repo.leer(campana.id, await quienMira(req));
    const vision: VisionCampana = armarVision(campana, datos, new Date());
    res.set('Cache-Control', 'no-store').json({ data: vision });
  } catch (e) {
    next(e);
  }
});

/**
 * POST y no GET: lo que alguien está escribiendo no viaja en la URL. El texto no
 * se guarda ni se registra; sólo se compara. Sin campaña nacional, no hay con
 * qué comparar y la respuesta es una lista vacía.
 */
router.post('/parecidos', limiteParecidos, async (req, res, next) => {
  try {
    const { texto } = pedidoParecidosSchema.parse(req.body);
    const parecidos: AporteParecido[] = await new VisionRepository(getDb()).parecidos(
      SLUG_CAMPANA_NACIONAL,
      texto,
      await quienMira(req),
      TOPE_PARECIDOS,
    );
    res.set('Cache-Control', 'no-store').json({ data: parecidos });
  } catch (e) {
    next(e);
  }
});

export { router as visionRouter };
