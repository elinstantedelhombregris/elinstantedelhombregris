import type { TipoVoz } from '~/components/papel/primitives';

/** Los 6 tipos en el orden del panel (§7). */
export const TIPOS_VOZ: readonly TipoVoz[] = ['basta', 'sueño', 'necesidad', 'compromiso', 'recurso', 'valor'];

/** Categorías fuera del catálogo caen en 'valor' (tinta) — mismo criterio que VocesTicker. */
export function tipoDeCategoria(categoria: string | null): TipoVoz {
  return TIPOS_VOZ.find((tipo) => tipo === categoria) ?? 'valor';
}

/** Relleno de los puntos del mapa. */
export const FILL_TIPO: Record<TipoVoz, string> = {
  basta: 'fill-sello',
  sueño: 'fill-violeta',
  necesidad: 'fill-ambar',
  compromiso: 'fill-verde',
  recurso: 'fill-cian',
  valor: 'fill-tinta',
};

/** Color del label de tipo en el feed (sobre papel). */
export const TEXTO_TIPO: Record<TipoVoz, string> = {
  basta: 'text-sello',
  sueño: 'text-violeta',
  necesidad: 'text-ambar',
  compromiso: 'text-verde',
  recurso: 'text-cian',
  valor: 'text-tinta',
};

/** Borde izquierdo del popover (el color va en el borde, no en texto sobre oscuro — AA). */
export const BORDE_TIPO: Record<TipoVoz, string> = {
  basta: 'border-sello',
  sueño: 'border-violeta',
  necesidad: 'border-ambar',
  compromiso: 'border-verde',
  recurso: 'border-cian',
  valor: 'border-papel',
};

export const PLACEHOLDER_NEUTRO = 'Elegí un tipo y decilo como te sale.';

export const PLACEHOLDER_TIPO: Record<TipoVoz, string> = {
  basta: '¿De qué te cansaste? Decilo sin filtro.',
  sueño: '¿Qué país te imaginás? Escribilo como si ya existiera.',
  necesidad: '¿Qué falta donde vivís? Nombralo concreto.',
  compromiso: '¿Qué vas a hacer vos? Prometé poco y cumplilo.',
  recurso: '¿Qué sabés hacer, qué tenés para prestar? Ofrecelo.',
  valor: '¿Qué no se negocia para vos? Dejalo por escrito.',
};
