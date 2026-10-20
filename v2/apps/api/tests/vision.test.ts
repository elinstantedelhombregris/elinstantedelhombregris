/**
 * Ver y los aportes parecidos, de punta a punta (spec
 * 2026-10-19-mi-argentina-ideal-la-pila.md §5 y §3).
 *
 * **Escribe filas.** Exige `DATABASE_URL_DESCARTABLE`, como el resto de las
 * suites que escriben. Los aportes entran por `POST /api/v1/contribuciones`, con
 * su cookie de actor; las opiniones y los pasos se insertan directo en
 * `pila_respuestas`, porque la API de Mirar es de otra parte del sistema y acá
 * lo que se prueba es la lectura.
 *
 * `GET /vision` se prueba sobre campañas propias (`?campana=`), para que los
 * números no dependan de lo que dejen otras suites. `POST /parecidos` sólo mira
 * la nacional: si no existe, la crea y la borra al terminar; si existe, la usa
 * sin tocarla, con textos que llevan una marca única.
 */
import { randomUUID } from 'node:crypto';

import '../src/load-env.js';

const DESCARTABLE = process.env['DATABASE_URL_DESCARTABLE'];
if (DESCARTABLE !== undefined && DESCARTABLE !== '') {
  process.env['DATABASE_URL'] = DESCARTABLE;
}

import { getDb, sql } from '@v2/db';
import { CONTRATO_SENAL, SLUG_CAMPANA_NACIONAL } from '@v2/shared';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createApp } from '../src/app.js';

import { hasDatabaseUrl } from './helpers/index.js';
import { clienteHttp } from './setup/cliente-http.js';

import type { AporteParecido, VisionCampana } from '@v2/shared';

const dsuite =
  DESCARTABLE !== undefined && DESCARTABLE !== '' && hasDatabaseUrl ? describe : describe.skip;

const contrato = {
  titulo: 'Campaña de prueba de Ver',
  pregunta: 'En tu Argentina ideal, ¿qué sería posible en tu vida?',
  proposito: 'Probar la visión de punta a punta con datos chicos y conocidos.',
  territorios: [],
  temas: ['salud'],
  participantes: 'Las filas de esta prueba y nadie más.',
  canales: ['web'],
  responsable: 'La prueba',
  devolucion: 'Ninguna: esta campaña se borra al terminar la prueba.',
  fechaDevolucion: '2099-03-15',
  efecto: 'Ninguno: es una campaña de prueba.',
  usoDatos: 'Los datos de esta prueba se borran cuando termina la corrida.',
  metodoLectura: 'Se lee con las reglas de la spec y se compara con lo esperado.',
  institucion: '',
  fases: [
    { nombre: 'Recibe aportes', salida: 'Se reciben aportes de prueba.', fecha: '2099-02-28' },
  ],
};

const REGION: Record<string, string> = { 'AR-A': 'NOA', 'AR-B': 'Buenos Aires', 'AR-M': 'Cuyo' };

