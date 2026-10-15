import { randomUUID } from 'node:crypto';
import { mkdirSync, renameSync, writeFileSync, existsSync, readFileSync, rmSync } from 'node:fs';
import { dirname } from 'node:path';

/** El lector ve el archivo anterior o el nuevo, nunca media escritura. */
export function escribirAtomico(ruta: string, contenido: string) {
  mkdirSync(dirname(ruta), { recursive: true });
  const temporal = `${ruta}.${randomUUID()}.tmp`;
  writeFileSync(temporal, contenido, { flag: 'wx' });
  renameSync(temporal, ruta);
}

/** Preparación local para una edición: ante un error de E/S restaura los archivos activos. */
export function reemplazarConRollback(archivos: { ruta: string; contenido: string }[]) {
  const anteriores = archivos.map((a) => ({ ...a, antes: existsSync(a.ruta) ? readFileSync(a.ruta, 'utf8') : null }));
  const escritos: typeof anteriores = [];
  try {
    for (const a of anteriores) { escribirAtomico(a.ruta, a.contenido); escritos.push(a); }
  } catch (error) {
    for (const a of escritos.reverse()) {
      if (a.antes === null) rmSync(a.ruta, { force: true });
      else escribirAtomico(a.ruta, a.antes);
    }
    throw error;
  }
}

export function conCandado<T>(ruta: string, accion: () => T): T {
  mkdirSync(dirname(ruta), { recursive: true });
  writeFileSync(ruta, String(process.pid), { flag: 'wx' });
  try { return accion(); } finally { rmSync(ruta); }
}
