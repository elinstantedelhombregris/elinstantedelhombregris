#!/usr/bin/env tsx
/**
 * Rellenar `name_norm` y `georef_id` de las 24 provincias que ya estaban.
 *
 * **Corre una sola vez, en el checkpoint, justo después de aplicar la `0013` y
 * antes de que algo dependa de la resolución de provincia.** Es la mitad de la
 * migración que el `.sql` no puede hacer.
 *
 * ── Por qué existe ───────────────────────────────────────────────────────────
 *
 * La `0013` agrega `name_norm`, y `findProvinceByName` pasa a buscar por esa
 * columna. Las 24 filas vivas entraron antes de la migración y quedan con
 * `name_norm` en NULL; `seed-provinces.ts` no las toca porque su guard de
 * existencia las saltea (y tiene que saltearlas: sin el guard se duplicarían,
 * porque `ON CONFLICT (georef_id)` no alcanza a una fila cuyo `georef_id` es
 * NULL). O sea que, sin este relleno, el minuto siguiente a la migración se ve
 * así:
 *
 *     findProvinceByName(...)  → undefined  para las 24
 *     provinciaIdDePunto(...)  → null       para todo punto del país
 *     toda señal nueva         → se guarda sin provincia
 *
 * y desaparece del coroplético, del detalle por provincia y de todo lo que
 * agrega por territorio, **sin un solo error en ningún lado**. Eso es D-001,
 * que ya estaba arreglado y desplegado.
 *
 * ── El normalizador es UNO ───────────────────────────────────────────────────
 *
 * La clave se calcula con `claveDeProvincia`, que es literalmente la misma
 * expresión que corre `findProvinceByName`. No hay versión en SQL de esto y no
 * puede haberla: la spec A §5 prohíbe el segundo normalizador, y la razón es
 * que su diferencia no se manifiesta como un error sino como resultados que
 * faltan, en silencio.
 *
 * ── Cómo se comporta ─────────────────────────────────────────────────────────
 *
 * - **En seco por defecto.** Escribe sólo con `--aplicar`.
 * - **Idempotente.** La segunda corrida no toca una sola fila: cada UPDATE
 *   lleva su `IS DISTINCT FROM` y sólo se emite para las filas que difieren.
 * - **Falla cerrado.** Ante una fila que no corresponde a ninguna de las 24, o
 *   ante dos filas que caen en la misma clave, no escribe nada y sale con
 *   código distinto de cero. Un relleno a medias es peor que ninguno: deja la
 *   mitad de las provincias encontrables y la otra mitad no, que es la forma
 *   más cara de fallar.
 *
 *   pnpm --filter @v2/db geo:rellenar-provincias            # muestra qué haría
 *   pnpm --filter @v2/db geo:rellenar-provincias --aplicar  # escribe
 */
