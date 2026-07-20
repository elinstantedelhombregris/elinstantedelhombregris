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
import {
  addDatabaseChangeListener,
  deserializeDatabaseSync,
  openDatabaseSync,
  type SQLiteBindValue,
  type SQLiteDatabase,
} from 'expo-sqlite';
import { Platform } from 'react-native';
import migrations from '../../drizzle/migrations';
import * as schema from './schema';

/**
 * En teléfono, la base vive en el archivo nativo. En web, Expo 57 no ofrece un
 * VFS OPFS estable para operaciones sync, así que restauramos SQLite en memoria
 * desde una fotografía lógica guardada en IndexedDB.
 */
export const NOMBRE_DB = 'basta.db';

const crearExpoDbNativa = (): SQLiteDatabase => openDatabaseSync(NOMBRE_DB);
// The value exists to keep `DB` exactly aligned with the configured schema.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const crearDb = () => drizzle(crearExpoDbNativa(), { schema });

export type DB = ReturnType<typeof crearDb>;
export type DBExecutor = Pick<DB, 'select' | 'insert' | 'update' | 'delete'>;

/** Proxy perezoso: misma API, pero no abre nada hasta el primer acceso. */
const perezoso = <T extends object>(abrir: () => T): T => {
  let real: T | null = null;
  const instancia = (): T => {
    if (real === null) real = abrir();
    return real;
  };
  return new Proxy({} as T, {
    get(_t, prop) {
      // React Refresh inspecciona estos campos durante la evaluación del
      // módulo. No debe abrir la DB antes de que el gate restaure IndexedDB.
      if (prop === 'prototype' || prop === '$$typeof' || prop === 'render') return undefined;
      const objeto = instancia() as Record<PropertyKey, unknown>;
      const valor = objeto[prop];
      return typeof valor === 'function' ? (valor as (...a: unknown[]) => unknown).bind(objeto) : valor;
    },
    has(_t, prop) {
      return prop in (instancia() as object);
    },
  });
};

interface BastaDatabaseState {
  expoDb: SQLiteDatabase | null;
  drizzleDb: DB | null;
  webInitialization: Promise<void> | null;
  webInitialized: boolean;
  changeListenerInstalled: boolean;
  snapshotTimer: ReturnType<typeof setTimeout> | null;
  snapshotWriting: boolean;
  snapshotWritePromise: Promise<void> | null;
  snapshotPending: boolean;
  pendingRestore: WebLogicalSnapshot | null;
  /** Revisión CAS del snapshot cargado por esta pestaña. */
  webSnapshotRevision: number;
}

const GLOBAL_DB_KEY = '__basta_database_state_v1__';
const globalWithDatabase = globalThis as typeof globalThis & {
  [GLOBAL_DB_KEY]?: BastaDatabaseState;
};

/**
 * Metro vuelve a evaluar módulos durante Fast Refresh. Guardar ambos handles
 * en globalThis evita abrir conexiones SQLite duplicadas y mantiene la misma
 * base en memoria durante toda la sesión web.
 */
const databaseState = globalWithDatabase[GLOBAL_DB_KEY] ??= {
  expoDb: null,
  drizzleDb: null,
  webInitialization: null,
  webInitialized: false,
  changeListenerInstalled: false,
  snapshotTimer: null,
  snapshotWriting: false,
  snapshotWritePromise: null,
  snapshotPending: false,
  pendingRestore: null,
  webSnapshotRevision: 0,
};

// Completa estados creados por una versión anterior durante Fast Refresh.
databaseState.webInitialization ??= null;
databaseState.webInitialized ??= false;
databaseState.changeListenerInstalled ??= false;
databaseState.snapshotTimer ??= null;
databaseState.snapshotWriting ??= false;
databaseState.snapshotWritePromise ??= null;
databaseState.snapshotPending ??= false;
databaseState.pendingRestore ??= null;
databaseState.webSnapshotRevision ??= 0;

const WEB_STORAGE_DB = 'basta-local-sqlite-v1';
const WEB_STORAGE_STORE = 'snapshots';
const WEB_STORAGE_KEY = 'main';
const WEB_SNAPSHOT_VERSION = 1;
const SNAPSHOT_BATCH_SIZE = 40;

