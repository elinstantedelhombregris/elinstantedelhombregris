/**
 * Los trece temas: la migración `0031` suma Justicia y Economía al catálogo.
 *
 * El 9/10/2026 el dueño del producto decidió que el catálogo cerrado de temas
 * pasa de once a trece. La `0022` sembró los once (y su test, al lado, sigue
 * afirmando que esos once no cambian); la `0031` agrega los dos nuevos y no toca
 * nada más.
 *
 * ── Dos suites ─────────────────────────────────────────────────────────────
 *
 * **La primera no toca la base**: lee el `.sql` y el registro de migraciones y
 * afirma lo que el motor va a ejecutar. La guarda que más vale es la del
 * registro: el migrador de drizzle aplica sólo las entradas cuyo `when` es
 * mayor que el de la última aplicada, así que una entrada con fecha vieja se
 * saltea en silencio y el catálogo queda en once sin que nada falle.
 *
 * **La segunda lee el catálogo real** (`temas`, sin escribir una fila) y corre
 * el texto de la `0031` sobre una tabla temporal con las mismas restricciones,
 * dentro de una transacción que siempre termina en ROLLBACK. Se saltea mientras
 * la tabla `temas` no exista.
 */
import { readFileSync } from 'node:fs';

import { MAX_TEMAS } from '@v2/shared';
import { config } from 'dotenv';
import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

config({ path: new URL('../../../.env', import.meta.url).pathname });

const MIGRACION = '0031_temas_justicia_economia';
const SQL_0031 = readFileSync(new URL(`../migrations/${MIGRACION}.sql`, import.meta.url), 'utf8');

interface EntradaDelRegistro {
  idx: number;
  when: number;
  tag: string;
}
const registro = JSON.parse(
  readFileSync(new URL('../migrations/meta/_journal.json', import.meta.url), 'utf8'),
) as { entries: EntradaDelRegistro[] };

/** Los trece, en el orden del catálogo: los once de la `0022` y los dos de la `0031`. */
const LOS_TRECE: readonly (readonly [string, string, number])[] = [
  ['alimento', 'Alimento', 1],
  ['vivienda', 'Vivienda', 2],
  ['trabajo', 'Trabajo', 3],
  ['cuidado', 'Cuidado', 4],
  ['salud', 'Salud', 5],
  ['educación', 'Educación', 6],
  ['ambiente', 'Ambiente', 7],
  ['movilidad', 'Movilidad', 8],
  ['seguridad', 'Seguridad', 9],
  ['cultura', 'Cultura', 10],
  ['democracia', 'Democracia', 11],
  ['justicia', 'Justicia', 12],
  ['economía', 'Economía', 13],
];

