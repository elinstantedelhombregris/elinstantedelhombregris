/**
 * Foto del corpus de entrenamientos. NO escribe en content/.
 *
 * Es el paso previo obligatorio de cada script que sí edita: el reporte se
 * commitea y se revisa a ojo antes de autorizar un borrado masivo.
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  contarPalabrasRenderizables,
  derivarSlugDeLeccion,
  detectarCola,
  minutosDeLectura,
  separarMdx,
  type MotivoCorte,
} from '@v2/shared';

export interface FilaReporte {
  curso: string;
  leccion: string;
  palabrasPropias: number;
  palabrasCola: number;
  motivo: MotivoCorte;
  minutosDeclarados: number;
  minutosReales: number;
}

export interface Anomalia {
  curso: string;
  leccion: string;
  clase: 'declarada-sin-archivo' | 'archivo-sin-declarar';
}

export interface Relevamiento {
  filas: FilaReporte[];
  anomalias: Anomalia[];
}

export function relevarCorpus(raiz: string): Relevamiento {
  const dir = resolve(raiz, 'content/courses');
  const filas: FilaReporte[] = [];
  const anomalias: Anomalia[] = [];

  for (const curso of readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory())) {
    const cursoDir = join(dir, curso.name);
    const indice = JSON.parse(readFileSync(join(cursoDir, 'course.json'), 'utf-8')) as {
      lessons: { key: string; duration: number }[];
    };
    const declarados = new Map(
      indice.lessons.map((l) => [derivarSlugDeLeccion(l.key), l.duration] as const),
    );
    const enDisco = new Set<string>();

    for (const archivo of readdirSync(cursoDir).filter((f) => f.endsWith('.mdx'))) {
      const { cuerpo } = separarMdx(readFileSync(join(cursoDir, archivo), 'utf-8'));
      const corte = detectarCola(cuerpo);
      const propio = corte.indice === null ? cuerpo : cuerpo.slice(0, corte.indice);
      const palabrasPropias = contarPalabrasRenderizables(propio);
      const leccion = basename(archivo, '.mdx');
      enDisco.add(leccion);
      if (!declarados.has(leccion)) {
        anomalias.push({ curso: curso.name, leccion, clase: 'archivo-sin-declarar' });
      }
      filas.push({
        curso: curso.name,
        leccion,
        palabrasPropias,
        palabrasCola: contarPalabrasRenderizables(cuerpo) - palabrasPropias,
        motivo: corte.motivo,
        minutosDeclarados: declarados.get(leccion) ?? 0,
        minutosReales: minutosDeLectura(palabrasPropias),
      });
    }

    // Al revés: lo que el índice declara y en el disco no está. Sin esto, una
    // lección declarada sin archivo desaparece de la foto sin dejar rastro.
    for (const leccion of declarados.keys()) {
      if (!enDisco.has(leccion)) {
        anomalias.push({ curso: curso.name, leccion, clase: 'declarada-sin-archivo' });
      }
    }
  }

  const porNombre = (a: { curso: string; leccion: string }, b: { curso: string; leccion: string }): number =>
    a.curso.localeCompare(b.curso) || a.leccion.localeCompare(b.leccion);
  return { filas: filas.sort(porNombre), anomalias: anomalias.sort(porNombre) };
}

function markdown({ filas, anomalias }: Relevamiento): string {
  const suma = (f: (x: FilaReporte) => number): number => filas.reduce((n, x) => n + f(x), 0);
  const porMotivo = new Map<MotivoCorte, number>();
  for (const f of filas) porMotivo.set(f.motivo, (porMotivo.get(f.motivo) ?? 0) + 1);

  const cabecera = [
    '# Inventario del corpus de entrenamientos',
    '',
    `**Generado:** ${new Date().toISOString().slice(0, 10)} por \`pnpm entrenamientos:reporte\``,
    '',
    `- Lecciones: **${filas.length}**`,
    `- Palabras propias: **${suma((f) => f.palabrasPropias)}**`,
    `- Palabras de cola generada: **${suma((f) => f.palabrasCola)}**`,
    `- Minutos declarados: **${suma((f) => f.minutosDeclarados)}** · reales: **${suma((f) => f.minutosReales)}**`,
    '',
    '## Motivos de corte',
    '',
    ...[...porMotivo.entries()].map(([m, n]) => `- \`${m}\`: ${n}`),
    '',
    '> Sólo `cola-limpia` se borra automáticamente. `sin-huella` y `cola-abierta` van a mano.',
    '',
    '## Anomalías entre el índice y el disco',
    '',
    ...(anomalias.length === 0
      ? ['Ninguna: cada `.mdx` tiene su entrada en `course.json` y cada entrada su archivo.']
      : anomalias.map((a) => `- \`${a.clase}\`: ${a.curso}/${a.leccion}`)),
    '',
    '## Lección por lección',
    '',
    '| Curso | Lección | Propias | Cola | Motivo | Decl. | Real |',
    '|---|---|---|---|---|---|---|',
  ];
  const cuerpo = filas.map(
    (f) =>
      `| ${f.curso} | ${f.leccion} | ${f.palabrasPropias} | ${f.palabrasCola} | \`${f.motivo}\` | ${f.minutosDeclarados} | ${f.minutosReales} |`,
  );
  return [...cabecera, ...cuerpo, ''].join('\n');
}

if (process.argv[1]?.endsWith('entrenamientos-reporte.ts')) {
  const scriptDir = dirname(fileURLToPath(import.meta.url));
  const raiz = resolve(scriptDir, '../..');
  const relevamiento = relevarCorpus(raiz);
  const salida = resolve(raiz, 'docs/reportes/2026-08-12-entrenamientos-inventario.md');
  writeFileSync(salida, markdown(relevamiento));
  process.stdout.write(
    `${String(relevamiento.filas.length)} lecciones relevadas, ${String(relevamiento.anomalias.length)} anomalías → ${salida}\n`,
  );
}
