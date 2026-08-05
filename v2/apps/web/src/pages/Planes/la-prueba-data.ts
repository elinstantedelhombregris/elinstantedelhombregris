import { PLAN_REGISTRY } from '~/lib/plans-registry';

/**
 * El ejemplo (spec 2.4) — todo conteo visible sale del registry MDX.
 * Jamás un «22» literal en JSX: si el contenido cambia, la página cambia.
 */
export const PLANES = PLAN_REGISTRY.filter((p) => !p.isMeta);
export const PLAN_META = PLAN_REGISTRY.find((p) => p.isMeta);
export const PLAN_COUNT = PLANES.length;

/** Numeración de expediente: «01»…«{N}» (el registry ya viene por orderIndex). */
export function numeroDeExpediente(indice: number): string {
  return String(indice + 1).padStart(2, '0');
}

/** Número de expediente de un slug («00» para el meta, null si no existe). */
export function expedienteDe(slug: string): string | null {
  if (PLAN_META?.slug === slug) return '00';
  const i = PLANES.findIndex((p) => p.slug === slug);
  return i === -1 ? null : numeroDeExpediente(i);
}
