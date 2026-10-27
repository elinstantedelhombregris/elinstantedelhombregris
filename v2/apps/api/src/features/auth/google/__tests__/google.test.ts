import { generateKeyPairSync } from 'node:crypto';

import jwt from 'jsonwebtoken';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { resetConfig } from '../../../../lib/config';
import { decidirEntrada } from '../decidir';
import {
  confirmoRecien,
  desafioDe,
  direccionDeVuelta,
  googleDisponible,
  guardarConfirmacion,
  guardarEstado,
  tomarEstado,
  urlDeGoogle,
} from '../estado';
import { candidatosDeUsuario, sugerirUsuario } from '../usuario-sugerido';
import { TokenRechazado, clavesDesdeUrl, verificarIdToken } from '../verificar-id-token';

import type { Response } from 'express';

const par = () => generateKeyPairSync('rsa', { modulusLength: 2048 });
const propia = par();
const ajena = par();
const jwk = { ...propia.publicKey.export({ format: 'jwk' }), kid: 'k1', alg: 'RS256', use: 'sig' };

function servirClaves(maxAge = 600) {
  return vi.fn(() =>
    Promise.resolve(
      new Response(JSON.stringify({ keys: [jwk] }), {
        headers: { 'cache-control': `public, max-age=${String(maxAge)}` },
      }),
    ),
  );
}

const AHORA = 1_800_000_000;
function token(
  carga: Record<string, unknown> = {},
  opciones: jwt.SignOptions = {},
  clave = propia.privateKey,
): string {
  return jwt.sign(
    { email: 'Ana@Example.com', email_verified: true, nonce: 'n1', iat: AHORA, ...carga },
    clave,
    {
      algorithm: 'RS256',
      keyid: 'k1',
      issuer: 'https://accounts.google.com',
      audience: 'cliente',
      subject: '1234567890',
      expiresIn: 600,
      ...opciones,
    },
  );
}

async function motivo(t: string, nonce = 'n1'): Promise<string> {
  try {
    await verificarIdToken(t, {
      clientId: 'cliente',
      nonce,
      claves: clavesDesdeUrl('https://claves.test', servirClaves()),
      ahoraEnSegundos: AHORA + 10,
    });
    return 'aceptado';
  } catch (e) {
    return e instanceof TokenRechazado ? e.motivo : 'otro';
  }
}

describe('verificar el id_token de Google', () => {
  it('acepta uno válido y devuelve el sub y el correo en minúsculas', async () => {
    const fuente = clavesDesdeUrl('https://claves.test', servirClaves());
    expect(
      await verificarIdToken(token(), {
        clientId: 'cliente',
        nonce: 'n1',
        claves: fuente,
        ahoraEnSegundos: AHORA + 10,
      }),
    ).toEqual({ sujeto: '1234567890', correo: 'ana@example.com' });
  });

  it('el emisor sin https también es de Google', async () => {
    expect(await motivo(token({}, { issuer: 'accounts.google.com' }))).toBe('aceptado');
  });

  it.each([
    ['otra audiencia', token({}, { audience: 'otro-cliente' }), 'audiencia'],
    ['otro emisor', token({}, { issuer: 'https://evil.example' }), 'emisor'],
    ['firmado con otra clave', token({}, {}, ajena.privateKey), 'firma'],
    ['una clave que Google no publicó', token({}, { keyid: 'k9' }), 'firma'],
    ['sin correo verificado', token({ email_verified: false }), 'sin_verificar'],
    ['sin correo', token({ email: undefined }), 'incompleto'],
  ])('rechaza %s', async (_caso, t, esperado) => {
    expect(await motivo(t)).toBe(esperado);
  });

  it('rechaza un nonce distinto del que mandamos', async () => {
    expect(await motivo(token(), 'otro-nonce')).toBe('nonce');
  });

  it('rechaza uno vencido, con un minuto de tolerancia', async () => {
    const t = token({}, { expiresIn: 30 });
    const verificar = (segundos: number) =>
      verificarIdToken(t, {
        clientId: 'cliente',
        nonce: 'n1',
        claves: clavesDesdeUrl('https://claves.test', servirClaves()),
        ahoraEnSegundos: AHORA + segundos,
      });
    await expect(verificar(80)).resolves.toBeTruthy();
    await expect(verificar(200)).rejects.toMatchObject({ motivo: 'vencido' });
  });

  it('rechaza un token simétrico aunque diga venir de Google', async () => {
    const hs = jwt.sign({ nonce: 'n1', email: 'a@b.c', email_verified: true }, 'secreto', {
      algorithm: 'HS256',
      keyid: 'k1',
      issuer: 'https://accounts.google.com',
      audience: 'cliente',
      subject: '1',
    });
    expect(await motivo(hs)).toBe('firma');
  });

  it('pide las claves una vez mientras dura su Cache-Control, y de nuevo ante un kid nuevo', async () => {
    let ahora = 0;
    const pedir = servirClaves(600);
    const fuente = clavesDesdeUrl('https://claves.test', pedir, () => ahora);
    await fuente.clave('k1');
    await fuente.clave('k1');
    expect(pedir).toHaveBeenCalledTimes(1);
    // Un kid desconocido recién pedidas las claves no vuelve a pedir: espera un minuto.
    await fuente.clave('k2');
    expect(pedir).toHaveBeenCalledTimes(1);
    ahora = 61_000;
    await fuente.clave('k2');
    expect(pedir).toHaveBeenCalledTimes(2);
    ahora = 700_000;
    await fuente.clave('k1');
    expect(pedir).toHaveBeenCalledTimes(3);
  });
});

