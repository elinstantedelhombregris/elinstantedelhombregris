/**
 * El callejero y el territorio, del lado de las consultas.
 *
 * Plan: `docs/plans/2026-08-11-tierra-senal-corroboracion-registro.md`, Task 3.
 * Spec: `docs/specs/2026-08-11-a-la-tierra.md` §4.2 y §8.1 (guardas 9 y 11).
 *
 * Dos mitades, y la división no es de comodidad.
 *
 * **La primera no toca la base y corre siempre.** Es la de la traducción de
 * nombres: los alias de provincia y el mínimo por scope. Se puede afirmar sin
 * Postgres porque son funciones puras, y afirmarla acá vale porque el defecto
 * que caza —«Tierra del Fuego» contra «Tierra del Fuego, Antártida e Islas del
 * Atlántico Sur»— no falla en una consulta: falla en la provincia 24 de 24 de
 * una corrida de cuatro minutos.
 *
 * **La segunda necesita Postgres y se saltea sin `DATABASE_URL`.** Es la del
 * plan de ejecución, que es la única forma de probar que las tres consultas de
 * §4.2 usan los tres btree: sobre 326.832 filas un seq scan devuelve exactamente
 * las mismas calles que un index scan, así que ningún test de resultados lo
 * puede ver.
 *
 * **Este archivo no escribe una sola fila.** Se puede correr contra la base de
 * producción sin dejar rastro, que es la única forma de que alguien lo corra
 * después del seed, que es cuando recién empieza a decir algo.
 */
import { readFileSync } from 'node:fs';

import { neon } from '@neondatabase/serverless';
import { normalizarNombreDeLugar } from '@v2/civic-core';
import { config } from 'dotenv';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-http';
import { beforeAll, describe, expect, it } from 'vitest';

import { getDb } from '../src/client.js';
import { GeoCallesRepository } from '../src/repositories/geo-calles.js';
import {
  GeographicRepository,
  NIVELES_DE_LOCALIDAD,
  NIVELES_DE_LUGAR,
  normalizeProvinceName,
} from '../src/repositories/geographic.js';
import * as schema from '../src/schema/index.js';

import { avisoDe0013, estadoDe0013, saltea0013 } from './_migracion-0013.js';

import type { Db } from '../src/client.js';
import type { AmbitoDeBusqueda } from '../src/repositories/geo-calles.js';
import type { SQL } from 'drizzle-orm';

config({ path: new URL('../../../.env', import.meta.url).pathname });

const url = process.env.DATABASE_URL;
const dsuite = url ? describe : describe.skip;

/**
 * Cuatro de los tests de abajo consultan el esquema que la `0013` deja: la
 * columna `name_norm`, la columna `parent_id` que el `select()` de drizzle
 * nombra siempre, y el CHECK de niveles. Contra el esquema de antes no fallan
 * por lo que afirman —fallan por «column "parent_id" does not exist"»—, y un
 * rojo así dice «todavía no corriste la migración», que hoy es el estado
 * correcto: la `0013` está escrita y sin aplicar a propósito.
 *
 * Con la migración a MEDIAS no se saltean: corren y se ponen rojos. El porqué
 * está en `_migracion-0013.ts`.
 */
const ESTADO_0013 = await estadoDe0013();
const AVISO_0013 = url ? avisoDe0013(ESTADO_0013, 'geo-calles') : null;
if (AVISO_0013 !== null) process.stdout.write(AVISO_0013);

/** `it` para los tests que sólo pueden hablar con la `0013` aplicada. */
const conLa0013 = it.skipIf(saltea0013(ESTADO_0013));

/**
 * Los nombres se leen del archivo generado y no se copian: el defecto que la
 * guarda 9 caza es justamente que los dos lados se separen. Si mañana
 * `pnpm geo:provincias` regenera el GeoJSON con un nombre distinto, este test
 * tiene que enterarse solo.
 */
const NOMBRES_DEL_GEOJSON: readonly string[] = (() => {
  const texto = readFileSync(
    new URL('../../../apps/api/src/features/geographic/provincias.generated.ts', import.meta.url),
    'utf8',
  );
  return [...texto.matchAll(/"nombre":"([^"]+)"/g)].map((m) => m[1] ?? '');
})();

