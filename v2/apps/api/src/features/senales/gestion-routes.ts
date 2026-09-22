import { GestionSenalesRepository, getDb } from '@v2/db';
import { Router, type Router as RouterType } from 'express';
import { z } from 'zod';

import { HttpError } from '../../middleware/error-handler.js';

import { actorSiExiste } from './actor.js';

const router: RouterType = Router();
/** La cookie de actor conserva autoría sin enlazarla a una cuenta. */
router.delete('/senales/:idPublico', async (req, res, next) => {
  try {
    const id = z.string().uuid().parse(req.params.idPublico);
    const actorId = await actorSiExiste(req);
    if (
      actorId === null ||
      !(await new GestionSenalesRepository(getDb()).retirarPropia(id, actorId))
    ) {
      throw new HttpError(
        403,
        'AUTORIA_NO_DISPONIBLE',
        'Para retirar este aporte necesitás el navegador con el que lo publicaste y su identificador de autoría.',
      );
    }
    res.setHeader('Cache-Control', 'no-store');
    res.json({ data: { retirada: true } });
  } catch (err) {
    next(err);
  }
});
export { router as gestionSenalesRouter };
