import { randomUUID } from 'node:crypto';

import { getDb, sql } from '@v2/db';
import { limpiarFixturesIdeales } from '@v2/db/testing/limpiar-fixtures-ideales';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createApp } from '../src/app.js';
import { signAccessToken } from '../src/features/auth/tokens.js';

import { clienteHttp } from './setup/cliente-http.js';

describe.skipIf(!process.env.DATABASE_URL_DESCARTABLE)(
  'Síntesis nacional con revisión y retiros',
  () => {
    const api = clienteHttp(createApp()),
      users: number[] = [];
    let ficha = '',
      objetivo = randomUUID();
    const cookie = (u = 0) =>
      `eihg_access=${signAccessToken({ sub: users[u]!, username: 'test', email: 'test@test.local' })}; eihg_csrf=sintesis`;
    const post = (ruta: string, body: object, u = 0) =>
      api.post(ruta).set('Cookie', cookie(u)).set('X-CSRF-Token', 'sintesis').send(body);
    const base = '/api/v1/sintesis-nacional';
    const contenido = () => ({
      titulo: 'Agua continua para las zonas participantes',
      alcance: 'Una selección de los equipos de las fichas.',
      metodo: 'Contraste de fuentes y revisión de otra persona.',
      ausencias: 'Falta escuchar a quienes trabajan en otros horarios.',
      criterio: 'Se explicita la gravedad sin ordenar por popularidad.',
      proximaRevision: '2099-01-01',
      referencias: [
        {
          fichaId: ficha,
          revision: 1,
          objetivoId: objetivo,
          tipo: 'propuesta',
          resultadoCampo: null,
          variantes: 'La conexión y la continuidad son problemas distintos.',
          recursos: 'Falta presupuestar las alternativas locales.',
          alternativas: 'Medir cortes y después comparar alternativas.',
          tensiones: 'Algunas zonas pueden quedar postergadas.',
          tarea: 'Invitar en otros horarios y revisar los resultados.',
        },
      ],
    });
    const envio = () => ({ idLocal: randomUUID(), anteriorId: null, contenido: contenido() });
    const actuar = (id: string, accion = 'revisar', u = 1) =>
      post(`${base}/${id}/acciones`, { accion }, u);
    beforeAll(async () => {
      for (let j = 0; j < 3; j++) {
        const nombre = randomUUID();
        const r = await getDb().execute<{ id: number }>(
          sql`insert into users(username,email,name,password_hash) values(${nombre},${nombre + '@test.local'},'Fixture','no-login') returning id`,
        );
        users.push(r.rows[0]!.id);
      }
      const r = await getDb().execute<{ id: string }>(
        sql`insert into fichas_futuro(creador_id,id_local,contenido) values(${users[0]},gen_random_uuid(),${JSON.stringify({ titulo: 'Agua de prueba', cuaderno: { objetivos: [{ id: objetivo, titulo: 'Reducir cortes', resultado: 'Tener continuidad del servicio', fuenteIds: [] }], fuentes: [] }, vinculos: [] })}::jsonb) returning id`,
      );
      ficha = r.rows[0]!.id;
      await getDb().execute(
        sql`insert into colaboraciones(tipo,objeto,creador_id,usuario_id,codigo_hash,rol,vence_en,aceptada_en) values('ficha',${ficha}::uuid,${users[0]},${users[1]},${randomUUID()},'editor','2099-01-01',now())`,
      );
    });
    afterAll(async () => {
      await getDb().execute(sql`delete from sintesis_nacionales where autor_id=${users[0]}`);
      await limpiarFixturesIdeales(getDb(), users);
    });
    it('requiere sesión y CSRF, guarda con recibo y oculta borradores ajenos', async () => {
      const v = envio();
      await api.post(base).send(v).expect(403);
      await post(base, v, 2).expect(409);
      const r = await post(base, v).expect(201);
      const id = r.body.data.id;
      expect((await post(base, v).expect(201)).body.data.id).toBe(id);
      await post(base, {
        ...v,
        contenido: { ...v.contenido, titulo: 'Texto distinto con el mismo recibo' },
      }).expect(409);
      await api.get(`${base}/${id}`).expect(404);
      await api.get(`${base}/${id}`).set('Cookie', cookie(2)).expect(404);
      await actuar(id, 'revisar', 0).expect(409);
      await actuar(id, 'revisar', 2).expect(409);
      expect(
        (await api.get(`${base}/${id}`).set('Cookie', cookie(1)).expect(200)).body.data
          .puedoRevisar,
      ).toBe(true);
      await actuar(id).expect(200);
      const leida = await api.get(`${base}/${id}`).expect(200);
      expect(leida.headers['cache-control']).toBe('no-store');
      expect(leida.body.data.estado).toBe('revisada');
      expect(leida.body.data.apoyos[0].objetivoId).toBe(objetivo);
      expect(
        (await api.get(base).expect(200)).body.data.ediciones.some(
          (e: { id: string }) => e.id === id,
        ),
      ).toBe(true);
      await actuar(id, 'retirar', 2).expect(409);
      await actuar(id, 'retirar').expect(200);
      const retirada = (await api.get(`${base}/${id}`).expect(200)).body.data;
      expect(retirada).toMatchObject({ estado: 'retirada', contenido: null, apoyos: [] });
      expect(JSON.stringify(retirada)).not.toContain(v.contenido.titulo);
    });
    it('no acepta objetivos inexistentes, revisiones viejas, falsos acuerdos ni campo sin verificar', async () => {
      for (const cambio of [
        { revision: 999 },
        { objetivoId: randomUUID() },
        { tipo: 'acuerdo_participantes' },
        { tipo: 'hecho_revisado', resultadoCampo: { id: 99999999, revision: 1 } },
      ]) {
        const v = envio();
        v.contenido.referencias[0] = {
          ...v.contenido.referencias[0]!,
          ...cambio,
        } as (typeof v.contenido.referencias)[number];
        await post(base, v).expect(409);
      }
      const v = envio();
      v.contenido.proximaRevision = '2000-01-01';
      const id = (await post(base, v).expect(201)).body.data.id;
      await actuar(id).expect(409);
    });
    it('redacta edición, listado y nueva lectura tras cambiar una ficha', async () => {
      const id = (await post(base, envio()).expect(201)).body.data.id;
      await actuar(id).expect(200);
      await getDb().execute(
        sql`update fichas_futuro set revision=revision+1 where id=${ficha}::uuid`,
      );
      const leida = (await api.get(`${base}/${id}`).expect(200)).body.data;
      expect(leida).toMatchObject({ estado: 'requiere_revision', contenido: null, apoyos: [] });
      const list = (await api.get(base).expect(200)).body.data.ediciones.find(
        (e: { id: string }) => e.id === id,
      );
      expect(list.contenido).toBeNull();
      await getDb().execute(sql`update fichas_futuro set revision=1 where id=${ficha}::uuid`);
    });
    it('retirar un argumento invalida la lectura aunque no cambie la revisión de la ficha', async () => {
      const a = await getDb().execute<{ id: string }>(
        sql`insert into ficha_argumentos(ficha_id,autor_id,id_local,huella,tipo,texto,firma,fuente_ids) values(${ficha}::uuid,${users[0]},gen_random_uuid(),'fixture','argumento','Texto que será retirado','Fixture','[]'::jsonb) returning id`,
      );
      await getDb().execute(
        sql`update fichas_futuro set contenido=contenido || ${JSON.stringify({ proceso: {}, sintesis: { estado: 'publicada', acuerdos: [{ texto: 'Acuerdo del proceso', argumentoIds: [a.rows[0]!.id] }] } })}::jsonb where id=${ficha}::uuid`,
      );
      const v = envio();
      v.contenido.referencias[0]!.tipo = 'acuerdo_participantes';
      const id = (await post(base, v).expect(201)).body.data.id;
      await actuar(id).expect(200);
      await post(`/api/v1/fichas/argumentos/${a.rows[0]!.id}/retiro`, { motivo: 'autoria' }).expect(
        200,
      );
      expect((await api.get(`${base}/${id}`).expect(200)).body.data).toMatchObject({
        estado: 'requiere_revision',
        contenido: null,
        apoyos: [],
      });
      await getDb().execute(
        sql`update fichas_futuro set contenido=contenido-'sintesis'-'proceso' where id=${ficha}::uuid`,
      );
    });
    it('comprueba la revisión ajena del resultado y redacta cuando se retira', async () => {
      const ini = await getDb().execute<{ id: number }>(
        sql`insert into iniciativas(slug,title,summary,kind,created_by_user_id) values(${randomUUID()},'Escucha fixture','Descripción de la escucha','community',${users[0]}) returning id`,
      );
      const iid = ini.rows[0]!.id;
      try {
        const tarea = await getDb().execute<{ id: number }>(
          sql`insert into iniciativa_tasks(iniciativa_id,title,description,created_by_id) values(${iid},'Escucha fixture','Descripción de la tarea',${users[0]}) returning id`,
        );
        const tid = tarea.rows[0]!.id;
        await getDb().execute(
          sql`insert into tareas_fichas(tarea_id,ficha_id) values(${tid},${ficha}::uuid)`,
        );
        const ev = await getDb().execute<{ id: number }>(
          sql`insert into mission_evidence(iniciativa_id,task_id,submitted_by,kind,title,body,is_verified,verified_by) values(${iid},${tid},${users[0]},'text','Encuentros realizados','Resumen público de los encuentros',true,${users[0]}) returning id`,
        );
        const eid = ev.rows[0]!.id;
        const v = {
          ...envio(),
          contenido: {
            ...contenido(),
            referencias: contenido().referencias.map((r) => ({
              ...r,
              tipo: 'hecho_revisado',
              resultadoCampo: { id: eid, revision: 1 },
            })),
          },
        };
        await post(base, v).expect(409);
        await getDb().execute(
          sql`update mission_evidence set verified_by=${users[1]} where id=${eid}`,
        );
        const id = (await post(base, v).expect(201)).body.data.id;
        await actuar(id).expect(200);
        expect(
          (await api.get(`${base}/${id}`).expect(200)).body.data.apoyos[0].resultado.texto,
        ).toBe('Resumen público de los encuentros');
        await getDb().execute(
          sql`update mission_evidence set withdrawn_at=now(),revision=revision+1,body=null where id=${eid}`,
        );
        expect((await api.get(`${base}/${id}`).expect(200)).body.data).toMatchObject({
          estado: 'requiere_revision',
          contenido: null,
          apoyos: [],
        });
      } finally {
        await getDb().execute(sql`delete from iniciativas where id=${iid}`);
      }
    });
    it('serializa la revisión y recupera el mismo envío concurrente', async () => {
      const v = envio();
      const creaciones = await Promise.all([post(base, v), post(base, v)]);
      expect(creaciones.map((r) => r.status)).toEqual([201, 201]);
      expect(creaciones[0]!.body.data.id).toBe(creaciones[1]!.body.data.id);
      const id = creaciones[0]!.body.data.id;
      await getDb().execute(
        sql`insert into colaboraciones(tipo,objeto,creador_id,usuario_id,codigo_hash,rol,vence_en,aceptada_en) values('ficha',${ficha}::uuid,${users[0]},${users[2]},${randomUUID()},'editor','2099-01-01',now())`,
      );
      const revisiones = await Promise.all([actuar(id, 'revisar', 1), actuar(id, 'revisar', 2)]);
      expect(revisiones.map((r) => r.status).sort()).toEqual([200, 409]);
    });

    it('invalida una edición si cambia la unidad territorial citada', async () => {
      const g = await getDb().execute<{ id: number }>(
        sql`insert into geographic_locations(level,name,georef_id,province_id) values('locality','Lugar de prueba',${'fixture-' + randomUUID()},(select id from geographic_locations where georef_id='06')) returning id`,
      );
      const gid = g.rows[0]!.id;
      try {
        await getDb().execute(
          sql`update fichas_futuro set territorio_id=${gid} where id=${ficha}::uuid`,
        );
        const id = (await post(base, envio()).expect(201)).body.data.id;
        await actuar(id).expect(200);
        const antes = (await api.get(`${base}/${id}`).expect(200)).body.data;
        expect(antes.versionCenso).toBe('indec-c2022-codigos-20261015-r1');
        expect(antes.versionGeo).toMatch(/^ign-/);
        await getDb().execute(
          sql`update geographic_locations set name='Nombre cambiado' where id=${gid}`,
        );
        expect((await api.get(`${base}/${id}`).expect(200)).body.data).toMatchObject({
          estado: 'requiere_revision',
          contenido: null,
          apoyos: [],
        });
      } finally {
        await getDb().execute(
          sql`update fichas_futuro set territorio_id=null where id=${ficha}::uuid`,
        );
        await getDb().execute(sql`delete from geographic_locations where id=${gid}`);
      }
    });
  },
);
