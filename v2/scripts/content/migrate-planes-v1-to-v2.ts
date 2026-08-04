/**
 * Deriva la edición publicada de los planes desde el taller.
 *
 * Run: pnpm planes:migrar
 *
 * Lee «Iniciativas Estratégicas/PLAN*_Argentina_ES.md», parte cada documento
 * (ver split-documento-plan.ts) y emite:
 *   - content/planes/<CODE>.mdx — frontmatter + cuerpo editorial + ficha
 *   - apps/web/src/lib/planes-index.generated.ts — solo el frontmatter
 *
 * Destructivo por diseño: borra todo .mdx de content/planes/ que no esté en
 * PLANES_SOURCES (los 23 stubs de arranque). El diff se revisa antes de commitear.
 */
import { readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { componerMdx } from './componer-mdx';
import { PLANES_SOURCES } from './planes-sources';
import { validarCamposPlanos } from './validar-campos-planos';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const V2_ROOT = resolve(SCRIPT_DIR, '../..');
const SALIDA_MDX = resolve(V2_ROOT, 'content/planes');
const SALIDA_INDICE = resolve(V2_ROOT, 'apps/web/src/lib/planes-index.generated.ts');

function main(): void {
  // 0) Guardia: ningún campo de frontmatter puede llevar algo que el parser
  //    del front no sepa des-escapar. Corre antes que cualquier I/O.
  for (const fuente of PLANES_SOURCES) {
    validarCamposPlanos(fuente);
  }

  const esperados = new Set(PLANES_SOURCES.map((p) => `${p.code}.mdx`));

  // 1) Barrer los stubs que no pertenecen al canon.
  for (const archivo of readdirSync(SALIDA_MDX)) {
    if (archivo.endsWith('.mdx') && !esperados.has(archivo)) {
      rmSync(resolve(SALIDA_MDX, archivo));
      process.stdout.write(`borrado (fuera del canon): ${archivo}\n`);
    }
  }

  // 2) Emitir los 23.
  for (const fuente of PLANES_SOURCES) {
    writeFileSync(resolve(SALIDA_MDX, `${fuente.code}.mdx`), componerMdx(fuente), 'utf8');
  }

  // 3) Emitir el índice.
  const filas = PLANES_SOURCES.map(
    (p) => `  {
    slug: '${p.slug}',
    code: '${p.code}',
    title: ${JSON.stringify(p.title)},
    nombreInstitucional: ${JSON.stringify(p.nombreInstitucional)},
    summary: ${JSON.stringify(p.summary)},
    orderIndex: ${String(p.orderIndex)},
    isMeta: ${String(p.isMeta)},
  },`,
  ).join('\n');

  writeFileSync(
    SALIDA_INDICE,
    `/**
 * GENERADO — no editar a mano. Correr \`pnpm planes:migrar\`.
 *
 * Solo el frontmatter de los ${String(PLANES_SOURCES.length)} documentos del canon: es lo único que entra eager al bundle.
 * Los cuerpos (5,1 MB) se cargan por \`import()\` desde plans-registry.ts.
 */

export interface EntradaIndicePlan {
  slug: string;
  code: string;
  title: string;
  nombreInstitucional: string;
  summary: string;
  orderIndex: number;
  isMeta: boolean;
}

export const PLANES_INDEX: readonly EntradaIndicePlan[] = [
${filas}
];
`,
    'utf8',
  );

  process.stdout.write(`${String(PLANES_SOURCES.length)} planes emitidos + índice generado.\n`);
}

main();
