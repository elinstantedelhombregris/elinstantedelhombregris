import { getDb, IniciativaEvidenciaRepository, RecursosTareaRepository } from '@v2/db';
import { envioCampoSchema, recursosTareaQuerySchema, vinculoReservaSchema } from '@v2/shared';
import { Router, type Router as RouterType } from 'express';
import { z } from 'zod';

import { authenticate, usuarioAutenticado } from '../../middleware/auth.js';
import { HttpError } from '../../middleware/error-handler.js';

const router: RouterType = Router();
const id = (v: unknown) => z.coerce.number().int().positive().parse(v);
const conflicto = () =>
  new HttpError(
    409,
    'CAMPO_CONFLICTO',
    'Cambió la tarea, la reserva o tus permisos. Conservamos el envío: recuperá la versión actual y revisá antes de volver a autorizar.',
  );
router.get('/:id/tareas/:tarea/recursos', authenticate, async (req, res, next) => {
  try {
    const q = recursosTareaQuerySchema.parse(req.query);
    res.set('Cache-Control', 'no-store').json({
      data: await new RecursosTareaRepository(getDb()).listar(
        id(req.params.id),
        id(req.params.tarea),
        usuarioAutenticado(req).id,
        q.disponibles === 'si',
        q.despues,
      ),
    });
  } catch (e) {
    next(e);
  }
});
router.post('/:id/tareas/:tarea/recursos', authenticate, async (req, res, next) => {
  try {
    const r = await new RecursosTareaRepository(getDb()).vincular(
      id(req.params.id),
      id(req.params.tarea),
      usuarioAutenticado(req).id,
      vinculoReservaSchema.parse(req.body),
    );
    if (!r) throw conflicto();
    res.json({ data: r });
  } catch (e) {
    next(e);
  }
});
router.post('/:id/tareas/:tarea/campo', authenticate, async (req, res, next) => {
  try {
    const v = envioCampoSchema.parse(req.body);
    const uid = usuarioAutenticado(req).id;
    if (v.usuarioId !== uid)
      throw new HttpError(
        403,
        'CUENTA_CAMPO_DISTINTA',
        'Ingresá con la cuenta que preparó este envío. No se publicó con otra cuenta.',
      );
    const r = await new IniciativaEvidenciaRepository(getDb()).campo(
      id(req.params.id),
      id(req.params.tarea),
      uid,
      v,
    );
    if (!r) throw conflicto();
    res.status(201).json({ data: r });
  } catch (e) {
    next(e);
  }
});
export { router as campoRecursosRouter };
