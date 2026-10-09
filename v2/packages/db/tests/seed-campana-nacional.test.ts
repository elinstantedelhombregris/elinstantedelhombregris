/**
 * La siembra de la campaña nacional, contra Postgres.
 *
 * ── POR QUÉ NO CORRE CONTRA `DATABASE_URL` ─────────────────────────────────
 *
 * **Escribe filas.** Necesita `DATABASE_URL_DESCARTABLE` (la define
 * `pnpm test:integration:local`) y se saltea sin ella, igual que
 * `seed-callejero-idempotencia.test.ts`.
 *
 * ── QUÉ AFIRMA ─────────────────────────────────────────────────────────────
 *
 * Que nazca una vez, con su edición, y que correrla otra vez no cambie nada
 * (ni siquiera un contrato que el responsable editó después); que se niegue
 * ante otro dueño y ante un responsable que no existe, no está activo o no
 * verificó el correo; y que el script de verdad —el archivo ejecutable— se
 * comporte igual y no filtre la clave del `--url`.
 *
 * Las suites de abajo usan un slug y un `id_local` propios para no pisarse con
 * la campaña real ni con otra suite que corra en paralelo. Sólo la última
 * (el script de punta a punta) usa el slug fijo, y se saltea si ya está
 * tomado.
 */
import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';

import { neon } from '@neondatabase/serverless';
import { SLUG_CAMPANA_NACIONAL, contratoCampanaSchema } from '@v2/shared';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-http';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  TEMAS_CAMPANA_NACIONAL,
  construirContratoNacional,
} from '../scripts/campana-nacional/contrato.js';
import {
  ErrorDeSiembra,
  resolverResponsable,
  sembrarCampanaNacional,
} from '../scripts/campana-nacional/sembrar.js';
import { CampanasRepository } from '../src/repositories/campanas.js';
import * as schema from '../src/schema/index.js';

import type { Db } from '../src/client.js';

const url = process.env['DATABASE_URL_DESCARTABLE'];
const dsuite = url ? describe : describe.skip;

if (!url) {
  process.stdout.write(
    '\n[seed-campana-nacional] Se saltea: falta DATABASE_URL_DESCARTABLE.\n' +
      '  Este archivo ESCRIBE filas; usá `pnpm test:integration:local`.\n\n',
  );
}

const HOY = '2026-10-09';

interface Cuenta {
  id: number;
  username: string;
}

