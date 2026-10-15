import { getDb, SintesisNacionalRepository } from '@v2/db';
import {
  accionSintesisNacionalSchema,
  crearSintesisNacionalSchema,
  idFichaSchema,
} from '@v2/shared';
import { Router, type Router as RouterType } from 'express';
import { z } from 'zod';

import { authenticate, optionalAuthenticate, usuarioAutenticado } from '../../middleware/auth.js';
import { HttpError } from '../../middleware/error-handler.js';
import censo from '../conciliacion/censo.generated.json' with { type: 'json' };

const router: RouterType = Router();
router.use((_req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});
router.get('/', optionalAuthenticate, async (req, res, next) => {
  try {
    res.json({
      data: await new SintesisNacionalRepository(getDb()).listar(
        req.user?.id,
        z.string().uuid().optional().parse(req.query.despues),
      ),
    });
  } catch (e) {
    next(e);
  }
});
router.get('/:id', optionalAuthenticate, async (req, res, next) => {
  try {
    const data = await new SintesisNacionalRepository(getDb()).porId(
      idFichaSchema.parse(req.params.id),
      req.user?.id,
    );
    if (!data)
      throw new HttpError(
        404,
        'EDICION_NO_DISPONIBLE',
        'Esta edición no está disponible o todavía requiere revisión de su equipo.',
      );
    res.json({ data });
  } catch (e) {
    next(e);
  }
});
router.post('/', authenticate, async (req, res, next) => {
  try {
    const id = await new SintesisNacionalRepository(getDb()).crear(
      usuarioAutenticado(req).id,
      crearSintesisNacionalSchema.parse(req.body),
      censo.version,
    );
    if (!id)
      throw new HttpError(
        409,
        'EDICION_NO_GUARDADA',
        'Revisá los permisos de edición, las versiones de las fichas y sus apoyos. Un recibo no puede usarse con otro contenido.',
      );
    res.status(201).json({ data: { id } });
  } catch (e) {
    next(e);
  }
});
router.post('/:id/acciones', authenticate, async (req, res, next) => {
  try {
    const accion = accionSintesisNacionalSchema.parse(req.body).accion;
    if (
      !(await new SintesisNacionalRepository(getDb()).actuar(
        idFichaSchema.parse(req.params.id),
        usuarioAutenticado(req).id,
        accion,
      ))
    )
      throw new HttpError(
        409,
        'REVISION_NO_APLICADA',
        'La revisión requiere otra persona editora de todas las fichas, apoyos vigentes y una próxima revisión futura. Solo autor o revisor pueden retirar la edición.',
      );
    res.json({ data: { aplicada: true } });
  } catch (e) {
    next(e);
  }
});
export { router as sintesisNacionalRouter };
