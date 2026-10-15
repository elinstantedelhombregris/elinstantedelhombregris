import { getDb, sql } from '@v2/db';
import { GEOGRAFIA, consultaConciliacionSchema } from '@v2/shared';
import { Router, type Router as RouterType } from 'express';

import censoJson from './censo.generated.json' with { type: 'json' };
import { compararUnidades, type UnidadOperativa } from './comparar.js';
import indice from './ign.generated.json' with { type: 'json' };

import type { NomencladorCensal, ConciliacionTerritorial } from '@v2/shared';

const censo: NomencladorCensal = censoJson;
const router: RouterType = Router();
router.get('/', async (req, res, next) => {
  try {
    const q = consultaConciliacionSchema.parse(req.query);
    if (indice.version !== GEOGRAFIA.version)
      throw new Error('El índice territorial requiere regeneración.');
    const r = await getDb().execute<UnidadOperativa & Record<string, unknown>>(
      sql`select id,georef_id as codigo,name as nombre,vigente_hasta is null as vigente from geographic_locations where level=${q.nivel} and ${q.provincia ? sql`left(georef_id,2)=${q.provincia}` : sql`true`} order by georef_id`,
    );
    const unidades = censo.unidades.filter(
      (u) => u.nivel === q.nivel && (!q.provincia || u.provincia === q.provincia),
    );
    const geo = indice.unidades.filter(
      (u) => u.nivel === q.nivel && (!q.provincia || u.codigo?.startsWith(q.provincia)),
    );
    const filas = compararUnidades(unidades, geo, r.rows, q.nivel);
    const conDiferencias = filas.filter((f) => f.incidencias.length > 0);
    const filtradas = q.diferencias === 'si' ? conDiferencias : filas;
    const data: ConciliacionTerritorial = {
      fecha: new Date().toISOString(),
      versionCenso: censo.version,
      versionGeo: indice.version,
      fuentes: censo.fuentes,
      total: filas.length,
      conDiferencias: conDiferencias.length,
      sinCodigoSinAsignar: indice.unidades.filter((u) => u.nivel === q.nivel && u.codigo === null)
        .length,
      filtradas: filtradas.length,
      filas: filtradas.slice(q.pagina * 50, (q.pagina + 1) * 50),
      siguiente: (q.pagina + 1) * 50 < filtradas.length ? q.pagina + 1 : null,
      consulta: q,
    };
    res.set('Cache-Control', 'no-store').json({ data });
  } catch (e) {
    next(e);
  }
});
export { router as conciliacionRouter };
