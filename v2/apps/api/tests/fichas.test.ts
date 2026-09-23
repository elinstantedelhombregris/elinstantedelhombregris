import { randomUUID } from 'node:crypto';

import { getDb } from '@v2/db';
import cookieParser from 'cookie-parser';
import express from 'express';
import supertest from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { postgresLocalDePrueba } from '@v2/db/testing';
import { signAccessToken } from '../src/features/auth/tokens.js';
import { fichasRouter } from '../src/features/fichas/routes.js';
import { csrfProtect } from '../src/middleware/csrf.js';
import { errorHandler } from '../src/middleware/error-handler.js';

import type { ContenidoFicha, FichaFuturo } from '@v2/shared';

vi.hoisted(() => {
  process.env['DATABASE_URL'] = 'postgresql://test@127.0.0.1:55439/basta_mapa_test';
  process.env['JWT_SECRET'] = 'mapa-test-secret-with-at-least-32-characters';
  process.env['SESSION_SECRET'] = 'mapa-session-test-with-at-least-32-characters';
});
vi.mock('@v2/db', async (original) => ({
  ...(await original<typeof import('@v2/db')>()),
  getDb: vi.fn(),
}));

describe.skipIf(!process.env['MAPA_TEST_DATABASE_URL'])(
  'Fichas HTTP con Postgres y permisos reales',
  () => {
    if (!process.env['MAPA_TEST_DATABASE_URL']) return;
    const local = postgresLocalDePrueba();
    const app = express();
    app.use(express.json(), cookieParser(), csrfProtect);
    app.use('/api/v1/fichas', fichasRouter);
    app.use(errorHandler());
    const request = supertest(app);
    const marca = randomUUID();
    let usuario = 0;
    let otro = 0;
    let id = '';
    let cookie = '';
    let cookieAjena = '';
    const senalId = randomUUID();
    const contenido: ContenidoFicha = {
      titulo: '¿Cómo acercamos agua accesible?',
      territorioId: null,
      temas: ['agua'],
      situacion: '',
      futuro: 'Agua accesible.',
      proximaTarea: '',
      vinculos: [{ senalId, relacion: 'describe' }],
    };
    beforeAll(async () => {
      vi.mocked(getDb).mockReturnValue(local.db);
      const insertado = await local.pool.query<{ id: number }>(
        `insert into users(username,email,name,password_hash)
      values ($1,$1,'Prueba','no-login'),($2,$2,'Otra prueba','no-login') returning id`,
        [marca, marca + '-otro'],
      );
      usuario = insertado.rows[0]?.id ?? 0;
      otro = insertado.rows[1]?.id ?? 0;
      const sesion = (uid: number) =>
        `eihg_access=${signAccessToken({ sub: uid, username: 'test', email: 'test@example.invalid' })}; eihg_csrf=fichas-prueba`;
      cookie = sesion(usuario);
      cookieAjena = sesion(otro);
      await local.pool.query(
        `insert into senales(tipo,clase,origen,id_local,id_publico,texto)
      values ('basta','hecho','web',gen_random_uuid(),$1,'Texto privado del aporte')`,
        [senalId],
      );
    });
    afterAll(async () => {
      await local.pool.query('delete from fichas_revisiones where editor_id in ($1,$2)', [
        usuario,
        otro,
      ]);
      await local.pool.query('delete from fichas_futuro where creador_id in ($1,$2)', [
        usuario,
        otro,
      ]);
      await local.pool.query('delete from senales where id_publico=$1', [senalId]);
      await local.pool.query('delete from users where id in ($1,$2)', [usuario, otro]);
      await local.pool.end();
    });
    const post = (body: object) =>
      request
        .post('/api/v1/fichas')
        .set('Cookie', cookie)
        .set('X-CSRF-Token', 'fichas-prueba')
        .send(body);
    const put = (revision: number, contenidoNuevo: ContenidoFicha, sesion = cookie) =>
      request
        .put(`/api/v1/fichas/${id}`)
        .set('Cookie', sesion)
        .set('X-CSRF-Token', 'fichas-prueba')
        .send({ revisionEsperada: revision, contenido: contenidoNuevo });
    it('rechaza escritura sin sesión, sin CSRF y con referencias inexistentes', async () => {
      await request
        .post('/api/v1/fichas')
        .set('Cookie', 'eihg_csrf=fichas-prueba')
        .set('X-CSRF-Token', 'fichas-prueba')
        .send({})
        .expect(401);
      await request.post('/api/v1/fichas').set('Cookie', cookie).send({}).expect(403);
      await post({
        idLocal: randomUUID(),
        contenido: { ...contenido, territorioId: 2147483647 },
        aceptaPublicar: true,
      }).expect(400);
    });
    it('crea ficha y primera revisión en conjunto, y reintentar devuelve el mismo recibo', async () => {
      const entrada = { idLocal: randomUUID(), contenido, aceptaPublicar: true };
      const uno = await post(entrada).expect(201);
      id = uno.body.data.id as string;
      const dos = await post(entrada).expect(201);
      expect(dos.body.data.id).toBe(id);
      const res = await request.get(`/api/v1/fichas/${id}`).set('Cookie', cookie).expect(200);
      const ficha = res.body.data as FichaFuturo;
      expect(ficha).toMatchObject({ revision: 1, puedoEditar: true });
      expect(ficha.historial).toHaveLength(1);
      expect(ficha.aportes[0]?.texto).toBe('Texto reservado por su autoría.');
      expect(JSON.stringify(res.body)).not.toContain('Texto privado del aporte');
      expect(res.body.data.creadorId).toBeUndefined();
      expect(res.body.data.idLocal).toBeUndefined();
      const lista = await request.get('/api/v1/fichas').expect(200);
      expect(lista.body.data.fichas).toEqual(
        expect.arrayContaining([expect.objectContaining({ id })]),
      );
    });
    it('impide edición ajena y resuelve dos ediciones concurrentes con un único ganador', async () => {
      await put(1, contenido, cookieAjena).expect(403);
      const resultados = await Promise.all([
        put(1, { ...contenido, futuro: 'Alternativa A' }),
        put(1, { ...contenido, futuro: 'Alternativa B' }),
      ]);
      expect(resultados.map((r) => r.status).sort()).toEqual([200, 409]);
      const res = await request.get(`/api/v1/fichas/${id}`).expect(200);
      const ficha = res.body.data as FichaFuturo;
      expect(ficha.revision).toBe(2);
      expect(ficha.puedoEditar).toBe(false);
      expect(ficha.historial).toHaveLength(2);
      expect(ficha.historial[0]?.campos).toEqual(['futuro']);
      expect(JSON.stringify(ficha.historial)).not.toContain('Alternativa');
    });
    it('un retiro se propaga a la ficha; las revisiones públicas no resucitan texto', async () => {
      await local.pool.query("update senales set estado='retirada', texto='' where id_publico=$1", [
        senalId,
      ]);
      const res = await request.get(`/api/v1/fichas/${id}`).expect(200);
      expect(res.body.data.aportes[0]).toMatchObject({
        disponible: false,
        texto: null,
        estado: null,
      });
      expect(JSON.stringify(res.body)).not.toContain('Texto privado del aporte');
    });
  },
);
