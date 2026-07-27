import type {
  CivicActionStatus,
  CivicCampaignKey,
  CivicMissionStatus,
  CivicRecordStatus,
  CoverageCellStatus,
  MatchStatus,
  NeedStatus,
  ResourceStatus,
} from './types';
import { civicCategoryLabel } from './labels';

export interface AnalyticsObservation {
  id: string;
  campaignKey: CivicCampaignKey;
  category: string;
  status: CivicRecordStatus;
  observedAt: string;
  expiresAt: string | null;
}

export interface AnalyticsNeed {
  id: string;
  category: string;
  status: NeedStatus;
}

export interface AnalyticsResource {
  id: string;
  category: string;
  status: ResourceStatus;
}

export interface AnalyticsMatch {
  id: string;
  needId: string;
  resourceId: string;
  status: MatchStatus;
}

export interface AnalyticsAction {
  id: string;
  matchId: string;
  status: CivicActionStatus;
}

export interface AnalyticsMissionCell {
  status: CoverageCellStatus;
  observationId: string | null;
}

export interface AnalyticsMission {
  id: string;
  status: CivicMissionStatus;
  plannedCells: number;
  cells: readonly AnalyticsMissionCell[];
}

export interface LocalCivicAnalyticsInput {
  observations: readonly AnalyticsObservation[];
  needs: readonly AnalyticsNeed[];
  resources: readonly AnalyticsResource[];
  matches: readonly AnalyticsMatch[];
  actions: readonly AnalyticsAction[];
  missions: readonly AnalyticsMission[];
  /** Cola ya filtrada por las reglas operativas de corroboración. */
  verificationQueueIds?: readonly string[];
  now?: string;
}

export interface LocalCategoryBalance {
  category: string;
  signals: number;
  corroboratedSignals: number;
  openNeeds: number;
  resolvedNeeds: number;
  availableResources: number;
  potentialBridges: number;
}

export type LocalPriorityKind =
  | 'protect'
  | 'verify'
  | 'refresh'
  | 'cover'
  | 'coordinate'
  | 'mobilize'
  | 'follow_through';

export type LocalPriorityRoute =
  | '/verificar'
  | '/conectar'
  | '/territorio/misiones'
  | '/aportar'
  | '/mis-datos';

export interface LocalCivicPriority {
  rank: number;
  kind: LocalPriorityKind;
  title: string;
  explanation: string;
  evidence: string;
  actionLabel: string | null;
  route: LocalPriorityRoute | null;
}

export interface LocalCivicAnalyticsReport {
  contract: 'basta-local-civic-intelligence/v1';
  principles: {
    purpose: 'decision-support';
    determinesTruth: false;
    measuresPopulationPrevalence: false;
    individualRanking: false;
    humanDeliberationRequired: true;
  };
  source: {
    includedSignals: number;
    excludedDraftSignals: number;
    withdrawnSignals: number;
  };
  quality: {
    fieldSignals: number;
    currentSignals: number;
    corroborated: number;
    needsReview: number;
    stale: number;
    unsafe: number;
    corroborationPct: number | null;
    vigencyPct: number | null;
  };
  response: {
    openNeeds: number;
    resolvedNeeds: number;
    consideredNeeds: number;
    availableResources: number;
    proposedMatches: number;
    activeMatches: number;
    confirmedMatches: number;
    actionsInProgress: number;
    confirmedActions: number;
    resolutionPct: number | null;
  };
  coverage: {
    measuredMissions: number;
    plannedCells: number;
    visitedCells: number;
    assignedCells: number;
    corroboratedCells: number;
    contestedCells: number;
    remainingCells: number;
    coveragePct: number | null;
    fieldSignalsInsidePlan: number;
    fieldSignalsOutsidePlan: number;
  };
  categories: LocalCategoryBalance[];
  priorities: LocalCivicPriority[];
  interpretationLimits: string[];
}

const FIELD_SIGNAL_STATUSES = new Set<CivicRecordStatus>([
  'queued',
  'synced',
  'needs_review',
  'corroborated',
  'stale',
  'unsafe',
]);
const OPEN_NEED_STATUSES = new Set<NeedStatus>([
  'submitted',
  'needs_review',
  'corroborated',
  'matched',
  'in_progress',
  'reopened',
]);
const ACTIVE_MATCH_STATUSES = new Set<MatchStatus>(['accepted', 'in_progress', 'fulfilled']);
const ACTIVE_ACTION_STATUSES = new Set<CivicActionStatus>(['planned', 'in_progress', 'completed']);
const VISITED_CELL_STATUSES = new Set<CoverageCellStatus>([
  'observed',
  'contested',
  'corroborated',
  'stale',
]);

