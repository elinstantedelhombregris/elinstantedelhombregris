import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';

import * as schema from '../../src/schema/index.js';

import type { Db } from '../../src/client.js';

/** Pruebas opt-in: jamás hereda DATABASE_URL ni carga .env. */
export function postgresLocalDePrueba() {
  const url = process.env['MAPA_TEST_DATABASE_URL'];
  if (!url) throw new Error('Falta MAPA_TEST_DATABASE_URL para la base local descartable.');
  const parsed = new URL(url);
  if (!['127.0.0.1', 'localhost'].includes(parsed.hostname) || !parsed.pathname.endsWith('_test')) {
    throw new Error(
      'Las pruebas del mapa solo aceptan una base local cuyo nombre termine en _test.',
    );
  }
  const pool = new pg.Pool({ connectionString: url });
  // El adaptador cambia el transporte, no SQL ni resultados. Estos tests no usan batch de Neon.
  const db = drizzle(pool, { schema });
  return { db: db as unknown as Db, pool };
}
