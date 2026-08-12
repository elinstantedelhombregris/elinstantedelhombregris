#!/usr/bin/env tsx
/**
 * LA verificación del callejero. Corre, imprime y **falla con exit 1**.
 *
 * Plan: `docs/plans/2026-08-11-tierra-senal-corroboracion-registro.md`, Task 5, Step 6.
 *
 *   pnpm --filter @v2/db geo:verificar-callejero
 *   pnpm --filter @v2/db geo:verificar-callejero --tolerar-huerfanas
 *
 * **No escribe una sola fila**, así que se puede correr contra producción sin
 * dejar rastro — que es la única forma de que alguien lo corra después de
 * sembrar, que es cuando recién empieza a decir algo.
 *
 * ── POR QUÉ ESTE ARCHIVO SE REESCRIBIÓ ─────────────────────────────────────
 *
 * La versión anterior afirmaba la completitud así:
 *
 *     where p.estado <> 'completa' or p.filas_escritas <> p.total_declarado
 *
 * y los dos lados salían del MISMO lugar: `total_declarado` es el `total` que
 * dijo la fuente y `filas_escritas` es un contador en memoria del seed. **Si las
 * filas nunca llegaron a la tabla, los dos números coinciden igual y esto pasa
 * en verde.** No había en ningún lado un `count(*)` de `geo_calles` contra la
 * suma de lo declarado. Ése es el peor resultado posible: un seed que dice
 * «listo» con el 4% faltando, porque nadie lo vuelve a mirar.
 *
 * Lo que hay ahora es una SUMA, con los sumandos medidos de formas distintas:
 *
 *     count(*) de la tabla  +  duplicados  +  huérfanas  =  total declarado
 *
 * El primero se mide acá y ahora, preguntándole a Postgres. Los otros dos son
 * las filas que la fuente entregó y que la tabla no tiene, anotadas por el seed
 * en `geo_seed_progreso` con nombre propio. El de la derecha es la fuente. Si el
 * seed perdió filas en silencio, el primero baja y la igualdad se rompe.
 *
 * ── LO QUE AFIRMA, Y CONTRA QUÉ ────────────────────────────────────────────
 *
 *  - **La completitud**, contra `count(*)` de la propia tabla, por partición y
 *    en total. Falla con exit 1.
 *  - **Los cuatro índices de `geo_calles`**, contra `pg_indexes`. Un SIGKILL no
 *    ejecuta el `finally` del seed que los repone, así que sin esto «la
 *    verificación pasa» con el autocompletado del país entero en seq scan.
 *  - **Las invariantes de la jerarquía** (Task 1), contra el motor: tienen que
 *    dar cero y no hay lectura amable de un uno.
 *  - **Los conteos por nivel**, contra lo MEDIDO el 2026-08-11. Una diferencia
 *    acá no falla: el país cambia y la fuente también. Se imprime para mirar.
 *  - **El presupuesto**, contra el umbral de 200 MB que dispara un rediseño.
 *    Medido dio 89,87 MB, o sea el 45%. **El umbral se conserva igual**: el que
 *    corra esto dentro de dos años necesita saber contra qué comparar, y un
 *    umbral que se borra porque esta vez dio bien es un umbral que la próxima
 *    vez no está.
 */
import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-http';

import * as schema from '../src/schema/index.js';

import {
  AVISO_DE_DESTINO,
  conMiles,
  elegirDestino,
  evaluarCompletitud,
} from './callejero/corrida.js';
import {
  completitudDeLaCorrida,
  faltantesDeIndices,
  indicesPresentes,
  INDICES_ESPERADOS_DE_CALLES,
} from './callejero/escribir.js';

import type { Db } from '../src/client.js';

config({ path: new URL('../../../.env', import.meta.url).pathname });

const escribir = (texto: string): void => void process.stdout.write(texto);

/** Los conteos por nivel medidos el 2026-08-11 con el corpus completo. */
const MEDIDO = {
  province: 24,
  department: 529,
  municipality: 2_082,
  locality: 4_027,
  /** NO son los 14.673 que declara la fuente: 3.349 son el mismo lugar que una localidad. */
  settlement: 11_324,
} as const;

const CALLES_MEDIDAS = 326_832;

/** Pasado este tamaño, la tabla pide un rediseño (normalizar los nombres). */
const UMBRAL_DE_REDISENO_MB = 200;

interface Afirmacion {
  readonly nombre: string;
  readonly sql: ReturnType<typeof sql>;
  /** Qué significa que NO dé cero. */
  readonly siFalla: string;
}