describe('decidir qué pasa al volver de Google', () => {
  const identidad = { identidadId: 7, userId: 3, activa: true };
  it.each([
    ['con identidad', identidad, null, { tipo: 'entrar', userId: 3, identidadId: 7 }],
    [
      'con identidad de una cuenta desactivada',
      { ...identidad, activa: false },
      null,
      { tipo: 'rechazar', error: 'cuenta_inactiva' },
    ],
    [
      'con una cuenta verificada',
      null,
      { id: 9, activa: true, correoVerificado: true },
      { tipo: 'vincular', userId: 9 },
    ],
    [
      'con una cuenta sin verificar',
      null,
      { id: 9, activa: true, correoVerificado: false },
      { tipo: 'limpiar-y-vincular', userId: 9 },
    ],
    [
      'con una cuenta desactivada con ese correo',
      null,
      { id: 9, activa: false, correoVerificado: true },
      { tipo: 'rechazar', error: 'cuenta_inactiva' },
    ],
    ['sin nada', null, null, { tipo: 'alta' }],
  ] as const)('%s', (_caso, i, c, esperado) => {
    expect(decidirEntrada(i, c)).toEqual(esperado);
  });

  it('la identidad manda sobre el correo: nunca se busca una cuenta por correo si ya hay identidad', () => {
    expect(decidirEntrada(identidad, { id: 99, activa: true, correoVerificado: true })).toEqual({
      tipo: 'entrar',
      userId: 3,
      identidadId: 7,
    });
  });
});

describe('la sugerencia de usuario', () => {
  it('limpia el correo con las reglas de siempre', () => {
    expect(candidatosDeUsuario('Juan.Bravín+x@gmail.com', 2)).toEqual([
      'juan_bravin_x',
      'juan_bravin_x2',
    ]);
    expect(candidatosDeUsuario('ab@x.com', 1)).toEqual(['persona_ab']);
    expect(candidatosDeUsuario('@x.com', 1)).toEqual(['persona']);
    for (const c of candidatosDeUsuario(`${'a'.repeat(60)}@x.com`))
      expect(c.length).toBeLessThanOrEqual(32);
  });

  it('elige el primero libre y, si no hay, agrega cuatro cifras', () => {
    const candidatos = candidatosDeUsuario('ana@x.com', 3);
    expect(sugerirUsuario(candidatos, new Set(['ana']))).toBe('ana2');
    expect(sugerirUsuario(candidatos, new Set(['ana', 'ana2', 'ana3']), () => 0.5)).toBe('ana5500');
  });
});

