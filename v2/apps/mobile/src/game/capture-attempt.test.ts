import { describe, expect, it } from 'vitest';

import { civicCaptureKeys } from './capture-attempt';

describe('claves idempotentes de captura cívica', () => {
  it('repite exactamente las mismas claves para el mismo intento', () => {
    const first = civicCaptureKeys('attempt-1', 'expedition-a');
    const retry = civicCaptureKeys('attempt-1', 'expedition-a');

    expect(retry.starId).toBe(first.starId);
    expect(retry.entryId).toBe(first.entryId);
    expect(retry.baseRewardId).toBe(first.baseRewardId);
    expect(retry.publishConsentIdempotencyKey).toBe(first.publishConsentIdempotencyKey);
    expect(retry.locationConsentIdempotencyKey).toBe(first.locationConsentIdempotencyKey);
    expect(retry.milestoneRewardId(50)).toBe(first.milestoneRewardId(50));
  });

  it('separa intentos y mantiene los hitos ligados a su expedición', () => {
    const first = civicCaptureKeys('attempt-1', 'expedition-a');
    const second = civicCaptureKeys('attempt-2', 'expedition-a');
    const otherExpedition = civicCaptureKeys('attempt-1', 'expedition-b');

    expect(second.entryId).not.toBe(first.entryId);
    expect(second.baseRewardId).not.toBe(first.baseRewardId);
    expect(second.publishConsentIdempotencyKey).not.toBe(first.publishConsentIdempotencyKey);
    expect(second.locationConsentIdempotencyKey).not.toBe(first.locationConsentIdempotencyKey);
    expect(otherExpedition.milestoneRewardId(25)).not.toBe(first.milestoneRewardId(25));
  });

  it('rechaza claves vacías antes de tocar SQLite', () => {
    expect(() => civicCaptureKeys(' ', 'expedition-a')).toThrow('capture_attempt_id_required');
    expect(() => civicCaptureKeys('attempt-1', '')).toThrow('expedition_id_required');
  });
});
