#!/usr/bin/env tsx
/**
 * Apply pending Drizzle migrations.
 *
 * Uses the unpooled connection because pooled connections sometimes
 * mis-handle long-running DDL.
 */
import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';

config({ path: new URL('../../../.env', import.meta.url).pathname });

const url = process.env['DATABASE_URL_UNPOOLED'] ?? process.env['DATABASE_URL'];
if (!url) {
  throw new Error('DATABASE_URL_UNPOOLED (or DATABASE_URL) is required to apply migrations');
}

const pool = new pg.Pool({ connectionString: url });
const db = drizzle(pool);

await migrate(db, { migrationsFolder: new URL('../migrations', import.meta.url).pathname });

await pool.end();
process.stdout.write('migrations applied\n');
