/**
 * Similitud de textos por trigramas — la guardia contra contenido clonado.
 */
export const UMBRAL_GEMELOS = 0.55;

export function trigramas(texto: string): Set<string> {
  const limpio = texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
  const resultado = new Set<string>();
  for (let i = 0; i + 3 <= limpio.length; i += 1) resultado.add(limpio.slice(i, i + 3));
  return resultado;
}

export function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 1;
  let comunes = 0;
  for (const t of a) if (b.has(t)) comunes += 1;
  return comunes / (a.size + b.size - comunes);
}

export function sonGemelos(a: string, b: string, umbral: number = UMBRAL_GEMELOS): boolean {
  return jaccard(trigramas(a), trigramas(b)) > umbral;
}
