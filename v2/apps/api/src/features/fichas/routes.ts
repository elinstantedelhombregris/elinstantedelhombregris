import { FichasRepository, getDb } from '@v2/db';
import {
  crearFichaSchema,
  editarFichaSchema,
  consultaFichasSchema,
  idFichaSchema,
} from '@v2/shared';
import { Router, type Router as RouterType } from 'express';

import { authenticate, optionalAuthenticate } from '../../middleware/auth.js';
import { HttpError } from '../../middleware/error-handler.js';

const router: RouterType = Router();
router.get('/', async (req, res, next) => {
  try {
    const consulta = consultaFichasSchema.parse(req.query);
    res.setHeader('Cache-Control', 'no-store');
    res.json({ data: await new FichasRepository(getDb()).listar(consulta.territorioId) });
  } catch (err) {
    next(err);
  }
});
router.get('/:id', optionalAuthenticate, async (req, res, next) => {
  try {
    const id = idFichaSchema.parse(req.params.id);
    const ficha = await new FichasRepository(getDb()).porId(id, req.user?.id);
    if (!ficha) throw new HttpError(404, 'FICHA_NO_ENCONTRADA', 'No encontramos esa ficha.');
    res.setHeader('Cache-Control', 'no-store');
    res.json({ data: ficha });
  } catch (err) {
    next(err);
  }
});
router.post('/', authenticate, async (req, res, next) => {
  try {
    if (!req.user)
      throw new HttpError(401, 'SESION_REQUERIDA', 'Iniciá sesión para administrar fichas.');
    const entrada = crearFichaSchema.parse(req.body);
    const repo = new FichasRepository(getDb());
    if (!(await repo.referenciasValidas(entrada.contenido)))
      throw new HttpError(
        400,
        'REFERENCIA_INVALIDA',
        'Revisá el territorio y los identificadores de los aportes.',
      );
    const id = await repo.crear(req.user.id, entrada.idLocal, entrada.contenido);
    if (!id)
      throw new HttpError(
        409,
        'REINTENTAR',
        'No se pudo recuperar el recibo. Reintentá el mismo envío.',
      );
    res.status(201).json({ data: { id } });
  } catch (err) {
    next(err);
  }
});
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    if (!req.user)
      throw new HttpError(401, 'SESION_REQUERIDA', 'Iniciá sesión para administrar fichas.');
    const id = idFichaSchema.parse(req.params.id);
    const entrada = editarFichaSchema.parse(req.body);
    const repo = new FichasRepository(getDb());
    const ficha = await repo.porId(id, req.user.id);
    if (!ficha) throw new HttpError(404, 'FICHA_NO_ENCONTRADA', 'No encontramos esa ficha.');
    if (!ficha.puedoEditar)
      throw new HttpError(
        403,
        'SIN_PERMISO',
        'Solo quien administra este borrador puede editarlo.',
      );
    if (!(await repo.referenciasValidas(entrada.contenido)))
      throw new HttpError(
        400,
        'REFERENCIA_INVALIDA',
        'Revisá el territorio y los identificadores de los aportes.',
      );
    if (!(await repo.editar(id, req.user.id, entrada.revisionEsperada, entrada.contenido))) {
      throw new HttpError(
        409,
        'REVISION_CAMBIADA',
        'La ficha cambió mientras editabas. Conservá tu texto y abrí la revisión actual antes de combinar los cambios.',
      );
    }
    res.json({ data: { id, revision: entrada.revisionEsperada + 1 } });
  } catch (err) {
    next(err);
  }
});
export { router as fichasRouter };
