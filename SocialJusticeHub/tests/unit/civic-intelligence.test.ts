import { describe, expect, it } from 'vitest';

import type { PublicCivicAggregate } from '../../server/civic/aggregates';
import { buildCivicIntelligence } from '../../server/civic/intelligence';

const group = (
  id: string,
  overrides: Partial<PublicCivicAggregate> = {},
): PublicCivicAggregate => ({
  id,
  campaignKey: 'ollas-v1',
  campaignVersion: 1,
  category: 'alimentos-secos',
  territory: { label: 'Barrio Sur', precision: 'neighborhood' },
  coverage: { observed: 8, target: null, pct: null },
  quality: {
    corroborated: 5,
    needsReview: 3,
    unsafe: 0,
    confidencePct: 76,
    method: 'two-independent-confirmations',
  },
  needs: { open: 4, resolved: 2 },
  resources: { available: 0 },
  contributors: { band: '5–9', minimumApplied: 5 },
  updatedAt: '2026-07-14T12:00:00.000Z',
  ...overrides,
});

describe('civic decision intelligence', () => {
  it('summarizes quality and outcomes without claiming representativeness', () => {
    const report = buildCivicIntelligence([group('needs'), group('other', {
      category: 'agua',
      coverage: { observed: 2, target: 10, pct: 20 },
      quality: { corroborated: 1, needsReview: 1, unsafe: 0, confidencePct: 68, method: 'two-independent-confirmations' },
      needs: { open: 0, resolved: 2 },
    })]);

    expect(report.overview).toMatchObject({
      publishedGroups: 2,
      observedSignals: 10,
      corroboratedSignals: 6,
      openNeeds: 4,
      resolvedNeeds: 4,
      verificationRatePct: 60,
      resolutionRatePct: 50,
    });
    expect(report.evaluation.groupsWithoutMeasuredCoverage).toBe(1);
    expect(report.evaluation.interpretationLimits.join(' ')).toContain('no personas únicas ni votos');
  });

  it('creates aggregate match leads but keeps compatibility human-confirmed', () => {
    const needs = group('needs');
    const resources = group('resources', {
      campaignKey: 'red-recursos-v1',
      coverage: { observed: 0, target: null, pct: null },
      quality: { corroborated: 0, needsReview: 0, unsafe: 0, confidencePct: 0, method: 'two-independent-confirmations' },
      needs: { open: 0, resolved: 0 },
      resources: { available: 3 },
    });

    const [lead] = buildCivicIntelligence([needs, resources]).matchLeads;
    expect(lead).toMatchObject({
      category: 'alimentos-secos',
      territory: { label: 'Barrio Sur', precision: 'neighborhood' },
      openNeeds: 4,
      availableResources: 3,
      potentialBridges: 3,
      humanConfirmationRequired: true,
    });
    expect(lead?.safeguards.join(' ')).toContain('No identifica ni asigna');
  });

  it('does not imply a bridge across different or unpublished territories', () => {
    const needs = group('needs');
    const resourcesElsewhere = group('resources-elsewhere', {
      campaignKey: 'red-recursos-v1',
      territory: { label: 'Barrio Norte', precision: 'neighborhood' },
      coverage: { observed: 0, target: null, pct: null },
      quality: { corroborated: 0, needsReview: 0, unsafe: 0, confidencePct: 0, method: 'two-independent-confirmations' },
      needs: { open: 0, resolved: 0 },
      resources: { available: 3 },
    });
    const resourcesWithoutLabel = group('resources-hidden-place', {
      campaignKey: 'red-recursos-v1',
      territory: { label: null, precision: 'neighborhood' },
      coverage: { observed: 0, target: null, pct: null },
      quality: { corroborated: 0, needsReview: 0, unsafe: 0, confidencePct: 0, method: 'two-independent-confirmations' },
      needs: { open: 0, resolved: 0 },
      resources: { available: 2 },
    });

    expect(buildCivicIntelligence([needs, resourcesElsewhere, resourcesWithoutLabel]).matchLeads).toEqual([]);
  });

  it('prioritizes unsafe evidence before operational convenience', () => {
    const report = buildCivicIntelligence([
      group('ordinary'),
      group('unsafe', {
        category: 'riesgo',
        quality: { corroborated: 1, needsReview: 0, unsafe: 2, confidencePct: 20, method: 'two-independent-confirmations' },
        needs: { open: 1, resolved: 0 },
      }),
    ]);

    expect(report.priorities[0]).toMatchObject({ kind: 'protect', groupId: 'unsafe' });
    expect(report.mandateDrafts[0]).toMatchObject({ kind: 'safeguard', nonBinding: true });
  });

  it('does not call a mandate ready while coverage is unknown', () => {
    const [draft] = buildCivicIntelligence([group('needs')]).mandateDrafts;
    expect(draft).toMatchObject({
      status: 'draft_for_deliberation',
      readiness: 'requires_more_evidence',
      nonBinding: true,
    });
    expect(draft?.reviewRequirements.join(' ')).toContain('denominador');
  });

  it('can mark a well-supported measured group ready only for deliberation', () => {
    const [draft] = buildCivicIntelligence([group('measured', {
      coverage: { observed: 8, target: 10, pct: 80 },
    })]).mandateDrafts;
    expect(draft?.readiness).toBe('ready_for_deliberation');
    expect(draft?.status).toBe('draft_for_deliberation');
    expect(draft?.safeguards).toContain('No interpretar participación como voto ni representatividad.');
  });

  it('returns an honest empty report below the public privacy threshold', () => {
    const report = buildCivicIntelligence([]);
    expect(report.overview.publishedGroups).toBe(0);
    expect(report.overview.verificationRatePct).toBeNull();
    expect(report.priorities).toEqual([]);
    expect(report.mandateDrafts).toEqual([]);
    expect(report.evaluation.qualityStatement).toContain('umbral de privacidad');
  });
});
