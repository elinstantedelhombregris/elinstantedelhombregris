// El Arquitecto — Validation Engine
// 37 rules across 7 categories, checking ecosystem coherence

import { PLAN_NODES, DEPENDENCIES, TIMELINE_PHASES, type PlanNode } from './arquitecto-data';

export type RuleSeverity = 'ERROR' | 'WARNING';
export type RuleCategory = 'REF' | 'TERM' | 'TIME' | 'FIN' | 'COV' | 'RES' | 'ADV';

export interface ValidationResult {
  ruleId: string;
  severity: RuleSeverity;
  category: RuleCategory;
  planId?: string;
  message: string;
  details?: string;
}

export interface ValidationRule {
  id: string;
  category: RuleCategory;
  name: string;
  severity: RuleSeverity;
  description: string;
  check: () => ValidationResult[];
}

export const CATEGORY_LABELS: Record<RuleCategory, { label: string; icon: string }> = {
  REF: { label: 'Integridad Referencial', icon: 'Link' },
  TERM: { label: 'Consistencia Terminológica', icon: 'BookOpen' },
  TIME: { label: 'Coherencia Temporal', icon: 'Clock' },
  FIN: { label: 'Coherencia Financiera', icon: 'DollarSign' },
  COV: { label: 'Cobertura Estratégica', icon: 'Map' },
  RES: { label: 'Resiliencia', icon: 'Shield' },
  ADV: { label: 'Análisis Adversarial', icon: 'Swords' },
};

const planIds = new Set(PLAN_NODES.map(p => p.id));

// === REFERENTIAL INTEGRITY (V-REF) ===

const vRef01: ValidationRule = {
  id: 'V-REF-01', category: 'REF', name: 'Bidireccionalidad',
  severity: 'WARNING', description: 'Cada dependencia A→B debería tener referencia inversa B→A',
  check: () => {
    const results: ValidationResult[] = [];
    for (const dep of DEPENDENCIES) {
      const inverse = DEPENDENCIES.find(d => d.source === dep.target && d.target === dep.source);
      if (!inverse) {
        results.push({ ruleId: 'V-REF-01', severity: 'WARNING', category: 'REF',
          planId: dep.source, message: `${dep.source}→${dep.target} sin referencia inversa`,
          details: dep.description });
      }
    }
    return results;
  },
};

const vRef02: ValidationRule = {
  id: 'V-REF-02', category: 'REF', name: 'Conteo de mandatos',
  severity: 'ERROR', description: 'El conteo de mandatos debe ser 16',
  check: () => PLAN_NODES.length !== 16 ? [{ ruleId: 'V-REF-02', severity: 'ERROR', category: 'REF',
    message: `Conteo de mandatos: ${PLAN_NODES.length} (esperado: 16)` }] : [],
};

const vRef03: ValidationRule = {
  id: 'V-REF-03', category: 'REF', name: 'Planes fantasma',
  severity: 'ERROR', description: 'No pueden existir referencias a planes inexistentes',
  check: () => {
    const results: ValidationResult[] = [];
    for (const dep of DEPENDENCIES) {
      if (!planIds.has(dep.source)) results.push({ ruleId: 'V-REF-03', severity: 'ERROR', category: 'REF',
        message: `Referencia a plan inexistente: ${dep.source}` });
      if (!planIds.has(dep.target)) results.push({ ruleId: 'V-REF-03', severity: 'ERROR', category: 'REF',
        message: `Referencia a plan inexistente: ${dep.target}` });
    }
    return results;
  },
};

const vRef04: ValidationRule = {
  id: 'V-REF-04', category: 'REF', name: 'Planes aislados',
  severity: 'WARNING', description: 'Un plan con <3 dependencias totales está potencialmente aislado',
  check: () => {
    const results: ValidationResult[] = [];
    for (const plan of PLAN_NODES) {
      const total = DEPENDENCIES.filter(d => d.source === plan.id || d.target === plan.id).length;
      if (total < 3) results.push({ ruleId: 'V-REF-04', severity: 'WARNING', category: 'REF',
        planId: plan.id, message: `${plan.id} tiene solo ${total} dependencias (mínimo recomendado: 3)` });
    }
    return results;
  },
};

