/**
 * Minutos de lectura — la única sede de la velocidad del proyecto.
 *
 * El valor 220 no se elige acá: es el que blog y ensayos ya usaban desde su
 * migración, y cambiarlo movería cifras publicadas. Este módulo existe para que
 * no haya una cuarta copia.
 */

export const PALABRAS_POR_MINUTO = 220;

/** Bloques cuyo contenido no es prosa y no se cuenta. */
const BLOQUES_NO_PROSA = [/```[\s\S]*?```/g, /<svg[\s\S]*?<\/svg>/gi, /<pre[\s\S]*?<\/pre>/gi];

/**
 * Palabras que un lector realmente lee: prosa, encabezados, listas y tablas.
 * Fuera: código, SVG, `<pre>` y las etiquetas HTML (su texto interior sí cuenta).
 * El cuerpo entra SIN frontmatter — usar `stripFrontmatter` antes.
 */
export function contarPalabrasRenderizables(cuerpoSinFrontmatter: string): number {
  let texto = cuerpoSinFrontmatter;
  for (const bloque of BLOQUES_NO_PROSA) texto = texto.replace(bloque, ' ');
  texto = texto.replace(/<[^>]+>/g, ' ');
  return texto.split(/\s+/).filter((t) => /[\p{L}\p{N}]/u.test(t)).length;
}

/** Minutos de lectura, mínimo 1. Misma fórmula que blog y ensayos. */
export function minutosDeLectura(palabras: number): number {
  return Math.max(1, Math.ceil(palabras / PALABRAS_POR_MINUTO));
}
