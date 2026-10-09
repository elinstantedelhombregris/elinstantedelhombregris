import { randomUUID } from 'node:crypto';

import { eq, getDb, senales, sql } from '@v2/db';
import supertest from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createApp } from '../src/app.js';
import { signAccessToken } from '../src/features/auth/tokens.js';

const habilitada = Boolean(process.env['DATABASE_URL_DESCARTABLE']);
describe.skipIf(!habilitada)('Luz: titularidad conocida y retiro con Postgres', () => {
  const request = supertest(createApp());
  const marca = randomUUID();
  const creadas: string[] = [];
  let provincia = 0;
  let usuario = 0;
  let cuenta = '';
  let invitado = 'eihg_csrf=luz-titularidad';

  beforeAll(async () => {
    const u = await getDb().execute<{
      id: number;
    }>(sql`insert into users(username,email,name,password_hash)
      values (${marca},${marca + '@test.local'},'Prueba de titularidad','no-login') returning id`);
    usuario = u.rows[0]!.id;
    cuenta = `eihg_access=${signAccessToken({ sub: usuario, username: marca, email: marca + '@test.local' })}; eihg_csrf=luz-titularidad`;
    const p = await getDb().execute<{
      id: number;
    }>(sql`with clave as (select nextval('geographic_locations_id_seq')::int id)
      insert into geographic_locations(id,province_id,level,name,georef_id)
      select id,id,'province',${'Provincia de prueba ' + marca},${'test-luz-' + marca} from clave returning id`);
    provincia = p.rows[0]!.id;
  });

  afterAll(async () => {
    if (creadas.length) {
      const actores = await getDb().execute<{
        id: number;
      }>(sql`select distinct actor_id as id from senales
        where id_publico in (${sql.join(
          creadas.map((id) => sql`${id}::uuid`),
          sql`,`,
        )}) and actor_id is not null`);
      await getDb().execute(
        sql`delete from senales where id_publico in (${sql.join(
          creadas.map((id) => sql`${id}::uuid`),
          sql`,`,
        )})`,
      );
      if (actores.rows.length)
        await getDb().execute(
          sql`delete from actores where id in (${sql.join(
            actores.rows.map((a) => sql`${a.id}`),
            sql`,`,
          )})`,
        );
    }
    if (usuario) {
      await getDb().execute(sql`delete from actores where user_id=${usuario}`);
      await getDb().execute(sql`delete from users where id=${usuario}`);
    }
    if (provincia)
      await getDb().execute(sql`delete from geographic_locations where id=${provincia}`);
  });

  const publicar = async (cookie: string, tipo = 'sueño') => {
    const r = await request
      .post('/api/v1/contribuciones')
      .set('Cookie', cookie)
      .set('X-CSRF-Token', 'luz-titularidad')
      .send({
        senal: {
          contrato: 'basta-senal/v1',
          idLocal: randomUUID(),
          tipo,
          texto: 'Podría aprender y vivir con tiempo para cuidar a quienes quiero.',
          cedeLicencia: true,
          casa: 'no',
          provinceId: provincia,
        },
        campanaId: null,
        edicion: null,
        fragmentos: [],
        interpretacionConfirmada: true,
        aceptaPublicar: true,
      })
      .expect(201);
    const id = r.body.data.idPublico as string;
    creadas.push(id);
    return { id, cookies: (r.headers['set-cookie'] as unknown as string[]) ?? [] };
  };
  const luz = async () => {
    const r = await request.get('/api/v1/civic/map/luz').expect(200);
    return (
      r.body.data.territorios as {
        provinceId: number;
        vocesDistintas: number;
        verificables: number;
      }[]
    ).find((t) => t.provinceId === provincia);
  };
  const retirar = (id: string) =>
    request
      .delete('/api/v1/contribuciones/' + id)
      .set('Cookie', cuenta)
      .set('X-CSRF-Token', 'luz-titularidad')
      .expect(200);

  it('vincular una voz y aportar con la cuenta cuenta una titularidad sin fusionar el navegador', async () => {
    const anonima = await publicar(invitado);
    const credencial = anonima.cookies.find((c) => c.startsWith('basta_actor='))?.split(';')[0];
    expect(credencial).toBeTruthy();
    invitado += '; ' + (credencial ?? '');
    expect((await luz())?.vocesDistintas).toBe(1);
    await request
      .post('/api/v1/mi-espacio/vincular')
      .set('Cookie', cuenta + '; ' + invitado)
      .set('X-CSRF-Token', 'luz-titularidad')
      .send({ senales: [anonima.id], confirmaControl: true })
      .expect(200);
    const nueva = await publicar(cuenta);
    expect((await luz())?.vocesDistintas).toBe(1);
    const fuentes = await getDb().execute<{
      actor: string;
      usuario: number;
      cuentaActor: number | null;
    }>(sql`
      select s.actor_id::text as actor,s.user_id as usuario,a.user_id as "cuentaActor"
      from senales s join actores a on a.id=s.actor_id where s.id_publico in (${anonima.id}::uuid,${nueva.id}::uuid)`);
    expect(new Set(fuentes.rows.map((s) => s.actor)).size).toBe(2);
    expect(fuentes.rows.every((s) => s.usuario === usuario)).toBe(true);
    expect(fuentes.rows.filter((s) => s.cuentaActor === null)).toHaveLength(1);

    // Vincular esa autoría no acredita que todas las actividades del dispositivo sean de la cuenta.
    await request
      .post(`/api/v1/civic/senales/${nueva.id}/adhesion`)
      .set('Cookie', invitado)
      .set('X-CSRF-Token', 'luz-titularidad')
      .expect(201);
    expect((await luz())?.vocesDistintas).toBe(2);
    await retirar(anonima.id);
    expect((await luz())?.vocesDistintas).toBe(2);
    await retirar(nueva.id);
    expect(await luz()).toBeUndefined();
  });

  it('retirar el único hecho elimina también el denominador y la luz de la provincia', async () => {
    const hecho = await publicar(cuenta, 'basta');
    expect((await luz())?.verificables).toBe(1);
    await retirar(hecho.id);
    expect(await luz()).toBeUndefined();
  });

  it('el tope de hechos se aplica a la misma titularidad aunque conserve dos actores', async () => {
    const anonima = await publicar(invitado, 'basta');
    await request
      .post('/api/v1/mi-espacio/vincular')
      .set('Cookie', cuenta + '; ' + invitado)
      .set('X-CSRF-Token', 'luz-titularidad')
      .send({ senales: [anonima.id], confirmaControl: true })
      .expect(200);
    const nueva = await publicar(cuenta, 'basta');
    const fuentes = await getDb()
      .select()
      .from(senales)
      .where(sql`${senales.idPublico} in (${anonima.id}::uuid,${nueva.id}::uuid)`);
    const extras = await getDb()
      .insert(senales)
      .values(
        fuentes.flatMap((fuente) => {
          const { id: _ordinal, idPublico: _publico, ...fila } = fuente;
          return Array.from({ length: 19 }, () => ({ ...fila, idLocal: randomUUID() }));
        }),
      )
      .returning({ id: senales.idPublico });
    creadas.push(...extras.map((s) => s.id));
    const t = await luz();
    expect(t?.vocesDistintas).toBe(1);
    expect(t?.verificables).toBe(20);
    await getDb()
      .update(senales)
      .set({ estado: 'retirada', texto: '', titulo: null, firma: null })
      .where(eq(senales.provinceId, provincia));
    expect(await luz()).toBeUndefined();
  });
});
