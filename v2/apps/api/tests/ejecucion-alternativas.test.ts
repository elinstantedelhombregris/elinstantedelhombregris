import { randomUUID } from 'node:crypto';

import { EjecucionRepository, getDb, sql } from '@v2/db';
import { limpiarFixturesIdeales } from '@v2/db/testing/limpiar-fixtures-ideales';
import { clienteHttp } from './setup/cliente-http.js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createApp } from '../src/app.js';
import { signAccessToken } from '../src/features/auth/tokens.js';

describe.skipIf(!process.env.DATABASE_URL_DESCARTABLE)('Ejecución de alternativas', () => {
  const api = clienteHttp(createApp());
  const usuarios: number[] = [];
  const cookies: string[] = [];
  let fichaId = '',
    alternativaId = '';
  const post = (path: string, body: object, quien = 0) =>
    api.post(path).set('Cookie', cookies[quien]!).set('X-CSRF-Token', 'ejecucion').send(body);
  const lectura = (quien = 0) =>
    api.get(`/api/v1/fichas/${fichaId}/diseno`).set('Cookie', cookies[quien]!);
  const vinculo = () => ({
    idLocal: randomUUID(),
    revision: 1,
    iniciativa: {
      tipo: 'nueva' as const,
      titulo: 'Aprender cerca de casa',
      resumen: 'Organizar encuentros de estudio en una sala del barrio.',
    },
    hito: 'Revisar horarios y asistencia',
    recursos: 'Sala por confirmar y dos personas disponibles.',
    autorizoPublicacion: true as const,
  });
  async function prueba() {
    const r = await post('/api/v1/fichas/pruebas', {
      idLocal: randomUUID(),
      alternativaId,
      titulo: 'Dos encuentros de apoyo escolar',
      alcance: 'Dos grupos en una sala del barrio.',
      plazo: '2099-01-01',
    }).expect(201);
    return r.body.data.id as string;
  }
  beforeAll(async () => {
    for (let n = 0; n < 3; n++) {
      const marca = randomUUID();
      const u = await getDb().execute<{ id: number }>(
        sql`insert into users(username,email,name,password_hash) values(${marca},${marca + '@test.local'},'Prueba','no-login') returning id`,
      );
      usuarios.push(u.rows[0]!.id);
      cookies.push(
        `eihg_access=${signAccessToken({ sub: u.rows[0]!.id, username: marca, email: marca + '@test.local' })}; eihg_csrf=ejecucion`,
      );
    }
    const f = await getDb().execute<{ id: string }>(
      sql`insert into fichas_futuro(creador_id,id_local,contenido) values(${usuarios[0]!},gen_random_uuid(),${JSON.stringify({ titulo: 'Aprender cerca de casa', territorioId: null, temas: [], situacion: '', futuro: 'Estudiar en comunidad', proximaTarea: 'Consultar horarios', vinculos: [] })}::jsonb) returning id`,
    );
    fichaId = f.rows[0]!.id;
    const a = await post(`/api/v1/fichas/${fichaId}/alternativas`, {
      idLocal: randomUUID(),
      titulo: 'Sala para estudiar',
      funcionamiento: 'Organizar grupos de estudio con horarios acordados.',
      resultado: 'Estudiar cerca de casa',
      dependencias: '',
      presupuesto: '',
      prueba: 'Dos encuentros de apoyo escolar',
      criterioPausa: 'Revisar si los horarios excluyen',
    }).expect(201);
    alternativaId = a.body.data.id as string;
  });
  afterAll(async () => {
    if (!usuarios.length) return;
    const U = sql`select x::int from jsonb_array_elements_text(${JSON.stringify(usuarios)}::jsonb) x`;
    await getDb().execute(sql`delete from prueba_ejecuciones where creador_id in(${U})`);
    await getDb().execute(sql`delete from iniciativas where created_by_user_id in(${U})`);
    await limpiarFixturesIdeales(getDb(), usuarios);
  });
  it('crea una sola tarea, exige aceptación personal y sincroniza hasta la revisión', async () => {
    const id = await prueba(),
      body = vinculo(),
      path = `/api/v1/fichas/pruebas/${id}/ejecucion`;
    await api.post(path).send(body).expect(403);
    await post(path, body, 2).expect(409);
    await post(path, { ...body, autorizoPublicacion: false }).expect(400);
    await post(path, { ...body, revision: 99 }).expect(409);
    const concurrencia = await Promise.all([post(path, body), post(path, body)]);
    expect(concurrencia.map((r) => r.status)).toEqual([201, 201]);
    await post(path, { ...body, recursos: 'Otros recursos con el mismo recibo' }).expect(409);
    const p = (await lectura()).body.data.pruebas.find((p: { id: string }) => p.id === id);
    const slug = p.ejecucion.iniciativa.slug as string;
    expect(p.ejecucion).toMatchObject({ estadoTarea: 'todo', revisionRealizada: false });
    const tareaId = p.ejecucion.tareaId as number;
    const tarea = () =>
      getDb().execute<{ status: string; assignee_id: number | null; completed_at: string | null }>(
        sql`select status,assignee_id,completed_at from iniciativa_tasks where id=${tareaId}`,
      );
    expect((await tarea()).rows[0]).toMatchObject({ status: 'todo', assignee_id: null });
    const i = await getDb().execute<{ id: number; member_count: number }>(
      sql`select id,member_count from iniciativas where slug=${slug}`,
    );
    const iniciativaId = i.rows[0]!.id;
    expect(i.rows[0]!.member_count).toBe(1);
    const derivadas = await api
      .get(`/api/iniciativas/${iniciativaId}/tareas`)
      .set('Cookie', cookies[0]!)
      .expect(200);
    const tareaDerivada = derivadas.body.data.items[0] as {
      id: number;
      revision: number;
      derivada: boolean;
      puedoEditar: boolean;
    };
    expect(tareaDerivada).toMatchObject({ derivada: true, puedoEditar: false });
    await post(`/api/iniciativas/${iniciativaId}/tareas/${tareaDerivada.id}/estado`, {
      idLocal: randomUUID(),
      revision: tareaDerivada.revision,
      accion: 'aceptar',
      firma: 'Equipo de apoyo',
      nota: 'Intento aceptar desde otra superficie.',
    }).expect(409);

    const accion = (estado: string, revision: number, quien: number, extra = {}) =>
      post(
        `/api/v1/fichas/pruebas/${id}/estado`,
        {
          idLocal: randomUUID(),
          revision,
          estado,
          observacion: 'Registramos la actividad y los límites de lo observado.',
          evidencia: ['https://example.org/evidencia'],
          ...extra,
        },
        quien,
      );
    await accion('aceptada', 1, 1, { firma: 'Equipo de apoyo' }).expect(403);
    await post(`/api/iniciativas/${iniciativaId}/join`, {}, 1).expect(200);
    expect(
      (await lectura(1)).body.data.pruebas.find((p: { id: string }) => p.id === id).puedoGestionar,
    ).toBe(true);
    await accion('aceptada', 1, 1, { firma: 'Equipo de apoyo' }).expect(200);
    expect((await tarea()).rows[0]).toMatchObject({ assignee_id: usuarios[1]!, status: 'todo' });
    await accion('en_curso', 1, 1).expect(409);
    await accion('en_curso', 2, 2).expect(403);
    await accion('en_curso', 2, 1).expect(200);
    expect((await tarea()).rows[0]!.status).toBe('in_progress');
    await accion('pausada', 3, 1).expect(200);
    expect((await tarea()).rows[0]!.status).toBe('blocked');
    await accion('en_curso', 4, 1).expect(200);
    await accion('implementada', 5, 1).expect(200);
    expect((await tarea()).rows[0]).toMatchObject({ status: 'done', assignee_id: usuarios[1]! });
    const leerAcciones = () => api.get(`/api/iniciativas/${slug}/acciones`).expect(200);
    expect((await leerAcciones()).body.data.items[0]).toMatchObject({
      fichaId,
      alternativaId,
      pruebaId: id,
      revisionRealizada: false,
      estado: 'implementada',
    });
    await accion('resultado_observado', 6, 1).expect(200);
    await accion('resultado_revisado', 7, 0).expect(403);
    await accion('resultado_revisado', 7, 1).expect(403);
    await accion('resultado_revisado', 7, 2).expect(200);
    const publica = (await leerAcciones()).body.data;
    expect(publica.items[0]).toMatchObject({
      revisionRealizada: true,
      estado: 'resultado_revisado',
      responsableNombre: 'Equipo de apoyo',
    });
    expect(JSON.stringify(publica)).not.toMatch(/creadorId|assignee|huella|idLocal|responsableId/);
    await post(path, body).expect(201);
    expect((await leerAcciones()).body.data.items).toHaveLength(1);
  });
  it('valida la iniciativa existente, su administración y la unicidad del vínculo', async () => {
    const r = await getDb().execute<{ slug: string; id: number }>(
      sql`insert into iniciativas(slug,title,summary,kind,created_by_user_id) values(${'test-' + randomUUID()},'Sala del barrio','Organizar actividades locales','community',${usuarios[1]!}) returning slug,id`,
    );
    const i = r.rows[0]!,
      id = await prueba(),
      body = { ...vinculo(), iniciativa: { tipo: 'existente' as const, slug: i.slug } };
    const path = `/api/v1/fichas/pruebas/${id}/ejecucion`;
    await post(path, body).expect(409);
    await getDb().execute(
      sql`insert into iniciativa_members(iniciativa_id,user_id,role) values(${i.id},${usuarios[0]!},'admin')`,
    );
    await getDb().execute(sql`update iniciativas set status='archived' where id=${i.id}`);
    await post(path, body).expect(409);
    await getDb().execute(sql`update iniciativas set status='open',kind='plan' where id=${i.id}`);
    await post(path, body).expect(409);
    await getDb().execute(sql`update iniciativas set kind='community' where id=${i.id}`);
    const respuestas = await Promise.all([
      post(path, body),
      post(path, { ...body, idLocal: randomUUID() }),
    ]);
    expect(respuestas.map((r) => r.status).sort()).toEqual([201, 409]);
    const cantidad = await getDb().execute<{ n: number }>(
      sql`select count(*)::int as n from iniciativa_tasks where iniciativa_id=${i.id}`,
    );
    expect(cantidad.rows[0]!.n).toBe(1);
    const otro = await prueba();
    // El recibo ganador se consulta para probar que no puede reutilizarse en otra prueba.
    const previo = await getDb().execute<{ id: string }>(
      sql`select id_local as id from prueba_ejecuciones where prueba_id=${id}::uuid`,
    );
    await post(`/api/v1/fichas/pruebas/${otro}/ejecucion`, {
      ...body,
      idLocal: previo.rows[0]!.id,
    }).expect(409);
    expect(
      (
        await getDb().execute<{ n: number }>(
          sql`select count(*)::int as n from iniciativa_tasks where iniciativa_id=${i.id}`,
        )
      ).rows[0]!.n,
    ).toBe(1);
  });
  it('serializa vincular y aceptar sin dejar una tarea desactualizada', async () => {
    const id = await prueba(),
      body = vinculo();
    const path = `/api/v1/fichas/pruebas/${id}/ejecucion`;
    const [vinculada, aceptada] = await Promise.all([
      post(path, body),
      post(`/api/v1/fichas/pruebas/${id}/estado`, {
        idLocal: randomUUID(),
        revision: 1,
        estado: 'aceptada',
        firma: 'Equipo del barrio',
        observacion: 'Acepto coordinar los dos encuentros de la prueba.',
        evidencia: [],
      }),
    ]);
    expect(aceptada.status).toBe(200);
    expect([201, 409]).toContain(vinculada.status);
    if (vinculada.status === 409) await post(path, { ...body, revision: 2 }).expect(201);
    const tarea = await getDb().execute<{ status: string; assignee_id: number }>(
      sql`select t.status,t.assignee_id from iniciativa_tasks t join prueba_ejecuciones e on e.tarea_id=t.id where e.prueba_id=${id}::uuid`,
    );
    expect(tarea.rows).toEqual([{ status: 'todo', assignee_id: usuarios[0] }]);
    await expect(limpiarFixturesIdeales(getDb(), usuarios)).rejects.toThrow('No borró nada');
  });

  it('pagina las acciones sin omitir ni duplicar y valida el cursor', async () => {
    const r = await getDb().execute<{ slug: string }>(
      sql`insert into iniciativas(slug,title,summary,kind,created_by_user_id) values(${'test-' + randomUUID()},'Más encuentros','Organizar actividades locales','community',${usuarios[0]!}) returning slug`,
    );
    const slug = r.rows[0]!.slug;
    const pruebas = await getDb().execute<{ id: string }>(
      sql`insert into pruebas_territoriales(alternativa_id,creador_id,id_local,titulo,alcance,plazo) select ${alternativaId}::uuid,${usuarios[0]!},gen_random_uuid(),'Encuentro de apoyo','Una sala del barrio','2099-01-01'::date from generate_series(1,22) returning id`,
    );
    for (const p of pruebas.rows)
      expect(
        await new EjecucionRepository(getDb()).vincular(p.id, usuarios[0]!, {
          ...vinculo(),
          iniciativa: { tipo: 'existente', slug },
        }),
      ).toBe(true);
    const p1 = (await api.get(`/api/iniciativas/${slug}/acciones`).expect(200)).body.data;
    expect(p1.items).toHaveLength(20);
    const p2 = (
      await api.get(`/api/iniciativas/${slug}/acciones?cursor=${p1.siguiente}`).expect(200)
    ).body.data;
    expect(p2.items).toHaveLength(2);
    expect(p2.siguiente).toBeNull();
    expect(
      new Set([...p1.items, ...p2.items].map((p: { pruebaId: string }) => p.pruebaId)).size,
    ).toBe(22);
    await api.get(`/api/iniciativas/${slug}/acciones?cursor=-1`).expect(400);
    await api.get('/api/iniciativas/no-existe/acciones').expect(404);
  });
});
