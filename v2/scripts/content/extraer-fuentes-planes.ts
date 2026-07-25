/**
 * One-shot: arma la tabla de fuentes de los 23 planes.
 *
 * Run: pnpm tsx scripts/content/extraer-fuentes-planes.ts
 *
 * Salida: scripts/content/planes-sources.ts — que después se REVISA Y SE CORRIGE
 * A MANO. La extracción de títulos desde la portada ASCII es heurística; el
 * archivo emitido es un borrador, no una autoridad.
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { PLAN_NODES } from '../../../SocialJusticeHub/shared/arquitecto-data';
import { STRATEGIC_INITIATIVES } from '../../../SocialJusticeHub/shared/strategic-initiatives';

import { leerPortada } from './leer-portada';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const V2_ROOT = resolve(SCRIPT_DIR, '../..');
const REPO_ROOT = resolve(V2_ROOT, '..');
const CORPUS = resolve(REPO_ROOT, 'Iniciativas Estratégicas');
const SALIDA = resolve(SCRIPT_DIR, 'planes-sources.ts');

/** PLANRUTA es meta: no está en PLAN_NODES ni en STRATEGIC_INITIATIVES. */
const SUMMARY_PLANRUTA =
  'PLANRUTA es el meta-plan: cómo se arranca la ejecución de los otros 22, cómo se activa la red sin esperar permiso, cómo se sostiene el cambio en momentos de crisis. No es un plan más; es el manual de cómo arrancar todo.';

function main(): void {
  const archivos = readdirSync(CORPUS)
    .filter((f) => f.startsWith('PLAN') && f.endsWith('_Argentina_ES.md'))
    .sort();

  const filas = archivos.map((archivo) => {
    const code = archivo.replace('_Argentina_ES.md', '');
    const raw = readFileSync(resolve(CORPUS, archivo), 'utf8');
    const { title, nombreInstitucional } = leerPortada(raw);

    const isMeta = code === 'PLANRUTA';
    const nodo = PLAN_NODES.find((p) => p.id === code);
    const iniciativa = STRATEGIC_INITIATIVES.find((i) => i.title === code);

    if (!isMeta && !nodo) throw new Error(`${code}: sin ordinal en arquitecto-data.ts`);
    if (!isMeta && !iniciativa) throw new Error(`${code}: sin summary en strategic-initiatives.ts`);

    return {
      code,
      slug: code.toLowerCase(),
      title,
      nombreInstitucional,
      summary: isMeta ? SUMMARY_PLANRUTA : (iniciativa?.summary ?? ''),
      orderIndex: isMeta ? 0 : (nodo?.ordinal ?? 99),
      isMeta,
      archivoFuente: archivo,
    };
  });

  filas.sort((a, b) => a.orderIndex - b.orderIndex);

  const cuerpo = filas
    .map(
      (f) => `  {
    code: '${f.code}',
    slug: '${f.slug}',
    title: ${JSON.stringify(f.title)},
    nombreInstitucional: ${JSON.stringify(f.nombreInstitucional)},
    summary: ${JSON.stringify(f.summary)},
    orderIndex: ${String(f.orderIndex)},
    isMeta: ${String(f.isMeta)},
    archivoFuente: '${f.archivoFuente}',
  },`,
    )
    .join('\n');

  writeFileSync(
    SALIDA,
    `/**
 * Frontmatter de los 23 planes del canon.
 *
 * Borrador emitido por scripts/content/extraer-fuentes-planes.ts y DESPUÉS
 * CORREGIDO A MANO. Esta tabla es la autoridad: el extractor no se vuelve a
 * correr sin revisar el diff línea por línea.
 *
 * Procedencia — title y nombreInstitucional: portada del documento del corpus.
 * summary: SocialJusticeHub/shared/strategic-initiatives.ts (PLANRUTA: stub v2).
 * orderIndex: ordinal de SocialJusticeHub/shared/arquitecto-data.ts.
 */

export interface FuentePlan {
  code: string;
  slug: string;
  /** Título evocativo de la portada — el que ve el índice cerrado. */
  title: string;
  /** «Plan Nacional de…» — el que aparece en el pliegue. */
  nombreInstitucional: string;
  summary: string;
  orderIndex: number;
  isMeta: boolean;
  /** Nombre del archivo en «Iniciativas Estratégicas/». */
  archivoFuente: string;
}

export const PLANES_SOURCES: readonly FuentePlan[] = [
${cuerpo}
];
`,
    'utf8',
  );

  console.log(`planes-sources.ts emitido con ${String(filas.length)} entradas.`);
}

main();