const pct = (numerator: number, denominator: number): number | null =>
  denominator > 0 ? Math.round((numerator / denominator) * 100) : null;

const validTime = (value: string | null | undefined): number | null => {
  if (!value) return null;
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : null;
};

interface PriorityCandidate extends Omit<LocalCivicPriority, 'rank'> {
  tier: number;
  weight: number;
}

const categoryBalances = (
  observations: readonly AnalyticsObservation[],
  needs: readonly AnalyticsNeed[],
  resources: readonly AnalyticsResource[],
): LocalCategoryBalance[] => {
  const balances = new Map<string, LocalCategoryBalance>();
  const rowFor = (category: string): LocalCategoryBalance => {
    const current = balances.get(category);
    if (current) return current;
    const created: LocalCategoryBalance = {
      category,
      signals: 0,
      corroboratedSignals: 0,
      openNeeds: 0,
      resolvedNeeds: 0,
      availableResources: 0,
      potentialBridges: 0,
    };
    balances.set(category, created);
    return created;
  };

  observations.forEach((observation) => {
    const row = rowFor(observation.category);
    row.signals += 1;
    if (observation.status === 'corroborated') row.corroboratedSignals += 1;
  });
  needs.forEach((need) => {
    const row = rowFor(need.category);
    if (OPEN_NEED_STATUSES.has(need.status)) row.openNeeds += 1;
    if (need.status === 'resolved') row.resolvedNeeds += 1;
  });
  resources.forEach((resource) => {
    if (resource.status === 'available') rowFor(resource.category).availableResources += 1;
  });
  balances.forEach((row) => {
    row.potentialBridges = Math.min(row.openNeeds, row.availableResources);
  });

  return [...balances.values()]
    .filter((row) => row.signals + row.openNeeds + row.resolvedNeeds + row.availableResources > 0)
    .sort((left, right) =>
      right.openNeeds - left.openNeeds
      || right.potentialBridges - left.potentialBridges
      || right.availableResources - left.availableResources
      || right.signals - left.signals
      || left.category.localeCompare(right.category, 'es'));
};

const prioritiesFor = (input: {
  unsafe: number;
  needsReview: number;
  stale: number;
  plannedCells: number;
  remainingCells: number;
  activeMatches: number;
  proposedMatches: number;
  categories: LocalCategoryBalance[];
  hasEvidenceWithoutPlan: boolean;
}): LocalCivicPriority[] => {
  const candidates: PriorityCandidate[] = [];
  if (input.unsafe > 0) {
    candidates.push({
      kind: 'protect',
      tier: 0,
      weight: input.unsafe,
      title: 'Proteger antes de interpretar',
      explanation: 'Hay señales bajo resguardo. No deben transformarse en exposición, diagnóstico ni acción automática.',
      evidence: `${input.unsafe} ${input.unsafe === 1 ? 'señal marcada' : 'señales marcadas'} como insegura${input.unsafe === 1 ? '' : 's'}.`,
      actionLabel: null,
      route: null,
    });
  }
  if (input.needsReview > 0) {
    candidates.push({
      kind: 'verify',
      tier: 1,
      weight: input.needsReview,
      title: 'Sumar miradas independientes',
      explanation: 'La calidad crece cuando otra persona declara cómo sabe lo que sabe y puede confirmar, corregir o disentir.',
      evidence: `${input.needsReview} ${input.needsReview === 1 ? 'asunto espera' : 'asuntos esperan'} corroboración.`,
      actionLabel: 'Ir a Corroborar',
      route: '/verificar',
    });
  }
  if (input.stale > 0) {
    candidates.push({
      kind: 'refresh',
      tier: 2,
      weight: input.stale,
      title: 'Revisar lo que pudo cambiar',
      explanation: 'Una señal vencida describe otro momento. Conviene actualizarla o retirarla antes de usarla para decidir.',
      evidence: `${input.stale} ${input.stale === 1 ? 'señal perdió' : 'señales perdieron'} vigencia.`,
      actionLabel: 'Revisar mis datos',
      route: '/mis-datos',
    });
  }
  if (input.plannedCells > 0 && input.remainingCells > 0) {
    candidates.push({
      kind: 'cover',
      tier: 3,
      weight: input.remainingCells,
      title: 'Completar el territorio planificado',
      explanation: 'Las celdas todavía no recorridas conservan lo desconocido a la vista y evitan confundir participación con cobertura.',
      evidence: `${input.remainingCells} de ${input.plannedCells} celdas todavía no fueron recorridas.`,
      actionLabel: 'Abrir Misiones',
      route: '/territorio/misiones',
    });
  } else if (input.hasEvidenceWithoutPlan) {
    candidates.push({
      kind: 'cover',
      tier: 3,
      weight: 1,
      title: 'Crear un denominador territorial',
      explanation: 'Hay evidencia, pero no un plan de celdas que permita decir qué parte del área fue observada y cuál sigue desconocida.',
      evidence: '0 celdas planificadas: no puede estimarse cobertura.',
      actionLabel: 'Diseñar una misión',
      route: '/territorio/misiones',
    });
  }
  if (input.activeMatches + input.proposedMatches > 0) {
    candidates.push({
      kind: 'follow_through',
      tier: 4,
      weight: input.activeMatches * 2 + input.proposedMatches,
      title: 'Llevar los puentes hasta un resultado',
      explanation: 'Una coincidencia no es impacto: hacen falta aceptación, coordinación, entrega y confirmación de quien recibió.',
      evidence: `${input.activeMatches} en curso · ${input.proposedMatches} ${input.proposedMatches === 1 ? 'propuesto' : 'propuestos'}.`,
      actionLabel: 'Abrir Conectar',
      route: '/conectar',
    });
  }

  input.categories.filter((row) => row.potentialBridges > 0).forEach((row) => {
    candidates.push({
      kind: 'coordinate',
      tier: 5,
      weight: row.potentialBridges * 10 + row.openNeeds,
      title: `Explorar puentes para ${civicCategoryLabel(row.category)}`,
      explanation: 'La categoría coincide; distancia, cantidad, vigencia y consentimiento todavía deben confirmarse entre las partes.',
      evidence: `${row.openNeeds} abiertas · ${row.availableResources} recursos · hasta ${row.potentialBridges} puentes por evaluar.`,
      actionLabel: 'Evaluar en Conectar',
      route: '/conectar',
    });
  });
  input.categories.filter((row) => row.openNeeds > 0 && row.availableResources === 0).forEach((row) => {
    candidates.push({
      kind: 'mobilize',
      tier: 6,
      weight: row.openNeeds,
      title: `Convocar capacidades para ${civicCategoryLabel(row.category)}`,
      explanation: 'Hay necesidades vigentes y todavía no aparece un recurso disponible de la misma categoría.',
      evidence: `${row.openNeeds} ${row.openNeeds === 1 ? 'necesidad abierta' : 'necesidades abiertas'} · 0 recursos disponibles.`,
      actionLabel: 'Aportar un recurso',
      route: '/aportar',
    });
  });

  return candidates
    .sort((left, right) =>
      left.tier - right.tier
      || right.weight - left.weight
      || left.title.localeCompare(right.title, 'es'))
    .slice(0, 6)
    .map(({ tier: _tier, weight: _weight, ...priority }, index) => ({
      ...priority,
      rank: index + 1,
    }));
};