const vRef05: ValidationRule = {
  id: 'V-REF-05', category: 'REF', name: 'Dependencias duplicadas',
  severity: 'WARNING', description: 'No debería haber dependencias duplicadas exactas',
  check: () => {
    const seen = new Set<string>();
    const results: ValidationResult[] = [];
    for (const dep of DEPENDENCIES) {
      const key = `${dep.source}->${dep.target}:${dep.type}`;
      if (seen.has(key)) results.push({ ruleId: 'V-REF-05', severity: 'WARNING', category: 'REF',
        message: `Dependencia duplicada: ${key}` });
      seen.add(key);
    }
    return results;
  },
};

const vRef06: ValidationRule = {
  id: 'V-REF-06', category: 'REF', name: 'Auto-referencia',
  severity: 'ERROR', description: 'Un plan no puede depender de sí mismo',
  check: () => DEPENDENCIES.filter(d => d.source === d.target).map(d => ({
    ruleId: 'V-REF-06', severity: 'ERROR' as const, category: 'REF' as const,
    planId: d.source, message: `${d.source} depende de sí mismo` })),
};

// === TERMINOLOGY (V-TERM) ===

const vTerm01: ValidationRule = {
  id: 'V-TERM-01', category: 'TERM', name: 'Nomenclatura de agencias',
  severity: 'WARNING', description: 'Agencias deben seguir patrón AN+sufijo o tener justificación',
  check: () => {
    const exceptions = new Set(['ANCE', 'ANVIP', 'ENSV', 'CNDU', 'CNEG']);
    const results: ValidationResult[] = [];
    for (const plan of PLAN_NODES) {
      if (!plan.agency) continue;
      if (!plan.agency.startsWith('AN') && !exceptions.has(plan.agency)) {
        results.push({ ruleId: 'V-TERM-01', severity: 'WARNING', category: 'TERM',
          planId: plan.id, message: `Agencia ${plan.agency} no sigue patrón AN+sufijo ni está en excepciones` });
      }
    }
    return results;
  },
};

const vTerm02: ValidationRule = {
  id: 'V-TERM-02', category: 'TERM', name: 'Formato de ID de plan',
  severity: 'ERROR', description: 'IDs de plan deben seguir formato PLAN+sufijo',
  check: () => PLAN_NODES.filter(p => !p.id.startsWith('PLAN')).map(p => ({
    ruleId: 'V-TERM-02', severity: 'ERROR' as const, category: 'TERM' as const,
    planId: p.id, message: `ID ${p.id} no sigue formato PLAN+sufijo` })),
};

const vTerm03: ValidationRule = {
  id: 'V-TERM-03', category: 'TERM', name: 'Categoría válida',
  severity: 'ERROR', description: 'Cada plan debe tener categoría válida',
  check: () => {
    const valid = new Set(['educacion','economia','justicia','salud','infraestructura','tecnologia','medio-ambiente','cultura','instituciones','geopolitica']);
    return PLAN_NODES.filter(p => !valid.has(p.category)).map(p => ({
      ruleId: 'V-TERM-03', severity: 'ERROR' as const, category: 'TERM' as const,
      planId: p.id, message: `Categoría inválida: ${p.category}` }));
  },
};

const vTerm04: ValidationRule = {
  id: 'V-TERM-04', category: 'TERM', name: 'Slug definido',
  severity: 'WARNING', description: 'Cada plan debe tener slug para la webapp',
  check: () => PLAN_NODES.filter(p => !p.slug).map(p => ({
    ruleId: 'V-TERM-04', severity: 'WARNING' as const, category: 'TERM' as const,
    planId: p.id, message: `${p.id} no tiene slug definido` })),
};

const vTerm05: ValidationRule = {
  id: 'V-TERM-05', category: 'TERM', name: 'Piso constitucional documentado',
  severity: 'WARNING', description: 'Agencias autónomas deberían tener piso constitucional',
  check: () => PLAN_NODES
    .filter(p => p.agency && !p.constitutionalFloor && !['PLANREP','PLAN24CN','PLANGEO','PLANMON'].includes(p.id))
    .map(p => ({ ruleId: 'V-TERM-05', severity: 'WARNING' as const, category: 'TERM' as const,
      planId: p.id, message: `${p.id} tiene agencia (${p.agency}) pero sin piso constitucional documentado` })),
};

