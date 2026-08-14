/**
 * La superficie HTTP de una señal.
 *
 *   POST /api/v1/civic/senales   — el contrato único de ingesta (spec B §4.7)
 *   GET  /api/v1/civic/senales   — la lectura pública, con filtro por clase
 *
 * `origen` sale de la ruta y no del cuerpo. Esta ruta es la de la web, así que
 * escribe `'web'`; la de campo va a colgar de su propio montaje con su propia
 * credencial. Si el cliente pudiera declararlo, un script se diría `campo` y
 * lavaría spam de web como si fuera terreno recorrido.
 */
import { SenalesRepository, getDb } from '@v2/db';
import { senalSchema } from '@v2/shared';
import { Router, type Router as RouterType } from 'express';

import { anonSubmitRateLimit } from '../../middleware/rate-limit.js';

import { ingerirSenal } from './service.js';
import { consultaDeSenalesSchema } from './validation.js';

const router: RouterType = Router();

/**
 * La ingesta.
 *
 * Contesta **201 también al reintento**, con el mismo cuerpo. Un outbox que
 * reintenta hasta ver un 2xx, contra un servidor que le contesta 409 cuando la
 * señal ya estaba, reintenta para siempre — y el `yaExistia` del recibo es lo
 * que le permite al cliente distinguir sin necesidad de un código distinto.
 */
router.post('/senales', anonSubmitRateLimit(), async (req, res, next) => {
  try {
    const cuerpo = senalSchema.parse(req.body);
    const recibo = await ingerirSenal(cuerpo, { origen: 'web' });
    res.status(201).json({ data: recibo });
  } catch (err) {
    next(err);
  }
});

router.get('/senales', async (req, res, next) => {
  try {
    const q = consultaDeSenalesSchema.parse(req.query);
    const repo = new SenalesRepository(getDb());
    const senales = await repo.listar({
      ...(q.clases.length > 0 ? { clases: q.clases } : {}),
      ...(q.tipos.length > 0 ? { tipos: q.tipos } : {}),
      ...(q.provinceId === undefined ? {} : { provinceId: q.provinceId }),
      ...(q.soloConPunto ? { soloConPunto: true } : {}),
      limite: q.limite,
    });
    res.json({ data: { senales } });
  } catch (err) {
    next(err);
  }
});

/** El conteo por clase, para el contador de la portada y la composición. */
router.get('/senales/conteo', async (_req, res, next) => {
  try {
    const repo = new SenalesRepository(getDb());
    const [porClase, total] = await Promise.all([repo.contarPorClase(), repo.total()]);
    res.json({ data: { porClase, total } });
  } catch (err) {
    next(err);
  }
});

router.get('/senales/:idPublico', async (req, res, next) => {
  try {
    const senal = await new SenalesRepository(getDb()).porIdPublico(req.params.idPublico);
    if (senal === null) {
      res.status(404).json({
        error: { code: 'NO_ESTA', message: 'No encontramos esa señal.' },
      });
      return;
    }
    res.json({ data: { senal } });
  } catch (err) {
    next(err);
  }
});

export { router as senalesRouter };
