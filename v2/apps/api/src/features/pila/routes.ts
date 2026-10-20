/**
 * Mirar — tandas, opiniones, duelos y reportes (plan de Mi Argentina ideal,
 * entrega 1, tarea 6). Montado en `/api/v1/pila`, después de `csrfProtect`: todo
 * lo que escribe va con el doble envío de cookie, y el token sale de
 * `GET /api/v1/contribuciones/contexto`, igual que en Imaginar. No hay exenciones.
 *
 *   POST /tandas                  { campana?, priorizarRegion? } → TandaPila
 *   PUT  /opiniones/:idPublico    { valor, provinciaId }          → ResultadoOpinion
 *   PUT  /duelos                  { a, b, primero }               → 204
 *   POST /reportes/:idPublico     { motivo }                      → 202 { recibido }
 *   GET  /aportes/:idPublico                                      → OpinionDeAporte
 *
 * Funciona sin cuenta, con el actor del navegador; con sesión, la opinión se ata
 * también a la cuenta. Un aporte propio o que no está en Mirar responde 404 sin
 * distinguir el motivo, para no revelar su estado.
 */
import { PilaRepository, getDb } from '@v2/db';
import {
  OPINIONES_PARA_PARTICIPAR,
  SLUG_CAMPANA_NACIONAL,
  dueloSchema,
  opinionSchema,
  pedidoTandaSchema,
  reporteSchema,
  type OpinionDeAporte,
} from '@v2/shared';
import { Router, type Request, type Response, type Router as RouterType } from 'express';
import { z } from 'zod';

import { optionalAuthenticate } from '../../middleware/auth.js';
import { HttpError } from '../../middleware/error-handler.js';
import { anonSubmitRateLimit, pilaRateLimit } from '../../middleware/rate-limit.js';
import { acreditarParticipacion } from '../impulso/acreditar.js';
import { actorSiExiste, ponerCookieDeActor, resolverActor } from '../senales/actor.js';

import {
  campanaParaMirar,
  comparar,
  opinar,
  pedirTanda,
  reportar,
  type QuienMira,
} from './service.js';

const router: RouterType = Router();
router.use(pilaRateLimit());
router.use(optionalAuthenticate);

const uuid = z.string().uuid();

/** El id del aporte de la ruta. Uno mal formado es, para quien pregunta, uno que no está. */
function idDelAporte(req: Request): string {
  const r = uuid.safeParse(req.params.idPublico);
  if (!r.success) throw new HttpError(404, 'NO_ESTA', 'Ese aporte no está para mirar.');
  return r.data;
}

/**
 * El actor de quien mira, creándolo si hace falta (mirar, opinar y reportar lo
 * necesitan: hay que saber que dos respuestas son de dos personas). Sin actor
 * no se puede contar a nadie, y se dice.
 */
async function quienMira(req: Request, res: Response): Promise<QuienMira> {
  const actor = await resolverActor(req);
  if (actor.actorId === null)
    throw new HttpError(
      503,
      'SIN_ACTOR',
      'No pudimos guardar el identificador de este navegador. Probá de nuevo.',
    );
  ponerCookieDeActor(res, actor.claveNueva);
  return { actorId: actor.actorId, userId: req.user?.id ?? null };
}

/** Una tanda. Es POST porque registra lo que se le mostró a quien mira. */
router.post('/tandas', async (req, res, next) => {
  try {
    const v = pedidoTandaSchema.parse(req.body ?? {});
    const campanaId = await campanaParaMirar(v.campana ?? SLUG_CAMPANA_NACIONAL);
    const quien = await quienMira(req, res);
    const tanda = await pedirTanda(campanaId, quien, v.priorizarRegion);
    res.set('Cache-Control', 'no-store').json({ data: tanda });
  } catch (err) {
    next(err);
  }
});

router.put('/opiniones/:idPublico', async (req, res, next) => {
  try {
    const id = idDelAporte(req);
    const v = opinionSchema.parse(req.body);
    const quien = await quienMira(req, res);
    const r = await opinar(id, quien, v.valor, v.provinciaId);
    // Con la quinta respuesta, la persona participa: si llegó desde una campaña
    // que junta gente, cuenta para ella (spec §11). Nunca hace fallar la opinión.
    if (r.respuestasDelActor === OPINIONES_PARA_PARTICIPAR)
      await acreditarParticipacion(req, {
        actorId: quien.actorId,
        userId: quien.userId,
        como: 'opiniones',
        senalIdPublico: null,
      });
    res.set('Cache-Control', 'no-store').json({ data: r.resultado });
  } catch (err) {
    next(err);
  }
});

/** Un duelo necesita dos «Yo también» previos: sin actor, no puede haberlos. */
router.put('/duelos', async (req, res, next) => {
  try {
    const v = dueloSchema.parse(req.body);
    const actorId = await actorSiExiste(req);
    if (actorId === null) throw new HttpError(404, 'NO_ESTA', 'Ese aporte no está para mirar.');
    await comparar(v, { actorId, userId: req.user?.id ?? null });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

router.post('/reportes/:idPublico', anonSubmitRateLimit(), async (req, res, next) => {
  try {
    const id = idDelAporte(req);
    const v = reporteSchema.parse(req.body);
    const quien = await quienMira(req, res);
    await reportar(id, quien, v.motivo);
    res
      .status(202)
      .set('Cache-Control', 'no-store')
      .json({ data: { recibido: true } });
  } catch (err) {
    next(err);
  }
});

/**
 * Para `/senal/:id`: si el deseo está en Mirar —y entonces se opina con las tres
 * respuestas y no con la adhesión— y qué contestó quien mira. Lee el actor pero
 * no lo crea: mirar una página no planta una cookie.
 */
router.get('/aportes/:idPublico', async (req, res, next) => {
  try {
    const id = idDelAporte(req);
    const actorId = await actorSiExiste(req);
    const r: OpinionDeAporte = await new PilaRepository(getDb()).opinionDe(
      id,
      actorId,
      req.user?.id ?? null,
    );
    res.set('Cache-Control', 'no-store').json({ data: r });
  } catch (err) {
    next(err);
  }
});

export { router as pilaRouter };