interface WebTableSnapshot {
  name: string;
  rows: Record<string, SQLiteBindValue>[];
}

interface WebLogicalSnapshot {
  version: typeof WEB_SNAPSHOT_VERSION;
  /** Ausente sólo en snapshots v1 previos al control multipestaña. */
  revision?: number;
  tables: WebTableSnapshot[];
}

const quoteIdentifier = (identifier: string): string => `"${identifier.replaceAll('"', '""')}"`;

const isLogicalSnapshot = (value: unknown): value is WebLogicalSnapshot => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as { version?: unknown; tables?: unknown };
  const revision = 'revision' in candidate ? candidate.revision : undefined;
  return candidate.version === WEB_SNAPSHOT_VERSION
    && Array.isArray(candidate.tables)
    && (revision === undefined || (Number.isSafeInteger(revision) && (revision as number) >= 0));
};

/**
 * Copia lógica, en lotes pequeños, para no depender de sqlite3_serialize ni
 * superar el buffer sync de Expo con una tabla completa.
 */
const crearSnapshotLogico = (database: SQLiteDatabase, revision?: number): WebLogicalSnapshot => {
  const tableNames = database.getAllSync<{ name: string }>(
    `SELECT name FROM sqlite_master
     WHERE type = 'table'
       AND name NOT LIKE 'sqlite_%'
       AND name <> '__drizzle_migrations'
     ORDER BY name`,
  );
  const tables: WebTableSnapshot[] = [];
  for (const { name } of tableNames) {
    const rows: Record<string, SQLiteBindValue>[] = [];
    let offset = 0;
    while (true) {
      const batch = database.getAllSync<Record<string, SQLiteBindValue>>(
        `SELECT * FROM ${quoteIdentifier(name)} LIMIT ${SNAPSHOT_BATCH_SIZE} OFFSET ${offset}`,
      );
      rows.push(...batch);
      if (batch.length < SNAPSHOT_BATCH_SIZE) break;
      offset += SNAPSHOT_BATCH_SIZE;
    }
    tables.push({ name, rows });
  }
  return { version: WEB_SNAPSHOT_VERSION, revision, tables };
};

const abrirIndexedDb = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(WEB_STORAGE_DB, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(WEB_STORAGE_STORE)) {
        request.result.createObjectStore(WEB_STORAGE_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('No se pudo abrir IndexedDB'));
    request.onblocked = () => reject(new Error('IndexedDB quedó bloqueada por otra pestaña'));
  });

const leerSnapshotWeb = async (): Promise<unknown> => {
  const storage = await abrirIndexedDb();
  try {
    const result = await new Promise<unknown>((resolve, reject) => {
      const request = storage
        .transaction(WEB_STORAGE_STORE, 'readonly')
        .objectStore(WEB_STORAGE_STORE)
        .get(WEB_STORAGE_KEY);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error('No se pudo leer la base local'));
    });
    if (result instanceof Uint8Array || isLogicalSnapshot(result)) return result;
    if (result instanceof ArrayBuffer) return new Uint8Array(result);
    if (ArrayBuffer.isView(result)) {
      return new Uint8Array(result.buffer.slice(result.byteOffset, result.byteOffset + result.byteLength));
    }
    return null;
  } finally {
    storage.close();
  }
};

/**
 * Lectura estrecha para barreras de seguridad que deben comprobar el estado
 * durable compartido por todas las pestañas, no sólo la SQLite en memoria de
 * la pestaña actual. El caller recibe una copia estructurada de IndexedDB.
 */
export const readPersistedWebTableRowsForSafety = async (
  tableName: string,
): Promise<readonly Record<string, SQLiteBindValue>[]> => {
  if (Platform.OS !== 'web') return [];
  if (!/^[a-z_][a-z0-9_]*$/.test(tableName)) {
    throw new Error('basta_web_snapshot_table_invalid');
  }
  const storedSnapshot = await leerSnapshotWeb();
  if (storedSnapshot == null) return [];
  if (!isLogicalSnapshot(storedSnapshot)) {
    throw new Error('basta_web_snapshot_not_logical');
  }
  const table = storedSnapshot.tables.find((candidate) => candidate.name === tableName);
  return table?.rows ?? [];
};