describe('PKCE, la dirección de Google y las cookies firmadas', () => {
  beforeEach(() => {
    vi.stubEnv('DATABASE_URL', 'postgresql://nadie@127.0.0.1:1/nada');
    vi.stubEnv('JWT_SECRET', 'x'.repeat(32));
    vi.stubEnv('SESSION_SECRET', 'y'.repeat(32));
    vi.stubEnv('GOOGLE_CLIENT_ID', 'cliente.apps.googleusercontent.com');
    vi.stubEnv('GOOGLE_CLIENT_SECRET', 'secreto');
    vi.stubEnv('PUBLIC_WEB_URL', 'https://elinstantedelhombregris.com');
    resetConfig();
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    resetConfig();
  });

  it('el desafío S256 es el del ejemplo del RFC 7636', () => {
    expect(desafioDe('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk')).toBe(
      'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
    );
  });

  it('manda a Google con el alcance mínimo, PKCE y la dirección de vuelta exacta', () => {
    const url = new URL(
      urlDeGoogle({ state: 's', verifier: 'v', nonce: 'n', volver: '/', para: 'entrar' }),
    );
    expect(url.origin + url.pathname).toBe('https://accounts.google.com/o/oauth2/v2/auth');
    expect(Object.fromEntries(url.searchParams)).toMatchObject({
      client_id: 'cliente.apps.googleusercontent.com',
      redirect_uri: 'https://elinstantedelhombregris.com/api/auth/google/callback',
      response_type: 'code',
      scope: 'openid email',
      state: 's',
      nonce: 'n',
      code_challenge: desafioDe('v'),
      code_challenge_method: 'S256',
    });
    expect(direccionDeVuelta()).toBe(
      'https://elinstantedelhombregris.com/api/auth/google/callback',
    );
  });

  it('en producción, sin https o sin secreto, Google no se ofrece', () => {
    expect(googleDisponible()).toBe(true);
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('PUBLIC_WEB_URL', 'http://localhost:5173');
    resetConfig();
    expect(googleDisponible()).toBe(false);
    vi.stubEnv('PUBLIC_WEB_URL', 'https://elinstantedelhombregris.com');
    vi.stubEnv('GOOGLE_CLIENT_SECRET', '');
    resetConfig();
    expect(googleDisponible()).toBe(false);
  });

  it('en producción, las direcciones de Google no se pueden cambiar por variables', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('GOOGLE_AUTH_URL', 'https://evil.example/auth');
    resetConfig();
    const url = new URL(
      urlDeGoogle({ state: 's', verifier: 'v', nonce: 'n', volver: '/', para: 'entrar' }),
    );
    expect(url.origin).toBe('https://accounts.google.com');
  });

  function respuestaFalsa() {
    const cookies = new Map<string, string>();
    const res = {
      cookie: (nombre: string, valor: string) => cookies.set(nombre, valor),
      clearCookie: (nombre: string) => cookies.delete(nombre),
    } as unknown as Response;
    return { res, cookies };
  }

  it('el estado vuelve igual, y uno adulterado o de otra audiencia no sirve', () => {
    const { res, cookies } = respuestaFalsa();
    const estado = {
      state: 's',
      verifier: 'v',
      nonce: 'n',
      volver: '/campanas',
      para: 'entrar' as const,
    };
    guardarEstado(res, estado);
    const valor = cookies.get('eihg_google');
    expect(tomarEstado(res, valor)).toEqual(estado);
    expect(cookies.has('eihg_google')).toBe(false);
    expect(tomarEstado(res, `${valor ?? ''}x`)).toBeNull();
    guardarConfirmacion(res, 4);
    expect(tomarEstado(res, cookies.get('eihg_confirmado'))).toBeNull();
  });

  it('la confirmación reciente sirve sólo para la cuenta que la pidió', () => {
    const { res, cookies } = respuestaFalsa();
    guardarConfirmacion(res, 4);
    const valor = cookies.get('eihg_confirmado');
    expect(confirmoRecien(valor, 4)).toBe(true);
    expect(confirmoRecien(valor, 5)).toBe(false);
    expect(confirmoRecien(undefined, 4)).toBe(false);
  });
});
