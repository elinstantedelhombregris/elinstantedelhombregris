/**
 * El repositorio de Ver, contra Postgres de verdad.
 *
 * **Escribe filas.** Necesita `DATABASE_URL_DESCARTABLE` (la define
 * `pnpm test:integration:local`) y se saltea sin ella, como el resto de las
 * suites que escriben.
 *
 * Usa una campaña propia, con un slug que no es el de la nacional, para no
 * pisarse con otra suite ni con la campaña real. Las opiniones y los duelos se
 * insertan directo en `pila_respuestas` y `pila_duelos`: la API de Mirar es de
 * otra parte del sistema, y acá lo que se afirma es la lectura.
 */
import { randomUUID } from 'node:crypto';

import { neon } from '@neondatabase/serverless';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-http';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { VisionRepository, type QuienMira } from '../src/repositories/vision.js';
import * as schema from '../src/schema/index.js';

import type { Db } from '../src/client.js';

const DSN = process.env.DATABASE_URL_DESCARTABLE;
const viva = DSN ? describe : describe.skip;

if (!DSN) {
  process.stdout.write(
    '\n[vision] Se saltea: falta DATABASE_URL_DESCARTABLE.\n' +
      '  Este archivo ESCRIBE filas; usá `pnpm test:integration:local`.\n\n',
  );
}

const REGION: Record<string, string> = {
  'AR-A': 'NOA',
  'AR-B': 'Buenos Aires',
  'AR-M': 'Cuyo',
  'AR-Q': 'Patagonia',
};

