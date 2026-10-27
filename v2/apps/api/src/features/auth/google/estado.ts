/**
 * El estado del ida y vuelta con Google: lo que se guarda en cookies firmadas mientras la
 * persona está en la página de Google, PKCE, la dirección a la que se la manda y cuándo el
 * proveedor está disponible (ADR 0012).
 *
 * Las cookies son JWT firmados con `SESSION_SECRET`, cada una con su audiencia: una no se
 * puede hacer pasar por otra. Van `httpOnly`, `SameSite=Lax` (la vuelta desde Google es una
 * navegación de primer nivel, así que viajan) y con el `path` más corto que les sirve.
 */
import { createHash, randomBytes } from 'node:crypto';

import jwt from 'jsonwebtoken';

import { getConfig } from '../../../lib/config.js';

import type { Config } from '../../../lib/config.js';
import type { CookieOptions, Response } from 'express';

export const COOKIE_ESTADO = 'eihg_google';
export const COOKIE_ALTA = 'eihg_google_alta';
export const COOKIE_CONFIRMADO = 'eihg_confirmado';

const RUTA_GOOGLE = '/api/auth/google';

/** Lo que se lleva la persona a Google y tiene que volver igual. */
export interface EstadoDeIda {
  state: string;
  verifier: string;
  nonce: string;
  volver: string;
  /** `confirmar`: una cuenta con sesión vuelve a probar que es suya, para cerrar la cuenta o apagar el doble factor. */
  para: 'entrar' | 'confirmar';
  /** La cuenta que pidió confirmar, si `para` es `confirmar`. */
  uid?: number;
}

/** El alta que espera el «Último paso». */
export interface AltaEnEspera {
  sujeto: string;
  correo: string;
  volver: string;
}

const AUDIENCIAS = {
  estado: 'basta-google-estado',
  alta: 'basta-google-alta',
  confirmado: 'basta-confirmado',
} as const;

const DURACION = { estado: 10 * 60, alta: 15 * 60, confirmado: 5 * 60 } as const;

function firmar(carga: object, audiencia: string, segundos: number): string {
  return jwt.sign(carga, getConfig().auth.sessionSecret, {
    issuer: 'basta-app',
    audience: audiencia,
    expiresIn: segundos,
  });
}

function leer(valor: unknown, audiencia: string): Record<string, unknown> | null {
  if (typeof valor !== 'string' || !valor) return null;
  try {
    const v = jwt.verify(valor, getConfig().auth.sessionSecret, {
      issuer: 'basta-app',
      audience: audiencia,
    });
    return typeof v === 'string' ? null : v;
  } catch {
    return null;
  }
}

function opciones(path: string, segundos: number): CookieOptions {
  const cfg = getConfig();
  return {
    httpOnly: true,
    secure: cfg.auth.cookieSecure,
    sameSite: 'lax',
    path,
    maxAge: segundos * 1000,
    ...(cfg.auth.cookieDomain ? { domain: cfg.auth.cookieDomain } : {}),
  };
}

function borrar(res: Response, nombre: string, path: string): void {
  const { maxAge: _maxAge, ...resto } = opciones(path, 0);
  res.clearCookie(nombre, resto);
}

export function guardarEstado(res: Response, estado: EstadoDeIda): void {
  res.cookie(
    COOKIE_ESTADO,
    firmar(estado, AUDIENCIAS.estado, DURACION.estado),
    opciones(RUTA_GOOGLE, DURACION.estado),
  );
}

export function tomarEstado(res: Response, valor: unknown): EstadoDeIda | null {
  borrar(res, COOKIE_ESTADO, RUTA_GOOGLE);
  const c = leer(valor, AUDIENCIAS.estado);
  if (
    !c ||
    typeof c.state !== 'string' ||
    typeof c.verifier !== 'string' ||
    typeof c.nonce !== 'string' ||
    typeof c.volver !== 'string' ||
    (c.para !== 'entrar' && c.para !== 'confirmar')
  )
    return null;
  return {
    state: c.state,
    verifier: c.verifier,
    nonce: c.nonce,
    volver: c.volver,
    para: c.para,
    ...(typeof c.uid === 'number' ? { uid: c.uid } : {}),
  };
}

export function guardarAlta(res: Response, alta: AltaEnEspera): void {
  res.cookie(
    COOKIE_ALTA,
    firmar(alta, AUDIENCIAS.alta, DURACION.alta),
    opciones(RUTA_GOOGLE, DURACION.alta),
  );
}

export function leerAlta(valor: unknown): AltaEnEspera | null {
  const c = leer(valor, AUDIENCIAS.alta);
  if (
    !c ||
    typeof c.sujeto !== 'string' ||
    typeof c.correo !== 'string' ||
    typeof c.volver !== 'string'
  )
    return null;
  return { sujeto: c.sujeto, correo: c.correo, volver: c.volver };
}

export function borrarAlta(res: Response): void {
  borrar(res, COOKIE_ALTA, RUTA_GOOGLE);
}

/** La confirmación reciente: vale cinco minutos y sólo para la cuenta que la pidió. */
export function guardarConfirmacion(res: Response, uid: number): void {
  res.cookie(
    COOKIE_CONFIRMADO,
    firmar({ uid }, AUDIENCIAS.confirmado, DURACION.confirmado),
    opciones('/api', DURACION.confirmado),
  );
}

export function confirmoRecien(valor: unknown, uid: number): boolean {
  return leer(valor, AUDIENCIAS.confirmado)?.uid === uid;
}

export function borrarConfirmacion(res: Response): void {
  borrar(res, COOKIE_CONFIRMADO, '/api');
}

/** Un valor al azar para `state`, `nonce` o el verificador de PKCE. */
export function azar(): string {
  return randomBytes(32).toString('base64url');
}

/** El desafío de PKCE (S256) de un verificador. */
export function desafioDe(verifier: string): string {
  return createHash('sha256').update(verifier).digest('base64url');
}

/** La dirección de vuelta registrada en Google: tiene que coincidir carácter por carácter. */
export function direccionDeVuelta(cfg: Config = getConfig()): string {
  return `${cfg.web.publicUrl.replace(/\/+$/, '')}/api/auth/google/callback`;
}

/**
 * Google se ofrece sólo con client id, secreto y, en producción, una `PUBLIC_WEB_URL` con
 * https. Un despliegue a medio configurar no muestra un botón que no anda.
 */
export function googleDisponible(cfg: Config = getConfig()): boolean {
  if (!cfg.google.clientId || !cfg.google.clientSecret) return false;
  return cfg.env !== 'production' || cfg.web.publicUrl.startsWith('https://');
}

/** La página de Google a la que se manda a la persona. */
export function urlDeGoogle(estado: EstadoDeIda, cfg: Config = getConfig()): string {
  const url = new URL(cfg.google.authUrl);
  url.search = new URLSearchParams({
    client_id: cfg.google.clientId ?? '',
    redirect_uri: direccionDeVuelta(cfg),
    response_type: 'code',
    scope: 'openid email',
    state: estado.state,
    nonce: estado.nonce,
    code_challenge: desafioDe(estado.verifier),
    code_challenge_method: 'S256',
    prompt: 'select_account',
  }).toString();
  return url.toString();
}
