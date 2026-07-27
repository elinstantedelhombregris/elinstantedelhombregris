export type PublicIntelligencePeriod = '7d' | '30d' | '90d';
export type PublicIntelligencePriorityKind =
  | 'protect'
  | 'verify'
  | 'coordinate'
  | 'mobilize'
  | 'map_demand'
  | 'monitor';

export interface PublicIntelligenceCategory {
  category: string;
  openNeeds: number;
  resolvedNeeds: number;
  availableResources: number;
  observedSignals: number;
  corroboratedSignals: number;
  groups: number;
}

export interface PublicIntelligencePriority {
  id: string;
  rank: number;
  kind: PublicIntelligencePriorityKind;
  title: string;
  explanation: string;
  category: string;
  territory: {
    label: string | null;
    precision: '100m' | '500m' | 'neighborhood' | 'city';
  };
  evidence: {
    observed: number;
    corroborated: number;
    needsReview: number;
    unsafe: number;
    openNeeds: number;
    resolvedNeeds: number;
    availableResources: number;
    confidencePct: number;
  };
  nextActions: string[];
  caveats: string[];
}

export interface PublicIntelligenceMatchLead {
  id: string;
  category: string;
  territory: {
    label: string;
    precision: '100m' | '500m' | 'neighborhood' | 'city';
  };
  openNeeds: number;
  availableResources: number;
  potentialBridges: number;
  explanation: string;
  safeguards: string[];
  humanConfirmationRequired: true;
}

export interface PublicIntelligenceSnapshot {
  meta: {
    contract: 'basta-civic-intelligence/v1';
    period: PublicIntelligencePeriod;
    since: string;
    generatedAt: string;
    sourceContract: 'basta-civic-aggregate/v1';
    minimumDistinctSourceContributors: number;
    smallGroupsSuppressed: number;
    truncated: boolean;
    authority: {
      decisionSupportOnly: true;
      humanDeliberationRequired: true;
      bindingMandatesCreated: false;
    };
  };
  report: {
    contract: 'basta-civic-intelligence/v1';
    principles: {
      purpose: 'decision-support';
      determinesTruth: false;
      createsBindingMandates: false;
      individualRanking: false;
      humanDeliberationRequired: true;
    };
    overview: {
      publishedGroups: number;
      observedSignals: number;
      corroboratedSignals: number;
      signalsNeedingReview: number;
      unsafeSignals: number;
      openNeeds: number;
      resolvedNeeds: number;
      availableResources: number;
      verificationRatePct: number | null;
      resolutionRatePct: number | null;
    };
    evaluation: {
      groupsWithMeasuredCoverage: number;
      groupsWithoutMeasuredCoverage: number;
      qualityStatement: string;
      interpretationLimits: string[];
    };
    categories: PublicIntelligenceCategory[];
    matchLeads: PublicIntelligenceMatchLead[];
    priorities: PublicIntelligencePriority[];
  };
}

export type PublicIntelligenceState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; snapshot: PublicIntelligenceSnapshot }
  | { status: 'not_configured'; message: string }
  | { status: 'offline'; message: string }
  | { status: 'invalid'; message: string }
  | { status: 'unavailable'; message: string };

export class InvalidPublicIntelligenceError extends Error {
  constructor(message = 'La respuesta pública no cumple el contrato esperado.') {
    super(message);
    this.name = 'InvalidPublicIntelligenceError';
  }
}

type UnknownRecord = Record<string, unknown>;
export type PublicIntelligenceFetcher = (path: string, init?: RequestInit) => Promise<Response>;

const PRIORITY_KINDS = new Set<PublicIntelligencePriorityKind>([
  'protect',
  'verify',
  'coordinate',
  'mobilize',
  'map_demand',
  'monitor',
]);
const PERIODS = new Set<PublicIntelligencePeriod>(['7d', '30d', '90d']);
const PRECISIONS = new Set<PublicIntelligencePriority['territory']['precision']>([
  '100m',
  '500m',
  'neighborhood',
  'city',
]);

const record = (value: unknown, field: string): UnknownRecord => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new InvalidPublicIntelligenceError(`Campo inválido: ${field}.`);
  }
  return value as UnknownRecord;
};

