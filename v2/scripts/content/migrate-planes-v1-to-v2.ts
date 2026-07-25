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
import { readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { type FuentePlan, PLANES_SOURCES } from './planes-sources';
import { partirDocumentoPlan } from './split-documento-plan';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const V2_ROOT = resolve(SCRIPT_DIR, '../..');
const REPO_ROOT = resolve(V2_ROOT, '..');
const CORPUS = resolve(REPO_ROOT, 'Iniciativas Estratégicas');
const SALIDA_MDX = resolve(V2_ROOT, 'content/planes');
const SALIDA_INDICE = resolve(V2_ROOT, 'apps/web/src/lib/planes-index.generated.ts');

export const MARCADOR_FICHA = '## Ficha del expediente';

/** Escapa comillas simples para el frontmatter YAML entre comillas simples. */
function yamlSingle(valor: string): string {
  return `'${valor.replace(/'/g, "''")}'`;
}

/**
 * yamlSingle() escapa `'` como `''` (la convención YAML), pero el parser de
 * frontmatter que lee estos archivos en runtime —
 * `apps/web/src/lib/plans-registry.ts` — solo saca las comillas de los
 * bordes de la línea; no des-escapa `''`. Si algún día un title,
 * nombreInstitucional o summary trajera una comilla simple, el YAML emitido
 * sería válido pero el front leería el valor cortado en el medio: corrupción
 * silenciosa, no un error visible. Un salto de línea es peor todavía — parte
 * la línea `clave: valor` en dos y el resto del frontmatter deja de parsear.
 * Frenamos acá, antes de escribir un solo archivo, en vez de dejar que este
 * desacople data-fix ↔ parser se cuele al bundle sin que nadie lo note.
 */
function validarCamposPlanos(fuente: FuentePlan): void {
  const campos: ReadonlyArray<readonly [string, string]> = [
    ['title', fuente.title],
    ['nombreInstitucional', fuente.nombreInstitucional],
    ['summary', fuente.summary],
  ];
  for (const [campo, valor] of campos) {
    if (valor.includes("'")) {
      throw new Error(
        `${fuente.code}.${campo} contiene una comilla simple ('): ` +
          'el parser de frontmatter en apps/web/src/lib/plans-registry.ts no des-escapa `\'\'`, ' +
          'así que el valor quedaría cortado en runtime. Corregí PLANES_SOURCES antes de migrar.',
      );
    }
    if (valor.includes('\n')) {
      throw new Error(
        `${fuente.code}.${campo} contiene un salto de línea: ` +
          'rompe la línea "clave: valor" del frontmatter YAML. Corregí PLANES_SOURCES antes de migrar.',
      );
    }
  }
}

function componerMdx(fuente: (typeof PLANES_SOURCES)[number]): string {
  const raw = readFileSync(resolve(CORPUS, fuente.archivoFuente), 'utf8');
  const { cabecera, cuerpo, parches } = partirDocumentoPlan(raw);

  const ficha = [cabecera, parches].filter((s) => s !== '').join('\n\n');

  const frontmatter = [
    '---',
    `slug: ${fuente.slug}`,
    `code: ${fuente.code}`,
    `title: ${yamlSingle(fuente.title)}`,
    `nombreInstitucional: ${yamlSingle(fuente.nombreInstitucional)}`,
    `summary: ${yamlSingle(fuente.summary)}`,
    `orderIndex: ${String(fuente.orderIndex)}`,
    `isMeta: ${String(fuente.isMeta)}`,
    'draft: false',
    '---',
  ].join('\n');

  return `${frontmatter}\n\n${cuerpo}\n\n${MARCADOR_FICHA}\n\n${ficha}\n`;
}

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
      console.log(`borrado (fuera del canon): ${archivo}`);
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
 * Solo el frontmatter de los 23 planes: es lo único que entra eager al bundle.
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

  console.log(`${String(PLANES_SOURCES.length)} planes emitidos + índice generado.`);
}

main();
