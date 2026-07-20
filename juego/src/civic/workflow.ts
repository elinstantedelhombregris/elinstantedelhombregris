import type { CivicActionStatus, MatchStatus } from './types';

const MATCH_TRANSITIONS: Record<MatchStatus, readonly MatchStatus[]> = {
  proposed: ['accepted', 'declined', 'cancelled'],
  accepted: ['in_progress', 'cancelled'],
  in_progress: ['fulfilled', 'cancelled'],
  fulfilled: ['confirmed', 'cancelled'],
  confirmed: [],
  declined: [],
  cancelled: [],
};

const ACTION_TRANSITIONS: Record<CivicActionStatus, readonly CivicActionStatus[]> = {
  planned: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'cancelled'],
  completed: ['confirmed', 'cancelled'],
  confirmed: [],
  cancelled: [],
};

export const canTransitionMatch = (current: MatchStatus, next: MatchStatus): boolean =>
  current === next || MATCH_TRANSITIONS[current].includes(next);

export const canTransitionAction = (
  current: CivicActionStatus,
  next: CivicActionStatus,
): boolean => current === next || ACTION_TRANSITIONS[current].includes(next);

export const mergeActionOutcome = (
  currentJson: string,
  addition: Record<string, unknown>,
): Record<string, unknown> => {
  try {
    const current: unknown = JSON.parse(currentJson);
    return current && typeof current === 'object' && !Array.isArray(current)
      ? { ...(current as Record<string, unknown>), ...addition }
      : { ...addition };
  } catch {
    return { ...addition };
  }
};