export const buildLocalCivicAnalytics = (
  input: LocalCivicAnalyticsInput,
): LocalCivicAnalyticsReport => {
  const now = validTime(input.now ?? new Date().toISOString()) ?? Date.now();
  const fieldSignals = input.observations.filter((observation) =>
    observation.campaignKey !== 'escucha-v1'
    && FIELD_SIGNAL_STATUSES.has(observation.status));
  const fieldSignalIds = new Set(fieldSignals.map((observation) => observation.id));
  const derivedReviewIds = fieldSignals
    .filter((observation) => ['queued', 'synced', 'needs_review'].includes(observation.status))
    .map((observation) => observation.id);
  const queueIds = new Set(input.verificationQueueIds ?? derivedReviewIds);
  const needsReview = [...queueIds].filter((id) => fieldSignalIds.has(id)).length;
  const staleIds = new Set(fieldSignals
    .filter((observation) => {
      const expiresAt = validTime(observation.expiresAt);
      return observation.status === 'stale' || (expiresAt != null && expiresAt <= now);
    })
    .map((observation) => observation.id));
  const corroborated = fieldSignals.filter((observation) => observation.status === 'corroborated').length;
  const unsafe = fieldSignals.filter((observation) => observation.status === 'unsafe').length;

  const activeNeeds = input.needs.filter((need) => OPEN_NEED_STATUSES.has(need.status));
  const resolvedNeeds = input.needs.filter((need) => need.status === 'resolved');
  const consideredNeeds = activeNeeds.length + resolvedNeeds.length;
  const availableResources = input.resources.filter((resource) => resource.status === 'available');
  const proposedMatches = input.matches.filter((match) => match.status === 'proposed').length;
  const activeMatches = input.matches.filter((match) => ACTIVE_MATCH_STATUSES.has(match.status)).length;
  const confirmedMatches = input.matches.filter((match) => match.status === 'confirmed').length;
  const actionsInProgress = input.actions.filter((action) => ACTIVE_ACTION_STATUSES.has(action.status)).length;
  const confirmedActions = input.actions.filter((action) => action.status === 'confirmed').length;

  const measuredMissions = input.missions.filter((mission) =>
    mission.status !== 'archived' && Math.max(mission.plannedCells, mission.cells.length) > 0);
  let plannedCells = 0;
  let visitedCells = 0;
  let assignedCells = 0;
  let corroboratedCells = 0;
  let contestedCells = 0;
  const observationsInsidePlan = new Set<string>();
  measuredMissions.forEach((mission) => {
    // Las filas de celda son el denominador más concreto; plannedCells cubre
    // una migración incompleta en la que el pasaporte ya declaró el plan.
    plannedCells += Math.max(mission.plannedCells, mission.cells.length);
    mission.cells.forEach((cell) => {
      if (VISITED_CELL_STATUSES.has(cell.status)) visitedCells += 1;
      if (cell.status === 'assigned') assignedCells += 1;
      if (cell.status === 'corroborated') corroboratedCells += 1;
      if (cell.status === 'contested') contestedCells += 1;
      if (cell.observationId) observationsInsidePlan.add(cell.observationId);
    });
  });
  const fieldSignalsInsidePlan = fieldSignals.filter((signal) => observationsInsidePlan.has(signal.id)).length;
  const fieldSignalsOutsidePlan = Math.max(0, fieldSignals.length - fieldSignalsInsidePlan);
  const categories = categoryBalances(fieldSignals, input.needs, input.resources);
  const remainingCells = Math.max(0, plannedCells - visitedCells);

  const interpretationLimits = [
    'Los conteos describen registros accesibles en esta instalación, no personas únicas, votos ni toda la población.',
    'La participación puede concentrarse en zonas, horarios o redes con más acceso; ausencia de datos no significa ausencia de problemas.',
    'El orden de prioridades organiza trabajo pendiente con reglas visibles; no determina verdad, derechos, presupuesto ni mandato.',
  ];
  if (plannedCells === 0 && fieldSignals.length > 0) {
    interpretationLimits.push('Sin celdas planificadas no existe denominador territorial: estos datos no permiten estimar prevalencia ni cobertura.');
  } else if (plannedCells > 0) {
    interpretationLimits.push('Las celdas miden avance sobre un recorrido planificado, no proporción de habitantes; misiones superpuestas pueden contar zonas más de una vez.');
  }
  if (fieldSignalsOutsidePlan > 0) {
    interpretationLimits.push(`${fieldSignalsOutsidePlan} señales están fuera de una misión medida: informan casos registrados, no qué porcentaje del territorio representan.`);
  }
  if (categories.some((row) => row.potentialBridges > 0)) {
    interpretationLimits.push('Coincidir por categoría sólo abre una posibilidad: cercanía, cantidad, vigencia, seguridad y consentimiento requieren confirmación humana.');
  }

  return {
    contract: 'basta-local-civic-intelligence/v1',
    principles: {
      purpose: 'decision-support',
      determinesTruth: false,
      measuresPopulationPrevalence: false,
      individualRanking: false,
      humanDeliberationRequired: true,
    },
    source: {
      includedSignals: fieldSignals.length,
      excludedDraftSignals: input.observations.filter((observation) => observation.status === 'draft').length,
      withdrawnSignals: input.observations.filter((observation) => observation.status === 'withdrawn').length,
    },
    quality: {
      fieldSignals: fieldSignals.length,
      currentSignals: Math.max(0, fieldSignals.length - staleIds.size),
      corroborated,
      needsReview,
      stale: staleIds.size,
      unsafe,
      corroborationPct: pct(corroborated, fieldSignals.length),
      vigencyPct: pct(fieldSignals.length - staleIds.size, fieldSignals.length),
    },
    response: {
      openNeeds: activeNeeds.length,
      resolvedNeeds: resolvedNeeds.length,
      consideredNeeds,
      availableResources: availableResources.length,
      proposedMatches,
      activeMatches,
      confirmedMatches,
      actionsInProgress,
      confirmedActions,
      resolutionPct: pct(resolvedNeeds.length, consideredNeeds),
    },
    coverage: {
      measuredMissions: measuredMissions.length,
      plannedCells,
      visitedCells,
      assignedCells,
      corroboratedCells,
      contestedCells,
      remainingCells,
      coveragePct: pct(visitedCells, plannedCells),
      fieldSignalsInsidePlan,
      fieldSignalsOutsidePlan,
    },
    categories,
    priorities: prioritiesFor({
      unsafe,
      needsReview,
      stale: staleIds.size,
      plannedCells,
      remainingCells,
      activeMatches,
      proposedMatches,
      categories,
      hasEvidenceWithoutPlan: fieldSignals.length + activeNeeds.length + availableResources.length > 0,
    }),
    interpretationLimits,
  };
};
