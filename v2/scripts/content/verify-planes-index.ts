/**
 * Guardia de CI: el índice generado tiene que coincidir con el frontmatter de
 * los .mdx. Corre en v2-ci.yml como `pnpm planes:check`.
 *
 * Run: pnpm planes:check
 */
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { PLANES_INDEX } from '../../apps/web/src/lib/planes-index.generated';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const V2_ROOT = resolve(SCRIPT_DIR, '../..');
const MDX_DIR = resolve(V2_ROOT, 'content/planes');

const CAMPOS_TEXTO = ['slug', 'code', 'title', 'nombreInstitucional', 'summary'] as const;

function leerFrontmatter(raw: string): Record<string, string> {
  const match = /^---\n([\s\S]*?)\n---\n/.exec(raw);
  if (!match) return {};
  const fm: Record<string, string> = {};
  for (const linea of (match[1] ?? '').split('\n')) {
    const m = /^([a-zA-Z0-9_]+)\s*:\s*(.*?)\s*$/.exec(linea);
    if (!m?.[1]) continue;
    let valor = m[2] ?? '';
    if (valor.startsWith("'") && valor.endsWith("'")) {
      valor = valor.slice(1, -1).replace(/''/g, "'");
    }
    fm[m[1]] = valor;
  }
  return fm;
}

function main(): void {
  const errores: string[] = [];

  const archivos = readdirSync(MDX_DIR).filter((f) => f.endsWith('.mdx'));
  const nombresArchivo = new Set(archivos.map((f) => f.replace(/\.mdx$/, '')));

  // El probe de existencia de cada entrada (más abajo) asume que `code` es
  // único en el índice. Si hay un duplicado, un archivo puede taparle el
  // faltante al otro sin que nadie se entere — lo chequeamos primero.
  const codigosVistos = new Set<string>();
  const codigosDuplicados = new Set<string>();
  for (const entrada of PLANES_INDEX) {
    if (codigosVistos.has(entrada.code)) codigosDuplicados.add(entrada.code);
    codigosVistos.add(entrada.code);
  }
  for (const code of [...codigosDuplicados].sort()) {
    errores.push(`code duplicado en el índice: ${code} aparece más de una vez en PLANES_INDEX.`);
  }

  // Reconciliación por nombre entre el directorio y el índice: en vez de
  // comparar cantidades, cruzamos los dos conjuntos y nombramos a cada
  // ofensor. Los archivos sin entrada salen acá; las entradas sin archivo
  // ya las reporta el probe de existencia del loop principal (evitamos
  // duplicar el mismo caso desde los dos lados).
  const codigosIndice = new Set(PLANES_INDEX.map((p) => p.code));
  for (const nombre of [...nombresArchivo].sort()) {
    if (!codigosIndice.has(nombre)) {
      errores.push(`sobra content/planes/${nombre}.mdx: no está en el índice.`);
    }
  }

  const meta = PLANES_INDEX.filter((p) => p.isMeta);
  const tematicos = PLANES_INDEX.filter((p) => !p.isMeta);
  if (meta.length !== 1) errores.push(`Se esperaba 1 plan meta, hay ${String(meta.length)}.`);
  if (tematicos.length !== 22) {
    errores.push(`Se esperaban 22 planes temáticos, hay ${String(tematicos.length)}.`);
  }

  for (const entrada of PLANES_INDEX) {
    const ruta = resolve(MDX_DIR, `${entrada.code}.mdx`);
    let raw: string;
    try {
      raw = readFileSync(ruta, 'utf8');
    } catch {
      errores.push(`${entrada.code}: falta content/planes/${entrada.code}.mdx`);
      continue;
    }

    const fm = leerFrontmatter(raw);
    for (const campo of CAMPOS_TEXTO) {
      if (fm[campo] !== entrada[campo]) {
        errores.push(
          `${entrada.code}.${campo}: el .mdx dice ${JSON.stringify(fm[campo])} y el índice ${JSON.stringify(entrada[campo])}`,
        );
      }
    }
    if (fm.orderIndex !== String(entrada.orderIndex)) {
      errores.push(`${entrada.code}.orderIndex: .mdx=${fm.orderIndex ?? '—'} índice=${String(entrada.orderIndex)}`);
    }
    if (fm.isMeta !== String(entrada.isMeta)) {
      errores.push(`${entrada.code}.isMeta: .mdx=${fm.isMeta ?? '—'} índice=${String(entrada.isMeta)}`);
    }

    const marcadores = raw.split('\n').filter((l) => l === '## Ficha del expediente').length;
    if (marcadores !== 1) {
      errores.push(`${entrada.code}: ${String(marcadores)} marcadores «## Ficha del expediente», se esperaba 1`);
    }
  }

  if (errores.length > 0) {
    console.error('El índice de planes no coincide con el contenido:\n');
    for (const e of errores) console.error(`  · ${e}`);
    console.error('\nCorré `pnpm planes:migrar` y revisá el diff.');
    process.exit(1);
  }

  console.log(`Índice de planes OK: ${String(PLANES_INDEX.length)} entradas coinciden con content/planes/.`);
}

main();
