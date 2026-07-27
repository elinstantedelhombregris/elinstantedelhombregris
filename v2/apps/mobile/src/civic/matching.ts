import type { MatchScore, MatchScoreInput } from './types';

const clamp = (n: number, min = 0, max = 100): number => Math.min(max, Math.max(min, n));

/**
 * Motor explicable: cada punto tiene una razón visible. No usa perfiles ni
 * inferencias ocultas y jamás propone si categoría, capacidad o radio fallan.
 */
export const scoreMatch = (input: MatchScoreInput): MatchScore => {
  const reasons: string[] = [];
  const distanceMinKm = input.distanceMinKm ?? input.distanceKm;
  const distanceMaxKm = input.distanceMaxKm ?? input.distanceKm;
  if (input.needCategory !== input.resourceCategory) {
    return { eligible: false, score: 0, reasons: ['La categoría no coincide'] };
  }
  if (input.resourceQuantity != null && input.resourceQuantity <= 0) {
    return { eligible: false, score: 0, reasons: ['El recurso no tiene capacidad disponible'] };
  }
  if (
    distanceMinKm != null &&
    input.radiusKm != null &&
    distanceMinKm > input.radiusKm
  ) {
    return { eligible: false, score: 0, reasons: ['Queda fuera del radio disponible'] };
  }

  let score = 45;
  reasons.push('La categoría coincide');

  if (input.needQuantity != null && input.resourceQuantity != null) {
    const coverage = input.resourceQuantity / Math.max(1, input.needQuantity);
    const quantityScore = clamp(coverage * 25, 0, 25);
    score += quantityScore;
    reasons.push(coverage >= 1 ? 'Puede cubrir la cantidad completa' : 'Puede cubrir una parte');
  } else {
    score += 10;
    reasons.push('La cantidad se acuerda entre las partes');
  }

  if (input.distanceKm != null && input.radiusKm != null) {
    const uncertainBoundary = distanceMaxKm != null && distanceMaxKm > input.radiusKm;
    const proximityDistance = uncertainBoundary ? distanceMaxKm : input.distanceKm;
    const proximity = 1 - proximityDistance / Math.max(0.1, input.radiusKm);
    score += clamp(proximity * 15, 0, 15);
    if (uncertainBoundary) {
      reasons.push('Las zonas se solapan; la distancia se confirma entre las partes');
    } else {
      reasons.push(input.distanceKm < 2 ? 'Está muy cerca' : 'Está dentro del radio');
    }
  }

  score += clamp(input.needUrgency, 1, 5) * 2;
  score += clamp(input.resourceConfidence, 0, 1) * 5;
  return { eligible: true, score: Math.round(clamp(score)), reasons };
};
