/**
 * Lo que la migración 0013 tiene que haber dejado cierto en la base.
 *
 * No prueba tipos: prueba el motor. Las afirmaciones son las cosas que un
 * `git revert` no deshace y que, si se hicieran mal, no fallarían hoy sino el
 * día que entren 17.986 filas de jerarquía y 326.832 calles.
 *
 * ── Tres suites, y la línea que las separa es a qué base escriben ───────────
 *
 * **La primera no toca la base.** Decide, con funciones puras, contra qué base
 * puede correr la que escribe. Corre siempre, incluso sin Postgres.
 *
 * **La segunda no escribe una sola fila.** Lee el catálogo del sistema y hace
 * un INSERT que TIENE que fallar, envuelto en una transacción que siempre
 * termina en ROLLBACK — así, el día que el CHECK no esté, el test se pone rojo
 * y la fila igual no queda. Corre contra `DATABASE_URL`.
 *
 * **La tercera escribe: crea un esquema, lo llena y lo tira.** Por eso NO corre
 * contra `DATABASE_URL`. Necesita `DATABASE_URL_DESCARTABLE`, una variable
 * propia que nadie tiene puesta por accidente, y se saltea con un mensaje
 * cuando no está. Que se saltee es correcto; que escriba en producción no.
 *
 * La versión anterior de este archivo llamaba veinticuatro veces a
 * `nextval('public.geographic_locations_id_seq')` —la secuencia de la tabla
 * REAL— desde el esquema descartable: quemaba 24 ids de producción por corrida
 * y el `drop schema` del `afterAll` no los devolvía. Acá la secuencia también
 * es descartable, y hay un test que lo afirma.
 */
import { PROVINCIAS_CANONICAS } from '@v2/civic-core';
import { config } from 'dotenv';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { claveDeProvincia } from '../scripts/clave-de-provincia.js';
import { elegirBaseDescartable, huellaDeBase } from '../src/base-descartable.js';

import { avisoDe0013, clasificar0013, estadoDe0013, saltea0013 } from './_migracion-0013.js';

import type { SQL } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

config({ path: new URL('../../../.env', import.meta.url).pathname });

// ---------------------------------------------------------------------------
// Contra qué base puede correr lo que escribe — la decisión, sin Postgres
// ---------------------------------------------------------------------------

/**
 * `huellaDeBase` y `elegirBaseDescartable` vivían acá adentro. Se mudaron a
 * `src/base-descartable.ts` cuando el escritor del esquema `simulacion` —que
 * siembra miles de filas sintéticas— necesitó la misma pregunta: dos copias de
 * «¿puedo romper esta base?» terminan en desacuerdo justo el día que importa.
 *
 * Se re-exportan desde acá porque las afirmaciones de más abajo son de este
 * archivo y siguen siendo las que definen el contrato.
 */
export { elegirBaseDescartable, huellaDeBase };
export type { BaseDescartable } from '../src/base-descartable.js';

/** La base viva. Acá sólo se lee. */
const URL_LECTURA = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;

const URLS_VIVAS = [process.env.DATABASE_URL, process.env.DATABASE_URL_UNPOOLED].filter(
  (u): u is string => typeof u === 'string' && u.length > 0,
);

const DESCARTABLE = elegirBaseDescartable(process.env.DATABASE_URL_DESCARTABLE, URLS_VIVAS);

const MOTIVOS: Record<'ausente' | 'es_la_viva' | 'ilegible', string> = {
  ausente: 'falta DATABASE_URL_DESCARTABLE',
  es_la_viva: 'DATABASE_URL_DESCARTABLE apunta a la MISMA base que DATABASE_URL',
  ilegible: 'DATABASE_URL_DESCARTABLE no es un DSN que se pueda leer',
};

if (!DESCARTABLE.corre) {
  process.stdout.write(
    `\n[migracion-0013] La suite que ESCRIBE se saltea: ${MOTIVOS[DESCARTABLE.motivo]}.\n` +
      '  Esa suite crea un esquema, lo llena y lo tira, así que no corre contra la base que\n' +
      '  sirve el sitio y no cae a DATABASE_URL a propósito. Para correrla, apuntá\n' +
      '  DATABASE_URL_DESCARTABLE a una rama efímera de Neon o a un Postgres local.\n\n',
  );
}

