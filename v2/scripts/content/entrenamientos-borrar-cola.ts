/**
 * Borra la cola generada — sólo donde el corte es `cola-limpia`.
 *
 * Los demás motivos se listan para revisión humana: el detector se niega a
 * adivinar, y 168 encabezados del autor tienen nombres parecidos.
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { contarPalabrasRenderizables, detectarCola, separarMdx } from '@v2/shared';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const dir = resolve(raiz, 'content/courses');
let tocados = 0;
let borradas = 0;
const aMano: string[] = [];

for (const curso of readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory())) {
  const cursoDir = join(dir, curso.name);
  for (const archivo of readdirSync(cursoDir).filter((f) => f.endsWith('.mdx'))) {
    const ruta = join(cursoDir, archivo);
    const { encabezado, cuerpo } = separarMdx(readFileSync(ruta, 'utf-8'));
    const resultado = detectarCola(cuerpo);

    if (resultado.motivo === 'cola-limpia' && resultado.indice !== null) {
      const propio = cuerpo.slice(0, resultado.indice);
      // Una lección que es toda cola dejaría un cuerpo vacío. No existe en el
      // corpus de hoy (el mínimo conservado es 23%), pero esto reescribe 320
      // archivos publicados: si aparece, va a revisión y no se toca.
      if (propio.trim() === '') {
        aMano.push(`cuerpo-quedaria-vacio\t${curso.name}/${archivo}\t${resultado.encabezados.join(' · ')}`);
        continue;
      }
      borradas += contarPalabrasRenderizables(cuerpo) - contarPalabrasRenderizables(propio);
      writeFileSync(ruta, `${encabezado}${propio.trimEnd()}\n`);
      tocados += 1;
    } else if (resultado.motivo !== 'sin-cola') {
      aMano.push(`${resultado.motivo}\t${curso.name}/${archivo}\t${resultado.encabezados.join(' · ')}`);
    }
  }
}

if (aMano.length > 0) {
  writeFileSync(resolve(raiz, 'docs/reportes/2026-08-13-entrenamientos-cola-a-mano.txt'), `${aMano.join('\n')}\n`);
}
process.stdout.write(`cola borrada en ${String(tocados)} lecciones — ${String(borradas)} palabras\n`);
process.stdout.write(
  aMano.length === 0
    ? 'a revisar a mano: ninguna. Las 320 cumplieron las tres anclas.\n'
    : `a revisar a mano: ${String(aMano.length)} — ver docs/reportes/2026-08-13-entrenamientos-cola-a-mano.txt\n`,
);
