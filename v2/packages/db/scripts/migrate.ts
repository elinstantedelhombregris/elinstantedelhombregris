#!/usr/bin/env tsx
/** Migra una conexión explícita. Nunca carga credenciales de .env. */
import { readFileSync } from 'node:fs';

import { readMigrationFiles } from 'drizzle-orm/migrator';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';

import { comprobarDestino, comprobarDiario } from './migraciones-seguras.js';

const carpeta = new URL('../migrations', import.meta.url).pathname;
const journal = JSON.parse(readFileSync(`${carpeta}/meta/_journal.json`, 'utf8')) as {
  entries: { tag: string }[];
};
const ultima = journal.entries.at(-1)?.tag;
if (!ultima) throw new Error('El diario local está vacío.');
const url = process.env['DATABASE_URL_UNPOOLED'] ?? process.env['DATABASE_URL'];
const destino = comprobarDestino(url, process.argv.slice(2), ultima);
const locales = readMigrationFiles({ migrationsFolder: carpeta });
const client = new pg.Client({ connectionString: url, connectionTimeoutMillis: 15_000 });
let bloqueado = false;
try {
  await client.connect();
  await client.query("SET lock_timeout = '10s'");
  await client.query("SET statement_timeout = '120s'");
  if (!destino.comprobar) {
    const { rows } = await client.query<{ obtenido: boolean }>(
      'SELECT pg_try_advisory_lock(862039, 1) AS obtenido',
    );
    bloqueado = rows[0]?.obtenido ?? false;
    if (!bloqueado) throw new Error('Otra migración está en curso.');
  }
  const { rows: existe } = await client.query<{ tabla: string | null }>(
    "SELECT to_regclass('drizzle.__drizzle_migrations')::text AS tabla",
  );
  const filas = existe[0]?.tabla
    ? (
        await client.query<{ hash: string; created_at: string }>(
          'SELECT hash,created_at FROM drizzle.__drizzle_migrations ORDER BY created_at,id',
        )
      ).rows
    : [];
  const pendientes = comprobarDiario(filas, locales);
  process.stdout.write(
    `${JSON.stringify({ ...destino, pendientes: journal.entries.slice(filas.length).map((e) => e.tag) })}\n`,
  );
  if (!destino.comprobar && pendientes.length) {
    // Un único cliente mantiene el candado durante la transacción del migrador.
    await migrate(drizzle(client), { migrationsFolder: carpeta });
    const { rows: despues } = await client.query<{ hash: string; created_at: string }>(
      'SELECT hash,created_at FROM drizzle.__drizzle_migrations ORDER BY created_at,id',
    );
    if (comprobarDiario(despues, locales).length)
      throw new Error('Quedaron migraciones sin aplicar.');
  }
  process.stdout.write(
    destino.comprobar
      ? 'Diario comprobado; sin escrituras.\n'
      : 'Migraciones aplicadas y diario comprobado.\n',
  );
} finally {
  if (bloqueado) await client.query('SELECT pg_advisory_unlock(862039, 1)');
  await client.end();
}
