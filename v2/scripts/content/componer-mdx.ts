/**
 * Compone el .mdx publicado de un plan a partir de su documento en el taller.
 *
 * Extraído de migrate-planes-v1-to-v2.ts para que se pueda importar sin
 * ejecutar el `main()` de la migración (que borra y reescribe
 * content/planes/) — el mismo patrón que validar-campos-planos.ts y
 * leer-portada.ts. Lo usan la migración (para escribir el .mdx) y la
 * guardia de CI en verify-planes-index.ts (para re-derivarlo en memoria y
 * comparar contra lo commiteado).
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { partirDocumentoPlan } from './split-documento-plan';

import type { FuentePlan } from './planes-sources';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const V2_ROOT = resolve(SCRIPT_DIR, '../..');
const REPO_ROOT = resolve(V2_ROOT, '..');
const CORPUS = resolve(REPO_ROOT, 'Iniciativas Estratégicas');

export const MARCADOR_FICHA = '## Ficha del expediente';

/** Escapa comillas simples para el frontmatter YAML entre comillas simples. */
export function yamlSingle(valor: string): string {
  return `'${valor.replace(/'/g, "''")}'`;
}

export function componerMdx(fuente: FuentePlan): string {
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
