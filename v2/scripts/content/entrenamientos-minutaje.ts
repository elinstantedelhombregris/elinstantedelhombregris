/**
 * Recalcula el minutaje de los entrenamientos desde el cuerpo real.
 *
 * Una sola sede: `course.json` — es lo que lee `courses-registry.ts:81`
 * (`minutos: l.duration`), porque el catálogo es eager y los cuerpos perezosos.
 * `estimatedMinutes` sale del frontmatter en este mismo paso.
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  contarPalabrasRenderizables,
  derivarSlugDeLeccion,
  minutosDeLectura,
  separarMdx,
} from '@v2/shared';

export interface CambioMinutaje {
  curso: string;
  leccion: string;
  antes: number;
  ahora: number;
}

export function recalcularMinutaje(
  raiz: string,
  opciones: { escribir?: boolean } = {},
): CambioMinutaje[] {
  const dir = resolve(raiz, 'content/courses');
  const cambios: CambioMinutaje[] = [];

  for (const curso of readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory())) {
    const cursoDir = join(dir, curso.name);
    const rutaIndice = join(cursoDir, 'course.json');
    const indice = JSON.parse(readFileSync(rutaIndice, 'utf-8')) as {
      duration: number;
      lessons: { key: string; duration: number }[];
    };

    for (const leccion of indice.lessons) {
      const slug = derivarSlugDeLeccion(leccion.key);
      const ruta = join(cursoDir, `${slug}.mdx`);
      const { encabezado, cuerpo } = separarMdx(readFileSync(ruta, 'utf-8'));
      const ahora = minutosDeLectura(contarPalabrasRenderizables(cuerpo));
      cambios.push({ curso: curso.name, leccion: slug, antes: leccion.duration, ahora });
      leccion.duration = ahora;

      if (opciones.escribir === true) {
        writeFileSync(ruta, encabezado.replace(/^estimatedMinutes:.*\n/m, '') + cuerpo);
      }
    }

    indice.duration = indice.lessons.reduce((n, l) => n + l.duration, 0);
    if (opciones.escribir === true) {
      writeFileSync(rutaIndice, `${JSON.stringify(indice, null, 2)}\n`);
    }
  }
  return cambios;
}

if (process.argv[1]?.endsWith('entrenamientos-minutaje.ts')) {
  const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
  const escribir = process.argv.includes('--escribir');
  const cambios = recalcularMinutaje(raiz, { escribir });
  const antes = cambios.reduce((n, c) => n + c.antes, 0);
  const ahora = cambios.reduce((n, c) => n + c.ahora, 0);
  process.stdout.write(
    `${escribir ? 'escrito' : 'simulacro'}: ${String(antes)} min declarados → ${String(ahora)} min reales (${String(cambios.length)} lecciones)\n`,
  );
}
