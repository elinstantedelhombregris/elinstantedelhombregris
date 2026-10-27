/**
 * Verificar el `id_token` de Google sin bibliotecas de OAuth (ADR 0012): la firma con
 * `jsonwebtoken`, las claves públicas con `node:crypto`.
 *
 * Lo que se comprueba, y en este orden: que sea RS256 con una clave publicada por Google, el
 * emisor, la audiencia (nuestro client id), el vencimiento con un minuto de tolerancia, el
 * `nonce` que mandamos y que Google dé el correo por verificado.
 */
import { createPublicKey } from 'node:crypto';

import jwt from 'jsonwebtoken';

import type { JsonWebKey, KeyObject } from 'node:crypto';

export const EMISORES_DE_GOOGLE = ['https://accounts.google.com', 'accounts.google.com'] as const;

export type MotivoDeRechazo =
  | 'claves'
  | 'firma'
  | 'emisor'
  | 'audiencia'
  | 'vencido'
  | 'nonce'
  | 'incompleto'
  | 'sin_verificar';

export class TokenRechazado extends Error {
  constructor(readonly motivo: MotivoDeRechazo) {
    super(`id_token rechazado: ${motivo}`);
    this.name = 'TokenRechazado';
  }
}

export interface IdentidadVerificada {
  sujeto: string;
  correo: string;
}

export interface FuenteDeClaves {
  clave(kid: string): Promise<KeyObject | null>;
}

const UNA_HORA = 60 * 60 * 1000;
const REINTENTO_MINIMO = 60 * 1000;

/**
 * Las claves de Google en memoria, mientras dure su `Cache-Control`. Un `kid` desconocido
 * puede ser una rotación: se vuelven a pedir, como mucho una vez por minuto.
 */
export function clavesDesdeUrl(
  url: string,
  pedir: typeof fetch = fetch,
  ahora: () => number = Date.now,
): FuenteDeClaves {
  let claves = new Map<string, KeyObject>();
  let vence = 0;
  let ultimoPedido = -Infinity;

  async function refrescar(): Promise<void> {
    ultimoPedido = ahora();
    const r = await pedir(url);
    if (!r.ok) throw new TokenRechazado('claves');
    const cuerpo = (await r.json()) as { keys?: (JsonWebKey & { kid?: string })[] };
    const nuevas = new Map<string, KeyObject>();
    for (const k of cuerpo.keys ?? []) {
      if (k.kty !== 'RSA' || !k.kid) continue;
      nuevas.set(k.kid, createPublicKey({ key: k, format: 'jwk' }));
    }
    claves = nuevas;
    const maxAge = /max-age=(\d+)/.exec(r.headers.get('cache-control') ?? '')?.[1];
    vence = ahora() + (maxAge ? Number(maxAge) * 1000 : UNA_HORA);
  }

  return {
    async clave(kid) {
      if (ahora() >= vence) await refrescar();
      else if (!claves.has(kid) && ahora() - ultimoPedido >= REINTENTO_MINIMO) await refrescar();
      return claves.get(kid) ?? null;
    },
  };
}

export async function verificarIdToken(
  token: string,
  opciones: {
    clientId: string;
    nonce: string;
    claves: FuenteDeClaves;
    /** Segundos desde 1970; sólo para las pruebas. */
    ahoraEnSegundos?: number;
  },
): Promise<IdentidadVerificada> {
  const decodificado = jwt.decode(token, { complete: true });
  if (!decodificado || typeof decodificado.payload === 'string')
    throw new TokenRechazado('incompleto');
  const { kid, alg } = decodificado.header;
  if (alg !== 'RS256' || !kid) throw new TokenRechazado('firma');
  const clave = await opciones.claves.clave(kid);
  if (!clave) throw new TokenRechazado('firma');

  let carga: jwt.JwtPayload;
  try {
    const v = jwt.verify(token, clave, {
      algorithms: ['RS256'],
      audience: opciones.clientId,
      issuer: [...EMISORES_DE_GOOGLE],
      clockTolerance: 60,
      ...(opciones.ahoraEnSegundos === undefined
        ? {}
        : { clockTimestamp: opciones.ahoraEnSegundos }),
    });
    if (typeof v === 'string') throw new TokenRechazado('incompleto');
    carga = v;
  } catch (e) {
    if (e instanceof TokenRechazado) throw e;
    if (e instanceof jwt.TokenExpiredError) throw new TokenRechazado('vencido');
    if (e instanceof jwt.JsonWebTokenError) {
      if (e.message.includes('audience')) throw new TokenRechazado('audiencia');
      if (e.message.includes('issuer')) throw new TokenRechazado('emisor');
      throw new TokenRechazado('firma');
    }
    throw e;
  }

  if (carga.nonce !== opciones.nonce) throw new TokenRechazado('nonce');
  const correo: unknown = carga.email;
  if (typeof carga.sub !== 'string' || !carga.sub || typeof correo !== 'string' || !correo)
    throw new TokenRechazado('incompleto');
  const verificado: unknown = carga.email_verified;
  if (verificado !== true && verificado !== 'true') throw new TokenRechazado('sin_verificar');
  return { sujeto: carga.sub, correo: correo.trim().toLowerCase() };
}
