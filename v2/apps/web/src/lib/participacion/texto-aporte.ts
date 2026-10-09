/** El límite de caracteres de un aporte; el mismo que valida la API. */
export const LIMITE_APORTE = 2000;

/** Las respuestas con algo escrito, separadas por una línea en blanco. */
export function unirRespuestas(respuestas: readonly string[]): string {
  return respuestas
    .map((r) => r.trim())
    .filter(Boolean)
    .join('\n\n');
}

/**
 * Deja el texto dentro del límite cortando donde termina una frase.
 *
 * Tres respuestas de 2.000 caracteres juntas pasan de 6.000: el texto que se
 * ofrece para publicar tiene que entrar sin que la persona tenga que descubrir
 * por qué el botón no anda. Corta en el último fin de frase o de párrafo; si
 * no hay uno razonablemente cerca, en el último espacio; y si tampoco, a secas.
 * Nunca devuelve más que `limite`.
 */
export function recortarEnFrase(
  texto: string,
  limite: number = LIMITE_APORTE,
): { texto: string; recortado: boolean } {
  const t = texto.trim();
  if (t.length <= limite) return { texto: t, recortado: false };
  // Un carácter de más para que el `(?=\s|$)` vea qué viene después del corte.
  const ventana = t.slice(0, limite + 1);
  const piso = Math.floor(limite * 0.3);
  let corte = -1;
  for (const m of ventana.matchAll(/[.!?…](?=\s|$)|\n\s*\n/g)) {
    const fin = m[0].startsWith('\n') ? m.index : m.index + m[0].length;
    if (fin <= limite) corte = fin;
  }
  if (corte >= piso) return { texto: t.slice(0, corte).trimEnd(), recortado: true };
  const espacio = t.slice(0, limite).search(/\s\S*$/);
  if (espacio >= piso) return { texto: t.slice(0, espacio).trimEnd(), recortado: true };
  return { texto: t.slice(0, limite), recortado: true };
}
