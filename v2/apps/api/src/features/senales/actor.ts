/**
 * El actor de la web — la cookie que permite contar personas y no clicks.
 *
 * Spec: `docs/specs/2026-08-11-b-la-senal.md` §2.10.
 *
 * ## Cómo funciona, en una línea
 *
 * El navegador guarda una **clave al azar**. El servidor guarda sólo su
 * `HMAC(pepper, clave)`. Dos señales de la misma persona llegan con la misma
 * clave y caen en el mismo actor; el servidor nunca puede reconstruir la clave
 * ni derivarla de nada del dispositivo.
 *
 * ## Por qué no hay un endpoint aparte para «crear actor»
 *
 * La spec lo describe como `POST /api/v1/civic/actor`, y se resolvió distinto a
 * propósito: **el actor se resuelve o se crea en la misma request que carga la
 * señal**. Un endpoint previo agrega un round-trip al camino crítico de los 30
 * segundos, y sobre todo agrega un modo de falla —la señal llega, el actor no—
 * que deja filas huérfanas sin que nadie lo note. Acá el actor y la señal se
 * escriben en la misma llamada o no se escribe ninguno.
 *
 * La línea de consentimiento que esto exige **ya está en pantalla**, pegada al
 * botón de enviar: «Para contar personas y no clicks, guardamos un
 * identificador al azar en este navegador…». No hay un permiso que pedir aparte
 * porque el permiso ya se pide donde se usa.
 *
 * ## Por qué el pepper se deriva y no es una variable nueva
 *
 * `HMAC(SESSION_SECRET, 'basta/actor-pepper/v1')`. Un `ACTOR_PEPPER` propio
 * sería más ortodoxo y bloquearía el despliegue hasta que alguien lo cargue en
 * Vercel — y un sistema que no puede contar personas hasta que aparezca una
 * variable de entorno se queda sin contarlas. La derivación da una clave
 * distinta de la de sesión (no se puede ir de una a la otra) y el `v1` del
 * mensaje es la manija para rotar: subir a `v2` invalida todos los hashes y
 * `pepper_version` en la tabla dice cuál se usó.
 */
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

import { ActoresRepository, getDb } from '@v2/db';

import { getConfig } from '../../lib/config.js';

import type { Request, Response } from 'express';

/** La cookie que ve el navegador. `httpOnly`: JavaScript de la página no la lee. */
export const COOKIE_ACTOR = 'basta_actor';

/** Un año, que es lo que dice la línea de consentimiento en pantalla. */
const UN_ANIO_SEG = 60 * 60 * 24 * 365;

/** La versión del pepper. Subirla invalida todos los hashes a propósito. */
export const PEPPER_VERSION = 1;

const MENSAJE_PEPPER = `basta/actor-pepper/v${String(PEPPER_VERSION)}`;

function pepper(): Buffer {
  return createHmac('sha256', getConfig().auth.sessionSecret).update(MENSAJE_PEPPER).digest();
}

/** El hash que se guarda. La clave cruda nunca toca la base. */
export function hashDeClave(clave: string): Buffer {
  return createHmac('sha256', pepper()).update(clave, 'utf8').digest();
}

/** 32 bytes de aleatoriedad real, en base64url. No deriva de nada del dispositivo. */
function nuevaClave(): string {
  return randomBytes(32).toString('base64url');
}

/**
 * Una clave sólo es válida si tiene la forma que este servidor emite.
 *
 * Sin esto, un cliente puede mandar `actor=a` y crear un actor por cada letra
 * del alfabeto: el hash de cualquier string es un hash válido, así que la
 * validación tiene que estar del lado de la forma. No es seguridad fuerte —la
 * clave no es un secreto compartido, es un identificador— pero corta el abuso
 * trivial.
 */
const FORMA_DE_CLAVE = /^[A-Za-z0-9_-]{43}$/;

/**
 * Leer una cookie sin pasar por `any`.
 *
 * `cookie-parser` tipa `req.cookies` como `any`, así que el acceso directo
 * contamina todo lo que toca y el linter lo caza con razón: un `any` que viene
 * de la request es exactamente el que hay que validar. Acá se estrecha una vez,
 * con `unknown` de por medio y un chequeo de tipo real.
 */
function leerCookie(req: Request, nombre: string): string | undefined {
  const bolsa: unknown = (req as { cookies?: unknown }).cookies;
  if (typeof bolsa !== 'object' || bolsa === null) return undefined;
  const valor: unknown = (bolsa as Record<string, unknown>)[nombre];
  return typeof valor === 'string' ? valor : undefined;
}

export interface ActorDeLaRequest {
  readonly actorId: number | null;
  /** La clave a setear en la respuesta, cuando hubo que emitir una nueva. */
  readonly claveNueva: string | null;
}

/**
 * Resolver el actor de una request, creándolo si hace falta.
 *
 * Devuelve `actorId: null` **sin tirar** cuando algo sale mal. Es deliberado:
 * la señal tiene que poder escribirse igual. Un navegador que rechaza cookies,
 * una base que no contesta, un pepper rotado — ninguna de esas cosas puede
 * costarle a alguien la voz que acaba de escribir. Se pierde el conteo de
 * personas para esa fila, se cuenta en `senalesSinActor`, y se sigue.
 */
export async function resolverActor(req: Request): Promise<ActorDeLaRequest> {
  const previa = leerCookie(req, COOKIE_ACTOR);

  const clave = previa !== undefined && FORMA_DE_CLAVE.test(previa) ? previa : nuevaClave();
  const esNueva = clave !== previa;

  try {
    const actor = await new ActoresRepository(getDb()).resolverOCrear(hashDeClave(clave), 'web');
    return { actorId: actor.id, claveNueva: esNueva ? clave : null };
  } catch {
    return { actorId: null, claveNueva: null };
  }
}

/** Poner la cookie, cuando hubo clave nueva. Un año, `httpOnly`, `sameSite: lax`. */
export function ponerCookieDeActor(res: Response, clave: string | null): void {
  if (clave === null) return;
  const cfg = getConfig();
  res.cookie(COOKIE_ACTOR, clave, {
    httpOnly: true,
    secure: cfg.auth.cookieSecure,
    sameSite: 'lax',
    path: '/',
    maxAge: UN_ANIO_SEG * 1000,
    ...(cfg.auth.cookieDomain ? { domain: cfg.auth.cookieDomain } : {}),
  });
}

/**
 * Olvidar el actor: borra el hash de la base y la cookie del navegador.
 *
 * Las dos cosas, y en ese orden. Borrar sólo la cookie dejaría la fila viva
 * esperando a que la misma clave vuelva; borrar sólo la fila dejaría al
 * navegador reclamando una identidad que ya no existe y creándola de nuevo en
 * el próximo envío.
 */
export async function olvidarActor(req: Request, res: Response): Promise<boolean> {
  const clave = leerCookie(req, COOKIE_ACTOR);
  let borrado = false;
  if (clave !== undefined && FORMA_DE_CLAVE.test(clave)) {
    borrado = await new ActoresRepository(getDb()).retirar(hashDeClave(clave));
  }
  res.clearCookie(COOKIE_ACTOR, { path: '/' });
  return borrado;
}

/** Comparación en tiempo constante, para los tests de la forma del hash. */
export function mismoHash(a: Buffer, b: Buffer): boolean {
  return a.length === b.length && timingSafeEqual(a, b);
}
