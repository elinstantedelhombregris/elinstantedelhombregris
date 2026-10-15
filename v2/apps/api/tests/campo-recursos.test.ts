import { randomUUID } from 'node:crypto';
import { getDb, sql } from '@v2/db';
import { limpiarFixturesIdeales } from '@v2/db/testing/limpiar-fixtures-ideales';
import { clienteHttp } from './setup/cliente-http.js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createApp } from '../src/app.js';
import { signAccessToken } from '../src/features/auth/tokens.js';

describe.skipIf(!process.env['DATABASE_URL_DESCARTABLE'])(
  'Recursos de tareas y envío de campo',
  () => {
    const api = clienteHttp(createApp());
    const users: number[] = [],
      iniciativas: number[] = [];
    let capacidad = '',
      ficha = '';
    const cookie = (u = 0) =>
      `eihg_access=${signAccessToken({ sub: users[u]!, username: 'test', email: 'test@test.local' })}; eihg_csrf=campo`;
    const post = (ruta: string, body: object, u = 0) =>
      api.post(ruta).set('Cookie', cookie(u)).set('X-CSRF-Token', 'campo').send(body);
    const get = (ruta: string, u = 0) => api.get(ruta).set('Cookie', cookie(u));
    const escucha = {
      territorioId: null,
      zona: 'Zona de la escuela',
      metodo: 'conversacion',
      canal: 'presencial',
      convocatoria: 'Invitar en varios horarios sin pedir datos personales.',
      unidad: 'Encuentros en zona escolar',
      versionUnidad: '1',
    };
    beforeAll(async () => {
      for (let j = 0; j < 3; j++) {
        const name = randomUUID();
        const r = await getDb().execute<{ id: number }>(
          sql`insert into users(username,email,name,password_hash) values(${name},${name + '@test.local'},'Fixture','no-login') returning id`,
        );
        users.push(r.rows[0]!.id);
      }
      const s = await getDb().execute<{ id: string }>(
        sql`insert into senales(tipo,clase,texto,origen,id_local,user_id,estado) values('recurso','hecho','Sala para encuentros','web',gen_random_uuid(),${users[1]},'por_verificar') returning id_publico as id`,
      );
      const f = await getDb().execute<{ id: string }>(
        sql`insert into fichas_futuro(creador_id,id_local,contenido) values(${users[0]},gen_random_uuid(),'{}'::jsonb) returning id`,
      );
      ficha = f.rows[0]!.id;
      const c = await getDb().execute<{ id: string }>(
        sql`insert into capacidades(senal_id,oferente_id,id_local,huella,titulo,tipo,unidad,cantidad,desde,hasta,zona,restricciones,firma) values(${s.rows[0]!.id}::uuid,${users[1]},gen_random_uuid(),'fixture','Sala para escuchar','espacio','horas',100,current_date,'2099-01-01','Zona escolar','Acordar horario','Espacio fixture') returning id`,
      );
      capacidad = c.rows[0]!.id;
    });
    afterAll(async () => {
      await getDb().execute(
        sql`delete from iniciativas where id in(select x::int from jsonb_array_elements_text(${JSON.stringify(iniciativas)}::jsonb) x)`,
      );
      await limpiarFixturesIdeales(getDb(), users);
    });
    async function tarea(estado = 'in_progress') {
      const i = await getDb().execute<{ id: number }>(
        sql`insert into iniciativas(slug,title,summary,kind,created_by_user_id) values(${randomUUID()},'Escucha fixture','Escucha en horarios diversos','community',${users[0]}) returning id`,
      );
      const id = i.rows[0]!.id;
      iniciativas.push(id);
      const t = await getDb().execute<{ id: number }>(
        sql`insert into iniciativa_tasks(iniciativa_id,title,description,status,assignee_id,created_by_id,escucha) values(${id},'Escuchar horarios','Conversar en horarios diversos',${estado},${users[0]},${users[0]},${JSON.stringify(escucha)}::jsonb) returning id`,
      );
      return { id, tid: t.rows[0]!.id, ruta: `/api/iniciativas/${id}/tareas/${t.rows[0]!.id}` };
    }
    async function reserva(estado = 'reservada') {
      const r = await getDb().execute<{ id: string }>(
        sql`insert into reservas_capacidad(capacidad_id,solicitante_id,ficha_id,id_local,huella,cantidad,para_fecha,necesidad,compatibilidad,estado) values(${capacidad}::uuid,${users[0]},${ficha}::uuid,gen_random_uuid(),'fixture',6,current_date,'Seis horas para escuchar','Por la tarde',${estado}) returning id`,
      );
      return r.rows[0]!.id;
    }
    const vinculo = (reservaId: string) => ({
      idLocal: randomUUID(),
      reservaId,
      revisionReserva: 1,
      revisionTarea: 1,
      accion: 'vincular',
    });
    const envio = () => ({
      idLocal: randomUUID(),
      usuarioId: users[0],
      revisionTarea: 1,
      declaroRealizada: true,
      titulo: 'Horarios que faltan',
      texto: 'Hicimos dos encuentros y quedaron otros horarios por escuchar.',
      url: null,
      autorizoPublicacion: true,
      resultadoEscucha: {
        desde: '2026-10-01',
        hasta: '2026-10-02',
        observaciones: 2,
        ausencias: 'Faltaron quienes trabajan de noche.',
        limites: 'Dos encuentros no describen a toda la zona.',
        proximoPaso: 'Invitar a conversar por la mañana.',
      },
    });
    it('solo las partes leen; requiere derechos sobre reserva y tarea; conserva stock y lectura parcial', async () => {
      const t = await tarea(),
        r = await reserva(),
        v = vinculo(r);
      await api.get(t.ruta + '/recursos').expect(401);
      await get(t.ruta + '/recursos?despues=invalido').expect(400);
      await post(t.ruta + '/recursos', v, 1).expect(409);
      await post(t.ruta + '/recursos', v, 2).expect(409);
      await post(t.ruta + '/recursos', { ...v, revisionTarea: 999 }).expect(409);
      await post(t.ruta + '/recursos', v).expect(200);
      await post(t.ruta + '/recursos', v).expect(200);
      expect((await get(t.ruta + '/recursos', 1)).body.data.items).toHaveLength(1);
      expect((await get(t.ruta + '/recursos', 2)).body.data.items).toHaveLength(0);
      expect(
        (await get(t.ruta + '/recursos?disponibles=si')).body.data.items.find(
          (x: { id: string }) => x.id === r,
        ),
      ).toBeUndefined();
      const cap = (await get('/api/v1/capacidades/' + capacidad)).body.data;
      expect(cap.reservas.find((x: { id: string }) => x.id === r).tareaVinculada.id).toBe(t.tid);
      const antes = cap.capacidad.disponible as number;
      await post(
        `/api/v1/capacidades/${capacidad}/reservas/${r}/estado`,
        {
          accion: 'declarar_entrega',
          revisionEsperada: 2,
          nota: 'Se usaron cuatro horas de sala.',
          cantidadEntregada: 4,
        },
        1,
      ).expect(200);
      await post(`/api/v1/capacidades/${capacidad}/reservas/${r}/estado`, {
        accion: 'confirmar_recepcion',
        revisionEsperada: 3,
      }).expect(200);
      expect((await get(t.ruta + '/recursos')).body.data.items[0]).toMatchObject({
        estado: 'entregada',
        cantidadDeclarada: 4,
        cantidad: 6,
      });
      expect((await get('/api/v1/capacidades/' + capacidad)).body.data.capacidad.disponible).toBe(
        antes + 2,
      );
      expect((await get(`/api/iniciativas/${t.id}/tareas`)).body.data.items[0].estado).toBe(
        'in_progress',
      );
      expect((await get(`/api/iniciativas/${t.id}/actividad`)).body.data.items).toHaveLength(0);
      await post(t.ruta + '/recursos', {
        ...v,
        idLocal: randomUUID(),
        revisionReserva: 4,
        accion: 'desvincular',
      }).expect(200);
      expect((await get('/api/v1/capacidades/' + capacidad)).body.data.capacidad.disponible).toBe(
        antes + 2,
      );
    });
    it('serializa dos destinos y no acepta propuestas, reservas canceladas ni tareas terminadas', async () => {
      const a = await tarea(),
        b = await tarea(),
        r = await reserva();
      const resultados = await Promise.all([
        post(a.ruta + '/recursos', vinculo(r)),
        post(b.ruta + '/recursos', vinculo(r)),
      ]);
      expect(resultados.map((x) => x.status).sort()).toEqual([200, 409]);
      const v = vinculo(await reserva('propuesta'));
      await post(a.ruta + '/recursos', v).expect(409);
      await post(a.ruta + '/recursos', vinculo(await reserva('cancelada'))).expect(409);
      const final = await tarea('done');
      await post(final.ruta + '/recursos', vinculo(await reserva())).expect(409);
    });
    it('publica campo atómicamente una sola vez y nunca acepta notas privadas ni otra cuenta', async () => {
      const t = await tarea(),
        v = envio();
      await api
        .post(t.ruta + '/campo')
        .send(v)
        .expect(403);
      await post(t.ruta + '/campo', v, 1).expect(403);
      await post(t.ruta + '/campo', { ...v, usuarioId: users[1] }, 1).expect(409);
      await post(t.ruta + '/campo', { ...v, notas: 'Dato privado' }).expect(400);
      await post(t.ruta + '/campo', { ...v, autorizoPublicacion: false }).expect(400);
      await post(t.ruta + '/campo', { ...v, revisionTarea: 9 }).expect(409);
      expect((await get(`/api/iniciativas/${t.id}/tareas`)).body.data.items[0].estado).toBe(
        'in_progress',
      );
      const r = await Promise.all([post(t.ruta + '/campo', v), post(t.ruta + '/campo', v)]);
      expect(r.map((x) => x.status)).toEqual([201, 201]);
      expect(r[0]!.body.data).toEqual(r[1]!.body.data);
      await post(t.ruta + '/campo', {
        ...v,
        texto: 'Contenido distinto con un recibo ya utilizado.',
      }).expect(409);
      expect((await get(t.ruta + '/evidencias')).body.data.items).toHaveLength(1);
      expect((await get(t.ruta + '/evidencias')).body.data.items[0].revisada).toBe(false);
      expect((await get(`/api/iniciativas/${t.id}/tareas`)).body.data.items[0]).toMatchObject({
        estado: 'done',
        revision: 2,
      });
      // Un reintento posterior a pausa de la iniciativa aún reconoce el recibo previo.
      await getDb().execute(sql`update iniciativas set status='paused' where id=${t.id}`);
      await post(t.ruta + '/campo', v).expect(201);
    });
  },
);