dsuite('Ver y aportes parecidos', () => {
  const request = clienteHttp(createApp());
  const marca = randomUUID();
  /** Una palabra que no existe en ningún otro aporte: aísla los parecidos de otras suites. */
  const token = `zq${marca.slice(0, 8)}`;
  const slug = `vision-api-${marca}`;
  const slugVacia = `vision-vacia-${marca}`;
  let csrf = '';
  let usuario = 0;
  let campana = { id: '', revision: 1 };
  let nacional = { id: '', revision: 1 };
  let nacionalPropia = false;
  const actoresSql: number[] = [];
  const aportes: string[] = [];
  const provincia: Record<string, number> = {};

  const galletaDe = (res: { headers: Record<string, unknown> }): string => {
    const set = (res.headers['set-cookie'] as unknown as string[] | undefined) ?? [];
    return (set.find((c) => c.startsWith('basta_actor=')) ?? '').split(';')[0] ?? '';
  };

  /** Publica un aporte por la API. Devuelve su id público y la cookie de su autor. */
  const publicar = async (o: {
    texto: string;
    en: { id: string; revision: number };
    tipo?: string;
    galleta?: string;
  }): Promise<{ id: string; galleta: string }> => {
    const res = await request
      .post('/api/v1/contribuciones')
      .set('Cookie', [`eihg_csrf=${csrf}`, ...(o.galleta ? [o.galleta] : [])].join('; '))
      .set('X-CSRF-Token', csrf)
      .send({
        senal: {
          contrato: CONTRATO_SENAL,
          idLocal: randomUUID(),
          tipo: o.tipo ?? 'sueño',
          texto: o.texto,
          cedeLicencia: true,
          casa: 'no',
          ...(o.tipo ? {} : { tema: 'salud' }),
        },
        campanaId: o.en.id,
        edicion: o.en.revision,
        fragmentos: [],
        interpretacionConfirmada: true,
        aceptaPublicar: true,
      });
    if (res.status !== 201)
      throw new Error(`Esperaba 201 y vino ${String(res.status)}: ${JSON.stringify(res.body)}`);
    const id = res.body.data.idPublico as string;
    aportes.push(id);
    return { id, galleta: o.galleta ?? galletaDe(res) };
  };

  const idInterno = async (idPublico: string): Promise<number> => {
    const r = await getDb().execute<{ id: string; actor_id: string }>(
      sql`select id, actor_id from senales where id_publico = ${idPublico}::uuid`,
    );
    return Number(r.rows[0]?.id);
  };
  const actorDe = async (idPublico: string): Promise<number> => {
    const r = await getDb().execute<{ actor_id: string }>(
      sql`select actor_id from senales where id_publico = ${idPublico}::uuid`,
    );
    return Number(r.rows[0]?.actor_id);
  };

  /** `n` opiniones de actores nuevos desde una provincia; las primeras `si` son «yo también». */
  const opinar = async (
    idPublico: string,
    iso: string,
    n: number,
    valores: { si?: number; paso?: boolean } = {},
  ) => {
    const sid = await idInterno(idPublico);
    const r = await getDb().execute<{ id: string }>(sql`
      insert into actores (actor_hash, origen)
      select decode(md5(${marca} || ${idPublico} || ${iso} || g::text || random()::text), 'hex'), 'web'
      from generate_series(1, ${n}::int) g
      returning id`);
    const ids = r.rows.map((f) => Number(f.id));
    actoresSql.push(...ids);
    const si = valores.si ?? 0;
    for (const [i, actor] of ids.entries()) {
      const valor = valores.paso ? 'paso' : i < si ? 'acuerdo' : 'desacuerdo';
      await getDb().execute(sql`insert into pila_respuestas
        (senal_id, actor_id, valor, provincia_id, region, respondida_en)
        values (${sid}, ${actor}, ${valor}, ${provincia[iso] ?? null}::int, ${REGION[iso] ?? null}, now())`);
    }
  };

  const ver = async (slugCampana: string, galleta?: string) => {
    const r = request.get(`/api/v1/vision?campana=${slugCampana}`);
    if (galleta) void r.set('Cookie', galleta);
    const res = await r;
    expect(res.status).toBe(200);
    expect(res.headers['cache-control']).toBe('no-store');
    return res.body.data as VisionCampana;
  };

  const parecidos = (texto: string, galleta?: string) =>
    request
      .post('/api/v1/vision/parecidos')
      .set('Cookie', [`eihg_csrf=${csrf}`, ...(galleta ? [galleta] : [])].join('; '))
      .set('X-CSRF-Token', csrf)
      .send({ texto });

  beforeAll(async () => {
    const db = getDb();
    const contexto = await request.get('/api/v1/contribuciones/contexto').expect(200);
    csrf = contexto.body.data.csrfToken as string;
    const provs = await db.execute<{ id: number; iso_code: string }>(
      sql`select id, iso_code from geographic_locations where level = 'province' and iso_code in ('AR-A','AR-B','AR-M')`,
    );
    for (const p of provs.rows) provincia[p.iso_code] = p.id;
    const u = await db.execute<{ id: number }>(sql`
      insert into users (username, email, name, password_hash, email_verified)
      values (${marca}, ${`${marca}@test.local`}, 'Prueba de Ver', 'no-login', true) returning id`);
    usuario = u.rows[0]?.id ?? 0;
    const json = JSON.stringify(contrato);
    const c = await db.execute<{ id: string; slug: string; revision: number }>(sql`
      insert into campanas (slug, creador_id, id_local, estado, contrato) values
        (${slug}, ${usuario}, ${randomUUID()}::uuid, 'abierta', ${json}::jsonb),
        (${slugVacia}, ${usuario}, ${randomUUID()}::uuid, 'abierta', ${json}::jsonb)
      returning id, slug, revision`);
    const propia = c.rows.find((f) => f.slug === slug);
    campana = { id: propia?.id ?? '', revision: propia?.revision ?? 1 };

    const previa = await db.execute<{ id: string; revision: number; estado: string }>(
      sql`select id, revision, estado from campanas where slug = ${SLUG_CAMPANA_NACIONAL}`,
    );
    const existente = previa.rows[0];
    if (existente) {
      if (existente.estado !== 'abierta')
        throw new Error('La campaña nacional de la base de prueba existe y no está abierta.');
      nacional = { id: existente.id, revision: existente.revision };
    } else {
      const n = await db.execute<{ id: string; revision: number }>(sql`
        insert into campanas (slug, creador_id, id_local, estado, contrato)
        values (${SLUG_CAMPANA_NACIONAL}, ${usuario}, ${randomUUID()}::uuid, 'abierta', ${json}::jsonb)
        returning id, revision`);
      nacional = { id: n.rows[0]?.id ?? '', revision: n.rows[0]?.revision ?? 1 };
      nacionalPropia = true;
    }
  });

  afterAll(async () => {
    const db = getDb();
    const S = sql.raw(`'{${aportes.join(',')}}'::uuid[]`);
    const A = sql.raw(`'{${actoresSql.join(',')}}'::bigint[]`);
    await db.execute(
      sql`delete from pila_respuestas where actor_id = any(${A}) or senal_id in (select id from senales where id_publico = any(${S}))`,
    );
    await db.execute(sql`delete from senales where id_publico = any(${S})`);
    await db.execute(sql`delete from actores where id = any(${A})`);
    await db.execute(sql`delete from campanas where slug in (${slug}, ${slugVacia})`);
    if (nacionalPropia) await db.execute(sql`delete from campanas where id = ${nacional.id}::uuid`);
    await db.execute(sql`delete from users where id = ${usuario}`);
  });

  describe('GET /api/v1/vision', () => {
    it('sin aportes devuelve una visión válida con todo en cero', async () => {
      const v = await ver(slugVacia);
      expect(v.campana).toMatchObject({
        slug: slugVacia,
        titulo: contrato.titulo,
        edicion: 1,
        recibeHasta: '2099-02-28',
        devolucion: '2099-03-15',
      });
      expect(v.cifras).toEqual({ personas: 0, opiniones: 0, provincias: 0 });
      expect(v.enDiscusion).toBe(0);
      expect(v.une).toEqual([]);
      expect(v.primero).toEqual([]);
      expect(v.divide).toEqual([]);
      expect(v.recien).toEqual([]);
      expect(v.tuyo).toBeNull();
      expect(v.miRegion).toBeNull();
      expect(v.temas).toHaveLength(13);
      expect(v.temas.every((t) => t.aporte === null)).toBe(true);
      expect(v.regiones).toHaveLength(6);
      expect(v.regiones.every((r) => r.personas === null && r.cuentaEn === 0)).toBe(true);
      expect(v.provincias).toHaveLength(24);
      expect(v.provincias.every((p) => p.nivel === 0 && p.personas === null)).toBe(true);
      expect(Number.isNaN(Date.parse(v.calculadaEn))).toBe(false);
    });

    it('una campaña que no existe es 404 con un mensaje en castellano', async () => {
      const res = await request.get(`/api/v1/vision?campana=no-existe-${marca}`);
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('CAMPANA_NO_DISPONIBLE');
      expect(res.body.error.message).toMatch(/No encontramos esa campaña/);
    });

    it('mirar no crea un actor', async () => {
      const res = await request.get(`/api/v1/vision?campana=${slugVacia}`).expect(200);
      expect(galletaDe(res)).toBe('');
    });

    describe('con aportes y opiniones', () => {
      let une = { id: '', galleta: '' };
      let parte = { id: '', galleta: '' };

      beforeAll(async () => {
        une = await publicar({ texto: `Que un turno con el médico no tarde meses ${token}`, en: campana });
        parte = await publicar({ texto: `Que se pueda alquilar sin garante ${token}`, en: campana });
        // «une»: 9 de cada 10 en el NOA y en Buenos Aires, más quince pasos.
        await opinar(une.id, 'AR-A', 10, { si: 9 });
        await opinar(une.id, 'AR-B', 10, { si: 9 });
        await opinar(une.id, 'AR-B', 15, { paso: true });
        // «parte»: 6 de cada 10 en el NOA, por debajo de 7, y 10 de 10 en Buenos Aires.
        await opinar(parte.id, 'AR-A', 10, { si: 6 });
        await opinar(parte.id, 'AR-B', 10, { si: 10 });
        // Tres pasos desde Mendoza: tres personas, por debajo de cinco.
        await opinar(parte.id, 'AR-M', 3, { paso: true });
        // La autora de «parte» dice «yo también» a «une» desde Salta.
        await getDb().execute(sql`insert into pila_respuestas
          (senal_id, actor_id, valor, provincia_id, region, respondida_en)
          values (${await idInterno(une.id)}, ${await actorDe(parte.id)}, 'acuerdo',
            ${provincia['AR-A'] ?? null}::int, 'NOA', now())`);
      });

      it('la regla federal: con una región por debajo de 7 de cada 10, no está en «une»', async () => {
        const v = await ver(slug);
        expect(v.enDiscusion).toBe(2);
        expect(v.une.map((a) => a.id)).toEqual([une.id]);
        expect(v.divide.map((a) => a.id)).toEqual([parte.id]);
        const noa = v.divide[0]?.regiones.find((r) => r.region === 'NOA');
        expect(noa).toEqual({ region: 'NOA', acuerdo: 0.6, cuenta: true });
        expect(v.une[0]?.regiones.find((r) => r.region === 'Cuyo')).toEqual({
          region: 'Cuyo',
          acuerdo: null,
          cuenta: false,
        });
        expect(v.temas.find((t) => t.clave === 'salud')?.aporte?.id).toBe(une.id);
        expect(v.regiones.find((r) => r.region === 'NOA')?.cuentaEn).toBe(2);
        expect(v.regiones.find((r) => r.region === 'Cuyo')?.cuentaEn).toBe(0);
      });

      it('los pasos se cuentan aparte y no entran en el denominador', async () => {
        const v = await ver(slug);
        const a = v.une[0];
        expect(a?.opiniones).toBe(21);
        expect(a?.pasos).toBe(15);
        expect(a?.acuerdo).toBeCloseTo(19 / 21);
        expect(a?.peor).toBeCloseTo(0.9);
        expect(v.cifras.opiniones).toBe(41);
      });

      it('suprime a las provincias y regiones con menos de cinco personas', async () => {
        const v = await ver(slug);
        const de = (iso: string) => v.provincias.find((p) => p.iso === iso);
        expect(de('AR-A')).toMatchObject({ personas: 21, region: 'NOA' });
        expect(de('AR-A')?.nivel).toBeGreaterThanOrEqual(1);
        expect(de('AR-B')?.personas).toBe(35);
        expect(de('AR-M')).toMatchObject({ personas: null, nivel: 1, region: 'Cuyo' });
        expect(de('AR-Y')).toMatchObject({ personas: null, nivel: 0 });
        expect(v.regiones.find((r) => r.region === 'Cuyo')?.personas).toBeNull();
        expect(v.regiones.find((r) => r.region === 'NOA')?.personas).toBe(21);
        // 21 + 35 + 3, más la autora de «une», que no dijo de dónde es.
        expect(v.cifras.personas).toBe(60);
        expect(v.cifras.provincias).toBe(3);
      });

      it('«tuyo» es sólo para su autora, y quien mira ve su opinión y su región', async () => {
        const anonima = await ver(slug);
        expect(anonima.tuyo).toBeNull();
        expect(anonima.miRegion).toBeNull();
        expect(anonima.une[0]?.miOpinion).toBeNull();

        const deUne = await ver(slug, une.galleta);
        expect(deUne.tuyo).toEqual({
          id: une.id,
          texto: `Que un turno con el médico no tarde meses ${token}`,
          opiniones: 21,
          acuerdos: 19,
          pasos: 15,
        });

        const deParte = await ver(slug, parte.galleta);
        expect(deParte.tuyo?.id).toBe(parte.id);
        expect(deParte.miRegion).toBe('NOA');
        expect(deParte.une[0]?.miOpinion).toBe('acuerdo');
        expect(deParte.divide[0]?.miOpinion).toBeNull();
      });
    });
  });

  describe('POST /api/v1/vision/parecidos', () => {
    let ajeno = '';
    let propio = { id: '', galleta: '' };

    beforeAll(async () => {
      ajeno = (
        await publicar({
          texto: `Que en cada pueblo haya una biblioteca abierta hasta tarde ${token}`,
          en: nacional,
        })
      ).id;
      propio = await publicar({
        texto: `Que en cada pueblo haya una biblioteca abierta de noche ${token}`,
        en: nacional,
      });
      await publicar({
        texto: `En cada pueblo la biblioteca abierta cierra temprano ${token}`,
        en: nacional,
        tipo: 'basta',
      });
    });

    it('encuentra uno casi igual, y no devuelve el propio ni uno de clase hecho', async () => {
      const res = await parecidos(
        `Que en cada pueblo haya una biblioteca abierta hasta tarde ${token}`,
        propio.galleta,
      );
      expect(res.status).toBe(200);
      expect(res.headers['cache-control']).toBe('no-store');
      const lista = res.body.data as AporteParecido[];
      expect(lista.length).toBeLessThanOrEqual(3);
      expect(lista[0]).toEqual({
        id: ajeno,
        texto: `Que en cada pueblo haya una biblioteca abierta hasta tarde ${token}`,
        provincia: null,
      });
      expect(lista.some((p) => p.id === propio.id)).toBe(false);
      expect(lista.some((p) => p.texto.includes('cierra temprano'))).toBe(false);
    });

    it('lo propio de una persona sí aparece para otra', async () => {
      const res = await parecidos(
        `Que en cada pueblo haya una biblioteca abierta de noche ${token}`,
      ).expect(200);
      expect((res.body.data as AporteParecido[]).map((p) => p.id)).toContain(propio.id);
    });

    it('pide al menos diez letras, y CSRF como cualquier envío', async () => {
      const corto = await parecidos('corto');
      expect(corto.status).toBe(400);
      expect(corto.body.error.code).toBe('VALIDATION_ERROR');
      const sinCsrf = await request
        .post('/api/v1/vision/parecidos')
        .send({ texto: `Una biblioteca abierta ${token}` });
      expect(sinCsrf.status).toBe(403);
    });
  });
});