/** Cómo llama georef a la provincia 24. No es una variante tipográfica. */
const TIERRA_DEL_FUEGO_GEOREF = 'Tierra del Fuego, Antártida e Islas del Atlántico Sur';

describe('los nombres de provincia, sin base', () => {
  it('el archivo generado sigue teniendo las 24, y ninguna se llama igual que otra', () => {
    expect(NOMBRES_DEL_GEOJSON).toHaveLength(24);
    expect(new Set(NOMBRES_DEL_GEOJSON).size).toBe(24);
  });

  it('los 24 nombres del GeoJSON caen en 24 claves distintas de `name_norm`', () => {
    // Si dos colapsaran a la misma clave, la búsqueda por nombre devolvería la
    // provincia equivocada sin ningún error de por medio.
    const claves = NOMBRES_DEL_GEOJSON.map((n) =>
      normalizarNombreDeLugar(normalizeProvinceName(n)),
    );
    expect(new Set(claves).size).toBe(24);
    expect(claves).not.toContain('');
  });

  it('el normalizador solo no alcanza para Tierra del Fuego: por eso hay tabla de alias', () => {
    // Esta es la afirmación que justifica que `normalizeProvinceName` exista.
    // Un normalizador de texto no puede saber que dos nombres DISTINTOS nombran
    // el mismo lugar; sacarle la tabla de alias rompe el seed en la provincia 24.
    expect(normalizarNombreDeLugar(TIERRA_DEL_FUEGO_GEOREF)).not.toBe(
      normalizarNombreDeLugar('Tierra del Fuego'),
    );
    expect(normalizeProvinceName(TIERRA_DEL_FUEGO_GEOREF)).toBe('Tierra del Fuego');
  });

  it('CABA sigue entrando por sus tres nombres', () => {
    const canonico = 'Ciudad Autónoma de Buenos Aires';
    expect(normalizeProvinceName('CABA')).toBe(canonico);
    expect(normalizeProvinceName('caba')).toBe(canonico);
    expect(normalizeProvinceName('Ciudad de Buenos Aires')).toBe(canonico);
    // El nombre que trae el GeoJSON, que es el que llega desde el punto.
    expect(normalizeProvinceName(canonico)).toBe(canonico);
  });

  it('un nombre que no es alias vuelve tal cual, sin tildes comidas', () => {
    // La tabla de alias TRADUCE; normalizar es de la otra función y del otro
    // lado. Si esto devolviera «CORDOBA», habría dos normalizadores.
    expect(normalizeProvinceName('  Córdoba  ')).toBe('Córdoba');
    expect(normalizeProvinceName('Provincia Inventada')).toBe('Provincia Inventada');
  });

  it('todo nivel que la clase usa en un filtro está en el vocabulario cerrado', () => {
    // Guarda 11, la mitad que no necesita la base. La otra mitad —que el
    // vocabulario coincide con el CHECK— está más abajo.
    for (const nivel of NIVELES_DE_LOCALIDAD) {
      expect(NIVELES_DE_LUGAR).toContain(nivel);
    }
    expect(NIVELES_DE_LUGAR).not.toContain('city');
  });
});

