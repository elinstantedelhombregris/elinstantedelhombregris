import { describe, expect, it } from 'vitest';

import { assessObservation } from './quality';

describe('observation quality', () => {
  it('requires independent corroboration before becoming trusted', () => {
    expect(assessObservation({ evidenceCount: 1, hasLocation: true, verdicts: [] })).toMatchObject({
      status: 'needs_review',
      confidence: 0.45,
    });
    expect(assessObservation({ evidenceCount: 1, hasLocation: true, verdicts: ['confirm', 'confirm'] }))
      .toMatchObject({ status: 'corroborated', confidence: 0.9 });
  });

  it('lets safety and freshness override popularity', () => {
    expect(assessObservation({ evidenceCount: 3, hasLocation: true, verdicts: ['confirm', 'confirm', 'unsafe'] }))
      .toMatchObject({ status: 'unsafe', confidence: 0 });
    expect(assessObservation({ evidenceCount: 3, hasLocation: true, verdicts: ['stale'] }))
      .toMatchObject({ status: 'stale', confidence: 0.15 });
  });
});
