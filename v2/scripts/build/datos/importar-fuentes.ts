import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { publicarFuentes, registrarIntentoFuente } from './publicar-fuentes.js';

const raiz = fileURLToPath(new URL('../../../', import.meta.url));
try {
  const candidato = process.argv.find((a) => a.startsWith('--candidato='))?.slice(12);
  const original = process.argv.find((a) => a.startsWith('--original='))?.slice(11);
  if (!candidato || !original) throw new Error('Usá --candidato=seleccion.json --original=publicacion.pdf, después de contrastar los datos.');
  const version = publicarFuentes(raiz, JSON.parse(readFileSync(candidato, 'utf8')), readFileSync(original));
  registrarIntentoFuente(raiz, 'correcta', version);
  process.stdout.write(`${version}\n`);
} catch (error) {
  registrarIntentoFuente(raiz, 'fallida', error instanceof Error ? error.message : 'No se pudo importar la fuente.');
  process.exitCode = 1;
}
