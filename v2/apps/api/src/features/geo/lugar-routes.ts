import { getDb, geographicLocations, eq } from '@v2/db';
import { Router, type Router as RouterType } from 'express';
import { z } from 'zod';

import { HttpError } from '../../middleware/error-handler.js';

const router: RouterType = Router();
router.get('/lugares/:id', async (req, res, next) => {
  try {
    const id = z.coerce.number().int().positive().parse(req.params.id);
    const db = getDb();
    const [lugar] = await db
      .select({
        id: geographicLocations.id,
        name: geographicLocations.name,
        level: geographicLocations.level,
        provinceId: geographicLocations.provinceId,
        latitude: geographicLocations.latitude,
        longitude: geographicLocations.longitude,
      })
      .from(geographicLocations)
      .where(eq(geographicLocations.id, id));
    if (!lugar)
      throw new HttpError(404, 'LUGAR_NO_ENCONTRADO', 'No encontramos ese ámbito territorial.');
    res.json({ data: lugar });
  } catch (e) {
    next(e);
  }
});
export { router as lugarRouter };
