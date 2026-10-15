import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

/** Motor externo de compilación, fijado en requirements.txt. Falla cerrado. */
export function comprobarPoligonos(carpeta: string): void {
  const salida = execFileSync(process.env.GEO_PYTHON ?? 'python3', [
    fileURLToPath(new URL('./auditar_espacio.py', import.meta.url)), carpeta, '--comprobar',
  ], { encoding: 'utf8', timeout: 120_000, maxBuffer: 4 * 1024 * 1024 });
  const resultado = JSON.parse(salida) as { invalidas?: unknown };
  if (!Array.isArray(resultado.invalidas)) throw new Error('No se pudo comprobar la validez espacial.');
  if (resultado.invalidas.length) throw new Error(`La edición contiene ${String(resultado.invalidas.length)} polígonos inválidos. Conservamos la edición anterior; revisá el informe espacial.`);
}
