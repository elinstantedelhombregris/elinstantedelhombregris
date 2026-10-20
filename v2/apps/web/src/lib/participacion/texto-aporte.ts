/** El límite de caracteres de un aporte; el mismo que valida la API. */
export const LIMITE_APORTE = 2000;

/** Las respuestas con algo escrito, separadas por una línea en blanco. */
export function unirRespuestas(respuestas: readonly string[]): string {
  return respuestas
    .map((r) => r.trim())
    .filter(Boolean)
    .join('\n\n');
}
