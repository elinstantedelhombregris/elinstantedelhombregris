import { ColaboracionRepository, CampanasRepository, getDb } from '@v2/db';
import {
  invitarEquipoSchema,
  codigoEquipoSchema,
  revisionDevolucionSchema,
  respuestaRevisionSchema,
} from '@v2/shared';
import { Router, type Router as RouterType } from 'express';
import { z } from 'zod';

import { usuarioAutenticado, authenticate } from '../../middleware/auth.js';
import { HttpError } from '../../middleware/error-handler.js';
const router: RouterType = Router();
const repo = () => new ColaboracionRepository(getDb());
router.post('/invitaciones', authenticate, async (req, res, next) => {
  try {
    const v = invitarEquipoSchema.parse(req.body);
    if (!(await repo().propietario(v.tipo, v.objeto, usuarioAutenticado(req).id)))
      throw new HttpError(403, 'SIN_PERMISO', 'La invitación necesita a quien abrió el proceso.');
    res
      .set('Cache-Control', 'no-store')
      .status(201)
      .json({ data: await repo().invitar(v.tipo, v.objeto, usuarioAutenticado(req).id, v.rol) });
  } catch (e) {
    next(e);
  }
});
router.get('/invitaciones', authenticate, async (req, res, next) => {
  try {
    const v = invitarEquipoSchema.omit({ rol: true }).parse(req.query);
    if (!(await repo().propietario(v.tipo, v.objeto, usuarioAutenticado(req).id)))
      throw new HttpError(403, 'SIN_PERMISO', 'El equipo es una información de gestión.');
    res
      .set('Cache-Control', 'no-store')
      .json({ data: await repo().listar(v.tipo, v.objeto, usuarioAutenticado(req).id) });
  } catch (e) {
    next(e);
  }
});
router.post('/invitaciones/leer', authenticate, async (req, res, next) => {
  try {
    const v = codigoEquipoSchema.parse(req.body);
    const i = await repo().invitacion(v.codigo);
    if (!i)
      throw new HttpError(
        404,
        'INVITACION_NO_DISPONIBLE',
        'La invitación venció, ya se aceptó o fue revocada.',
      );
    res.set('Cache-Control', 'no-store').json({ data: i });
  } catch (e) {
    next(e);
  }
});
router.post('/invitaciones/aceptar', authenticate, async (req, res, next) => {
  try {
    const v = codigoEquipoSchema.parse(req.body);
    if (!(await repo().aceptar(v.codigo, usuarioAutenticado(req).id)))
      throw new HttpError(
        409,
        'INVITACION_NO_DISPONIBLE',
        'No pudimos aceptar esta invitación. Revisá si sigue vigente.',
      );
    res.json({ data: { aceptada: true } });
  } catch (e) {
    next(e);
  }
});
router.delete('/invitaciones/:id', authenticate, async (req, res, next) => {
  try {
    if (!(await repo().revocar(z.string().uuid().parse(req.params.id), usuarioAutenticado(req).id)))
      throw new HttpError(403, 'SIN_PERMISO', 'Solo quien invitó puede revocar ese permiso.');
    res.json({ data: { revocada: true } });
  } catch (e) {
    next(e);
  }
});
router.get('/campanas/:id/revisiones', async (req, res, next) => {
  try {
    const id = z.string().uuid().parse(req.params.id);
    if (!(await new CampanasRepository(getDb()).porId(id)))
      throw new HttpError(404, 'CAMPANA_NO_DISPONIBLE', 'No encontramos esa campaña pública.');
    res.set('Cache-Control', 'no-store').json({ data: await repo().correcciones(id) });
  } catch (e) {
    next(e);
  }
});
router.post('/campanas/:id/revisiones', authenticate, async (req, res, next) => {
  try {
    const id = z.string().uuid().parse(req.params.id);
    const v = revisionDevolucionSchema.parse(req.body);
    const revision = await repo().corregir(id, usuarioAutenticado(req).id, v.idLocal, v.texto);
    if (!revision)
      throw new HttpError(
        403,
        'PARTICIPACION_REQUERIDA',
        'Asociá tu aporte a la cuenta antes de pedir una revisión de esta devolución.',
      );
    res.status(201).json({ data: { id: revision } });
  } catch (e) {
    next(e);
  }
});
router.post(
  '/campanas/:id/revisiones/:revision/respuesta',
  authenticate,
  async (req, res, next) => {
    try {
      const id = z.string().uuid().parse(req.params.id);
      const rid = z.string().uuid().parse(req.params.revision);
      const v = respuestaRevisionSchema.parse(req.body);
      if (!(await repo().responderCorreccion(id, rid, usuarioAutenticado(req).id, v.texto)))
        throw new HttpError(
          403,
          'SIN_PERMISO',
          'La respuesta pública necesita al responsable de la campaña.',
        );
      res.json({ data: { respondida: true } });
    } catch (e) {
      next(e);
    }
  },
);
export { router as equipoRouter };
