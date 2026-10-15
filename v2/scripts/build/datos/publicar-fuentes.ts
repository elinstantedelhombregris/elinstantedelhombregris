import { readFileSync, mkdirSync, existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { catalogoFuentesSchema } from '../../../packages/shared/src/datos/fuentes.js';
import { sha256 } from '../geo/publicar-geografia.js';

import { escribirAtomico, conCandado } from './archivo-atomico.js';

/** Importa una selección revisada, no extrae ni interpreta el PDF automáticamente. */
export function publicarFuentes(raiz: string, candidato: unknown, original: Buffer) {
  return conCandado(join(raiz, 'apps/web/public/fuentes/.importacion.lock'), () => preparar(raiz, candidato, original));
}
function preparar(raiz: string, candidato: unknown, original: Buffer) {
  const nuevo = catalogoFuentesSchema.parse(candidato);
  if (!/^[a-z0-9-]{1,100}$/.test(nuevo.version)) throw new Error('La edición necesita un identificador estable.');
  if (sha256(original) !== nuevo.archivoSha256) throw new Error('La huella del original no coincide.');
  const ruta = join(raiz, 'packages/shared/src/datos/catalogo-fuentes.json');
  const anterior = JSON.parse(readFileSync(ruta, 'utf8')) as { actual: string; versiones: unknown[] };
  const versiones = anterior.versiones.map((v) => catalogoFuentesSchema.parse(v));
  const existente = versiones.find((v) => v.version === nuevo.version);
  if (existente && JSON.stringify(existente) !== JSON.stringify(nuevo)) throw new Error('No se puede reescribir una edición publicada.');
  const carpeta = join(raiz, 'apps/web/public/fuentes/versiones');
  mkdirSync(carpeta, { recursive: true });
  const archivo = join(carpeta, `${nuevo.version}.json`);
  const contenido = `${JSON.stringify(nuevo, null, 2)}\n`;
  if (existsSync(archivo) && readFileSync(archivo, 'utf8') !== contenido) throw new Error('El archivo de la edición fue alterado.');
  if (!existsSync(archivo)) writeFileSync(archivo, contenido, { flag: 'wx' });
  escribirAtomico(ruta, `${JSON.stringify({ actual: nuevo.version, versiones: existente ? versiones : [...versiones, nuevo] }, null, 2)}\n`);
  return nuevo.version;
}

export function registrarIntentoFuente(raiz: string, estado: 'correcta' | 'fallida', detalle: string) {
  const carpeta = join(raiz, 'apps/web/public/fuentes/intentos');
  mkdirSync(carpeta, { recursive: true });
  const fecha = new Date().toISOString();
  const contenido = `${JSON.stringify({ fecha, estado, detalle }, null, 2)}\n`;
  writeFileSync(join(carpeta, `${fecha.replaceAll(':', '-')}.json`), contenido, { flag: 'wx' });
  escribirAtomico(join(raiz, 'apps/web/public/fuentes/ultimo-intento.json'), contenido);
}
