import { randomBytes } from 'node:crypto';

import { ContribucionesRepository, MiEspacioRepository, getDb, temas, eq } from '@v2/db';
import { contribucionSchema, corregirAporteSchema } from '@v2/shared';
import { Router, type Router as RouterType } from 'express';
import { z } from 'zod';

import { getConfig, nombreProveedorIA } from '../../lib/config.js';
import { optionalAuthenticate } from '../../middleware/auth.js';
import { HttpError } from '../../middleware/error-handler.js';
import { anonSubmitRateLimit } from '../../middleware/rate-limit.js';
import { actorDelNavegador, ponerCookieDeActor, resolverActor } from '../senales/actor.js';
import { ingerirSenal } from '../senales/service.js';

import { interpretarTexto, pedidoLecturaSchema } from './interpretacion.js';

const router: RouterType = Router();
router.use(optionalAuthenticate);
router.get('/contexto', async (req, res, next) => {
  try {
    const cookies: unknown = req.cookies;
    const previa =
      typeof cookies === 'object' && cookies !== null
        ? (cookies as Record<string, unknown>).eihg_csrf
        : undefined;
    const csrfToken =
      typeof previa === 'string' && previa.length >= 20 ? previa : randomBytes(24).toString('hex');
    res.cookie('eihg_csrf', csrfToken, {
      httpOnly: false,
      sameSite: 'lax',
      secure: getConfig().auth.cookieSecure,
      path: '/',
      maxAge: 86400000,
    });
    res.set('Cache-Control', 'no-store').json({
      data: {
        csrfToken,
        temas: await getDb()
          .select({ clave: temas.clave, etiqueta: temas.etiqueta })
          .from(temas)
          .orderBy(temas.orden),
        proveedor: nombreProveedorIA(),
      },
    });
  } catch (e) {
    next(e);
  }
});
router.post('/interpretar', anonSubmitRateLimit(), async (req, res, next) => {
  try {
    const v = pedidoLecturaSchema.parse(req.body);
    res.set('Cache-Control', 'no-store').json({ data: await interpretarTexto(v.texto) });
  } catch (e) {
    next(e);
  }
});
router.post('/', anonSubmitRateLimit(), async (req, res, next) => {
  try {
    const v = contribucionSchema.parse(req.body);
    if (v.senal.tema) {
      const [tema] = await getDb()
        .select({ clave: temas.clave })
        .from(temas)
        .where(eq(temas.clave, v.senal.tema));
      if (!tema)
        throw new HttpError(
          400,
          'TEMA_NO_DISPONIBLE',
          'Elegí uno de los temas del registro o dejá el tema abierto.',
        );
    }
    const repo = new ContribucionesRepository(getDb());
    const previo = await repo.propietarioDeReintento(v, req.user?.id, await actorDelNavegador(req));
    if (!previo && v.cuentaEsperada !== undefined && v.cuentaEsperada !== (req.user?.id ?? null))
      throw new HttpError(
        409,
        'CUENTA_CAMBIADA',
        'La cuenta cambió desde que revisaste el envío. Tu texto sigue con vos: ingresá con esa cuenta o volvé a revisar antes de compartir.',
      );
    const actor = previo ? { actorId: previo.actorId, claveNueva: null } : await resolverActor(req);
    const recibo = await ingerirSenal(v.senal, {
      origen: 'web',
      actorId: actor.actorId,
      userId: previo ? previo.userId : (req.user?.id ?? null),
      persistir: (fila) => repo.crear(fila, v),
    });
    ponerCookieDeActor(res, actor.claveNueva);
    res
      .status(201)
      .set('Cache-Control', 'no-store')
      .json({ data: { ...recibo, contexto: await repo.contexto(recibo.idPublico) } });
  } catch (e) {
    const mensaje = e instanceof Error ? e.message : '';
    if (mensaje.includes('contribucion_contexto_chk')) {
      next(
        new HttpError(
          409,
          'CAMPANA_CAMBIADA',
          'La campaña cambió. Tu borrador sigue con vos; revisá la edición antes de compartir.',
        ),
      );
      return;
    }
    if (mensaje === 'AUTORIA_AJENA' || mensaje === 'REINTENTO_DISTINTO') {
      next(
        new HttpError(
          409,
          'ENVIO_DISTINTO',
          'Ese identificador ya tiene otro aporte. Conservá el recibo o comenzá un envío nuevo.',
        ),
      );
      return;
    }
    next(e);
  }
});
router.get('/:id/privado', async (req, res, next) => {
  try {
    const id = z.string().uuid().parse(req.params.id);
    const aporte = await new MiEspacioRepository(getDb()).aportePrivado(
      id,
      req.user?.id,
      await actorDelNavegador(req),
    );
    if (!aporte)
      throw new HttpError(
        403,
        'AUTORIA_NO_DISPONIBLE',
        'El texto reservado se muestra solo a quien conserva su autoría.',
      );
    res.set('Cache-Control', 'no-store').json({ data: aporte });
  } catch (e) {
    next(e);
  }
});
router.patch('/:id', async (req, res, next) => {
  try {
    const id = z.string().uuid().parse(req.params.id);
    const v = corregirAporteSchema.parse(req.body);
    const repo = new MiEspacioRepository(getDb());
    if (!(await repo.esPropio(id, req.user?.id, await actorDelNavegador(req))))
      throw new HttpError(
        403,
        'AUTORIA_NO_DISPONIBLE',
        'Ingresá con la cuenta vinculada o usá el navegador que publicó el aporte.',
      );
    const propia = await repo.aportePrivado(id, req.user?.id, await actorDelNavegador(req));
    if (propia?.textoProtegido && propia.texto !== v.texto)
      throw new HttpError(
        409,
        'TEXTO_CON_HISTORIA',
        'Esta voz ya tiene adhesiones o conserva evidencia de un hecho o una acción. Compartí un aporte nuevo para corregir el enunciado; así nadie queda apoyando palabras que no leyó.',
      );
    if (
      !(await repo.corregir(
        id,
        v.revision,
        v.texto,
        v.cedeLicencia,
        req.user?.id,
        await actorDelNavegador(req),
      ))
    )
      throw new HttpError(
        409,
        'REVISION_CAMBIADA',
        'El aporte cambió o fue retirado. Conservá tu texto y revisá la versión actual.',
      );
    res.json({ data: { corregido: true } });
  } catch (e) {
    next(e);
  }
});
router.delete('/:id', async (req, res, next) => {
  try {
    const id = z.string().uuid().parse(req.params.id);
    const repo = new MiEspacioRepository(getDb());
    if (!(await repo.esPropio(id, req.user?.id, await actorDelNavegador(req))))
      throw new HttpError(
        403,
        'AUTORIA_NO_DISPONIBLE',
        'La autoría se comprueba antes de retirar. Ingresá con tu cuenta o usá el navegador original.',
      );
    await repo.retirar(id, req.user?.id, await actorDelNavegador(req));
    res.json({ data: { retirada: true } });
  } catch (e) {
    next(e);
  }
});
export { router as contribucionesRouter };
