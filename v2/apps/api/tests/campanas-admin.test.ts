/**
 * Solo la administración abre campañas y cambia su fase.
 *
 * Decisión del 9/10/2026: «Solo Juan Bravin abre campañas». La lista es
 * `ADMIN_USERNAMES` y se compara con el nombre **de la base**, no con el del
 * token: por eso las cuentas de acá firman tokens con un nombre que no es el
 * suyo, y la prueba es que el nombre del token no abre ni cierra nada.
 *
 * El molde es el de `blog-flows.test.ts`: se fija `ADMIN_USERNAMES`, se llama a
 * `resetConfig()` (la configuración se cachea) y se deja todo como estaba.
 */
import { randomUUID } from 'node:crypto';

import { getDb, sql } from '@v2/db';
import supertest from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { limpiarFixturesIdeales } from '@v2/db/testing/limpiar-fixtures-ideales';
import { createApp } from '../src/app.js';
import { signAccessToken } from '../src/features/auth/tokens.js';
import { resetConfig } from '../src/lib/config.js';

const contrato = {
  titulo: 'Conversación de prueba del acceso',
  pregunta: '¿Qué vida queremos poder vivir?',
  proposito: 'Escuchar experiencias para imaginar condiciones compartidas.',
  territorios: [],
  temas: ['educación'],
  participantes: 'Quienes quieran participar en esta prueba.',
  canales: ['web'],
  responsable: 'Equipo de pruebas',
  devolucion: 'Una lectura pública revisable por quienes participaron.',
  fechaDevolucion: '2099-12-20',
  efecto: 'Ejercicio sin compromiso institucional.',
  fases: [{ nombre: 'Imaginar', salida: 'Relatos revisados por sus autores.', fecha: '2099-12-01' }],
};

