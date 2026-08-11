/**
 * Drizzle client.
 *
 * - Pooled connection via @neondatabase/serverless for runtime app code.
 * - Unpooled connection (env DATABASE_URL_UNPOOLED) reserved for migrations
 *   and long-running scripts (see drizzle.config.ts).
 *
 * Construct exactly one instance per process: the pool is reused.
 */
import { neon, neonConfig } from '@neondatabase/serverless';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-http';

import * as schema from './schema/index.js';

import type { BatchItem } from 'drizzle-orm/batch';

neonConfig.fetchConnectionCache = true;

let cached: ReturnType<typeof createClient> | undefined;

function createClient(databaseUrl: string) {
  const sql = neon(databaseUrl);
  return drizzle(sql, { schema });
}

/**
 * Get (or lazily construct) the singleton Drizzle client.
 * Throws a clear error if DATABASE_URL is not set.
 */
export function getDb(): ReturnType<typeof createClient> {
  if (cached) return cached;

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is required to construct the Drizzle client');
  }

  cached = createClient(url);
  return cached;
}

/** Test-only: reset the cached client. Production code must not call this. */
export function resetDb(): void {
  cached = undefined;
}

export type Db = ReturnType<typeof getDb>;

/**
 * Una consulta que todavía no corrió y que sabe qué tipo devuelve. Es lo que
 * `db.batch()` acepta y lo que un `select()` de drizzle ya es antes de que
 * alguien lo espere.
 */
export type ConsultaPendiente<R> = BatchItem<'pg'> & PromiseLike<R>;

/**
 * Correr una consulta con un techo de tiempo que hace cumplir el MOTOR.
 *
 * El plan pide `statement_timeout` de 2 s en el router del callejero, y el
 * driver que usa esta base no tiene dónde ponerlo: `neon-http` manda cada
 * consulta en su propia petición HTTP, así que no hay sesión que sobreviva a un
 * `SET`, y `db.transaction()` tira «No transactions support in neon-http
 * driver». Poner `?options=-c statement_timeout=2000` en el DSN tampoco sirve:
 * medido contra la base de v2, `current_setting('statement_timeout')` sigue
 * dando `0`, o sea que el proxy de Neon lo descarta en silencio — que es la
 * peor de las dos formas de no funcionar.
 *
 * Lo que sí funciona, y está medido: `db.batch()` manda las dos sentencias en
 * UNA sola petición envuelta en `BEGIN`/`COMMIT`, y ahí `SET LOCAL` sí vive
 * hasta el final de la transacción. Cero viajes de red de más. Una consulta que
 * se pasa del techo muere con «canceling statement due to statement timeout»,
 * o sea con un error del motor y no con una promesa que alguien abandona
 * mientras Postgres sigue trabajando del otro lado.
 *
 * El techo se interpola en el texto porque `SET` no acepta parámetros. Por eso
 * pasa por `Math.trunc` y por un piso: es lo único que hay entre este `sql.raw`
 * y una inyección, y un número que no es un número tiene que fallar acá y no
 * en el motor.
 */
export async function conTechoDeTiempo<R>(
  db: Db,
  ms: number,
  consulta: ConsultaPendiente<R>,
): Promise<R> {
  if (!Number.isFinite(ms) || ms <= 0) {
    throw new Error(`El techo de tiempo tiene que ser un número positivo, y llegó ${String(ms)}`);
  }
  const techo = Math.trunc(ms);
  const resultados = await db.batch([
    db.execute(sql.raw(`set local statement_timeout = ${String(techo)}`)),
    consulta,
  ]);
  return resultados[1] as R;
}