describe('la búsqueda de calle que no llega a consultar', () => {
  // Un cliente sobre un DSN que no existe: estas dos ramas cortan ANTES de
  // tocar la red, y eso es exactamente lo que se está afirmando.
  const dbFalso: Db = drizzle(neon('postgres://nadie:nada@ninguna.parte.invalid/vacio'), {
    schema,
  });
  const repo = new GeoCallesRepository(dbFalso);

  it('`q=%` no devuelve la localidad entera: devuelve «no miramos»', async () => {
    // `%` sobrevive a NFD, a las mayúsculas y al colapso de espacios, pero no al
    // normalizador, que lo elimina. Lo que queda es la cadena vacía, y una
    // cadena vacía adentro de `LIKE '%%'` sería la localidad entera.
    const resultado = await repo.buscarCalles({
      scope: { ambito: 'localidad', id: 1 },
      q: '%',
      categorias: ['CALLE', 'AV'],
    });
    expect(resultado.estado).toBe('consulta_corta');
    expect(resultado.normalizado).toBe('');
  });

  it('el scope de provincia no consulta con menos de tres caracteres', async () => {
    // Con menos de tres no hay un trigrama completo: el GIN no puede ayudar y la
    // consulta sería un scan de la provincia entera.
    const resultado = await repo.buscarCalles({
      scope: { ambito: 'provincia', id: 14 },
      q: 'mo',
      categorias: [],
    });
    expect(resultado).toEqual({ estado: 'consulta_corta', normalizado: 'MO', minimo: 3 });
  });

  it('la categoría se le saca al texto de la persona, igual que al del Estado', async () => {
    // `nombre_norm` se guarda sin el prefijo de categoría, así que la consulta
    // tiene que sacárselo también a lo que escribe la persona: si no, «AV JOSE»
    // no encontraría nunca a «AV JOSE MARIA MORENO». Acá el «AV» se va y queda
    // una sola letra, que no llega al mínimo — o sea que el corte corrió.
    const resultado = await repo.buscarCalles({
      scope: { ambito: 'provincia', id: 14 },
      q: 'Av M',
      categorias: ['AV', 'CALLE'],
    });
    expect(resultado).toEqual({ estado: 'consulta_corta', normalizado: 'M', minimo: 3 });
  });

  it('una calle cuyo nombre ENTERO es su categoría no queda en la nada', async () => {
    // El caso degenerado de §4.2: sacar el prefijo dejaría la cadena vacía, y
    // contra una columna `nombre_norm text NOT NULL` eso revienta. No se saca.
    const resultado = await repo.buscarCalles({
      scope: { ambito: 'provincia', id: 14 },
      q: 'av',
      categorias: ['AV', 'CALLE'],
    });
    expect(resultado).toEqual({ estado: 'consulta_corta', normalizado: 'AV', minimo: 3 });
  });
});