describe.skipIf(!process.env['DATABASE_URL_DESCARTABLE'])(
  'Campañas: solo la administración las abre',
  () => {
    const request = supertest(createApp());
    const marca = randomUUID();
    const marcaOtra = randomUUID();
    const usuariosFixture: number[] = [];
    const previo = process.env['ADMIN_USERNAMES'];
    let admin = 0;
    let comun = 0;
    let otraAdmin = 0;
    let cookieAdmin = '';
    let cookieComun = '';
    let cookieOtraAdmin = '';
    /** Cuenta común con un token que dice llamarse como la administradora. */
    let cookieComunConNombreAjeno = '';
    /** Cuenta administradora con un token que dice llamarse de otra forma. */
    let cookieAdminConNombreAjeno = '';
    let campana = '';
    const lista = `${marca}, ${marcaOtra}`;

    const sesion = (id: number, username: string) =>
      `eihg_access=${signAccessToken({ sub: id, username, email: 'prueba@test.local' })}; eihg_csrf=campanas-admin`;
    const enviar = (cookie: string, ruta: string, cuerpo: object) =>
      request.post(ruta).set('Cookie', cookie).set('X-CSRF-Token', 'campanas-admin').send(cuerpo);

    beforeAll(async () => {
      const r = await getDb().execute<{ id: number }>(sql`
        insert into users (username, email, name, password_hash, email_verified) values
          (${marca}, ${marca + '@test.local'}, 'Admin', 'no-login', true),
          (${marca + 'b'}, ${marca + 'b@test.local'}, 'Común', 'no-login', true)
        returning id`);
      usuariosFixture.push(...r.rows.map((u) => u.id));
      admin = r.rows[0]?.id ?? 0;
      comun = r.rows[1]?.id ?? 0;
      // Una segunda administradora: la lista de `ADMIN_USERNAMES` es de varios nombres.
      // Su nombre también es un uuid: es el marcador con el que `limpiarFixturesIdeales` reconoce una cuenta de prueba.
      const c = await getDb().execute<{ id: number }>(sql`
        insert into users (username, email, name, password_hash, email_verified) values
          (${marcaOtra}, ${marcaOtra + '@test.local'}, 'Otra admin', 'no-login', true)
        returning id`);
      otraAdmin = c.rows[0]?.id ?? 0;
      usuariosFixture.push(otraAdmin);
      process.env['ADMIN_USERNAMES'] = lista;
      resetConfig();
      cookieAdmin = sesion(admin, 'nombre-viejo-del-token');
      cookieComun = sesion(comun, 'comun');
      cookieOtraAdmin = sesion(otraAdmin, 'otra');
      cookieComunConNombreAjeno = sesion(comun, marca);
      cookieAdminConNombreAjeno = sesion(admin, 'cualquiera');
    });

    afterAll(async () => {
      if (previo === undefined) delete process.env['ADMIN_USERNAMES'];
      else process.env['ADMIN_USERNAMES'] = previo;
      resetConfig();
      await limpiarFixturesIdeales(getDb(), usuariosFixture);
    });

    it('sin sesión no se abre una campaña', async () => {
      await request
        .post('/api/v1/campanas')
        .set('Cookie', 'eihg_csrf=campanas-admin')
        .set('X-CSRF-Token', 'campanas-admin')
        .send({ idLocal: randomUUID(), contrato })
        .expect(401);
    });

    it('una cuenta común recibe 403 NOT_ADMIN al abrir una campaña, y no queda nada creado', async () => {
      const r = await enviar(cookieComun, '/api/v1/campanas', { idLocal: randomUUID(), contrato });
      expect(r.status).toBe(403);
      expect(r.body.error.code).toBe('NOT_ADMIN');
      expect(r.body.error.message).toBe('Esta acción requiere permisos de administrador.');
      const filas = await getDb().execute<{ n: number }>(
        sql`select count(*)::int n from campanas where creador_id = ${comun}`,
      );
      expect(filas.rows[0]?.n).toBe(0);
    });

    it('la administración abre la campaña, aunque su token traiga otro nombre', async () => {
      const r = await enviar(cookieAdminConNombreAjeno, '/api/v1/campanas', {
        idLocal: randomUUID(),
        contrato,
      });
      expect(r.status).toBe(201);
      campana = r.body.data.id as string;
      const fila = await getDb().execute<{ creador_id: number; estado: string }>(
        sql`select creador_id, estado from campanas where id = ${campana}::uuid`,
      );
      expect(fila.rows[0]).toMatchObject({ creador_id: admin, estado: 'borrador' });
    });

    it('el nombre del token no da permisos: una cuenta común que firma con el nombre de la administradora sigue sin poder', async () => {
      const r = await enviar(cookieComunConNombreAjeno, '/api/v1/campanas', {
        idLocal: randomUUID(),
        contrato,
      });
      expect(r.status).toBe(403);
      expect(r.body.error.code).toBe('NOT_ADMIN');
    });

    it('una cuenta común recibe 403 NOT_ADMIN al cambiar de fase, incluso en una campaña ajena', async () => {
      const r = await enviar(cookieComun, `/api/v1/campanas/${campana}/estado`, {
        revision: 1,
        estado: 'abierta',
        motivo: 'Intento de abrir una campaña sin ser administración.',
      });
      expect(r.status).toBe(403);
      expect(r.body.error.code).toBe('NOT_ADMIN');
      const fila = await getDb().execute<{ estado: string; revision: number }>(
        sql`select estado, revision from campanas where id = ${campana}::uuid`,
      );
      expect(fila.rows[0]).toMatchObject({ estado: 'borrador', revision: 1 });
    });

    it('otra administradora que no convoca esta campaña sigue sin poder cambiar su fase', async () => {
      const r = await enviar(cookieOtraAdmin, `/api/v1/campanas/${campana}/estado`, {
        revision: 1,
        estado: 'abierta',
        motivo: 'Intento de abrir la campaña de otra cuenta.',
      });
      expect(r.status).toBe(403);
      expect(r.body.error.code).toBe('SIN_PERMISO');
    });

    it('quien la abrió, siendo administración, cambia su fase', async () => {
      await enviar(cookieAdmin, `/api/v1/campanas/${campana}/estado`, {
        revision: 1,
        estado: 'abierta',
        motivo: 'Abrimos para probar el acceso.',
      }).expect(200);
      const fila = await getDb().execute<{ estado: string; revision: number }>(
        sql`select estado, revision from campanas where id = ${campana}::uuid`,
      );
      expect(fila.rows[0]).toMatchObject({ estado: 'abierta', revision: 2 });
    });

    it('quitarle el nombre de la lista le quita el permiso en la próxima pedida', async () => {
      process.env['ADMIN_USERNAMES'] = marcaOtra;
      resetConfig();
      try {
        const r = await enviar(cookieAdmin, `/api/v1/campanas/${campana}/estado`, {
          revision: 2,
          estado: 'pausada',
          motivo: 'Intento de pausar sin figurar en la lista.',
        });
        expect(r.status).toBe(403);
        expect(r.body.error.code).toBe('NOT_ADMIN');
      } finally {
        process.env['ADMIN_USERNAMES'] = lista;
        resetConfig();
      }
    });

    it('lo público no cambia: cualquiera lee la campaña abierta y el catálogo', async () => {
      const una = await request.get(`/api/v1/campanas/${campana}`).expect(200);
      expect(una.body.data).toMatchObject({ id: campana, estado: 'abierta', puedoEditar: false });
      await request.get('/api/v1/campanas').expect(200);
    });
  },
);
