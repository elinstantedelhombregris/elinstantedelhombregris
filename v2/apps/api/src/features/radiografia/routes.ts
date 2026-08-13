/**
 * La Radiografía — la superficie HTTP de la convergencia.
 *
 *   GET /api/v1/civic/radiografia?umbral=0.72&k=12
 *
 * Spec: `docs/specs/2026-08-12-la-radiografia.md`.
 *
 * Una sola ruta y un solo handler, porque la página es un solo estado: la
 * constelación y la lista ordenable son **el mismo dato** (R11) y partirlas en
 * dos endpoints sería estrenar dos verdades que pueden discrepar.
 *
 * Cuelga del prefijo versionado `/api/v1/civic` como todo lo cívico —el mismo
 * que ya habla la app de campo—, pero **no** entra al router del mapa: no es
 * una sexta lente de `/el-mapa`, es una página propia (spec §12).
 *
 * Es un GET público y de lectura: pasa el guardián de CSRF sin tocarlo y no
 * lleva autenticación. El espejo —«llevame a la mía»— sí va a necesitar la
 * identidad de `actores`, y es de la rebanada 5.
 */
import { getDb } from '@v2/db';
import { Router, type Router as RouterType } from 'express';

import { fuenteDeBase } from './lectura.js';
import { construirRadiografia } from './service.js';
import { consultaRadiografiaSchema } from './validation.js';

const router: RouterType = Router();

/**
 * Cinco minutos de caché compartida.
 *
 * El corpus no cambia entre corridas del job (§4.3: se corre a mano, fuera de
 * banda), así que la respuesta es estable por definición; y el espacio de URLs
 * es acotado —dos números— pero no chico, porque el umbral es un deslizador y
 * el lector lo mueve. Cinco minutos absorben el barrido del deslizador sin
 * congelar una corrida nueva más allá de lo que alguien tolera.
 */
const CACHE = 'public, max-age=300';

router.get('/', async (req, res, next) => {
  try {
    const consulta = consultaRadiografiaSchema.parse(req.query);
    const radiografia = await construirRadiografia(fuenteDeBase(getDb()), consulta);
    res.set('Cache-Control', CACHE);
    res.json({ data: radiografia });
  } catch (err) {
    next(err);
  }
});

export { router as radiografiaRouter };
