import { CapacidadesRepository, ReservasCapacidadRepository, getDb } from '@v2/db';
import {
  accionCapacidadSchema,
  accionReservaSchema,
  capacidadSchema,
  consultaCapacidadesSchema,
  idFichaSchema,
  solicitudCapacidadSchema,
} from '@v2/shared';
import { Router, type Router as RouterType } from 'express';

import { authenticate, optionalAuthenticate, usuarioAutenticado } from '../../middleware/auth.js';
import { HttpError } from '../../middleware/error-handler.js';

const router: RouterType = Router();
router.use((_req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});
const conflicto = () =>
  new HttpError(
    409,
    'CAPACIDAD_NO_ACTUALIZADA',
    'No pudimos registrar el cambio. Revisá permisos, fechas, condiciones y disponibilidad actual. Tu formulario se conserva.',
  );
router.get('/', optionalAuthenticate, async (req, res, next) => {
  try {
    const q = consultaCapacidadesSchema.parse(req.query);
    if ((q.propias || q.fichaId) && !req.user)
      throw new HttpError(401, 'SESION_REQUERIDA', 'Ingresá para consultar tus solicitudes.');
    res.json({ data: await new CapacidadesRepository(getDb()).listar(q, req.user?.id) });
  } catch (e) {
    next(e);
  }
});
router.get('/:id', optionalAuthenticate, async (req, res, next) => {
  try {
    const id = idFichaSchema.parse(req.params.id);
    const despues = idFichaSchema.optional().parse(req.query.despues);
    const data = await new CapacidadesRepository(getDb()).leer(id, req.user?.id, despues);
    if (!data)
      throw new HttpError(
        404,
        'CAPACIDAD_NO_ENCONTRADA',
        'No encontramos esa capacidad disponible para consultar.',
      );
    res.json({ data });
  } catch (e) {
    next(e);
  }
});
router.post('/', authenticate, async (req, res, next) => {
  try {
    const id = await new CapacidadesRepository(getDb()).crear(
      usuarioAutenticado(req).id,
      capacidadSchema.parse(req.body),
    );
    if (!id) throw conflicto();
    res.status(201).json({ data: { id } });
  } catch (e) {
    next(e);
  }
});
router.post('/:id/estado', authenticate, async (req, res, next) => {
  try {
    const id = idFichaSchema.parse(req.params.id);
    const { accion } = accionCapacidadSchema.parse(req.body);
    if (!(await new CapacidadesRepository(getDb()).actuar(id, usuarioAutenticado(req).id, accion)))
      throw conflicto();
    res.json({ data: { actualizado: true } });
  } catch (e) {
    next(e);
  }
});
router.post('/:id/reservas', authenticate, async (req, res, next) => {
  try {
    const id = await new ReservasCapacidadRepository(getDb()).solicitar(
      idFichaSchema.parse(req.params.id),
      usuarioAutenticado(req).id,
      solicitudCapacidadSchema.parse(req.body),
    );
    if (!id) throw conflicto();
    res.status(201).json({ data: { id } });
  } catch (e) {
    next(e);
  }
});
router.post('/:id/reservas/:reserva/estado', authenticate, async (req, res, next) => {
  try {
    if (
      !(await new ReservasCapacidadRepository(getDb()).actuar(
        idFichaSchema.parse(req.params.id),
        idFichaSchema.parse(req.params.reserva),
        usuarioAutenticado(req).id,
        accionReservaSchema.parse(req.body),
      ))
    )
      throw conflicto();
    res.json({ data: { actualizado: true } });
  } catch (e) {
    next(e);
  }
});
export { router as capacidadesRouter };
