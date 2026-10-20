/**
 * Mirar de punta a punta por HTTP (plan de Mi Argentina ideal, entrega 1, tareas
 * 6 y 7): tandas, opiniones, duelos, reportes, la página del aporte y la gestión.
 *
 * **Escribe filas.** Corre sólo con `DATABASE_URL_DESCARTABLE` (la base local de
 * `pnpm test:integration:local`) y borra lo suyo de las hojas a la raíz. Cada
 * caso arma su propia campaña con un slug al azar y la pide por `campana`, así
 * no depende de que la nacional esté sembrada ni se mezcla con otros casos.
 *
 * El CSRF va por doble envío, con el token de `GET /api/v1/contribuciones/contexto`,
 * igual que en la web. El límite general de pedidos se sube para esta suite: un
 * solo caso hace más de cien pedidos desde la misma IP en un minuto.
 */
import { randomUUID } from 'node:crypto';

import { clavePar } from '@v2/civic-core';
import { getDb, sql } from '@v2/db';
import { COOKIE_IMPULSO } from '@v2/shared';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createApp } from '../src/app.js';
import { signAccessToken } from '../src/features/auth/tokens.js';
import { hashDeClave } from '../src/features/senales/actor.js';
import { resetConfig } from '../src/lib/config.js';

import { clienteHttp } from './setup/cliente-http.js';

import type { Response } from 'supertest';

type SQL = ReturnType<typeof sql>;
const habilitada = Boolean(process.env['DATABASE_URL_DESCARTABLE']);