/** Las que tienen que dar CERO. Cada una es una invariante, no una métrica. */
const EN_CERO: readonly Afirmacion[] = [
  {
    nombre: 'lugares sin provincia',
    sql: sql`select count(*)::int as n from geographic_locations where province_id is null`,
    siFalla: 'hay filas sin provincia: todo lo que agrega por territorio las pierde en silencio',
  },
  {
    nombre: 'lugares cuya provincia no existe',
    sql: sql`select count(*)::int as n from geographic_locations g
             left join geographic_locations p on p.id = g.province_id where p.id is null`,
    siFalla: 'la FK de `province_id` apunta a una fila que no está',
  },
  {
    nombre: 'provincias que no son su propio padre',
    sql: sql`select count(*)::int as n from geographic_locations
             where level = 'province' and province_id <> id`,
    siFalla: '`where province_id = X` deja de traer la provincia junto con su subárbol',
  },
  {
    nombre: 'municipios colgados de un departamento',
    sql: sql`select count(*)::int as n from geographic_locations m
             join geographic_locations p on p.id = m.parent_id
             where m.level = 'municipality' and p.level <> 'province'`,
    siFalla: 'la pertenencia municipal es CRUZADA, no un escalón del árbol (§2.2)',
  },
  {
    nombre: 'calles huérfanas',
    sql: sql`select count(*)::int as n from geo_calles c
             left join geographic_locations l on l.id = c.localidad_id where l.id is null`,
    siFalla: 'hay calles apuntando a una localidad que no existe',
  },
  {
    nombre: 'calles con el cero de georef adentro',
    sql: sql`select count(*)::int as n from geo_calles
             where altura_desde = 0 or altura_hasta = 0`,
    siFalla: 'el `0` que georef usa por «no sé» entró como altura: la traducción del borde falló',
  },
];

async function contar(db: Db, consulta: ReturnType<typeof sql>): Promise<number> {
  const { rows } = await db.execute<{ n: number }>(consulta);
  return rows[0]?.n ?? -1;
}

// ---------------------------------------------------------------------------
// La completitud, contra `count(*)` de la propia tabla
// ---------------------------------------------------------------------------

/**
 * El bloque que decide. Devuelve `true` si algo está roto.
 *
 * `tolerarHuerfanas` no cambia lo que se mide: cambia si las particiones que
 * cerraron **con filas que la fuente entregó y no entraron** hacen fallar la
 * corrida del verificador o sólo se imprimen. Que haga falta re-decirlo acá es
 * a propósito — una tolerancia que se declara una vez en el seed y después
 * pinta todo de verde para siempre es la tolerancia que nadie vuelve a mirar.
 */
async function verificarCompletitud(
  db: Db,
  corrida: string,
  tolerarHuerfanas: boolean,
): Promise<boolean> {
  escribir('\n── La completitud, contra `count(*)` de la tabla ────────────────────\n');
  const filas = await completitudDeLaCorrida(db, corrida);
  if (filas.length === 0) {
    escribir(
      `  ✗ la corrida vigente ${corrida} no tiene una sola partición en \`geo_seed_progreso\`.\n` +
        '    Hay una versión publicada sin registro de cómo se sembró: no hay nada que auditar.\n',
    );
    return true;
  }

  const { rotas, toleradas, totales, porRecurso } = evaluarCompletitud(filas);

  escribir(
    `  ${'recurso'.padEnd(22)}${'declara'.padStart(10)}${'en tabla'.padStart(10)}` +
      `${'dupl.'.padStart(8)}${'huérf.'.padStart(8)}  particiones\n`,
  );
  for (const [recurso, t] of porRecurso) {
    const cierra = t.enTabla + t.duplicados + t.huerfanas === t.declarado;
    escribir(
      `  ${cierra ? '✓' : '✗'} ${recurso.padEnd(20)}${conMiles(t.declarado).padStart(10)}` +
        `${conMiles(t.enTabla).padStart(10)}${conMiles(t.duplicados).padStart(8)}` +
        `${conMiles(t.huerfanas).padStart(8)}  ${conMiles(t.particiones)}\n`,
    );
  }
  const cierraElTotal = totales.enTabla + totales.duplicados + totales.huerfanas === totales.declarado;
  escribir(
    `  ${cierraElTotal ? '✓' : '✗'} ${'TOTAL'.padEnd(20)}${conMiles(totales.declarado).padStart(10)}` +
      `${conMiles(totales.enTabla).padStart(10)}${conMiles(totales.duplicados).padStart(8)}` +
      `${conMiles(totales.huerfanas).padStart(8)}  ${conMiles(totales.particiones)}\n`,
  );

  if (rotas.length > 0) {
    escribir(`\n  ✗ ${conMiles(rotas.length)} particiones NO cierran:\n`);
    for (const rota of rotas.slice(0, 20)) {
      escribir(`      ${rota.recurso}/${rota.particion}: ${rota.motivo}\n`);
    }
    if (rotas.length > 20) escribir(`      … y ${conMiles(rotas.length - 20)} más\n`);
    escribir(
      '\n    Las filas que la fuente declaró NO están en la tabla y tampoco están anotadas\n' +
        '    como duplicadas ni como huérfanas. Volvé a correr el seed: retoma donde quedó.\n',
    );
  }

  if (toleradas.length > 0) {
    escribir(
      `\n  ${tolerarHuerfanas ? '·' : '✗'} ${conMiles(toleradas.length)} particiones cerradas con huérfanas ` +
        `(${conMiles(totales.huerfanas)} filas):\n`,
    );
    for (const t of toleradas.slice(0, 10)) {
      escribir(`      ${t.recurso}/${t.particion}: ${t.motivo}\n`);
    }
    if (toleradas.length > 10) escribir(`      … y ${conMiles(toleradas.length - 10)} más\n`);
    escribir(
      tolerarHuerfanas
        ? '    Toleradas a pedido (--tolerar-huerfanas). El catálogo está incompleto y lo dice.\n'
        : '    El catálogo está incompleto: alguien sembró con --tolerar-huerfanas. Si eso es\n' +
            '    lo que se decidió, corré esto con --tolerar-huerfanas y lo va a decir sin fallar.\n',
    );
  }

  return rotas.length > 0 || (toleradas.length > 0 && !tolerarHuerfanas);
}

