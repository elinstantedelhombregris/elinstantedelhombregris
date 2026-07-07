/**
 * Design tokens — sistema visual "plata editorial", espejo exacto de
 * SocialJusticeHub/client/src/lib/design-tokens.ts.
 * UN acento (violeta iris) para acción, UN gradiente plata para identidad,
 * UNA card de vidrio. Nada más define colores propios.
 */

/** Fondo del universo. */
export const BG = '#0a0a0a';

/** Violeta iris — único color de acción (CTAs, links, focus). */
export const ACCENT = '#7D5BDE';
export const ACCENT_HOVER = '#8D6FE4';
/** Tinte legible del acento para texto sobre fondo oscuro. */
export const ACCENT_TEXT = '#9D85E8';

/** Plata — el color de los datos en reposo (argentum). */
export const PLATA = '#F5F7FA';

/** Gradiente display (identidad): blanco → slate-200 → slate-400, de arriba a abajo. */
export const DISPLAY_GRADIENT_COLORS = ['#ffffff', '#e2e8f0', '#94a3b8'] as const;

/** ACCENT como tripleta RGB para APIs que piden arrays (MapLibre, Skia). */
export const ACCENT_RGB: [number, number, number] = [
  parseInt(ACCENT.slice(1, 3), 16),
  parseInt(ACCENT.slice(3, 5), 16),
  parseInt(ACCENT.slice(5, 7), 16),
];

/** rgba() del acento con alpha — para fills/borders fuera de clases. */
export const accentAlpha = (alpha: number): string =>
  `rgba(${ACCENT_RGB[0]}, ${ACCENT_RGB[1]}, ${ACCENT_RGB[2]}, ${alpha})`;

const mix = (
  from: [number, number, number],
  to: [number, number, number],
  t: number,
): [number, number, number] =>
  [0, 1, 2].map((i) => Math.round(from[i]! + (to[i]! - from[i]!) * t)) as [
    number,
    number,
    number,
  ];

const MAP_DARK: [number, number, number] = [10, 10, 20];

/** Rampa de densidad del mapa: oscuro → ACCENT → claro (derivada del acento). */
export const MAP_HEX_COLOR_RANGE: [number, number, number][] = [
  mix(MAP_DARK, ACCENT_RGB, 0.25),
  mix(MAP_DARK, ACCENT_RGB, 0.5),
  mix(MAP_DARK, ACCENT_RGB, 0.75),
  ACCENT_RGB,
  mix(ACCENT_RGB, [255, 255, 255], 0.3),
  mix(ACCENT_RGB, [255, 255, 255], 0.55),
];
