import { cuadernoSchema } from './modelo';

import type { Cuaderno } from './modelo';

function abrir(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof globalThis.indexedDB === 'undefined') {
      reject(
        new Error(
          'Este navegador no permite guardar el cuaderno. Conservá tu texto antes de salir.',
        ),
      );
      return;
    }
    const r = indexedDB.open('basta-campo', 1);
    r.onupgradeneeded = () => {
      r.result.createObjectStore('cuadernos', { keyPath: 'id' });
    };
    r.onsuccess = () => {
      resolve(r.result);
    };
    r.onerror = () => {
      reject(new Error('No pudimos abrir el archivo local.'));
    };
    r.onblocked = () => {
      reject(new Error('Cerrá otras pestañas del cuaderno y reintentá.'));
    };
  });
}
export async function leerCuadernos(uid: number): Promise<Cuaderno[]> {
  const db = await abrir();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('cuadernos');
    const r = tx.objectStore('cuadernos').getAll();
    tx.oncomplete = () => {
      db.close();
      try {
        const valores: unknown[] = r.result as unknown[];
        resolve(
          valores
            .filter(
              (v) => typeof v === 'object' && v !== null && 'usuarioId' in v && v.usuarioId === uid,
            )
            .map((v) => cuadernoSchema.parse(v)),
        );
      } catch {
        reject(new Error('No pudimos leer el cuaderno.'));
      }
    };
    tx.onabort = () => {
      db.close();
      reject(new Error('No pudimos leer el cuaderno.'));
    };
  });
}
/** Compare-and-swap en una transacción IndexedDB, también entre pestañas. */
export async function guardarCuaderno(c: Cuaderno): Promise<Cuaderno> {
  const valor = cuadernoSchema.parse({ ...c, version: c.version + 1 });
  const db = await abrir();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('cuadernos', 'readwrite');
    const store = tx.objectStore('cuadernos');
    const r = store.get(c.id);
    let conflicto = false;
    r.onsuccess = () => {
      const actual = cuadernoSchema.safeParse(r.result);
      if ((actual.success ? actual.data.version : 0) !== c.version) {
        conflicto = true;
        tx.abort();
        return;
      }
      store.put(valor);
    };
    tx.oncomplete = () => {
      db.close();
      resolve(valor);
    };
    tx.onabort = () => {
      db.close();
      reject(
        new Error(
          conflicto
            ? 'El cuaderno cambió en otra pestaña. Conservá lo escrito y volvé a abrirlo.'
            : 'No pudimos guardar. Tu texto sigue en pantalla; no salgas sin conservarlo.',
        ),
      );
    };
  });
}
export async function borrarCuaderno(c: Cuaderno): Promise<void> {
  const db = await abrir();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('cuadernos', 'readwrite');
    const store = tx.objectStore('cuadernos');
    const r = store.get(c.id);
    r.onsuccess = () => {
      const v = cuadernoSchema.safeParse(r.result);
      if (
        !v.success ||
        v.data.usuarioId !== c.usuarioId ||
        v.data.version !== c.version ||
        !['borrador', 'enviado'].includes(v.data.estado)
      ) {
        tx.abort();
        return;
      }
      store.delete(c.id);
    };
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onabort = () => {
      db.close();
      reject(new Error('No se borró: el cuaderno cambió o tiene un envío por resolver.'));
    };
  });
}