/**
 * En qué estado está la 0013 en la base viva. Se pregunta una sola vez, antes
 * de que se defina una sola suite, porque `describe.skip` se decide al
 * recolectar y no al correr.
 *
 * Toda esta suite afirma sobre el esquema que la 0013 deja. Contra el esquema
 * de antes no está fallando: está hablando de algo que todavía no existe, y eso
 * se saltea. Con la migración a medias, en cambio, corre y se pone roja —el
 * porqué está en `_migracion-0013.ts`—.
 */
const ESTADO_0013 = await estadoDe0013();
const AVISO_0013 = avisoDe0013(ESTADO_0013, 'migracion-0013');
if (AVISO_0013 !== null) process.stdout.write(AVISO_0013);

const suiteDeLectura = URL_LECTURA && !saltea0013(ESTADO_0013) ? describe : describe.skip;
const suiteDescartable = DESCARTABLE.corre ? describe : describe.skip;

/** El esquema descartable. Se crea y se tira dentro de la base descartable. */
const VACIO = 'prueba_0013_base_vacia';
/** La secuencia descartable. La de la tabla real no se toca ni de casualidad. */
const SECUENCIA = `${VACIO}.ids_de_prueba`;

describe('a qué base se le permite escribir', () => {
  const VIVA_POOLED =
    'postgresql://u:p@ep-flat-art-ajjmw0zc-pooler.c-3.us-east-2.aws.neon.tech/neondb?sslmode=require';
  const VIVA_DIRECTA =
    'postgresql://u:p@ep-flat-art-ajjmw0zc.c-3.us-east-2.aws.neon.tech/neondb?sslmode=require';

  it('sin la variable propia, la suite que escribe no corre — y no cae a DATABASE_URL', () => {
    // El default de «¿puedo romper esta base?» es que no.
    expect(elegirBaseDescartable(undefined, [VIVA_POOLED])).toEqual({
      corre: false,
      motivo: 'ausente',
    });
    expect(elegirBaseDescartable('', [VIVA_POOLED])).toEqual({ corre: false, motivo: 'ausente' });
  });

  it('la descartable no puede ser la base que sirve el sitio', () => {
    expect(elegirBaseDescartable(VIVA_POOLED, [VIVA_POOLED])).toEqual({
      corre: false,
      motivo: 'es_la_viva',
    });
  });

  it('el endpoint directo y el pooled de Neon son la MISMA base', () => {
    // El error más fácil de cometer: DATABASE_URL por el pooler,
    // DATABASE_URL_DESCARTABLE por el directo. Dos cadenas distintas, una sola
    // base, y los `drop schema` cayendo sobre el sitio.
    expect(elegirBaseDescartable(VIVA_DIRECTA, [VIVA_POOLED])).toEqual({
      corre: false,
      motivo: 'es_la_viva',
    });
    expect(elegirBaseDescartable(VIVA_POOLED, [VIVA_DIRECTA])).toEqual({
      corre: false,
      motivo: 'es_la_viva',
    });
  });

  it('un DSN que no se puede leer no se declara seguro', () => {
    // Lo que no se puede comparar contra las vivas no se puede afirmar que no
    // es una de ellas.
    expect(elegirBaseDescartable('no-es-un-dsn', [VIVA_POOLED])).toEqual({
      corre: false,
      motivo: 'ilegible',
    });
  });

  it('otra base sí corre', () => {
    const otra = 'postgresql://u:p@localhost:5432/descartable';
    expect(elegirBaseDescartable(otra, [VIVA_POOLED, VIVA_DIRECTA])).toEqual({
      corre: true,
      url: otra,
    });
    // Y la misma máquina con OTRA base tampoco es la viva.
    expect(
      elegirBaseDescartable(
        'postgresql://u:p@ep-flat-art-ajjmw0zc-pooler.c-3.us-east-2.aws.neon.tech/efimera',
        [VIVA_POOLED],
      ).corre,
    ).toBe(true);
  });

  it('la corrida de hoy no está a punto de escribir en la base que sirve el sitio', () => {
    // La misma decisión, sobre el entorno REAL de esta corrida. Es la que se
    // pone roja el día que alguien exporta DATABASE_URL_DESCARTABLE mal.
    expect(
      DESCARTABLE.corre ? 'otra base' : MOTIVOS[DESCARTABLE.motivo],
      'La suite que escribe está apuntada a la base que sirve el sitio.',
    ).not.toBe(MOTIVOS.es_la_viva);
  });
});

