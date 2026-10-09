import { ColaboracionRepository, CuentaCivicaRepository, UsersRepository, getDb } from '@v2/db';
import { cerrarCuentaSchema, preferenciasCivicasSchema } from '@v2/shared';
import { Router, type Router as RouterType } from 'express';

import { usuarioAutenticado, authenticate } from '../../middleware/auth.js';
import { HttpError } from '../../middleware/error-handler.js';
import { verifyPassword } from '../auth/password.js';
import { clearAuthCookies } from '../auth/tokens.js';
const router: RouterType = Router();
router.use(authenticate);
router.get('/preferencias', async (req, res, next) => {
  try {
    res.set('Cache-Control', 'no-store').json({
      data: await new ColaboracionRepository(getDb()).preferencias(usuarioAutenticado(req).id),
    });
  } catch (e) {
    next(e);
  }
});
router.put('/preferencias', async (req, res, next) => {
  try {
    const v = preferenciasCivicasSchema.parse(req.body);
    await new ColaboracionRepository(getDb()).preferir(usuarioAutenticado(req).id, v.avisos);
    res.json({ data: v });
  } catch (e) {
    next(e);
  }
});
router.post('/cerrar-cuenta', async (req, res, next) => {
  try {
    const v = cerrarCuentaSchema.parse(req.body);
    const usuario = await new UsersRepository(getDb()).findById(usuarioAutenticado(req).id);
    if (!usuario || !(await verifyPassword(v.password, usuario.passwordHash)))
      throw new HttpError(
        403,
        'CONTRASENA_INCORRECTA',
        'Revisá tu contraseña antes de cerrar la cuenta.',
      );
    await new CuentaCivicaRepository(getDb()).cerrar(usuario.id);
    clearAuthCookies(res);
    res.json({ data: { cerrada: true } });
  } catch (e) {
    next(e);
  }
});
export { router as cuentaCivicaRouter };
