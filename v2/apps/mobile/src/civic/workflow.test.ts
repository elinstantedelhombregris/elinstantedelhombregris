import { describe, expect, it } from 'vitest';

import { canTransitionAction, canTransitionMatch, mergeActionOutcome } from './workflow';

describe('máquinas de estado de la trama', () => {
  it('exige el recorrido completo antes de confirmar un puente', () => {
    expect(canTransitionMatch('proposed', 'confirmed')).toBe(false);
    expect(canTransitionMatch('accepted', 'in_progress')).toBe(true);
    expect(canTransitionMatch('in_progress', 'fulfilled')).toBe(true);
    expect(canTransitionMatch('fulfilled', 'confirmed')).toBe(true);
    expect(canTransitionMatch('confirmed', 'cancelled')).toBe(false);
  });

  it('no permite reanimar acciones terminales', () => {
    expect(canTransitionAction('planned', 'completed')).toBe(false);
    expect(canTransitionAction('in_progress', 'completed')).toBe(true);
    expect(canTransitionAction('completed', 'confirmed')).toBe(true);
    expect(canTransitionAction('cancelled', 'in_progress')).toBe(false);
  });

  it('conserva la procedencia acumulada del resultado', () => {
    expect(mergeActionOutcome('{"declaredBy":"provider"}', { confirmedBy: 'recipient' })).toEqual({
      declaredBy: 'provider',
      confirmedBy: 'recipient',
    });
    expect(mergeActionOutcome('invalid', { withdrawn: true })).toEqual({ withdrawn: true });
  });
});