const escribirSnapshotWeb = async (
  snapshot: WebLogicalSnapshot,
  expectedRevision: number,
): Promise<void> => {
  const storage = await abrirIndexedDb();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = storage.transaction(WEB_STORAGE_STORE, 'readwrite');
      const store = transaction.objectStore(WEB_STORAGE_STORE);
      const readCurrent = store.get(WEB_STORAGE_KEY);
      readCurrent.onsuccess = () => {
        const current = readCurrent.result as unknown;
        const currentRevision = isLogicalSnapshot(current) ? current.revision ?? 0 : 0;
        if (currentRevision !== expectedRevision) {
          transaction.abort();
          reject(new Error('basta_web_snapshot_stale'));
          return;
        }
        store.put(snapshot, WEB_STORAGE_KEY);
      };
      readCurrent.onerror = () => {
        transaction.abort();
        reject(readCurrent.error ?? new Error('No se pudo verificar la revisión local'));
      };
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error('No se pudo guardar la base local'));
      transaction.onabort = () => {
        if (transaction.error) reject(transaction.error);
      };
    });
  } finally {
    storage.close();
  }
};

const programarSnapshotWeb = (delayMs = 120): void => {
  databaseState.snapshotPending = true;
  if (databaseState.snapshotTimer !== null) clearTimeout(databaseState.snapshotTimer);
  databaseState.snapshotTimer = setTimeout(() => {
    databaseState.snapshotTimer = null;
    void flushWebDatabaseSnapshot().catch(() => undefined);
  }, delayMs);
};

/**
 * Persiste una fotografía consistente. Si una transacción sigue abierta o ya
 * hay una escritura en curso, la solicitud se conserva y se consolida.
 */
export const flushWebDatabaseSnapshot = async (): Promise<void> => {
  if (Platform.OS !== 'web' || !databaseState.webInitialized || !databaseState.expoDb) return;
  if (databaseState.snapshotWriting) {
    databaseState.snapshotPending = true;
    await (databaseState.snapshotWritePromise ?? Promise.resolve());
    if (databaseState.snapshotPending) {
      if (databaseState.snapshotTimer !== null) clearTimeout(databaseState.snapshotTimer);
      databaseState.snapshotTimer = null;
      return flushWebDatabaseSnapshot();
    }
    return;
  }
  if (databaseState.expoDb.isInTransactionSync()) {
    programarSnapshotWeb(30);
    return;
  }

  databaseState.snapshotWriting = true;
  databaseState.snapshotPending = false;
  const writePromise = (async () => {
    const expectedRevision = databaseState.webSnapshotRevision;
    const nextRevision = expectedRevision + 1;
    const snapshot = crearSnapshotLogico(databaseState.expoDb!, nextRevision);
    await escribirSnapshotWeb(snapshot, expectedRevision);
    databaseState.webSnapshotRevision = nextRevision;
  })();
  databaseState.snapshotWritePromise = writePromise;
  try {
    await writePromise;
  } catch (error) {
    // No hacemos un bucle infinito ante un fallo estructural. La próxima
    // mutación o cambio de visibilidad volverá a intentar.
    databaseState.snapshotPending = false;
    console.error('[SQLite web] No se pudo persistir la fotografía local:', error);
    throw error;
  } finally {
    databaseState.snapshotWriting = false;
    databaseState.snapshotWritePromise = null;
    if (databaseState.snapshotPending) programarSnapshotWeb(120);
  }
};

/**
 * Debe ejecutarse después de calentar el worker y antes de usar Drizzle.
 * Es idempotente incluso con StrictMode y Fast Refresh.
 */
