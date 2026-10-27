/**
 * Entrar y crear la cuenta con Google, de punta a punta contra Postgres y un Google falso
 * (ADR 0012, spec 2026-10-27-ingreso-con-google.md).
 *
 * El Google falso es un servidor local con dos rutas: las claves públicas y el cambio del
 * código por el `id_token`. Comprueba lo que el de verdad comprueba —el client id, el
 * secreto, la dirección de vuelta y el verificador de PKCE contra el desafío— y firma con una
 * clave de la prueba. La «página de Google» no existe: la prueba lee la dirección a la que la
 * API manda a la persona y vuelve con un código, como lo haría Google.
 */
import '../src/load-env.js';

import { createHash, generateKeyPairSync, randomUUID } from 'node:crypto';
import { createServer } from 'node:http';

import { getDb, sql } from '@v2/db';
import jwt from 'jsonwebtoken';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createApp } from '../src/app.js';
import { signAccessToken } from '../src/features/auth/tokens.js';
import { resetConfig } from '../src/lib/config.js';

import { clienteHttp } from './setup/cliente-http.js';

import type { AddressInfo } from 'node:net';
import type { Response } from 'supertest';

const CLIENTE = 'cliente-de-prueba.apps.googleusercontent.com';
const SECRETO = 'secreto-de-prueba';
const WEB = 'http://localhost:5173';
const VUELTA = `${WEB}/api/auth/google/callback`;

