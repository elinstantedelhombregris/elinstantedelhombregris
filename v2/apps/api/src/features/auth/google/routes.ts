/**
 * Entrar y crear la cuenta con Google (ADR 0012, spec 2026-10-27-ingreso-con-google.md).
 *
 *   GET  /api/auth/proveedores      — qué proveedores ofrece este despliegue
 *   GET  /api/auth/google           — la ida: arma el estado y manda a Google
 *   GET  /api/auth/google/callback  — la vuelta: verifica, decide y entra (o pide el «Último paso»)
 *   GET  /api/auth/google/alta      — el correo y una sugerencia de usuario para el «Último paso»
 *   POST /api/auth/google/alta      — crea la cuenta y entra
 *
 * La vuelta siempre termina en una redirección a una página del sitio: un error viaja como
 * `?error=<código>` y la web pone el texto. Ni el correo ni el `sub` van a los registros.
 */
import { AuthRepository, getDb, IdentidadesRepository, UsersRepository } from '@v2/db';
import { altaConProveedorSchema, rutaDeVuelta } from '@v2/shared';
import { Router, type Request, type Response, type Router as RouterType } from 'express';

import { getConfig } from '../../../lib/config.js';
import { logger } from '../../../lib/logger.js';
import { optionalAuthenticate } from '../../../middleware/auth.js';
import { HttpError } from '../../../middleware/error-handler.js';
import { ingresoExternoRateLimit } from '../../../middleware/rate-limit.js';
import { AuthService } from '../service.js';
import { setAuthCookies } from '../tokens.js';
import { signTwoFaTicket } from '../two-factor-routes.js';

import { decidirEntrada } from './decidir.js';
import {
  COOKIE_ALTA,
  COOKIE_ESTADO,
  azar,
  borrarAlta,
  direccionDeVuelta,
  googleDisponible,
  guardarAlta,
  guardarConfirmacion,
  guardarEstado,
  leerAlta,
  tomarEstado,
  urlDeGoogle,
} from './estado.js';
import { candidatosDeUsuario, sugerirUsuario } from './usuario-sugerido.js';
import { TokenRechazado, clavesDesdeUrl, verificarIdToken } from './verificar-id-token.js';

import type { FuenteDeClaves } from './verificar-id-token.js';
import type { ErrorDeIngresoExterno, ProveedoresDeIngreso, AltaPendiente } from '@v2/shared';

const router: RouterType = Router();

/** Una fuente de claves por dirección: las pruebas cambian la dirección entre corridas. */
const fuentes = new Map<string, FuenteDeClaves>();
function claves(url: string): FuenteDeClaves {
  let f = fuentes.get(url);
  if (!f) {
    f = clavesDesdeUrl(url);
    fuentes.set(url, f);
  }
  return f;
}

function servicio(): AuthService {
  const db = getDb();
  return new AuthService(new UsersRepository(db), new AuthRepository(db));
}

function huella(req: Request) {
  return { userAgent: req.header('user-agent'), ipAddress: req.ip };
}

function cookies(req: Request): Record<string, unknown> {
  return req.cookies as Record<string, unknown>;
}

function irA(res: Response, ruta: string): void {
  res.set('Cache-Control', 'no-store').redirect(302, ruta);
}

function conParametro(ruta: string, clave: string, valor: string): string {
  const url = new URL(ruta, 'https://basta.invalid');
  url.searchParams.set(clave, valor);
  return `${url.pathname}${url.search}${url.hash}`;
}

/** Volver a ingresar con el motivo, conservando adónde quería ir. */
function errorDeIngreso(res: Response, error: ErrorDeIngresoExterno, volver = '/mi-espacio'): void {
  irA(res, `/ingresar?${new URLSearchParams({ error, volver }).toString()}`);
}

let avisoDado = false;
function avisarSiFaltaConfiguracion(): void {
  const cfg = getConfig();
  if (avisoDado || cfg.env !== 'production' || googleDisponible(cfg)) return;
  if (!cfg.google.clientId && !cfg.google.clientSecret) return;
  avisoDado = true;
  logger.warn(
    'Google está a medio configurar (falta el client id, el secreto o una PUBLIC_WEB_URL con https): no se ofrece.',
  );
}