dsuite('el callejero contra Postgres', () => {
  let db: Db;
  let geo: GeographicRepository;
  let calles: GeoCallesRepository;

  beforeAll(() => {
    db = getDb();
    geo = new GeographicRepository(db);
    calles = new GeoCallesRepository(db);
  });

  async function unaFila<T extends Record<string, unknown>>(consulta: SQL): Promise<T> {
    const { rows } = await db.execute<T>(consulta);
    const fila = rows[0];
    if (!fila) throw new Error('la consulta no devolvió ninguna fila');
    return fila;
  }

  /**
   * Cuántas calles hay, o `null` si la tabla todavía no existe.
   *
   * El `null` no es cortesía: antes de aplicar la `0013` la consulta de conteo
   * ni siquiera parsea, y un test que revienta en el setup se lee igual que un
   * test que encontró algo. Con `null`, los que miden el plan se saltean
   * diciendo por qué, y los que prueban la migración siguen rojos, que es lo
   * que tienen que estar.
   */
  async function cuantasCalles(): Promise<number | null> {
    const { existe } = await unaFila<{ existe: string | null }>(
      sql`select to_regclass('public.geo_calles')::text as existe`,
    );
    if (existe === null) return null;
    const { n } = await unaFila<{ n: number }>(sql`select count(*)::int as n from geo_calles`);
    return n;
  }

  conLa0013('todo nivel usado en un filtro está en `geographic_locations_level_chk`', async () => {
    // Guarda 11. El defecto que caza es el que esta misma clase tenía:
    // `level = 'city'` devolvía cero filas y no fallaba nunca.
    const { def } = await unaFila<{ def: string }>(sql`
      select pg_get_constraintdef(oid) as def from pg_constraint
       where conname = 'geographic_locations_level_chk'`);
    for (const nivel of NIVELES_DE_LUGAR) {
      expect(def).toContain(`'${nivel}'`);
    }
    expect(def).not.toContain("'city'");
  });

  conLa0013('las 24 provincias se siguen encontrando por su nombre', async () => {
    // Guarda 9, y el test que caza la regresión silenciosa: `findProvinceByName`
    // es el final del camino de `provinciaIdDePunto`, o sea de D-001. Si acá
    // devuelve `undefined`, cada captura con punto se guarda sin provincia y
    // desaparece de todo lo que agrega por territorio, sin un solo error.
    //
    // Se pone rojo mientras `name_norm` esté en NULL en las 24 filas vivas: la
    // fase 1 del seed (Task 5, Step 1) es la que las reconcilia.
    const faltantes: string[] = [];
    for (const nombre of NOMBRES_DEL_GEOJSON) {
      const fila = await geo.findProvinceByName(nombre);
      if (fila === undefined) faltantes.push(nombre);
    }
    expect(faltantes).toEqual([]);
  });

  conLa0013('georef nombra a Tierra del Fuego distinto y la encuentra igual', async () => {
    const fila = await geo.findProvinceByName(TIERRA_DEL_FUEGO_GEOREF);
    expect(fila?.name).toBe('Tierra del Fuego');
  });

  conLa0013(
    'buscar una localidad que no existe dice que no existe, no que hubo un error',
    async () => {
      // La consulta corre contra el esquema nuevo: si todavía filtrara
      // `level = 'city'` esto pasaría igual, y por eso además está la guarda 11.
      const provincias = await geo.listProvinces();
      const primera = provincias[0];
      expect(primera).toBeDefined();
      if (!primera) return;
      const busqueda = await geo.findLocalidad('ZZZ Localidad Inventada', primera.id);
      expect(busqueda.estado).toBe('sin_coincidencia');
    },
  );

  it('ninguna consulta de búsqueda hace seq scan sobre geo_calles', async (ctx) => {
    // Sobre una tabla vacía Postgres elige seq scan porque es más barato, y
    // tendría razón: este test sólo dice algo con el callejero sembrado.
    const n = await cuantasCalles();
    if (n === null || n < 10_000) ctx.skip();

    const { conTrgm } = await unaFila<{ conTrgm: number }>(sql`
      select count(*)::int as "conTrgm" from pg_extension where extname = 'pg_trgm'`);

    // El scope de provincia se ordena con `similarity()`, que llega con la
    // extensión `pg_trgm` de la migración 0014: antes de esa migración no hay
    // plan que mirar, y saltearlo es más honesto que afirmarlo a medias.
    const ambitos: AmbitoDeBusqueda[] =
      conTrgm > 0 ? ['localidad', 'departamento', 'provincia'] : ['localidad', 'departamento'];
    for (const ambito of ambitos) {
      const plan = (
        await calles.explicarBusqueda({
          scope: { ambito, id: 1 },
          // Tres caracteres: el mínimo del scope más caro, o sea el peor caso
          // que los tres scopes tienen que aguantar.
          q: 'MOR',
          categorias: [],
        })
      ).join('\n');
      expect(plan, `scope ${ambito}:\n${plan}`).not.toContain('Seq Scan on geo_calles');
    }
  });

  it('el paquete offline tampoco barre la tabla entera', async (ctx) => {
    const n = await cuantasCalles();
    if (n === null || n < 10_000) ctx.skip();

    for (const ambito of ['localidad', 'departamento'] as const) {
      const plan = (await calles.explicarPaquete(ambito, 1)).join('\n');
      expect(plan, `paquete ${ambito}:\n${plan}`).not.toContain('Seq Scan on geo_calles');
    }
  });

  it('la búsqueda no muestra las sin nombre ni las retiradas, y `porId` sí', async (ctx) => {
    const n = await cuantasCalles();
    if (n === null || n < 10_000) ctx.skip();

    const { id } = await unaFila<{ id: number | null }>(sql`
      select min(id)::int as id from geo_calles where nombre_clase = 'sin_nombre'`);
    if (id === null) {
      ctx.skip();
      return;
    }

    const calle = await calles.porId(id);
    expect(calle?.nombreClase).toBe('sin_nombre');

    const categorias = await calles.listarCategorias();
    const busqueda = await calles.buscarCalles({
      scope: { ambito: 'localidad', id: calle?.localidad.id ?? 0 },
      q: calle?.nombre ?? '',
      categorias,
      limite: 50,
    });
    if (busqueda.estado === 'buscada') {
      expect(busqueda.calles.map((c) => c.id)).not.toContain(id);
    }
  });
});
