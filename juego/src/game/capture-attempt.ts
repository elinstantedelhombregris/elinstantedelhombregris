/**
 * Claves locales estables de una captura cívica. No son recibos nuevos ni
 * viajan al servidor: aprovechan las PK de estrella, entrada y ledger para que
 * repetir el mismo intento repare lo faltante en vez de volver a crearlo.
 */
export interface CivicCaptureKeys {
  starId: string;
  entryId: string;
  baseRewardId: string;
  publishConsentIdempotencyKey: string;
  locationConsentIdempotencyKey: string;
  milestoneRewardId: (milestone: number) => string;
}

const required = (value: string, label: string): string => {
  const clean = value.trim();
  if (!clean) throw new Error(`${label}_required`);
  return clean;
};

export const civicCaptureKeys = (
  captureAttemptId: string,
  expeditionId: string,
): CivicCaptureKeys => {
  const attempt = required(captureAttemptId, 'capture_attempt_id');
  const expedition = required(expeditionId, 'expedition_id');
  return {
    starId: attempt,
    entryId: `civic-entry:${attempt}`,
    baseRewardId: `civic-capture:${attempt}:base`,
    publishConsentIdempotencyKey: `civic-capture:${attempt}:consent:publish`,
    locationConsentIdempotencyKey: `civic-capture:${attempt}:consent:location`,
    milestoneRewardId: (milestone) => `civic-expedition:${expedition}:milestone:${milestone}`,
  };
};