const string = (value: unknown, field: string): string => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new InvalidPublicIntelligenceError(`Campo inválido: ${field}.`);
  }
  return value;
};

const nullableString = (value: unknown, field: string): string | null => {
  if (value === null) return null;
  return string(value, field);
};

const count = (value: unknown, field: string): number => {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0) {
    throw new InvalidPublicIntelligenceError(`Conteo inválido: ${field}.`);
  }
  return value;
};

const positiveCount = (value: unknown, field: string): number => {
  const parsed = count(value, field);
  if (parsed < 1) throw new InvalidPublicIntelligenceError(`Conteo inválido: ${field}.`);
  return parsed;
};

const boolean = (value: unknown, field: string): boolean => {
  if (typeof value !== 'boolean') throw new InvalidPublicIntelligenceError(`Booleano inválido: ${field}.`);
  return value;
};

const percent = (value: unknown, field: string): number | null => {
  if (value === null) return null;
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 100) {
    throw new InvalidPublicIntelligenceError(`Porcentaje inválido: ${field}.`);
  }
  return value;
};

const exactBoolean = <T extends boolean>(value: unknown, expected: T, field: string): T => {
  if (value !== expected) throw new InvalidPublicIntelligenceError(`Principio inválido: ${field}.`);
  return expected;
};

const dateTime = (value: unknown, field: string): string => {
  const parsed = string(value, field);
  if (!parsed.includes('T') || !Number.isFinite(new Date(parsed).getTime())) {
    throw new InvalidPublicIntelligenceError(`Fecha inválida: ${field}.`);
  }
  return parsed;
};

const strings = (value: unknown, field: string): string[] => {
  if (!Array.isArray(value)) throw new InvalidPublicIntelligenceError(`Lista inválida: ${field}.`);
  return value.map((item, index) => string(item, `${field}[${index}]`));
};

const array = (value: unknown, field: string): unknown[] => {
  if (!Array.isArray(value)) throw new InvalidPublicIntelligenceError(`Lista inválida: ${field}.`);
  return value;
};

const parseCategory = (value: unknown, index: number): PublicIntelligenceCategory => {
  const row = record(value, `report.categories[${index}]`);
  const prefix = `report.categories[${index}]`;
  const parsed: PublicIntelligenceCategory = {
    category: string(row.category, `${prefix}.category`),
    openNeeds: count(row.openNeeds, `${prefix}.openNeeds`),
    resolvedNeeds: count(row.resolvedNeeds, `${prefix}.resolvedNeeds`),
    availableResources: count(row.availableResources, `${prefix}.availableResources`),
    observedSignals: count(row.observedSignals, `${prefix}.observedSignals`),
    corroboratedSignals: count(row.corroboratedSignals, `${prefix}.corroboratedSignals`),
    groups: count(row.groups, `${prefix}.groups`),
  };
  if (parsed.corroboratedSignals > parsed.observedSignals) {
    throw new InvalidPublicIntelligenceError(`Balance incoherente: ${prefix}.corroboratedSignals.`);
  }
  return parsed;
};