const contrato = {
  titulo: 'Campaña de prueba de Ver',
  pregunta: 'En tu Argentina ideal, ¿qué sería posible en tu vida?',
  proposito: 'Probar la lectura de la visión con datos chicos y conocidos.',
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

viva('VisionRepository', () => {
  let db: Db;
  let repo: VisionRepository;
  const marca = randomUUID();
  const slug = `vision-repo-${marca}`;
  const slugBorrador = `vision-borrador-${marca}`;
  let usuario = 0;
  let campanaId = '';
  let otraCampanaId = '';
  const actores: number[] = [];
  const senalesCreadas: number[] = [];
  const provincia: Record<string, number> = {};

  const nuevoActor = async (): Promise<number> => {
    const r = await db.execute<{ id: string }>(
      sql`insert into actores (actor_hash, origen) values (decode(md5(${randomUUID()}), 'hex'), 'web') returning id`,
    );
    const id = Number(r.rows[0]?.id);
    actores.push(id);
    return id;
  };

  const aporte = async (o: {
    texto: string;
    actorId: number | null;
    iso?: string;
    tema?: string;
    cede?: boolean;
    hecho?: boolean;
    campana?: string | null;
  }): Promise<{ sid: number; id: string }> => {
    const cede = o.cede ?? true;
    const r = await db.execute<{ id: string; id_publico: string }>(sql`
      insert into senales (tipo, clase, origen, id_local, texto, cesion_licencia, cesion_en, cesion_version,
        actor_id, province_id, ubicacion_origen, tema, tema_origen)
      values (${o.hecho ? 'basta' : 'sueño'}, ${o.hecho ? 'hecho' : 'deseo'}, 'web', ${randomUUID()}::uuid,
        ${o.texto}, ${cede}, ${cede ? sql`now()` : sql`null`}, ${cede ? 1 : null}::int,
        ${o.actorId}::bigint, ${o.iso ? (provincia[o.iso] ?? null) : null}::int,
        ${o.iso ? 'declarada' : 'ninguna'}, ${o.tema ?? null}, ${o.tema ? 'declarado' : 'ninguno'})
      returning id, id_publico`);
    const fila = r.rows[0];
    if (!fila) throw new Error('No se pudo crear el aporte de prueba.');
    const sid = Number(fila.id);
    senalesCreadas.push(sid);
    const campana = o.campana === undefined ? campanaId : o.campana;
    if (campana !== null)
      await db.execute(sql`insert into contribuciones (huella, senal_id, campana_id, edicion)
        values ('prueba', ${fila.id_publico}::uuid, ${campana}::uuid, 1)`);
    return { sid, id: fila.id_publico };
  };

  const opinar = async (
    sid: number,
    valor: 'acuerdo' | 'desacuerdo' | 'paso',
    iso: string | null,
    actorId?: number,
    haceMinutos = 0,
  ): Promise<number> => {
    const actor = actorId ?? (await nuevoActor());
    await db.execute(sql`insert into pila_respuestas
      (senal_id, actor_id, valor, provincia_id, region, respondida_en)
      values (${sid}, ${actor}, ${valor}, ${iso ? (provincia[iso] ?? null) : null}::int,
        ${iso ? (REGION[iso] ?? null) : null}, now() - make_interval(mins => ${haceMinutos}::int))`);
    return actor;
  };

  /** `n` opiniones nuevas desde una provincia, `si` de ellas «yo también». */
  const opiniones = async (sid: number, iso: string, n: number, si: number) => {
    for (let i = 0; i < n; i += 1) await opinar(sid, i < si ? 'acuerdo' : 'desacuerdo', iso);
  };

  beforeAll(async () => {
    db = drizzle(neon(DSN ?? ''), { schema });
    repo = new VisionRepository(db);
    const provs = await db.execute<{ id: number; iso_code: string }>(
      sql`select id, iso_code from geographic_locations where level = 'province' and iso_code in ('AR-A','AR-B','AR-M','AR-Q')`,
    );
    for (const p of provs.rows) provincia[p.iso_code] = p.id;
    const u = await db.execute<{ id: number }>(sql`
      insert into users (username, email, name, password_hash, email_verified)
      values (${`vision-${marca}`}, ${`vision-${marca}@test.local`}, 'Prueba de Ver', 'no-login', true)
      returning id`);
    usuario = u.rows[0]?.id ?? 0;
    const c = await db.execute<{ id: string; slug: string }>(sql`
      insert into campanas (slug, creador_id, id_local, estado, contrato) values
        (${slug}, ${usuario}, ${randomUUID()}::uuid, 'abierta', ${JSON.stringify(contrato)}::jsonb),
        (${`vision-otra-${marca}`}, ${usuario}, ${randomUUID()}::uuid, 'abierta', ${JSON.stringify(contrato)}::jsonb),
        (${slugBorrador}, ${usuario}, ${randomUUID()}::uuid, 'borrador', ${JSON.stringify(contrato)}::jsonb)
      returning id, slug`);
    campanaId = c.rows.find((f) => f.slug === slug)?.id ?? '';
    otraCampanaId = c.rows.find((f) => f.slug === `vision-otra-${marca}`)?.id ?? '';
  });

  afterAll(async () => {
    const S = sql.raw(`'{${senalesCreadas.join(',')}}'::bigint[]`);
    const A = sql.raw(`'{${actores.join(',')}}'::bigint[]`);
    await db.execute(sql`delete from pila_duelos where actor_id = any(${A})`);
    await db.execute(sql`delete from pila_respuestas where actor_id = any(${A})`);
    await db.execute(sql`delete from senales where id = any(${S})`);
    await db.execute(sql`delete from campanas where creador_id = ${usuario}`);
    await db.execute(sql`delete from actores where id = any(${A})`);
    await db.execute(sql`delete from users where id = ${usuario}`);
  });

  it('encuentra la campaña por su slug, y un borrador nunca publicado no existe', async () => {
    const c = await repo.campanaPorSlug(slug);
    expect(c).toMatchObject({ id: campanaId, slug, edicion: 1 });
    expect(c?.contrato.titulo).toBe(contrato.titulo);
    expect(await repo.campanaPorSlug(slugBorrador)).toBeNull();
    expect(await repo.campanaPorSlug(`no-existe-${marca}`)).toBeNull();
  });

  it('sin aportes ni opiniones devuelve todo vacío, con las provincias y los trece temas', async () => {
    const nadie: QuienMira = { actorId: null, userId: null };
    const d = await repo.leer(campanaId, nadie);
    expect(d.aportes).toEqual([]);
    expect(d.conteos).toEqual([]);
    expect(d.duelos).toEqual([]);
    expect(d.personas).toEqual([]);
    expect(d.provincias).toHaveLength(24);
    expect(d.temas).toHaveLength(13);
    expect(d.temas[0]).toEqual({ clave: 'alimento', etiqueta: 'Alimento' });
    expect(d.propia).toEqual({
      regionDeOpinion: null,
      isoDeAporte: null,
      tuyo: null,
      opiniones: [],
    });
  });

  describe('con aportes y opiniones', () => {
    let autora = 0;
    let quienOpina = 0;
    let elegible = { sid: 0, id: '' };
    let otro = { sid: 0, id: '' };

    beforeAll(async () => {
      autora = await nuevoActor();
      elegible = await aporte({
        texto: `Que un turno con el médico no tarde tres meses ${marca}`,
        actorId: autora,
        iso: 'AR-M',
        tema: 'salud',
      });
      otro = await aporte({ texto: `Que el tren vuelva al pueblo ${marca}`, actorId: null });
      // Lo que NO entra en Ver: texto reservado, más largo que la línea, un hecho,
      // uno retenido y uno de otra campaña.
      await aporte({ texto: 'Un deseo con el texto reservado', actorId: null, cede: false });
      await aporte({ texto: 'x'.repeat(141), actorId: null });
      await aporte({ texto: 'El semáforo no anda hace tres meses', actorId: null, hecho: true });
      const retenido = await aporte({ texto: 'Un deseo retenido', actorId: null });
      await db.execute(
        sql`update senales set retenida_en = now(), retenida_motivo = 'prueba' where id = ${retenido.sid}`,
      );
      await aporte({ texto: 'Un deseo de otra campaña', actorId: null, campana: otraCampanaId });

      await opiniones(elegible.sid, 'AR-A', 6, 5);
      await opiniones(elegible.sid, 'AR-B', 6, 6);
      await opinar(elegible.sid, 'paso', 'AR-B');
      await opinar(elegible.sid, 'acuerdo', null);
      // Opinó primero desde Neuquén y, una hora después, desde Salta.
      quienOpina = await opinar(elegible.sid, 'desacuerdo', 'AR-Q', undefined, 60);
      await opinar(otro.sid, 'acuerdo', 'AR-A', quienOpina);
      const [a, b] = elegible.sid < otro.sid ? [elegible, otro] : [otro, elegible];
      await db.execute(sql`insert into pila_duelos (a_id, b_id, actor_id, primero_id, region) values
        (${a.sid}, ${b.sid}, ${quienOpina}, ${elegible.sid}, 'Patagonia'),
        (${a.sid}, ${b.sid}, ${autora}, null, null)`);
    });

    it('sólo trae los aportes que entran en Mirar', async () => {
      const d = await repo.leer(campanaId, { actorId: null, userId: null });
      expect(d.aportes.map((a) => a.id).sort()).toEqual([elegible.id, otro.id].sort());
      const a = d.aportes.find((x) => x.id === elegible.id);
      expect(a).toMatchObject({ provincia: 'Mendoza', tema: 'salud' });
      expect(a?.publicadaEn).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('cuenta por región, con los pasos aparte y lo que no tiene región en su propia fila', async () => {
      const d = await repo.leer(campanaId, { actorId: null, userId: null });
      const de = (region: string | null) =>
        d.conteos.find((c) => c.id === elegible.id && c.region === region);
      expect(de('NOA')).toMatchObject({ opiniones: 6, acuerdos: 5, pasos: 0 });
      expect(de('Buenos Aires')).toMatchObject({ opiniones: 6, acuerdos: 6, pasos: 1 });
      expect(de('Patagonia')).toMatchObject({ opiniones: 1, acuerdos: 0 });
      expect(de(null)).toMatchObject({ opiniones: 1, acuerdos: 1 });
    });

    it('cuenta los duelos de los dos lados, con «los dos por igual» como comparación', async () => {
      const d = await repo.leer(campanaId, { actorId: null, userId: null });
      expect(d.duelos.find((x) => x.id === elegible.id)).toEqual({
        id: elegible.id,
        comparaciones: 2,
        primero: 1,
      });
      expect(d.duelos.find((x) => x.id === otro.id)).toEqual({
        id: otro.id,
        comparaciones: 2,
        primero: 0,
      });
    });

    it('cuenta personas por provincia: la última opinión manda, si no, el aporte', async () => {
      const d = await repo.leer(campanaId, { actorId: null, userId: null });
      const en = (iso: string | null) =>
        d.personas.find((p) => p.provinciaId === (iso === null ? null : provincia[iso]))?.personas;
      // La autora no opinó: cuenta en Mendoza por su aporte.
      expect(en('AR-M')).toBe(1);
      // Seis de Salta, y quien opinó desde Neuquén y después desde Salta: su
      // última opinión con provincia es la de Salta.
      expect(en('AR-A')).toBe(7);
      expect(en('AR-Q')).toBeUndefined();
      // Seis «yo también» y un «paso»: pasar también es participar.
      expect(en('AR-B')).toBe(7);
      // Quien no dijo su provincia cuenta, sin provincia.
      expect(en(null)).toBe(1);
      // Los aportes sin actor no suman personas: no hay a quién contar.
      expect(d.personas.reduce((s, p) => s + p.personas, 0)).toBe(1 + 7 + 7 + 1);
    });

    it('lo propio: el aporte, sus conteos, la región y las opiniones de quien mira', async () => {
      const deLaAutora = await repo.leer(campanaId, { actorId: autora, userId: null });
      expect(deLaAutora.propia.tuyo).toEqual({
        id: elegible.id,
        texto: `Que un turno con el médico no tarde tres meses ${marca}`,
        provincia: 'Mendoza',
        tema: { clave: 'salud', etiqueta: 'Salud' },
        opiniones: 14,
        acuerdos: 12,
        pasos: 1,
      });
      expect(deLaAutora.propia.isoDeAporte).toBe('AR-M');
      expect(deLaAutora.propia.regionDeOpinion).toBeNull();

      const deQuienOpina = await repo.leer(campanaId, { actorId: quienOpina, userId: null });
      expect(deQuienOpina.propia.tuyo).toBeNull();
      expect(deQuienOpina.propia.regionDeOpinion).toBe('NOA');
      expect(deQuienOpina.propia.opiniones.sort((x, y) => x.id.localeCompare(y.id))).toEqual(
        [
          { id: elegible.id, valor: 'desacuerdo' },
          { id: otro.id, valor: 'acuerdo' },
        ].sort((x, y) => x.id.localeCompare(y.id)),
      );
    });

    it('parecidos: encuentra uno casi igual, sin los propios ni los hechos ni los reservados', async () => {
      const texto = `Que un turno con el médico no tarde tantos meses ${marca}`;
      const ajeno = await repo.parecidos(slug, texto, { actorId: null, userId: null }, 3);
      expect(ajeno[0]).toEqual({
        id: elegible.id,
        texto: `Que un turno con el médico no tarde tres meses ${marca}`,
        provincia: 'Mendoza',
      });
      expect(ajeno.length).toBeLessThanOrEqual(3);

      const propio = await repo.parecidos(slug, texto, { actorId: autora, userId: null }, 3);
      expect(propio.some((p) => p.id === elegible.id)).toBe(false);

      const hecho = await repo.parecidos(
        slug,
        'El semáforo no anda hace tres meses',
        { actorId: null, userId: null },
        3,
      );
      expect(hecho.some((p) => p.texto.includes('semáforo'))).toBe(false);
      const reservado = await repo.parecidos(
        slug,
        'Un deseo con el texto reservado',
        { actorId: null, userId: null },
        3,
      );
      expect(reservado).toEqual([]);
    });

    it('parecidos: también por palabras en castellano, aunque el texto sea otro', async () => {
      const r = await repo.parecidos(
        slug,
        'Me gustaría que vuelvan los trenes a todos los pueblos del interior',
        { actorId: null, userId: null },
        3,
      );
      expect(r.map((p) => p.id)).toContain(otro.id);
    });
  });
});
