import {
  DeliberacionFichaRepository,
  FichasRepository,
  RelacionesFichaRepository,
  VisionCompartidaRepository,
  getDb,
} from '@v2/db';
import {
  argumentoFichaSchema,
  consultaVisionSchema,
  idFichaSchema,
  relacionEntreFichasSchema,
  retirarArgumentoSchema,
} from '@v2/shared';
import { Router, type Router as RouterType } from 'express';
import { z } from 'zod';

import { authenticate, optionalAuthenticate, usuarioAutenticado } from '../../middleware/auth.js';
import { HttpError } from '../../middleware/error-handler.js';

const router: RouterType = Router();
router.use((_req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});
const ficha = async (id: string, uid?: number) => {
  const f = await new FichasRepository(getDb()).porId(id, uid);
  if (!f) throw new HttpError(404, 'FICHA_NO_ENCONTRADA', 'No encontramos esa ficha.');
  return f;
};
router.get('/vision', async (req, res, next) => {
  try {
    const q = consultaVisionSchema.parse(req.query);
    res.json({
      data: await new VisionCompartidaRepository(getDb()).leer(q.despues, q.territorioId),
    });
  } catch (e) {
    next(e);
  }
});
router.get('/:id/argumentos', optionalAuthenticate, async (req, res, next) => {
  try {
    const id = idFichaSchema.parse(req.params.id);
    const despues = z.string().uuid().optional().parse(req.query.despues);
    await ficha(id);
    res.json({
      data: await new DeliberacionFichaRepository(getDb()).leer(id, req.user?.id, despues),
    });
  } catch (e) {
    next(e);
  }
});
router.post('/:id/argumentos', authenticate, async (req, res, next) => {
  try {
    const id = idFichaSchema.parse(req.params.id);
    await ficha(id);
    const entrada = argumentoFichaSchema.parse(req.body);
    const nuevo = await new DeliberacionFichaRepository(getDb()).proponer(
      id,
      usuarioAutenticado(req).id,
      entrada,
    );
    if (!nuevo)
      throw new HttpError(
        409,
        'ARGUMENTO_NO_GUARDADO',
        'Revisá las fechas del proceso, las referencias y el recibo de este envío. Tu texto se conserva.',
      );
    res.status(201).json({ data: { id: nuevo } });
  } catch (e) {
    next(e);
  }
});
router.post('/argumentos/:id/retiro', authenticate, async (req, res, next) => {
  try {
    const id = idFichaSchema.parse(req.params.id);
    const v = retirarArgumentoSchema.parse(req.body);
    if (
      !(await new DeliberacionFichaRepository(getDb()).retirar(
        id,
        usuarioAutenticado(req).id,
        v.motivo,
      ))
    )
      throw new HttpError(
        403,
        'SIN_PERMISO',
        'Podés retirar tu texto; la moderación corresponde al equipo editor de la ficha.',
      );
    res.json({ data: { retirado: true } });
  } catch (e) {
    next(e);
  }
});
router.get('/:id/relaciones', optionalAuthenticate, async (req, res, next) => {
  try {
    const id = idFichaSchema.parse(req.params.id);
    await ficha(id);
    res.json({ data: await new RelacionesFichaRepository(getDb()).leer(id, req.user?.id) });
  } catch (e) {
    next(e);
  }
});
router.post('/:id/relaciones', authenticate, async (req, res, next) => {
  try {
    const id = idFichaSchema.parse(req.params.id);
    const uid = usuarioAutenticado(req).id;
    if (!(await ficha(id, uid)).puedoEditar)
      throw new HttpError(403, 'SIN_PERMISO', 'Solo el equipo editor puede vincular esta ficha.');
    const v = relacionEntreFichasSchema.parse(req.body);
    const nuevo = await new RelacionesFichaRepository(getDb()).crear(id, uid, v);
    if (!nuevo)
      throw new HttpError(
        409,
        'RELACION_NO_GUARDADA',
        'Revisá que sean fichas distintas, existentes, y que el envío no haya cambiado.',
      );
    res.status(201).json({ data: { id: nuevo } });
  } catch (e) {
    next(e);
  }
});
router.delete('/relaciones/:id', authenticate, async (req, res, next) => {
  try {
    if (
      !(await new RelacionesFichaRepository(getDb()).retirar(
        idFichaSchema.parse(req.params.id),
        usuarioAutenticado(req).id,
      ))
    )
      throw new HttpError(
        403,
        'SIN_PERMISO',
        'Solo el equipo editor de la ficha de origen puede retirar la relación.',
      );
    res.json({ data: { retirada: true } });
  } catch (e) {
    next(e);
  }
});
export { router as deliberacionFichasRouter };
