import { z } from 'zod';
const esquema = z.object({
  id: z.string().uuid(),
  fecha: z.string(),
  frases: z.array(z.string()).length(3),
  campanaId: z.string().nullable(),
});
export type BorradorIdeal = z.infer<typeof esquema>;
function base(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof globalThis.indexedDB === 'undefined') {
      reject(
        new Error('Este navegador no ofrece un archivo local. Conservá tu texto antes de salir.'),
      );
      return;
    }
    const r = indexedDB.open('basta-borradores-privados', 1);
    r.onupgradeneeded = () => {
      r.result.createObjectStore('borradores', { keyPath: 'id' });
    };
    r.onsuccess = () => {
      resolve(r.result);
    };
    r.onerror = () => {
      reject(new Error('No pudimos abrir tus borradores locales.'));
    };
  });
}
export async function guardarBorrador(v: BorradorIdeal): Promise<void> {
  const db = await base();
  return new Promise((resolve, reject) => {
    const t = db.transaction('borradores', 'readwrite');
    t.objectStore('borradores').put(esquema.parse(v));
    t.oncomplete = () => {
      db.close();
      resolve();
    };
    t.onerror = () => {
      db.close();
      reject(new Error('No pudimos guardar el borrador. Tu texto sigue en pantalla.'));
    };
  });
}
export async function leerBorradores(): Promise<BorradorIdeal[]> {
  const db = await base();
  return new Promise((resolve, reject) => {
    const r = db.transaction('borradores').objectStore('borradores').getAll();
    r.onsuccess = () => {
      const valores: unknown = r.result;
      db.close();
      resolve(z.array(esquema).parse(valores));
    };
    r.onerror = () => {
      db.close();
      reject(new Error('No pudimos leer tus borradores.'));
    };
  });
}
export async function borrarBorrador(id: string): Promise<void> {
  const db = await base();
  return new Promise((resolve, reject) => {
    const t = db.transaction('borradores', 'readwrite');
    t.objectStore('borradores').delete(id);
    t.oncomplete = () => {
      db.close();
      resolve();
    };
    t.onerror = () => {
      db.close();
      reject(new Error('No pudimos borrar el borrador.'));
    };
  });
}
