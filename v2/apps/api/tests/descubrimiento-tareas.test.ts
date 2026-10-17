import { randomUUID } from 'node:crypto';

import { getDb, sql } from '@v2/db';
import { limpiarFixturesIdeales } from '@v2/db/testing/limpiar-fixtures-ideales';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createApp } from '../src/app.js';
import { signAccessToken } from '../src/features/auth/tokens.js';

import { clienteHttp } from './setup/cliente-http.js';

describe.skipIf(!process.env['DATABASE_URL_DESCARTABLE'])(
  'Descubrimiento de tareas y fichas editables',
  () => {
    const api = clienteHttp(createApp());
    const usuarios: number[] = [],
      iniciativas: number[] = [],
      fichas: string[] = [];
    const palabra = randomUUID();
    const cookie = (u = 0) =>
      `eihg_access=${signAccessToken({ sub: usuarios[u]!, username: 'fixture', email: 'fixture@test.local' })}; eihg_csrf=escuela`;
    const post = (ruta: string, body: object, u = 0) =>
      api
        .post('/api/iniciativas' + ruta)
        .set('Cookie', cookie(u))
        .set('X-CSRF-Token', 'escuela')
        .send(body);
    const editables = (u = 0, params: Record<string, string> = {}) =>
      api.get('/api/v1/fichas/editables').query(params).set('Cookie', cookie(u));
    beforeAll(async () => {
      for (let n = 0; n < 3; n++) {
        const nombre = randomUUID();
        const r = await getDb().execute<{ id: number }>(
          sql`insert into users(username,email,name,password_hash) values(${nombre},${nombre + '@test.local'},'Fixture','no-login') returning id`,
        );
        usuarios.push(r.rows[0]!.id);
      }
      const r = await getDb().execute<{
        id: string;
      }>(sql`insert into fichas_futuro(creador_id,id_local,contenido)
      select ${usuarios[0]},gen_random_uuid(),jsonb_build_object('titulo',${palabra}::text||' Escuela '||n) from generate_series(1,22) n returning id`);
      fichas.push(...r.rows.map((f) => f.id));
    });
    afterAll(async () => {
      await getDb().execute(
        sql`delete from iniciativas where id in(select x::int from jsonb_array_elements_text(${JSON.stringify(iniciativas)}::jsonb) x)`,
      );
      await limpiarFixturesIdeales(getDb(), usuarios);
    });
    async function nueva(estado = 'open', kind = 'community') {
      const r = await getDb().execute<{ id: number }>(
        sql`insert into iniciativas(slug,title,summary,kind,status,created_by_user_id) values(${randomUUID()},${palabra},'Escuela y transporte',${kind},${estado},${usuarios[0]}) returning id`,
      );
      const id = r.rows[0]!.id;
      iniciativas.push(id);
      return id;
    }
    async function tarea(id: number, estado = 'todo', asignada: number | null = null) {
      const r = await getDb().execute<{ id: number }>(
        sql`insert into iniciativa_tasks(iniciativa_id,title,description,status,assignee_id,created_by_id,resources) values(${id},'Contrastar horarios','Consultar horarios publicados de la escuela.',${estado},${asignada},${usuarios[0]},'Horarios y planilla') returning id`,
      );
      return r.rows[0]!.id;
    }
    it('ofrece sólo tareas elegibles, busca literalmente y pagina sin repetir', async () => {
      const id = await nueva();
      const tareas = [];
      for (let n = 0; n < 22; n++) tareas.push(await tarea(id));
      await tarea(id, 'done');
      await tarea(id, 'todo', usuarios[1]);
      for (const estado of ['draft', 'paused', 'completed', 'archived'])
        await tarea(await nueva(estado));
      await tarea(await nueva('open', 'plan'));
      const a = await api
        .get('/api/iniciativas/tareas-disponibles')
        .query({ buscar: palabra })
        .expect(200);
      expect(a.headers['cache-control']).toBe('no-store');
      expect(a.body.data.items.map((t: { id: number }) => t.id)).toEqual(tareas.slice(0, 20));
      const b = await api
        .get('/api/iniciativas/tareas-disponibles')
        .query({ buscar: palabra, cursor: a.body.data.siguiente })
        .expect(200);
      expect(b.body.data.items.map((t: { id: number }) => t.id)).toEqual(tareas.slice(20));
      expect(b.body.data.siguiente).toBeNull();
      const vacia = await api
        .get('/api/iniciativas/tareas-disponibles')
        .query({ buscar: palabra + '%' })
        .expect(200);
      expect(vacia.body.data.items).toEqual([]);
      await api.get('/api/iniciativas/tareas-disponibles?cursor=-1').expect(400);
      await api.get('/api/iniciativas/tareas-disponibles?fichaId=incorrecta').expect(400);
    });
    it('lista autoría y edición aceptada, excluye invitaciones pendientes, lectoras y revocadas', async () => {
      await api.get('/api/v1/fichas/editables').expect(401);
      const a = await editables(0).expect(200);
      const b = await editables(0, { cursor: a.body.data.siguiente }).expect(200);
      expect(
        [...a.body.data.items, ...b.body.data.items].map((f: { id: string }) => f.id).sort(),
      ).toEqual([...fichas].sort());
      expect(b.body.data.siguiente).toBeNull();
      await getDb()
        .execute(sql`insert into colaboraciones(tipo,objeto,creador_id,usuario_id,codigo_hash,rol,vence_en,aceptada_en,revocada_en) values
      ('ficha',${fichas[0]}::uuid,${usuarios[0]},${usuarios[1]},${randomUUID()},'editor',now()+interval '1 day',now(),null),
      ('ficha',${fichas[1]}::uuid,${usuarios[0]},${usuarios[1]},${randomUUID()},'editor',now()+interval '1 day',null,null),
      ('ficha',${fichas[2]}::uuid,${usuarios[0]},${usuarios[1]},${randomUUID()},'editor',now()+interval '1 day',now(),now()),
      ('ficha',${fichas[3]}::uuid,${usuarios[0]},${usuarios[1]},${randomUUID()},'lector',now()+interval '1 day',now(),null)`);
      const opciones = await editables(1).expect(200);
      expect(opciones.headers['cache-control']).toBe('no-store');
      expect(opciones.body.data.items.map((f: { id: string }) => f.id)).toEqual([fichas[0]]);
      expect((await editables(2).expect(200)).body.data.items).toEqual([]);
      expect((await editables(0, { buscar: 'inexistente' }).expect(200)).body.data.items).toEqual(
        [],
      );
      await editables(0, { cursor: 'incorrecto' }).expect(400);
    });
    it('revalida permisos al vincular y conserva ficha al aceptar; una sola persona gana la aceptación', async () => {
      const id = await nueva(),
        tid = await tarea(id);
      await getDb().execute(
        sql`insert into iniciativa_members(iniciativa_id,user_id,role) values(${id},${usuarios[1]},'admin')`,
      );
      await getDb().execute(
        sql`update colaboraciones set revocada_en=now() where objeto=${fichas[0]}::uuid and usuario_id=${usuarios[1]}`,
      );
      await post(
        `/${id}/tareas/${tid}/ficha`,
        { idLocal: randomUUID(), revision: 1, fichaId: fichas[0] },
        1,
      ).expect(409);
      expect((await editables(1)).body.data.items).toEqual([]);
      await post(`/${id}/tareas/${tid}/ficha`, {
        idLocal: randomUUID(),
        revision: 1,
        fichaId: fichas[0],
      }).expect(200);
      const disponibles = await api
        .get('/api/iniciativas/tareas-disponibles')
        .query({ fichaId: fichas[0] })
        .expect(200);
      expect(disponibles.body.data.items.map((t: { id: number }) => t.id)).toContain(tid);
      const aceptar = () => ({
        idLocal: randomUUID(),
        revision: 2,
        accion: 'aceptar',
        firma: 'Participante',
        nota: 'Puedo dedicar una hora a contrastar horarios.',
      });
      await post(`/${id}/tareas/${tid}/estado`, aceptar(), 2).expect(409);
      await post(`/${id}/join`, {}, 2).expect(200);
      const resultados = await Promise.all([
        post(`/${id}/tareas/${tid}/estado`, aceptar(), 1),
        post(`/${id}/tareas/${tid}/estado`, aceptar(), 2),
      ]);
      expect(resultados.map((r) => r.status).sort()).toEqual([200, 409]);
      expect(
        (await api.get(`/api/iniciativas/${id}/tareas/${tid}/ficha`).expect(200)).body.data.fichaId,
      ).toBe(fichas[0]);
      expect(
        (
          await api
            .get('/api/iniciativas/tareas-disponibles')
            .query({ fichaId: fichas[0] })
            .expect(200)
        ).body.data.items,
      ).toEqual([]);
    });
  },
);