router.get('/proveedores', (_req, res) => {
  avisarSiFaltaConfiguracion();
  const data: ProveedoresDeIngreso = { google: googleDisponible() };
  res.set('Cache-Control', 'no-store').json({ data });
});

/** La ida. Con `?para=confirmar`, una cuenta con sesión vuelve a probar que es suya. */
router.get('/google', ingresoExternoRateLimit(), optionalAuthenticate, (req, res) => {
  const volver = rutaDeVuelta(typeof req.query.volver === 'string' ? req.query.volver : null);
  if (!googleDisponible()) {
    errorDeIngreso(res, 'google_no_disponible', volver);
    return;
  }
  const confirmar = req.query.para === 'confirmar';
  if (confirmar && !req.user) {
    irA(res, `/ingresar?${new URLSearchParams({ volver }).toString()}`);
    return;
  }
  const estado = {
    state: azar(),
    verifier: azar(),
    nonce: azar(),
    volver,
    para: confirmar ? ('confirmar' as const) : ('entrar' as const),
    ...(confirmar && req.user ? { uid: req.user.id } : {}),
  };
  guardarEstado(res, estado);
  irA(res, urlDeGoogle(estado));
});

/** Cambia el código por el `id_token` en el endpoint de tokens de Google. */
async function cambiarCodigo(codigo: string, verifier: string): Promise<string> {
  const cfg = getConfig();
  const r = await fetch(cfg.google.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code: codigo,
      client_id: cfg.google.clientId ?? '',
      client_secret: cfg.google.clientSecret ?? '',
      redirect_uri: direccionDeVuelta(cfg),
      grant_type: 'authorization_code',
      code_verifier: verifier,
    }),
  });
  if (!r.ok) throw new Error(`Google respondió ${String(r.status)} al cambiar el código.`);
  const cuerpo = (await r.json()) as { id_token?: unknown };
  if (typeof cuerpo.id_token !== 'string') throw new Error('Google no mandó el id_token.');
  return cuerpo.id_token;
}

/** Entra: pasa por el doble factor si la cuenta lo tiene, o emite la sesión. */
async function entrar(req: Request, res: Response, userId: number, volver: string): Promise<void> {
  const doble = await new AuthRepository(getDb()).findTwoFactorSecret(userId);
  if (doble?.enabled) {
    irA(
      res,
      `/2fa-desafio?${new URLSearchParams({ ticket: signTwoFaTicket(userId), volver }).toString()}`,
    );
    return;
  }
  const resultado = await servicio().loginAlreadyVerified(userId, huella(req));
  setAuthCookies(res, resultado.accessToken, resultado.refreshToken, resultado.csrfToken);
  irA(res, volver);
}

