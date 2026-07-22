/** Geometría de los puntos de voz — pura y determinista (testeable sin DOM). */

export interface PuntoJitter {
  x: number;
  y: number;
}

/** Cap de puntos dibujados por provincia; más allá, el cluster muestra el número. */
export const MAX_PUNTOS_PROVINCIA = 8;

const ANGULO_AUREO = 2.399963229728653;

/**
 * Espiral de ángulo áureo alrededor del centroide: el punto 0 es el centro,
 * el resto se reparte dentro de `radio`. Indexada — sin random: mismo input,
 * mismo dibujo en cada render (la honestidad del jitter la declara la leyenda).
 */
export function puntosJitter(n: number, cx: number, cy: number, radio = 14): PuntoJitter[] {
  return Array.from({ length: n }, (_, i) => {
    if (i === 0) return { x: cx, y: cy };
    const r = radio * Math.sqrt(i / Math.max(n - 1, 1));
    const a = i * ANGULO_AUREO;
    return {
      x: Math.round((cx + r * Math.cos(a)) * 10) / 10,
      y: Math.round((cy + r * Math.sin(a)) * 10) / 10,
    };
  });
}