dsuite('sembrar la campaña nacional', () => {
  const db: Db = drizzle(neon(url ?? ''), { schema });
  const marca = randomUUID();
  const slug = `mi-argentina-ideal-prueba-${marca}`;
  const idLocal = randomUUID();
  let responsable: Cuenta;
  let otraCuenta: Cuenta;
  let sinVerificar: Cuenta;
  let inactiva: Cuenta;
  const slugs = new Set<string>([slug]);
  const usuarios: number[] = [];

  const sembrar = (
    cuenta: Cuenta,
    extra: { aplicar?: boolean; hoy?: string; slug?: string; idLocal?: string } = {},
  ) =>
    sembrarCampanaNacional(db, {
      username: cuenta.username,
      aplicar: extra.aplicar ?? true,
      hoy: extra.hoy ?? HOY,
      slug: extra.slug ?? slug,
      idLocal: extra.idLocal ?? idLocal,
    });
  const filas = async (s = slug) =>
    (
      await db.execute<{
        id: string;
        creador_id: number;
        id_local: string;
        revision: number;
        estado: string;
        contrato: unknown;
        actualizada_en: string;
      }>(sql`select id, creador_id, id_local, revision, estado, contrato, actualizada_en::text from campanas where slug = ${s}`)
    ).rows;
  const ediciones = async (campanaId: string) =>
    (
      await db.execute<{ revision: number; estado: string; motivo: string; contrato: unknown }>(
        sql`select revision, estado, motivo, contrato from campana_ediciones where campana_id = ${campanaId}::uuid order by revision`,
      )
    ).rows;

  async function crearCuenta(
    sufijo: string,
    estado: { emailVerified: boolean; isActive: boolean },
  ): Promise<Cuenta> {
    const username = `camp-nac-${sufijo}-${marca}`;
    const r = await db.execute<{ id: number }>(sql`
      insert into users (username, email, name, password_hash, email_verified, is_active)
      values (${username}, ${username + '@test.local'}, ${'Prueba ' + sufijo}, 'no-login', ${estado.emailVerified}, ${estado.isActive})
      returning id`);
    const id = r.rows[0]?.id;
    if (!id) throw new Error('No se pudo crear la cuenta de prueba.');
    usuarios.push(id);
    return { id, username };
  }

  beforeAll(async () => {
    responsable = await crearCuenta('resp', { emailVerified: true, isActive: true });
    otraCuenta = await crearCuenta('otra', { emailVerified: true, isActive: true });
    sinVerificar = await crearCuenta('sinv', { emailVerified: false, isActive: true });
    inactiva = await crearCuenta('inac', { emailVerified: true, isActive: false });
  });

  afterAll(async () => {
    // Primero las campañas (las ediciones caen en cascada), después las cuentas.
    for (const s of slugs) await db.execute(sql`delete from campanas where slug = ${s}`);
    for (const id of usuarios) await db.execute(sql`delete from users where id = ${id}`);
  });

  it('los trece temas del contrato son exactamente los del catálogo cerrado de aportes', async () => {
    const r = await db.execute<{ clave: string }>(sql`select clave from temas order by orden`);
    const claves = r.rows.map((f) => f.clave);
    expect(claves).toEqual([...TEMAS_CAMPANA_NACIONAL]);
  });

  it('en seco no escribe nada y dice qué crearía', async () => {
    const r = await sembrar(responsable, { aplicar: false });
    expect(r.resultado).toBe('a_crear');
    expect(await filas()).toHaveLength(0);
  });

  it('crea la campaña abierta, en la edición 1, con su fila de historia', async () => {
    const r = await sembrar(responsable);
    expect(r.resultado).toBe('creada');
    const [campana, ...resto] = await filas();
    expect(resto).toHaveLength(0);
    expect(campana).toMatchObject({
      creador_id: responsable.id,
      id_local: idLocal,
      revision: 1,
      estado: 'abierta',
    });
    // El contrato guardado pasa el esquema que `GET /campanas` aplica a cada fila.
    expect(contratoCampanaSchema.parse(campana?.contrato)).toEqual(construirContratoNacional(HOY));
    expect(contratoCampanaSchema.parse(campana?.contrato).territorios).toEqual([]);

    const historia = await ediciones(campana?.id ?? '');
    expect(historia).toHaveLength(1);
    expect(historia[0]).toMatchObject({ revision: 1, estado: 'abierta' });
    expect(historia[0]?.motivo).toMatch(/campaña nacional permanente/);
    expect(contratoCampanaSchema.parse(historia[0]?.contrato)).toEqual(
      contratoCampanaSchema.parse(campana?.contrato),
    );
  });

  it('el catálogo público y la lectura por slug la ven y la parsean', async () => {
    const repo = new CampanasRepository(db);
    const catalogo = await repo.listar();
    const propia = catalogo.find((c) => c.slug === slug);
    expect(propia).toMatchObject({ revision: 1, estado: 'abierta' });
    // `GET /campanas` hace este parse con CADA fila: uno malo rompe el catálogo entero.
    for (const c of catalogo) expect(() => contratoCampanaSchema.parse(c.contrato)).not.toThrow();

    const detalle = await repo.porId(slug);
    expect(detalle).toMatchObject({ slug, revision: 1, estado: 'abierta' });
    expect(detalle?.historial).toHaveLength(1);
  });

  it('correrla de nuevo no cambia nada', async () => {
    const [antes] = await filas();
    const r = await sembrar(responsable);
    expect(r).toMatchObject({ resultado: 'ya_existe', campanaId: antes?.id, revision: 1 });
    const despues = await filas();
    expect(despues).toHaveLength(1);
    expect(despues[0]).toEqual(antes);
    expect(await ediciones(antes?.id ?? '')).toHaveLength(1);
  });

  it('en seco sobre una campaña ya sembrada tampoco hace ni dice otra cosa', async () => {
    const r = await sembrar(responsable, { aplicar: false });
    expect(r.resultado).toBe('ya_existe');
  });

  it('un contrato que el responsable editó después no se pisa, ni pasada la fecha de la primera etapa', async () => {
    const [campana] = await filas();
    const editado = { ...contratoCampanaSchema.parse(campana?.contrato), titulo: 'Mi Argentina ideal (edición 2)' };
    await db.execute(
      sql`update campanas set contrato = ${JSON.stringify(editado)}::jsonb, revision = 2 where id = ${campana?.id ?? ''}::uuid`,
    );
    // `hoy` ya pasó el cierre del 28/2/2027: reconstruir el contrato tiraría, pero no hace falta.
    const r = await sembrar(responsable, { hoy: '2027-06-01' });
    expect(r).toMatchObject({ resultado: 'ya_existe', revision: 2 });
    const [despues] = await filas();
    expect(despues?.revision).toBe(2);
    expect(contratoCampanaSchema.parse(despues?.contrato).titulo).toBe('Mi Argentina ideal (edición 2)');
  });

  it('otra cuenta no puede quedarse con una campaña ajena, y no se cambia nada', async () => {
    const [antes] = await filas();
    await expect(sembrar(otraCuenta)).rejects.toThrow(ErrorDeSiembra);
    await expect(sembrar(otraCuenta)).rejects.toThrow(/la abrió otra cuenta/);
    expect(await filas()).toEqual([antes]);
  });

  it('un responsable que no existe corta antes de escribir', async () => {
    const otroSlug = `${slug}-sin-cuenta`;
    slugs.add(otroSlug);
    const fantasma: Cuenta = { id: 0, username: `no-existe-${marca}` };
    await expect(sembrar(fantasma, { slug: otroSlug })).rejects.toThrow(/No existe ninguna cuenta/);
    expect(await filas(otroSlug)).toHaveLength(0);
  });

  it('un responsable sin correo verificado, o con la cuenta inactiva, corta antes de escribir', async () => {
    const otroSlug = `${slug}-no-apto`;
    slugs.add(otroSlug);
    await expect(sembrar(sinVerificar, { slug: otroSlug })).rejects.toThrow(/correo verificado/);
    await expect(sembrar(inactiva, { slug: otroSlug })).rejects.toThrow(/no está activa/);
    expect(await filas(otroSlug)).toHaveLength(0);
    await expect(resolverResponsable(db, responsable.username)).resolves.toEqual(responsable);
  });

  it('si la fecha ya pasó el cierre de la primera etapa y no existe, no la crea', async () => {
    const otroSlug = `${slug}-vencida`;
    slugs.add(otroSlug);
    await expect(sembrar(responsable, { slug: otroSlug, hoy: '2027-03-02' })).rejects.toThrow(
      /primera etapa cerró/,
    );
    expect(await filas(otroSlug)).toHaveLength(0);
  });

  it('el mismo envío con otro slug no abre una segunda campaña', async () => {
    const otroSlug = `${slug}-otro-slug`;
    slugs.add(otroSlug);
    await expect(sembrar(responsable, { slug: otroSlug })).rejects.toThrow(/mismo envío/);
    expect(await filas(otroSlug)).toHaveLength(0);
  });

  it('dos corridas a la vez dejan una sola campaña y una sola edición', async () => {
    const otroSlug = `${slug}-carrera`;
    slugs.add(otroSlug);
    // Mismo dueño, mismo slug y mismo envío: la segunda tiene que chocar con el slug y leer lo que dejó la primera.
    const envio = randomUUID();
    const resultados = await Promise.allSettled([
      sembrar(responsable, { slug: otroSlug, idLocal: envio }),
      sembrar(responsable, { slug: otroSlug, idLocal: envio }),
    ]);
    const filasFinales = await filas(otroSlug);
    expect(filasFinales).toHaveLength(1);
    expect(await ediciones(filasFinales[0]?.id ?? '')).toHaveLength(1);
    const creadas = resultados.filter(
      (r) => r.status === 'fulfilled' && r.value.resultado === 'creada',
    );
    expect(creadas.length).toBeGreaterThanOrEqual(1);
    for (const r of resultados) {
      if (r.status === 'rejected') expect(String(r.reason)).toMatch(/campanas_envio_unique|ya tiene otra campaña/);
    }
  });
});

