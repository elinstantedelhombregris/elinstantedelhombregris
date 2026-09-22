import type { Fuente } from './frontmatter.js';

/**
 * Las `fuentes:` del frontmatter de una lección, leídas del texto crudo.
 *
 * Existe porque el lector de lecciones corre en el navegador y la web no
 * empaqueta un parser de YAML: sumar uno entero para leer un solo campo es el
 * tipo de dependencia que v2 no se permite. Lee **sólo** la forma que escriben
 * los cierres del Ciclo 1:
 *
 * ```yaml
 * fuentes:
 *   - url: https://…
 *     titulo: '…'
 *     consultada: '2026-09-22'
 * ```
 *
 * Que no se desvíe del YAML de verdad lo cuida `entrenamientos:check`, que
 * compara esta lectura con la de `gray-matter` en las 329 lecciones y rompe si
 * alguna difiere. Una fuente que el lector no pudiera leer sería una fuente
 * que el sitio dice tener y no muestra.
 */
export function fuentesDeFrontmatter(raw: string): Fuente[] {
  const fm = /^---\n([\s\S]*?)\n---\n/.exec(raw)?.[1];
  if (fm === undefined) return [];
  const lineas = fm.split('\n');
  const inicio = lineas.findIndex((l) => /^fuentes:\s*$/.test(l));
  if (inicio === -1) return [];

  const fuentes: Fuente[] = [];
  let actual: Partial<Fuente> | null = null;
  for (const linea of lineas.slice(inicio + 1)) {
    if (!/^\s/.test(linea)) break; // la siguiente clave de primer nivel cierra la lista
    const m = /^\s+(-\s+)?(url|titulo|consultada):\s*(.*)$/.exec(linea);
    if (m === null) continue;
    const [, guion, clave, valorCrudo = ''] = m;
    if (guion !== undefined) {
      if (actual !== null) fuentes.push(actual as Fuente);
      actual = {};
    }
    if (actual === null || clave === undefined) continue;
    actual[clave as keyof Fuente] = desentrecomillar(valorCrudo.trim());
  }
  if (actual !== null) fuentes.push(actual as Fuente);
  return fuentes.filter((f) => f.url && f.titulo && f.consultada);
}

function desentrecomillar(valor: string): string {
  if (valor.startsWith("'") && valor.endsWith("'")) return valor.slice(1, -1).replaceAll("''", "'");
  if (valor.startsWith('"') && valor.endsWith('"')) return valor.slice(1, -1).replaceAll('\\"', '"');
  return valor;
}
