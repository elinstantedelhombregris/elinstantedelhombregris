import { describe, expect, it } from 'vitest';

import {
  buildLocalCivicAnalytics,
  type AnalyticsMission,
  type AnalyticsNeed,
  type AnalyticsObservation,
  type AnalyticsResource,
  type LocalCivicAnalyticsInput,
} from './analytics';

const observation = (
  id: string,
  overrides: Partial<AnalyticsObservation> = {},
): AnalyticsObservation => ({
  id,
  campaignKey: 'luminarias-v1',
  category: 'luminaria-apagada',
  status: 'needs_review',
  observedAt: '2026-07-10T12:00:00.000Z',
  expiresAt: '2026-08-10T12:00:00.000Z',
  ...overrides,
});

const need = (id: string, overrides: Partial<AnalyticsNeed> = {}): AnalyticsNeed => ({
  id,
  category: 'alimentos',
  status: 'submitted',
  ...overrides,
});

const resource = (
  id: string,
  overrides: Partial<AnalyticsResource> = {},
): AnalyticsResource => ({
  id,
  category: 'alimentos',
  status: 'available',
  ...overrides,
});

const mission = (
  id: string,
  overrides: Partial<AnalyticsMission> = {},
): AnalyticsMission => ({
  id,
  status: 'active',
  plannedCells: 4,
  cells: [
    { status: 'corroborated', observationId: 'inside' },
    { status: 'observed', observationId: 'other' },
    { status: 'assigned', observationId: null },
    { status: 'unknown', observationId: null },
  ],
  ...overrides,
});

const input = (overrides: Partial<LocalCivicAnalyticsInput> = {}): LocalCivicAnalyticsInput => ({
  observations: [],
  needs: [],
  resources: [],
  matches: [],
  actions: [],
  missions: [],
  now: '2026-07-14T12:00:00.000Z',
  ...overrides,
});

describe('local civic analytics', () => {
  it('returns an honest empty reading without invented percentages', () => {
    const report = buildLocalCivicAnalytics(input());

    expect(report.quality.corroborationPct).toBeNull();
    expect(report.quality.vigencyPct).toBeNull();
    expect(report.response.resolutionPct).toBeNull();
    expect(report.coverage.coveragePct).toBeNull();
    expect(report.priorities).toEqual([]);
    expect(report.principles).toMatchObject({
      determinesTruth: false,
      measuresPopulationPrevalence: false,
      individualRanking: false,
    });
  });

  it('separates field quality and vigency from drafts, listening facets and withdrawals', () => {
    const report = buildLocalCivicAnalytics(input({
      observations: [
        observation('review'),
        observation('confirmed', { status: 'corroborated' }),
        observation('expired', { status: 'synced', expiresAt: '2026-07-01T12:00:00.000Z' }),
        observation('unsafe', { status: 'unsafe' }),
        observation('draft', { status: 'draft' }),
        observation('withdrawn', { status: 'withdrawn' }),
        observation('voice', { campaignKey: 'escucha-v1', status: 'needs_review' }),
      ],
      verificationQueueIds: ['review', 'voice'],
    }));

    expect(report.source).toEqual({
      includedSignals: 4,
      excludedDraftSignals: 1,
      withdrawnSignals: 1,
    });
    expect(report.quality).toMatchObject({
      fieldSignals: 4,
      corroborated: 1,
      needsReview: 1,
      stale: 1,
      unsafe: 1,
      corroborationPct: 25,
      vigencyPct: 75,
    });
  });

  it('uses open plus resolved needs as the explicit resolution denominator', () => {
    const report = buildLocalCivicAnalytics(input({
      needs: [
        need('open'),
        need('moving', { status: 'in_progress' }),
        need('resolved', { status: 'resolved' }),
        need('draft', { status: 'draft' }),
        need('withdrawn', { status: 'withdrawn' }),
      ],
      resources: [resource('available'), resource('reserved', { status: 'reserved' })],
      matches: [
        { id: 'proposed', needId: 'open', resourceId: 'available', status: 'proposed' },
        { id: 'active', needId: 'moving', resourceId: 'reserved', status: 'in_progress' },
        { id: 'done', needId: 'resolved', resourceId: 'reserved', status: 'confirmed' },
      ],
      actions: [
        { id: 'moving', matchId: 'active', status: 'completed' },
        { id: 'done', matchId: 'done', status: 'confirmed' },
      ],
    }));

    expect(report.response).toMatchObject({
      openNeeds: 2,
      resolvedNeeds: 1,
      consideredNeeds: 3,
      availableResources: 1,
      proposedMatches: 1,
      activeMatches: 1,
      confirmedMatches: 1,
      actionsInProgress: 1,
      confirmedActions: 1,
      resolutionPct: 33,
    });
  });

  it('treats planned mission cells as the only territorial coverage denominator', () => {
    const report = buildLocalCivicAnalytics(input({
      observations: [observation('inside'), observation('outside')],
      missions: [mission('m1')],
    }));

    expect(report.coverage).toEqual({
      measuredMissions: 1,
      plannedCells: 4,
      visitedCells: 2,
      assignedCells: 1,
      corroboratedCells: 1,
      contestedCells: 0,
      remainingCells: 2,
      coveragePct: 50,
      fieldSignalsInsidePlan: 1,
      fieldSignalsOutsidePlan: 1,
    });
    expect(report.interpretationLimits.join(' ')).toContain('no proporción de habitantes');
    expect(report.interpretationLimits.join(' ')).toContain('fuera de una misión medida');
  });

  it('orders protection, verification and denominator work before convenience', () => {
    const report = buildLocalCivicAnalytics(input({
      observations: [
        observation('unsafe', { status: 'unsafe' }),
        observation('review'),
      ],
      needs: [need('n1')],
      resources: [resource('r1')],
      missions: [mission('m1')],
      verificationQueueIds: ['review'],
    }));

    expect(report.priorities.map((priority) => priority.kind).slice(0, 4)).toEqual([
      'protect',
      'verify',
      'cover',
      'coordinate',
    ]);
    expect(report.priorities[0]?.route).toBeNull();
    expect(report.priorities.find((priority) => priority.kind === 'coordinate')).toMatchObject({
      route: '/conectar',
    });
  });

  it('describes category overlap as a lead requiring human confirmation', () => {
    const report = buildLocalCivicAnalytics(input({
      needs: [need('n1'), need('n2')],
      resources: [resource('r1')],
    }));

    expect(report.categories[0]).toMatchObject({
      category: 'alimentos',
      openNeeds: 2,
      availableResources: 1,
      potentialBridges: 1,
    });
    expect(report.interpretationLimits.join(' ')).toContain('confirmación humana');
    expect(report.priorities.find((priority) => priority.kind === 'coordinate')?.explanation)
      .toContain('consentimiento');
  });
});