router.get('/google/callback', ingresoExternoRateLimit(), async (req, res, next) => {
  const estado = tomarEstado(res, cookies(req)[COOKIE_ESTADO]);
  const volver = estado?.volver ?? '/mi-espacio';
  const fallo = (error: ErrorDeIngresoExterno) => {
    if (estado?.para === 'confirmar') irA(res, conParametro(volver, 'error', error));
    else errorDeIngreso(res, error, volver);
  };
  try {
    if (typeof req.query.error === 'string') {
      fallo(req.query.error === 'access_denied' ? 'google_cancelado' : 'google_fallo');
      return;
    }
    const codigo = req.query.code;
    if (!estado || typeof codigo !== 'string' || req.query.state !== estado.state) {
      fallo('google_vencido');
      return;
    }
    if (!googleDisponible()) {
      fallo('google_no_disponible');
      return;
    }

    let identidad;
    try {
      const cfg = getConfig();
      identidad = await verificarIdToken(await cambiarCodigo(codigo, estado.verifier), {
        clientId: cfg.google.clientId ?? '',
        nonce: estado.nonce,
        claves: claves(cfg.google.jwksUrl),
      });
    } catch (e) {
      const motivo = e instanceof TokenRechazado ? e.motivo : 'intercambio';
      logger.warn({ motivo }, 'Ingreso con Google rechazado');
      fallo(motivo === 'sin_verificar' ? 'google_sin_verificar' : 'google_fallo');
      return;
    }

    const repo = new IdentidadesRepository(getDb());
    const datos = { proveedor: 'google' as const, ...identidad };

    if (estado.para === 'confirmar') {
      if (estado.uid === undefined || !(await repo.esDe(estado.uid, 'google', identidad.sujeto))) {
        fallo('google_otra_cuenta');
        return;
      }
      guardarConfirmacion(res, estado.uid);
      irA(res, conParametro(volver, 'confirmado', 'google'));
      return;
    }

    const conIdentidad = await repo.porSujeto('google', identidad.sujeto);
    const porCorreo = conIdentidad ? null : await repo.cuentaPorCorreo(identidad.correo);
    const decision = decidirEntrada(conIdentidad, porCorreo);
    switch (decision.tipo) {
      case 'rechazar':
        fallo(decision.error);
        return;
      case 'alta':
        guardarAlta(res, { sujeto: identidad.sujeto, correo: identidad.correo, volver });
        irA(res, `/registrarse/google?${new URLSearchParams({ volver }).toString()}`);
        return;
      case 'entrar':
        await repo.marcarUso(decision.identidadId);
        await entrar(req, res, decision.userId, volver);
        return;
      case 'vincular':
      case 'limpiar-y-vincular': {
        const ok =
          decision.tipo === 'vincular'
            ? await repo.vincular(decision.userId, datos)
            : await repo.limpiarYVincular(decision.userId, datos);
        if (!ok) {
          fallo('google_fallo');
          return;
        }
        await entrar(req, res, decision.userId, volver);
        return;
      }
    }
  } catch (e) {
    next(e);
  }
});

router.get('/google/alta', ingresoExternoRateLimit(), async (req, res, next) => {
  try {
    const alta = leerAlta(cookies(req)[COOKIE_ALTA]);
    if (!alta)
      throw new HttpError(
        401,
        'ALTA_VENCIDA',
        'Pasó demasiado tiempo desde que volviste de Google. Entrá de nuevo con Google.',
      );
    const candidatos = candidatosDeUsuario(alta.correo);
    const tomados = await new IdentidadesRepository(getDb()).usuariosTomados(candidatos);
    const data: AltaPendiente = {
      correo: alta.correo,
      sugerencia: sugerirUsuario(candidatos, tomados),
    };
    res.set('Cache-Control', 'no-store').json({ data });
  } catch (e) {
    next(e);
  }
});

router.post('/google/alta', ingresoExternoRateLimit(), async (req, res, next) => {
  try {
    const alta = leerAlta(cookies(req)[COOKIE_ALTA]);
    if (!alta)
      throw new HttpError(
        401,
        'ALTA_VENCIDA',
        'Pasó demasiado tiempo desde que volviste de Google. Entrá de nuevo con Google.',
      );
    const v = altaConProveedorSchema.parse(req.body);
    const repo = new IdentidadesRepository(getDb());
    const datos = { proveedor: 'google' as const, sujeto: alta.sujeto, correo: alta.correo };
    const creada = await repo.alta({ username: v.username, name: v.name }, datos);
    if (!creada.ok) {
      if (creada.choque === 'usuario')
        throw new HttpError(409, 'USERNAME_TAKEN', 'Ese nombre de usuario ya está en uso.');
      throw new HttpError(
        409,
        creada.choque === 'correo' ? 'EMAIL_TAKEN' : 'YA_VINCULADA',
        'Ya hay una cuenta con este Google o este correo. Entrá de nuevo con Google para usarla.',
      );
    }
    borrarAlta(res);
    const resultado = await servicio().loginAlreadyVerified(creada.userId, huella(req));
    setAuthCookies(res, resultado.accessToken, resultado.refreshToken, resultado.csrfToken);
    res.status(201).json({
      data: {
        user: resultado.user,
        csrfToken: resultado.csrfToken,
        volver: rutaDeVuelta(alta.volver),
      },
    });
  } catch (e) {
    next(e);
  }
});

export { router as googleRouter };