/** Los cuatro índices de `geo_calles`, contra `pg_indexes`. */
async function verificarIndices(db: Db): Promise<boolean> {
  escribir('\n── Los índices de `geo_calles` ─────────────────────────────────────\n');
  const presentes = await indicesPresentes(db);
  const faltan = faltantesDeIndices(presentes);
  for (const indice of INDICES_ESPERADOS_DE_CALLES) {
    const esta = presentes.has(indice.nombre);
    escribir(`  ${esta ? '✓' : '✗'} ${indice.nombre}\n`);
  }
  if (faltan.length === 0) return false;

  escribir(
    `\n  ✗ faltan ${String(faltan.length)} de ${String(INDICES_ESPERADOS_DE_CALLES.length)}.\n` +
      '    Una corrida murió con los índices bajados: un SIGKILL no ejecuta el `finally`\n' +
      '    del seed que los repone. El autocompletado del país entero está en seq scan\n' +
      '    sobre 326.832 filas y nadie se entera hasta que alguien mide una búsqueda.\n' +
      '    Se reponen con `pnpm --filter @v2/db geo:seed-callejero --aplicar`, o a mano:\n\n',
  );
  for (const indice of faltan) escribir(`      ${indice.crear};\n`);
  return true;
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const tolerarHuerfanas = argv.includes('--tolerar-huerfanas');
  const desconocidas = argv.filter((a) => a !== '--tolerar-huerfanas');
  if (desconocidas.length > 0) {
    process.stderr.write(
      `Opciones que no existen: ${desconocidas.join(', ')}\n` +
        '  geo:verificar-callejero [--tolerar-huerfanas]\n',
    );
    process.exitCode = 1;
    return;
  }

  const destino = elegirDestino(process.env);
  if (destino === null) {
    process.stderr.write('DATABASE_URL_UNPOOLED (o DATABASE_URL) es obligatoria.\n');
    process.exitCode = 1;
    return;
  }
  escribir(`\n${AVISO_DE_DESTINO(destino)}`);

  const db: Db = drizzle(neon(destino.url), { schema });
  let falla = false;

  // ── Los cinco niveles, contra lo medido ─────────────────────────────────
  escribir('\n── La jerarquía ────────────────────────────────────────────────────\n');
  const { rows: niveles } = await db.execute<{ level: string; n: number }>(
    sql`select level, count(*)::int as n from geographic_locations group by level`,
  );
  const porNivel = new Map(niveles.map((f) => [f.level, f.n]));
  let totalJerarquia = 0;
  for (const [nivel, medido] of Object.entries(MEDIDO)) {
    const hay = porNivel.get(nivel) ?? 0;
    totalJerarquia += hay;
    escribir(
      `  ${nivel.padEnd(14)}${conMiles(hay).padStart(8)}  (medido ${conMiles(medido)})` +
        `${hay === medido ? '' : '  ←'}\n`,
    );
  }
  escribir(`  ${'TOTAL'.padEnd(14)}${conMiles(totalJerarquia).padStart(8)}  (medido 17.986)\n`);

  const calles = await contar(db, sql`select count(*)::int as n from geo_calles`);
  escribir(
    `\n  geo_calles    ${conMiles(calles).padStart(8)}  (medido ${conMiles(CALLES_MEDIDAS)})\n`,
  );

  // ── Las que tienen que dar cero ─────────────────────────────────────────
  escribir('\n── Las invariantes ─────────────────────────────────────────────────\n');
  for (const afirmacion of EN_CERO) {
    const n = await contar(db, afirmacion.sql);
    const bien = n === 0;
    if (!bien) falla = true;
    escribir(`  ${bien ? '✓' : '✗'} ${afirmacion.nombre.padEnd(46)}${String(n).padStart(6)}\n`);
    if (!bien) escribir(`      ${afirmacion.siFalla}\n`);
  }

  // ── Los cuatro índices ──────────────────────────────────────────────────
  if (await verificarIndices(db)) falla = true;

  // ── La corrida vigente y su completitud ─────────────────────────────────
  const { rows: version } = await db.execute<{ corrida: string; fecha_de_corte: unknown }>(
    sql`select corrida, fecha_de_corte from geo_catalogo_version where vigente`,
  );
  const vigente = version[0];
  escribir(
    vigente === undefined
      ? '\n  No hay corrida vigente: `/api/v1/geo/version` responde `sin_catalogo`.\n'
      : `\n  Corrida vigente: ${vigente.corrida} (corte ${String(vigente.fecha_de_corte)})\n`,
  );
  if (vigente === undefined) {
    if (calles > 0) {
      falla = true;
      escribir(
        '  ✗ Hay calles cargadas y ninguna versión vigente: el catálogo está en la base y\n' +
          '    los endpoints no lo sirven. Volvé a correr el seed — retoma y publica.\n',
      );
    }
  } else if (await verificarCompletitud(db, vigente.corrida, tolerarHuerfanas)) {
    falla = true;
  }

  // ── La cobertura, que se publica y no se esconde ────────────────────────
  escribir('\n── La cobertura de altura, por provincia ───────────────────────────\n');
  const { rows: cobertura } = await db.execute<{
    name: string;
    con_rango: number;
    sin_rango: number;
  }>(sql`
    select p.name,
           count(*) filter (where c.altura_desde is not null or c.altura_hasta is not null)::int as con_rango,
           count(*) filter (where c.altura_desde is null and c.altura_hasta is null)::int        as sin_rango
      from geo_calles c join geographic_locations p on p.id = c.provincia_id
     group by p.name order by sin_rango desc`);
  for (const fila of cobertura) {
    escribir(
      `  ${fila.name.padEnd(34)}${conMiles(fila.con_rango).padStart(8)} con rango  ` +
        `${conMiles(fila.sin_rango).padStart(8)} sin rango\n`,
    );
  }
  const [peor] = cobertura;
  if (peor !== undefined && !peor.name.startsWith('Córdoba') && calles > 0) {
    escribir(
      `\n  Córdoba NO encabeza la lista de «sin rango» y en la fuente sí lo hace.\n` +
        '  Revisá la traducción del `0` en el borde del seed antes de dar esto por bueno.\n',
    );
  }

  const sinNombre = await contar(
    db,
    sql`select count(*)::int as n from geo_calles where nombre_clase = 'sin_nombre'`,
  );
  escribir(
    `\n  ${conMiles(sinNombre)} calles \`sin_nombre\`` +
      `${calles > 0 ? ` (${((sinNombre / calles) * 100).toFixed(1)}% del país)` : ''} — medido 120.115 (36,8%)\n`,
  );

  // ── El presupuesto ──────────────────────────────────────────────────────
  escribir('\n── El presupuesto ──────────────────────────────────────────────────\n');
  const { rows: tamanos } = await db.execute<{
    /** `bigint` viaja como texto por el driver: convertirlo acá es deliberado. */
    calles_bytes: string;
    calles: string;
    base: string;
  }>(sql`
    select pg_total_relation_size('geo_calles')::bigint      as calles_bytes,
           pg_size_pretty(pg_total_relation_size('geo_calles')) as calles,
           pg_size_pretty(pg_database_size(current_database())) as base`);
  const tamano = tamanos[0];
  escribir(`  geo_calles (heap + índices)  ${tamano?.calles ?? '?'}   (medido 89,87 MB)\n`);
  escribir(`  la base entera               ${tamano?.base ?? '?'}   (medido 153,58 MB)\n`);
  const mb = Number(tamano?.calles_bytes ?? 0) / 1_048_576;
  if (mb > UMBRAL_DE_REDISENO_MB) {
    falla = true;
    escribir(
      `  ✗ pasó el umbral de ${String(UMBRAL_DE_REDISENO_MB)} MB que dispara un rediseño.\n` +
        '    La palanca guardada es normalizar los nombres a una tabla `geo_calle_nombres`.\n',
    );
  } else {
    escribir(
      `  ✓ ${mb.toFixed(1)} MB, el ${((mb / UMBRAL_DE_REDISENO_MB) * 100).toFixed(0)}% del umbral de rediseño.\n`,
    );
  }

  escribir(falla ? '\nHAY AFIRMACIONES ROTAS.\n' : '\nTodo lo que tenía que dar cero dio cero.\n');
  if (falla) process.exitCode = 1;
}

await main();