describe.skipIf(!process.env['DATABASE_URL_DESCARTABLE'])('Ingresar con Google', () => {
  const request = clienteHttp(createApp());
  const marca = randomUUID().slice(0, 8);
  const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
  const jwk = { ...publicKey.export({ format: 'jwk' }), kid: 'prueba', alg: 'RS256', use: 'sig' };

  /** Lo que «Google» sabe de cada código que emitió. */
  const codigos = new Map<
    string,
    { sub: string; email: string; verificado: boolean; nonce: string; desafio: string }
  >();
  const google = createServer((req, res) => {
    if (req.url === '/certs') {
      res.setHeader('cache-control', 'public, max-age=600');
      res.end(JSON.stringify({ keys: [jwk] }));
      return;
    }
    let cuerpo = '';
    req.on('data', (c: Buffer) => (cuerpo += c.toString()));
    req.on('end', () => {
      const f = new URLSearchParams(cuerpo);
      const emitido = codigos.get(f.get('code') ?? '');
      const desafio = createHash('sha256')
        .update(f.get('code_verifier') ?? '')
        .digest('base64url');
      if (
        !emitido ||
        f.get('client_id') !== CLIENTE ||
        f.get('client_secret') !== SECRETO ||
        f.get('redirect_uri') !== VUELTA ||
        f.get('grant_type') !== 'authorization_code' ||
        desafio !== emitido.desafio
      ) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'invalid_grant' }));
        return;
      }
      codigos.delete(f.get('code') ?? '');
      const id_token = jwt.sign(
        { email: emitido.email, email_verified: emitido.verificado, nonce: emitido.nonce },
        privateKey,
        {
          algorithm: 'RS256',
          keyid: 'prueba',
          issuer: 'https://accounts.google.com',
          audience: CLIENTE,
          subject: emitido.sub,
          expiresIn: 300,
        },
      );
      res.end(JSON.stringify({ id_token, access_token: 'no-se-usa' }));
    });
  });

  const usuarios: number[] = [];
  const correo = (n: string) => `${n}-${marca}@gmail.test`;
  const sub = (n: string) => `sub-${marca}-${n}`;

  beforeAll(async () => {
    await new Promise<void>((ok) => google.listen(0, '127.0.0.1', ok));
    const { port } = google.address() as AddressInfo;
    Object.assign(process.env, {
      GOOGLE_CLIENT_ID: CLIENTE,
      GOOGLE_CLIENT_SECRET: SECRETO,
      GOOGLE_AUTH_URL: 'https://google.falso/auth',
      GOOGLE_TOKEN_URL: `http://127.0.0.1:${String(port)}/token`,
      GOOGLE_JWKS_URL: `http://127.0.0.1:${String(port)}/certs`,
      PUBLIC_WEB_URL: WEB,
    });
    resetConfig();
  });

  afterAll(async () => {
    for (const k of [
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
      'GOOGLE_AUTH_URL',
      'GOOGLE_TOKEN_URL',
      'GOOGLE_JWKS_URL',
      'PUBLIC_WEB_URL',
    ])
      delete process.env[k];
    resetConfig();
    await new Promise<void>((ok) => google.close(() => ok()));
    const ids = sql.raw(`'{${usuarios.join(',') || '0'}}'::int[]`);
    await getDb().execute(sql`delete from users where id = any(${ids})`);
    await getDb().execute(sql`delete from users where email like ${'%-' + marca + '@gmail.test'}`);
  });

  /** Las cookies que dejó una respuesta, como `nombre=valor`. */
  const cookiesDe = (r: Response): Map<string, string> => {
    const lista = (r.headers['set-cookie'] as unknown as string[] | undefined) ?? [];
    return new Map(
      lista.map((c) => {
        const par = c.split(';')[0] ?? '';
        const i = par.indexOf('=');
        return [par.slice(0, i), par.slice(i + 1)];
      }),
    );
  };

  /**
   * El ida y vuelta entero: la ida, «Google» emite un código para esta persona y la vuelta.
   * Devuelve la respuesta de la vuelta.
   */
  async function irYVolver(
    persona: { sub: string; email: string; verificado?: boolean },
    opciones: { volver?: string; cookie?: string; para?: string } = {},
  ) {
    const q = new URLSearchParams({ volver: opciones.volver ?? '/campanas' });
    if (opciones.para) q.set('para', opciones.para);
    const ida = await request
      .get(`/api/auth/google?${q.toString()}`)
      .set('Cookie', opciones.cookie ?? '');
    expect(ida.status).toBe(302);
    const destino = new URL(ida.headers['location'] as string);
    const estado = cookiesDe(ida).get('eihg_google') ?? '';
    const codigo = randomUUID();
    codigos.set(codigo, {
      sub: persona.sub,
      email: persona.email,
      verificado: persona.verificado ?? true,
      nonce: destino.searchParams.get('nonce') ?? '',
      desafio: destino.searchParams.get('code_challenge') ?? '',
    });
    const vuelta = await request
      .get(
        `/api/auth/google/callback?${new URLSearchParams({ code: codigo, state: destino.searchParams.get('state') ?? '' }).toString()}`,
      )
      .set('Cookie', [`eihg_google=${estado}`, opciones.cookie ?? ''].join('; '));
    return { ida, destino, vuelta };
  }

  const cuenta = async (n: string, opciones: { verificado: boolean; activa?: boolean }) => {
    const r = await getDb().execute<{ id: number }>(sql`
      insert into users (username, email, name, password_hash, email_verified, is_active)
      values (${`${n}_${marca}`}, ${correo(n)}, 'Prueba', 'hash-de-prueba', ${opciones.verificado}, ${opciones.activa ?? true})
      returning id`);
    const id = r.rows[0]?.id ?? 0;
    usuarios.push(id);
    return id;
  };
  const fila = async (id: number) =>
    (
      await getDb().execute<{ password_hash: string | null; email_verified: boolean }>(
        sql`select password_hash, email_verified from users where id = ${id}`,
      )
    ).rows[0];

  it('ofrece Google sólo con la configuración completa', async () => {
    const r = await request.get('/api/auth/proveedores');
    expect(r.body.data).toEqual({ google: true });
  });

  it('manda a Google con el alcance mínimo, PKCE y la dirección de vuelta exacta', async () => {
    const ida = await request.get('/api/auth/google?volver=/campanas');
    expect(ida.status).toBe(302);
    const destino = new URL(ida.headers['location'] as string);
    expect(destino.origin + destino.pathname).toBe('https://google.falso/auth');
    expect(Object.fromEntries(destino.searchParams)).toMatchObject({
      client_id: CLIENTE,
      redirect_uri: VUELTA,
      scope: 'openid email',
      code_challenge_method: 'S256',
      response_type: 'code',
    });
    const cookie = (ida.headers['set-cookie'] as unknown as string[]).find((c) =>
      c.startsWith('eihg_google='),
    );
    expect(cookie).toMatch(/HttpOnly/);
    expect(cookie).toMatch(/SameSite=Lax/);
    expect(cookie).toMatch(/Path=\/api\/auth\/google/);
  });

  it('quien llega nuevo pasa por «Último paso», elige su usuario y queda adentro', async () => {
    const persona = { sub: sub('nueva'), email: correo('nueva') };
    const { vuelta } = await irYVolver(persona);
    expect(vuelta.status).toBe(302);
    expect(vuelta.headers['location']).toBe('/registrarse/google?volver=%2Fcampanas');
    const alta = cookiesDe(vuelta).get('eihg_google_alta') ?? '';
    expect(cookiesDe(vuelta).has('eihg_access')).toBe(false);

    const pendiente = await request
      .get('/api/auth/google/alta')
      .set('Cookie', `eihg_google_alta=${alta}`);
    expect(pendiente.body.data).toEqual({
      correo: correo('nueva'),
      sugerencia: `nueva-${marca}`,
    });

    const creada = await request
      .post('/api/auth/google/alta')
      .set('Cookie', `eihg_google_alta=${alta}`)
      .send({ username: `nueva_${marca}`, name: 'Nueva' });
    expect(creada.status).toBe(201);
    expect(creada.body.data.volver).toBe('/campanas');
    expect(creada.body.data.user).toMatchObject({ username: `nueva_${marca}`, emailVerified: true });
    expect(cookiesDe(creada).has('eihg_access')).toBe(true);
    const id = creada.body.data.user.id as number;
    usuarios.push(id);
    expect(await fila(id)).toEqual({ password_hash: null, email_verified: true });

    // La segunda vez entra directo, sin «Último paso».
    const otraVez = await irYVolver(persona);
    expect(otraVez.vuelta.headers['location']).toBe('/campanas');
    expect(cookiesDe(otraVez.vuelta).has('eihg_access')).toBe(true);

    // Y con contraseña no entra: no tiene.
    const conClave = await request
      .post('/api/auth/login')
      .send({ identifier: `nueva_${marca}`, password: 'cualquiera-123' });
    expect(conClave.status).toBe(401);
    expect(conClave.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('el «Último paso» dice si el usuario está tomado, y sin la cookie no crea nada', async () => {
    await cuenta('tomado', { verificado: true });
    const { vuelta } = await irYVolver({ sub: sub('otra'), email: correo('otra') });
    const alta = cookiesDe(vuelta).get('eihg_google_alta') ?? '';
    const tomado = await request
      .post('/api/auth/google/alta')
      .set('Cookie', `eihg_google_alta=${alta}`)
      .send({ username: `tomado_${marca}`, name: 'Otra' });
    expect(tomado.status).toBe(409);
    expect(tomado.body.error.code).toBe('USERNAME_TAKEN');

    const sinCookie = await request
      .post('/api/auth/google/alta')
      .send({ username: `otra_${marca}`, name: 'Otra' });
    expect(sinCookie.status).toBe(401);
    expect(sinCookie.body.error.code).toBe('ALTA_VENCIDA');
  });

  it('una cuenta con el correo verificado se vincula y conserva su contraseña', async () => {
    const id = await cuenta('verificada', { verificado: true });
    const { vuelta } = await irYVolver({ sub: sub('verificada'), email: correo('verificada') });
    expect(vuelta.headers['location']).toBe('/campanas');
    expect(cookiesDe(vuelta).has('eihg_access')).toBe(true);
    expect(await fila(id)).toEqual({ password_hash: 'hash-de-prueba', email_verified: true });
  });

  it('una cuenta sin el correo verificado se limpia antes de vincularse', async () => {
    const id = await cuenta('sinverificar', { verificado: false });
    await getDb().execute(
      sql`insert into two_factor_secrets (user_id, secret, enabled) values (${id}, 'SECRETO', true)`,
    );
    const { vuelta } = await irYVolver({ sub: sub('sinverificar'), email: correo('sinverificar') });
    // Entra directo: el doble factor que puso quien creó la cuenta ya no está.
    expect(vuelta.headers['location']).toBe('/campanas');
    expect(await fila(id)).toEqual({ password_hash: null, email_verified: true });
  });

  it('con doble factor, después de Google pasa por el desafío', async () => {
    const id = await cuenta('doble', { verificado: true });
    await getDb().execute(
      sql`insert into two_factor_secrets (user_id, secret, enabled) values (${id}, 'SECRETO', true)`,
    );
    const { vuelta } = await irYVolver({ sub: sub('doble'), email: correo('doble') });
    const destino = new URL(vuelta.headers['location'] as string, 'https://x.test');
    expect(destino.pathname).toBe('/2fa-desafio');
    expect(destino.searchParams.get('volver')).toBe('/campanas');
    expect(destino.searchParams.get('ticket')).toBeTruthy();
    expect(cookiesDe(vuelta).has('eihg_access')).toBe(false);
  });

  it('una cuenta desactivada no entra ni se vincula', async () => {
    await cuenta('apagada', { verificado: true, activa: false });
    const { vuelta } = await irYVolver({ sub: sub('apagada'), email: correo('apagada') });
    expect(vuelta.headers['location']).toBe('/ingresar?error=cuenta_inactiva&volver=%2Fcampanas');
  });

  it('sin el correo verificado por Google no crea ni vincula nada', async () => {
    const { vuelta } = await irYVolver({
      sub: sub('dudosa'),
      email: correo('dudosa'),
      verificado: false,
    });
    expect(vuelta.headers['location']).toBe(
      '/ingresar?error=google_sin_verificar&volver=%2Fcampanas',
    );
    const r = await getDb().execute<{ n: string }>(
      sql`select count(*) as n from identidades_externas where sujeto = ${sub('dudosa')}`,
    );
    expect(Number(r.rows[0]?.n)).toBe(0);
  });

  it('un state distinto, o sin la cookie de la ida, vuelve como vencido', async () => {
    const ida = await request.get('/api/auth/google?volver=/campanas');
    const estado = cookiesDe(ida).get('eihg_google') ?? '';
    const otro = await request
      .get('/api/auth/google/callback?code=x&state=otro')
      .set('Cookie', `eihg_google=${estado}`);
    expect(otro.headers['location']).toBe('/ingresar?error=google_vencido&volver=%2Fcampanas');
    const sinCookie = await request.get('/api/auth/google/callback?code=x&state=y');
    expect(sinCookie.headers['location']).toBe(
      '/ingresar?error=google_vencido&volver=%2Fmi-espacio',
    );
  });

  it('si la persona cancela en Google, vuelve a ingresar sin error grave', async () => {
    const ida = await request.get('/api/auth/google?volver=/campanas');
    const estado = cookiesDe(ida).get('eihg_google') ?? '';
    const r = await request
      .get('/api/auth/google/callback?error=access_denied')
      .set('Cookie', `eihg_google=${estado}`);
    expect(r.headers['location']).toBe('/ingresar?error=google_cancelado&volver=%2Fcampanas');
  });

  it('un volver ajeno al sitio se cambia por Mi espacio', async () => {
    const { vuelta } = await irYVolver(
      { sub: sub('nueva'), email: correo('nueva') },
      { volver: 'https://evil.example/x' },
    );
    expect(vuelta.headers['location']).toBe('/mi-espacio');
  });

  it('la confirmación reciente prueba que la cuenta con sesión es la de Google', async () => {
    const id = await cuenta('confirma', { verificado: true });
    await irYVolver({ sub: sub('confirma'), email: correo('confirma') });
    const sesion = `eihg_access=${signAccessToken({ sub: id, username: `confirma_${marca}`, email: correo('confirma') })}`;
    const bien = await irYVolver(
      { sub: sub('confirma'), email: correo('confirma') },
      { cookie: sesion, para: 'confirmar', volver: '/mi-espacio' },
    );
    expect(bien.vuelta.headers['location']).toBe('/mi-espacio?confirmado=google');
    expect(cookiesDe(bien.vuelta).has('eihg_confirmado')).toBe(true);
    expect(cookiesDe(bien.vuelta).has('eihg_access')).toBe(false);

    const otra = await irYVolver(
      { sub: sub('verificada'), email: correo('verificada') },
      { cookie: sesion, para: 'confirmar', volver: '/mi-espacio' },
    );
    expect(otra.vuelta.headers['location']).toBe('/mi-espacio?error=google_otra_cuenta');
    expect(cookiesDe(otra.vuelta).has('eihg_confirmado')).toBe(false);
  });
});
