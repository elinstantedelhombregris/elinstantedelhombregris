#!/usr/bin/env tsx
/**
 * Sembrar las 24 provincias (23 + CABA) en `geographic_locations`.
 *
 * Idempotente: saltea las filas que ya existen.
 *
 * **Este script hace nacer bien una base vacía, y NO repara una base que ya
 * tiene las 24 filas.** La diferencia importa: las 24 vivas entraron antes de
 * la `0013` y tienen `name_norm` y `georef_id` en NULL, y acá se saltean por el
 * guard de existencia — que tiene que quedarse, porque el `ON CONFLICT
 * (georef_id)` de abajo no las alcanza: en Postgres un NULL no conflictúa con
 * nada, así que sin el guard estas 24 filas se insertarían DUPLICADAS.
 *
 * Repararlas es de `rellenar-provincias.ts`, que corre una sola vez después de
 * la `0013`. Este script cuenta cuántas están a medio llenar y lo dice.
 *
 * **Dejó de ser un script suelto**: `sembrarProvincias` es la fase 1 de
 * `seed-callejero.ts` (plan, Task 5, Step 1). Sigue corriendo solo —el cuerpo
 * de abajo es su CLI— pero la lógica es una función que recibe la conexión, en
 * vez de efectos al importar el módulo. Sin eso, importarlo desde el seed
 * habría sembrado el país como efecto colateral de un `import`.
 */
import { realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { PROVINCIAS_CANONICAS } from '@v2/civic-core';
import { config } from 'dotenv';
import { and, eq, isNull, or, sql } from 'drizzle-orm';

import { geographicLocations } from '../src/schema/geographic.js';

import { claveDeProvincia } from './clave-de-provincia.js';

import type { Db } from '../src/client.js';

export interface ResultadoDeProvincias {
  readonly insertadas: number;
  readonly salteadas: number;
  /** Filas de nivel `province` sin `name_norm` o sin `georef_id`. */
  readonly aMedias: number;
}

export async function sembrarProvincias(db: Db): Promise<ResultadoDeProvincias> {
  let insertadas = 0;
  let salteadas = 0;

  for (const province of PROVINCIAS_CANONICAS) {
    const [existing] = await db
      .select({ id: geographicLocations.id })
      .from(geographicLocations)
      .where(
        and(eq(geographicLocations.level, 'province'), eq(geographicLocations.name, province.name)),
      )
      .limit(1);
    if (existing) {
      salteadas++;
      continue;
    }
    // `province_id` es NOT NULL y sin default desde la migración 0013, y una
    // provincia es su propio padre: hay que reservarle el id ANTES de insertarla.
    // El `values({...})` de Drizzle no puede expresar eso —necesita el valor de
    // `nextval` dentro de la misma sentencia—, así que va en SQL.
    //
    // `name_norm` se escribe con `claveDeProvincia`, que es LA MISMA expresión
    // que corre `findProvinceByName` del otro lado. No hay —ni puede haber— una
    // versión en SQL de esto: un segundo normalizador es lo que la spec A §5
    // prohíbe, y su diferencia no se ve como un error sino como una provincia
    // que deja de encontrarse.
    const nameNorm = claveDeProvincia(province.name);
    await db.execute(sql`
      WITH nuevo AS (SELECT nextval('geographic_locations_id_seq')::int AS id)
      INSERT INTO geographic_locations
        (id, province_id, level, name, iso_code, latitude, longitude, georef_id, name_norm)
      SELECT nuevo.id, nuevo.id, 'province', ${province.name}::text, ${province.isoCode}::text,
             ${province.latitude}::numeric, ${province.longitude}::numeric,
             ${province.georefId}::text, ${nameNorm}::text
        FROM nuevo
      ON CONFLICT (georef_id) DO UPDATE SET name_norm = EXCLUDED.name_norm
        WHERE geographic_locations.name_norm IS DISTINCT FROM EXCLUDED.name_norm
    `);
    insertadas++;
  }

  // Las que ya estaban y siguen a medio llenar. Contarlo es lo que separa
  // «sembré una base vacía» de «esta base necesita el relleno»: sin este
  // conteo, una corrida que saltea las 24 se lee como éxito y
  // `findProvinceByName` devuelve `undefined` para las 24 sin que nadie se
  // entere.
  const [aMedias] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(geographicLocations)
    .where(
      and(
        eq(geographicLocations.level, 'province'),
        or(isNull(geographicLocations.nameNorm), isNull(geographicLocations.georefId)),
      ),
    );

  return { insertadas, salteadas, aMedias: aMedias?.n ?? 0 };
}

/** El aviso que hay que dar cuando quedaron filas a medio llenar. */
export const AVISO_A_MEDIAS = (n: number): string =>
  `\n${String(n)} provincias ya existentes sin \`name_norm\` o sin \`georef_id\`.\n` +
  'Mientras sigan así, `findProvinceByName` devuelve `undefined` para ellas y toda\n' +
  'señal nueva se guarda sin provincia (D-001). Repararlas:\n' +
  '  pnpm --filter @v2/db geo:rellenar-provincias            # muestra qué haría\n' +
  '  pnpm --filter @v2/db geo:rellenar-provincias --aplicar  # escribe\n';

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

/**
 * ¿Este archivo se está corriendo, o alguien lo importó?
 *
 * Se compara por `realpath` porque `tsx` invoca el `.ts` por su ruta real y
 * `pnpm` puede llegar por un symlink del workspace: comparar los textos crudos
 * daría `false` y el CLI no arrancaría, en silencio.
 */
const esEjecucionDirecta = (): boolean => {
  const invocado = process.argv[1];
  if (invocado === undefined) return false;
  try {
    return realpathSync(invocado) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
};

if (esEjecucionDirecta()) {
  config({ path: new URL('../../../.env', import.meta.url).pathname });
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required');
  }
  const { getDb } = await import('../src/client.js');
  const resultado = await sembrarProvincias(getDb());
  process.stdout.write(
    `Provinces seed: inserted=${String(resultado.insertadas)} skipped=${String(resultado.salteadas)}\n`,
  );
  if (resultado.aMedias > 0) process.stdout.write(AVISO_A_MEDIAS(resultado.aMedias));
  process.exit(0);
}