// === TEMPORAL COHERENCE (V-TIME) ===

const vTime01: ValidationRule = {
  id: 'V-TIME-01', category: 'TIME', name: 'Prerequisito disponible',
  severity: 'ERROR', description: 'Dependencia crítica: el plan fuente no debe iniciar antes que el target esté disponible',
  check: () => {
    const results: ValidationResult[] = [];
    for (const dep of DEPENDENCIES.filter(d => d.nature === 'CRITICAL')) {
      const sourcePhases = TIMELINE_PHASES.filter(p => p.planId === dep.source);
      const targetPhases = TIMELINE_PHASES.filter(p => p.planId === dep.target);
      if (sourcePhases.length === 0 || targetPhases.length === 0) continue;
      const sourceStart = Math.min(...sourcePhases.map(p => p.startYear));
      const targetStart = Math.min(...targetPhases.map(p => p.startYear));
      if (sourceStart < targetStart) {
        results.push({ ruleId: 'V-TIME-01', severity: 'ERROR', category: 'TIME',
          planId: dep.source, message: `${dep.source} inicia año ${sourceStart} pero depende de ${dep.target} que inicia año ${targetStart}`,
          details: dep.description });
      }
    }
    return results;
  },
};

const vTime02: ValidationRule = {
  id: 'V-TIME-02', category: 'TIME', name: 'Sobrecarga Año 0',
  severity: 'WARNING', description: 'Más de 6 planes lanzando simultáneamente en Año 0',
  check: () => {
    const year0 = TIMELINE_PHASES.filter(p => p.startYear === 0);
    const uniquePlans = new Set(year0.map(p => p.planId));
    return uniquePlans.size > 6 ? [{ ruleId: 'V-TIME-02', severity: 'WARNING', category: 'TIME',
      message: `${uniquePlans.size} planes lanzan en Año 0 (máximo recomendado: 6)`,
      details: [...uniquePlans].join(', ') }] : [];
  },
};

const vTime03: ValidationRule = {
  id: 'V-TIME-03', category: 'TIME', name: 'Sobrecarga legislativa',
  severity: 'WARNING', description: 'Más de 8 instrumentos legales en planes simultáneos del Año 0-1',
  check: () => {
    const year01Plans = PLAN_NODES.filter(p => {
      const phases = TIMELINE_PHASES.filter(t => t.planId === p.id);
      return phases.some(t => t.startYear <= 1);
    });
    const totalLaws = year01Plans.reduce((s, p) => s + p.legalInstruments, 0);
    return totalLaws > 8 ? [{ ruleId: 'V-TIME-03', severity: 'WARNING', category: 'TIME',
      message: `${totalLaws} instrumentos legales en Año 0-1 (máximo recomendado: 8)`,
      details: year01Plans.map(p => `${p.id}: ${p.legalInstruments}`).join(', ') }] : [];
  },
};

const vTime04: ValidationRule = {
  id: 'V-TIME-04', category: 'TIME', name: 'Continuidad temporal',
  severity: 'WARNING', description: 'Las fases de un plan no deben tener gaps temporales',
  check: () => {
    const results: ValidationResult[] = [];
    for (const plan of PLAN_NODES) {
      const phases = TIMELINE_PHASES.filter(p => p.planId === plan.id).sort((a, b) => a.startYear - b.startYear);
      for (let i = 1; i < phases.length; i++) {
        if (phases[i].startYear > phases[i-1].endYear + 1) {
          results.push({ ruleId: 'V-TIME-04', severity: 'WARNING', category: 'TIME',
            planId: plan.id, message: `Gap temporal en ${plan.id}: ${phases[i-1].name} termina año ${phases[i-1].endYear}, ${phases[i].name} inicia año ${phases[i].startYear}` });
        }
      }
    }
    return results;
  },
};

