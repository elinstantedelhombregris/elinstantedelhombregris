/**
 * Cliente de DB — singleton sin React (importable desde cualquier módulo).
 *
 * Las migraciones se corren UNA vez al montar el root layout con el patrón
 * oficial de drizzle para expo:
 *
 *   import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
 *   import { db, migrations } from '@/db/client';
 *   const { success, error } = useMigrations(db, migrations);
 *
 * Ojo: no importar acá `drizzle-orm/expo-sqlite/migrator` — ese módulo trae
 * React (useMigrations) y este archivo tiene que quedar libre de React.
 */

import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';
import migrations from '../../drizzle/migrations';
import * as schema from './schema';

/** Handle crudo de expo-sqlite (por si algo necesita SQL directo). */
export const expoDb = openDatabaseSync('basta.db');

/** La DB tipada de toda la app. */
export const db = drizzle(expoDb, { schema });

export type DB = typeof db;

export { migrations, schema };