export const initializeWebDatabasePersistence = async (): Promise<void> => {
  if (Platform.OS !== 'web' || databaseState.webInitialized) return;
  if (databaseState.webInitialization) return databaseState.webInitialization;

  databaseState.webInitialization = (async () => {
    const storedSnapshot = await leerSnapshotWeb();
    let logicalSnapshot: WebLogicalSnapshot | null = null;
    databaseState.webSnapshotRevision = 0;

    if (isLogicalSnapshot(storedSnapshot)) {
      logicalSnapshot = storedSnapshot;
      databaseState.webSnapshotRevision = storedSnapshot.revision ?? 0;
    } else if (storedSnapshot instanceof Uint8Array) {
      // Migración única desde la fotografía binaria usada durante el piloto.
      // Sólo se lee: toda escritura posterior ocurre en una DB nueva.
      const legacyDatabase = deserializeDatabaseSync(storedSnapshot);
      try {
        logicalSnapshot = crearSnapshotLogico(legacyDatabase, 0);
      } finally {
        legacyDatabase.closeSync();
      }
    }

    const options = { enableChangeListener: true };
    databaseState.expoDb = openDatabaseSync(':memory:', options);
    databaseState.drizzleDb = drizzle(databaseState.expoDb, { schema });
    databaseState.pendingRestore = logicalSnapshot;
    databaseState.webInitialized = true;
  })().catch((error: unknown) => {
    databaseState.webInitialization = null;
    databaseState.webInitialized = false;
    databaseState.expoDb = null;
    databaseState.drizzleDb = null;
    databaseState.pendingRestore = null;
    databaseState.webSnapshotRevision = 0;
    throw error;
  });

  return databaseState.webInitialization;
};

const restoreLogicalSnapshot = (
  database: SQLiteDatabase,
  snapshot: WebLogicalSnapshot,
): void => {
  const currentTables = new Set(database
    .getAllSync<{ name: string }>(
      `SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'`,
    )
    .map(({ name }) => name));

  database.execSync('PRAGMA foreign_keys = OFF');
  try {
    database.withTransactionSync(() => {
      for (const table of snapshot.tables) {
        if (!currentTables.has(table.name)) continue;
        const currentColumns = new Set(database
          .getAllSync<{ name: string }>(`PRAGMA table_info(${quoteIdentifier(table.name)})`)
          .map(({ name }) => name));
        for (const row of table.rows) {
          const columns = Object.keys(row).filter((column) => currentColumns.has(column));
          if (columns.length === 0) continue;
          const placeholders = columns.map(() => '?').join(', ');
          database.runSync(
            `INSERT INTO ${quoteIdentifier(table.name)} (${columns.map(quoteIdentifier).join(', ')}) VALUES (${placeholders})`,
            columns.map((column) => row[column] ?? null),
          );
        }
      }
    });
  } finally {
    database.execSync('PRAGMA foreign_keys = ON');
  }
};

/** Restaura los datos después de que Drizzle haya creado el esquema actual. */
export const restoreWebDatabasePersistence = async (): Promise<void> => {
  if (Platform.OS !== 'web' || !databaseState.expoDb) return;
  if (databaseState.pendingRestore) {
    restoreLogicalSnapshot(databaseState.expoDb, databaseState.pendingRestore);
    databaseState.pendingRestore = null;
  }

  if (!databaseState.changeListenerInstalled) {
    addDatabaseChangeListener(() => programarSnapshotWeb());
    databaseState.changeListenerInstalled = true;
    window.addEventListener('pagehide', () => void flushWebDatabaseSnapshot().catch(() => undefined));
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        void flushWebDatabaseSnapshot().catch(() => undefined);
      }
    });
  }
};

/** Handle crudo de expo-sqlite (por si algo necesita SQL directo). */
export const expoDb: SQLiteDatabase = perezoso(() => {
  if (databaseState.expoDb === null) {
    if (Platform.OS === 'web') throw new Error('basta_web_db_not_initialized');
    databaseState.expoDb = crearExpoDbNativa();
  }
  return databaseState.expoDb;
});

/** La DB tipada de toda la app. */
export const db: DB = perezoso(() => {
  if (databaseState.drizzleDb === null) {
    if (databaseState.expoDb === null) {
      if (Platform.OS === 'web') throw new Error('basta_web_db_not_initialized');
      databaseState.expoDb = crearExpoDbNativa();
    }
    databaseState.drizzleDb = drizzle(databaseState.expoDb, { schema });
  }
  return databaseState.drizzleDb;
});

export { migrations, schema };
