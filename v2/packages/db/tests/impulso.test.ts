/**
 * El paso previo de una campaña propuesta, contra Postgres (spec
 * 2026-10-19-mi-argentina-ideal-la-pila.md §11).
 *
 * **Este archivo ESCRIBE filas**: pide `DATABASE_URL_DESCARTABLE` (la define
 * `pnpm test:integration:local`) y se saltea sin ella.
 *
 * Lo que afirma es lo que ningún type-check ve: quién cuenta y quién no, que
 * nadie cuente dos veces, que un aporte retirado o retenido deje de contar y que
 * la campaña pase sola a revisión al llegar al umbral, con su rastro en
 * `campana_ediciones`. El umbral es el parámetro `umbral` del repositorio: tres
 * personas acá, cincuenta en producción.
 */
import { randomBytes, randomUUID } from 'node:crypto';

import { neon } from '@neondatabase/serverless';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-http';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { ImpulsoRepository } from '../src/repositories/impulso.js';
import * as schema from '../src/schema/index.js';

import type { Db } from '../src/client.js';

const DSN = process.env['DATABASE_URL_DESCARTABLE'];
if (DSN === undefined)
  process.stdout.write(
    '\n[impulso] Se saltea: falta DATABASE_URL_DESCARTABLE.\n' +
      '  Este archivo ESCRIBE filas; usá `pnpm test:integration:local`.\n\n',
  );
const viva = DSN === undefined ? describe.skip : describe;

const UMBRAL = 3;
const contrato = {
  titulo: 'Campaña de prueba del paso previo',
  pregunta: '¿Qué tendría que poder hacerse en el barrio?',
  proposito: 'Probar que la campaña cuenta a las personas nuevas que trae.',
  territorios: [],
  temas: ['educación'],
  participantes: 'Quienes quieran participar en esta prueba.',
  canales: ['web'],
  responsable: 'Equipo de pruebas del impulso',
  devolucion: 'Una lectura pública revisable por quienes participaron.',
  fechaDevolucion: '2099-12-20',
  efecto: 'Ejercicio sin compromiso institucional.',
  usoDatos: 'Leeremos los aportes autorizados, respetando los permisos de cada persona.',
  metodoLectura: 'Contrastaremos las fuentes y publicaremos una lectura corregible.',
  institucion: '',
  fases: [
    { nombre: 'Imaginar', salida: 'Aportes revisados por sus autores.', fecha: '2099-12-01' },
  ],
};