// El driver es `pg` y no el HTTP de Neon, igual que en `migrate.ts` y por las
// mismas dos razones: esto corre en el mismo minuto que la migración —con la
// conexión sin pooler, que es la que aguanta el trabajo largo— y con `pg` el
// script se puede correr contra CUALQUIER Postgres. Contra el HTTP de Neon no
// hay forma de ensayarlo fuera de Neon, y un script de reparación que sólo se
// puede probar en la base que repara no es un script que se pueda probar.
//
// Los módulos de abajo son puros: ninguno lee el entorno al importarse, así que
// el `config()` del cuerpo alcanza aunque los imports se evalúen antes que él.
import { PROVINCIAS_CANONICAS } from '@v2/civic-core';
import { config } from 'dotenv';
import { and, eq, isNull, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';

import { geographicLocations } from '../src/schema/geographic.js';

import { claveDeProvincia } from './clave-de-provincia.js';

config({ path: new URL('../../../.env', import.meta.url).pathname });

const escribir = (texto: string): void => void process.stdout.write(texto);

/** Las columnas que la `0013` agrega y sin las cuales este script no tiene qué llenar. */
const COLUMNAS_DE_LA_0013 = ['name_norm', 'georef_id'] as const;

interface FilaDeProvincia {
  readonly id: number;
  readonly name: string;
  readonly nameNorm: string | null;
  readonly georefId: string | null;
}

async function main(): Promise<void> {
  const aplicar = process.argv.includes('--aplicar');

  const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
  if (url === undefined || url.length === 0) {
    process.stderr.write('DATABASE_URL_UNPOOLED (o DATABASE_URL) es obligatoria.\n');
    process.exitCode = 1;
    return;
  }
  const pool = new pg.Pool({ connectionString: url, max: 1 });
  const db = drizzle(pool);
  try {
    await rellenar(db, aplicar);
  } finally {
    await pool.end();
  }
}

async function rellenar(db: ReturnType<typeof drizzle>, aplicar: boolean): Promise<void> {
  // ── 0. ¿Está la 0013? ─────────────────────────────────────────────────────
  // Sin esto el error sería un «column "name_norm" does not exist» a mitad de
  // una consulta de Drizzle, que no le dice a nadie qué hacer.
  const { rows: columnas } = await db.execute<{ column_name: string }>(sql`
    select column_name from information_schema.columns
     where table_schema = 'public'
       and table_name = 'geographic_locations'
       and column_name in ('name_norm', 'georef_id')`);
  const presentes = new Set(columnas.map((c) => c.column_name));
  const faltantes = COLUMNAS_DE_LA_0013.filter((c) => !presentes.has(c));
  if (faltantes.length > 0) {
    process.stderr.write(
      `La migración 0013 no está aplicada: a \`geographic_locations\` le faltan ${faltantes.join(' y ')}.\n` +
        'Este relleno corre DESPUÉS de la migración, no antes:\n' +
        '  pnpm --filter @v2/db db:migrate\n',
    );
    process.exitCode = 1;
    return;
  }

  // ── 1. El catálogo, indexado por la clave de la consulta ──────────────────
  const porClave = new Map(PROVINCIAS_CANONICAS.map((p) => [claveDeProvincia(p.name), p]));
  if (porClave.size !== PROVINCIAS_CANONICAS.length) {
    process.stderr.write(
      'Dos provincias del catálogo colapsan a la misma clave normalizada. Con eso, una de\n' +
        'las dos no se puede encontrar por nombre. No se escribe nada.\n',
    );
    process.exitCode = 1;
    return;
  }

  // ── 2. Lo que hay en la base ──────────────────────────────────────────────
  const filas: FilaDeProvincia[] = await db
    .select({
      id: geographicLocations.id,
      name: geographicLocations.name,
      nameNorm: geographicLocations.nameNorm,
      georefId: geographicLocations.georefId,
    })
    .from(geographicLocations)
    .where(eq(geographicLocations.level, 'province'));

  escribir(`${String(filas.length)} filas de nivel 'province' en la base\n\n`);

  // ── 3. Clasificar antes de escribir ───────────────────────────────────────
  const aEscribir: { fila: FilaDeProvincia; clave: string; georefId: string }[] = [];
  const yaEstaban: string[] = [];
  const sinCorrespondencia: FilaDeProvincia[] = [];
  const vistas = new Map<string, FilaDeProvincia>();
  const colisiones: [FilaDeProvincia, FilaDeProvincia][] = [];

  for (const fila of filas) {
    const clave = claveDeProvincia(fila.name);
    const canonica = porClave.get(clave);
    if (canonica === undefined) {
      sinCorrespondencia.push(fila);
      continue;
    }
    const previa = vistas.get(clave);
    if (previa !== undefined) {
      colisiones.push([previa, fila]);
      continue;
    }
    vistas.set(clave, fila);

    if (fila.nameNorm === clave && fila.georefId === canonica.georefId) {
      yaEstaban.push(fila.name);
      continue;
    }
    aEscribir.push({ fila, clave, georefId: canonica.georefId });
  }

  const ausentes = [...porClave.entries()]
    .filter(([clave]) => !vistas.has(clave))
    .map(([, p]) => p.name);

  // ── 4. Las tres razones para no escribir nada ─────────────────────────────
  let cerrado = false;

  if (sinCorrespondencia.length > 0) {
    process.stderr.write(
      `\n${String(sinCorrespondencia.length)} filas de nivel 'province' que no son ninguna de las 24:\n`,
    );
    for (const fila of sinCorrespondencia) {
      process.stderr.write(`  ·  id=${String(fila.id)}  ${fila.name}\n`);
    }
    process.stderr.write(
      'No se les puede inventar un `georef_id`. Revisá qué son antes de seguir.\n',
    );
    cerrado = true;
  }

  if (colisiones.length > 0) {
    process.stderr.write(`\n${String(colisiones.length)} pares de filas caen en la misma clave:\n`);
    for (const [a, b] of colisiones) {
      process.stderr.write(
        `  ·  id=${String(a.id)} «${a.name}»  y  id=${String(b.id)} «${b.name}»\n`,
      );
    }
    process.stderr.write(
      'Con dos filas en la misma clave, `findProvinceByName` devuelve una de las dos según\n' +
        'el orden del plan, y `georef_id` es UNIQUE: el segundo UPDATE reventaría a mitad.\n',
    );
    cerrado = true;
  }

  if (ausentes.length > 0) {
    process.stderr.write(
      `\n${String(ausentes.length)} provincias del catálogo no tienen fila en la base:\n` +
        `  ${ausentes.join(', ')}\n` +
        'Sembralas primero — el seed es idempotente y no toca las que ya están:\n' +
        '  pnpm --filter @v2/db db:seed-provinces\n',
    );
    cerrado = true;
  }

  if (cerrado) {
    process.stderr.write('\nNada se escribió.\n');
    process.exitCode = 1;
    return;
  }

  // ── 5. El relleno ─────────────────────────────────────────────────────────
  for (const nombre of yaEstaban) {
    escribir(`  =  ya estaba        ${nombre}\n`);
  }

  for (const { fila, clave, georefId } of aEscribir) {
    escribir(
      `  ✓  ${aplicar ? 'rellenada' : 'rellenaría'}${aplicar ? '        ' : '       '}${fila.name}` +
        `  →  name_norm='${clave}'  georef_id='${georefId}'\n`,
    );
    if (!aplicar) continue;

    // El `IS DISTINCT FROM` no es adorno: hace que una segunda corrida no
    // escriba aunque alguien llame a esto dos veces en paralelo, y que el
    // `updated_at` de nadie se mueva por una corrida que no cambió nada.
    await db
      .update(geographicLocations)
      .set({ nameNorm: clave, georefId })
      .where(
        and(
          eq(geographicLocations.id, fila.id),
          sql`(${geographicLocations.nameNorm} IS DISTINCT FROM ${clave}
               OR ${geographicLocations.georefId} IS DISTINCT FROM ${georefId})`,
        ),
      );
  }

  escribir(
    `\n${String(aEscribir.length)} a rellenar · ${String(yaEstaban.length)} ya estaban\n` +
      (aplicar ? 'Escrito.\n' : 'Simulacro: nada se escribió. Volvé a correr con --aplicar.\n'),
  );

  // ── 6. Lo que la Task 6 va a necesitar ────────────────────────────────────
  // `ALTER COLUMN georef_id SET NOT NULL` sobre filas que no lo cumplen no se
  // puede aplicar. Este conteo es la cuenta hecha, no la estimación.
  const [pendientes] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(geographicLocations)
    .where(isNull(geographicLocations.georefId));
  const sinGeoref = (pendientes?.n ?? 0) - (aplicar ? 0 : aEscribir.length);

  const [total] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(geographicLocations);

  escribir(
    `\nPara la Task 6 (\`georef_id SET NOT NULL\`): ${String(total?.n ?? 0)} filas en la tabla, ` +
      `${String(Math.max(sinGeoref, 0))} sin \`georef_id\`${aplicar ? '' : ' después de este relleno'}.\n` +
      (sinGeoref <= 0
        ? 'El NOT NULL de la Task 6 se puede aplicar.\n'
        : 'El NOT NULL de la Task 6 NO se puede aplicar todavía.\n'),
  );

  // Y la contracara: la columna por la que busca la consulta.
  const [sinNorm] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(geographicLocations)
    .where(and(eq(geographicLocations.level, 'province'), isNull(geographicLocations.nameNorm)));
  const normPendientes = (sinNorm?.n ?? 0) - (aplicar ? 0 : aEscribir.length);
  escribir(
    `Provincias sin \`name_norm\`${aplicar ? '' : ' después de este relleno'}: ` +
      `${String(Math.max(normPendientes, 0))}. ` +
      (normPendientes <= 0
        ? '`findProvinceByName` las encuentra a las 24.\n'
        : 'Las que faltan siguen invisibles para `findProvinceByName`.\n'),
  );
}

void main();
