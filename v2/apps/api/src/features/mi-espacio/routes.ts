import { MiEspacioRepository, getDb } from '@v2/db';
import { guardarAnalisisSchema, seguirSchema, vincularAportesSchema } from '@v2/shared';
import { Router, type Router as RouterType } from 'express';
import { z } from 'zod';

import { usuarioAutenticado, authenticate } from '../../middleware/auth.js';
import { HttpError } from '../../middleware/error-handler.js';
import { actorDelNavegador } from '../senales/actor.js';

const router: RouterType = Router();
router.use(authenticate, (_req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});
router.get('/', async (req, res, next) => {
  try {
    res.json({ data: await new MiEspacioRepository(getDb()).espacio(usuarioAutenticado(req).id) });
  } catch (e) {
    next(e);
  }
});
router.get('/aportes', async (req, res, next) => {
  try {
    const q = z
      .object({ offset: z.coerce.number().int().min(0).max(1000000).default(0) })
      .strict()
      .parse(req.query);
    res.json({
      data: await new MiEspacioRepository(getDb()).propios(usuarioAutenticado(req).id, q.offset),
    });
  } catch (e) {
    next(e);
  }
});
router.get('/recuperables', async (req, res, next) => {
  try {
    res.json({
      data: await new MiEspacioRepository(getDb()).candidatos(await actorDelNavegador(req)),
    });
  } catch (e) {
    next(e);
  }
});
router.post('/vincular', async (req, res, next) => {
  try {
    const v = vincularAportesSchema.parse(req.body);
    if (
      !(await new MiEspacioRepository(getDb()).vincular(
        usuarioAutenticado(req).id,
        await actorDelNavegador(req),
        v.senales,
      ))
    )
      throw new HttpError(
        403,
        'AUTORIA_NO_DISPONIBLE',
        'Solo podemos vincular los aportes que este navegador todavía puede gestionar. Revisá la selección.',
      );
    res.json({ data: { vinculados: v.senales.length } });
  } catch (e) {
    next(e);
  }
});
router.post('/seguimientos', async (req, res, next) => {
  try {
    const v = seguirSchema.parse(req.body);
    const repo = new MiEspacioRepository(getDb());
    if (v.tipo === 'campana' || v.tipo === 'ficha') z.string().uuid().parse(v.objeto);
    if (v.tipo === 'territorio') z.coerce.number().int().positive().parse(v.objeto);
    if (!(await repo.referencia(v.tipo, v.objeto)))
      throw new HttpError(404, 'PROCESO_NO_ENCONTRADO', 'Este proceso todavía no está disponible.');
    await repo.seguir(usuarioAutenticado(req).id, v.tipo, v.objeto);
    res.status(201).json({ data: { siguiendo: true } });
  } catch (e) {
    next(e);
  }
});
router.delete('/seguimientos/:id', async (req, res, next) => {
  try {
    await new MiEspacioRepository(getDb()).dejar(
      usuarioAutenticado(req).id,
      z.string().uuid().parse(req.params.id),
    );
    res.json({ data: { siguiendo: false } });
  } catch (e) {
    next(e);
  }
});
router.post('/analisis', async (req, res, next) => {
  try {
    const v = guardarAnalisisSchema.parse(req.body);
    const permitidos = [
      'campana',
      'edicion',
      'territorio',
      'tema',
      'desde',
      'hasta',
      'tipo',
      'estado',
      'umbral',
      'k',
    ];
    if (Object.keys(v.consulta).some((k) => !permitidos.includes(k)))
      throw new HttpError(
        400,
        'CONSULTA_INVALIDA',
        'Solo guardamos filtros públicos del análisis.',
      );
    res.status(201).json({
      data: {
        id: await new MiEspacioRepository(getDb()).guardarAnalisis(
          usuarioAutenticado(req).id,
          v.nombre,
          v.consulta,
          v.corte,
        ),
      },
    });
  } catch (e) {
    next(e);
  }
});
router.delete('/analisis/:id', async (req, res, next) => {
  try {
    await new MiEspacioRepository(getDb()).borrarAnalisis(
      usuarioAutenticado(req).id,
      z.string().uuid().parse(req.params.id),
    );
    res.json({ data: { borrado: true } });
  } catch (e) {
    next(e);
  }
});
router.get('/avisos', async (req, res, next) => {
  try {
    res.json({ data: await new MiEspacioRepository(getDb()).avisos(usuarioAutenticado(req).id) });
  } catch (e) {
    next(e);
  }
});
router.post('/avisos/:id/leido', async (req, res, next) => {
  try {
    await new MiEspacioRepository(getDb()).leer(
      usuarioAutenticado(req).id,
      z.string().uuid().parse(req.params.id),
    );
    res.json({ data: { leido: true } });
  } catch (e) {
    next(e);
  }
});
router.get('/mis-datos', async (req, res, next) => {
  try {
    res
      .set('Content-Disposition', 'attachment; filename="basta-mis-datos.json"')
      .json(await new MiEspacioRepository(getDb()).exportarPropios(usuarioAutenticado(req).id));
  } catch (e) {
    next(e);
  }
});
export { router as miEspacioRouter };