const vTime05: ValidationRule = {
  id: 'V-TIME-05', category: 'TIME', name: 'Pre-fase requerida',
  severity: 'WARNING', description: 'Planes con 3+ dependencias críticas deberían tener pre-fase',
  check: () => {
    const results: ValidationResult[] = [];
    for (const plan of PLAN_NODES) {
      const critDeps = DEPENDENCIES.filter(d => d.source === plan.id && d.nature === 'CRITICAL').length;
      const hasPrePhase = TIMELINE_PHASES.some(p => p.planId === plan.id && p.startYear < 0);
      if (critDeps >= 3 && !hasPrePhase) {
        results.push({ ruleId: 'V-TIME-05', severity: 'WARNING', category: 'TIME',
          planId: plan.id, message: `${plan.id} tiene ${critDeps} dependencias críticas sin pre-fase documentada` });
      }
    }
    return results;
  },
};

const vTime06: ValidationRule = {
  id: 'V-TIME-06', category: 'TIME', name: 'Orden de fases',
  severity: 'ERROR', description: 'Las fases no deben tener fechas invertidas',
  check: () => {
    const results: ValidationResult[] = [];
    for (const phase of TIMELINE_PHASES) {
      if (phase.endYear < phase.startYear) {
        results.push({ ruleId: 'V-TIME-06', severity: 'ERROR', category: 'TIME',
          planId: phase.planId, message: `Fase "${phase.name}" de ${phase.planId}: fin (${phase.endYear}) < inicio (${phase.startYear})` });
      }
    }
    return results;
  },
};

const vTime07: ValidationRule = {
  id: 'V-TIME-07', category: 'TIME', name: 'Horizonte temporal',
  severity: 'WARNING', description: 'Planes con horizonte >15 años son ambiciosos',
  check: () => PLAN_NODES.filter(p => p.timelineYears > 15).map(p => ({
    ruleId: 'V-TIME-07', severity: 'WARNING' as const, category: 'TIME' as const,
    planId: p.id, message: `${p.id} tiene horizonte de ${p.timelineYears} años (>15 años)` })),
};

// === FINANCIAL (V-FIN) ===

const vFin01: ValidationRule = {
  id: 'V-FIN-01', category: 'FIN', name: 'Presupuesto definido',
  severity: 'WARNING', description: 'Planes deben tener presupuesto definido (excepto PLANMON y PLANCUL)',
  check: () => PLAN_NODES
    .filter(p => p.budgetLow === 0 && p.budgetHigh === 0 && !['PLANMON', 'PLANCUL'].includes(p.id))
    .map(p => ({ ruleId: 'V-FIN-01', severity: 'WARNING' as const, category: 'FIN' as const,
      planId: p.id, message: `${p.id} sin presupuesto definido` })),
};

const vFin02: ValidationRule = {
  id: 'V-FIN-02', category: 'FIN', name: 'Rango presupuestario excesivo',
  severity: 'WARNING', description: 'Ratio alto/bajo >4x sugiere presupuesto indefinido',
  check: () => PLAN_NODES
    .filter(p => p.budgetLow > 0 && p.budgetHigh / p.budgetLow > 4)
    .map(p => ({ ruleId: 'V-FIN-02', severity: 'WARNING' as const, category: 'FIN' as const,
      planId: p.id, message: `${p.id}: ratio presupuestario ${(p.budgetHigh / p.budgetLow).toFixed(1)}x (${p.budgetLow}-${p.budgetHigh}M)` })),
};

const vFin03: ValidationRule = {
  id: 'V-FIN-03', category: 'FIN', name: 'Consistencia presupuesto-timeline',
  severity: 'WARNING', description: 'Presupuesto anual implícito debe ser razonable',
  check: () => {
    const results: ValidationResult[] = [];
    for (const p of PLAN_NODES) {
      if (p.budgetLow <= 0 || p.timelineYears <= 0) continue;
      const annualHigh = p.budgetHigh / p.timelineYears;
      if (annualHigh > 10000) {
        results.push({ ruleId: 'V-FIN-03', severity: 'WARNING', category: 'FIN',
          planId: p.id, message: `${p.id}: gasto anual implícito USD ${(annualHigh).toFixed(0)}M/año (alto)` });
      }
    }
    return results;
  },
};