describe('la migración 0031, tal como está escrita', () => {
  it('agrega Justicia y Economía con el orden 12 y 13, y nada más', () => {
    const filas = [...SQL_0031.matchAll(/^\s*\('([^']+)',\s*'([^']+)',\s*(\d+)\)/gmu)].map((m) => [
      m[1],
      m[2],
      Number(m[3]),
    ]);
    expect(filas).toEqual([
      ['justicia', 'Justicia', 12],
      ['economía', 'Economía', 13],
    ]);
    expect(SQL_0031.match(/INSERT INTO/gu)).toHaveLength(1);
    expect(SQL_0031).toContain('INSERT INTO "temas" ("clave", "etiqueta", "orden")');
    expect(SQL_0031).not.toMatch(/\b(CREATE|ALTER|DROP|DELETE|UPDATE|TRUNCATE)\b/u);
  });

  it('el ON CONFLICT no nombra un objetivo: cubre la clave repetida y el orden repetido', () => {
    expect(SQL_0031).toMatch(/ON CONFLICT DO NOTHING;/u);
    expect(SQL_0031).not.toMatch(/ON CONFLICT\s*\(/u);
    expect(SQL_0031).not.toMatch(/ON CONFLICT ON CONSTRAINT/u);
  });

  it('el registro de migraciones la lista última, con una fecha posterior a la de la anterior', () => {
    const entradas = registro.entries;
    const ultima = entradas.at(-1);
    const anterior = entradas.at(-2);
    expect(ultima?.tag).toBe(MIGRACION);
    expect(anterior?.tag).toBe('0030_exportaciones_durables');
    // El migrador de drizzle sólo aplica lo que tenga `when` mayor que el último aplicado.
    expect(ultima?.when).toBeGreaterThan(anterior?.when ?? Number.POSITIVE_INFINITY);
    expect(ultima?.idx).toBe((anterior?.idx ?? -2) + 1);
  });

  it('el tope de temas de una campaña o ficha alcanza para todo el catálogo', () => {
    expect(MAX_TEMAS).toBeGreaterThanOrEqual(LOS_TRECE.length);
  });
});

// ---------------------------------------------------------------------------
// El catálogo real, contra Postgres
// ---------------------------------------------------------------------------

const URL_BASE = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;

async function catalogoExiste(): Promise<boolean> {
  if (URL_BASE === undefined || URL_BASE.length === 0) return false;
  const pool = new pg.Pool({ connectionString: URL_BASE, max: 1 });
  try {
    const { rows } = await pool.query<{ hay: boolean }>(
      `select to_regclass('public.temas') is not null as hay`,
    );
    return rows[0]?.hay === true;
  } finally {
    await pool.end();
  }
}

const APLICADA = await catalogoExiste();
if (!APLICADA) {
  process.stdout.write(
    '\n[temas-trece] El catálogo real se saltea: no hay tabla `temas` (o no hay DATABASE_URL).\n' +
      '  Para habilitarlo:  pnpm test:integration:local\n\n',
  );
}
const suiteViva = APLICADA ? describe : describe.skip;

suiteViva('el catálogo de temas de la base', () => {
  let pool: pg.Pool;

  beforeAll(() => {
    pool = new pg.Pool({ connectionString: URL_BASE, max: 1 });
  });
  afterAll(async () => {
    await pool.end();
  });

  it('tiene trece temas, con Justicia en el 12 y Economía en el 13', async () => {
    const { rows } = await pool.query<{ clave: string; etiqueta: string; orden: number }>(
      'select clave, etiqueta, orden from temas order by orden',
    );
    expect(rows).toHaveLength(13);
    expect(rows.map((f) => [f.clave, f.etiqueta, f.orden])).toEqual(LOS_TRECE);
    expect(rows.find((f) => f.orden === 12)).toMatchObject({ clave: 'justicia' });
    expect(rows.find((f) => f.orden === 13)).toMatchObject({ clave: 'economía' });
    expect(rows.length).toBeLessThanOrEqual(MAX_TEMAS);
  });

  /**
   * Corre el texto de la `0031` sobre una copia temporal de `temas` (mismas
   * restricciones: clave primaria y orden único) y devuelve lo que queda. El
   * ROLLBACK final no deja nada, ni siquiera la tabla temporal.
   */
  const correSobreCopia = async (
    previas: readonly (readonly [string, string, number])[],
    veces: number,
  ): Promise<[string, number][]> => {
    const sobreCopia = SQL_0031.replace('INSERT INTO "temas"', 'INSERT INTO "temas_prueba"');
    expect(sobreCopia).not.toBe(SQL_0031);
    const cliente = await pool.connect();
    try {
      await cliente.query('begin');
      await cliente.query('create temp table temas_prueba (like temas including all)');
      for (const [clave, etiqueta, orden] of previas) {
        await cliente.query('insert into temas_prueba values ($1, $2, $3)', [
          clave,
          etiqueta,
          orden,
        ]);
      }
      for (let i = 0; i < veces; i += 1) await cliente.query(sobreCopia);
      const { rows } = await cliente.query<{ clave: string; orden: number }>(
        'select clave, orden from temas_prueba order by orden',
      );
      return rows.map((f) => [f.clave, f.orden]);
    } finally {
      await cliente.query('rollback');
      cliente.release();
    }
  };

  it('sobre un catálogo de once suma los dos nuevos, y correrla de nuevo no cambia nada', async () => {
    const once = LOS_TRECE.slice(0, 11);
    const esperado = LOS_TRECE.map(([clave, , orden]): [string, number] => [clave, orden]);
    expect(await correSobreCopia(once, 1)).toEqual(esperado);
    expect(await correSobreCopia(once, 2)).toEqual(esperado);
  });

  it('si el orden 12 ya estaba tomado por otra clave, no rompe la migración', async () => {
    const tomado = [...LOS_TRECE.slice(0, 11), ['otra', 'Otra', 12] as const];
    // `justicia` se saltea por el orden repetido; `economía` entra igual.
    expect(await correSobreCopia(tomado, 1)).toEqual([
      ...LOS_TRECE.slice(0, 11).map(([clave, , orden]): [string, number] => [clave, orden]),
      ['otra', 12],
      ['economía', 13],
    ]);
  });
});
