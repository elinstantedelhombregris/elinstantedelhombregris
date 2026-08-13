/** Aplica la lista dura de voseo a los cuerpos y reporta la blanda. No toca frontmatter. */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { detectarTuteo, normalizarVoseo, separarMdx } from '@v2/shared';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const dir = resolve(raiz, 'content/courses');
let archivos = 0;
let cambios = 0;
const blandos: string[] = [];

for (const curso of readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory())) {
  const cursoDir = join(dir, curso.name);
  for (const archivo of readdirSync(cursoDir).filter((f) => f.endsWith('.mdx'))) {
    const ruta = join(cursoDir, archivo);
    const { encabezado, cuerpo } = separarMdx(readFileSync(ruta, 'utf-8'));
    const { texto, cambios: n } = normalizarVoseo(cuerpo);
    if (n > 0) {
      writeFileSync(ruta, encabezado + texto);
      archivos += 1;
      cambios += n;
    }
    for (const h of detectarTuteo(texto).filter((x) => x.lista === 'blanda')) {
      blandos.push(`${curso.name}/${archivo}: ${h.forma}`);
    }
  }
}

process.stdout.write(`voseo: ${String(cambios)} reemplazos en ${String(archivos)} archivos\n`);
process.stdout.write(`lista blanda para revisar a mano: ${String(blandos.length)} casos\n`);
writeFileSync(resolve(raiz, 'docs/reportes/2026-08-12-entrenamientos-voseo-blando.txt'), `${blandos.join('\n')}\n`);
