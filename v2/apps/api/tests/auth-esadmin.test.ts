/**
 * `esAdmin` en lo que la API dice de la sesión.
 *
 * La web esconde los controles de administración con este booleano, así que
 * tiene que estar en todas las respuestas que le entregan el usuario: `/me`,
 * el login y el refresh (la web guarda el usuario de cualquiera de las tres en
 * la misma caché). No es una barrera: la barrera es `exigirAdmin` en cada ruta.
 * Esto solo evita mostrar un botón que va a devolver 403.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import supertest from 'supertest';

import { createApp } from '../src/app.js';
import { resetConfig } from '../src/lib/config.js';

import {
  createTestUser,
  csrfed,
  deleteTestUsers,
  hasDatabaseUrl,
  loginAndGetCookies,
} from './helpers/index.js';

import type { LoggedInSession, TestUser } from './helpers/index.js';

const dsuite = hasDatabaseUrl ? describe : describe.skip;

dsuite('esAdmin en la sesión', () => {
  const app = createApp();
  const previo = process.env['ADMIN_USERNAMES'];
  let admin: TestUser;
  let comun: TestUser;
  let sesionAdmin: LoggedInSession;
  let sesionComun: LoggedInSession;

  beforeAll(async () => {
    admin = await createTestUser('esadmin');
    comun = await createTestUser('noesadmin');
    process.env['ADMIN_USERNAMES'] = admin.username;
    resetConfig();
    sesionAdmin = await loginAndGetCookies(app, admin);
    sesionComun = await loginAndGetCookies(app, comun);
  });

  afterAll(async () => {
    if (previo === undefined) delete process.env['ADMIN_USERNAMES'];
    else process.env['ADMIN_USERNAMES'] = previo;
    resetConfig();
    await deleteTestUsers([admin.email, comun.email]);
  });

  it('GET /api/auth/me dice true a quien figura en ADMIN_USERNAMES y false al resto', async () => {
    const a = await csrfed(app, sesionAdmin).get('/api/auth/me').expect(200);
    expect(a.body.data.user.esAdmin).toBe(true);
    const c = await csrfed(app, sesionComun).get('/api/auth/me').expect(200);
    expect(c.body.data.user.esAdmin).toBe(false);
  });

  it('el login devuelve el mismo booleano que /me', async () => {
    const a = await supertest(app)
      .post('/api/auth/login')
      .send({ identifier: admin.email, password: admin.password })
      .expect(200);
    expect(a.body.data.user.esAdmin).toBe(true);
    const c = await supertest(app)
      .post('/api/auth/login')
      .send({ identifier: comun.email, password: comun.password })
      .expect(200);
    expect(c.body.data.user.esAdmin).toBe(false);
  });

  it('el refresh también lo devuelve', async () => {
    const r = await csrfed(app, sesionAdmin).post('/api/auth/refresh').expect(200);
    expect(r.body.data.user.esAdmin).toBe(true);
  });

  it('se calcula en cada pedido: sacar el nombre de la lista lo apaga sin esperar a que venza el token', async () => {
    process.env['ADMIN_USERNAMES'] = '';
    resetConfig();
    try {
      const r = await csrfed(app, sesionAdmin).get('/api/auth/me').expect(200);
      expect(r.body.data.user.esAdmin).toBe(false);
    } finally {
      process.env['ADMIN_USERNAMES'] = admin.username;
      resetConfig();
    }
  });

  it('sin lista, nadie es admin', async () => {
    delete process.env['ADMIN_USERNAMES'];
    resetConfig();
    try {
      const r = await csrfed(app, sesionAdmin).get('/api/auth/me').expect(200);
      expect(r.body.data.user.esAdmin).toBe(false);
    } finally {
      process.env['ADMIN_USERNAMES'] = admin.username;
      resetConfig();
    }
  });
});
