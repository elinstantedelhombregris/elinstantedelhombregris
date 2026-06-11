/**
 * Design tokens — sistema visual "plata editorial".
 * UN acento (violeta iris) para acción, UN gradiente plata para identidad,
 * UN estilo de card de vidrio. Nada más define colores propios.
 */

/** Violeta iris — único color de acción (CTAs, links, hovers, focus). */
export const ACCENT = '#7D5BDE';
export const ACCENT_HOVER = '#8D6FE4';
/** Tinte legible del acento para texto/links sobre fondo oscuro (hover: #B5A3EF). */
export const ACCENT_TEXT = '#9D85E8';

/** Único tratamiento de título display (línea destacada de H1/H2). */
export const DISPLAY_GRADIENT =
  'text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-400';

/** Única card de vidrio del sitio. */
export const GLASS_CARD =
  'rounded-2xl bg-white/[0.03] border border-white/10';

/** Único hover de card: borde más presente + lift + glow violeta sutil, 300ms. */
export const GLASS_CARD_HOVER =
  'transition-all duration-300 hover:border-white/25 hover:-translate-y-1 ' +
  'hover:shadow-[0_0_40px_rgba(125,91,222,0.10)]';

/** Único estilo de badge/kicker de sección. */
export const SECTION_BADGE =
  'inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/[0.08] ' +
  'text-[11px] uppercase tracking-[0.3em] text-slate-400';

/** Único tratamiento de pull-quote. */
export const PULL_QUOTE = 'font-serif italic text-slate-300/90';

/** CTA primario violeta (botón redondo grande). */
export const ACCENT_BUTTON =
  'bg-[#7D5BDE] hover:bg-[#8D6FE4] text-white ' +
  'shadow-[0_0_40px_rgba(125,91,222,0.30)] hover:shadow-[0_0_60px_rgba(125,91,222,0.45)]';

/** Ritmo vertical de sección. */
export const SECTION_PAD = 'py-20 md:py-28';

/** ACCENT como tripleta RGB para APIs que piden arrays (deck.gl, canvas). */
export const ACCENT_RGB: [number, number, number] = [
  parseInt(ACCENT.slice(1, 3), 16),
  parseInt(ACCENT.slice(3, 5), 16),
  parseInt(ACCENT.slice(5, 7), 16),
];

/** rgba() del acento con alpha — para fills/borders que no pueden usar clases. */
export const accentAlpha = (alpha: number): string =>
  `rgba(${ACCENT_RGB[0]}, ${ACCENT_RGB[1]}, ${ACCENT_RGB[2]}, ${alpha})`;

const mix = (from: [number, number, number], to: [number, number, number], t: number): [number, number, number] =>
  [0, 1, 2].map((i) => Math.round(from[i] + (to[i] - from[i]) * t)) as [number, number, number];

const MAP_DARK: [number, number, number] = [10, 10, 20]; // bg-[#0a0a0a] aprox

/**
 * Rampa de densidad del mapa (hexágonos 3D): oscuro → ACCENT → claro.
 * Derivada del acento para que cambiar ACCENT recolorée el mapa entero.
 */
export const MAP_HEX_COLOR_RANGE: [number, number, number][] = [
  mix(MAP_DARK, ACCENT_RGB, 0.25),
  mix(MAP_DARK, ACCENT_RGB, 0.5),
  mix(MAP_DARK, ACCENT_RGB, 0.75),
  ACCENT_RGB,
  mix(ACCENT_RGB, [255, 255, 255], 0.3),
  mix(ACCENT_RGB, [255, 255, 255], 0.55),
];
