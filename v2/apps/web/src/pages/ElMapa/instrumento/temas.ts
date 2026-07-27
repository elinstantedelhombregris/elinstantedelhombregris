/**
 * Los temas que emergen del texto de un área (spec 3 §5.3).
 *
 * Portado de v1: una lista de expresiones regulares por tema. Es un atajo y la
 * UI lo declara como tal — no es análisis semántico, es contar palabras. Que se
 * diga en pantalla importa: un tablero que presenta una regex como si fuera
 * comprensión enseña a confiar en algo que no lo merece.
 */
const PALABRAS: { tema: string; rx: RegExp }[] = [
  { tema: 'educación', rx: /educa(ción|r|tiv)/i },
  { tema: 'salud', rx: /salud|m[eé]dic|hospital|salita/i },
  { tema: 'trabajo', rx: /trabaj|empleo|laboral|changa/i },
  { tema: 'vivienda', rx: /viviend|hogar|casa propia|alquiler/i },
  { tema: 'seguridad', rx: /seguridad|polic[ií]a|inseguridad/i },
  { tema: 'justicia', rx: /justicia|derechos|corrupci[oó]n/i },
  { tema: 'economía', rx: /econom[ií]a|inflaci[oó]n|pobreza|precio/i },
  { tema: 'ambiente', rx: /ambient|ecolog|contamina|basura/i },
  { tema: 'transporte', rx: /transporte|colectivo|tren|subte|ruta|calle/i },
  { tema: 'agua', rx: /\bagua\b|cloaca|inunda/i },
];

const MAX_TEMAS = 4;

export interface TemaDetectado {
  tema: string;
  cantidad: number;
}

export function temasDe(textos: readonly string[]): TemaDetectado[] {
  const cuenta = new Map<string, number>();
  for (const texto of textos) {
    for (const { tema, rx } of PALABRAS) {
      if (rx.test(texto)) cuenta.set(tema, (cuenta.get(tema) ?? 0) + 1);
    }
  }
  return [...cuenta.entries()]
    .map(([tema, cantidad]) => ({ tema, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad || a.tema.localeCompare(b.tema, 'es'))
    .slice(0, MAX_TEMAS);
}

export const AVISO_TEMAS = 'Temas detectados por palabras. Es un atajo, no un análisis.';