const parsePriority = (value: unknown, index: number): PublicIntelligencePriority => {
  const row = record(value, `report.priorities[${index}]`);
  const prefix = `report.priorities[${index}]`;
  const kind = string(row.kind, `${prefix}.kind`);
  if (!PRIORITY_KINDS.has(kind as PublicIntelligencePriorityKind)) {
    throw new InvalidPublicIntelligenceError(`Prioridad inválida: ${prefix}.kind.`);
  }
  const territory = record(row.territory, `${prefix}.territory`);
  const precisionValue = string(territory.precision, `${prefix}.territory.precision`);
  if (!PRECISIONS.has(precisionValue as PublicIntelligencePriority['territory']['precision'])) {
    throw new InvalidPublicIntelligenceError(`Precisión pública inválida: ${prefix}.territory.precision.`);
  }
  const evidence = record(row.evidence, `${prefix}.evidence`);
  count(row.score, `${prefix}.score`);
  string(row.groupId, `${prefix}.groupId`);
  const parsed: PublicIntelligencePriority = {
    id: string(row.id, `${prefix}.id`),
    rank: positiveCount(row.rank, `${prefix}.rank`),
    kind: kind as PublicIntelligencePriorityKind,
    title: string(row.title, `${prefix}.title`),
    explanation: string(row.explanation, `${prefix}.explanation`),
    category: string(row.category, `${prefix}.category`),
    territory: {
      label: nullableString(territory.label, `${prefix}.territory.label`),
      precision: precisionValue as PublicIntelligencePriority['territory']['precision'],
    },
    evidence: {
      observed: count(evidence.observed, `${prefix}.evidence.observed`),
      corroborated: count(evidence.corroborated, `${prefix}.evidence.corroborated`),
      needsReview: count(evidence.needsReview, `${prefix}.evidence.needsReview`),
      unsafe: count(evidence.unsafe, `${prefix}.evidence.unsafe`),
      openNeeds: count(evidence.openNeeds, `${prefix}.evidence.openNeeds`),
      resolvedNeeds: count(evidence.resolvedNeeds, `${prefix}.evidence.resolvedNeeds`),
      availableResources: count(evidence.availableResources, `${prefix}.evidence.availableResources`),
      confidencePct: percent(evidence.confidencePct, `${prefix}.evidence.confidencePct`) ?? 0,
    },
    nextActions: strings(row.nextActions, `${prefix}.nextActions`),
    caveats: strings(row.caveats, `${prefix}.caveats`),
  };
  if (parsed.evidence.corroborated > parsed.evidence.observed) {
    throw new InvalidPublicIntelligenceError(`Evidencia incoherente: ${prefix}.evidence.corroborated.`);
  }
  return parsed;
};

const parseMatchLead = (value: unknown, index: number): PublicIntelligenceMatchLead => {
  const row = record(value, `report.matchLeads[${index}]`);
  const prefix = `report.matchLeads[${index}]`;
  const territory = record(row.territory, `${prefix}.territory`);
  const precisionValue = string(territory.precision, `${prefix}.territory.precision`);
  if (!PRECISIONS.has(precisionValue as PublicIntelligenceMatchLead['territory']['precision'])) {
    throw new InvalidPublicIntelligenceError(`Precisión pública inválida: ${prefix}.territory.precision.`);
  }
  const needGroupIds = strings(row.needGroupIds, `${prefix}.needGroupIds`);
  const resourceGroupIds = strings(row.resourceGroupIds, `${prefix}.resourceGroupIds`);
  const openNeeds = count(row.openNeeds, `${prefix}.openNeeds`);
  const availableResources = count(row.availableResources, `${prefix}.availableResources`);
  const potentialBridges = count(row.potentialBridges, `${prefix}.potentialBridges`);
  if (
    needGroupIds.length === 0
    || resourceGroupIds.length === 0
    || potentialBridges < 1
    || potentialBridges > Math.min(openNeeds, availableResources)
  ) {
    throw new InvalidPublicIntelligenceError(`Oportunidad incoherente: ${prefix}.potentialBridges.`);
  }
  return {
    id: string(row.id, `${prefix}.id`),
    category: string(row.category, `${prefix}.category`),
    territory: {
      label: string(territory.label, `${prefix}.territory.label`),
      precision: precisionValue as PublicIntelligenceMatchLead['territory']['precision'],
    },
    openNeeds,
    availableResources,
    potentialBridges,
    explanation: string(row.explanation, `${prefix}.explanation`),
    safeguards: strings(row.safeguards, `${prefix}.safeguards`),
    humanConfirmationRequired: exactBoolean(
      row.humanConfirmationRequired,
      true,
      `${prefix}.humanConfirmationRequired`,
    ),
  };
};

/**
 * Copia únicamente campos validados. Un contrato incorrecto nunca llega a la UI
 * como un cast optimista ni se mezcla con la lectura local.
 */
