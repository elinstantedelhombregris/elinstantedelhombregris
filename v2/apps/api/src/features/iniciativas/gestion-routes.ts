import {
  GestionIniciativasRepository,
  IniciativaEvidenciaRepository,
  IniciativaTareasRepository,
  getDb,
} from '@v2/db';
import {
  editarHitoSchema,
  editarIniciativaSchema,
  editarTareaSchema,
  equipoIniciativaSchema,
  escuchaQuerySchema,
  estadoTareaSchema,
  evidenciaTareaSchema,
  nuevaIniciativaSchema,
  nuevaTareaSchema,
  nuevoHitoSchema,
  paginaGestionSchema,
  revisarEvidenciaSchema,
  tareasQuerySchema,
} from '@v2/shared';
import { Router, type Router as RouterType } from 'express';
import { z } from 'zod';

import { authenticate, optionalAuthenticate, usuarioAutenticado } from '../../middleware/auth.js';
import { HttpError } from '../../middleware/error-handler.js';

const router: RouterType = Router();
const id = (v: unknown) => z.coerce.number().int().positive().parse(v);
const cursor = (v: unknown) => paginaGestionSchema.parse(v).cursor;
function resultado<T>(r: T | null) {
  if (!r)
    throw new HttpError(
      409,
      'GESTION_NO_APLICADA',
      'Revisá tus permisos y la versión actual. La operación puede requerir liberar una responsabilidad, completar una revisión o usar un recibo nuevo. Conservamos tu borrador.',
    );
  return r;
}
router.get('/escuchas', async (req, res, next) => {
  try {
    res.set('Cache-Control', 'no-store').json({
      data: await new IniciativaEvidenciaRepository(getDb()).escuchas(
        escuchaQuerySchema.parse(req.query),
      ),
    });
  } catch (e) {
    next(e);
  }
});
router.get(['/gestionadas', '/mias'], authenticate, async (req, res, next) => {
  try {
    res.set('Cache-Control', 'no-store').json({
      data: await new GestionIniciativasRepository(getDb()).personales(
        usuarioAutenticado(req).id,
        cursor(req.query),
        req.path === '/gestionadas',
      ),
    });
  } catch (e) {
    next(e);
  }
});
router.post('/', authenticate, async (req, res, next) => {
  try {
    res.status(201).json({
      data: resultado(
        await new GestionIniciativasRepository(getDb()).crear(
          usuarioAutenticado(req).id,
          nuevaIniciativaSchema.parse(req.body),
        ),
      ),
    });
  } catch (e) {
    next(e);
  }
});
router.patch('/:id', authenticate, async (req, res, next) => {
  try {
    res.json({
      data: resultado(
        await new GestionIniciativasRepository(getDb()).editar(
          id(req.params.id),
          usuarioAutenticado(req).id,
          editarIniciativaSchema.parse(req.body),
        ),
      ),
    });
  } catch (e) {
    next(e);
  }
});
router.get('/:id/equipo', authenticate, async (req, res, next) => {
  try {
    const r = await new GestionIniciativasRepository(getDb()).equipo(
      id(req.params.id),
      usuarioAutenticado(req).id,
      cursor(req.query),
    );
    if (!r)
      throw new HttpError(403, 'SIN_PERMISO', 'Solo la administración puede consultar el equipo.');
    res.set('Cache-Control', 'no-store').json({ data: r });
  } catch (e) {
    next(e);
  }
});
router.post('/:id/equipo', authenticate, async (req, res, next) => {
  try {
    res.json({
      data: resultado(
        await new GestionIniciativasRepository(getDb()).cambiarEquipo(
          id(req.params.id),
          usuarioAutenticado(req).id,
          equipoIniciativaSchema.parse(req.body),
        ),
      ),
    });
  } catch (e) {
    next(e);
  }
});
router.get('/:id/hitos', async (req, res, next) => {
  try {
    res.json({
      data: await new IniciativaTareasRepository(getDb()).hitos(
        id(req.params.id),
        cursor(req.query),
      ),
    });
  } catch (e) {
    next(e);
  }
});
router.post('/:id/hitos', authenticate, async (req, res, next) => {
  try {
    res.status(201).json({
      data: resultado(
        await new IniciativaTareasRepository(getDb()).hito(
          id(req.params.id),
          usuarioAutenticado(req).id,
          nuevoHitoSchema.parse(req.body),
        ),
      ),
    });
  } catch (e) {
    next(e);
  }
});
router.patch('/:id/hitos/:hito', authenticate, async (req, res, next) => {
  try {
    res.json({
      data: resultado(
        await new IniciativaTareasRepository(getDb()).hito(
          id(req.params.id),
          usuarioAutenticado(req).id,
          editarHitoSchema.parse(req.body),
          id(req.params.hito),
        ),
      ),
    });
  } catch (e) {
    next(e);
  }
});
router.get('/:id/tareas', optionalAuthenticate, async (req, res, next) => {
  try {
    res.set('Cache-Control', 'no-store').json({
      data: await new IniciativaTareasRepository(getDb()).tareas(
        id(req.params.id),
        req.user?.id,
        tareasQuerySchema.parse(req.query).cursor,
        tareasQuerySchema.parse(req.query).tareaId,
      ),
    });
  } catch (e) {
    next(e);
  }
});
router.post('/:id/tareas', authenticate, async (req, res, next) => {
  try {
    res.status(201).json({
      data: resultado(
        await new IniciativaTareasRepository(getDb()).tarea(
          id(req.params.id),
          usuarioAutenticado(req).id,
          nuevaTareaSchema.parse(req.body),
        ),
      ),
    });
  } catch (e) {
    next(e);
  }
});
router.patch('/:id/tareas/:tarea', authenticate, async (req, res, next) => {
  try {
    res.json({
      data: resultado(
        await new IniciativaTareasRepository(getDb()).tarea(
          id(req.params.id),
          usuarioAutenticado(req).id,
          editarTareaSchema.parse(req.body),
          id(req.params.tarea),
        ),
      ),
    });
  } catch (e) {
    next(e);
  }
});
router.post('/:id/tareas/:tarea/estado', authenticate, async (req, res, next) => {
  try {
    res.json({
      data: resultado(
        await new IniciativaTareasRepository(getDb()).estado(
          id(req.params.id),
          id(req.params.tarea),
          usuarioAutenticado(req).id,
          estadoTareaSchema.parse(req.body),
        ),
      ),
    });
  } catch (e) {
    next(e);
  }
});
router.get('/:id/tareas/:tarea/evidencias', optionalAuthenticate, async (req, res, next) => {
  try {
    res.set('Cache-Control', 'no-store').json({
      data: await new IniciativaEvidenciaRepository(getDb()).listar(
        id(req.params.id),
        id(req.params.tarea),
        req.user?.id,
        cursor(req.query),
      ),
    });
  } catch (e) {
    next(e);
  }
});
router.post('/:id/tareas/:tarea/evidencias', authenticate, async (req, res, next) => {
  try {
    res.status(201).json({
      data: resultado(
        await new IniciativaEvidenciaRepository(getDb()).crear(
          id(req.params.id),
          id(req.params.tarea),
          usuarioAutenticado(req).id,
          evidenciaTareaSchema.parse(req.body),
        ),
      ),
    });
  } catch (e) {
    next(e);
  }
});
router.post('/:id/evidencias/:evidencia', authenticate, async (req, res, next) => {
  try {
    res.json({
      data: resultado(
        await new IniciativaEvidenciaRepository(getDb()).revisar(
          id(req.params.id),
          id(req.params.evidencia),
          usuarioAutenticado(req).id,
          revisarEvidenciaSchema.parse(req.body),
        ),
      ),
    });
  } catch (e) {
    next(e);
  }
});
router.get('/:id/actividad', async (req, res, next) => {
  try {
    res.json({
      data: await new GestionIniciativasRepository(getDb()).actividad(
        id(req.params.id),
        cursor(req.query),
      ),
    });
  } catch (e) {
    next(e);
  }
});
export { router as gestionIniciativasRouter };
