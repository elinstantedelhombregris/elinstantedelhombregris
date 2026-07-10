/**
 * Cliente de DB — singleton sin React (importable desde cualquier módulo).
 *
 * La apertura es PEREZOSA: `openDatabaseSync` no corre al importar el módulo
 * sino en el primer uso real. Esto importa por dos motivos:
 *  - en web, la API sync viaja por un worker (SharedArrayBuffer): si se abre
 *    durante la evaluación del bundle, el primer load muere por timeout antes
 *    de que React monte; abierta desde adentro del árbol, el gate de _layout
 *    puede calentar el worker primero y atrapar cualquier falla con reintento;
 *  - en nativo no cambia nada: primer uso = useMigrations del root layout.
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
import { openDatabaseSync, type SQLiteDatabase } from 'expo-sqlite';
import migrations from '../../drizzle/migrations';
import * as schema from './schema';

/**
 * En nativo la DB vive en disco (el juego es local-first). En web — que es
 * SOLO preview de desarrollo — se usa ':memory:' (MemoryVFS): el backend
 * OPFS de expo-sqlite web (alpha) pierde escrituras y pelea por access
 * handles; en memoria el preview es determinístico. El estado web se
 * reinicia por recarga, y está bien: el producto es el teléfono.
 */
export const NOMBRE_DB = typeof document !== 'undefined' ? ':memory:' : 'basta.db';

const crearExpoDb = (): SQLiteDatabase => openDatabaseSync(NOMBRE_DB);
const crearDb = () => drizzle(crearExpoDb(), { schema });

export type DB = ReturnType<typeof crearDb>;

/** Proxy perezoso: misma API, pero no abre nada hasta el primer acceso. */
const perezoso = <T extends object>(abrir: () => T): T => {
  let real: T | null = null;
  const instancia = (): T => {
    if (real === null) real = abrir();
    return real;
  };
  return new Proxy({} as T, {
    get(_t, prop) {
      const objeto = instancia() as Record<PropertyKey, unknown>;
      const valor = objeto[prop];
      return typeof valor === 'function' ? (valor as (...a: unknown[]) => unknown).bind(objeto) : valor;
    },
    has(_t, prop) {
      return prop in (instancia() as object);
    },
  });
};

let expoDbReal: SQLiteDatabase | null = null;
let dbReal: DB | null = null;

/** Handle crudo de expo-sqlite (por si algo necesita SQL directo). */
export const expoDb: SQLiteDatabase = perezoso(() => {
  if (expoDbReal === null) expoDbReal = crearExpoDb();
  return expoDbReal;
});

/** La DB tipada de toda la app. */
export const db: DB = perezoso(() => {
  if (dbReal === null) {
    if (expoDbReal === null) expoDbReal = crearExpoDb();
    dbReal = drizzle(expoDbReal, { schema });
  }
  return dbReal;
});

export { migrations, schema };
