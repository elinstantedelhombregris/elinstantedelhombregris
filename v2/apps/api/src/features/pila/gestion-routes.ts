/**
 * Gestión de Mirar, sólo para la administración (plan de Mi Argentina ideal,
 * entrega 1, tarea 7). Montado en `/api/v1/gestion/pila`.
 *
 *   GET    /                        ?campana&desde        → PaginaGestionPila
 *   POST   /:idPublico/retencion    { motivo }            → retener ahora
 *   DELETE /:idPublico/retencion    { motivo }            → devolver a Mirar
 *
 * Quien administra ve el texto entero aunque esté reservado, porque lo está
 * juzgando; la lista no se exporta ni se cachea. Cada decisión queda en
 * `pila_decisiones` con quién la tomó y por qué.
 */
import { PilaGestionRepository, getDb } from '@v2/db';
import { consultaGestionPilaSchema, retencionSchema, type PaginaGestionPila } from '@v2/shared';
import { Router, type Request, type Router as RouterType } from 'express';
import { z } from 'zod';

import { authenticate, exigirAdmin, usuarioAutenticado } from '../../middleware/auth.js';
import { HttpError } from '../../middleware/error-handler.js';

const router: RouterType = Router();
router.use(authenticate, exigirAdmin);

const NO_ESTA = () =>
  new HttpError(404, 'NO_ESTA', 'Ese aporte no está entre los que se miran en una campaña.');

function idDelAporte(req: Request): string {
  const r = z.string().uuid().safeParse(req.params.idPublico);
  if (!r.success) throw NO_ESTA();
  return r.data;
}

router.get('/', async (req, res, next) => {
  try {
    const q = consultaGestionPilaSchema.parse(req.query);
    const repo = new PilaGestionRepository(getDb());
    let campanaId: string | undefined;
    if (q.campana !== undefined) {
      const id = await repo.campanaPorSlug(q.campana);
      if (id === null)
        throw new HttpError(404, 'CAMPANA_NO_DISPONIBLE', 'No encontramos esa campaña.');
      campanaId = id;
    }
    const pagina: PaginaGestionPila = await repo.paraGestion({
      ...(campanaId === undefined ? {} : { campanaId }),
      ...(q.desde === undefined ? {} : { desde: q.desde }),
    });
    res.set('Cache-Control', 'no-store').json({ data: pagina });
  } catch (err) {
    next(err);
  }
});

router.post('/:idPublico/retencion', async (req, res, next) => {
  try {
    const id = idDelAporte(req);
    const { motivo } = retencionSchema.parse(req.body);
    const r = await new PilaGestionRepository(getDb()).retener(
      id,
      usuarioAutenticado(req).id,
      motivo,
    );
    if (r === 'no_esta') throw NO_ESTA();
    if (r === 'sin_cambio')
      throw new HttpError(409, 'YA_RETENIDO', 'Ese aporte ya está fuera de Mirar.');
    res.json({ data: { retenido: true } });
  } catch (err) {
    next(err);
  }
});

router.delete('/:idPublico/retencion', async (req, res, next) => {
  try {
    const id = idDelAporte(req);
    const { motivo } = retencionSchema.parse(req.body);
    const r = await new PilaGestionRepository(getDb()).devolver(
      id,
      usuarioAutenticado(req).id,
      motivo,
    );
    if (r === 'no_esta') throw NO_ESTA();
    if (r === 'sin_cambio')
      throw new HttpError(409, 'NO_RETENIDO', 'Ese aporte no estaba retenido: ya está en Mirar.');
    res.json({ data: { retenido: false } });
  } catch (err) {
    next(err);
  }
});

export { router as gestionPilaRouter };