viva('ImpulsoRepository', () => {
  let db: Db;
  let repo: ImpulsoRepository;
  const marca = randomUUID();
  const usuarios: number[] = [];
  const actores: number[] = [];
  const campanasCreadas: string[] = [];
  let impulsora = 0;
  let admin = 0;

  const nuevoActor = async (userId: number | null = null): Promise<number> => {
    const r = await db.execute<{ id: number }>(
      sql`insert into actores (actor_hash, origen, user_id) values (decode(${randomBytes(32).toString('hex')}, 'hex'), 'web', ${userId}) returning id`,
    );
    const id = Number(r.rows[0]?.id);
    actores.push(id);
    return id;
  };
  const aporteDe = async (
    actorId: number,
    texto = 'Que el barrio tenga una biblioteca abierta.',
  ) => {
    const r = await db.execute<{ id_publico: string }>(sql`
      insert into senales (tipo, clase, origen, id_local, texto, actor_id, cesion_licencia, cesion_en, cesion_version)
      values ('sueño', 'deseo', 'web', ${randomUUID()}::uuid, ${texto}, ${actorId}, true, now(), 1)
      returning id_publico`);
    return r.rows[0]?.id_publico ?? '';
  };
  const campana = async (estado = 'reuniendo', creador = impulsora): Promise<string> => {
    const idLocal = randomUUID();
    const r = await db.execute<{ id: string }>(sql`
      with nueva as (
        insert into campanas (creador_id, id_local, slug, contrato, estado)
        values (${creador}, ${idLocal}::uuid, ${`campana-${idLocal}`}, ${JSON.stringify(contrato)}::jsonb, ${estado})
        returning *
      ), historia as (
        insert into campana_ediciones (campana_id, revision, contrato, estado, motivo)
        select id, revision, contrato, estado, 'Se presentó para juntar gente.' from nueva
      )
      select id from nueva`);
    const id = r.rows[0]?.id ?? '';
    campanasCreadas.push(id);
    return id;
  };
  const estadoDe = async (id: string) =>
    (
      await db.execute<{ estado: string; revision: number }>(
        sql`select estado, revision from campanas where id = ${id}::uuid`,
      )
    ).rows[0];
  const conAporte = async (campanaId: string, umbral = UMBRAL) => {
    const actorId = await nuevoActor();
    const senal = await aporteDe(actorId);
    const r = await repo.acreditar({
      campanaId,
      actorId,
      userId: null,
      como: 'aporte',
      senalIdPublico: senal,
      umbral,
    });
    return { actorId, senal, r };
  };

  beforeAll(async () => {
    db = drizzle(neon(DSN ?? ''), { schema }) as unknown as Db;
    repo = new ImpulsoRepository(db);
    const r = await db.execute<{ id: number }>(sql`
      insert into users (username, email, name, password_hash, email_verified) values
        (${marca}, ${marca + '@test.local'}, 'Impulsora', 'no-login', true),
        (${marca + 'b'}, ${marca + 'b@test.local'}, 'Admin', 'no-login', true)
      returning id`);
    usuarios.push(...r.rows.map((u) => u.id));
    impulsora = r.rows[0]?.id ?? 0;
    admin = r.rows[1]?.id ?? 0;
  });

  afterAll(async () => {
    if (!db) return;
    const C = JSON.stringify(campanasCreadas);
    const A = JSON.stringify(actores);
    const U = JSON.stringify(usuarios);
    await db.execute(
      sql`delete from campanas where id in (select u::uuid from jsonb_array_elements_text(${C}::jsonb) u)`,
    );
    await db.execute(
      sql`delete from pila_respuestas where actor_id in (select u::bigint from jsonb_array_elements_text(${A}::jsonb) u)`,
    );
    await db.execute(
      sql`delete from senales where actor_id in (select u::bigint from jsonb_array_elements_text(${A}::jsonb) u)`,
    );
    await db.execute(
      sql`delete from actores where id in (select u::bigint from jsonb_array_elements_text(${A}::jsonb) u)`,
    );
    await db.execute(
      sql`delete from eventos_civicos where user_id in (select u::int from jsonb_array_elements_text(${U}::jsonb) u)`,
    );
    await db.execute(
      sql`delete from users where id in (select u::int from jsonb_array_elements_text(${U}::jsonb) u)`,
    );
  });

  it('cuenta a quien publica su primer aporte, una sola vez', async () => {
    const id = await campana();
    const { actorId, senal, r } = await conAporte(id);
    expect(r).toMatchObject({ acreditado: true, pasoARevision: false, campana: { id } });
    const otra = await repo.acreditar({
      campanaId: id,
      actorId,
      userId: null,
      como: 'aporte',
      senalIdPublico: senal,
      umbral: UMBRAL,
    });
    expect(otra.acreditado).toBe(false);
    expect(await repo.personas(id)).toBe(1);
  });

  it('no cuenta a quien ya tenía un aporte ni a quien ya contó para otra campaña', async () => {
    const id = await campana();
    const veterano = await nuevoActor();
    await aporteDe(veterano, 'Un aporte de antes de llegar a la campaña.');
    const segundo = await aporteDe(veterano);
    const r = await repo.acreditar({
      campanaId: id,
      actorId: veterano,
      userId: null,
      como: 'aporte',
      senalIdPublico: segundo,
      umbral: UMBRAL,
    });
    expect(r.acreditado).toBe(false);

    const primera = await campana();
    const { actorId, senal } = await conAporte(primera);
    const repetida = await repo.acreditar({
      campanaId: id,
      actorId,
      userId: null,
      como: 'aporte',
      senalIdPublico: senal,
      umbral: UMBRAL,
    });
    expect(repetida.acreditado).toBe(false);
    expect(await repo.personas(id)).toBe(0);
    expect(await repo.personas(primera)).toBe(1);
  });

  it('cuenta a quien da su quinta opinión sin haber publicado nada', async () => {
    const id = await campana();
    const autora = await nuevoActor();
    const aportes = await Promise.all(
      Array.from({ length: 5 }, (_, i) =>
        aporteDe(autora, `Aporte número ${String(i + 1)} para opinar.`),
      ),
    );
    const opina = await nuevoActor();
    for (const [i, aporte] of aportes.entries()) {
      await db.execute(sql`
        insert into pila_respuestas (senal_id, actor_id, valor, respondida_en)
        select id, ${opina}, 'acuerdo', now() from senales where id_publico = ${aporte}::uuid`);
      const r = await repo.acreditar({
        campanaId: id,
        actorId: opina,
        userId: null,
        como: 'opiniones',
        senalIdPublico: null,
        umbral: UMBRAL,
      });
      expect(r.acreditado).toBe(i === 4);
    }
    expect(await repo.personas(id)).toBe(1);
  });

  it('no cuenta a quien la impulsa ni a nadie si la campaña no está juntando gente', async () => {
    const id = await campana();
    const propio = await nuevoActor(impulsora);
    const r = await repo.acreditar({
      campanaId: id,
      actorId: propio,
      userId: impulsora,
      como: 'aporte',
      senalIdPublico: await aporteDe(propio),
      umbral: UMBRAL,
    });
    expect(r.acreditado).toBe(false);
    const abierta = await campana('abierta');
    expect((await conAporte(abierta)).r.acreditado).toBe(false);
  });

  it('un aporte retirado o retenido deja de contar', async () => {
    const id = await campana();
    const a = await conAporte(id);
    const b = await conAporte(id);
    expect(await repo.personas(id)).toBe(2);
    await db.execute(
      sql`update senales set estado = 'retirada', texto = '' where id_publico = ${a.senal}::uuid`,
    );
    await db.execute(
      sql`update senales set retenida_en = now(), retenida_motivo = 'Prueba de retención.' where id_publico = ${b.senal}::uuid`,
    );
    expect(await repo.personas(id)).toBe(0);
    expect((await repo.personasDe([id])).get(id)).toBeUndefined();
  });

  it('al llegar al umbral pasa sola a revisión y deja el paso en campana_ediciones', async () => {
    const id = await campana();
    const antes = await estadoDe(id);
    expect((await conAporte(id)).r.pasoARevision).toBe(false);
    expect((await conAporte(id)).r.pasoARevision).toBe(false);
    const tercera = await conAporte(id);
    expect(tercera.r).toMatchObject({
      acreditado: true,
      pasoARevision: true,
      campana: { id, creadorId: impulsora },
    });
    expect(await estadoDe(id)).toEqual({
      estado: 'por_revisar',
      revision: (antes?.revision ?? 0) + 1,
    });
    const historia = await db.execute<{ estado: string; motivo: string }>(
      sql`select estado, motivo from campana_ediciones where campana_id = ${id}::uuid order by revision desc limit 1`,
    );
    expect(historia.rows[0]).toEqual({
      estado: 'por_revisar',
      motivo: 'Trajo 3 personas nuevas: pasa a revisión.',
    });
    // Ya en revisión, la cuarta persona no la mueve ni cuenta.
    expect((await conAporte(id)).r.acreditado).toBe(false);
    expect(await repo.activasDe(impulsora)).toBeGreaterThanOrEqual(1);
  });

  it('revisarSiLlego cierra la carrera de dos personas que llegan a la vez', async () => {
    const id = await campana();
    for (let i = 0; i < 2; i++) {
      const actorId = await nuevoActor();
      await db.execute(
        sql`insert into campana_impulsos (actor_id, campana_id, como) values (${actorId}, ${id}::uuid, 'opiniones')`,
      );
    }
    expect(await repo.revisarSiLlego(id, 3)).toBeNull();
    expect(await repo.revisarSiLlego(id, 2)).toMatchObject({ id, creadorId: impulsora });
    expect((await estadoDe(id))?.estado).toBe('por_revisar');
    expect(await repo.revisarSiLlego(id, 2)).toBeNull();
  });

  it('la revisión muestra las reglas, las personas y lo que escribieron', async () => {
    const id = await campana();
    const { senal } = await conAporte(id, 50);
    await db.execute(
      sql`update campanas set estado = 'por_revisar', revision = revision + 1 where id = ${id}::uuid`,
    );
    const lista = await repo.paraRevisar();
    const fila = lista.find((c) => c.id === id);
    expect(fila).toMatchObject({
      personas: 1,
      impulsadaPor: 'Equipo de pruebas del impulso',
      contrato: { titulo: contrato.titulo },
      aportesTraidos: [{ id: senal, texto: 'Que el barrio tenga una biblioteca abierta.' }],
    });
  });

  it('los avisos no se duplican y llegan a la administración por su nombre de usuario', async () => {
    expect(await repo.idsDe([marca + 'b', 'nadie-se-llama-asi'])).toEqual([admin]);
    await repo.avisar(
      [admin, impulsora],
      `impulso:prueba:${marca}`,
      'Aviso de prueba.',
      '/gestion/campanas',
    );
    await repo.avisar([admin], `impulso:prueba:${marca}`, 'Aviso de prueba.', '/gestion/campanas');
    const r = await db.execute<{ n: number }>(
      sql`select count(*)::int as n from eventos_civicos where clave = ${`impulso:prueba:${marca}`}`,
    );
    expect(r.rows[0]?.n).toBe(2);
  });
});
