import { describe, expect, it } from 'vitest';

import {
  InvalidPublicIntelligenceError,
  loadPublicCivicIntelligence,
  parsePublicCivicIntelligence,
  publicIntelligenceFailureState,
} from './public-intelligence';

const validBody = () => ({
  meta: {
    contract: 'basta-civic-intelligence/v1',
    period: '30d',
    since: '2026-06-14T12:00:00.000Z',
    generatedAt: '2026-07-14T12:00:00.000Z',
    sourceContract: 'basta-civic-aggregate/v1',
    minimumDistinctSourceContributors: 5,
    smallGroupsSuppressed: 3,
    truncated: false,
    authority: {
      decisionSupportOnly: true,
      humanDeliberationRequired: true,
      bindingMandatesCreated: false,
    },
  },
  report: {
    contract: 'basta-civic-intelligence/v1',
    principles: {
      purpose: 'decision-support',
      determinesTruth: false,
      createsBindingMandates: false,
      individualRanking: false,
      humanDeliberationRequired: true,
    },
    overview: {
      publishedGroups: 2,
      observedSignals: 12,
      corroboratedSignals: 7,
      signalsNeedingReview: 5,
      unsafeSignals: 0,
      openNeeds: 4,
      resolvedNeeds: 2,
      availableResources: 3,
      verificationRatePct: 58,
      resolutionRatePct: 33,
    },
    evaluation: {
      groupsWithMeasuredCoverage: 1,
      groupsWithoutMeasuredCoverage: 1,
      qualityStatement: 'La lectura combina grupos con y sin denominador medido.',
      interpretationLimits: [
        'Los conteos describen registros, no personas únicas ni votos.',
      ],
    },
    categories: [{
      category: 'alimentos-secos',
      openNeeds: 4,
      resolvedNeeds: 2,
      availableResources: 3,
      observedSignals: 12,
      corroboratedSignals: 7,
      groups: 2,
    }],
    matchLeads: [{
      id: 'lead_1',
      category: 'alimentos-secos',
      territory: { label: 'Barrio Sur', precision: 'neighborhood' },
      openNeeds: 4,
      availableResources: 3,
      potentialBridges: 3,
      needGroupIds: ['needs_1'],
      resourceGroupIds: ['resources_1'],
      explanation: 'Comparten categoría y territorio público protegido.',
      safeguards: ['Confirmar distancia, cantidad, vigencia y consentimiento.'],
      humanConfirmationRequired: true,
    }],
    priorities: [{
      id: 'priority_1',
      rank: 1,
      score: 86,
      kind: 'coordinate',
      title: 'Conectar capacidades con alimentos secos',
      explanation: 'Hay necesidades y recursos en un mismo grupo protegido.',
      groupId: 'group_1',
      category: 'alimentos-secos',
      territory: { label: 'Barrio Sur', precision: 'neighborhood' },
      evidence: {
        observed: 12,
        corroborated: 7,
        needsReview: 5,
        unsafe: 0,
        openNeeds: 4,
        resolvedNeeds: 2,
        availableResources: 3,
        confidencePct: 76,
      },
      nextActions: ['Confirmar cantidad, vigencia y distancia.'],
      caveats: ['La participación registrada no demuestra representatividad social.'],
    }],
    mandateDrafts: [],
  },
});

describe('public civic intelligence contract', () => {
  it('copies a valid protected report and keeps lead territory explicit', () => {
    const parsed = parsePublicCivicIntelligence(validBody());

    expect(parsed.meta).toMatchObject({
      period: '30d',
      minimumDistinctSourceContributors: 5,
      smallGroupsSuppressed: 3,
      truncated: false,
    });
    expect(parsed.report.matchLeads[0]).toMatchObject({
      category: 'alimentos-secos',
      territory: { label: 'Barrio Sur', precision: 'neighborhood' },
      humanConfirmationRequired: true,
    });
    expect(parsed.report.priorities[0]?.evidence.confidencePct).toBe(76);
  });

  it('fails closed on an unknown contract or source projection', () => {
    const body = validBody();
    body.meta.sourceContract = 'raw-events/v1';

    expect(() => parsePublicCivicIntelligence(body)).toThrow(InvalidPublicIntelligenceError);
  });

  it('rejects a match lead without an explicit protected territory', () => {
    const body = validBody();
    const lead = body.report.matchLeads[0] as unknown as Record<string, unknown>;
    delete lead.territory;

    expect(() => parsePublicCivicIntelligence(body)).toThrow(/territory/);
  });

  it('rejects an aggregate lead that promises more bridges than either side', () => {
    const body = validBody();
    body.report.matchLeads[0]!.potentialBridges = 9;

    expect(() => parsePublicCivicIntelligence(body)).toThrow(/potentialBridges/);
  });

  it('rejects impossible privacy metadata and percentages', () => {
    const invalidThreshold = validBody();
    invalidThreshold.meta.minimumDistinctSourceContributors = 0;
    expect(() => parsePublicCivicIntelligence(invalidThreshold)).toThrow(InvalidPublicIntelligenceError);

    const invalidRate = validBody();
    invalidRate.report.overview.verificationRatePct = 101;
    expect(() => parsePublicCivicIntelligence(invalidRate)).toThrow(InvalidPublicIntelligenceError);
  });
});

describe('public civic intelligence load state', () => {
  it('keeps an unconfigured installation in a local-safe state', async () => {
    const state = await loadPublicCivicIntelligence('30d', async () => {
      throw Object.assign(new Error('missing api'), { code: 'API_NOT_CONFIGURED' });
    });

    expect(state).toMatchObject({ status: 'not_configured' });
    expect(state.status === 'not_configured' && state.message).toContain('análisis local');
  });

  it('distinguishes offline transport from an invalid contract', async () => {
    const offline = await loadPublicCivicIntelligence('30d', async () => {
      throw new TypeError('network failed');
    });
    const invalid = await loadPublicCivicIntelligence('30d', async () => new Response(
      JSON.stringify({ meta: { contract: 'unknown' } }),
      { status: 200, headers: { 'content-type': 'application/json' } },
    ));

    expect(offline.status).toBe('offline');
    expect(invalid.status).toBe('invalid');
  });

  it('returns ready only after defensive parsing and requests the chosen period', async () => {
    let requestedPath = '';
    const state = await loadPublicCivicIntelligence('30d', async (path) => {
      requestedPath = path;
      return new Response(JSON.stringify(validBody()), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    });

    expect(requestedPath).toBe('/api/v1/civic/intelligence?period=30d');
    expect(state.status).toBe('ready');
    if (state.status === 'ready') expect(state.snapshot.report.overview.publishedGroups).toBe(2);
  });

  it('rejects a valid-looking report for a different period', async () => {
    const body = validBody();
    body.meta.period = '7d';
    const state = await loadPublicCivicIntelligence('30d', async () => new Response(
      JSON.stringify(body),
      { status: 200, headers: { 'content-type': 'application/json' } },
    ));

    expect(state.status).toBe('invalid');
  });

  it('maps malformed JSON and rate limits to non-destructive states', async () => {
    const malformed = await loadPublicCivicIntelligence('30d', async () => new Response('{', {
      status: 200,
      headers: { 'content-type': 'application/json' },
    }));
    const limited = publicIntelligenceFailureState(Object.assign(new Error('wait'), { code: 'HTTP_429' }));

    expect(malformed.status).toBe('invalid');
    expect(limited).toMatchObject({ status: 'unavailable' });
  });
});