describe.skipIf(!habilitada)('Mirar por HTTP: la pila y su gestión', () => {
  const previos = {
    admins: process.env['ADMIN_USERNAMES'],
    limite: process.env['RATE_LIMIT_MAX_REQUESTS'],
  };
  process.env['RATE_LIMIT_MAX_REQUESTS'] = '100000';
  resetConfig();
  const request = clienteHttp(createApp());
  const marca = randomUUID().slice(0, 8);

  const senales: number[] = [];
  const campanas: string[] = [];
  const actores: number[] = [];
  const usuarios: number[] = [];
  const navegadores: Navegador[] = [];
  let csrf = '';
  let creador = 0;
  let admin1 = 0;
  let admin2 = 0;
  let persona = 0;
  let salta = 0;
  let jujuy = 0;
  let orden = 0;

  const filas = async <T extends Record<string, unknown>>(q: SQL) =>
    (await getDb().execute<T>(q)).rows;
  const sesion = (id: number) =>
    `eihg_access=${signAccessToken({ sub: id, username: 'x', email: 'x@test.local' })}`;

  /** Un navegador: su cookie de actor, que se guarda en cuanto el servidor la pone. */
  class Navegador {
    galleta = '';
    constructor(private readonly extra = '') {
      navegadores.push(this);
    }
    cookies(): string {
      return [`eihg_csrf=${csrf}`, this.galleta, this.extra].filter(Boolean).join('; ');
    }
    private guardar(res: Response): Response {
      const set = (res.headers['set-cookie'] as unknown as string[] | undefined) ?? [];
      const nueva = set.find((c) => c.startsWith('basta_actor='));
      if (nueva) this.galleta = nueva.split(';')[0] ?? '';
      return res;
    }
    async post(url: string, body: object = {}) {
      return this.guardar(
        await request.post(url).set('Cookie', this.cookies()).set('X-CSRF-Token', csrf).send(body),
      );
    }
    async put(url: string, body: object) {
      return this.guardar(
        await request.put(url).set('Cookie', this.cookies()).set('X-CSRF-Token', csrf).send(body),
      );
    }
    async get(url: string) {
      return this.guardar(await request.get(url).set('Cookie', this.cookies()));
    }
    tanda(slug: string, extra: object = {}) {
      return this.post('/api/v1/pila/tandas', { campana: slug, ...extra });
    }
    opinar(id: string, valor: string, provinciaId: number | null = null) {
      return this.put(`/api/v1/pila/opiniones/${id}`, { valor, provinciaId });
    }
    /** El id del actor detrás de la cookie, para escribir fixtures a su nombre. */
    async actorId(): Promise<number> {
      const clave = this.galleta.split('=')[1] ?? '';
      const [f] = await filas<{ id: number }>(sql`
        select id::int as id from actores where actor_hash = decode(${hashDeClave(clave).toString('hex')}, 'hex')`);
      if (!f) throw new Error('El navegador todavía no tiene actor.');
      return f.id;
    }
  }

  const nuevaCampana = async (estado = 'abierta'): Promise<{ id: string; slug: string }> => {
    const slug = `pila-http-${randomUUID()}`;
    const [f] = await filas<{ id: string }>(sql`
      insert into campanas (creador_id, id_local, slug, contrato, estado)
      values (${creador}, gen_random_uuid(), ${slug}, ${JSON.stringify({ titulo: 'Prueba' })}::jsonb, ${estado})
      returning id`);
    campanas.push(f!.id);
    return { id: f!.id, slug };
  };

  const autor = async (): Promise<number> => {
    const [f] = await filas<{ id: number }>(sql`
      insert into actores (actor_hash, origen) values (sha256(gen_random_uuid()::text::bytea), 'web')
      returning id::int as id`);
    actores.push(f!.id);
    return f!.id;
  };

  /** Un aporte de la campaña, escrito directo: el límite de `/contribuciones` es de 30 por hora. */
  const aporte = async (
    campanaId: string | null,
    o: { actorId?: number; texto?: string } = {},
  ): Promise<{ id: number; idPublico: string }> => {
    orden += 1;
    const [f] = await filas<{ id: number; id_publico: string }>(sql`
      insert into senales (tipo, clase, origen, id_local, texto, cesion_licencia, cesion_en,
        cesion_version, actor_id, publicada_en)
      values ('sueño', 'deseo', 'web', gen_random_uuid(),
        ${o.texto ?? `Que el turno en la salita no tarde tres meses (${String(orden)}).`}, true, now(), 1,
        ${o.actorId ?? (await autor())}::bigint, now() - make_interval(secs => ${10_000 - orden}))
      returning id::int as id, id_publico`);
    senales.push(f!.id);
    if (campanaId !== null)
      await getDb().execute(sql`
        insert into contribuciones (huella, senal_id, campana_id, edicion, fragmentos)
        values ('prueba', ${f!.id_publico}::uuid, ${campanaId}::uuid, 1, '[]'::jsonb)`);
    return { id: f!.id, idPublico: f!.id_publico };
  };

  const idsDe = (res: Response) => (res.body.data.tarjetas as { id: string }[]).map((t) => t.id);

  beforeAll(async () => {
    const us = await filas<{ id: number; username: string }>(sql`
      insert into users (username, email, name, password_hash) values
        (${'pila-c-' + marca}, ${marca + '-c@test.local'}, 'Creadora', 'x'),
        (${'pila-a1-' + marca}, ${marca + '-a1@test.local'}, 'Admin uno', 'x'),
        (${'pila-a2-' + marca}, ${marca + '-a2@test.local'}, 'Admin dos', 'x'),
        (${'pila-p-' + marca}, ${marca + '-p@test.local'}, 'Persona', 'x')
      returning id, username`);
    [creador, admin1, admin2, persona] = us.map((u) => u.id) as [number, number, number, number];
    usuarios.push(creador, admin1, admin2, persona);
    process.env['ADMIN_USERNAMES'] = `${us[1]!.username},${us[2]!.username}`;
    resetConfig();
    const prov = await filas<{ id: number; iso: string }>(sql`
      select id, iso_code as iso from geographic_locations
      where level = 'province' and iso_code in ('AR-A', 'AR-Y')`);
    salta = prov.find((p) => p.iso === 'AR-A')?.id ?? 0;
    jujuy = prov.find((p) => p.iso === 'AR-Y')?.id ?? 0;
    const contexto = await request.get('/api/v1/contribuciones/contexto').expect(200);
    csrf = contexto.body.data.csrfToken as string;
  });

  afterAll(async () => {
    if (previos.admins === undefined) delete process.env['ADMIN_USERNAMES'];
    else process.env['ADMIN_USERNAMES'] = previos.admins;
    if (previos.limite === undefined) delete process.env['RATE_LIMIT_MAX_REQUESTS'];
    else process.env['RATE_LIMIT_MAX_REQUESTS'] = previos.limite;
    resetConfig();
    const db = getDb();
    for (const n of navegadores) if (n.galleta) actores.push(await n.actorId().catch(() => 0));
    const lista = (xs: readonly (number | string)[], tipo: string) =>
      sql.raw(`'{${xs.filter(Boolean).join(',')}}'::${tipo}[]`);
    // Las respuestas, duelos, reportes, decisiones y contribuciones caen con su aporte;
    // los impulsos, con su campaña; los avisos, con su cuenta.
    await db.execute(sql`delete from senales where id = any(${lista(senales, 'bigint')})`);
    await db.execute(sql`delete from campanas where id = any(${lista(campanas, 'uuid')})`);
    await db.execute(sql`delete from actores where id = any(${lista(actores, 'bigint')})
      or user_id = any(${lista(usuarios, 'int')})`);
    await db.execute(sql`delete from users where id = any(${lista(usuarios, 'int')})`);
  });

  describe('la tanda', () => {
    it('sin cookie crea el actor, lo deja en la cookie y nunca trae lo propio', async () => {
      const c = await nuevaCampana();
      const ajenos = [await aporte(c.id), await aporte(c.id)];
      const nav = new Navegador();
      const primera = await nav.tanda(c.slug);
      expect(primera.status).toBe(200);
      expect(nav.galleta).toMatch(/^basta_actor=/);
      expect(idsDe(primera).sort()).toEqual(ajenos.map((a) => a.idPublico).sort());
      expect(primera.body.data.tarjetas[0]).toEqual({
        id: expect.any(String),
        texto: expect.stringContaining('salita'),
        origen: null,
        provincia: null,
        tema: null,
      });
      const propio = await aporte(c.id, { actorId: await nav.actorId() });
      const segunda = await nav.tanda(c.slug);
      expect(idsDe(segunda)).not.toContain(propio.idPublico);
      expect(segunda.body.data.estado.yaAporto).toBe(true);
    });

    it('una campaña sin aportes de otros da una tanda vacía, y una que no existe responde 404', async () => {
      const c = await nuevaCampana();
      const nav = new Navegador();
      const vacia = await nav.tanda(c.slug);
      expect(vacia.status).toBe(200);
      expect(vacia.body.data).toMatchObject({
        tarjetas: [],
        estado: { provincia: null, preguntarProvincia: true, yaAporto: false, acuerdos: [] },
      });
      const nada = await nav.tanda(`no-existe-${randomUUID()}`);
      expect(nada.status).toBe(404);
      expect(nada.body.error.code).toBe('CAMPANA_NO_DISPONIBLE');
      const cerrada = await nuevaCampana('cerrada');
      expect((await nav.tanda(cerrada.slug)).status).toBe(404);
    });

    it('sin token CSRF responde 403', async () => {
      const c = await nuevaCampana();
      await request.post('/api/v1/pila/tandas').send({ campana: c.slug }).expect(403);
      await request
        .put(`/api/v1/pila/opiniones/${randomUUID()}`)
        .send({ valor: 'acuerdo', provinciaId: null })
        .expect(403);
    });

    it('priorizarRegion ajena se ignora', async () => {
      const c = await nuevaCampana();
      for (let i = 0; i < 4; i++) await aporte(c.id);
      const nav = new Navegador();
      const base = await aporte(c.id);
      await nav.opinar(base.idPublico, 'paso', salta);
      const sin = idsDe(await nav.tanda(c.slug));
      const ajena = await nav.tanda(c.slug, { priorizarRegion: 'Patagonia' });
      expect(ajena.status).toBe(200);
      expect(idsDe(ajena)).toEqual(sin);
      expect(idsDe(await nav.tanda(c.slug, { priorizarRegion: 'NOA' }))).toEqual(sin);
    });

    it('el techo por persona responde 429 con un mensaje en castellano', async () => {
      const c = await nuevaCampana();
      const nav = new Navegador();
      await nav.tanda(c.slug);
      const actorId = await nav.actorId();
      // Sesenta tandas en la última hora, escritas directo: cada una deja su instante.
      const muchas = await filas<{ id: number }>(sql`
        insert into senales (tipo, clase, origen, id_local, texto)
        select 'sueño', 'deseo', 'web', gen_random_uuid(), 'Una de muchas.' from generate_series(1, 60)
        returning id::int as id`);
      senales.push(...muchas.map((m) => m.id));
      await getDb().execute(sql`
        insert into pila_respuestas (senal_id, actor_id, mostrada_en)
        select m.id, ${actorId}::bigint, now() - make_interval(secs => m.n)
        from (select id, row_number() over (order by id)::int as n from senales
              where id = any(${sql.raw(`'{${muchas.map((m) => m.id).join(',')}}'::bigint[]`)})) m`);
      const r = await nav.tanda(c.slug);
      expect(r.status).toBe(429);
      expect(r.body.error.message).toMatch(/tandas.*volvé/);
    });
  });

  describe('opinar', () => {
    it('opinar actualiza, coinciden cuenta a los otros y paso no muestra nada', async () => {
      const c = await nuevaCampana();
      const s = await aporte(c.id);
      const [a, b, x] = [new Navegador(), new Navegador(), new Navegador()];
      const primera = await a.opinar(s.idPublico, 'acuerdo', salta);
      expect(primera.status).toBe(200);
      expect(primera.body.data).toEqual({ coinciden: 0, regionCompleta: null });
      expect((await b.opinar(s.idPublico, 'acuerdo')).body.data.coinciden).toBe(1);
      expect((await b.opinar(s.idPublico, 'desacuerdo')).body.data.coinciden).toBe(0);
      expect((await x.opinar(s.idPublico, 'paso')).body.data).toEqual({
        coinciden: null,
        regionCompleta: null,
      });
      const [n] = await filas<{ n: number }>(
        sql`select count(*)::int as n from pila_respuestas where senal_id = ${s.id}`,
      );
      expect(n?.n).toBe(3);
    });

    it('la provincia se valida, y lo que no está en Mirar responde 404', async () => {
      const c = await nuevaCampana();
      const s = await aporte(c.id);
      const fuera = await aporte(null);
      const nav = new Navegador();
      const mala = await nav.opinar(s.idPublico, 'acuerdo', 2147483647);
      expect(mala.status).toBe(400);
      expect(mala.body.error.code).toBe('PROVINCIA_DESCONOCIDA');
      expect((await nav.opinar(fuera.idPublico, 'acuerdo')).status).toBe(404);
      expect((await nav.opinar('no-es-un-id', 'acuerdo')).status).toBe(404);
      expect(
        (await nav.put(`/api/v1/pila/opiniones/${s.idPublico}`, { valor: 'tal vez' })).status,
      ).toBe(400);
    });

    it('la quinta opinión de una región devuelve regionCompleta', async () => {
      const c = await nuevaCampana();
      const s = await aporte(c.id);
      const respuestas = [];
      for (let i = 0; i < 5; i++)
        respuestas.push(
          (await new Navegador().opinar(s.idPublico, i % 2 ? 'acuerdo' : 'desacuerdo', jujuy)).body
            .data.regionCompleta,
        );
      expect(respuestas).toEqual([null, null, null, null, { region: 'NOA' }]);
    });

    it('preguntarProvincia vale verdadero la primera vez y falso después de una respuesta', async () => {
      const c = await nuevaCampana();
      const s = await aporte(c.id);
      await aporte(c.id);
      const nav = new Navegador();
      expect((await nav.tanda(c.slug)).body.data.estado.preguntarProvincia).toBe(true);
      await nav.opinar(s.idPublico, 'paso', null);
      const despues = await nav.tanda(c.slug);
      expect(despues.body.data.estado).toMatchObject({
        preguntarProvincia: false,
        provincia: null,
      });
      const conProvincia = new Navegador();
      await conProvincia.opinar(s.idPublico, 'acuerdo', salta);
      expect((await conProvincia.tanda(c.slug)).body.data.estado).toMatchObject({
        preguntarProvincia: false,
        provincia: { id: salta, nombre: expect.any(String) },
      });
    });

    it('la quinta respuesta acredita a quien llegó desde una campaña que junta gente', async () => {
      const c = await nuevaCampana();
      const impulsora = await nuevaCampana('reuniendo');
      const nav = new Navegador(`${COOKIE_IMPULSO}=${impulsora.id}`);
      for (let i = 0; i < 5; i++) {
        const s = await aporte(c.id);
        expect((await nav.opinar(s.idPublico, 'paso')).status).toBe(200);
      }
      const r = await filas<{ como: string }>(sql`
        select como from campana_impulsos where campana_id = ${impulsora.id}::uuid
          and actor_id = ${await nav.actorId()}::bigint`);
      expect(r).toEqual([{ como: 'opiniones' }]);
    });
  });

  describe('duelos', () => {
    it('sin «yo también» previos responde 404, y uno válido se guarda una vez y se puede cambiar', async () => {
      const c = await nuevaCampana();
      const [a, b, x] = [await aporte(c.id), await aporte(c.id), await aporte(c.id)];
      const sinActor = await request
        .put('/api/v1/pila/duelos')
        .set('Cookie', `eihg_csrf=${csrf}`)
        .set('X-CSRF-Token', csrf)
        .send({ a: a.idPublico, b: b.idPublico, primero: null });
      expect(sinActor.status).toBe(404);
      const nav = new Navegador();
      await nav.opinar(a.idPublico, 'acuerdo', salta);
      await nav.opinar(b.idPublico, 'desacuerdo', salta);
      await nav.opinar(x.idPublico, 'acuerdo', salta);
      const duelo = (primero: string | null, otro = x.idPublico) =>
        nav.put('/api/v1/pila/duelos', { a: a.idPublico, b: otro, primero });
      expect((await duelo(null, b.idPublico)).status).toBe(404);
      expect((await duelo(a.idPublico)).status).toBe(204);
      expect((await duelo(x.idPublico)).status).toBe(204);
      expect(
        (await nav.put('/api/v1/pila/duelos', { a: a.idPublico, b: a.idPublico, primero: null }))
          .status,
      ).toBe(400);
      const r = await filas<{ primero: number; region: string }>(sql`
        select primero_id::int as primero, region from pila_duelos where a_id = ${Math.min(a.id, x.id)}
          and b_id = ${Math.max(a.id, x.id)}`);
      expect(r).toEqual([{ primero: x.id, region: 'NOA' }]);
      const estado = (await nav.tanda(c.slug)).body.data.estado;
      expect(estado.paresComparados).toEqual([clavePar(a.idPublico, x.idPublico)]);
      expect(estado.acuerdos).toEqual([a.idPublico, x.idPublico]);
    });
  });

  describe('reportes', () => {
    it('el reporte 13 que cuenta saca el aporte de la tanda siguiente y deja un aviso para cada admin', async () => {
      const c = await nuevaCampana();
      const objetivo = await aporte(c.id);
      const base = await Promise.all(Array.from({ length: 5 }, () => aporte(c.id)));
      const observador = new Navegador();
      expect(idsDe(await observador.tanda(c.slug))).toContain(objetivo.idPublico);
      for (let i = 0; i < 13; i++) {
        const nav = new Navegador();
        for (const s of base) await nav.opinar(s.idPublico, 'paso');
        const r = await nav.post(`/api/v1/pila/reportes/${objetivo.idPublico}`, {
          motivo: i === 0 ? 'datos_personales' : 'insulta',
        });
        expect(r.status).toBe(202);
        expect(r.body.data).toEqual({ recibido: true });
      }
      expect(idsDe(await observador.tanda(c.slug))).not.toContain(objetivo.idPublico);
      const tarde = await new Navegador().post(`/api/v1/pila/reportes/${objetivo.idPublico}`, {
        motivo: 'insulta',
      });
      expect(tarde.status).toBe(404);
      const avisos = await filas<{ user_id: number; clave: string; href: string }>(sql`
        select user_id, clave, href from eventos_civicos
        where clave in (${'pila:retenido:' + objetivo.idPublico}, ${'pila:datos:' + objetivo.idPublico})
        order by clave, user_id`);
      expect(avisos).toEqual(
        [
          { user_id: admin1, clave: `pila:datos:${objetivo.idPublico}`, href: '/gestion/pila' },
          { user_id: admin2, clave: `pila:datos:${objetivo.idPublico}`, href: '/gestion/pila' },
          { user_id: admin1, clave: `pila:retenido:${objetivo.idPublico}`, href: '/gestion/pila' },
          { user_id: admin2, clave: `pila:retenido:${objetivo.idPublico}`, href: '/gestion/pila' },
        ].sort((p, q) => p.clave.localeCompare(q.clave) || p.user_id - q.user_id),
      );
    });

    it('un motivo fuera de la lista responde 400', async () => {
      const c = await nuevaCampana();
      const s = await aporte(c.id);
      const r = await new Navegador().post(`/api/v1/pila/reportes/${s.idPublico}`, {
        motivo: 'no me gusta',
      });
      expect(r.status).toBe(400);
    });
  });

  describe('la página del aporte', () => {
    it('dice si está en Mirar y qué contestó quien mira, sin plantar una cookie', async () => {
      const c = await nuevaCampana();
      const s = await aporte(c.id);
      const fuera = await aporte(null);
      const anonimo = await request.get(`/api/v1/pila/aportes/${s.idPublico}`).expect(200);
      expect(anonimo.body.data).toEqual({ enMirar: true, miOpinion: null });
      expect(anonimo.headers['set-cookie']).toBeUndefined();
      const nav = new Navegador();
      await nav.opinar(s.idPublico, 'acuerdo');
      expect((await nav.get(`/api/v1/pila/aportes/${s.idPublico}`)).body.data).toEqual({
        enMirar: true,
        miOpinion: 'acuerdo',
      });
      expect((await nav.get(`/api/v1/pila/aportes/${fuera.idPublico}`)).body.data.enMirar).toBe(
        false,
      );
    });
  });

  describe('gestión', () => {
    const admin = () => `${sesion(admin1)}; eihg_csrf=${csrf}`;

    it('sin sesión responde 401 y sin ser admin 403', async () => {
      await request.get('/api/v1/gestion/pila').expect(401);
      await request.get('/api/v1/gestion/pila').set('Cookie', sesion(persona)).expect(403);
    });

    it('retener lo saca de la tanda, devolver lo vuelve a poner, y cada decisión queda con quien la tomó', async () => {
      const c = await nuevaCampana();
      const s = await aporte(c.id);
      const observador = new Navegador();
      expect(idsDe(await observador.tanda(c.slug))).toContain(s.idPublico);
      const url = `/api/v1/gestion/pila/${s.idPublico}/retencion`;
      const retener = (motivo: string) =>
        request.post(url).set('Cookie', admin()).set('X-CSRF-Token', csrf).send({ motivo });
      expect((await retener('no')).status).toBe(400);
      expect((await retener('Tiene el nombre de una vecina.')).status).toBe(200);
      expect((await retener('Otra vez.')).body.error.code).toBe('YA_RETENIDO');
      expect(idsDe(await observador.tanda(c.slug))).not.toContain(s.idPublico);

      const lista = await request
        .get(`/api/v1/gestion/pila?campana=${c.slug}`)
        .set('Cookie', admin())
        .expect(200);
      expect(lista.headers['cache-control']).toBe('no-store');
      expect(lista.body.data).toMatchObject({
        siguiente: null,
        aportes: [
          {
            id: s.idPublico,
            reportes: [],
            retenido: { origen: 'gestion', motivo: 'Tiene el nombre de una vecina.' },
            ultimaDecision: { decision: 'retener' },
          },
        ],
      });

      const devolver = await request
        .delete(url)
        .set('Cookie', admin())
        .set('X-CSRF-Token', csrf)
        .send({ motivo: 'Lo revisé y no tiene datos de nadie.' });
      expect(devolver.status).toBe(200);
      expect(idsDe(await observador.tanda(c.slug))).toContain(s.idPublico);
      const otra = await request
        .delete(url)
        .set('Cookie', admin())
        .set('X-CSRF-Token', csrf)
        .send({ motivo: 'Otra vez lo mismo.' });
      expect(otra.body.error.code).toBe('NO_RETENIDO');
      const decisiones = await filas<{ decision: string; origen: string; admin: number }>(sql`
        select decision, origen, admin_id as admin from pila_decisiones where senal_id = ${s.id}
        order by creada_en`);
      expect(decisiones).toEqual([
        { decision: 'retener', origen: 'gestion', admin: admin1 },
        { decision: 'devolver', origen: 'gestion', admin: admin1 },
      ]);
      const ajeno = await request
        .post(`/api/v1/gestion/pila/${randomUUID()}/retencion`)
        .set('Cookie', admin())
        .set('X-CSRF-Token', csrf)
        .send({ motivo: 'No existe.' });
      expect(ajeno.status).toBe(404);
      await request
        .get(`/api/v1/gestion/pila?campana=no-existe-${marca}`)
        .set('Cookie', admin())
        .expect(404);
    });
  });
});
