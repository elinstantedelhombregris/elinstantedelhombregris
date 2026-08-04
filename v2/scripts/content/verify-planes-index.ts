/**
 * Guardia de CI: el índice generado tiene que coincidir con el frontmatter de
 * los .mdx, y los .mdx tienen que coincidir con lo que el taller produciría
 * ahora mismo. Corre en v2-ci.yml como `pnpm planes:check`.
 *
 * La segunda mitad es la que cierra el agujero: sin ella, esta guardia solo
 * comparaba el índice generado contra los .mdx commiteados — nunca volvía a
 * leer «Iniciativas Estratégicas/». Editar el taller y olvidarse de correr
 * `pnpm planes:migrar` quedaba verde acá y servía texto viejo en el sitio.
 *
 * Run: pnpm planes:check
 */
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { PLANES_INDEX } from '../../apps/web/src/lib/planes-index.generated';

import { componerMdx, MARCADOR_FICHA } from './componer-mdx';
import { PLANES_SOURCES } from './planes-sources';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const V2_ROOT = resolve(SCRIPT_DIR, '../..');
const MDX_DIR = resolve(V2_ROOT, 'content/planes');

const CAMPOS_TEXTO = ['slug', 'code', 'title', 'nombreInstitucional', 'summary'] as const;

/**
 * El canon pasó de 22 a 26 temáticos el 2026-08-01, con la entrada de PLANPACTO
 * (23), PLANARCO (24), PLANPREGUNTA (25) y PLANFOCO (26); y de 26 a 27 el
 * 2026-08-02 con PLANPUERTA (27), habilitado por
 * `Iniciativas Estratégicas/ACTA_EXCEPCION_FREEZE_2026-08-02.md`. La autoridad de
 * papel es `Iniciativas Estratégicas/PLAN_REGISTRY.yml` (`thematic_count`), y este
 * número tiene que seguirla — no al revés.
 */
const TEMATICOS_ESPERADOS = 27;

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
  if (tematicos.length !== TEMATICOS_ESPERADOS) {
    errores.push(
      `Se esperaban ${String(TEMATICOS_ESPERADOS)} planes temáticos, hay ${String(tematicos.length)}.`,
    );
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

    const marcadores = raw.split('\n').filter((l) => l === MARCADOR_FICHA).length;
    if (marcadores !== 1) {
      errores.push(`${entrada.code}: ${String(marcadores)} marcadores «${MARCADOR_FICHA}», se esperaba 1`);
    }
  }

  // El taller, re-derivado. Componemos cada .mdx en memoria desde
  // «Iniciativas Estratégicas/» con la misma función que usa la migración
  // (componerMdx) y lo comparamos byte a byte contra lo commiteado. Esto es
  // lo único de esta guardia que vuelve a tocar el taller: todo lo de
  // arriba compara el índice contra el .mdx, nunca contra la fuente.
  for (const fuente of PLANES_SOURCES) {
    const ruta = resolve(MDX_DIR, `${fuente.code}.mdx`);
    let comprometido: string;
    try {
      comprometido = readFileSync(ruta, 'utf8');
    } catch {
      // Ya lo reportamos como "falta content/planes/…" en el loop de arriba.
      continue;
    }

    let recompuesto: string;
    try {
      recompuesto = componerMdx(fuente);
    } catch (err) {
      const motivo = err instanceof Error ? err.message : String(err);
      errores.push(`${fuente.code}: no se pudo re-derivar desde el taller (${motivo}).`);
      continue;
    }

    if (recompuesto !== comprometido) {
      errores.push(
        `${fuente.code}: el taller no coincide con lo commiteado en content/planes/${fuente.code}.mdx — ¿se editó uno de los dos sin re-derivar?`,
      );
    }
  }

  if (errores.length > 0) {
    process.stderr.write('El índice de planes no coincide con el contenido:\n\n');
    for (const e of errores) process.stderr.write(`  · ${e}\n`);
    process.stderr.write('\nCorré `pnpm planes:migrar` y revisá el diff.\n');
    process.exit(1);
  }

  process.stdout.write(
    `Índice de planes OK: ${String(PLANES_INDEX.length)} entradas coinciden con content/planes/.\n`,
  );
}

main();