export const parsePublicCivicIntelligence = (value: unknown): PublicIntelligenceSnapshot => {
  const root = record(value, 'root');
  const meta = record(root.meta, 'meta');
  const report = record(root.report, 'report');
  if (meta.contract !== 'basta-civic-intelligence/v1' || report.contract !== meta.contract) {
    throw new InvalidPublicIntelligenceError('Contrato de inteligencia pública desconocido.');
  }
  if (meta.sourceContract !== 'basta-civic-aggregate/v1') {
    throw new InvalidPublicIntelligenceError('Fuente pública desconocida.');
  }
  const periodValue = string(meta.period, 'meta.period');
  if (!PERIODS.has(periodValue as PublicIntelligencePeriod)) {
    throw new InvalidPublicIntelligenceError('Período público desconocido.');
  }
  const authority = record(meta.authority, 'meta.authority');
  const principles = record(report.principles, 'report.principles');
  if (principles.purpose !== 'decision-support') {
    throw new InvalidPublicIntelligenceError('Propósito público desconocido.');
  }
  const overview = record(report.overview, 'report.overview');
  const evaluation = record(report.evaluation, 'report.evaluation');
  const rawCategories = array(report.categories, 'report.categories');
  const rawMatchLeads = array(report.matchLeads, 'report.matchLeads');
  const rawPriorities = array(report.priorities, 'report.priorities');
  // Aunque todavía no se dibujen borradores, su forma contenedora pertenece al
  // contrato. Nunca aceptamos una respuesta que los reemplace por otra cosa.
  array(report.mandateDrafts, 'report.mandateDrafts');

  const snapshot: PublicIntelligenceSnapshot = {
    meta: {
      contract: 'basta-civic-intelligence/v1',
      period: periodValue as PublicIntelligencePeriod,
      since: dateTime(meta.since, 'meta.since'),
      generatedAt: dateTime(meta.generatedAt, 'meta.generatedAt'),
      sourceContract: 'basta-civic-aggregate/v1',
      minimumDistinctSourceContributors: positiveCount(
        meta.minimumDistinctSourceContributors,
        'meta.minimumDistinctSourceContributors',
      ),
      smallGroupsSuppressed: count(meta.smallGroupsSuppressed, 'meta.smallGroupsSuppressed'),
      truncated: boolean(meta.truncated, 'meta.truncated'),
      authority: {
        decisionSupportOnly: exactBoolean(authority.decisionSupportOnly, true, 'meta.authority.decisionSupportOnly'),
        humanDeliberationRequired: exactBoolean(authority.humanDeliberationRequired, true, 'meta.authority.humanDeliberationRequired'),
        bindingMandatesCreated: exactBoolean(authority.bindingMandatesCreated, false, 'meta.authority.bindingMandatesCreated'),
      },
    },
    report: {
      contract: 'basta-civic-intelligence/v1',
      principles: {
        purpose: 'decision-support',
        determinesTruth: exactBoolean(principles.determinesTruth, false, 'report.principles.determinesTruth'),
        createsBindingMandates: exactBoolean(principles.createsBindingMandates, false, 'report.principles.createsBindingMandates'),
        individualRanking: exactBoolean(principles.individualRanking, false, 'report.principles.individualRanking'),
        humanDeliberationRequired: exactBoolean(principles.humanDeliberationRequired, true, 'report.principles.humanDeliberationRequired'),
      },
      overview: {
        publishedGroups: count(overview.publishedGroups, 'report.overview.publishedGroups'),
        observedSignals: count(overview.observedSignals, 'report.overview.observedSignals'),
        corroboratedSignals: count(overview.corroboratedSignals, 'report.overview.corroboratedSignals'),
        signalsNeedingReview: count(overview.signalsNeedingReview, 'report.overview.signalsNeedingReview'),
        unsafeSignals: count(overview.unsafeSignals, 'report.overview.unsafeSignals'),
        openNeeds: count(overview.openNeeds, 'report.overview.openNeeds'),
        resolvedNeeds: count(overview.resolvedNeeds, 'report.overview.resolvedNeeds'),
        availableResources: count(overview.availableResources, 'report.overview.availableResources'),
        verificationRatePct: percent(overview.verificationRatePct, 'report.overview.verificationRatePct'),
        resolutionRatePct: percent(overview.resolutionRatePct, 'report.overview.resolutionRatePct'),
      },
      evaluation: {
        groupsWithMeasuredCoverage: count(
          evaluation.groupsWithMeasuredCoverage,
          'report.evaluation.groupsWithMeasuredCoverage',
        ),
        groupsWithoutMeasuredCoverage: count(
          evaluation.groupsWithoutMeasuredCoverage,
          'report.evaluation.groupsWithoutMeasuredCoverage',
        ),
        qualityStatement: string(evaluation.qualityStatement, 'report.evaluation.qualityStatement'),
        interpretationLimits: strings(
          evaluation.interpretationLimits,
          'report.evaluation.interpretationLimits',
        ),
      },
      categories: rawCategories.map(parseCategory),
      matchLeads: rawMatchLeads.map(parseMatchLead),
      priorities: rawPriorities.map(parsePriority),
    },
  };
  const overviewSnapshot = snapshot.report.overview;
  const evaluationSnapshot = snapshot.report.evaluation;
  if (overviewSnapshot.corroboratedSignals > overviewSnapshot.observedSignals) {
    throw new InvalidPublicIntelligenceError('La corroboración pública supera las señales observadas.');
  }
  if (
    evaluationSnapshot.groupsWithMeasuredCoverage
      + evaluationSnapshot.groupsWithoutMeasuredCoverage
    !== overviewSnapshot.publishedGroups
  ) {
    throw new InvalidPublicIntelligenceError('El denominador de grupos no coincide con los grupos publicados.');
  }
  if (
    (overviewSnapshot.observedSignals === 0) !== (overviewSnapshot.verificationRatePct === null)
    || (overviewSnapshot.openNeeds + overviewSnapshot.resolvedNeeds === 0)
      !== (overviewSnapshot.resolutionRatePct === null)
  ) {
    throw new InvalidPublicIntelligenceError('Una tasa pública no declara correctamente su denominador.');
  }
  return snapshot;
};

