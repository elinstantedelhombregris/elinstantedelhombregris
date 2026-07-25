import { describe, expect, it } from 'vitest';

import {
  AUTOMATIC_AI_MANDATE_CRON_OPT_IN,
  CIVIC_INTELLIGENCE_PATH,
  LEGACY_AI_MANDATE_CLOSED_STATUS,
  LEGACY_AI_MANDATE_ENGINE_OPT_IN,
  LEGACY_RAW_PUBLIC_DATA_CLOSED_STATUS,
  LEGACY_RAW_PUBLIC_DATA_PRODUCTION_OPT_IN,
  PRIVACY_PRESERVING_AGGREGATES_PATH,
  evaluateProductionSafetyPolicy,
  legacyAiMandateClosedBody,
  legacyRawPublicDataClosedBody,
} from '../../server/production-safety-policy';

describe('production safety policy', () => {
  it.each(['development', 'test'] as const)(
    'keeps row previews available but legacy AI closed in %s',
    (nodeEnv) => {
      expect(evaluateProductionSafetyPolicy({ NODE_ENV: nodeEnv })).toEqual({
        production: false,
        legacyRawPublicDataAllowed: true,
        legacyAiMandateEngineAllowed: false,
        automaticAiMandateCronAllowed: false,
      });
    },
  );

  it('fails both dangerous production capabilities closed by default', () => {
    expect(evaluateProductionSafetyPolicy({ NODE_ENV: 'production' })).toEqual({
      production: true,
      legacyRawPublicDataAllowed: false,
      legacyAiMandateEngineAllowed: false,
      automaticAiMandateCronAllowed: false,
    });
  });

  it('treats Vercel production as production even without NODE_ENV', () => {
    expect(evaluateProductionSafetyPolicy({ VERCEL_ENV: 'production' }).production).toBe(true);
  });

  it('opens each dangerous capability only with its own exact, loud opt-in', () => {
    const rawOnly = evaluateProductionSafetyPolicy({
      NODE_ENV: 'production',
      [LEGACY_RAW_PUBLIC_DATA_PRODUCTION_OPT_IN]: 'true',
    });
    expect(rawOnly.legacyRawPublicDataAllowed).toBe(true);
    expect(rawOnly.legacyAiMandateEngineAllowed).toBe(false);
    expect(rawOnly.automaticAiMandateCronAllowed).toBe(false);

    const aiOnly = evaluateProductionSafetyPolicy({
      NODE_ENV: 'production',
      [LEGACY_AI_MANDATE_ENGINE_OPT_IN]: 'true',
    });
    expect(aiOnly.legacyRawPublicDataAllowed).toBe(false);
    expect(aiOnly.legacyAiMandateEngineAllowed).toBe(true);
    expect(aiOnly.automaticAiMandateCronAllowed).toBe(false);

    const aiAndCron = evaluateProductionSafetyPolicy({
      NODE_ENV: 'production',
      [LEGACY_AI_MANDATE_ENGINE_OPT_IN]: 'true',
      [AUTOMATIC_AI_MANDATE_CRON_OPT_IN]: 'true',
    });
    expect(aiAndCron.legacyAiMandateEngineAllowed).toBe(true);
    expect(aiAndCron.automaticAiMandateCronAllowed).toBe(true);
  });

  it.each(['TRUE', '1', 'yes', ' true ', 'false'])('rejects non-exact opt-in value %j', (value) => {
    const policy = evaluateProductionSafetyPolicy({
      NODE_ENV: 'production',
      [LEGACY_RAW_PUBLIC_DATA_PRODUCTION_OPT_IN]: value,
      [LEGACY_AI_MANDATE_ENGINE_OPT_IN]: value,
      [AUTOMATIC_AI_MANDATE_CRON_OPT_IN]: value,
    });
    expect(policy.legacyRawPublicDataAllowed).toBe(false);
    expect(policy.legacyAiMandateEngineAllowed).toBe(false);
    expect(policy.automaticAiMandateCronAllowed).toBe(false);
  });

  it('requires the engine opt-in before the cron opt-in can have any effect', () => {
    const policy = evaluateProductionSafetyPolicy({
      NODE_ENV: 'development',
      [AUTOMATIC_AI_MANDATE_CRON_OPT_IN]: 'true',
    });
    expect(policy.legacyAiMandateEngineAllowed).toBe(false);
    expect(policy.automaticAiMandateCronAllowed).toBe(false);
  });

  it('returns a clear non-retryable alternative to privacy-preserving aggregates', () => {
    expect(LEGACY_RAW_PUBLIC_DATA_CLOSED_STATUS).toBe(503);
    expect(legacyRawPublicDataClosedBody()).toEqual({
      code: 'LEGACY_RAW_PUBLIC_DATA_DISABLED',
      message: expect.stringContaining('agregados'),
      retryable: false,
      alternative: {
        rel: 'privacy-preserving-aggregates',
        href: PRIVACY_PRESERVING_AGGREGATES_PATH,
      },
    });
  });

  it('redirects disabled legacy AI generation to protected decision support', () => {
    expect(LEGACY_AI_MANDATE_CLOSED_STATUS).toBe(503);
    expect(legacyAiMandateClosedBody()).toEqual({
      code: 'LEGACY_AI_MANDATE_ENGINE_DISABLED',
      message: expect.stringContaining('revisión humana'),
      retryable: false,
      alternative: {
        rel: 'privacy-preserving-decision-support',
        href: CIVIC_INTELLIGENCE_PATH,
      },
    });
  });
});
