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
