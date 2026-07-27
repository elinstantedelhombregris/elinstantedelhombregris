/**
 * El mapa cívico — la superficie HTTP del instrumento territorial.
 *
 *   GET /api/v1/civic/map/signals   — las cuatro capas con una sola forma
 *   GET /api/v1/civic/map/layers    — conteo por capa, para las fichas
 *
 * El prefijo va VERSIONADO. La app de campo (`juego/src/civic/community-api.ts`)
 * ya habla `/api/v1/civic/*`, y el blueprint pide una API cívica versionada
 * como único puente entre las dos aplicaciones. Todo lo cívico cuelga de acá.
 *
 * El panel de conversión de `/el-mapa` NO usa esto: sigue con `/api/open-data/*`,
 * porque el instrumento no se paga en el camino crítico de los 30 segundos.
 */
import { CivicMapRepository, getDb } from '@v2/db';
import { Router, type Router as RouterType } from 'express';

import { anonSubmitRateLimit } from '../../middleware/rate-limit.js';

import { ingerirCaptura } from './capturas.js';
import { capturaSchema, consultaSenalesSchema } from './validation.js';

import type { ConsultaSenales } from '@v2/db';


const router: RouterType = Router();

router.get('/map/signals', async (req, res, next) => {
  try {
    const query = consultaSenalesSchema.parse(req.query);
    const repo = new CivicMapRepository(getDb());

    const consulta: ConsultaSenales = {};
    if (query.capas.length > 0) consulta.capas = query.capas;
    if (query.bbox) consulta.bbox = query.bbox;
    if (query.desde) consulta.desde = query.desde;
    if (query.hasta) consulta.hasta = query.hasta;
    if (query.limite !== undefined) consulta.limitePorCapa = query.limite;

    const signals = await repo.listSignals(consulta);
    res.json({ data: { signals } });
  } catch (err) {
    next(err);
  }
});

router.get('/map/layers', async (_req, res, next) => {
  try {
    const repo = new CivicMapRepository(getDb());
    res.json({ data: { layers: await repo.countByLayer() } });
  } catch (err) {
    next(err);
  }
});

/**
 * La ingesta de campo. Va detrás del mismo límite de tasa que el resto de lo
 * anónimo: sin eso es una vía de spam sin cuenta.
 *
 * La autenticación por dispositivo que `juego/src/civic/device-auth.ts` ya
 * emite del lado del móvil NO está implementada acá todavía — es parte del
 * contrato de sync completo, que es del blueprint y no de esta spec (§2). Hasta
 * entonces esta ruta acepta lo mismo que acepta la carga anónima de la web, y
 * eso está declarado en la spec, no escondido.
 */
router.post('/capturas', anonSubmitRateLimit(), async (req, res, next) => {
  try {
    const entrada = capturaSchema.parse(req.body);
    const recibo = await ingerirCaptura(entrada);
    res.status(recibo.yaExistia ? 200 : 201).json({ data: { recibo } });
  } catch (err) {
    next(err);
  }
});

export { router as civicRouter };
