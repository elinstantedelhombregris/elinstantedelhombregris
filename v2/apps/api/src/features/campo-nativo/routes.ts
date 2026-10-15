import { randomBytes } from 'node:crypto';

import { CampoNativoRepository, getDb, IniciativaEvidenciaRepository } from '@v2/db';
import {
  envioCampoSchema,
  nuevoDispositivoCampoSchema,
  paginaGestionSchema,
  revisarEvidenciaSchema,
} from '@v2/shared';
import { Router, type Router as RouterType } from 'express';
import { z } from 'zod';

import { authenticate, usuarioAutenticado } from '../../middleware/auth.js';
import { HttpError } from '../../middleware/error-handler.js';

const dispositivos: RouterType = Router();
const nativo: RouterType = Router();
const repo = () => new CampoNativoRepository(getDb());
const id = (v: unknown) => z.coerce.number().int().positive().parse(v);
const conflicto = () =>
  new HttpError(
    409,
    'CAMPO_CONFLICTO',
    'Cambió la tarea o tus permisos. Conservá el resumen y revisá la versión actual.',
  );
dispositivos.use(authenticate);
dispositivos.get('/', async (req, res, next) => {
  try {
    res
      .set('Cache-Control', 'no-store')
      .json({ data: await repo().listar(usuarioAutenticado(req).id) });
  } catch (e) {
    next(e);
  }
});
dispositivos.post('/', async (req, res, next) => {
  try {
    const v = nuevoDispositivoCampoSchema.parse(req.body),
      token = randomBytes(32).toString('hex');
    const uid = usuarioAutenticado(req).id;
    if (v.usuarioId !== uid)
      throw new HttpError(
        403,
        'CUENTA_CAMPO_DISTINTA',
        'La cuenta cambió. Recargá antes de vincular un teléfono.',
      );
    const r = await repo().crear(uid, v.nombre, token);
    if (!r)
      throw new HttpError(
        409,
        'DISPOSITIVOS_LIMITE',
        'Revocá un dispositivo antes de vincular otro.',
      );
    res
      .set('Cache-Control', 'no-store')
      .status(201)
      .json({ data: { ...r, token } });
  } catch (e) {
    next(e);
  }
});
dispositivos.delete('/:id', async (req, res, next) => {
  try {
    const r = await repo().revocar(
      usuarioAutenticado(req).id,
      z.string().uuid().parse(req.params.id),
    );
    if (!r)
      throw new HttpError(
        404,
        'DISPOSITIVO_NO_ENCONTRADO',
        'No encontramos ese dispositivo en tu cuenta.',
      );
    res.json({ data: r });
  } catch (e) {
    next(e);
  }
});
// Frontera dedicada: nunca autenticar esta ruta con las cookies de la web.
nativo.use(async (req, res, next) => {
  try {
    const token = req.header('authorization')?.match(/^Bearer ([a-f0-9]{64})$/)?.[1];
    const sesion = token ? await repo().autenticar(token) : null;
    if (!sesion)
      throw new HttpError(
        401,
        'DISPOSITIVO_NO_VINCULADO',
        'La vinculación venció o fue revocada. Vinculá nuevamente este teléfono desde la web.',
      );
    res.locals.campo = sesion;
    res.set('Cache-Control', 'no-store');
    next();
  } catch (e) {
    next(e);
  }
});
const sesionSchema = z.object({ id: z.string().uuid(), usuarioId: z.number().int().positive() });
nativo.get('/tareas', async (req, res, next) => {
  try {
    const s = sesionSchema.parse(res.locals.campo),
      q = paginaGestionSchema.parse(req.query);
    res.json({
      data: {
        usuarioId: s.usuarioId,
        dispositivoId: s.id,
        ...(await repo().tareas(s.usuarioId, q.cursor)),
      },
    });
  } catch (e) {
    next(e);
  }
});
nativo.post('/iniciativas/:id/tareas/:tarea/campo', async (req, res, next) => {
  try {
    const s = sesionSchema.parse(res.locals.campo),
      v = envioCampoSchema.parse(req.body);
    if (v.usuarioId !== s.usuarioId)
      throw new HttpError(403, 'CUENTA_CAMPO_DISTINTA', 'El resumen pertenece a otra cuenta.');
    const r = await new IniciativaEvidenciaRepository(getDb()).campo(
      id(req.params.id),
      id(req.params.tarea),
      s.usuarioId,
      v,
      true,
    );
    if (!r) throw conflicto();
    res.status(201).json({ data: r });
  } catch (e) {
    next(e);
  }
});
nativo.get('/evidencias/:id', async (req, res, next) => {
  try {
    const s = sesionSchema.parse(res.locals.campo),
      r = await repo().evidencia(s.usuarioId, id(req.params.id));
    if (!r)
      throw new HttpError(404, 'EVIDENCIA_NO_ENCONTRADA', 'No encontramos esa evidencia propia.');
    res.json({ data: r });
  } catch (e) {
    next(e);
  }
});
nativo.post('/iniciativas/:id/evidencias/:evidencia/retirar', async (req, res, next) => {
  try {
    const s = sesionSchema.parse(res.locals.campo);
    const v = revisarEvidenciaSchema.parse(req.body);
    if (v.accion !== 'retirar')
      throw new HttpError(400, 'SOLO_RETIRO', 'Este acceso sólo permite retirar evidencia propia.');
    const r = await new IniciativaEvidenciaRepository(getDb()).revisar(
      id(req.params.id),
      id(req.params.evidencia),
      s.usuarioId,
      v,
      true,
    );
    if (!r) throw conflicto();
    res.json({ data: r });
  } catch (e) {
    next(e);
  }
});
export { dispositivos as dispositivosCampoRouter, nativo as campoNativoRouter };
