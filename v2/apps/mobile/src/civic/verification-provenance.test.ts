import { describe, expect, it } from 'vitest';

import {
  observationAgeLabel,
  publicPrecisionLabel,
  summarizeObservationEvidence,
  verificationProvenance,
  verdictsForMethod,
} from './verification-provenance';

describe('procedencia de corroboraciones', () => {
  it('resume evidencia sin romperse ante datos inválidos', () => {
    expect(summarizeObservationEvidence('not-json')).toEqual({
      count: 0,
      types: [],
      label: 'Sin evidencia adjunta',
    });
    expect(summarizeObservationEvidence(JSON.stringify([
      { kind: 'photo' },
      { kind: 'photo' },
      { kind: 'document' },
    ]))).toEqual({
      count: 3,
      types: ['foto de campo', 'documento'],
      label: '3 elementos · foto de campo, documento',
    });
  });

  it('explica antigüedad y precisión sin inventar certeza', () => {
    const now = new Date('2026-07-13T12:00:00.000Z');
    expect(observationAgeLabel('2026-07-13T11:00:00.000Z', now)).toBe('Observada hace 1 hora');
    expect(observationAgeLabel('2026-07-10T12:00:00.000Z', now)).toBe('Observada hace 3 días');
    expect(observationAgeLabel('fecha-inválida', now)).toBe('Fecha de observación no disponible');
    expect(publicPrecisionLabel('neighborhood')).toBe('Ubicación aproximada · escala barrial');
    expect(publicPrecisionLabel('100m')).toBe('Ubicación aproximada · radio de 100 m');
  });

  it('conserva un rastro estructurado en nota y evidencia', () => {
    expect(verificationProvenance({
      method: 'field_visit',
      verdict: 'correct',
      observedAt: '2026-07-12T10:00:00.000Z',
      verifiedAt: '2026-07-13T12:00:00.000Z',
    })).toEqual({
      note: 'provenance/v1;method=field_visit;verdict=correct',
      evidence: [{
        kind: 'verification_field_visit',
        present: true,
        method: 'field_visit',
        protocolVersion: 1,
        capturedAt: '2026-07-13T12:00:00.000Z',
        observationObservedAt: '2026-07-12T10:00:00.000Z',
      }],
    });
  });

  it('no permite presentar falta de conocimiento como otro veredicto', () => {
    expect(verdictsForMethod('cannot_verify').map((item) => item.key)).toEqual(['cannot_verify']);
    expect(verdictsForMethod('saw_now').map((item) => item.key)).toEqual([
      'confirm', 'correct', 'duplicate', 'stale', 'unsafe', 'cannot_verify',
    ]);
  });
});
