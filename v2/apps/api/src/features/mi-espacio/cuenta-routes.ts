import {
  ColaboracionRepository,
  CuentaCivicaRepository,
  IdentidadesRepository,
  UsersRepository,
  getDb,
} from '@v2/db';
import { cerrarCuentaSchema, preferenciasCivicasSchema } from '@v2/shared';
import { Router, type Router as RouterType } from 'express';

import { usuarioAutenticado, authenticate } from '../../middleware/auth.js';
import { HttpError } from '../../middleware/error-handler.js';
import { confirmarIdentidad } from '../auth/confirmar-identidad.js';
import { borrarConfirmacion } from '../auth/google/estado.js';
import { clearAuthCookies } from '../auth/tokens.js';

import type { IngresoDeLaCuenta } from '@v2/shared';
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
/** Cómo entra esta cuenta: si tiene contraseña y con qué proveedores (ADR 0012). */
router.get('/ingreso', async (req, res, next) => {
  try {
    const uid = usuarioAutenticado(req).id;
    const [usuario, identidades] = await Promise.all([
      new UsersRepository(getDb()).findById(uid),
      new IdentidadesRepository(getDb()).deCuenta(uid),
    ]);
    const data: IngresoDeLaCuenta = {
      tieneContrasena: usuario?.passwordHash != null,
      identidades: identidades.map((i) => ({
        proveedor: i.proveedor,
        correo: i.correo,
        creadaEn: i.creadaEn.toISOString(),
      })),
    };
    res.set('Cache-Control', 'no-store').json({ data });
  } catch (e) {
    next(e);
  }
});
router.post('/cerrar-cuenta', async (req, res, next) => {
  try {
    const v = cerrarCuentaSchema.parse(req.body);
    const usuario = await new UsersRepository(getDb()).findById(usuarioAutenticado(req).id);
    const confirmacion = usuario ? await confirmarIdentidad(req, usuario, v.password) : null;
    if (!usuario || confirmacion === 'contrasena_incorrecta')
      throw new HttpError(
        403,
        'CONTRASENA_INCORRECTA',
        'Revisá tu contraseña antes de cerrar la cuenta.',
      );
    if (confirmacion === 'falta_confirmar')
      throw new HttpError(
        403,
        'CONFIRMACION_REQUERIDA',
        'Confirmá con Google que sos vos antes de cerrar la cuenta.',
      );
    await new CuentaCivicaRepository(getDb()).cerrar(usuario.id);
    borrarConfirmacion(res);
    clearAuthCookies(res);
    res.json({ data: { cerrada: true } });
  } catch (e) {
    next(e);
  }
});
export { router as cuentaCivicaRouter };
