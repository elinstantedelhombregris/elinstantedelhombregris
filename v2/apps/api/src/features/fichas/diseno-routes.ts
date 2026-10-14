import { DisenoFichaRepository, FichasRepository, PruebasRepository, getDb } from '@v2/db';
import {
  afirmarSchema,
  responderAfirmacionSchema,
  alternativaSchema,
  propuestaPruebaSchema,
  avanzarPruebaSchema,
} from '@v2/shared';
import { Router, type Router as RouterType } from 'express';
import { z } from 'zod';

import { usuarioAutenticado, authenticate, optionalAuthenticate } from '../../middleware/auth.js';
import { HttpError } from '../../middleware/error-handler.js';

const router: RouterType = Router();
const uuid = (v: unknown) => z.string().uuid().parse(v);
async function existe(id: string) {
  if (!(await new FichasRepository(getDb()).porId(id)))
    throw new HttpError(
      404,
      'FICHA_NO_ENCONTRADA',
      'Primero necesitamos una ficha de futuro que pueda leerse.',
    );
}
router.get('/:id/diseno', optionalAuthenticate, async (req, res, next) => {
  try {
    const id = uuid(req.params.id);
    await existe(id);
    res
      .set('Cache-Control', 'no-store')
      .json({ data: await new DisenoFichaRepository(getDb()).leer(id, req.user?.id) });
  } catch (e) {
    next(e);
  }
});
router.post('/:id/afirmaciones', authenticate, async (req, res, next) => {
  try {
    const id = uuid(req.params.id);
    await existe(id);
    const v = afirmarSchema.parse(req.body);
    const nueva = await new DisenoFichaRepository(getDb()).afirmar(
      id,
      usuarioAutenticado(req).id,
      v.idLocal,
      v.texto,
    );
    if (!nueva) throw new HttpError(409, 'ENVIO_DISTINTO', 'Este envío pertenece a otra ficha.');
    res.status(201).json({ data: { id: nueva } });
  } catch (e) {
    next(e);
  }
});
router.delete('/afirmaciones/:id', authenticate, async (req, res, next) => {
  try {
    if (
      !(await new DisenoFichaRepository(getDb()).retirarAfirmacion(
        uuid(req.params.id),
        usuarioAutenticado(req).id,
      ))
    )
      throw new HttpError(403, 'SIN_PERMISO', 'Solo quien propuso la afirmación puede retirarla.');
    res.json({ data: { retirada: true } });
  } catch (e) {
    next(e);
  }
});
router.post('/afirmaciones/:id/exposicion', authenticate, async (req, res, next) => {
  try {
    if (
      !(await new DisenoFichaRepository(getDb()).exponer(
        uuid(req.params.id),
        usuarioAutenticado(req).id,
      ))
    )
      throw new HttpError(404, 'AFIRMACION_NO_DISPONIBLE', 'La afirmación ya no está disponible.');
    res.json({ data: { mostrada: true } });
  } catch (e) {
    next(e);
  }
});
router.post('/afirmaciones/:id/respuesta', authenticate, async (req, res, next) => {
  try {
    const v = responderAfirmacionSchema.parse(req.body);
    if (
      !(await new DisenoFichaRepository(getDb()).responder(
        uuid(req.params.id),
        usuarioAutenticado(req).id,
        v.valor,
      ))
    )
      throw new HttpError(404, 'AFIRMACION_NO_DISPONIBLE', 'La afirmación ya no está disponible.');
    res.json({ data: { respondida: true } });
  } catch (e) {
    next(e);
  }
});
router.post('/:id/alternativas', authenticate, async (req, res, next) => {
  try {
    const id = uuid(req.params.id);
    await existe(id);
    const v = alternativaSchema.parse(req.body);
    const nueva = await new DisenoFichaRepository(getDb()).alternativa(
      id,
      usuarioAutenticado(req).id,
      v,
    );
    if (!nueva)
      throw new HttpError(
        409,
        'ENVIO_DISTINTO',
        'Revisá el recibo y que la alternativa anterior y la objeción activa pertenezcan a esta ficha. Tu propuesta se conserva.',
      );
    res.status(201).json({ data: { id: nueva } });
  } catch (e) {
    next(e);
  }
});
router.post('/pruebas', authenticate, async (req, res, next) => {
  try {
    const v = propuestaPruebaSchema.parse(req.body);
    const id = await new PruebasRepository(getDb()).proponer(usuarioAutenticado(req).id, v);
    if (id === 'conflicto')
      throw new HttpError(
        409,
        'ENVIO_DISTINTO',
        'Ese envío conserva otra prueba. Revisá su recibo antes de proponer otra.',
      );
    if (!id)
      throw new HttpError(
        404,
        'ALTERNATIVA_NO_DISPONIBLE',
        'Primero hace falta una alternativa que podamos probar.',
      );
    res.status(201).json({ data: { id } });
  } catch (e) {
    next(e);
  }
});
router.post('/pruebas/:id/estado', authenticate, async (req, res, next) => {
  try {
    const v = avanzarPruebaSchema.parse(req.body);
    const r = await new PruebasRepository(getDb()).avanzar(
      uuid(req.params.id),
      usuarioAutenticado(req).id,
      v,
    );
    if (r !== 'ok')
      throw new HttpError(
        r === 'sin_permiso' ? 403 : 409,
        'PRUEBA_NO_AVANZO',
        r === 'sin_permiso'
          ? 'Este paso necesita al responsable o a una cuenta distinta que revise el resultado.'
          : 'La prueba cambió o este paso todavía no corresponde. Conservá tu observación.',
      );
    res.json({ data: { registrada: true } });
  } catch (e) {
    next(e);
  }
});
export { router as disenoFichasRouter };