const vFin04: ValidationRule = {
  id: 'V-FIN-04', category: 'FIN', name: 'Fuente de financiamiento',
  severity: 'WARNING', description: 'Cada plan debe tener fuente de financiamiento documentada',
  check: () => PLAN_NODES.filter(p => !p.mainSource || p.mainSource.length < 10)
    .map(p => ({ ruleId: 'V-FIN-04', severity: 'WARNING' as const, category: 'FIN' as const,
      planId: p.id, message: `${p.id} sin fuente de financiamiento documentada` })),
};

const vFin05: ValidationRule = {
  id: 'V-FIN-05', category: 'FIN', name: 'Pisos constitucionales alineados',
  severity: 'WARNING', description: 'Pisos constitucionales acumulados no deben exceder 5% PBI',
  check: () => {
    const withFloors = PLAN_NODES.filter(p => p.constitutionalFloor);
    return withFloors.length > 10 ? [{ ruleId: 'V-FIN-05', severity: 'WARNING', category: 'FIN',
      message: `${withFloors.length} planes con pisos constitucionales — verificar acumulación <5% PBI` }] : [];
  },
};

const vFin06: ValidationRule = {
  id: 'V-FIN-06', category: 'FIN', name: 'Total presupuestario razonable',
  severity: 'WARNING', description: 'El total consolidado debe ser verificable',
  check: () => {
    const totalLow = PLAN_NODES.reduce((s, p) => s + p.budgetLow, 0);
    const totalHigh = PLAN_NODES.reduce((s, p) => s + p.budgetHigh, 0);
    return totalHigh > 600000 ? [{ ruleId: 'V-FIN-06', severity: 'WARNING', category: 'FIN',
      message: `Total consolidado USD ${totalLow.toLocaleString()}-${totalHigh.toLocaleString()}M excede umbral de verificación` }] : [];
  },
};

// === COVERAGE (V-COV) ===

const vCov01: ValidationRule = {
  id: 'V-COV-01', category: 'COV', name: 'Cobertura de dominios críticos',
  severity: 'ERROR', description: 'Todos los dominios críticos deben tener al menos 1 plan',
  check: () => {
    const critical = ['educacion','economia','justicia','salud','infraestructura','tecnologia','medio-ambiente','cultura','instituciones','geopolitica'];
    const covered = new Set(PLAN_NODES.map(p => p.category));
    return critical.filter(c => !covered.has(c)).map(c => ({
      ruleId: 'V-COV-01', severity: 'ERROR' as const, category: 'COV' as const,
      message: `Dominio crítico sin cobertura: ${c}` }));
  },
};

const vCov02: ValidationRule = {
  id: 'V-COV-02', category: 'COV', name: 'Agencia definida',
  severity: 'WARNING', description: 'Cada plan debe tener agencia ejecutora (excepto PLANCUL)',
  check: () => PLAN_NODES.filter(p => !p.agency && p.id !== 'PLANCUL')
    .map(p => ({ ruleId: 'V-COV-02', severity: 'WARNING' as const, category: 'COV' as const,
      planId: p.id, message: `${p.id} sin agencia ejecutora definida` })),
};

const vCov03: ValidationRule = {
  id: 'V-COV-03', category: 'COV', name: 'Balance de categorías',
  severity: 'WARNING', description: 'Verificar que no hay categorías con excesiva concentración',
  check: () => {
    const counts: Record<string, number> = {};
    PLAN_NODES.forEach(p => { counts[p.category] = (counts[p.category] || 0) + 1; });
    return Object.entries(counts).filter(([, c]) => c > 4).map(([cat, c]) => ({
      ruleId: 'V-COV-03', severity: 'WARNING' as const, category: 'COV' as const,
      message: `Categoría "${cat}" tiene ${c} planes — posible concentración excesiva` }));
  },
};

