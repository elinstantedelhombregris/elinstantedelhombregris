import { randomUUID } from 'node:crypto';
import { getDb, sql } from '@v2/db';
import { limpiarFixturesIdeales } from '@v2/db/testing/limpiar-fixtures-ideales';
import { clienteHttp } from './setup/cliente-http.js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { signAccessToken } from '../src/features/auth/tokens.js';

describe.skipIf(!process.env['DATABASE_URL_DESCARTABLE'])('Campo nativo y devolución', () => {
  const api = clienteHttp(createApp()),
    users: number[] = [],
    iniciativas: number[] = [];
  let ficha = '';
  const cookie = (u = 0) =>
    `eihg_access=${signAccessToken({ sub: users[u]!, username: 'fixture', email: 'fixture@test.local' })}; eihg_csrf=campo`;
  const post = (ruta: string, body: object, u = 0) =>
    api.post(ruta).set('Cookie', cookie(u)).set('X-CSRF-Token', 'campo').send(body);
  const get = (ruta: string, u = 0) => api.get(ruta).set('Cookie', cookie(u));
  const escucha = {
    territorioId: null,
    zona: 'Entorno de escuela',
    metodo: 'conversacion',
    canal: 'presencial',
    convocatoria: 'Invitamos a conversar en distintos horarios.',
    unidad: 'Encuentros de barrio',
    versionUnidad: '1',
  };
  beforeAll(async () => {
    for (let n = 0; n < 3; n++) {
      const name = randomUUID();
      const r = await getDb().execute<{ id: number }>(
        sql`insert into users(username,email,name,password_hash) values(${name},${name + '@test.local'},'Fixture','no-login') returning id`,
      );
      users.push(r.rows[0]!.id);
    }
    const r = await getDb().execute<{ id: string }>(
      sql`insert into fichas_futuro(creador_id,id_local,contenido) values(${users[0]},gen_random_uuid(),'{}'::jsonb) returning id`,
    );
    ficha = r.rows[0]!.id;
    await getDb().execute(
      sql`insert into seguimientos(user_id,tipo,objeto) values(${users[1]},'ficha',${ficha}),(${users[2]},'ficha',${ficha})`,
    );
    await getDb().execute(
      sql`insert into preferencias_civicas(user_id,avisos) values(${users[2]},false)`,
    );
  });
  afterAll(async () => {
    await getDb().execute(
      sql`delete from iniciativas where id in(select x::int from jsonb_array_elements_text(${JSON.stringify(iniciativas)}::jsonb) x)`,
    );
    await limpiarFixturesIdeales(getDb(), users);
  });
  async function tarea() {
    const i = await getDb().execute<{ id: number }>(
      sql`insert into iniciativas(slug,title,summary,kind,created_by_user_id) values(${randomUUID()},'Escucha nativa','Escucha sobre horarios escolares','community',${users[0]}) returning id`,
    );
    const id = i.rows[0]!.id;
    iniciativas.push(id);
    await getDb().execute(
      sql`insert into iniciativa_members(iniciativa_id,user_id,role) values(${id},${users[1]},'member')`,
    );
    const t = await getDb().execute<{ id: number }>(
      sql`insert into iniciativa_tasks(iniciativa_id,title,description,status,assignee_id,created_by_id,escucha) values(${id},'Escuchar horarios','Encuentros en distintos horarios','in_progress',${users[0]},${users[0]},${JSON.stringify(escucha)}::jsonb) returning id`,
    );
    return { id, tid: t.rows[0]!.id, ruta: `/api/iniciativas/${id}/tareas/${t.rows[0]!.id}` };
  }
  const sobre = (revisionTarea = 2) => ({
    idLocal: randomUUID(),
    usuarioId: users[0],
    revisionTarea,
    declaroRealizada: true,
    autorizoPublicacion: true,
    titulo: 'Horarios de salida',
    texto: 'Dos encuentros muestran dificultades en la salida escolar.',
    url: null,
    resultadoEscucha: {
      desde: '2026-10-01',
      hasta: '2026-10-02',
      observaciones: 2,
      ausencias: 'Faltaron trabajadores nocturnos.',
      limites: 'Dos encuentros no representan a todas las familias.',
      proximoPaso: 'Escuchar en horarios de mañana.',
    },
  });
  async function dispositivo(u = 0) {
    return (
      await post(
        '/api/campo/dispositivos',
        { nombre: 'Teléfono fixture', usuarioId: users[u] },
        u,
      ).expect(201)
    ).body.data as { id: string; token: string };
  }
  it('vincula con CSRF, guarda sólo hash y limita la credencial a tareas propias; revoca y vence', async () => {
    await api
      .post('/api/campo/dispositivos')
      .set('Cookie', cookie())
      .send({ nombre: 'Sin CSRF' })
      .expect(403);
    await post('/api/campo/dispositivos', {
      nombre: 'Cuenta cambiada',
      usuarioId: users[1],
    }).expect(403);
    const d = await dispositivo();
    const t = await tarea();
    const row = (
      await getDb().execute<{ huella: string }>(
        sql`select huella from dispositivos_campo where id=${d.id}::uuid`,
      )
    ).rows[0]!;
    expect(row.huella).not.toBe(d.token);
    const listado = await get('/api/campo/dispositivos').expect(200);
    expect(JSON.stringify(listado.body)).not.toContain(d.token);
    await api.get('/api/campo-nativo/tareas').set('Cookie', cookie()).expect(401);
    const p = await api
      .get('/api/campo-nativo/tareas')
      .auth(d.token, { type: 'bearer' })
      .expect(200);
    expect(p.body.data.items.some((x: { id: number }) => x.id === t.tid)).toBe(true);
    const ajeno = await dispositivo(1);
    expect(
      (await api.get('/api/campo-nativo/tareas').auth(ajeno.token, { type: 'bearer' })).body.data
        .items,
    ).toHaveLength(0);
    await api
      .post('/api/campo-nativo/iniciativas/' + t.id + '/tareas/' + t.tid + '/campo')
      .auth(ajeno.token, { type: 'bearer' })
      .send(sobre(1))
      .expect(403);
    await api
      .post('/api/campo-nativo/iniciativas/' + t.id + '/tareas/' + t.tid + '/campo')
      .auth(ajeno.token, { type: 'bearer' })
      .send({ ...sobre(1), usuarioId: users[1] })
      .expect(409);
    await api.get('/api/iniciativas/mias').auth(d.token, { type: 'bearer' }).expect(401);
    await api
      .delete('/api/campo/dispositivos/' + d.id)
      .set('Cookie', cookie(1))
      .set('X-CSRF-Token', 'campo')
      .expect(404);
    await api
      .delete('/api/campo/dispositivos/' + d.id)
      .set('Cookie', cookie())
      .set('X-CSRF-Token', 'campo')
      .expect(200);
    await api.get('/api/campo-nativo/tareas').auth(d.token, { type: 'bearer' }).expect(401);
    await getDb().execute(
      sql`update dispositivos_campo set expira=now()-interval '1 second' where id=${ajeno.id}::uuid`,
    );
    await api.get('/api/campo-nativo/tareas').auth(ajeno.token, { type: 'bearer' }).expect(401);
  });
  it('devuelve evidencia, deduplica recibos y avisos, revisa y retira sin conservar el texto en la ficha', async () => {
    const t = await tarea(),
      d = await dispositivo(),
      v = { idLocal: randomUUID(), revision: 1, fichaId: ficha };
    await post(t.ruta + '/ficha', v, 1).expect(409);
    await post(t.ruta + '/ficha', v).expect(200);
    await post(t.ruta + '/ficha', v).expect(200);
    expect((await get(t.ruta + '/ficha')).body.data.fichaId).toBe(ficha);
    const paquete = await api
      .get('/api/campo-nativo/tareas')
      .auth(d.token, { type: 'bearer' })
      .expect(200);
    expect(paquete.body.data.items.find((x: { id: number }) => x.id === t.tid)).toMatchObject({
      fichaId: ficha,
      revision: 2,
    });
    const ruta = `/api/campo-nativo/iniciativas/${t.id}/tareas/${t.tid}/campo`,
      envio = sobre();
    await api
      .post(ruta)
      .auth(d.token, { type: 'bearer' })
      .send({ ...envio, notas: 'Privadas' })
      .expect(400);
    await api
      .post(ruta)
      .auth(d.token, { type: 'bearer' })
      .send({ ...envio, revisionTarea: 1 })
      .expect(409);
    const r = await api.post(ruta).auth(d.token, { type: 'bearer' }).send(envio).expect(201);
    const eid = r.body.data.id as number;
    expect(
      (await api.post(ruta).auth(d.token, { type: 'bearer' }).send(envio).expect(201)).body.data.id,
    ).toBe(eid);
    const resultados = '/api/fichas/' + ficha + '/resultados-campo';
    expect(
      (await api.get(resultados)).body.data.items.find((x: { id: number }) => x.id === eid),
    ).toMatchObject({ texto: envio.texto, revisada: false, retirada: false });
    await post(t.ruta + '/ficha', {
      ...v,
      idLocal: randomUUID(),
      revision: 3,
      fichaId: null,
    }).expect(409);
    await post(
      `/api/iniciativas/${t.id}/evidencias/${eid}`,
      {
        idLocal: randomUUID(),
        revision: 1,
        accion: 'revisar',
        firma: 'Revisora independiente',
        nota: 'Se revisaron los límites y faltan horarios nocturnos.',
      },
      1,
    ).expect(200);
    expect(
      (await api.get(resultados)).body.data.items.find((x: { id: number }) => x.id === eid)
        .revisada,
    ).toBe(true);
    const estado = await api
      .get('/api/campo-nativo/evidencias/' + eid)
      .auth(d.token, { type: 'bearer' })
      .expect(200);
    expect(estado.body.data.revision).toBe(2);
    const ajeno = await dispositivo(1);
    await api
      .get('/api/campo-nativo/evidencias/' + eid)
      .auth(ajeno.token, { type: 'bearer' })
      .expect(404);
    const retiro = {
      idLocal: randomUUID(),
      revision: 2,
      accion: 'retirar',
      firma: '',
      nota: 'Retiro el resumen desde mi cuaderno.',
    };
    const rutaRetiro = `/api/campo-nativo/iniciativas/${t.id}/evidencias/${eid}/retirar`;
    await api.post(rutaRetiro).auth(ajeno.token, { type: 'bearer' }).send(retiro).expect(409);
    await api.post(rutaRetiro).auth(d.token, { type: 'bearer' }).send(retiro).expect(200);
    await api.post(rutaRetiro).auth(d.token, { type: 'bearer' }).send(retiro).expect(200);
    await api.post(ruta).auth(d.token, { type: 'bearer' }).send(envio).expect(201);
    const final = (await api.get(resultados)).body.data;
    expect(JSON.stringify(final)).not.toContain(envio.texto);
    expect(final.items.find((x: { id: number }) => x.id === eid)).toMatchObject({
      texto: null,
      titulo: '',
      resultadoEscucha: null,
      retirada: true,
    });
    const avisos = (
      await getDb().execute<{ user_id: number; titulo: string }>(
        sql`select user_id,titulo from eventos_civicos where clave like ${'campo:' + eid + ':%'} order by creada_en`,
      )
    ).rows;
    expect(avisos).toHaveLength(3);
    expect(avisos.every((a) => a.user_id === users[1])).toBe(true);
    expect(JSON.stringify(avisos)).not.toContain(envio.texto);
  });
});
