import { getDb, ResultadosFichaRepository } from '@v2/db';
import { paginaGestionSchema, vinculoFichaTareaSchema } from '@v2/shared';
import { Router, type Router as RouterType } from 'express';
import { z } from 'zod';

import { authenticate, usuarioAutenticado } from '../../middleware/auth.js';
import { HttpError } from '../../middleware/error-handler.js';
const router: RouterType = Router();
const id = (v: unknown) => z.coerce.number().int().positive().parse(v);
router.get('/iniciativas/:id/tareas/:tarea/ficha', async (req, res, next) => {
  try {
    id(req.params.id);
    res.json({
      data: await new ResultadosFichaRepository(getDb()).vinculo(
        id(req.params.id),
        id(req.params.tarea),
      ),
    });
  } catch (e) {
    next(e);
  }
});
router.post('/iniciativas/:id/tareas/:tarea/ficha', authenticate, async (req, res, next) => {
  try {
    const r = await new ResultadosFichaRepository(getDb()).vincular(
      id(req.params.id),
      id(req.params.tarea),
      usuarioAutenticado(req).id,
      vinculoFichaTareaSchema.parse(req.body),
    );
    if (!r)
      throw new HttpError(
        409,
        'DESTINO_CONFLICTO',
        'Necesitás administrar la iniciativa y editar la ficha. Sólo podés cambiar el destino antes de publicar evidencia, con la versión actual de la tarea.',
      );
    res.json({ data: r });
  } catch (e) {
    next(e);
  }
});
router.get('/fichas/:id/resultados-campo', async (req, res, next) => {
  try {
    const q = paginaGestionSchema.parse(req.query);
    res.set('Cache-Control', 'no-store').json({
      data: await new ResultadosFichaRepository(getDb()).listar(
        z.string().uuid().parse(req.params.id),
        q.cursor,
      ),
    });
  } catch (e) {
    next(e);
  }
});
export { router as resultadosFichaRouter };