const vCov04: ValidationRule = {
  id: 'V-COV-04', category: 'COV', name: 'Cobertura legal',
  severity: 'WARNING', description: 'Planes implementadores deben tener instrumentos legales',
  check: () => PLAN_NODES.filter(p => p.legalInstruments === 0 && p.budgetHigh > 0)
    .map(p => ({ ruleId: 'V-COV-04', severity: 'WARNING' as const, category: 'COV' as const,
      planId: p.id, message: `${p.id} tiene presupuesto pero 0 instrumentos legales` })),
};

const vCov05: ValidationRule = {
  id: 'V-COV-05', category: 'COV', name: 'Status consistente',
  severity: 'WARNING', description: 'Todos los planes deben tener status definido',
  check: () => PLAN_NODES.filter(p => !p.status).map(p => ({
    ruleId: 'V-COV-05', severity: 'WARNING' as const, category: 'COV' as const,
    planId: p.id, message: `${p.id} sin status definido` })),
};

// === RESILIENCE (V-RES) ===

const vRes01: ValidationRule = {
  id: 'V-RES-01', category: 'RES', name: 'Punto único de falla',
  severity: 'ERROR', description: 'Plan con 5+ dependencias críticas entrantes es punto de falla catastrófico',
  check: () => {
    const results: ValidationResult[] = [];
    for (const plan of PLAN_NODES) {
      const critIncoming = DEPENDENCIES.filter(d => d.target === plan.id && d.nature === 'CRITICAL').length;
      if (critIncoming >= 5) {
        results.push({ ruleId: 'V-RES-01', severity: 'ERROR', category: 'RES',
          planId: plan.id, message: `${plan.id} es punto único de falla: ${critIncoming} planes dependen críticamente de él`,
          details: 'Requiere fallbacks documentados para cada dependiente' });
      }
    }
    return results;
  },
};

const vRes02: ValidationRule = {
  id: 'V-RES-02', category: 'RES', name: 'Cadena de falla',
  severity: 'WARNING', description: 'Cadenas de 4+ dependencias críticas consecutivas son frágiles',
  check: () => {
    const results: ValidationResult[] = [];
    const visited = new Set<string>();
    function chainLength(planId: string, depth: number): number {
      if (visited.has(planId)) return depth;
      visited.add(planId);
      const critTargets = DEPENDENCIES.filter(d => d.source === planId && d.nature === 'CRITICAL').map(d => d.target);
      if (critTargets.length === 0) return depth;
      return Math.max(...critTargets.map(t => chainLength(t, depth + 1)));
    }
    for (const plan of PLAN_NODES) {
      visited.clear();
      const len = chainLength(plan.id, 0);
      if (len >= 4) {
        results.push({ ruleId: 'V-RES-02', severity: 'WARNING', category: 'RES',
          planId: plan.id, message: `Cadena crítica de ${len} eslabones desde ${plan.id}` });
      }
    }
    return results;
  },
};

const vRes03: ValidationRule = {
  id: 'V-RES-03', category: 'RES', name: 'Ratio de dependencias críticas',
  severity: 'WARNING', description: 'Más del 50% de dependencias no deberían ser CRITICAL',
  check: () => {
    const critCount = DEPENDENCIES.filter(d => d.nature === 'CRITICAL').length;
    const ratio = critCount / DEPENDENCIES.length;
    return ratio > 0.5 ? [{ ruleId: 'V-RES-03', severity: 'WARNING', category: 'RES',
      message: `${(ratio*100).toFixed(0)}% de dependencias son CRITICAL (${critCount}/${DEPENDENCIES.length})` }] : [];
  },
};

const vRes04: ValidationRule = {
  id: 'V-RES-04', category: 'RES', name: 'Islas de dependencia',
  severity: 'WARNING', description: 'No deben existir planes sin ninguna dependencia',
  check: () => PLAN_NODES.filter(p => {
    return !DEPENDENCIES.some(d => d.source === p.id || d.target === p.id);
  }).map(p => ({ ruleId: 'V-RES-04', severity: 'WARNING' as const, category: 'RES' as const,
    planId: p.id, message: `${p.id} no tiene ninguna dependencia declarada` })),
};

