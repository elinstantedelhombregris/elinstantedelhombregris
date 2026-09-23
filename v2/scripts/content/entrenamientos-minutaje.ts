/**
 * Recalcula el minutaje de los entrenamientos desde el cuerpo real.
 *
 * Una sola sede: `course.json` — es lo que lee `courses-registry.ts:81`
 * (`minutos: l.duration`), porque el catálogo es eager y los cuerpos perezosos.
 * `estimatedMinutes` sale del frontmatter en este mismo paso.
 *
 * Toca sólo lo que cambia (D-094): una `.mdx` se reescribe únicamente si todavía
 * trae `estimatedMinutes`, y un `course.json` únicamente si su minutaje cambió,
 * formateado con prettier como el resto del repo. Con argumentos, recalcula
 * sólo esos cursos: `pnpm entrenamientos:minutaje --escribir curso-a curso-b`.
 * Antes reescribía las 329 lecciones y los 31 índices en cada corrida, y con
 * otros editando al mismo tiempo podía pisar una escritura en vuelo.
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

export async function recalcularMinutaje(
  raiz: string,
  opciones: { escribir?: boolean; cursos?: readonly string[] } = {},
): Promise<CambioMinutaje[]> {
  const dir = resolve(raiz, 'content/courses');
  const cambios: CambioMinutaje[] = [];

  const { format, resolveConfig } = await import('prettier');
  const pedidos = opciones.cursos && opciones.cursos.length > 0 ? new Set(opciones.cursos) : null;
  for (const curso of readdirSync(dir, { withFileTypes: true }).filter(
    (d) => d.isDirectory() && (pedidos === null || pedidos.has(d.name)),
  )) {
    const cursoDir = join(dir, curso.name);
    const rutaIndice = join(cursoDir, 'course.json');
    const indiceCrudo = readFileSync(rutaIndice, 'utf-8');
    const indice = JSON.parse(indiceCrudo) as {
      duration: number;
      lessons: { key: string; duration: number }[];
    };

    let cambio = false;
    for (const leccion of indice.lessons) {
      const slug = derivarSlugDeLeccion(leccion.key);
      const ruta = join(cursoDir, `${slug}.mdx`);
      const { encabezado, cuerpo } = separarMdx(readFileSync(ruta, 'utf-8'));
      const ahora = minutosDeLectura(contarPalabrasRenderizables(cuerpo));
      cambios.push({ curso: curso.name, leccion: slug, antes: leccion.duration, ahora });
      if (leccion.duration !== ahora) cambio = true;
      leccion.duration = ahora;

      if (opciones.escribir === true && /^estimatedMinutes:/m.test(encabezado)) {
        writeFileSync(ruta, encabezado.replace(/^estimatedMinutes:.*\n/m, '') + cuerpo);
      }
    }

    const total = indice.lessons.reduce((n, l) => n + l.duration, 0);
    if (indice.duration !== total) cambio = true;
    indice.duration = total;
    if (opciones.escribir === true && cambio) {
      const config = (await resolveConfig(rutaIndice)) ?? {};
      const nuevo = await format(JSON.stringify(indice), { ...config, filepath: rutaIndice });
      if (nuevo !== indiceCrudo) writeFileSync(rutaIndice, nuevo);
    }
  }
  return cambios;
}

if (process.argv[1]?.endsWith('entrenamientos-minutaje.ts')) {
  const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
  const escribir = process.argv.includes('--escribir');
  const cursos = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  void recalcularMinutaje(raiz, { escribir, cursos }).then((cambios) => {
    const antes = cambios.reduce((n, c) => n + c.antes, 0);
    const ahora = cambios.reduce((n, c) => n + c.ahora, 0);
    process.stdout.write(
      `${escribir ? 'escrito' : 'simulacro'}: ${String(antes)} min declarados → ${String(ahora)} min reales (${String(cambios.length)} lecciones)\n`,
    );
  });
}