const errorCode = (error: unknown): string | null => {
  if (!error || typeof error !== 'object' || !('code' in error)) return null;
  return typeof (error as { code?: unknown }).code === 'string'
    ? (error as { code: string }).code
    : null;
};

export const publicIntelligenceFailureState = (error: unknown): PublicIntelligenceState => {
  if (error instanceof InvalidPublicIntelligenceError || error instanceof SyntaxError) {
    return {
      status: 'invalid',
      message: 'La red respondió, pero no pudimos verificar su contrato. La lectura local sigue intacta.',
    };
  }
  const code = errorCode(error);
  if (code === 'API_NOT_CONFIGURED') {
    return {
      status: 'not_configured',
      message: 'Esta instalación no tiene una red pública configurada. Todo el análisis local sigue disponible offline.',
    };
  }
  if (error instanceof TypeError) {
    return {
      status: 'offline',
      message: 'No pudimos alcanzar la red pública. No se perdió nada: la lectura local funciona sin conexión.',
    };
  }
  if (code === 'HTTP_429') {
    return {
      status: 'unavailable',
      message: 'La red pidió esperar antes de volver a consultar la lectura pública.',
    };
  }
  return {
    status: 'unavailable',
    message: 'La lectura pública no está disponible ahora. La información local no fue modificada.',
  };
};

export const loadPublicCivicIntelligence = async (
  period: PublicIntelligencePeriod,
  fetcher: PublicIntelligenceFetcher,
): Promise<PublicIntelligenceState> => {
  try {
    const response = await fetcher(`/api/v1/civic/intelligence?period=${period}`);
    if (!response.ok) {
      const body = await response.json().catch(() => null) as {
        code?: unknown;
        message?: unknown;
      } | null;
      throw Object.assign(
        new Error(typeof body?.message === 'string' ? body.message : 'La red no pudo completar la consulta.'),
        {
          code: typeof body?.code === 'string' ? body.code : `HTTP_${response.status}`,
          status: response.status,
        },
      );
    }
    let body: unknown;
    try {
      body = await response.json() as unknown;
    } catch (error) {
      return publicIntelligenceFailureState(error instanceof SyntaxError
        ? error
        : new InvalidPublicIntelligenceError());
    }
    try {
      const snapshot = parsePublicCivicIntelligence(body);
      if (snapshot.meta.period !== period) {
        throw new InvalidPublicIntelligenceError('El período recibido no coincide con el solicitado.');
      }
      return { status: 'ready', snapshot };
    } catch (error) {
      return publicIntelligenceFailureState(error);
    }
  } catch (error) {
    return publicIntelligenceFailureState(error);
  }
};