const vRes05: ValidationRule = {
  id: 'V-RES-05', category: 'RES', name: 'Redundancia mínima',
  severity: 'WARNING', description: 'Cada función crítica debería tener al menos 2 planes contribuyendo',
  check: () => {
    const catCounts: Record<string, number> = {};
    PLAN_NODES.forEach(p => { catCounts[p.category] = (catCounts[p.category] || 0) + 1; });
    return Object.entries(catCounts).filter(([, c]) => c < 2).map(([cat]) => ({
      ruleId: 'V-RES-05', severity: 'WARNING' as const, category: 'RES' as const,
      message: `Categoría "${cat}" tiene un solo plan — sin redundancia` }));
  },
};

// === ADVERSARIAL (V-ADV) ===

const vAdv01: ValidationRule = {
  id: 'V-ADV-01', category: 'ADV', name: 'Ciclo político',
  severity: 'WARNING', description: 'Implementación >8 años cruza 2+ ciclos electorales',
  check: () => PLAN_NODES.filter(p => p.timelineYears > 8).map(p => ({
    ruleId: 'V-ADV-01', severity: 'WARNING' as const, category: 'ADV' as const,
    planId: p.id, message: `${p.id}: ${p.timelineYears} años cruza ${Math.ceil(p.timelineYears/4)} ciclos electorales` })),
};

const vAdv02: ValidationRule = {
  id: 'V-ADV-02', category: 'ADV', name: 'Vulnerabilidad legal',
  severity: 'WARNING', description: 'Planes con muchos instrumentos legales son más vulnerables a bloqueo judicial',
  check: () => PLAN_NODES.filter(p => p.legalInstruments > 5).map(p => ({
    ruleId: 'V-ADV-02', severity: 'WARNING' as const, category: 'ADV' as const,
    planId: p.id, message: `${p.id}: ${p.legalInstruments} instrumentos legales — alto riesgo de bloqueo judicial` })),
};

const vAdv03: ValidationRule = {
  id: 'V-ADV-03', category: 'ADV', name: 'Captura presupuestaria',
  severity: 'WARNING', description: 'Planes con pisos constitucionales altos son políticamente vulnerables',
  check: () => PLAN_NODES
    .filter(p => p.constitutionalFloor && parseFloat(p.constitutionalFloor) >= 1.0)
    .map(p => ({ ruleId: 'V-ADV-03', severity: 'WARNING' as const, category: 'ADV' as const,
      planId: p.id, message: `${p.id}: piso constitucional ${p.constitutionalFloor} — alto riesgo de resistencia política` })),
};

// === ALL RULES ===

export const ALL_RULES: ValidationRule[] = [
  vRef01, vRef02, vRef03, vRef04, vRef05, vRef06,
  vTerm01, vTerm02, vTerm03, vTerm04, vTerm05,
  vTime01, vTime02, vTime03, vTime04, vTime05, vTime06, vTime07,
  vFin01, vFin02, vFin03, vFin04, vFin05, vFin06,
  vCov01, vCov02, vCov03, vCov04, vCov05,
  vRes01, vRes02, vRes03, vRes04, vRes05,
  vAdv01, vAdv02, vAdv03,
];

// === EXECUTION ===

export function runAllValidations(): ValidationResult[] {
  return ALL_RULES.flatMap(rule => rule.check());
}

export function runValidationsByCategory(category: RuleCategory): ValidationResult[] {
  return ALL_RULES.filter(r => r.category === category).flatMap(r => r.check());
}

export function getEcosystemScore(): { score: number; errors: number; warnings: number; passed: number; total: number } {
  const results = runAllValidations();
  const errors = results.filter(r => r.severity === 'ERROR').length;
  const warnings = results.filter(r => r.severity === 'WARNING').length;
  const total = ALL_RULES.length;
  const rulesWithErrors = new Set(results.filter(r => r.severity === 'ERROR').map(r => r.ruleId));
  const passed = total - rulesWithErrors.size;
  const score = Math.max(0, Math.round(((passed / total) * 80) + ((1 - warnings / (total * 3)) * 20)));
  return { score: Math.min(100, score), errors, warnings, passed, total };
}