describe('cuándo estos tests tienen derecho a afirmar algo', () => {
  const si = (nombre: string) => ({ nombre, presente: true });
  const no = (nombre: string) => ({ nombre, presente: false });

  it('con todas las piezas puestas, la 0013 está aplicada y los tests corren', () => {
    expect(clasificar0013([si('parent_id'), si('name_norm')])).toEqual({ estado: 'aplicada' });
    expect(saltea0013({ estado: 'aplicada' })).toBe(false);
  });

  it('sin ninguna pieza no hay nada que probar todavía, y eso se saltea con su razón', () => {
    const estado = clasificar0013([no('parent_id'), no('name_norm')]);
    expect(estado).toEqual({ estado: 'sin_aplicar' });
    expect(saltea0013(estado)).toBe(true);
    // El salteo sin razón escrita se lee igual que un test que no existe.
    const aviso = avisoDe0013(estado, 'x');
    expect(aviso).toContain('NO está aplicada');
    expect(aviso).toContain('db:migrate');
  });

  it('media migración NO se saltea: se pone roja', () => {
    // El estado que nadie diseñó. Un `db:migrate` que muere a mitad de las
    // treinta y pico de sentencias de la 0013 deja la tabla con `parent_id` y
    // sin el CHECK de niveles, y saltearlo sería dejar verde una base rota.
    const estado = clasificar0013([si('parent_id'), no('geographic_locations_level_chk')]);
    expect(estado).toEqual({
      estado: 'a_medias',
      presentes: ['parent_id'],
      ausentes: ['geographic_locations_level_chk'],
    });
    expect(saltea0013(estado)).toBe(false);
    expect(avisoDe0013(estado, 'x')).toContain('A MEDIAS');
  });

  it('no haber mirado nada no cuenta como haber mirado y encontrado todo', () => {
    // Sobre la lista vacía, «están todas» es vacuamente cierto, y ésa es la
    // respuesta que se elige sola. Es la misma trampa que el `|| true`: verde
    // sin haber probado.
    const estado = clasificar0013([]);
    expect(estado.estado).not.toBe('aplicada');
    expect(saltea0013(estado)).toBe(false);
  });

  it('sin DSN no hay a quién preguntarle', () => {
    expect(saltea0013({ estado: 'sin_base' })).toBe(true);
    expect(avisoDe0013({ estado: 'sin_base' }, 'x')).toContain('DATABASE_URL');
  });

  it('cuando está aplicada no se imprime ningún aviso', () => {
    expect(avisoDe0013({ estado: 'aplicada' }, 'x')).toBeNull();
  });
});

