import type { CivicRecordStatus, VerificationVerdict } from './types';

export interface QualityInput {
  evidenceCount: number;
  hasLocation: boolean;
  verdicts: VerificationVerdict[];
}

export interface QualityResult {
  confidence: number;
  status: CivicRecordStatus;
  confirmations: number;
  corrections: number;
}

export const assessObservation = (input: QualityInput): QualityResult => {
  const confirmations = input.verdicts.filter((v) => v === 'confirm').length;
  const corrections = input.verdicts.filter((v) => v === 'correct').length;
  if (input.verdicts.includes('unsafe')) {
    return { confidence: 0, status: 'unsafe', confirmations, corrections };
  }
  if (input.verdicts.includes('stale')) {
    return { confidence: 0.15, status: 'stale', confirmations, corrections };
  }

  let confidence = 0.2;
  if (input.hasLocation) confidence += 0.15;
  confidence += Math.min(0.2, input.evidenceCount * 0.1);
  confidence += Math.min(0.45, confirmations * 0.225);
  confidence -= Math.min(0.25, corrections * 0.125);
  confidence = Math.min(1, Math.max(0, Number(confidence.toFixed(2))));

  return {
    confidence,
    status: confirmations >= 2 && corrections === 0 ? 'corroborated' : 'needs_review',
    confirmations,
    corrections,
  };
};

