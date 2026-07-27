/**
 * Design tokens — Papel y Tinta
 * (docs/superpowers/specs/2026-07-21-juego-papel-y-tinta.md).
 *
 * Fuente de verdad para estilos inline de RN donde className no llega
 * (Skia, SVG, Reanimated, estados calculados). El resto usa las clases
 * tailwind (bg-papel, text-tinta-90, border-oscuro-borde…).
 */

/** Base de navegación bajo el Cielo — el borde del gradiente nocturno. */
export const BG = '#0B0908';

/** El papel: fondo del registro claro. */
export const PAPEL = '#F2EFE7';
/** Paneles sobre el papel — cards, inputs, el bloque QR. */
export const PAPEL_CRUDO = '#FBFAF4';

/** La tinta: texto, bordes e íconos funcionales sobre el papel. */
export const TINTA = '#16130E';
/** Tinta al 50% — meta, deshabilitado. */
export const TINTA_50 = '#7A756A';
/** Tinta al 30% — numeración, notas al pie, palitos huecos, arranque del inkfill. */
export const TINTA_30 = '#B5B1A8';

/** Chrome del registro nocturno (el Cielo, modales de las luces). */
export const OSCURO_TEXTO = '#F2EFE7';
export const OSCURO_SECUNDARIO = '#C9C5BA';
export const OSCURO_META = '#8E8A82';
export const OSCURO_TENUE = '#5C594F';
export const OSCURO_BORDE = '#3A362D';
export const OSCURO_BARRA = '#241F17';

/** Violeta — único color de acción en Papel y Tinta. */
export const VIOLETA = '#5227CC';
/** Variante legible del violeta sobre fondo oscuro (noche). */
export const VIOLETA_CLARO = '#9D85E8';

/** Rojo sello — el catálogo cerrado de sellos y las zonas de borrado. */
export const ROJO_SELLO = '#C23B22';
/** Verde — señal `compromiso` y los sellos de éxito. */
export const VERDE = '#1A7A4A';
/** Ámbar Papel y Tinta — señal `need`. */
export const AMBAR_PT = '#A16C00';
/** Cian — señal `recurso`. */
export const CIAN = '#0F6B8A';