suiteDeLectura('migración 0013 · la tierra (sin escribir una fila)', () => {
  // `max: 1` para que todas las sentencias caigan en la misma sesión.
  const pool = new pg.Pool(URL_LECTURA ? { connectionString: URL_LECTURA, max: 1 } : { max: 1 });
  const db = drizzle(pool);

  async function unaFila(consulta: SQL): Promise<Record<string, unknown>> {
    const { rows } = await db.execute(consulta);
    const fila = rows[0];
    if (!fila) throw new Error('la consulta no devolvió ninguna fila');
    return fila;
  }

  afterAll(async () => {
    await pool.end();
  });

  it('ninguna provincia queda sin padre y toda provincia es su propio padre', async () => {
    const { huerfanas } = await unaFila(sql`
      select count(*)::int as huerfanas from geographic_locations g
      left join geographic_locations p on p.id = g.province_id where p.id is null`);
    expect(huerfanas).toBe(0);

    const { malas } = await unaFila(sql`
      select count(*)::int as malas from geographic_locations
      where level = 'province' and province_id <> id`);
    expect(malas).toBe(0);
  });

  it('la secuencia de province_id no existe más', async () => {
    // Mientras exista, un INSERT que se olvide de `province_id` no falla: se
    // lleva un número que no apunta a ninguna provincia, en silencio. Ese fue
    // el bug durante trece migraciones.
    const { n } = await unaFila(sql`
      select count(*)::int as n from pg_class where relname = 'geographic_locations_province_id_seq'`);
    expect(n).toBe(0);
  });

  it('el vocabulario de niveles está cerrado y no incluye city', async () => {
    const { def } = await unaFila(sql`
      select pg_get_constraintdef(oid) as def from pg_constraint
       where conname = 'geographic_locations_level_chk'`);
    expect(String(def)).toContain("'locality'");
    expect(String(def)).toContain("'settlement'");
    expect(String(def)).not.toContain("'city'");
  });

  it('las 24 provincias tienen `name_norm` y `georef_id` — que es lo que la 0013 no llena sola', async () => {
    // La migración agrega las columnas VACÍAS y `seed-provinces.ts` saltea las
    // filas que ya existen. Si nadie corre el relleno, `findProvinceByName`
    // devuelve `undefined` para las 24, `provinciaIdDePunto` devuelve `null` y
    // toda señal nueva se guarda sin provincia — D-001 otra vez, y sin un solo
    // error que mirar. Este test es el único aviso que el sistema puede dar.
    const { aMedias } = await unaFila(sql`
      select count(*)::int as "aMedias" from geographic_locations
       where level = 'province' and (name_norm is null or georef_id is null)`);
    expect(
      aMedias,
      'Provincias sin `name_norm` o sin `georef_id`. Corré:\n' +
        '  pnpm --filter @v2/db geo:rellenar-provincias --aplicar',
    ).toBe(0);

    // Y que las claves escritas sean 24 distintas: si dos colapsaran, una de
    // las dos provincias dejaría de encontrarse y la otra respondería por ella.
    const { distintas } = await unaFila(sql`
      select count(distinct name_norm)::int as distintas from geographic_locations
       where level = 'province'`);
    expect(distintas).toBe(PROVINCIAS_CANONICAS.length);
  });

  it('el cero de georef no puede entrar como altura', async () => {
    // georef manda 0 cuando no sabe la altura. Un 0 guardado como altura sería
    // «la casa número cero», que no existe: el seed lo traduce a NULL y este
    // CHECK es la garantía de que nunca más entra por otra puerta.
    //
    // Va adentro de BEGIN/ROLLBACK a propósito. Este test afirma que un INSERT
    // FALLA; el día que el CHECK no esté, el INSERT anda — y sin la
    // transacción, el test que descubre el agujero sería también el que deja la
    // fila basura en la base que sirve el sitio.
    const cliente = await pool.connect();
    try {
      await cliente.query('begin');

      // La provincia existe a propósito: con un id inventado la que fallaría
      // sería la clave foránea y el test pasaría por la razón equivocada.
      const { rows } = await cliente.query<{ provincia: number | null }>(
        `select min(id)::int as provincia from geographic_locations where level = 'province'`,
      );
      const provincia = rows[0]?.provincia;
      if (typeof provincia !== 'number') {
        throw new Error('no hay ninguna provincia en la base: el test no puede decir nada');
      }

      await expect(
        cliente.query(
          `insert into geo_calles (georef_id, localidad_id, departamento_id, provincia_id,
             nombre, nombre_norm, nombre_clase, categoria, altura_desde)
           values ('0000000000001', $1, $1, $1, 'X', 'X', 'nominada', 'CALLE', 0)`,
          [provincia],
        ),
      ).rejects.toThrow(/geo_calles_desde_chk/);
    } finally {
      await cliente.query('rollback');
      cliente.release();
    }
  });
});

