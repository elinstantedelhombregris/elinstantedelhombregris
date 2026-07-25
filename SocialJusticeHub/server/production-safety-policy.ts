import type { NextFunction, Request, Response } from 'express';

/**
 * Deliberately loud escape hatches. These are temporary compatibility gates,
 * not normal feature flags: production stays closed unless the value is the
 * exact string `true`.
 */
export const LEGACY_RAW_PUBLIC_DATA_PRODUCTION_OPT_IN =
  'DANGEROUSLY_ALLOW_LEGACY_RAW_PUBLIC_DATA_IN_PRODUCTION';
export const LEGACY_AI_MANDATE_ENGINE_OPT_IN =
  'DANGEROUSLY_ENABLE_LEGACY_AI_MANDATE_ENGINE';
export const AUTOMATIC_AI_MANDATE_CRON_OPT_IN =
  'DANGEROUSLY_ENABLE_AUTOMATIC_AI_MANDATE_CRON';

export const PRIVACY_PRESERVING_AGGREGATES_PATH = '/api/v1/civic/aggregates';
export const LEGACY_RAW_PUBLIC_DATA_CLOSED_STATUS = 503;

export type SafetyPolicyEnvironment = Readonly<Record<string, string | undefined>>;

export interface ProductionSafetyPolicy {
  production: boolean;
  legacyRawPublicDataAllowed: boolean;
  legacyAiMandateEngineAllowed: boolean;
  automaticAiMandateCronAllowed: boolean;
}

/** Treat an explicit production runtime as production, including Vercel production. */
export function isProductionRuntime(environment: SafetyPolicyEnvironment): boolean {
  return environment.NODE_ENV === 'production' || environment.VERCEL_ENV === 'production';
}

const explicitlyEnabled = (value: string | undefined): boolean => value === 'true';

/** Pure policy evaluation so launch behavior can be tested without mutating process.env. */
export function evaluateProductionSafetyPolicy(
  environment: SafetyPolicyEnvironment,
): ProductionSafetyPolicy {
  const production = isProductionRuntime(environment);
  const legacyAiMandateEngineAllowed = explicitlyEnabled(
    environment[LEGACY_AI_MANDATE_ENGINE_OPT_IN],
  );
  return {
    production,
    legacyRawPublicDataAllowed:
      !production || explicitlyEnabled(environment[LEGACY_RAW_PUBLIC_DATA_PRODUCTION_OPT_IN]),
    // The legacy engine reads row-level testimonies and can persist AI-authored
    // proposals. It is closed in every environment unless a human operator
    // explicitly enables it; localhost must not silently normalize unsafe
    // governance behavior.
    legacyAiMandateEngineAllowed,
    automaticAiMandateCronAllowed:
      legacyAiMandateEngineAllowed &&
      explicitlyEnabled(environment[AUTOMATIC_AI_MANDATE_CRON_OPT_IN]),
  };
}

export const LEGACY_AI_MANDATE_CLOSED_STATUS = 503;
export const CIVIC_INTELLIGENCE_PATH = '/api/v1/civic/intelligence';

export interface LegacyAiMandateClosedBody {
  code: 'LEGACY_AI_MANDATE_ENGINE_DISABLED';
  message: string;
  retryable: false;
  alternative: {
    rel: 'privacy-preserving-decision-support';
    href: typeof CIVIC_INTELLIGENCE_PATH;
  };
}

export function legacyAiMandateClosedBody(): LegacyAiMandateClosedBody {
  return {
    code: 'LEGACY_AI_MANDATE_ENGINE_DISABLED',
    message:
      'La síntesis legada con IA está deshabilitada: ningún modelo debe convertir testimonios crudos en mandatos vinculantes o propuestas publicables sin revisión humana.',
    retryable: false,
    alternative: {
      rel: 'privacy-preserving-decision-support',
      href: CIVIC_INTELLIGENCE_PATH,
    },
  };
}

/** Fail closed before any legacy AI generation can read row-level testimony. */
export function requireLegacyAiMandateEngineAccess(
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (evaluateProductionSafetyPolicy(process.env).legacyAiMandateEngineAllowed) {
    next();
    return;
  }
  res.setHeader('Cache-Control', 'no-store');
  res.status(LEGACY_AI_MANDATE_CLOSED_STATUS).json(legacyAiMandateClosedBody());
}

export interface LegacyRawPublicDataClosedBody {
  code: 'LEGACY_RAW_PUBLIC_DATA_DISABLED';
  message: string;
  retryable: false;
  alternative: {
    rel: 'privacy-preserving-aggregates';
    href: typeof PRIVACY_PRESERVING_AGGREGATES_PATH;
  };
}

export function legacyRawPublicDataClosedBody(): LegacyRawPublicDataClosedBody {
  return {
    code: 'LEGACY_RAW_PUBLIC_DATA_DISABLED',
    message:
      'El acceso público a datos legados fila por fila está deshabilitado por seguridad en producción. Usá los agregados con protección de privacidad.',
    retryable: false,
    alternative: {
      rel: 'privacy-preserving-aggregates',
      href: PRIVACY_PRESERVING_AGGREGATES_PATH,
    },
  };
}

/**
 * Production fail-closed middleware for legacy row-level public endpoints.
 * Development and test remain open so localhost previews keep working.
 */
export function requireLegacyRawPublicDataAccess(
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (evaluateProductionSafetyPolicy(process.env).legacyRawPublicDataAllowed) {
    next();
    return;
  }
  res.setHeader('Cache-Control', 'no-store');
  res.status(LEGACY_RAW_PUBLIC_DATA_CLOSED_STATUS).json(legacyRawPublicDataClosedBody());
}
