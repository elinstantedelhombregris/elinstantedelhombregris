import { randomUUID } from 'node:crypto';
import { getDb, sql } from '@v2/db';
import supertest from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createApp } from '../src/app.js';
import { signAccessToken } from '../src/features/auth/tokens.js';

describe.skipIf(!process.env['DATABASE_URL_DESCARTABLE'])(
  'Administración y escucha territorial',
  () => {
    const api = supertest(createApp());
    const usuarios: { id: number; name: string; cookie: string }[] = [];
    const ids: number[] = [];
    const post = (path: string, body: object, u = 0) =>
      api
        .post('/api/iniciativas' + path)
        .set('Cookie', usuarios[u]!.cookie)
        .set('X-CSRF-Token', 'gestion')
        .send(body);
    const patch = (path: string, body: object, u = 0) =>
      api
        .patch('/api/iniciativas' + path)
        .set('Cookie', usuarios[u]!.cookie)
        .set('X-CSRF-Token', 'gestion')
        .send(body);
    const get = (path: string, u = 0) =>
      api.get('/api/iniciativas' + path).set('Cookie', usuarios[u]!.cookie);
    const nuevo = () => ({
      idLocal: randomUUID(),
      titulo: 'Aprender cerca de casa',
      resumen: 'Organizar apoyo escolar en el barrio.',
      documento: '',
      autorizoPublicacion: true,
    });
    const escucha = {
      territorioId: null,
      zona: 'Zona pública alrededor de la escuela',
      metodo: 'conversacion',
      canal: 'mixta',
      convocatoria: 'Invitar también a quienes no pueden asistir de tarde.',
      unidad: 'Tres encuentros de escucha en zona escolar',
      versionUnidad: '1',
    };
    const tarea = (hitoId: number | null = null) => ({
      idLocal: randomUUID(),
      titulo: 'Escuchar horarios de las familias',
      alcance: 'Conversar sobre horarios sin registrar nombres ni domicilios.',
      fecha: '2099-01-01',
      hitoId,
      recursos: 'Sala pendiente de confirmación',
      escucha,
      autorizoPublicacion: true,
    });
    async function crear() {
      const v = nuevo();
      const r = await post('', v).expect(201);
      ids.push(r.body.data.id as number);
      return { v, id: r.body.data.id as number, slug: r.body.data.slug as string };
    }
    beforeAll(async () => {
      for (let j = 0; j < 4; j++) {
        const name = randomUUID();
        const r = await getDb().execute<{ id: number }>(
          sql`insert into users(username,email,name,password_hash) values(${name},${name + '@test.local'},'Fixture','no-login') returning id`,
        );
        const id = r.rows[0]!.id;
        usuarios.push({
          id,
          name,
          cookie: `eihg_access=${signAccessToken({ sub: id, username: name, email: name + '@test.local' })}; eihg_csrf=gestion`,
        });
      }
    });
    afterAll(async () => {
      if (!usuarios.length) return;
      await getDb().execute(
        sql`delete from iniciativas where id in(select x::int from jsonb_array_elements_text(${JSON.stringify(ids)}::jsonb) x)`,
      );
      await getDb().execute(
        sql`delete from users where id in(select x::int from jsonb_array_elements_text(${JSON.stringify(usuarios.map((u) => u.id))}::jsonb) x)`,
      );
    });
    it('crea, edita, administra roles y transfiere propiedad solo con aceptación', async () => {
      const v = nuevo();
      await api.post('/api/iniciativas').send(v).expect(403);
      await post('', { ...v, autorizoPublicacion: false }).expect(400);
      const [a, b] = await Promise.all([post('', v), post('', v)]);
      expect([a.status, b.status]).toEqual([201, 201]);
      expect(a.body.data).toEqual(b.body.data);
      const id = a.body.data.id as number,
        slug = a.body.data.slug as string;
      ids.push(id);
      await post('', { ...v, titulo: 'Otro contenido con el mismo recibo' }).expect(409);
      let lectura = (await get('/' + slug).expect(200)).body.data;
      expect(lectura.permisos).toMatchObject({ propietario: true, miembro: true });
      await api.get('/api/iniciativas/gestionadas').expect(401);
      expect(
        (await get('/gestionadas').expect(200)).body.data.items.some(
          (i: { id: number }) => i.id === id,
        ),
      ).toBe(true);
      expect(
        (await get('/gestionadas', 1).expect(200)).body.data.items.some(
          (i: { id: number }) => i.id === id,
        ),
      ).toBe(false);
      await patch('/' + id, { ...nuevo(), revision: 1, estado: 'completed' }).expect(409);
      await patch('/' + id, { ...nuevo(), revision: 1, estado: 'open' }, 1).expect(409);
      await patch('/' + id, { ...nuevo(), revision: 1, estado: 'in_progress' }).expect(200);
      await patch('/' + id, { ...nuevo(), revision: 1, estado: 'archived' }).expect(409);
      const pares = await Promise.all([post(`/${id}/join`, {}, 1), post(`/${id}/join`, {}, 1)]);
      expect(pares.map((x) => x.status)).toEqual([200, 200]);
      expect((await get('/' + slug)).body.data.iniciativa.memberCount).toBe(2);
      expect(
        (await get('/mias', 1).expect(200)).body.data.items.some(
          (i: { id: number }) => i.id === id,
        ),
      ).toBe(true);
      await getDb().execute(
        sql`update iniciativa_members set role='member' where iniciativa_id=${id} and user_id=${usuarios[0]!.id}`,
      );
      await post(`/${id}/leave`, {}).expect(409);
      await post(`/${id}/leave`, {}, 2).expect(200);
      await post(`/${id}/leave`, {}, 2).expect(200);
      expect((await get('/' + slug)).body.data.iniciativa.memberCount).toBe(2);
      await get(`/${id}/equipo`, 1).expect(403);
      lectura = (await get('/' + slug)).body.data;
      await post(`/${id}/equipo`, {
        idLocal: randomUUID(),
        revision: lectura.iniciativa.revision,
        accion: 'rol',
        usuario: usuarios[1]!.name,
        rol: 'admin',
      }).expect(200);
      expect((await get(`/${id}/equipo`, 1).expect(200)).body.data.items).toHaveLength(2);
      let rev = (await get('/' + slug)).body.data.iniciativa.revision as number;
      await post(
        `/${id}/equipo`,
        {
          idLocal: randomUUID(),
          revision: rev,
          accion: 'proponer_traspaso',
          usuario: usuarios[1]!.name,
        },
        1,
      ).expect(409);
      await post(`/${id}/equipo`, {
        idLocal: randomUUID(),
        revision: rev,
        accion: 'proponer_traspaso',
        usuario: usuarios[1]!.name,
      }).expect(200);
      rev = (await get('/' + slug)).body.data.iniciativa.revision as number;
      await post(
        `/${id}/equipo`,
        { idLocal: randomUUID(), revision: rev, accion: 'aceptar_traspaso' },
        2,
      ).expect(409);
      await post(
        `/${id}/equipo`,
        { idLocal: randomUUID(), revision: rev, accion: 'aceptar_traspaso' },
        1,
      ).expect(200);
      expect((await get('/' + slug, 1)).body.data.permisos.propietario).toBe(true);
      expect((await get('/' + slug)).body.data.permisos.propietario).toBe(false);
      await post(`/${id}/leave`, {}).expect(200);
      await post(`/${id}/leave`, {}).expect(200);
      expect((await get('/' + slug)).body.data.iniciativa.memberCount).toBe(1);
      const historial = (await get(`/${id}/actividad`).expect(200)).body.data.items as {
        tipo: string;
      }[];
      expect(historial.filter((e) => e.tipo === 'Integrante ingresó')).toHaveLength(1);
      expect(historial.filter((e) => e.tipo === 'Integrante salió')).toHaveLength(1);
      expect(historial.some((e) => e.tipo === 'Transferencia de propiedad aceptada')).toBe(true);
    });
    it('completa escucha, evidencia, revisión independiente y retiro sin conservar datos retirados', async () => {
      const { id, slug } = await crear();
      const ingreso = await post(`/${id}/join`, {}, 1);
      expect(ingreso.status, JSON.stringify({ iniciativa: id, respuesta: ingreso.body })).toBe(200);
      await post(`/${id}/join`, {}, 2).expect(200);
      const h = {
        idLocal: randomUUID(),
        titulo: 'Revisar horarios y ausencias',
        descripcion: 'Revisar qué horarios funcionan y a quiénes faltó escuchar.',
        fecha: '2099-01-01',
        autorizoPublicacion: true,
      };
      const hid = (await post(`/${id}/hitos`, h).expect(201)).body.data.id as number;
      expect((await get(`/${id}/hitos`).expect(200)).body.data.items[0].revision).toBe(1);
      const body = tarea(hid);
      const tid = (await post(`/${id}/tareas`, body).expect(201)).body.data.id as number;
      expect((await post(`/${id}/tareas`, body).expect(201)).body.data.id).toBe(tid);
      await post(`/${id}/tareas`, {
        ...tarea(),
        escucha: { ...escucha, territorioId: 99999999 },
      }).expect(409);
      await patch(`/${id}/tareas/${tid}`, {
        ...body,
        idLocal: randomUUID(),
        revision: 1,
        recursos: 'Sala confirmada; transporte pendiente.',
      }).expect(200);
      const step = (accion: string, revision: number, u = 1) =>
        post(
          `/${id}/tareas/${tid}/estado`,
          {
            idLocal: randomUUID(),
            revision,
            accion,
            firma: 'Equipo de escucha',
            nota: 'Registro público del paso y sus condiciones.',
          },
          u,
        );
      await step('aceptar', 2, 3).expect(409);
      await step('aceptar', 2).expect(200);
      await patch(`/${id}/tareas/${tid}`, { ...body, idLocal: randomUUID(), revision: 3 }).expect(
        409,
      );
      await post(`/${id}/leave`, {}, 1).expect(409);
      await step('iniciar', 3).expect(200);
      await step('pausar', 4).expect(200);
      await step('iniciar', 5).expect(200);
      await step('realizada', 6).expect(200);
      const ev = {
        idLocal: randomUUID(),
        titulo: 'Resumen de los encuentros',
        texto: 'Escuchamos distintas necesidades de horario y quedaron preguntas pendientes.',
        url: 'https://example.org/metodo',
        resultadoEscucha: {
          desde: '2026-10-01',
          hasta: '2026-10-03',
          observaciones: 0,
          ausencias: 'Faltó escuchar a quienes trabajan de noche.',
          limites: 'Tres encuentros no describen a todo el barrio.',
          proximoPaso: 'Convocar una conversación por la mañana.',
        },
        autorizoPublicacion: true,
      };
      await post(`/${id}/tareas/${tid}/evidencias`, { ...ev, resultadoEscucha: null }, 1).expect(
        409,
      );
      await post(
        `/${id}/tareas/${tid}/evidencias`,
        { ...ev, url: 'javascript:alert(1)' },
        1,
      ).expect(400);
      const eid = (await post(`/${id}/tareas/${tid}/evidencias`, ev, 1).expect(201)).body.data
        .id as number;
      const revision = {
        idLocal: randomUUID(),
        revision: 1,
        accion: 'revisar',
        firma: 'Revisión del equipo',
        nota: 'Revisé el método y el resumen; faltan otros horarios.',
      };
      await post(`/${id}/evidencias/${eid}`, revision, 1).expect(409);
      await post(`/${id}/evidencias/${eid}`, revision).expect(409);
      await patch(`/${id}/hitos/${hid}`, {
        ...h,
        idLocal: randomUUID(),
        revision: 1,
        completado: true,
      }).expect(409);
      await post(`/${id}/evidencias/${eid}`, revision, 2).expect(200);
      await patch(`/${id}/hitos/${hid}`, {
        ...h,
        idLocal: randomUUID(),
        revision: 1,
        completado: true,
      }).expect(200);
      const rev = (await get('/' + slug)).body.data.iniciativa.revision as number;
      await patch('/' + id, { ...nuevo(), revision: rev, estado: 'completed' }).expect(200);
      const escuchas = (await get('/escuchas?estado=realizada').expect(200)).body.data.items;
      expect(escuchas.find((t: { id: number }) => t.id === tid)).toMatchObject({
        revisiones: 1,
        firma: 'Equipo de escucha',
      });
      const lect = (await get(`/${id}/tareas/${tid}/evidencias`, 2).expect(200)).body.data.items;
      expect(lect[0]).toMatchObject({ revisada: true, resultadoEscucha: { observaciones: 0 } });
      await post(
        `/${id}/evidencias/${eid}`,
        {
          idLocal: randomUUID(),
          revision: 2,
          accion: 'retirar',
          firma: '',
          nota: 'Retiro el resumen para corregir sus datos.',
        },
        1,
      ).expect(200);
      expect((await get(`/${id}/tareas/${tid}/evidencias`)).body.data.items).toHaveLength(0);
      expect((await get(`/${id}/hitos`)).body.data.items[0].completado).toBe(false);
      expect((await get('/' + slug)).body.data.iniciativa.status).toBe('in_progress');
      const borrado = await getDb().execute<{
        body: string | null;
        url: string | null;
        resultado_escucha: unknown;
        review_note: string | null;
      }>(sql`select body,url,resultado_escucha,review_note from mission_evidence where id=${eid}`);
      expect(borrado.rows[0]).toEqual({
        body: null,
        url: null,
        resultado_escucha: null,
        review_note: null,
      });
    });
    it('pagina tareas y escucha sin duplicar; no permite modificar tareas de otra iniciativa', async () => {
      const { id } = await crear();
      const otro = await crear();
      const r = await getDb().execute<{ id: number }>(
        sql`insert into iniciativa_tasks(iniciativa_id,title,description,due_date,escucha) select ${id},'Escucha local','Alcance del encuentro','2099-01-01',${JSON.stringify(escucha)}::jsonb from generate_series(1,22) returning id`,
      );
      const a = (await get(`/${id}/tareas`).expect(200)).body.data;
      expect(a.items).toHaveLength(20);
      const b = (await get(`/${id}/tareas?cursor=${a.siguiente}`).expect(200)).body.data;
      expect(b.items).toHaveLength(2);
      expect(b.siguiente).toBeNull();
      expect(
        (await get(`/${id}/tareas?tareaId=${r.rows[21]!.id}`).expect(200)).body.data.items.map(
          (t: { id: number }) => t.id,
        ),
      ).toEqual([r.rows[21]!.id]);
      await get(`/${id}/tareas?tareaId=-1`).expect(400);
      await patch(`/${otro.id}/tareas/${r.rows[0]!.id}`, { ...tarea(), revision: 1 }).expect(409);
      await get('/escuchas?cursor=-2').expect(400);
      const all = (await get('/escuchas').expect(200)).body.data;
      expect(all.items).toHaveLength(20);
      expect(all.siguiente).not.toBeNull();
    });
    it('serializa aceptación, liberación, cancelación y bajas; una iniciativa pausada no recibe nuevas aceptaciones', async () => {
      const { id, slug } = await crear();
      await post(`/${id}/join`, {}, 1).expect(200);
      await post(`/${id}/join`, {}, 2).expect(200);
      const tid = (await post(`/${id}/tareas`, tarea()).expect(201)).body.data.id as number;
      const estado = (accion: string, revision: number, u = 1) =>
        post(
          `/${id}/tareas/${tid}/estado`,
          {
            idLocal: randomUUID(),
            accion,
            revision,
            firma: 'Equipo de escucha',
            nota: 'Registrar condiciones de este paso.',
          },
          u,
        );
      let rev = (await get('/' + slug)).body.data.iniciativa.revision as number;
      await patch('/' + id, { ...nuevo(), revision: rev, estado: 'paused' }).expect(200);
      await estado('aceptar', 1).expect(409);
      expect((await get(`/${id}/tareas`, 1)).body.data.items[0].puedoAceptar).toBe(false);
      await patch('/' + id, { ...nuevo(), revision: rev + 1, estado: 'open' }).expect(200);
      const carreras = await Promise.all([estado('aceptar', 1, 1), estado('aceptar', 1, 2)]);
      expect(carreras.map((r) => r.status).sort()).toEqual([200, 409]);
      const asignado = carreras[0]!.status === 200 ? 1 : 2;
      rev = (await get('/' + slug)).body.data.iniciativa.revision as number;
      await post(`/${id}/equipo`, {
        idLocal: randomUUID(),
        revision: rev,
        accion: 'retirar',
        usuario: usuarios[asignado]!.name,
      }).expect(409);
      await estado('liberar', 2, asignado).expect(200);
      await estado('cancelar', 3, asignado).expect(409);
      await estado('cancelar', 3, 0).expect(200);
      await estado('aceptar', 4, asignado).expect(409);
      expect(
        (await get(`/${id}/actividad`)).body.data.items.some(
          (r: { nota: string | null }) => r.nota === 'Registrar condiciones de este paso.',
        ),
      ).toBe(true);
      await post(`/${id}/equipo`, {
        idLocal: randomUUID(),
        revision: rev,
        accion: 'proponer_traspaso',
        usuario: usuarios[asignado]!.name,
      }).expect(200);
      await post(`/${id}/equipo`, {
        idLocal: randomUUID(),
        revision: rev + 1,
        accion: 'cancelar_traspaso',
      }).expect(200);
      await post(
        `/${id}/equipo`,
        { idLocal: randomUUID(), revision: rev + 2, accion: 'aceptar_traspaso' },
        asignado,
      ).expect(409);
      await post(`/${id}/equipo`, {
        idLocal: randomUUID(),
        revision: rev + 2,
        accion: 'retirar',
        usuario: usuarios[asignado]!.name,
      }).expect(200);
      expect((await get('/' + slug)).body.data.iniciativa.memberCount).toBe(2);
    });
  },
);