suiteDescartable('migración 0013 · sobre base vacía (ESCRIBE: base descartable)', () => {
  let pool: pg.Pool;
  let db: NodePgDatabase;
  /** Dónde estaba la secuencia de la tabla REAL antes de que esta suite corriera. */
  let secuenciaRealAntes = -1;

  beforeAll(async () => {
    if (!DESCARTABLE.corre) {
      throw new Error(`esta suite no puede correr: ${MOTIVOS[DESCARTABLE.motivo]}`);
    }
    pool = new pg.Pool({ connectionString: DESCARTABLE.url, max: 1 });
    db = drizzle(pool);
    secuenciaRealAntes = await ultimoValorDeLaSecuenciaReal();
  });

  async function ultimoValorDeLaSecuenciaReal(): Promise<number> {
    const { ultimo } = await unaFila(
      sql.raw(`select last_value::int as ultimo from public.geographic_locations_id_seq`),
    );
    return Number(ultimo);
  }

  afterAll(async () => {
    await db.execute(sql.raw(`drop schema if exists ${VACIO} cascade`));
    await pool.end();
  });

  async function unaFila(consulta: SQL): Promise<Record<string, unknown>> {
    const { rows } = await db.execute(consulta);
    const fila = rows[0];
    if (!fila) throw new Error('la consulta no devolvió ninguna fila');
    return fila;
  }

  it('sembrar las 24 provincias funciona sin una sola fila previa', async () => {
    // `province_id` es NOT NULL y sin default desde esta migración. El INSERT
    // de antes —el que dejaba que la secuencia inventara el valor— tiene que
    // morir, y el de `seed-provinces.ts` tiene que andar sin una sola fila
    // previa: es el caso de CI con branch limpio y el de cualquier dev local.
    //
    // No se puede vaciar `public.geographic_locations` para probarlo —hay nueve
    // columnas de otras tablas apuntándole— así que se levanta una copia de la
    // tabla, se le corre la misma sentencia y se la tira.
    await db.execute(sql.raw(`drop schema if exists ${VACIO} cascade`));
    await db.execute(sql.raw(`create schema ${VACIO}`));
    await db.execute(
      sql.raw(
        `create table ${VACIO}.geographic_locations
           (like public.geographic_locations including all)`,
      ),
    );
    // `LIKE ... INCLUDING ALL` copia también el DEFAULT de la columna `id`, y
    // ese default nombra la secuencia de la tabla REAL. Dejarlo ahí es lo que
    // hacía que probar «sobre base vacía» consumiera ids de la tabla viva.
    //
    // Se RE-APUNTA y no se dropea: sin default, el INSERT de abajo moriría por
    // `id` y no por `province_id`, y el test pasaría por la razón equivocada
    // —afirmando sobre la columna que no es—. Se comprobó: dropeándolo, el
    // error que llega es «null value in column "id"».
    await db.execute(sql.raw(`create sequence ${SECUENCIA}`));
    await db.execute(
      sql.raw(
        `alter table ${VACIO}.geographic_locations
           alter column id set default nextval('${SECUENCIA}')`,
      ),
    );

    // Desde la `0015` este INSERT viola DOS NOT NULL: `province_id` y
    // `georef_id`. Sigue diciendo `province_id` porque Postgres recorre los
    // atributos por `attnum` ascendente y aborta en el primero que falta:
    // `province_id` nació en la `0002` y `georef_id` lo agregó la `0013`, así
    // que el primero tiene el número más chico. Está anotado porque si algún
    // día esta línea empieza a fallar con `georef_id`, la causa no es esta
    // migración sino un orden de columnas que cambió.
    await expect(
      db.execute(
        sql.raw(`insert into ${VACIO}.geographic_locations (level, name) values ('province', 'X')`),
      ),
    ).rejects.toThrow(/province_id/);

    // La misma sentencia y el mismo normalizador que `seed-provinces.ts`. La
    // lista se importa del módulo canónico y no se copia: el defecto que esto
    // caza es justamente que las dos listas se separen.
    for (const provincia of PROVINCIAS_CANONICAS) {
      const nameNorm = claveDeProvincia(provincia.name);
      await db.execute(sql`
        with nuevo as (select nextval(${sql.raw(`'${SECUENCIA}'`)})::int as id)
        insert into ${sql.raw(`${VACIO}.geographic_locations`)}
          (id, province_id, level, name, georef_id, name_norm)
        select nuevo.id, nuevo.id, 'province', ${provincia.name}::text,
               ${provincia.georefId}::text, ${nameNorm}::text
          from nuevo
        on conflict (georef_id) do update set name_norm = excluded.name_norm
          where geographic_locations.name_norm is distinct from excluded.name_norm`);
    }

    const { sembradas } = await unaFila(
      sql.raw(`select count(*)::int as sembradas from ${VACIO}.geographic_locations`),
    );
    expect(sembradas).toBe(PROVINCIAS_CANONICAS.length);

    const { sinPadre } = await unaFila(
      sql.raw(
        `select count(*)::int as "sinPadre" from ${VACIO}.geographic_locations where province_id <> id`,
      ),
    );
    expect(sinPadre).toBe(0);

    // Y que nazcan ENCONTRABLES, que es la mitad que la versión anterior de
    // este test no miraba: sembraba `name_norm` en NULL y lo daba por bueno.
    const { aMedias } = await unaFila(
      sql.raw(
        `select count(*)::int as "aMedias" from ${VACIO}.geographic_locations
          where name_norm is null or georef_id is null`,
      ),
    );
    expect(aMedias).toBe(0);
  });

  it('la corrida no movió un solo id de la secuencia de la tabla real', async () => {
    // La afirmación que le da sentido a toda la separación, y está escrita
    // sobre la propiedad y no sobre un proxy: la versión anterior de este
    // archivo llamaba 24 veces a `nextval('public.geographic_locations_id_seq')`
    // y este número habría subido de 24 en 24 por corrida. Los ids quemados no
    // vuelven: el `drop schema` del `afterAll` no los devuelve.
    expect(await ultimoValorDeLaSecuenciaReal()).toBe(secuenciaRealAntes);

    // Y que no sea vacuo: los ids salieron de algún lado, y ese lado es la
    // secuencia descartable.
    const { propia } = await unaFila(sql.raw(`select last_value::int as propia from ${SECUENCIA}`));
    expect(Number(propia)).toBeGreaterThanOrEqual(PROVINCIAS_CANONICAS.length);
  });
});
