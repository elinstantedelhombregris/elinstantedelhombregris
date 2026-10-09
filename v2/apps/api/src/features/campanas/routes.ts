import { CampanasRepository, UsersRepository, getDb } from '@v2/db';
import {
  crearCampanaSchema,
  editarCampanaSchema,
  cambiarCampanaSchema,
  devolucionCampanaSchema,
  contratoCampanaSchema,
} from '@v2/shared';
import { Router, type Router as RouterType } from 'express';
import { z } from 'zod';

import { usuarioAutenticado, authenticate, optionalAuthenticate } from '../../middleware/auth.js';
import { HttpError } from '../../middleware/error-handler.js';

import type { EstadoCampana } from '@v2/shared';

const router: RouterType = Router();
const idDe = (valor: unknown) => z.string().uuid().parse(valor);
const PASOS: Record<EstadoCampana, EstadoCampana[]> = {
  borrador: ['programada', 'abierta'],
  programada: ['abierta', 'pausada'],
  abierta: ['pausada', 'en_devolucion'],
  pausada: ['abierta', 'en_devolucion'],
  en_devolucion: ['abierta', 'cerrada'],
  cerrada: [],
};
router.get('/', optionalAuthenticate, async (req, res, next) => {
  try {
    const propias = req.query.mias === '1';
    if (propias && !req.user)
      throw new HttpError(401, 'SESION_REQUERIDA', 'Ingresá para ver tus campañas.');
    const lista = await new CampanasRepository(getDb()).listar(req.user?.id, propias);
    res.set('Cache-Control', 'no-store').json({
      data: lista.map((c) => ({ ...c, contrato: contratoCampanaSchema.parse(c.contrato) })),
    });
  } catch (e) {
    next(e);
  }
});
router.get('/:slug', optionalAuthenticate, async (req, res, next) => {
  try {
    const slug = z.string().min(1).max(120).parse(req.params.slug);
    const c = await new CampanasRepository(getDb()).porId(
      slug,
      req.user?.id,
      z.coerce.number().int().positive().optional().parse(req.query.edicion),
    );
    if (!c)
      throw new HttpError(404, 'CAMPANA_NO_ENCONTRADA', 'Todavía no encontramos esa campaña.');
    res.set('Cache-Control', 'no-store').json({
      data: { ...c, contrato: contratoCampanaSchema.parse(c.contrato) },
    });
  } catch (e) {
    next(e);
  }
});
router.post('/', authenticate, async (req, res, next) => {
  try {
    const v = crearCampanaSchema.parse(req.body);
    const repo = new CampanasRepository(getDb());
    if (!(await repo.territoriosValidos(v.contrato.territorios)))
      throw new HttpError(400, 'TERRITORIO_INVALIDO', 'Revisá los lugares elegidos.');
    res
      .status(201)
      .json({ data: { id: await repo.crear(usuarioAutenticado(req).id, v.idLocal, v.contrato) } });
  } catch (e) {
    if (e instanceof Error && e.message === 'REINTENTO_DISTINTO') {
      next(
        new HttpError(
          409,
          'ENVIO_DISTINTO',
          'Ese envío ya tiene otro contrato. Revisá el recibo antes de abrir otra campaña.',
        ),
      );
      return;
    }
    next(e);
  }
});
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const id = idDe(req.params.id);
    const v = editarCampanaSchema.parse(req.body);
    const repo = new CampanasRepository(getDb());
    const c = await repo.porId(id, usuarioAutenticado(req).id);
    if (!c?.puedoEditarContrato)
      throw new HttpError(
        403,
        'SIN_PERMISO',
        'Solo el equipo convocante puede revisar esta campaña.',
      );
    if (!(await repo.territoriosValidos(v.contrato.territorios)))
      throw new HttpError(400, 'TERRITORIO_INVALIDO', 'Revisá los lugares elegidos.');
    if (!(await repo.revisar(id, usuarioAutenticado(req).id, v.revision, v.contrato)))
      throw new HttpError(
        409,
        'REVISION_CAMBIADA',
        'La campaña cambió. Conservá tu texto y abrí la revisión actual.',
      );
    res.json({ data: { id } });
  } catch (e) {
    next(e);
  }
});
router.post('/:id/estado', authenticate, async (req, res, next) => {
  try {
    const id = idDe(req.params.id);
    const v = cambiarCampanaSchema.parse(req.body);
    const repo = new CampanasRepository(getDb());
    const c = await repo.porId(id, usuarioAutenticado(req).id);
    if (!c?.puedoEditar)
      throw new HttpError(403, 'SIN_PERMISO', 'Esta fase la cuida el equipo convocante.');
    if (!PASOS[c.estado].includes(v.estado))
      throw new HttpError(409, 'FASE_INVALIDA', 'Ese paso no sigue el recorrido de esta campaña.');
    if (v.estado === 'abierta' || v.estado === 'programada') {
      const usuario = await new UsersRepository(getDb()).findById(usuarioAutenticado(req).id);
      if (!usuario?.emailVerified)
        throw new HttpError(
          403,
          'EMAIL_PENDIENTE',
          'Verificá tu correo antes de convocar públicamente.',
        );
      if (c.contrato.fechaDevolucion < new Date().toISOString().slice(0, 10))
        throw new HttpError(
          400,
          'FECHA_VENCIDA',
          'Elegí una fecha de devolución que todavía podamos cumplir.',
        );
    }
    if (v.estado === 'cerrada' && c.devoluciones.length === 0)
      throw new HttpError(
        409,
        'DEVOLUCION_PENDIENTE',
        'Antes de cerrar, devolvé lo que aprendieron o explicá públicamente por qué no pudo hacerse.',
      );
    if (!(await repo.cambiarEstado(id, usuarioAutenticado(req).id, v.revision, v.estado, v.motivo)))
      throw new HttpError(409, 'REVISION_CAMBIADA', 'La campaña cambió mientras la revisabas.');
    res.json({ data: { id } });
  } catch (e) {
    next(e);
  }
});
router.post('/:id/devoluciones', authenticate, async (req, res, next) => {
  try {
    const id = idDe(req.params.id);
    const v = devolucionCampanaSchema.parse(req.body);
    const repo = new CampanasRepository(getDb());
    const c = await repo.porId(id, usuarioAutenticado(req).id);
    if (!c?.puedoEditar)
      throw new HttpError(403, 'SIN_PERMISO', 'La devolución la publica el equipo responsable.');
    if (
      !(await repo.devolver(
        id,
        usuarioAutenticado(req).id,
        v.idLocal,
        v.revision,
        v.texto,
        v.limites,
        v.senales,
      ))
    )
      throw new HttpError(
        409,
        'REVISION_CAMBIADA',
        'No pudimos registrar o recuperar este intento. Revisá la edición y sus fuentes; una devolución ya registrada solo admite el mismo contenido.',
      );
    res.status(201).json({ data: { publicada: true, id: v.idLocal } });
  } catch (e) {
    next(e);
  }
});
export { router as campanasRouter };
