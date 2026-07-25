import { createHash } from 'node:crypto';

import type { PublicCivicAggregate } from './aggregates';

export type CivicPriorityKind =
  | 'protect'
  | 'verify'
  | 'coordinate'
  | 'mobilize'
  | 'map_demand'
  | 'monitor';

export type CivicMandateKind = 'safeguard' | 'investigate' | 'coordinate' | 'respond';

export interface CivicCategoryBalance {
  category: string;
  openNeeds: number;
  resolvedNeeds: number;
  availableResources: number;
  observedSignals: number;
  corroboratedSignals: number;
  groups: number;
}

export interface CivicMatchLead {
  id: string;
  category: string;
  territory: {
    label: string;
    precision: string;
  };
  openNeeds: number;
  availableResources: number;
  potentialBridges: number;
  needGroupIds: string[];
  resourceGroupIds: string[];
  explanation: string;
  safeguards: string[];
  humanConfirmationRequired: true;
}

export interface CivicPriority {
  id: string;
  rank: number;
  score: number;
  kind: CivicPriorityKind;
  title: string;
  explanation: string;
  groupId: string;
  category: string;
  territory: PublicCivicAggregate['territory'];
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

export interface CivicMandateDraft {
  id: string;
  status: 'draft_for_deliberation';
  kind: CivicMandateKind;
  readiness: 'ready_for_deliberation' | 'requires_more_evidence';
  title: string;
  proposedText: string;
  decisionRecipient: string;
  evidenceGroupIds: string[];
  evidenceSummary: string;
  reviewRequirements: string[];
  safeguards: string[];
  nonBinding: true;
}

export interface CivicIntelligenceReport {
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
  categories: CivicCategoryBalance[];
  matchLeads: CivicMatchLead[];
  priorities: CivicPriority[];
  mandateDrafts: CivicMandateDraft[];
}

const stableId = (namespace: string, value: string): string =>
  `${namespace}_${createHash('sha256').update(value).digest('hex').slice(0, 16)}`;

const pct = (numerator: number, denominator: number): number | null =>
  denominator > 0 ? Math.round((numerator / denominator) * 100) : null;

const territoryLabel = (group: PublicCivicAggregate): string =>
  group.territory.label ?? `territorio con precisión ${group.territory.precision}`;

const decisionRecipientFor = (campaignKey: string): string => {
  if (campaignKey.includes('luminaria')) return 'Área pública responsable de alumbrado y mantenimiento urbano';
  if (campaignKey.includes('olla') || campaignKey.includes('comedor')) {
    return 'Red de comedores, organizaciones de apoyo y área pública de asistencia alimentaria';
  }
  if (campaignKey === 'red-recursos-v1') return 'Mesa territorial de coordinación de recursos';
  if (campaignKey === 'red-operativa-v1') return 'Custodia territorial responsable de la necesidad';
  return 'Institución responsable a identificar durante la deliberación';
};

const priorityKind = (group: PublicCivicAggregate): CivicPriorityKind => {
  if (group.quality.unsafe > 0) return 'protect';
  if (group.quality.needsReview > group.quality.corroborated) return 'verify';
  if (group.needs.open > 0 && group.resources.available > 0) return 'coordinate';
  if (group.needs.open > 0) return 'mobilize';
  if (group.resources.available > 0) return 'map_demand';
  return 'monitor';
};

const priorityScore = (group: PublicCivicAggregate): number => {
  const unresolved = group.needs.open * 14;
  const bridge = Math.min(group.needs.open, group.resources.available) * 18;
  const uncertainty = group.quality.needsReview * 5;
  const unsafe = group.quality.unsafe * 20;
  const evidence = group.quality.corroborated * 3;
  const agePenalty = group.needs.resolved * 2;
  return Math.max(0, unresolved + bridge + uncertainty + unsafe + evidence - agePenalty);
};

const priorityCopy = (
  group: PublicCivicAggregate,
  kind: CivicPriorityKind,
): { title: string; explanation: string; nextActions: string[] } => {
  const category = group.category;
  const territory = territoryLabel(group);
  switch (kind) {
    case 'protect':
      return {
        title: `Proteger antes de actuar sobre ${category}`,
        explanation: `Hay señales marcadas como inseguras en ${territory}; no deben convertirse en exposición ni mandato automático.`,
        nextActions: ['Revisar la evidencia con custodia responsable', 'Retirar cualquier detalle que pueda causar daño', 'Documentar la decisión de continuar o cerrar'],
      };
    case 'verify':
      return {
        title: `Reducir incertidumbre sobre ${category}`,
        explanation: `La mayoría de las señales de ${territory} todavía necesita una segunda mirada independiente.`,
        nextActions: ['Planificar verificaciones independientes', 'Priorizar celdas y voces todavía no observadas', 'Publicar qué cambió después de verificar'],
      };
    case 'coordinate':
      return {
        title: `Conectar capacidades con ${category}`,
        explanation: `En ${territory} existen necesidades abiertas y recursos registrados en el mismo grupo protegido.`,
        nextActions: ['Invitar a ambas partes sin revelar contacto', 'Confirmar cantidad, vigencia y distancia', 'Registrar aceptación, entrega y resultado por separado'],
      };
    case 'mobilize':
      return {
        title: `Movilizar respuesta para ${category}`,
        explanation: `Hay necesidades abiertas en ${territory} y todavía no aparece capacidad disponible dentro de este grupo.`,
        nextActions: ['Validar vigencia y cantidad', 'Convocar recursos compatibles', 'Asignar responsable y fecha de revisión'],
      };
    case 'map_demand':
      return {
        title: `Hacer visible dónde sirve ${category}`,
        explanation: `Hay recursos disponibles en ${territory}, pero no una necesidad abierta compatible dentro de este grupo.`,
        nextActions: ['Confirmar disponibilidad actual', 'Buscar necesidades por categoría sin asumir cercanía', 'Evitar prometer el mismo recurso dos veces'],
      };
    default:
      return {
        title: `Seguir aprendiendo sobre ${category}`,
        explanation: `El grupo de ${territory} no exige una intervención inmediata con la evidencia publicada.`,
        nextActions: ['Revisar vigencia', 'Observar cambios de calidad', 'Cerrar datos que ya no deban conservarse'],
      };
  }
};

const groupCaveats = (group: PublicCivicAggregate): string[] => {
  const caveats = [
    'La participación registrada no demuestra representatividad social.',
    'La ubicación pública fue reducida y no debe usarse como domicilio exacto.',
  ];
  if (group.coverage.target == null || group.coverage.pct == null) {
    caveats.push('No hay denominador de cobertura; no puede estimarse prevalencia territorial.');
  }
  if (group.quality.needsReview > 0) caveats.push('Parte de la evidencia todavía necesita verificación independiente.');
  return caveats;
};

const mandateKind = (kind: CivicPriorityKind): CivicMandateKind => {
  if (kind === 'protect') return 'safeguard';
  if (kind === 'verify' || kind === 'monitor') return 'investigate';
  if (kind === 'coordinate' || kind === 'map_demand') return 'coordinate';
  return 'respond';
};

const mandateFor = (priority: CivicPriority, group: PublicCivicAggregate): CivicMandateDraft => {
  const hasMeasuredCoverage = group.coverage.target != null && group.coverage.pct != null;
  const evidenceReady = group.quality.unsafe === 0
    && group.quality.corroborated > 0
    && group.quality.confidencePct >= 60;
  const readiness = evidenceReady && hasMeasuredCoverage
    ? 'ready_for_deliberation'
    : 'requires_more_evidence';
  const kind = mandateKind(priority.kind);
  const proposedText = kind === 'safeguard'
    ? `Suspender la difusión operativa sobre ${group.category} hasta completar una revisión de daño, custodia y seguridad.`
    : kind === 'investigate'
      ? `Realizar una nueva ronda independiente sobre ${group.category}, declarar su cobertura y publicar qué evidencia confirma, corrige o contradice el diagnóstico.`
      : kind === 'coordinate'
        ? `Convocar una coordinación protegida sobre ${group.category}, confirmar disponibilidad y necesidad, y publicar únicamente resultados agregados y consentidos.`
        : `Presentar una respuesta verificable para las necesidades abiertas de ${group.category}, con responsable, plazo, recursos comprometidos y confirmación posterior de resultado.`;

  return {
    id: stableId('mandate', `${priority.id}:${kind}`),
    status: 'draft_for_deliberation',
    kind,
    readiness,
    title: priority.title,
    proposedText,
    decisionRecipient: decisionRecipientFor(group.campaignKey),
    evidenceGroupIds: [group.id],
    evidenceSummary: `${group.quality.corroborated} señales corroboradas, ${group.quality.needsReview} por revisar, ${group.needs.open} necesidades abiertas y ${group.resources.available} recursos disponibles.`,
    reviewRequirements: [
      'Confirmar que la evidencia sigue vigente.',
      'Incluir a las personas afectadas y registrar disenso.',
      hasMeasuredCoverage
        ? 'Revisar el denominador y los límites de cobertura declarados.'
        : 'Definir un denominador de cobertura antes de generalizar al territorio.',
      'Asignar responsable, plazo, mecanismo de apelación y evaluación posterior.',
    ],
    safeguards: [
      'No revelar identidad, contacto ni ubicación exacta.',
      'No interpretar participación como voto ni representatividad.',
      'Permitir corrección, retiro y oposición al borrador.',
    ],
    nonBinding: true,
  };
};

const buildCategories = (groups: PublicCivicAggregate[]): CivicCategoryBalance[] => {
  const categories = new Map<string, CivicCategoryBalance>();
  for (const group of groups) {
    const row = categories.get(group.category) ?? {
      category: group.category,
      openNeeds: 0,
      resolvedNeeds: 0,
      availableResources: 0,
      observedSignals: 0,
      corroboratedSignals: 0,
      groups: 0,
    };
    row.openNeeds += group.needs.open;
    row.resolvedNeeds += group.needs.resolved;
    row.availableResources += group.resources.available;
    row.observedSignals += group.coverage.observed;
    row.corroboratedSignals += group.quality.corroborated;
    row.groups += 1;
    categories.set(group.category, row);
  }
  return [...categories.values()].sort((left, right) =>
    right.openNeeds - left.openNeeds
      || right.availableResources - left.availableResources
      || left.category.localeCompare(right.category, 'es'),
  );
};

const buildMatchLeads = (
  groups: PublicCivicAggregate[],
): CivicMatchLead[] => {
  const buckets = new Map<string, {
    category: string;
    territory: { label: string; precision: string };
    openNeeds: number;
    availableResources: number;
    needGroupIds: string[];
    resourceGroupIds: string[];
  }>();
  for (const group of groups) {
    // An opaque aggregate id cannot prove two groups share geography. A lead
    // is therefore only safe when both groups independently publish the same
    // k-protected territorial label and precision. Row-level distance remains
    // a private confirmation step.
    if (!group.territory.label) continue;
    const key = JSON.stringify([group.category, group.territory.label, group.territory.precision]);
    const bucket = buckets.get(key) ?? {
      category: group.category,
      territory: { label: group.territory.label, precision: group.territory.precision },
      openNeeds: 0,
      availableResources: 0,
      needGroupIds: [],
      resourceGroupIds: [],
    };
    bucket.openNeeds += group.needs.open;
    bucket.availableResources += group.resources.available;
    if (group.needs.open > 0) bucket.needGroupIds.push(group.id);
    if (group.resources.available > 0) bucket.resourceGroupIds.push(group.id);
    buckets.set(key, bucket);
  }

  return [...buckets.values()]
  .filter((bucket) => bucket.openNeeds > 0 && bucket.availableResources > 0)
  .map((bucket) => {
    return {
      id: stableId('lead', `${bucket.category}:${bucket.territory.label}:${bucket.territory.precision}`),
      category: bucket.category,
      territory: bucket.territory,
      openNeeds: bucket.openNeeds,
      availableResources: bucket.availableResources,
      potentialBridges: Math.min(bucket.openNeeds, bucket.availableResources),
      needGroupIds: bucket.needGroupIds,
      resourceGroupIds: bucket.resourceGroupIds,
      explanation: 'La categoría y el territorio público coinciden a nivel agregado. La distancia, vigencia, cantidad y consentimiento deben comprobarse entre las partes antes de proponer un puente.',
      safeguards: [
        'No identifica ni asigna personas automáticamente.',
        'La etiqueta territorial agregada no reemplaza la comprobación privada de distancia.',
        'Cada lado conserva el derecho de aceptar, rechazar o retirarse.',
      ],
      humanConfirmationRequired: true as const,
    };
  })
  .sort((left, right) =>
    right.potentialBridges - left.potentialBridges
      || left.category.localeCompare(right.category, 'es')
      || left.territory.label.localeCompare(right.territory.label, 'es'));
};

export function buildCivicIntelligence(
  groups: PublicCivicAggregate[],
  options: { priorityLimit?: number; mandateLimit?: number } = {},
): CivicIntelligenceReport {
  const priorityLimit = Math.max(1, Math.min(50, Math.floor(options.priorityLimit ?? 20)));
  const mandateLimit = Math.max(1, Math.min(20, Math.floor(options.mandateLimit ?? 10)));
  const totals = groups.reduce((sum, group) => ({
    observed: sum.observed + group.coverage.observed,
    corroborated: sum.corroborated + group.quality.corroborated,
    needsReview: sum.needsReview + group.quality.needsReview,
    unsafe: sum.unsafe + group.quality.unsafe,
    openNeeds: sum.openNeeds + group.needs.open,
    resolvedNeeds: sum.resolvedNeeds + group.needs.resolved,
    resources: sum.resources + group.resources.available,
  }), { observed: 0, corroborated: 0, needsReview: 0, unsafe: 0, openNeeds: 0, resolvedNeeds: 0, resources: 0 });

  const categories = buildCategories(groups);
  const ranked = groups
    .map((group) => ({ group, kind: priorityKind(group), score: priorityScore(group) }))
    .filter(({ kind, score }) => score > 0 || kind !== 'monitor')
    // Una señal de posible daño siempre se revisa antes que una oportunidad
    // operativa: el score ordena dentro de cada nivel, nunca compra seguridad.
    .sort((left, right) =>
      Number(right.kind === 'protect') - Number(left.kind === 'protect')
        || right.score - left.score
        || right.group.updatedAt.localeCompare(left.group.updatedAt))
    .slice(0, priorityLimit);
  const priorities = ranked.map(({ group, kind, score }, index): CivicPriority => {
    const copy = priorityCopy(group, kind);
    return {
      id: stableId('priority', `${group.id}:${kind}`),
      rank: index + 1,
      score,
      kind,
      title: copy.title,
      explanation: copy.explanation,
      groupId: group.id,
      category: group.category,
      territory: group.territory,
      evidence: {
        observed: group.coverage.observed,
        corroborated: group.quality.corroborated,
        needsReview: group.quality.needsReview,
        unsafe: group.quality.unsafe,
        openNeeds: group.needs.open,
        resolvedNeeds: group.needs.resolved,
        availableResources: group.resources.available,
        confidencePct: group.quality.confidencePct,
      },
      nextActions: copy.nextActions,
      caveats: groupCaveats(group),
    };
  });
  const groupsById = new Map(groups.map((group) => [group.id, group]));
  const mandateDrafts = priorities
    .filter((priority) => priority.kind !== 'monitor')
    .slice(0, mandateLimit)
    .flatMap((priority) => {
      const group = groupsById.get(priority.groupId);
      return group ? [mandateFor(priority, group)] : [];
    });
  const groupsWithMeasuredCoverage = groups.filter((group) =>
    group.coverage.target != null && group.coverage.pct != null).length;

  return {
    contract: 'basta-civic-intelligence/v1',
    principles: {
      purpose: 'decision-support',
      determinesTruth: false,
      createsBindingMandates: false,
      individualRanking: false,
      humanDeliberationRequired: true,
    },
    overview: {
      publishedGroups: groups.length,
      observedSignals: totals.observed,
      corroboratedSignals: totals.corroborated,
      signalsNeedingReview: totals.needsReview,
      unsafeSignals: totals.unsafe,
      openNeeds: totals.openNeeds,
      resolvedNeeds: totals.resolvedNeeds,
      availableResources: totals.resources,
      verificationRatePct: pct(totals.corroborated, totals.observed),
      resolutionRatePct: pct(totals.resolvedNeeds, totals.openNeeds + totals.resolvedNeeds),
    },
    evaluation: {
      groupsWithMeasuredCoverage,
      groupsWithoutMeasuredCoverage: groups.length - groupsWithMeasuredCoverage,
      qualityStatement: groups.length === 0
        ? 'Todavía no hay grupos públicos por encima del umbral de privacidad.'
        : groupsWithMeasuredCoverage === groups.length
          ? 'Todos los grupos publicados declaran un denominador de cobertura.'
          : 'La evidencia describe participación registrada; faltan denominadores para estimar prevalencia territorial.',
      interpretationLimits: [
        'Los grupos pequeños fueron suprimidos y no aparecen como cero.',
        'Los conteos describen registros y resultados, no personas únicas ni votos.',
        'La participación puede concentrarse en zonas o redes más conectadas.',
        'Las prioridades ordenan trabajo pendiente; no asignan derechos ni presupuesto.',
      ],
    },
    categories,
    matchLeads: buildMatchLeads(groups),
    priorities,
    mandateDrafts,
  };
}