/**
 * El archivo ejecutable de verdad, con el slug fijo. Es lo único que prueba el
 * cableado: la guardia de `--produccion`, el puente local, los códigos de
 * salida y que la clave del `--url` no aparezca en ninguna salida.
 */
dsuite('el script seed-campana-nacional', () => {
  const db: Db = drizzle(neon(url ?? ''), { schema });
  const marca = randomUUID();
  const claveFalsa = `clave-${marca}`;
  // Un rol propio de la corrida, con `claveFalsa` de clave de verdad. Si la
  // prueba le pusiera esa clave al usuario de `DATABASE_URL_DESCARTABLE`, el
  // script sólo conectaría contra un servidor que no mira la clave (el
  // `--auth=trust` de `integracion-local.sh`); el Postgres del CI sí la mira y
  // el script salía con «password authentication failed». Así la clave que no
  // tiene que filtrarse es la que el servidor exige en las dos configuraciones.
  const rol = `camp_nac_cli_${marca.replaceAll('-', '')}`;
  const usuarios: number[] = [];
  let urlConClave = '';
  let duenio = '';
  let ajeno = '';
  let slugTomado = false;
  const aqui = fileURLToPath(new URL('..', import.meta.url));

  const correr = (...args: string[]) => {
    const r = spawnSync(
      process.execPath,
      ['--import', 'tsx', 'scripts/seed-campana-nacional.ts', ...args],
      { cwd: aqui, encoding: 'utf8', timeout: 60_000 },
    );
    return { codigo: r.status, salida: r.stdout, error: r.stderr, todo: `${r.stdout}\n${r.stderr}` };
  };

  beforeAll(async () => {
    const previa = await db.execute<{ n: number }>(
      sql`select count(*)::int n from campanas where slug = ${SLUG_CAMPANA_NACIONAL}`,
    );
    slugTomado = (previa.rows[0]?.n ?? 0) > 0;
    // `marca` es un UUID: ni el rol ni la clave llevan nada que haya que escapar.
    await db.execute(sql.raw(`create role "${rol}" login password '${claveFalsa}'`));
    await db.execute(sql.raw(`grant all privileges on all tables in schema public to "${rol}"`));
    await db.execute(sql.raw(`grant all privileges on all sequences in schema public to "${rol}"`));
    const base = new URL(url ?? '');
    base.username = rol;
    base.password = claveFalsa;
    urlConClave = base.href;
    for (const sufijo of ['duenio', 'ajeno']) {
      const username = `camp-nac-cli-${sufijo}-${marca}`;
      const r = await db.execute<{ id: number }>(sql`
        insert into users (username, email, name, password_hash, email_verified)
        values (${username}, ${username + '@test.local'}, 'Prueba cli', 'no-login', true) returning id`);
      usuarios.push(r.rows[0]?.id ?? 0);
      if (sufijo === 'duenio') duenio = username;
      else ajeno = username;
    }
  });

  afterAll(async () => {
    // Solo se borra la campaña si la creó esta suite, o sea si es de una de sus cuentas.
    for (const id of usuarios) {
      await db.execute(sql`delete from campanas where slug = ${SLUG_CAMPANA_NACIONAL} and creador_id = ${id}`);
      await db.execute(sql`delete from users where id = ${id}`);
    }
    const rolCreado = await db.execute(sql`select 1 from pg_roles where rolname = ${rol}`);
    if (rolCreado.rows.length > 0) {
      await db.execute(sql.raw(`drop owned by "${rol}"`));
      await db.execute(sql.raw(`drop role "${rol}"`));
    }
  });

  it('se niega a una base remota sin --produccion, sin conectarse ni mostrar la clave', () => {
    const r = correr(
      `--url=postgresql://u:${claveFalsa}@ep-prueba-pooler.us-east-2.aws.neon.tech/neondb`,
      '--owner-username=juan',
      '--aplicar',
    );
    expect(r.codigo).toBe(2);
    expect(r.error).toContain('--produccion');
    expect(r.todo).not.toContain(claveFalsa);
  });

  it('sin --owner-username o sin --url sale con error de uso', () => {
    expect(correr(`--url=${urlConClave}`).codigo).toBe(2);
    expect(correr('--owner-username=juan').codigo).toBe(2);
  });

  it('en seco muestra host, base y responsable, imprime el contrato y no escribe', (ctx) => {
    if (slugTomado) ctx.skip();
    const r = correr(`--url=${urlConClave}`, `--owner-username=${duenio}`);
    expect(r.codigo).toBe(0);
    // El host de la base de la corrida: `127.0.0.1` en local, `localhost` en el CI.
    expect(r.salida).toContain(new URL(url ?? '').hostname);
    expect(r.salida).toContain(duenio);
    expect(r.salida).toContain('en seco');
    expect(r.salida).toContain('"responsable": "Juan Bravin"');
    expect(r.todo).not.toContain(claveFalsa);
  }, 60_000);

  it('con --aplicar la crea; la segunda vez dice «ya existe»; otro dueño sale con error', async (ctx) => {
    if (slugTomado) ctx.skip();
    const primera = correr(`--url=${urlConClave}`, `--owner-username=${duenio}`, '--aplicar');
    expect(primera.codigo).toBe(0);
    expect(primera.salida).toContain('Campaña creada');
    expect(primera.todo).not.toContain(claveFalsa);

    const segunda = correr(`--url=${urlConClave}`, `--owner-username=${duenio}`, '--aplicar');
    expect(segunda.codigo).toBe(0);
    expect(segunda.salida).toContain('ya existe');

    const otra = correr(`--url=${urlConClave}`, `--owner-username=${ajeno}`, '--aplicar');
    expect(otra.codigo).toBe(1);
    expect(otra.error).toContain('la abrió otra cuenta');
    expect(otra.todo).not.toContain(claveFalsa);

    const faltante = correr(`--url=${urlConClave}`, `--owner-username=no-existe-${marca}`, '--aplicar');
    expect(faltante.codigo).toBe(1);
    expect(faltante.error).toContain('No existe ninguna cuenta');

    const filas = await db.execute<{ n: number }>(
      sql`select count(*)::int n from campanas where slug = ${SLUG_CAMPANA_NACIONAL}`,
    );
    expect(filas.rows[0]?.n).toBe(1);
  }, 120_000);
});
