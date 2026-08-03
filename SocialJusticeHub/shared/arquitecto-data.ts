// El Arquitecto — Structured ecosystem data for the ¡BASTA! strategic planning platform
// Extracted from 22 PLANes + support documents (April 2026)

import type { MissionSlug, TemporalOrder, InitiativePriority, InitiativeState } from './strategic-initiatives';

export type DependencyNature = 'CRITICAL' | 'IMPORTANT' | 'MINOR';
export type DependencyType = 'FINANCIAL' | 'INSTITUTIONAL' | 'TECHNICAL' | 'LEGAL' | 'LABOR' | 'DATA' | 'TEMPORAL';
// 'requires' = arista real de dependencia (source depende de target).
// 'provides' = anotación espejo (source provee a target) — d77+. Las simulaciones
// de falla y métricas de grado recorren SOLO 'requires'; las 'provides' existen
// para la lectura bidireccional en UI y la regla V-REF-01.
export type DependencyKind = 'requires' | 'provides';
export type PlanStatus = 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'IMPLEMENTING';

export interface PlanNode {
  id: string;
  name: string;
  ordinal: number;
  category: string;
  agency: string | null;
  agencyFull: string | null;
  organMetaphor: string;
  organLabel: string;
  status: PlanStatus;
  budgetLow: number;  // USD millions
  budgetHigh: number;
  timelineYears: number; // -1 = permanent/continuous
  legalInstruments: number;
  constitutionalFloor: string | null; // % PBI
  mainSource: string;
  color: string; // hex color for visualization
  slug: string; // link to initiative detail page
  // Mission-centric fields
  missionSlug: MissionSlug;
  secondaryMissionSlug?: MissionSlug;
  temporalOrder: TemporalOrder;
  priority: InitiativePriority;
  state: InitiativeState;
}

export interface Dependency {
  id: string;
  source: string; // plan that DEPENDS (kind 'requires') | plan that PROVIDES (kind 'provides')
  target: string; // plan depended ON (kind 'requires') | plan provisto (kind 'provides')
  nature: DependencyNature;
  type: DependencyType;
  description: string;
  kind?: DependencyKind; // default: 'requires'
}

export interface TimelinePhase {
  planId: string;
  name: string;
  startYear: number;
  endYear: number;
}

export interface CriticalChain {
  id: string;
  name: string;
  description: string;
  plans: string[];
  dangerLevel: 'HIGH' | 'CRITICAL' | 'EXTREME';
}

// === PLAN NODES (22 mandatos) ===
// Convenciones:
// - `ordinal` = orden estratégico de lanzamiento (lo usa la UI). Los documentos
//   completos se auto-referencian por orden histórico de creación; ambos esquemas
//   coexisten a propósito.
// - `timelineYears: -1` = plan permanente/continuo; sus TIMELINE_PHASES describen
//   el arco de arranque, no un fin.
// - `budgetLow/High` = presupuesto del PLAN en USD millones (no el costo del
//   problema que ataca).

export const PLAN_NODES: PlanNode[] = [
  {
    id: 'PLANJUS', name: 'Plan Nacional de Justicia Popular', ordinal: 1,
    category: 'justicia', agency: 'ANJUS', agencyFull: 'Agencia Nacional de Justicia Popular',
    organMetaphor: 'sistema inmunológico', organLabel: 'Immune System',
    status: 'PUBLISHED', budgetLow: 3300, budgetHigh: 5700, timelineYears: 15,
    legalInstruments: 6, constitutionalFloor: '0.25-0.30% PBI',
    mainSource: 'Reasignación presupuesto judicial + tasas comerciales',
    color: '#f59e0b', slug: 'planjus-justicia-popular',
    missionSlug: 'instituciones-y-futuro', temporalOrder: 'transicion', priority: 'media', state: 'ambar',
  },
  {
    id: 'PLANREP', name: 'Plan Nacional de Reconversión del Empleo Público', ordinal: 2,
    category: 'economia', agency: 'ANREP', agencyFull: 'Agencia Nacional de Reconversión del Empleo Público',
    organMetaphor: 'metabolismo', organLabel: 'Metabolism',
    // 2200-4200 = inversión del plan según el doc (120 Centros + Centros de Inteligencia
    // + conectividad + track Inteligencia 5 años). El 15.000-25.000 anterior era el
    // costo ANUAL del problema (sobreempleo), no el presupuesto del plan.
    status: 'PUBLISHED', budgetLow: 2200, budgetHigh: 4200, timelineYears: 20,
    legalInstruments: 8, constitutionalFloor: null,
    mainSource: 'Presupuesto nacional + BIS + corporativo',
    color: '#10b981', slug: 'planrep-reconversion-empleo-publico',
    missionSlug: 'produccion-y-suelo-vivo', temporalOrder: 'transicion', priority: 'media', state: 'ambar',
  },
  {
    id: 'PLANEB', name: 'Plan Nacional de Empresas Bastardas', ordinal: 3,
    category: 'economia', agency: 'ANEB', agencyFull: 'Agencia Nacional de la Red Bastarda',
    organMetaphor: 'motor económico', organLabel: 'Economic Engine',
    status: 'PUBLISHED', budgetLow: 500, budgetHigh: 600, timelineYears: -1,
    legalInstruments: 1, constitutionalFloor: '0.10% PBI',
    mainSource: 'Capitalización ciudadana directa + piso constitucional',
    color: '#10b981', slug: 'planeb-empresas-bastardas',
    missionSlug: 'produccion-y-suelo-vivo', temporalOrder: 'transicion', priority: 'alta', state: 'verde',
  },
  {
    id: 'PLANMON', name: 'Plan Nacional de Soberanía Monetaria', ordinal: 4,
    category: 'economia', agency: 'ANMON', agencyFull: 'Agencia Nacional de Estabilidad Monetaria',
    organMetaphor: 'sistema circulatorio', organLabel: 'Circulatory System',
    status: 'PUBLISHED', budgetLow: 0, budgetHigh: 0, timelineYears: 15,
    legalInstruments: 5, constitutionalFloor: null,
    mainSource: 'Regalías energéticas + recaudación PLANSUS + comisiones de red',
    color: '#10b981', slug: 'planmon-soberania-monetaria',
    missionSlug: 'instituciones-y-futuro', temporalOrder: 'permanencia', priority: 'diferida', state: 'rojo',
  },
  {
    id: 'PLANDIG', name: 'Plan Nacional de Soberanía Digital', ordinal: 5,
    category: 'tecnologia', agency: 'ANDIG', agencyFull: 'Agencia Nacional de Infraestructura Digital y Soberanía Tecnológica',
    organMetaphor: 'sistema nervioso', organLabel: 'Nervous System',
    status: 'PUBLISHED', budgetLow: 4700, budgetHigh: 9900, timelineYears: 10,
    legalInstruments: 1, constitutionalFloor: '0.50-1.0% PBI',
    mainSource: 'Reasignación gasto cloud + presupuesto CyT + multilaterales',
    color: '#06b6d4', slug: 'plandig-soberania-digital',
    missionSlug: 'territorio-legible', temporalOrder: 'transicion', priority: 'alta', state: 'ambar',
  },
  {
    id: 'PLANSUS', name: 'Plan Nacional de Soberanía sobre Sustancias', ordinal: 6,
    category: 'salud', agency: 'ANSUS', agencyFull: 'Agencia Nacional de Soberanía sobre Sustancias',
    organMetaphor: 'conciencia', organLabel: 'Consciousness',
    status: 'PUBLISHED', budgetLow: 800, budgetHigh: 2200, timelineYears: 5,
    legalInstruments: 3, constitutionalFloor: '0.10% PBI',
    mainSource: 'Presupuesto nacional + activos decomisados + autofinanciamiento',
    color: '#f43f5e', slug: 'plansus-soberania-sustancias',
    missionSlug: 'instituciones-y-futuro', temporalOrder: 'transicion', priority: 'diferida', state: 'rojo',
  },
  {
    id: 'PLANEDU', name: 'Plan Nacional de Refundación Educativa', ordinal: 7,
    category: 'educacion', agency: 'ANCE', agencyFull: 'Agencia Nacional de Calidad Educativa',
    organMetaphor: 'sistema operativo', organLabel: 'Operating System',
    status: 'PUBLISHED', budgetLow: 80000, budgetHigh: 100000, timelineYears: 20,
    legalInstruments: 6, constitutionalFloor: '0.50% PBI',
    mainSource: 'Reasignación educativa + PLANREP ahorro (15%) + incremento PBI',
    color: '#3b82f6', slug: 'planedu-refundacion-educativa',
    missionSlug: 'infancia-escuela-cultura', temporalOrder: 'emergencia', priority: 'alta', state: 'verde',
  },
  {
    id: 'PLANSAL', name: 'Plan Nacional de Salud Integral y Vitalidad', ordinal: 8,
    category: 'salud', agency: 'ANVIP', agencyFull: 'Agencia Nacional de Vitalidad Popular',
    organMetaphor: 'signos vitales', organLabel: 'Vital Signs',
    // Inversión concentrada en los primeros 10 años; consolidación (años 11-15)
    // financiada por los ahorros generados.
    status: 'PUBLISHED', budgetLow: 6000, budgetHigh: 6000, timelineYears: 15,
    legalInstruments: 7, constitutionalFloor: '0.50-1.50% PBI',
    mainSource: 'Presupuesto nacional (% gasto salud) + reasignación',
    color: '#f43f5e', slug: 'plansal-salud-integral',
    missionSlug: 'la-base-esta', temporalOrder: 'emergencia', priority: 'alta', state: 'verde',
  },
  {
    id: 'PLANISV', name: 'Plan Nacional de Infraestructura de Suelo Vivo', ordinal: 9,
    category: 'medio-ambiente', agency: 'ENSV', agencyFull: 'Ente Nacional de Suelo Vivo',
    organMetaphor: 'cimiento', organLabel: 'Foundation',
    status: 'PUBLISHED', budgetLow: 1000, budgetHigh: 3000, timelineYears: 15,
    legalInstruments: 6, constitutionalFloor: '0.10% PBI',
    mainSource: 'Retenciones agropecuarias + financiamiento internacional + créditos de carbono',
    color: '#22c55e', slug: 'planisv-infraestructura-suelo-vivo',
    missionSlug: 'produccion-y-suelo-vivo', temporalOrder: 'transicion', priority: 'alta', state: 'verde',
  },
  {
    id: 'PLANAGUA', name: 'Plan Nacional de Soberanía Hídrica', ordinal: 10,
    category: 'medio-ambiente', agency: 'ANAGUA', agencyFull: 'Agencia Nacional del Agua y Resiliencia Climática',
    organMetaphor: 'hidratación', organLabel: 'Hydration',
    status: 'PUBLISHED', budgetLow: 15000, budgetHigh: 25000, timelineYears: 10,
    legalInstruments: 8, constitutionalFloor: '0.15% PBI',
    mainSource: 'Piso constitucional + créditos hídricos + financiamiento climático',
    color: '#22c55e', slug: 'planagua-soberania-hidrica',
    missionSlug: 'la-base-esta', temporalOrder: 'emergencia', priority: 'alta', state: 'verde',
  },
  {
    id: 'PLAN24CN', name: 'Plan Nacional de 24 Ciudades Nuevas', ordinal: 11,
    category: 'infraestructura', agency: 'CNDU', agencyFull: 'Corporación Nacional de Desarrollo Urbano',
    organMetaphor: 'cuerpo', organLabel: 'Body',
    status: 'PUBLISHED', budgetLow: 26350, budgetHigh: 73000, timelineYears: 20,
    legalInstruments: 5, constitutionalFloor: null,
    mainSource: 'FGS + presupuesto nacional + bonos de ciudad + valorización de suelo',
    color: '#64748b', slug: 'plan24cn-24-ciudades-nuevas',
    missionSlug: 'produccion-y-suelo-vivo', secondaryMissionSlug: 'infancia-escuela-cultura', temporalOrder: 'permanencia', priority: 'diferida', state: 'rojo',
  },
  {
    id: 'PLANGEO', name: 'Plan Nacional de Posicionamiento Geopolítico', ordinal: 12,
    category: 'geopolitica', agency: 'CNEG', agencyFull: 'Consejo Nacional de Estrategia Geopolítica',
    organMetaphor: 'escudo', organLabel: 'Shield',
    status: 'PUBLISHED', budgetLow: 14200, budgetHigh: 14200, timelineYears: 15,
    legalInstruments: 1, constitutionalFloor: null,
    mainSource: 'Presupuesto nacional + YPF + bonos soberanos + inversión mixta',
    color: '#0ea5e9', slug: 'plangeo-posicionamiento-geopolitico',
    missionSlug: 'instituciones-y-futuro', secondaryMissionSlug: 'produccion-y-suelo-vivo', temporalOrder: 'transicion', priority: 'media', state: 'ambar',
  },
  {
    id: 'PLANEN', name: 'Plan Nacional de Soberanía Energética', ordinal: 13,
    category: 'infraestructura', agency: 'ANEN', agencyFull: 'Agencia Nacional de Energía y Transición de Matriz',
    organMetaphor: 'energía', organLabel: 'Energy',
    status: 'PUBLISHED', budgetLow: 45000, budgetHigh: 76000, timelineYears: 15,
    // 0,70% = ANEN 0,50% (PLANEN:1471) + LANEF 0,20% de I+D (PLANEN:791, :1489).
    // Van sumados en un solo valor: el parser lee dos números como rango bajo-alto.
    legalInstruments: 1, constitutionalFloor: '0.70% PBI',
    mainSource: 'Inversión privada condicionada (35%) + multilaterales + reasignación subsidios',
    color: '#64748b', slug: 'planen-soberania-energetica',
    missionSlug: 'la-base-esta', secondaryMissionSlug: 'produccion-y-suelo-vivo', temporalOrder: 'transicion', priority: 'media', state: 'ambar',
  },
  {
    id: 'PLANSEG', name: 'Plan Nacional de Seguridad Ciudadana', ordinal: 14,
    category: 'instituciones', agency: 'ANSEG', agencyFull: 'Agencia Nacional de Seguridad Ciudadana',
    organMetaphor: 'guardián', organLabel: 'Guardian',
    status: 'PUBLISHED', budgetLow: 3000, budgetHigh: 6000, timelineYears: 15,
    // 1,50% es el piso que declara PLANSEG:1052. El costo fiscal NUEVO neto es
    // 0,05-0,10% porque el resto es reasignación de gasto que ya se ejecuta
    // (PRESUPUESTO_CONSOLIDADO_BASTA.md nota 3). El campo guarda el bruto: es la
    // obligación legal. El neto se discute en el consolidado, no acá.
    legalInstruments: 1, constitutionalFloor: '1.50% PBI',
    mainSource: 'Reasignación gasto seguridad (60%) + presupuesto nacional + multilaterales',
    color: '#6366f1', slug: 'planseg-seguridad-ciudadana',
    missionSlug: 'la-base-esta', secondaryMissionSlug: 'instituciones-y-futuro', temporalOrder: 'emergencia', priority: 'alta', state: 'ambar',
  },
  {
    id: 'PLANVIV', name: 'Plan Nacional de Vivienda Digna', ordinal: 15,
    category: 'infraestructura', agency: 'ANVIV', agencyFull: 'Agencia Nacional de Vivienda y Hábitat',
    organMetaphor: 'refugio', organLabel: 'Shelter',
    status: 'PUBLISHED', budgetLow: 80000, budgetHigh: 120000, timelineYears: 15,
    legalInstruments: 2, constitutionalFloor: '2.00% PBI',
    mainSource: 'Autofinanciamiento repagos (40%) + inversión privada (25%) + presupuesto (20%)',
    color: '#64748b', slug: 'planviv-vivienda-digna',
    missionSlug: 'la-base-esta', temporalOrder: 'emergencia', priority: 'alta', state: 'verde',
  },
  {
    id: 'PLANCUL', name: 'Plan Nacional de Cultura Viva', ordinal: 16,
    category: 'cultura', agency: null, agencyFull: null,
    organMetaphor: 'alma', organLabel: 'Soul',
    status: 'PUBLISHED', budgetLow: 0, budgetHigh: 0, timelineYears: -1,
    legalInstruments: 0, constitutionalFloor: null,
    mainSource: 'Autofinanciamiento comunitario — sin presupuesto estatal por diseño',
    color: '#a855f7', slug: 'plancul-cultura-viva',
    missionSlug: 'infancia-escuela-cultura', temporalOrder: 'emergencia', priority: 'alta', state: 'verde',
  },
  {
    id: 'PLANMESA', name: 'Plan Nacional de Mesa Civil', ordinal: 17,
    category: 'instituciones', agency: 'AMCC', agencyFull: 'Agencia de Mesa y Cédula Civil',
    organMetaphor: 'corteza deliberativa', organLabel: 'Deliberative Cortex',
    status: 'PUBLISHED', budgetLow: 4200, budgetHigh: 6800, timelineYears: 15,
    legalInstruments: 3, constitutionalFloor: '0.07% PBI',
    mainSource: 'Piso constitucional + dietas de servicio + presupuesto nacional',
    color: '#8b5cf6', slug: 'planmesa-mesa-civil',
    missionSlug: 'instituciones-y-futuro', temporalOrder: 'transicion', priority: 'alta', state: 'verde',
  },
  {
    id: 'PLANTALLER', name: 'Plan Nacional de Talleres Federales', ordinal: 18,
    category: 'economia', agency: 'ANT', agencyFull: 'Agencia Nacional de Talleres',
    organMetaphor: 'manos', organLabel: 'Hands',
    status: 'PUBLISHED', budgetLow: 3600, budgetHigh: 6000, timelineYears: 15,
    legalInstruments: 2, constitutionalFloor: '0.10% PBI', // PLANTALLER:607
    mainSource: 'Reasignación programas empleo + convenio galpones públicos + Red Bastarda',
    color: '#f97316', slug: 'plantaller-talleres-federales',
    missionSlug: 'produccion-y-suelo-vivo', temporalOrder: 'transicion', priority: 'alta', state: 'verde',
  },
  {
    id: 'PLANCUIDADO', name: 'Plan Nacional de Cuidado y Vínculo', ordinal: 19,
    category: 'salud', agency: 'ANCV', agencyFull: 'Agencia Nacional de Cuidado y Vínculo',
    organMetaphor: 'capa cero', organLabel: 'Zero Layer',
    status: 'PUBLISHED', budgetLow: 30000, budgetHigh: 45000, timelineYears: 15,
    // 0,45% es el piso (PLANCUIDADO:515, :591). El 0,75-1,1% que estaba acá es la
    // inversión estimada de régimen pleno de la tesis: otro número, otro campo.
    legalInstruments: 5, constitutionalFloor: '0.45% PBI',
    mainSource: 'Piso constitucional + Fondo Federal de Cuidado + jornada 6+2 a empleadores',
    color: '#ec4899', slug: 'plancuidado-cuidado-vinculo',
    missionSlug: 'la-base-esta', secondaryMissionSlug: 'infancia-escuela-cultura', temporalOrder: 'transicion', priority: 'alta', state: 'verde',
  },
  {
    id: 'PLANMEMORIA', name: 'Plan Nacional de Memoria Operativa', ordinal: 20,
    category: 'cultura', agency: 'ANM', agencyFull: 'Agencia Nacional de Memoria',
    organMetaphor: 'columna memorial', organLabel: 'Memorial Spine',
    status: 'PUBLISHED', budgetLow: 6800, budgetHigh: 9200, timelineYears: 15,
    legalInstruments: 2, constitutionalFloor: '0.10-0.14% PBI',
    mainSource: 'Piso constitucional + convenios universidades + Archivo General de la Nación',
    color: '#a78bfa', slug: 'planmemoria-memoria-operativa',
    missionSlug: 'instituciones-y-futuro', secondaryMissionSlug: 'infancia-escuela-cultura', temporalOrder: 'transicion', priority: 'alta', state: 'verde',
  },
  {
    id: 'PLANTER', name: 'Plan Nacional de Tierra, Subsuelo y Pueblos Originarios', ordinal: 21,
    category: 'medio-ambiente', agency: 'ANTSPO', agencyFull: 'Agencia Nacional de Tierra, Subsuelo y Pueblos Originarios',
    organMetaphor: 'raíz territorial', organLabel: 'Territorial Root',
    status: 'PUBLISHED', budgetLow: 18000, budgetHigh: 28000, timelineYears: 15,
    legalInstruments: 6, constitutionalFloor: '0.20% PBI',
    mainSource: 'Fondo Soberano Ciudadano (regalías extractivas) — autofinancia + genera dividendo',
    color: '#84cc16', slug: 'planter-tierra-subsuelo-soberania',
    missionSlug: 'la-base-esta', secondaryMissionSlug: 'instituciones-y-futuro', temporalOrder: 'transicion', priority: 'alta', state: 'ambar',
  },
  {
    id: 'PLANMOV', name: 'Plan Nacional de Movilidad, Logística y Conectividad Territorial (v2.0)', ordinal: 22,
    category: 'infraestructura', agency: 'ANMov', agencyFull: 'Agencia Nacional de Movilidad',
    organMetaphor: 'arterias', organLabel: 'Arteries',
    status: 'PUBLISHED', budgetLow: 80000, budgetHigh: 104000, timelineYears: 20,
    legalInstruments: 9, constitutionalFloor: '0.50% PBI',
    mainSource: 'Presupuesto nacional + multilaterales (BID/CAF/BM) + BAMD + BLF + peaje fluvial + Canon de Automatización Logística',
    color: '#0891b2', slug: 'planmov-movilidad-logistica',
    missionSlug: 'la-base-esta', secondaryMissionSlug: 'produccion-y-suelo-vivo', temporalOrder: 'transicion', priority: 'alta', state: 'ambar',
  },

  // ── Los cuatro PLANes nuevos (acta del 2026-07-26, escritos 2026-07/08). ──────
  // Se ANEXAN con ordinales 23-26: los 01..22 no se mueven y el invariante de
  // contigüidad se conserva. Sus aristas se cargaron el 2026-08-02 y viven en el
  // bloque d146-d211, con sus fases en TIMELINE_PHASES.
  {
    id: 'PLANPACTO', name: 'Plan Nacional de Pacto Fiscal, Reparto Federal y Escalera de Garantías', ordinal: 23,
    category: 'economia', agency: 'CFF', agencyFull: 'Consejo Federal Fiscal',
    organMetaphor: 'riñón', organLabel: 'Kidney',
    status: 'PUBLISHED', budgetLow: 12400, budgetHigh: 22000, timelineYears: 15,
    // El único piso del ecosistema después de este PLAN: 2,40% del PBI, expresado
    // como 7,5% del gasto primario consolidado. Es bruto y SUSTITUTIVO de los 17
    // pisos anteriores — no se suma a ellos.
    legalInstruments: 6, constitutionalFloor: '2.40% PBI',
    mainSource: 'No tiene fuente propia: administra la presión fiscal consolidada (USD 145.000-160.000M/año) y reparte por la Escalera de Garantías',
    color: '#14b8a6', slug: 'planpacto-pacto-fiscal-reparto-federal',
    missionSlug: 'instituciones-y-futuro', temporalOrder: 'transicion', priority: 'alta', state: 'ambar',
  },
  {
    id: 'PLANARCO', name: 'Plan Nacional del Arco de la Vida, Calendario de Umbrales y Renta de Arco', ordinal: 24,
    category: 'instituciones', agency: 'ANAV', agencyFull: 'Agencia Nacional del Arco de la Vida',
    organMetaphor: 'sistema endocrino', organLabel: 'Endocrine System',
    status: 'PUBLISHED', budgetLow: 53000, budgetHigh: 96000, timelineYears: 15,
    // Sin piso propio: entra como eje intergeneracional DENTRO de la Escalera de
    // PLANPACTO. Dos reglas de reparto paralelas se contradicen en la primera recesión.
    legalInstruments: 7, constitutionalFloor: null,
    mainSource: 'Sistema previsional (~45% del presupuesto nacional) + FGS con tope del 8% para PLAN24CN + Dote',
    color: '#a855f7', slug: 'planarco-arco-de-la-vida',
    missionSlug: 'instituciones-y-futuro', secondaryMissionSlug: 'la-base-esta', temporalOrder: 'transicion', priority: 'alta', state: 'ambar',
  },
  {
    id: 'PLANPREGUNTA', name: 'Plan Nacional de la Pregunta, el Censo de Ignorancia y la Prueba de Barro', ordinal: 25,
    category: 'tecnologia', agency: 'ANCON', agencyFull: 'Agencia Nacional del Conocimiento',
    organMetaphor: 'células madre', organLabel: 'Stem Cells',
    status: 'PUBLISHED', budgetLow: 16500, budgetHigh: 26000, timelineYears: 15,
    // Sin piso propio y sin reclamo sobre el 0,39% legal de CyT (que es de PLANDIG)
    // ni sobre el 0,20% de I+D del LANEF (que es de PLANEN).
    legalInstruments: 4, constitutionalFloor: null,
    mainSource: 'Ocho puntos del Fondo Soberano Ciudadano de PLANTER (Fondo de la Pregunta), tomados del Fondo Intergeneracional',
    color: '#22c55e', slug: 'planpregunta-pregunta-censo-ignorancia',
    missionSlug: 'instituciones-y-futuro', secondaryMissionSlug: 'produccion-y-suelo-vivo', temporalOrder: 'transicion', priority: 'media', state: 'ambar',
  },
  {
    id: 'PLANFOCO', name: 'Plan Nacional de la Palabra Pública, la Biblioteca Viva y el Acervo Común', ordinal: 26,
    category: 'cultura', agency: 'ANBAC', agencyFull: 'Agencia Nacional de la Biblioteca y el Acervo Común',
    organMetaphor: 'la mirada', organLabel: 'The Gaze',
    status: 'PUBLISHED', budgetLow: 3540, budgetHigh: 5400, timelineYears: 15,
    // Sin piso: diferido a Visión 2040+. Su techo lo fija la fuente que extingue —
    // la publicidad oficial consolidada, USD 450M/año.
    legalInstruments: 3, constitutionalFloor: null,
    mainSource: 'Extinción de la publicidad oficial consolidada (USD 450M/año) en cinco años; el remanente vuelve a la Fuente 1 del ecosistema',
    color: '#eab308', slug: 'planfoco-palabra-publica-biblioteca-viva',
    missionSlug: 'infancia-escuela-cultura', secondaryMissionSlug: 'instituciones-y-futuro', temporalOrder: 'transicion', priority: 'media', state: 'ambar',
  },
];

// === DEPENDENCIES ===
// d01-d76:   aristas 'requires' (source depende de target) — 73 relaciones reales.
// d77-d145:  anotaciones 'provides' (espejo proveedor→consumidor) — solo lectura UI.
// d146-d211: los cuatro PLANes nuevos (ordinales 23-26), las dos clases juntas.
//            Ese bloque no sigue la partición de arriba a propósito: entró de una
//            vez y sus dos mitades se leen juntas. Su cabecera explica por qué.
// Las simulaciones de falla, grados y reglas de resiliencia usan SOLO 'requires'.

export const DEPENDENCIES: Dependency[] = [
  // PLANDIG as nervous system (9 dependents)
  { id: 'd01', source: 'PLANMON', target: 'PLANDIG', nature: 'CRITICAL', type: 'TECHNICAL', description: 'SAPI payment rails — backbone del Pulso' },
  { id: 'd02', source: 'PLANEB', target: 'PLANDIG', nature: 'CRITICAL', type: 'TECHNICAL', description: 'Protocolo Bastardo requiere infraestructura digital soberana' },
  { id: 'd03', source: 'PLAN24CN', target: 'PLANDIG', nature: 'CRITICAL', type: 'TECHNICAL', description: 'Ciudades inteligentes necesitan IDS + SAPI + El Mapa' },
  { id: 'd04', source: 'PLANAGUA', target: 'PLANDIG', nature: 'CRITICAL', type: 'DATA', description: 'Red IoT y Gemelo Digital del Agua sobre nodos soberanos' },
  { id: 'd05', source: 'PLANJUS', target: 'PLANDIG', nature: 'IMPORTANT', type: 'TECHNICAL', description: 'Plataforma digital de resolución y modelo IA legal' },
  { id: 'd06', source: 'PLANSEG', target: 'PLANDIG', nature: 'IMPORTANT', type: 'TECHNICAL', description: 'Body cams, video IA, sensores urbanos sobre infra soberana' },
  { id: 'd07', source: 'PLANVIV', target: 'PLANDIG', nature: 'IMPORTANT', type: 'TECHNICAL', description: 'Housing OS y títulos digitales de propiedad' },
  { id: 'd08', source: 'PLANEN', target: 'PLANDIG', nature: 'IMPORTANT', type: 'TECHNICAL', description: 'Smart grid IoT y Tablero Nacional de Energía' },
  { id: 'd09', source: 'PLANEDU', target: 'PLANDIG', nature: 'IMPORTANT', type: 'TECHNICAL', description: 'Plataforma de Aprendizaje Adaptativo (PAA)' },

  // PLANJUS as immune system
  { id: 'd10', source: 'PLANEB', target: 'PLANJUS', nature: 'CRITICAL', type: 'INSTITUTIONAL', description: 'Resolución de disputas de usuarios de cada Bastarda' },
  { id: 'd11', source: 'PLANMON', target: 'PLANJUS', nature: 'CRITICAL', type: 'INSTITUTIONAL', description: 'Disputas financieras y enforcement on-chain' },
  { id: 'd12', source: 'PLANSUS', target: 'PLANJUS', nature: 'IMPORTANT', type: 'INSTITUTIONAL', description: 'Conflictos de licencias y zonificación de sustancias' },
  { id: 'd13', source: 'PLANVIV', target: 'PLANJUS', nature: 'IMPORTANT', type: 'INSTITUTIONAL', description: 'Disputas de propiedad, derechos de inquilinos' },

  // PLANMON ↔ PLANEB bridge
  { id: 'd14', source: 'PLANMON', target: 'PLANEB', nature: 'CRITICAL', type: 'FINANCIAL', description: 'Bastarda Financiera es nodo ancla del Pulso' },
  { id: 'd15', source: 'PLANEB', target: 'PLANMON', nature: 'IMPORTANT', type: 'FINANCIAL', description: 'Red Bastarda provee infraestructura anti-inflacionaria al costo' },

  // PLANSEG ↔ PLANSUS (most dangerous)
  { id: 'd16', source: 'PLANSUS', target: 'PLANSEG', nature: 'CRITICAL', type: 'TEMPORAL', description: 'PLANSEG debe tener 250+ EB operativas 12 meses ANTES de legalización' },
  { id: 'd17', source: 'PLANSUS', target: 'PLANSEG', nature: 'CRITICAL', type: 'INSTITUTIONAL', description: 'Protocolo de transición narco sincronizado GREEN/YELLOW/RED' },

  // PLANEN
  { id: 'd18', source: 'PLAN24CN', target: 'PLANEN', nature: 'CRITICAL', type: 'TECHNICAL', description: 'Bastarda Energética antes de que la primera ciudad reciba residentes' },
  { id: 'd19', source: 'PLANMON', target: 'PLANEN', nature: 'CRITICAL', type: 'FINANCIAL', description: 'Regalías energéticas (USD 800M-3500M+/año) capitalizan Fondo Soberano' },

  // PLANREP as fiscal engine
  { id: 'd20', source: 'PLANEDU', target: 'PLANREP', nature: 'CRITICAL', type: 'FINANCIAL', description: '15% del ahorro neto de PLANREP financia educación' },
  { id: 'd21', source: 'PLANVIV', target: 'PLANREP', nature: 'IMPORTANT', type: 'LABOR', description: 'Artesanos del Refugio construyen y retrofitean viviendas' },
  { id: 'd22', source: 'PLANSEG', target: 'PLANREP', nature: 'IMPORTANT', type: 'LABOR', description: 'Oficiales de enforcement reconvertidos a seguridad comunitaria' },
  { id: 'd23', source: 'PLANEDU', target: 'PLANREP', nature: 'IMPORTANT', type: 'LABOR', description: 'Graduados PLANREP se convierten en Maestros de Oficio' },

  // PLAN24CN dependencies
  { id: 'd24', source: 'PLAN24CN', target: 'PLANISV', nature: 'CRITICAL', type: 'TECHNICAL', description: 'Suelo regenerado para agricultura urbana e infraestructura verde' },
  { id: 'd25', source: 'PLAN24CN', target: 'PLANAGUA', nature: 'IMPORTANT', type: 'TECHNICAL', description: 'Infraestructura hídrica para ciudades en construcción (necesaria cuando llegan residentes, no en fase de diseño)' },
  { id: 'd26', source: 'PLAN24CN', target: 'PLANEB', nature: 'CRITICAL', type: 'INSTITUTIONAL', description: 'Ciudades nacen Bastarda-nativas: todos los servicios al costo' },

  // PLANVIV transversal
  { id: 'd27', source: 'PLANVIV', target: 'PLANMON', nature: 'IMPORTANT', type: 'FINANCIAL', description: 'Crédito Hipotecario Bastardo denominado en peso-canasta (necesario en Fase 1, no en pre-fase de censo)' },
  { id: 'd28', source: 'PLANVIV', target: 'PLANEB', nature: 'IMPORTANT', type: 'INSTITUTIONAL', description: 'Bastarda Inmobiliaria usa Protocolo Bastardo para fideicomiso perpetuo (ambos lanzan Año 0)' },
  { id: 'd29', source: 'PLANVIV', target: 'PLANAGUA', nature: 'IMPORTANT', type: 'TECHNICAL', description: '1800 urbanizaciones necesitan co-ejecución hídrica con ANAGUA' },
  { id: 'd30', source: 'PLANVIV', target: 'PLANSEG', nature: 'IMPORTANT', type: 'INSTITUTIONAL', description: 'CPTED (prevención por diseño ambiental) en urbanizaciones' },

  // PLANGEO exports
  { id: 'd31', source: 'PLANGEO', target: 'PLANDIG', nature: 'IMPORTANT', type: 'INSTITUTIONAL', description: 'ArgenCloud como producto exportable para Red Soberana' },
  { id: 'd32', source: 'PLANGEO', target: 'PLANSUS', nature: 'IMPORTANT', type: 'LEGAL', description: 'Cascada diplomática para denuncia de convenciones de drogas' },
  { id: 'd33', source: 'PLANGEO', target: 'PLANMON', nature: 'IMPORTANT', type: 'INSTITUTIONAL', description: 'Peso-canasta regional para comercio Mercosur' },
  { id: 'd34', source: 'PLANGEO', target: 'PLANEB', nature: 'IMPORTANT', type: 'INSTITUTIONAL', description: 'Protocolo Bastardo como estándar internacional open-source' },

  // PLANCUL parasitic dependencies
  { id: 'd35', source: 'PLANCUL', target: 'PLAN24CN', nature: 'IMPORTANT', type: 'INSTITUTIONAL', description: 'Ciudades nuevas proveen comunidades vírgenes donde Dendritas son nativas' },
  { id: 'd36', source: 'PLANCUL', target: 'PLANREP', nature: 'IMPORTANT', type: 'INSTITUTIONAL', description: 'Centros de la Vida son puntos de reunión donde la comunidad se forma' },
  { id: 'd37', source: 'PLANCUL', target: 'PLANEDU', nature: 'IMPORTANT', type: 'INSTITUTIONAL', description: 'Escuelas enseñan Rondas de Escucha; niños son Dendritas nativas' },
  { id: 'd38', source: 'PLANCUL', target: 'PLANVIV', nature: 'IMPORTANT', type: 'INSTITUTIONAL', description: 'Barrios urbanizados proveen tejido social para reconstrucción cultural' },

  // Cross-cutting data flows
  { id: 'd39', source: 'PLANISV', target: 'PLANMON', nature: 'IMPORTANT', type: 'DATA', description: 'Datos de producción agrícola alimentan canasta del peso-canasta' },
  { id: 'd40', source: 'PLANSUS', target: 'PLANMON', nature: 'IMPORTANT', type: 'FINANCIAL', description: 'Recaudación fiscal de sustancias capitaliza Fondo Soberano' },
  { id: 'd41', source: 'PLANSAL', target: 'PLANSUS', nature: 'IMPORTANT', type: 'INSTITUTIONAL', description: 'Sustancias como herramienta terapéutica; psicodélicos para salud mental' },

  // PLANMESA (Mesa Civil) — capa deliberativa que alimenta todos los mandatos
  { id: 'd42', source: 'PLANMESA', target: 'PLANDIG', nature: 'CRITICAL', type: 'TECHNICAL', description: 'Plataforma técnica para auto-postulación, Credencial de Materia y Cédula Civil' },
  { id: 'd43', source: 'PLANMESA', target: 'PLANEDU', nature: 'CRITICAL', type: 'INSTITUTIONAL', description: 'A partir de Fase 1: Capa de Estudio de la Credencial se construye en PLANEDU (Fase 0 de PLANMESA es arranque técnico autónomo)' },
  { id: 'd44', source: 'PLANMESA', target: 'PLANMEMORIA', nature: 'CRITICAL', type: 'INSTITUTIONAL', description: 'Consulta Ancestral obligatoria en Fase APRENDER de cada ciclo LDEA' },
  { id: 'd45', source: 'PLANMESA', target: 'PLANTALLER', nature: 'CRITICAL', type: 'INSTITUTIONAL', description: 'Tallers son ejecutores de Fase EXPERIMENTAR del ciclo LDEA' },
  { id: 'd46', source: 'PLANMESA', target: 'PLANCUIDADO', nature: 'IMPORTANT', type: 'INSTITUTIONAL', description: 'Capa de Vínculo de Credencial; sostén relacional del servidor de Mesa' },
  { id: 'd47', source: 'PLANMESA', target: 'PLANJUS', nature: 'IMPORTANT', type: 'INSTITUTIONAL', description: 'Control legal de Resoluciones y disputas sobre auto-postulación' },

  // PLANTALLER — infraestructura productiva federal
  { id: 'd48', source: 'PLANTALLER', target: 'PLANEB', nature: 'CRITICAL', type: 'INSTITUTIONAL', description: 'Red Bastarda es canal de salida at-cost de producción de Tallers' },
  { id: 'd49', source: 'PLANTALLER', target: 'PLANDIG', nature: 'IMPORTANT', type: 'TECHNICAL', description: 'Protocolo Taller como plataforma federada de inventario y hallazgos' },
  { id: 'd50', source: 'PLANTALLER', target: 'PLANREP', nature: 'IMPORTANT', type: 'LABOR', description: 'Reconversión del empleo público hacia coordinación y mentoría de Tallers' },

  // PLANCUIDADO — capa cero del pacto
  { id: 'd51', source: 'PLANCUIDADO', target: 'PLANSAL', nature: 'CRITICAL', type: 'INSTITUTIONAL', description: 'A partir de Fase 1: APS territorial integra Pactos como dato clínico; articula con Referentes (Fase 0 de PLANCUIDADO es Ley ANCV + piloto registral)' },
  { id: 'd52', source: 'PLANCUIDADO', target: 'PLANREP', nature: 'CRITICAL', type: 'LABOR', description: 'Reconversión de cuidadoras domiciliarias a Referentes Territoriales formales' },
  { id: 'd53', source: 'PLANCUIDADO', target: 'PLANEDU', nature: 'IMPORTANT', type: 'INSTITUTIONAL', description: 'Formación inicial de cada tipo de Pacto; currículum de cuidado desde primaria' },
  { id: 'd54', source: 'PLANCUIDADO', target: 'PLANJUS', nature: 'IMPORTANT', type: 'INSTITUTIONAL', description: 'Mediación de disputas de Pactos en primera instancia no-jurisdiccional' },
  { id: 'd55', source: 'PLANCUIDADO', target: 'PLANDIG', nature: 'IMPORTANT', type: 'TECHNICAL', description: 'Registro Nacional de Vínculos, Libro de Cuidado y Alerta de Soledad Total' },

  // PLANMEMORIA — archivo distribuido y Consulta Ancestral
  { id: 'd56', source: 'PLANMEMORIA', target: 'PLANDIG', nature: 'CRITICAL', type: 'TECHNICAL', description: 'Red federada criptográfica: 7 nodos con hash, resistente a borrado' },
  { id: 'd57', source: 'PLANMEMORIA', target: 'PLANEDU', nature: 'CRITICAL', type: 'INSTITUTIONAL', description: 'A partir de Fase 1: Bastón Memorial a los 12 años como rito cívico en la escuela (Fase 0 de PLANMEMORIA es arranque del archivo federado de 7 nodos)' },
  { id: 'd58', source: 'PLANMEMORIA', target: 'PLANJUS', nature: 'IMPORTANT', type: 'INSTITUTIONAL', description: 'Inscripción de Captura coopera con investigaciones sin reemplazarlas' },

  // PLANTER — soberanía territorial, FSC y co-soberanía indígena
  { id: 'd59', source: 'PLANTER', target: 'PLANSEG', nature: 'CRITICAL', type: 'INSTITUTIONAL', description: 'Protección de defensores territoriales y Guardacostas ampliada' },
  { id: 'd60', source: 'PLANTER', target: 'PLANJUS', nature: 'CRITICAL', type: 'INSTITUTIONAL', description: 'Co-jurisdicción con derecho originario; disputas territoriales' },
  { id: 'd61', source: 'PLANTER', target: 'PLANDIG', nature: 'CRITICAL', type: 'TECHNICAL', description: 'Monitoreo satelital + registro ciudadano + dashboard del Dividendo' },
  { id: 'd62', source: 'PLANTER', target: 'PLANCUIDADO', nature: 'IMPORTANT', type: 'INSTITUTIONAL', description: 'Pactos Interculturales reconocen parentescos originarios' },
  { id: 'd63', source: 'PLANTER', target: 'PLANMEMORIA', nature: 'IMPORTANT', type: 'DATA', description: 'Archivo Territorial con depósitos de comunidades originarias' },
  { id: 'd64', source: 'PLANMON', target: 'PLANTER', nature: 'IMPORTANT', type: 'FINANCIAL', description: 'Fondo Soberano Ciudadano es palanca macro de la soberanía monetaria' },
  { id: 'd65', source: 'PLANEN', target: 'PLANTER', nature: 'IMPORTANT', type: 'LEGAL', description: 'Licencia Territorial reemplaza RIGI para proyectos de hidrocarburos y minería' },

  // PLANMOV — movilidad y logística federal (v1 + v2.0 fusionadas para eliminar duplicados)
  // NOTA: d66/d67/d68 fueron fusionadas con d72/d73/d74 — las descripciones absorben ambos alcances.
  { id: 'd69', source: 'PLANMOV', target: 'PLANMESA', nature: 'IMPORTANT', type: 'INSTITUTIONAL', description: 'Mesas Civiles de Corredor deciden priorización de reactivación ferroviaria' },
  { id: 'd70', source: 'PLANMOV', target: 'PLANMEMORIA', nature: 'IMPORTANT', type: 'DATA', description: 'Archivo Técnico Ferroviario con depósitos de ex-ferroviarios tipo Héctor' },
  { id: 'd71', source: 'PLANMOV', target: 'PLANEN', nature: 'IMPORTANT', type: 'TECHNICAL', description: 'Rieles como columna múltiple: tendido eléctrico y fibra sobre misma traza; electrificación masiva de red ferroviaria reactivada' },
  { id: 'd72', source: 'PLANMOV', target: 'PLANDIG', nature: 'CRITICAL', type: 'TECHNICAL', description: 'Plataforma técnica para gestión de MKC, BLF y Red Federal de Puertos; LNMA (Laboratorio Nacional de Movilidad Autónoma) se monta sobre LANIA como capa vertical con data-logging obligatorio en ArgenCloud' },
  { id: 'd73', source: 'PLANMOV', target: 'PLANREP', nature: 'CRITICAL', type: 'LABOR', description: 'Reconversión de cuadros técnicos ferroviarios y portuarios + Ruta "Reconversión Móvil" que absorbe 500.000 transportistas desplazados por automatización (PPM financiada por FRM)' },
  { id: 'd74', source: 'PLANMOV', target: 'PLANEB', nature: 'CRITICAL', type: 'INSTITUTIONAL', description: 'Bastarda Logística Federal y Bastarda Fluvial como canales at-cost + BAMD (Bastarda de Activos Móviles Disponibles) como forma bastarda piloto; Canon de Automatización Logística replicable a otros sectores' },

  // Conexiones nuevas para resolver aislamiento (V-REF-04)
  { id: 'd75', source: 'PLANSAL', target: 'PLANDIG', nature: 'CRITICAL', type: 'TECHNICAL', description: 'Historia Clínica Unificada, telemedicina rural y Registro de Salud Integral sobre infraestructura digital soberana' },
  { id: 'd76', source: 'PLANISV', target: 'PLANTER', nature: 'IMPORTANT', type: 'INSTITUTIONAL', description: 'Plan Suelo Vivo se coordina con Licencia Territorial y co-soberanía indígena en tierras fiscales y comunidades originarias' },

  // ============================================================================
  // === DEPENDENCIAS INVERSAS (d77–d145) — lado "aporta" de cada vínculo.      ===
  // === Cada inversa se lee desde la perspectiva del proveedor y cierra la     ===
  // === reciprocidad ecosistémica (satisface V-REF-01). El único par ya       ===
  // === balanceado en v1 era PLANMON↔PLANEB (d14/d15); el resto se completa.  ===
  // ============================================================================

  // Inversas de PLANDIG (sistema nervioso) → consumidores
  { id: 'd77', kind: 'provides', source: 'PLANDIG', target: 'PLANMON', nature: 'CRITICAL', type: 'TECHNICAL', description: 'IDS provee los nodos soberanos sobre los cuales corren los rieles SAPI y el registro del Pulso monetario' },
  { id: 'd78', kind: 'provides', source: 'PLANDIG', target: 'PLANEB', nature: 'CRITICAL', type: 'TECHNICAL', description: 'IDS provee el substrato on-chain y los servicios federados que el Protocolo Bastardo necesita para operar sin dependencias extranjeras' },
  { id: 'd79', kind: 'provides', source: 'PLANDIG', target: 'PLAN24CN', nature: 'CRITICAL', type: 'TECHNICAL', description: 'IDS + SAPI + El Mapa proveen la capa operativa de las ciudades inteligentes antes de que reciban residentes' },
  { id: 'd80', kind: 'provides', source: 'PLANDIG', target: 'PLANAGUA', nature: 'CRITICAL', type: 'DATA', description: 'ArgenCloud y la Red IoT soberana alojan el Gemelo Digital del Agua y la telemetría de cuencas' },
  { id: 'd81', kind: 'provides', source: 'PLANDIG', target: 'PLANJUS', nature: 'IMPORTANT', type: 'TECHNICAL', description: 'LANIA y la plataforma de Resolución Popular proveen el modelo IA legal y la traza digital de disputas' },
  { id: 'd82', kind: 'provides', source: 'PLANDIG', target: 'PLANSEG', nature: 'IMPORTANT', type: 'TECHNICAL', description: 'Red soberana provee cadena de custodia criptográfica a body cams, video IA y sensores urbanos' },
  { id: 'd83', kind: 'provides', source: 'PLANDIG', target: 'PLANVIV', nature: 'IMPORTANT', type: 'TECHNICAL', description: 'Housing OS y el registro digital de títulos de propiedad corren sobre nodos IDS con firma criptográfica soberana' },
  { id: 'd84', kind: 'provides', source: 'PLANDIG', target: 'PLANEN', nature: 'IMPORTANT', type: 'TECHNICAL', description: 'IDS provee Smart Grid IoT y Tablero Nacional de Energía con telemetría en tiempo real sobre nodos federados' },
  { id: 'd85', kind: 'provides', source: 'PLANDIG', target: 'PLANEDU', nature: 'IMPORTANT', type: 'TECHNICAL', description: 'Plataforma de Aprendizaje Adaptativo (PAA) corre sobre ArgenCloud con modelos educativos abiertos y gobernanza pública' },

  // Inversas de PLANJUS (sistema inmunológico) → demandantes de justicia
  { id: 'd86', kind: 'provides', source: 'PLANJUS', target: 'PLANEB', nature: 'CRITICAL', type: 'INSTITUTIONAL', description: 'Resolución Popular resuelve disputas de usuarios de cada Bastarda en primera instancia no-jurisdiccional, con apelación a JUS formal' },
  { id: 'd87', kind: 'provides', source: 'PLANJUS', target: 'PLANMON', nature: 'CRITICAL', type: 'INSTITUTIONAL', description: 'Sala Financiera de JUS arbitra disputas on-chain del Pulso y del Fondo Soberano con enforcement automatizado' },
  { id: 'd88', kind: 'provides', source: 'PLANJUS', target: 'PLANSUS', nature: 'IMPORTANT', type: 'INSTITUTIONAL', description: 'Sala de Sustancias resuelve conflictos de licencias, zonificación y disputas comunitarias sobre uso de sustancias' },
  { id: 'd89', kind: 'provides', source: 'PLANJUS', target: 'PLANVIV', nature: 'IMPORTANT', type: 'INSTITUTIONAL', description: 'Sala de Propiedad resuelve disputas de inquilinos, fideicomisos y títulos digitales de vivienda' },

  // Inversa de PLANSUS→PLANSEG (d16/d17 comparten esta inversa)
  { id: 'd90', kind: 'provides', source: 'PLANSEG', target: 'PLANSUS', nature: 'CRITICAL', type: 'TEMPORAL', description: 'Reforma policial + 250+ EB operativas + protocolo GREEN/YELLOW/RED son precondición para la legalización escalonada: PLANSEG marca el pulso temporal de la transición narco' },

  // Inversas de PLANEN
  { id: 'd91', kind: 'provides', source: 'PLANEN', target: 'PLAN24CN', nature: 'CRITICAL', type: 'TECHNICAL', description: 'Bastarda Energética y red 100% renovable provistas antes de que cada Ciudad Nueva reciba residentes' },
  { id: 'd92', kind: 'provides', source: 'PLANEN', target: 'PLANMON', nature: 'CRITICAL', type: 'FINANCIAL', description: 'Regalías energéticas (USD 800M-3500M+/año) por hidrocarburos, minería y renovables capitalizan el Fondo Soberano Ciudadano' },

  // Inversas de PLANREP (motor fiscal)
  { id: 'd93', kind: 'provides', source: 'PLANREP', target: 'PLANEDU', nature: 'CRITICAL', type: 'FINANCIAL', description: '15% del ahorro neto fiscal de la reconversión financia el lanzamiento de PLANEDU; además los graduados del Camino se convierten en Maestros de Oficio docentes' },
  { id: 'd94', kind: 'provides', source: 'PLANREP', target: 'PLANVIV', nature: 'IMPORTANT', type: 'LABOR', description: 'Artesanos del Refugio formados por PLANREP construyen y retrofitean las 1800 urbanizaciones planificadas' },
  { id: 'd95', kind: 'provides', source: 'PLANREP', target: 'PLANSEG', nature: 'IMPORTANT', type: 'LABOR', description: 'Oficiales reconvertidos de fuerzas desmanteladas migran a seguridad comunitaria y enforcement sin violencia' },

  // Inversas de PLAN24CN
  { id: 'd96', kind: 'provides', source: 'PLANISV', target: 'PLAN24CN', nature: 'CRITICAL', type: 'TECHNICAL', description: 'Suelo regenerado y balances agua-suelo-carbono recalibrados se destinan a agricultura urbana y anillos verdes de las Ciudades Nuevas' },
  { id: 'd97', kind: 'provides', source: 'PLANAGUA', target: 'PLAN24CN', nature: 'IMPORTANT', type: 'TECHNICAL', description: 'Red hídrica troncal, acueductos y tratamiento provistos por ANAGUA cuando la ciudad pasa de diseño a ocupación' },
  { id: 'd98', kind: 'provides', source: 'PLANEB', target: 'PLAN24CN', nature: 'CRITICAL', type: 'INSTITUTIONAL', description: 'Red Bastarda aloja al costo todos los servicios urbanos de las 24 ciudades: energía, agua, telecomunicaciones y transporte' },

  // Inversas de PLANVIV (transversal)
  { id: 'd99', kind: 'provides', source: 'PLANMON', target: 'PLANVIV', nature: 'IMPORTANT', type: 'FINANCIAL', description: 'Peso-canasta denomina el Crédito Hipotecario Bastardo; el Pulso provee liquidez estable a la vivienda familiar' },
  { id: 'd100', kind: 'provides', source: 'PLANEB', target: 'PLANVIV', nature: 'IMPORTANT', type: 'INSTITUTIONAL', description: 'Protocolo Bastardo implementa el fideicomiso perpetuo de la Bastarda Inmobiliaria: propiedad perpetua del ocupante, no especulable' },
  { id: 'd101', kind: 'provides', source: 'PLANAGUA', target: 'PLANVIV', nature: 'IMPORTANT', type: 'TECHNICAL', description: 'Co-ejecución hídrica con ANAGUA para las 1800 urbanizaciones nuevas: conexión, tratamiento y rehúso' },
  { id: 'd102', kind: 'provides', source: 'PLANSEG', target: 'PLANVIV', nature: 'IMPORTANT', type: 'INSTITUTIONAL', description: 'Protocolos CPTED (prevención del delito por diseño ambiental) aplicados en urbanizaciones y retrofits' },

  // Inversas de PLANGEO (modelo que se exporta)
  { id: 'd103', kind: 'provides', source: 'PLANDIG', target: 'PLANGEO', nature: 'IMPORTANT', type: 'INSTITUTIONAL', description: 'IDS produce ArgenCloud como producto exportable que PLANGEO comercializa en la Red Soberana de América Latina' },
  { id: 'd104', kind: 'provides', source: 'PLANSUS', target: 'PLANGEO', nature: 'IMPORTANT', type: 'LEGAL', description: 'Cuerpo legal de salida de convenciones internacionales de drogas provisto por PLANSUS permite a PLANGEO ejecutar la cascada diplomática' },
  { id: 'd105', kind: 'provides', source: 'PLANMON', target: 'PLANGEO', nature: 'IMPORTANT', type: 'INSTITUTIONAL', description: 'Peso-canasta y Pulso son exportables como estándar monetario regional para el comercio Mercosur' },
  { id: 'd106', kind: 'provides', source: 'PLANEB', target: 'PLANGEO', nature: 'IMPORTANT', type: 'INSTITUTIONAL', description: 'Protocolo Bastardo open-source es la pieza central del estándar internacional de empresas al costo que PLANGEO promociona' },

  // Inversas de PLANCUL (hospedaje cultural)
  { id: 'd107', kind: 'provides', source: 'PLAN24CN', target: 'PLANCUL', nature: 'IMPORTANT', type: 'INSTITUTIONAL', description: 'Las Ciudades Nuevas son lienzos donde Dendritas (células culturales) nacen nativas en comunidades vírgenes' },
  { id: 'd108', kind: 'provides', source: 'PLANREP', target: 'PLANCUL', nature: 'IMPORTANT', type: 'INSTITUTIONAL', description: 'Centros de la Vida (ex-oficinas públicas reconvertidas) son los puntos físicos de reunión donde cristaliza la comunidad cultural' },
  { id: 'd109', kind: 'provides', source: 'PLANEDU', target: 'PLANCUL', nature: 'IMPORTANT', type: 'INSTITUTIONAL', description: 'La escuela enseña Rondas de Escucha desde primaria: los niños crecen como Dendritas nativas' },
  { id: 'd110', kind: 'provides', source: 'PLANVIV', target: 'PLANCUL', nature: 'IMPORTANT', type: 'INSTITUTIONAL', description: 'Barrios urbanizados proveen el tejido social territorial sobre el cual se reconstruye la cultura comunitaria' },

  // Inversas de data/financial flows transversales
  { id: 'd111', kind: 'provides', source: 'PLANMON', target: 'PLANISV', nature: 'IMPORTANT', type: 'DATA', description: 'El Pulso consume la telemetría de producción agrícola y rendimientos de Suelo Vivo como insumo para la estabilidad del peso-canasta' },
  { id: 'd112', kind: 'provides', source: 'PLANMON', target: 'PLANSUS', nature: 'IMPORTANT', type: 'FINANCIAL', description: 'El Fondo Soberano Ciudadano absorbe la recaudación fiscal de sustancias legalizadas como uno de sus pilares de capitalización' },
  { id: 'd113', kind: 'provides', source: 'PLANSUS', target: 'PLANSAL', nature: 'IMPORTANT', type: 'INSTITUTIONAL', description: 'PLANSUS habilita el uso terapéutico de sustancias e incluidos psicodélicos; los protocolos clínicos resultantes alimentan la medicina mental de PLANSAL' },

  // Inversas de PLANMESA (ciclo LDEA)
  { id: 'd114', kind: 'provides', source: 'PLANDIG', target: 'PLANMESA', nature: 'CRITICAL', type: 'TECHNICAL', description: 'IDS aloja la plataforma de auto-postulación, la Credencial de Materia y la Cédula Civil sobre nodos federados soberanos' },
  { id: 'd115', kind: 'provides', source: 'PLANEDU', target: 'PLANMESA', nature: 'CRITICAL', type: 'INSTITUTIONAL', description: 'A partir de Fase 1: PLANEDU construye la Capa de Estudio de la Credencial de Materia — currículum obligatorio y evaluación continua de servidores de Mesa' },
  { id: 'd116', kind: 'provides', source: 'PLANMEMORIA', target: 'PLANMESA', nature: 'CRITICAL', type: 'INSTITUTIONAL', description: 'PLANMEMORIA opera la Consulta Ancestral obligatoria en Fase APRENDER: el archivo federado responde en cada ciclo LDEA' },
  { id: 'd117', kind: 'provides', source: 'PLANTALLER', target: 'PLANMESA', nature: 'CRITICAL', type: 'INSTITUTIONAL', description: 'Tallers son los ejecutores operativos de Fase EXPERIMENTAR: prototipan, miden y retornan hallazgos a Mesa' },
  { id: 'd118', kind: 'provides', source: 'PLANCUIDADO', target: 'PLANMESA', nature: 'IMPORTANT', type: 'INSTITUTIONAL', description: 'Red de Cuidado provee la Capa de Vínculo de la Credencial y el sostén relacional de quienes sirven en Mesa' },
  { id: 'd119', kind: 'provides', source: 'PLANJUS', target: 'PLANMESA', nature: 'IMPORTANT', type: 'INSTITUTIONAL', description: 'JUS aporta control legal de las Resoluciones de Mesa y arbitra disputas sobre auto-postulación o Credenciales revocadas' },

  // Inversas de PLANTALLER (red productiva)
  { id: 'd120', kind: 'provides', source: 'PLANEB', target: 'PLANTALLER', nature: 'CRITICAL', type: 'INSTITUTIONAL', description: 'Red Bastarda es el canal de distribución at-cost de todo lo que produce la Red Taller: insumos a Bastardas y excedentes al mercado popular' },
  { id: 'd121', kind: 'provides', source: 'PLANDIG', target: 'PLANTALLER', nature: 'IMPORTANT', type: 'TECHNICAL', description: 'Protocolo Taller corre sobre ArgenCloud como plataforma federada de inventario, hallazgos y coordinación inter-Taller' },
  { id: 'd122', kind: 'provides', source: 'PLANREP', target: 'PLANTALLER', nature: 'IMPORTANT', type: 'LABOR', description: 'Empleo público reconvertido se redirige hacia coordinación, mentoría técnica y gestión operativa de los Tallers federales' },

  // Inversas de PLANCUIDADO (capa cero del pacto)
  { id: 'd123', kind: 'provides', source: 'PLANSAL', target: 'PLANCUIDADO', nature: 'CRITICAL', type: 'INSTITUTIONAL', description: 'A partir de Fase 1: APS territorial provee la ventana clínica que lee Pactos como dato de salud; Referentes articulan con médicos de cabecera' },
  { id: 'd124', kind: 'provides', source: 'PLANREP', target: 'PLANCUIDADO', nature: 'CRITICAL', type: 'LABOR', description: 'Cuidadoras domiciliarias informales son reconvertidas por PLANREP en Referentes Territoriales con salario, formación y protección' },
  { id: 'd125', kind: 'provides', source: 'PLANEDU', target: 'PLANCUIDADO', nature: 'IMPORTANT', type: 'INSTITUTIONAL', description: 'PLANEDU incluye currículum de cuidado desde primaria y formación inicial diferenciada para cada tipo de Pacto' },
  { id: 'd126', kind: 'provides', source: 'PLANJUS', target: 'PLANCUIDADO', nature: 'IMPORTANT', type: 'INSTITUTIONAL', description: 'JUS provee mediación de disputas de Pactos en primera instancia no-jurisdiccional antes de escalar al sistema formal' },
  { id: 'd127', kind: 'provides', source: 'PLANDIG', target: 'PLANCUIDADO', nature: 'IMPORTANT', type: 'TECHNICAL', description: 'IDS aloja el Registro Nacional de Vínculos, el Libro de Cuidado y la Alerta de Soledad Total con criptografía y consentimiento granular' },

  // Inversas de PLANMEMORIA (archivo federado)
  { id: 'd128', kind: 'provides', source: 'PLANDIG', target: 'PLANMEMORIA', nature: 'CRITICAL', type: 'TECHNICAL', description: 'IDS provee los 7 nodos federados con hash criptográfico resistente a borrado donde vive el archivo distribuido de la Memoria' },
  { id: 'd129', kind: 'provides', source: 'PLANEDU', target: 'PLANMEMORIA', nature: 'CRITICAL', type: 'INSTITUTIONAL', description: 'A partir de Fase 1: la escuela incorpora el rito cívico del Bastón Memorial a los 12 años como ceremonia de ingreso a la memoria activa' },
  { id: 'd130', kind: 'provides', source: 'PLANJUS', target: 'PLANMEMORIA', nature: 'IMPORTANT', type: 'INSTITUTIONAL', description: 'JUS coopera con la Inscripción de Captura en investigaciones sin sustituir su función mnémica autónoma' },

  // Inversas de PLANTER (soberanía territorial)
  { id: 'd131', kind: 'provides', source: 'PLANSEG', target: 'PLANTER', nature: 'CRITICAL', type: 'INSTITUTIONAL', description: 'PLANSEG extiende protección formal a defensores territoriales y amplía la Guardia Costera para soberanía marítima' },
  { id: 'd132', kind: 'provides', source: 'PLANJUS', target: 'PLANTER', nature: 'CRITICAL', type: 'INSTITUTIONAL', description: 'JUS implementa la co-jurisdicción con derecho originario y arbitra disputas territoriales entre pueblos y Estado' },
  { id: 'd133', kind: 'provides', source: 'PLANDIG', target: 'PLANTER', nature: 'CRITICAL', type: 'TECHNICAL', description: 'IDS provee monitoreo satelital soberano, registro ciudadano territorial y dashboard público del Dividendo del Suelo' },
  { id: 'd134', kind: 'provides', source: 'PLANCUIDADO', target: 'PLANTER', nature: 'IMPORTANT', type: 'INSTITUTIONAL', description: 'La red de Pactos reconoce y formaliza los parentescos interculturales de comunidades originarias como Pactos Interculturales' },
  { id: 'd135', kind: 'provides', source: 'PLANMEMORIA', target: 'PLANTER', nature: 'IMPORTANT', type: 'DATA', description: 'PLANMEMORIA aloja el Archivo Territorial con los depósitos testimoniales y documentales de comunidades originarias' },
  { id: 'd136', kind: 'provides', source: 'PLANTER', target: 'PLANMON', nature: 'IMPORTANT', type: 'FINANCIAL', description: 'El Dividendo del Suelo y el FSC son la palanca territorial que ancla al Fondo Soberano Ciudadano en activos reales' },
  { id: 'd137', kind: 'provides', source: 'PLANTER', target: 'PLANEN', nature: 'IMPORTANT', type: 'LEGAL', description: 'Licencia Territorial (reemplazo del RIGI) condiciona cualquier proyecto hidrocarburífero o minero a consulta previa y retorno comunitario' },

  // Inversas de PLANMOV (arterias logísticas)
  { id: 'd138', kind: 'provides', source: 'PLANMESA', target: 'PLANMOV', nature: 'IMPORTANT', type: 'INSTITUTIONAL', description: 'Mesas Civiles de Corredor son los cuerpos deliberativos que priorizan la reactivación ferroviaria kilómetro por kilómetro' },
  { id: 'd139', kind: 'provides', source: 'PLANMEMORIA', target: 'PLANMOV', nature: 'IMPORTANT', type: 'DATA', description: 'Archivo Técnico Ferroviario (con depósitos de ex-ferroviarios) aloja el conocimiento operativo histórico de los 25.000 km de red' },
  { id: 'd140', kind: 'provides', source: 'PLANEN', target: 'PLANMOV', nature: 'IMPORTANT', type: 'TECHNICAL', description: 'Red eléctrica + fibra sobre la misma traza ferroviaria: PLANEN electrifica la red reactivada con energía renovable soberana' },
  { id: 'd141', kind: 'provides', source: 'PLANDIG', target: 'PLANMOV', nature: 'CRITICAL', type: 'TECHNICAL', description: 'IDS + LANIA alojan la gestión de MKC, BLF, Red Federal de Puertos y el Laboratorio Nacional de Movilidad Autónoma con data-logging obligatorio' },
  { id: 'd142', kind: 'provides', source: 'PLANREP', target: 'PLANMOV', nature: 'CRITICAL', type: 'LABOR', description: 'Cuadros técnicos ferroviarios y portuarios son reconvertidos por PLANREP; la Ruta "Reconversión Móvil" absorbe 500.000 transportistas desplazados por automatización' },
  { id: 'd143', kind: 'provides', source: 'PLANEB', target: 'PLANMOV', nature: 'CRITICAL', type: 'INSTITUTIONAL', description: 'Bastarda Logística Federal, Bastarda Fluvial y BAMD son las formas bastardas que operan canales at-cost y redistribuyen el Canon de Automatización Logística' },

  // Inversas de conexiones nuevas (d75, d76)
  { id: 'd144', kind: 'provides', source: 'PLANDIG', target: 'PLANSAL', nature: 'CRITICAL', type: 'TECHNICAL', description: 'IDS aloja la Historia Clínica Unificada, telemedicina rural y el Registro de Salud Integral con criptografía y consentimiento explícito del paciente' },
  { id: 'd145', kind: 'provides', source: 'PLANTER', target: 'PLANISV', nature: 'IMPORTANT', type: 'INSTITUTIONAL', description: 'PLANTER provee la Licencia Territorial y el marco de co-soberanía indígena donde PLANISV regenera suelo en tierras fiscales y comunidades originarias' },

  // ============================================================================
  // === d146-d211 — EL GRAFO DE LOS CUATRO PLANes NUEVOS (ordinales 23-26).   ===
  // === 27 `requires` (d146-d172) y 39 `provides` (d173-d211): 66 aristas.    ===
  // ============================================================================
  //
  // Van en un bloque propio y no repartidas entre los de arriba, por dos razones.
  // La primera es que las dos mitades —lo que estos PLANes piden y lo que dan— se
  // leen juntas o no se leen: son el único tramo del grafo que entró completo de
  // una vez. La segunda es que los ids son correlativos y renumerar habría movido
  // todo lo anterior.
  //
  // ── DE DÓNDE SALEN ──────────────────────────────────────────────────────────
  // De la sección «INTEGRACIÓN CON EL MARCO ¡BASTA!» de cada uno de los cuatro
  // documentos, que es la sección que el corpus escribe para declarar aristas.
  // Cada arista cita la línea que la declara y `verificar-remisiones.ts` la
  // resuelve. La transcripción vive en `tests/unit/grafo-planes-nuevos.test.ts`,
  // que además prohíbe las aristas de más: si acá aparece una que la tabla no
  // declara, el test se pone rojo.
  //
  // ── SON 66 Y EL SPEC HABÍA CONTADO 69 ───────────────────────────────────────
  // `2026-07-26-cuatro-planes-nuevos.md:314` contó «34 requires y 35 provides»
  // sobre los borradores, antes de que los cuatro documentos se escribieran. Dos
  // de esas 69 eran hacia `PLANRUTA` y el propio spec las bajó a prosa porque
  // PLANRUTA no es nodo; las otras se movieron cuando cada documento fijó sus
  // dependencias con modo degradado. **Manda el documento escrito, no el conteo
  // previo**, y por eso este bloque tiene 66 en vez de completar 69 con relleno.
  //
  // ── LO QUE NO ES ARISTA, CON SU RAZÓN ───────────────────────────────────────
  // `PLANRUTA` (`PLANPACTO:723`, `PLANARCO:779`, `PLANPREGUNTA:750`): no es nodo
  // y declararlo rompería V-REF-03. Los alimentadores documentales —el libro
  // mayor, el presupuesto consolidado, el acta— se citan como fuente y no como
  // extremo. Lo que PLANPREGUNTA le pide «a los veinticinco» (`:748`) tampoco:
  // veinticinco aristas idénticas y renunciables no informan nada.

  // ── `requires` de PLANPACTO (23). Reparte más de lo que pide: son cuatro. ───
  { id: 'd146', source: 'PLANPACTO', target: 'PLANMON', nature: 'CRITICAL', type: 'TECHNICAL', description: 'El Giro Diario liquida sobre el riel del Pulso y la Deuda con Nombre no afloja sus principios 4 y 5 (`PLANPACTO:717`). Degradado: sin PLANMON el Giro corre sobre el sistema de pagos del Banco Central y la emisión en peso-canasta queda suspendida en la Ficha de cada bono' },
  { id: 'd147', source: 'PLANPACTO', target: 'PLANDIG', nature: 'IMPORTANT', type: 'TECHNICAL', description: 'Interoperabilidad de ARCA con las veinticuatro administraciones, capacidad del estadio A (`PLANPACTO:717`). Degradado: el Libro Mayor y la mitad nacional del Recibo salen igual porque ARCA ya tiene esos datos; lo que se demora es la consolidación de los otros dos niveles' },
  { id: 'd148', source: 'PLANPACTO', target: 'PLANMESA', nature: 'IMPORTANT', type: 'INSTITUTIONAL', description: 'PLANMESA delibera sobre la Escalera y publica dictamen no vinculante; que el Congreso no lo siga se publica junto al voto nominal de cada legislador (`PLANPACTO:721`)' },
  { id: 'd149', source: 'PLANPACTO', target: 'PLANJUS', nature: 'IMPORTANT', type: 'INSTITUTIONAL', description: 'PLANJUS aporta la forma canónica de su sorteo a los dos paneles del PLAN (`PLANPACTO:721`)' },

  // ── `requires` de PLANARCO (24). El nodo más dependiente del corpus. ────────
  // Seis críticas declaradas en `PLANARCO:761`, más PLANPACTO, que es el par
  // recíproco y NO es crítica: sin él, el Calendario y la Renta siguen.
  { id: 'd150', source: 'PLANARCO', target: 'PLANPACTO', nature: 'IMPORTANT', type: 'INSTITUTIONAL', description: 'Árbitro de nivel, ubicación de lo previsional en el Techo A, clases del libro mayor y permiso escrito para reemplazar el supuesto del eje intergeneracional (`PLANARCO:757`). Degradado: sin PLANPACTO sancionado la Regla de Arco no existe como norma y se pierde la obligación de cada escalón de declarar su reparto' },
  { id: 'd151', source: 'PLANARCO', target: 'PLANCUIDADO', nature: 'CRITICAL', type: 'INSTITUTIONAL', description: 'Fórmula del Tramo Ganado y su validador: un año de cuidado por un año aportado, con techo anual (`PLANCUIDADO:340`). Degradado: sin la agencia que valida las horas, el Tramo Ganado liquida en cero y el Piso Vital no se toca' },
  { id: 'd152', source: 'PLANARCO', target: 'PLANMON', nature: 'CRITICAL', type: 'FINANCIAL', description: 'Capa previsional y el índice que reemplaza al de este PLAN cuando el haber se pague en Pulso (`PLANMON:1543-1576`). Degradado: mientras se pague en pesos corre la movilidad de la Renta de Arco — acá el degradado es hoy y el pleno es lo que hay que esperar' },
  { id: 'd153', source: 'PLANARCO', target: 'PLANTER', nature: 'CRITICAL', type: 'FINANCIAL', description: 'Fondo del que cuelga el Tramo Común (`PLANTER:349`); PLANTER es dueño del Fondo Intergeneracional, la línea que este PLAN declinó. Degradado: ya está corriendo — el Tramo Común quedó declarado y no financiado' },
  { id: 'd154', source: 'PLANARCO', target: 'PLANDIG', nature: 'CRITICAL', type: 'TECHNICAL', description: 'Una estación que se abre sola necesita que el hecho registrado llegue sin que nadie lo tipee (`PLANARCO:769`). Degradado: el Calendario corre contra los padrones que ya existen, por convenio y por archivo, más lento y más caro' },
  { id: 'd155', source: 'PLANARCO', target: 'PLANSAL', nature: 'CRITICAL', type: 'INSTITUTIONAL', description: 'Primeros mil días, licencia parental con números y Centros de Vitalidad (`PLANARCO:771`). Es la única de las seis que deja una estación vacía: el Umbral de la Llegada es remisión pura y sin el documento al que remite queda anunciado y sin nada adentro' },
  { id: 'd156', source: 'PLANARCO', target: 'PLANREP', nature: 'CRITICAL', type: 'LABOR', description: 'Dividendo Nacional de Productividad, contra el cual corre la regla de absorción, y el Banco de Tiempo (`PLANREP:842`). Degradado: también corriendo — la regla no computa nada hasta que el dividendo exista' },

  // ── `requires` de PLANPREGUNTA (25). Tres críticas y cuatro menores. ────────
  { id: 'd157', source: 'PLANPREGUNTA', target: 'PLANDIG', nature: 'CRITICAL', type: 'TECHNICAL', description: 'Plataforma del Censo, cómputo del Turno de Máquina y sustrato de los Modelos de Órgano (`PLANPREGUNTA:738`). Degradado: el Censo funciona en papel, el Turno declara las Preguntas no contestables por falta de máquina y los Modelos esperan; ninguna capacidad del estadio B es requisito de la Fase 0' },
  { id: 'd158', source: 'PLANPREGUNTA', target: 'PLANMESA', nature: 'CRITICAL', type: 'INSTITUTIONAL', description: 'Mecánica de sorteo, Credencial de Materia sobre la que se estratifica, cupo y —cuando exista— Mesa Federal que decide qué Preguntas se abren (`PLANPREGUNTA:740`). Degradado: interinato con tope 2036, traspaso automático y declaración en cada acta de con qué padrón se sorteó' },
  { id: 'd159', source: 'PLANPREGUNTA', target: 'PLANTER', nature: 'CRITICAL', type: 'FINANCIAL', description: 'PLANTER es dueño del Fondo Soberano Ciudadano, de donde sale la plata: sin FSC no hay Fondo de la Pregunta (`PLANPREGUNTA:742`). Es la dependencia sin sustituto — la Fase 0 no lo necesita y para el régimen pleno no hay modo degradado, y decirlo es más honesto que inventar una fuente de reemplazo' },
  { id: 'd160', source: 'PLANPREGUNTA', target: 'PLANFOCO', nature: 'IMPORTANT', type: 'INSTITUTIONAL', description: 'El Sello Abierto publica adentro del Acervo Abierto en vez de construir un repositorio propio; PLANFOCO acepta la dependencia entrante en su Sección 7.3 (`PLANFOCO:750`). Mitad PREGUNTA del par recíproco FOCO ↔ PREGUNTA' },
  { id: 'd161', source: 'PLANPREGUNTA', target: 'PLANEDU', nature: 'MINOR', type: 'INSTITUTIONAL', description: 'PLANEDU forma a quienes van a poder contestar las Preguntas, y este PLAN no le toca la formación (`PLANPREGUNTA:746`)' },
  { id: 'd162', source: 'PLANPREGUNTA', target: 'PLANJUS', nature: 'MINOR', type: 'INSTITUTIONAL', description: 'Forma canónica del sorteo puro para el Seguro contra lo Imprevisto, y solamente ahí; además presta infraestructura territorial para las Cátedras (`PLANPREGUNTA:746`)' },
  { id: 'd163', source: 'PLANPREGUNTA', target: 'PLANTALLER', nature: 'MINOR', type: 'INSTITUTIONAL', description: 'Infraestructura territorial donde se instalan las Cátedras Portátiles (`PLANPREGUNTA:746`)' },

  // ── `requires` de PLANFOCO (26). El más desprendible: nueve aristas y solo ──
  // tres críticas. Su dependencia de PLANDIG NO es crítica y el documento lo
  // escribe con todas las letras: «ninguna posterga un dispositivo».
  { id: 'd164', source: 'PLANFOCO', target: 'PLANMESA', nature: 'CRITICAL', type: 'INSTITUTIONAL', description: 'Las Mesas Territoriales deciden las compras y el sorteo estratificado designa bibliotecarios, cronistas y dos directores de ANBAC (`PLANFOCO:758`). La dependencia de calendario es real: `PLANMESA:925-956` entra en tranche-2 entre 2028 y 2030 y las primeras sedes abren en 2029. Degradado: asamblea de usuarios con acta pública y traspaso automático' },
  { id: 'd165', source: 'PLANFOCO', target: 'PLANEDU', nature: 'CRITICAL', type: 'INSTITUTIONAL', description: 'PLANEDU dicta el Desmontaje, y con eso repara `PLANDIG:803`, que lo daba por dictado. PLANFOCO produce el material y forma a los mediadores; no escribe currículum (`PLANFOCO:760`)' },
  { id: 'd166', source: 'PLANFOCO', target: 'PLANMEMORIA', nature: 'CRITICAL', type: 'DATA', description: 'El manifiesto y el hash de cada pieza del Acervo van a los siete nodos de `PLANMEMORIA:90`. La agencia que produce el acervo no guarda ninguna de las dos copias que lo prueban, y eso es diseño y no descuido' },
  { id: 'd167', source: 'PLANFOCO', target: 'PLANDIG', nature: 'IMPORTANT', type: 'TECHNICAL', description: 'Nube soberana para el Acervo, malla para la conectividad de las sedes y estadio A para las dotaciones de La Antena (`PLANFOCO:752`). Cada una con modo degradado y ninguna posterga un dispositivo: una sede sin fibra abre igual y una dotación sin nube soberana se presta sobre infraestructura contratada con fecha de migración escrita' },
  { id: 'd168', source: 'PLANFOCO', target: 'PLANJUS', nature: 'IMPORTANT', type: 'LEGAL', description: 'Panel de Legalidad de Publicación como fuero nuevo adentro de PLANJUS, con el procedimiento de `PLANJUS:400` y no uno propio (`PLANFOCO:762`). Si PLANJUS se niega, la Cartelera publica igual y no tiene mecanismo propio para retirar nada — peor para las víctimas de una publicación ilegal y mejor que la alternativa, que es que el mecanismo lo tenga la agencia' },
  { id: 'd169', source: 'PLANFOCO', target: 'PLANPACTO', nature: 'IMPORTANT', type: 'FINANCIAL', description: 'La regla de fuentes le da a la pauta oficial un solo dueño: este PLAN, que la recauda para extinguirla y le devuelve el sobrante al ecosistema (`PLANFOCO:764`)' },
  { id: 'd170', source: 'PLANFOCO', target: 'PLANREP', nature: 'IMPORTANT', type: 'LABOR', description: 'PLANREP da el régimen laboral de las sedes y de ANBAC; PLANFOCO no crea estatuto propio ni pide excepción (`PLANFOCO:764`)' },
  { id: 'd171', source: 'PLANFOCO', target: 'PLANSAL', nature: 'MINOR', type: 'INSTITUTIONAL', description: 'Disciplina de transparencia por sede tomada de `PLANSAL:1515`, sin modificaciones (`PLANFOCO:764`)' },
  { id: 'd172', source: 'PLANFOCO', target: 'PLANTALLER', nature: 'MINOR', type: 'FINANCIAL', description: 'Única referencia de costo comparable que existe en el corpus para una red federal de sedes (`PLANFOCO:764`)' },

  // ── Espejos `provides` de lo que pide PLANPACTO ────────────────────────────
  { id: 'd173', kind: 'provides', source: 'PLANMON', target: 'PLANPACTO', nature: 'CRITICAL', type: 'TECHNICAL', description: 'El riel del Pulso liquida el Giro Diario y sostiene los principios 4 y 5 de la Deuda con Nombre' },
  { id: 'd174', kind: 'provides', source: 'PLANDIG', target: 'PLANPACTO', nature: 'IMPORTANT', type: 'TECHNICAL', description: 'El estadio A provee la interoperabilidad de ARCA con las veinticuatro administraciones, que es lo que consolida los tres niveles del Recibo' },
  { id: 'd175', kind: 'provides', source: 'PLANMESA', target: 'PLANPACTO', nature: 'IMPORTANT', type: 'INSTITUTIONAL', description: 'Delibera sobre la Escalera y publica dictamen no vinculante: la Escalera se ordena con deliberación ciudadana y no solo con voto legislativo' },
  { id: 'd176', kind: 'provides', source: 'PLANJUS', target: 'PLANPACTO', nature: 'IMPORTANT', type: 'INSTITUTIONAL', description: 'Presta la forma canónica de su sorteo a los dos paneles del pacto fiscal' },

  // ── `provides` propios de PLANPACTO: la Escalera reparte escalones ─────────
  // No hay `requires` de vuelta, y la razón es la que hace al PLAN: si PACTO no
  // se sanciona, PLANVIV no pierde su 2,00% — se queda con el reclamo que ya
  // tenía. Lo que la Escalera da es orden, no plata, y un orden que no llega no
  // rompe a nadie. Es por esto que PLANPACTO no resulta punto único de falla, al
  // revés de lo que el spec esperaba antes de que el documento se escribiera.
  { id: 'd177', kind: 'provides', source: 'PLANPACTO', target: 'PLANVIV', nature: 'CRITICAL', type: 'FINANCIAL', description: 'PLANVIV entrega la exclusividad de su piso del 2,00% del PBI y recibe el escalón 4 de la Escalera: pierde blindaje propio y gana lugar en una fila escrita antes de que falte (`PLANPACTO:719`)' },
  { id: 'd178', kind: 'provides', source: 'PLANPACTO', target: 'PLANCUIDADO', nature: 'CRITICAL', type: 'FINANCIAL', description: 'PLANCUIDADO entrega la exclusividad de su piso del 0,45% del PBI y recibe el escalón 5 de la Escalera (`PLANPACTO:719`)' },
  { id: 'd179', kind: 'provides', source: 'PLANPACTO', target: 'PLANEDU', nature: 'CRITICAL', type: 'FINANCIAL', description: 'PLANEDU ocupa uno de los escalones restantes de la Escalera, con su piso ordenado por regla escrita en vez de por quién tenga mejor abogado el día del recorte (`PLANPACTO:719`)' },
  { id: 'd180', kind: 'provides', source: 'PLANPACTO', target: 'PLANISV', nature: 'IMPORTANT', type: 'FINANCIAL', description: 'PLANISV conserva su piso entero en el escalón 1, y su afectación de retenciones cuelga del Libro Mayor con la cifra corregida: 0,005-0,016% del PBI, no el 0,08-0,19% que el corpus arrastraba (`PLANPACTO:719`)' },
  { id: 'd181', kind: 'provides', source: 'PLANPACTO', target: 'PLANAGUA', nature: 'IMPORTANT', type: 'FINANCIAL', description: 'PLANAGUA conserva su piso entero en el escalón 1 de la Escalera (`PLANPACTO:719`)' },

  // ── Espejos `provides` de lo que pide PLANARCO ─────────────────────────────
  { id: 'd182', kind: 'provides', source: 'PLANPACTO', target: 'PLANARCO', nature: 'IMPORTANT', type: 'INSTITUTIONAL', description: 'La Regla de Arco vive en la Sección 4.7 de PLANPACTO y es el eje intergeneracional de la Escalera: le da a PLANARCO el árbitro de nivel para no escribir regla de reparto propia (`PLANPACTO:721`)' },
  { id: 'd183', kind: 'provides', source: 'PLANCUIDADO', target: 'PLANARCO', nature: 'CRITICAL', type: 'INSTITUTIONAL', description: 'La ANCV valida las horas de cuidado y aporta la fórmula del Tramo Ganado: un año de cuidado por un año aportado, con techo anual (`PLANCUIDADO:340`)' },
  { id: 'd184', kind: 'provides', source: 'PLANMON', target: 'PLANARCO', nature: 'CRITICAL', type: 'FINANCIAL', description: 'Capa previsional del Pulso y el índice que reemplaza al de la Renta de Arco cuando el haber se pague en Pulso (`PLANMON:1543-1576`)' },
  { id: 'd185', kind: 'provides', source: 'PLANTER', target: 'PLANARCO', nature: 'CRITICAL', type: 'FINANCIAL', description: 'El Fondo Soberano Ciudadano y el Fondo Intergeneracional son el fondo del que cuelga el Tramo Común (`PLANTER:349`)' },
  { id: 'd186', kind: 'provides', source: 'PLANDIG', target: 'PLANARCO', nature: 'CRITICAL', type: 'TECHNICAL', description: 'El estadio A hace que el hecho registrado viaje solo, que es lo que permite que una estación del arco se abra sin que nadie la tipee' },
  { id: 'd187', kind: 'provides', source: 'PLANSAL', target: 'PLANARCO', nature: 'CRITICAL', type: 'INSTITUTIONAL', description: 'Primeros mil días, licencia parental con números y Centros de Vitalidad: es lo que llena el Umbral de la Llegada, que sin PLANSAL queda anunciado y vacío' },
  { id: 'd188', kind: 'provides', source: 'PLANREP', target: 'PLANARCO', nature: 'CRITICAL', type: 'LABOR', description: 'Dividendo Nacional de Productividad y Banco de Tiempo: el dividendo es el patrón contra el cual corre la regla de absorción de la Renta de Arco (`PLANREP:842`)' },

  // ── `provides` propio de PLANARCO: la mitad ARCO del par recíproco ─────────
  { id: 'd189', kind: 'provides', source: 'PLANARCO', target: 'PLANPACTO', nature: 'IMPORTANT', type: 'INSTITUTIONAL', description: 'Entrega el Calendario de Umbrales como la lista pública contra la cual cada escalón declara cómo repartió lo que conserva, y renuncia a reclamar escalón y piso propios (`PLANARCO:757`)' },

  // ── Espejos `provides` de lo que pide PLANPREGUNTA ─────────────────────────
  { id: 'd190', kind: 'provides', source: 'PLANDIG', target: 'PLANPREGUNTA', nature: 'CRITICAL', type: 'TECHNICAL', description: 'Plataforma del Censo de Ignorancia, cómputo soberano para el Turno de Máquina y sustrato de los Modelos de Órgano' },
  { id: 'd191', kind: 'provides', source: 'PLANMESA', target: 'PLANPREGUNTA', nature: 'CRITICAL', type: 'INSTITUTIONAL', description: 'Mecánica de sorteo, Credencial de Materia para estratificar el jurado y la Mesa Federal que decide qué Preguntas se abren' },
  { id: 'd192', kind: 'provides', source: 'PLANTER', target: 'PLANPREGUNTA', nature: 'CRITICAL', type: 'FINANCIAL', description: 'Ocho puntos del Fondo Soberano Ciudadano, tomados del Fondo Intergeneracional, son el Fondo de la Pregunta entero: sin FSC no hay financiamiento y no hay sustituto' },
  { id: 'd193', kind: 'provides', source: 'PLANFOCO', target: 'PLANPREGUNTA', nature: 'IMPORTANT', type: 'INSTITUTIONAL', description: 'El Acervo Abierto aloja al Sello Abierto con el régimen de doble uso fijado por PLANPREGUNTA y no por ANBAC, y el Desmontaje es la escala personal de lo que el Censo de Ignorancia hace a escala de país. Mitad FOCO del par recíproco' },
  { id: 'd194', kind: 'provides', source: 'PLANEDU', target: 'PLANPREGUNTA', nature: 'MINOR', type: 'INSTITUTIONAL', description: 'Forma a quienes van a poder contestar las Preguntas; PLANPREGUNTA no le toca la formación' },
  { id: 'd195', kind: 'provides', source: 'PLANJUS', target: 'PLANPREGUNTA', nature: 'MINOR', type: 'INSTITUTIONAL', description: 'Presta la forma canónica de su sorteo puro al Seguro contra lo Imprevisto e infraestructura territorial para las Cátedras' },
  { id: 'd196', kind: 'provides', source: 'PLANTALLER', target: 'PLANPREGUNTA', nature: 'MINOR', type: 'INSTITUTIONAL', description: 'Presta la infraestructura territorial donde se instalan las Cátedras Portátiles' },

  // ── `provides` propios de PLANPREGUNTA (`PLANPREGUNTA:744`) ────────────────
  { id: 'd197', kind: 'provides', source: 'PLANPREGUNTA', target: 'PLANISV', nature: 'IMPORTANT', type: 'DATA', description: 'Nodos, catálogo y régimen de préstamo del Banco de Materia Viva sobre el banco de germoplasma que PLANISV ya tiene, sin cambiarle el dueño' },
  { id: 'd198', kind: 'provides', source: 'PLANPREGUNTA', target: 'PLANMEMORIA', nature: 'IMPORTANT', type: 'DATA', description: 'Flujo de actas de cierre, catálogos y préstamos que se inscriben en el Archivo federado; y al apagarse, el registro de Preguntas y las actas se transfieren ahí en vez de cerrarse' },
  { id: 'd199', kind: 'provides', source: 'PLANPREGUNTA', target: 'PLANEN', nature: 'MINOR', type: 'DATA', description: 'Enunciado público de lo que el LANEF no está averiguando, y ninguna interferencia con lo que sí' },
  { id: 'd200', kind: 'provides', source: 'PLANPREGUNTA', target: 'PLANGEO', nature: 'MINOR', type: 'INSTITUTIONAL', description: 'El método como módulo del Stack de Soberanía a partir de 2040: open-source, forkeable y con cero lock-in, como `PLANGEO:207` exige de todo módulo. No se exporta el conocimiento sino la manera de administrar la ignorancia propia' },

  // ── Espejos `provides` de lo que pide PLANFOCO ─────────────────────────────
  { id: 'd201', kind: 'provides', source: 'PLANMESA', target: 'PLANFOCO', nature: 'CRITICAL', type: 'INSTITUTIONAL', description: 'Las Mesas Territoriales deciden qué se compra en 1.200 barrios y el sorteo estratificado designa bibliotecarios, cronistas y dos directores de ANBAC: es lo que impide que una agencia nacional elija qué se lee' },
  { id: 'd202', kind: 'provides', source: 'PLANEDU', target: 'PLANFOCO', nature: 'CRITICAL', type: 'INSTITUTIONAL', description: 'Dicta el Desmontaje dentro del currículum escolar, que es la capacidad que PLANFOCO no puede escribir por sí mismo sin volverse autoridad sobre contenido' },
  { id: 'd203', kind: 'provides', source: 'PLANMEMORIA', target: 'PLANFOCO', nature: 'CRITICAL', type: 'DATA', description: 'Los siete nodos federados custodian el manifiesto y el hash de cada pieza del Acervo (`PLANMEMORIA:90`): tres funciones, tres agencias, y la que produce el acervo no guarda ninguna de las dos copias que lo prueban' },
  { id: 'd204', kind: 'provides', source: 'PLANDIG', target: 'PLANFOCO', nature: 'IMPORTANT', type: 'TECHNICAL', description: 'Nube soberana para el bitstream del Acervo, malla para la conectividad de las sedes y estadio A para las dotaciones de La Antena' },
  { id: 'd205', kind: 'provides', source: 'PLANJUS', target: 'PLANFOCO', nature: 'IMPORTANT', type: 'LEGAL', description: 'Aloja el Panel de Legalidad de Publicación como fuero nuevo con el procedimiento de `PLANJUS:400`, y puede negarse: es un pedido, no una imposición' },
  { id: 'd206', kind: 'provides', source: 'PLANPACTO', target: 'PLANFOCO', nature: 'IMPORTANT', type: 'FINANCIAL', description: 'La regla de fuentes le asigna a la publicidad oficial un solo dueño, y por eso PLANFOCO puede recaudarla para extinguirla sin disputar la fuente con nadie' },
  { id: 'd207', kind: 'provides', source: 'PLANREP', target: 'PLANFOCO', nature: 'IMPORTANT', type: 'LABOR', description: 'Da el régimen laboral de las sedes y de ANBAC, que es lo que evita un estatuto propio y una excepción más en el ecosistema' },
  { id: 'd208', kind: 'provides', source: 'PLANSAL', target: 'PLANFOCO', nature: 'MINOR', type: 'INSTITUTIONAL', description: 'Presta su disciplina de transparencia por sede (`PLANSAL:1515`) sin modificaciones' },
  { id: 'd209', kind: 'provides', source: 'PLANTALLER', target: 'PLANFOCO', nature: 'MINOR', type: 'FINANCIAL', description: 'Presta la única referencia de costo comparable del corpus para una red federal de sedes territoriales' },

  // ── `provides` propios de PLANFOCO ─────────────────────────────────────────
  { id: 'd210', kind: 'provides', source: 'PLANFOCO', target: 'PLANDIG', nature: 'IMPORTANT', type: 'FINANCIAL', description: 'Paga el Commons Atencional que `PLANDIG:788` consagró y su TABLA 20 no presupuestó: la relación con PLANDIG es asimétrica en las dos direcciones, y ésta es la que va de vuelta' },
  { id: 'd211', kind: 'provides', source: 'PLANFOCO', target: 'PLANCUL', nature: 'IMPORTANT', type: 'INSTITUTIONAL', description: 'Asume la Acción 3 de `PLANCUL:387`, derogada en los dos documentos con nota fechada: el poder de los medios pasa a tener dueño y PLANCUL conserva su parasitismo, su presupuesto cero y su compromiso de no-intervención' },

  // ── Bloque MARCOS DE ATRACCIÓN de PLANSUS (Secciones 28-31, 2026-08-03) ──────
  // Las dos compuertas que PLANSUS declara y NO controla (Sección 30.5) entran
  // como 'provides' y NO como 'requires', y la razón la da el propio documento.
  //
  // 'requires' alimenta las simulaciones de falla: si el target cae, el source
  // cae con él. Pero la Sección 30.5 dice literalmente que «el bloque de
  // atracción vale aunque las dos compuertas no se abran nunca», porque el tramo
  // de clínica se diseñó autónomo — necesita una norma de certificación y un
  // régimen de visas, no divisas. Un 'requires' marcaría a PLANSUS como caído
  // cada vez que la simulación tumbe a PLANPACTO, y eso contradiría al texto.
  // Lo descubrió `tests/unit/grafo-planes-nuevos.test.ts`, que además prohíbe
  // que un PLAN viejo le reclame a uno nuevo: la invariante y el documento
  // resultaron decir lo mismo.
  //
  // NOTA: no hay arista hacia PLANPUERTA aunque la Sección 31 lo cite. PLANPUERTA
  // tiene spec pero todavía no es nodo de este grafo, y una arista a un nodo
  // inexistente es peor que la ausencia. Se agrega cuando el documento exista.
  { id: 'd212', kind: 'provides', source: 'PLANPACTO', target: 'PLANSUS', nature: 'IMPORTANT', type: 'FINANCIAL', description: 'La estabilidad de reglas con horizonte escrito habilita el régimen de atracción sectorial de la Sección 30.3 — compuerta del tramo laboratorio: sin plazo cierto no se radica investigación, cualquiera sea el marco regulatorio de sustancias' },
  { id: 'd213', kind: 'provides', source: 'PLANMON', target: 'PLANSUS', nature: 'IMPORTANT', type: 'FINANCIAL', description: 'La normalización cambiaria habilita el tramo fábrica del bloque de atracción: nadie inmoviliza capital industrial donde no puede repatriar lo ganado' },
  { id: 'd214', kind: 'provides', source: 'PLANSUS', target: 'PLANPREGUNTA', nature: 'IMPORTANT', type: 'DATA', description: 'El Registro Nacional de Resultados Terapéuticos es un bien público de conocimiento bajo fideicomiso argentino: legalidad a escala nacional más volumen produce evidencia que ninguna otra jurisdicción puede generar hoy' },
];

// === TIMELINE PHASES ===

export const TIMELINE_PHASES: TimelinePhase[] = [
  // PLANDIG
  { planId: 'PLANDIG', name: 'Pre-Fase', startYear: -1, endYear: -1 },
  { planId: 'PLANDIG', name: 'Fundación', startYear: 0, endYear: 0 },
  { planId: 'PLANDIG', name: 'Escala', startYear: 1, endYear: 3 },
  { planId: 'PLANDIG', name: 'Consolidación', startYear: 4, endYear: 6 },
  { planId: 'PLANDIG', name: 'Soberanía', startYear: 7, endYear: 10 },
  // PLANJUS
  { planId: 'PLANJUS', name: 'Pre-Fase — Diseño del Nuevo Código y Selección de Salas', startYear: -1, endYear: 0 },
  { planId: 'PLANJUS', name: 'Fase 1 — El Alivio', startYear: 1, endYear: 3 },
  { planId: 'PLANJUS', name: 'La Preferencia', startYear: 3, endYear: 7 },
  { planId: 'PLANJUS', name: 'La Sucesión Natural', startYear: 7, endYear: 15 },
  // PLANREP
  { planId: 'PLANREP', name: 'Pre-Fase — Auditoría del Empleo Público y Ley de Reconversión', startYear: -1, endYear: -1 },
  { planId: 'PLANREP', name: 'Lanzamiento', startYear: 0, endYear: 1 },
  { planId: 'PLANREP', name: 'Inversión', startYear: 2, endYear: 3 },
  { planId: 'PLANREP', name: 'Primer Superávit', startYear: 4, endYear: 4 },
  { planId: 'PLANREP', name: 'Régimen', startYear: 5, endYear: 10 },
  { planId: 'PLANREP', name: 'Economía Contribución', startYear: 11, endYear: 20 },
  // PLANEB
  { planId: 'PLANEB', name: 'Pre-Fase — Diseño del Protocolo Bastardo', startYear: -1, endYear: -1 },
  { planId: 'PLANEB', name: 'Semilla', startYear: 0, endYear: 0 },
  { planId: 'PLANEB', name: 'Auto Simple', startYear: 0, endYear: 1 },
  { planId: 'PLANEB', name: 'Expansión', startYear: 1, endYear: 2 },
  { planId: 'PLANEB', name: 'Espectro Completo', startYear: 3, endYear: 5 },
  { planId: 'PLANEB', name: 'Red Madura', startYear: 5, endYear: 15 },
  // PLANMON
  { planId: 'PLANMON', name: 'Diseño Fundacional — Auditoría BCRA + Marco Legal del Pulso', startYear: -1, endYear: 1 },
  { planId: 'PLANMON', name: 'Pre-Fase', startYear: 2, endYear: 2 },
  { planId: 'PLANMON', name: 'Pulso Beta', startYear: 3, endYear: 3 },
  { planId: 'PLANMON', name: 'Expansión', startYear: 4, endYear: 6 },
  { planId: 'PLANMON', name: 'Desdolarización', startYear: 7, endYear: 10 },
  { planId: 'PLANMON', name: 'Pulso Dominante', startYear: 11, endYear: 15 },
  // PLANSUS
  { planId: 'PLANSUS', name: 'Pre-Fase — Estudios Epidemiológicos y Ley Marco', startYear: -1, endYear: 0 },
  { planId: 'PLANSUS', name: 'El Alivio', startYear: 1, endYear: 1 },
  { planId: 'PLANSUS', name: 'La Expansión', startYear: 2, endYear: 3 },
  { planId: 'PLANSUS', name: 'La Soberanía', startYear: 4, endYear: 5 },
  // PLANEDU
  { planId: 'PLANEDU', name: 'Pre-Fase — Diseño Curricular y Movilización Docente', startYear: -1, endYear: 0 },
  { planId: 'PLANEDU', name: 'Escudo', startYear: 1, endYear: 7 },
  { planId: 'PLANEDU', name: 'Transición', startYear: 8, endYear: 14 },
  { planId: 'PLANEDU', name: 'Abundancia', startYear: 15, endYear: 20 },
  // PLANSAL
  { planId: 'PLANSAL', name: 'Pre-Fase — Diagnóstico Sanitario Nacional', startYear: -1, endYear: 0 },
  { planId: 'PLANSAL', name: 'Demostrar', startYear: 1, endYear: 3 },
  { planId: 'PLANSAL', name: 'Escalar', startYear: 3, endYear: 7 },
  { planId: 'PLANSAL', name: 'Consolidar', startYear: 7, endYear: 15 },
  // PLANISV
  { planId: 'PLANISV', name: 'Pre-Fase — Mapeo de Suelos Degradados y Ley ENSV', startYear: -1, endYear: -1 },
  { planId: 'PLANISV', name: 'Demostrar', startYear: 0, endYear: 0 },
  { planId: 'PLANISV', name: 'Regionalizar', startYear: 1, endYear: 2 },
  { planId: 'PLANISV', name: 'Escala Nacional', startYear: 3, endYear: 10 },
  { planId: 'PLANISV', name: 'Consolidación', startYear: 11, endYear: 15 },
  // PLANAGUA
  { planId: 'PLANAGUA', name: 'Pre-Fase — Diagnóstico Hídrico Nacional', startYear: -1, endYear: 1 },
  { planId: 'PLANAGUA', name: 'Emergencia', startYear: 2, endYear: 2 },
  { planId: 'PLANAGUA', name: 'Infraestructura', startYear: 3, endYear: 5 },
  { planId: 'PLANAGUA', name: 'Modernización', startYear: 6, endYear: 8 },
  { planId: 'PLANAGUA', name: 'Excelencia', startYear: 9, endYear: 10 },
  // PLAN24CN
  { planId: 'PLAN24CN', name: 'Pre-Fase — Censo de Sitios y Diseño Urbano', startYear: -1, endYear: 0 },
  { planId: 'PLAN24CN', name: 'Cimentar', startYear: 1, endYear: 2 },
  { planId: 'PLAN24CN', name: 'Escalar', startYear: 2, endYear: 5 },
  { planId: 'PLAN24CN', name: 'Completar', startYear: 5, endYear: 8 },
  { planId: 'PLAN24CN', name: 'Transformar', startYear: 9, endYear: 15 },
  { planId: 'PLAN24CN', name: 'Madurez', startYear: 15, endYear: 20 },
  // PLANGEO
  { planId: 'PLANGEO', name: 'Prueba Doméstica', startYear: 0, endYear: 2 },
  { planId: 'PLANGEO', name: 'Primeros Adoptantes', startYear: 3, endYear: 4 },
  { planId: 'PLANGEO', name: 'Masa Crítica', startYear: 5, endYear: 7 },
  { planId: 'PLANGEO', name: 'Red Global', startYear: 8, endYear: 15 },
  // PLANEN
  { planId: 'PLANEN', name: 'Pre-Fase', startYear: -1, endYear: -1 },
  { planId: 'PLANEN', name: 'Marco Legal', startYear: 0, endYear: 0 },
  { planId: 'PLANEN', name: 'Gas + Renovables', startYear: 1, endYear: 5 },
  { planId: 'PLANEN', name: 'Industrialización', startYear: 6, endYear: 10 },
  { planId: 'PLANEN', name: 'Soberanía Energética', startYear: 11, endYear: 15 },
  // PLANSEG
  { planId: 'PLANSEG', name: 'Pre-Fase', startYear: -1, endYear: -1 },
  { planId: 'PLANSEG', name: 'Fundación', startYear: 0, endYear: 0 },
  { planId: 'PLANSEG', name: 'Transición', startYear: 1, endYear: 4 },
  { planId: 'PLANSEG', name: 'Consolidación', startYear: 5, endYear: 8 },
  { planId: 'PLANSEG', name: 'Madurez', startYear: 9, endYear: 15 },
  // PLANVIV
  { planId: 'PLANVIV', name: 'Pre-Fase', startYear: -1, endYear: -1 },
  { planId: 'PLANVIV', name: 'Fundación', startYear: 0, endYear: 0 },
  { planId: 'PLANVIV', name: 'Escala', startYear: 1, endYear: 5 },
  { planId: 'PLANVIV', name: 'Aceleración', startYear: 6, endYear: 8 },
  { planId: 'PLANVIV', name: 'Cierre del Déficit', startYear: 9, endYear: 15 },
  // PLANCUL
  { planId: 'PLANCUL', name: 'Semillas', startYear: -1, endYear: 0 },
  { planId: 'PLANCUL', name: 'Enraizamiento', startYear: 1, endYear: 3 },
  { planId: 'PLANCUL', name: 'Masa Crítica', startYear: 4, endYear: 5 },
  { planId: 'PLANCUL', name: 'Transformación', startYear: 6, endYear: 10 },
  { planId: 'PLANCUL', name: 'Madurez', startYear: 11, endYear: 15 },
  // PLANMESA
  { planId: 'PLANMESA', name: 'Pre-Fase — Diseño del Protocolo de Credencial', startYear: -1, endYear: -1 },
  { planId: 'PLANMESA', name: 'Fase 0 — Arranque Técnico', startYear: 0, endYear: 0 },
  { planId: 'PLANMESA', name: 'Piloto — 3 materias', startYear: 1, endYear: 2 },
  { planId: 'PLANMESA', name: 'Expansión', startYear: 3, endYear: 6 },
  { planId: 'PLANMESA', name: 'Régimen Pleno', startYear: 7, endYear: 15 },
  // PLANTALLER
  { planId: 'PLANTALLER', name: 'Pre-Fase — Diseño del Protocolo Taller y Red de Oficios', startYear: -1, endYear: -1 },
  { planId: 'PLANTALLER', name: 'Fase 0 — Primer Prototipo', startYear: 0, endYear: 0 },
  { planId: 'PLANTALLER', name: 'Red Piloto — 50 Tallers', startYear: 1, endYear: 2 },
  { planId: 'PLANTALLER', name: 'Expansión — 500 Tallers', startYear: 3, endYear: 6 },
  { planId: 'PLANTALLER', name: 'Régimen — 4000 Tallers', startYear: 7, endYear: 15 },
  // PLANCUIDADO
  { planId: 'PLANCUIDADO', name: 'Pre-Fase — Diseño de Pactos Tipo y Ley ANCV', startYear: -1, endYear: -1 },
  { planId: 'PLANCUIDADO', name: 'Fase 0 — Ley ANCV + Registro Piloto', startYear: 0, endYear: 0 },
  { planId: 'PLANCUIDADO', name: 'Expansión de Pactos', startYear: 1, endYear: 3 },
  { planId: 'PLANCUIDADO', name: 'Jornada 6+2 Progresiva', startYear: 4, endYear: 7 },
  { planId: 'PLANCUIDADO', name: 'Régimen Pleno', startYear: 8, endYear: 15 },
  // PLANMEMORIA
  { planId: 'PLANMEMORIA', name: 'Pre-Fase — Arquitectura de Nodos y Curaduría Inicial', startYear: -1, endYear: -1 },
  { planId: 'PLANMEMORIA', name: 'Fase 0 — Arranque Federado', startYear: 0, endYear: 0 },
  { planId: 'PLANMEMORIA', name: 'Bastón Memorial Piloto + 2 Nodos', startYear: 1, endYear: 2 },
  { planId: 'PLANMEMORIA', name: 'Red de 7 Nodos + Consulta Ancestral', startYear: 3, endYear: 5 },
  { planId: 'PLANMEMORIA', name: 'Régimen — Archivo Activo', startYear: 6, endYear: 15 },
  // PLANTER
  { planId: 'PLANTER', name: 'Pre-Fase — Diagnóstico Territorial y Consulta Previa', startYear: -1, endYear: 0 },
  { planId: 'PLANTER', name: 'Fase 1 Escalonada — Ley ANTSPO', startYear: 1, endYear: 1 },
  { planId: 'PLANTER', name: 'Fase 2 — Commons Subsuelo + DCM Piloto', startYear: 2, endYear: 3 },
  { planId: 'PLANTER', name: 'Fase 3 — Mar Soberano + Deforestación Cero', startYear: 4, endYear: 7 },
  { planId: 'PLANTER', name: 'Régimen — FSC Consolidado', startYear: 8, endYear: 15 },
  // PLANMOV v2.0 — 5 fases (tres capas + 11 dispositivos + Doctrina del Doble Desplazamiento)
  { planId: 'PLANMOV', name: 'Pre-Fase — Auditoría Ferroviaria/Portuaria y Ley ANMov', startYear: -1, endYear: -1 },
  { planId: 'PLANMOV', name: 'Fase 0 — Preparación (Ley ANMov + AMBA-T + BAMD + LNMA/PCAV + MKC)', startYear: 0, endYear: 1 },
  { planId: 'PLANMOV', name: 'Fase 1 — Arranque (3 corredores ferroviarios piloto + BLF + Canon + Hidrovía + Régimen Laboral)', startYear: 2, endYear: 4 },
  { planId: 'PLANMOV', name: 'Fase 2 — Consolidación (AMBA-T + Hidrovía Soberana + escalado BAMD)', startYear: 5, endYear: 8 },
  { planId: 'PLANMOV', name: 'Fase 3 — Maduración (25.000 km ferroviarios + columna múltiple + piloto AV soberano)', startYear: 9, endYear: 14 },
  { planId: 'PLANMOV', name: 'Fase 4 — Régimen Pleno (AV público + BAMD consolidada + Visión 2046)', startYear: 15, endYear: 20 },

  // ── Los cuatro PLANes nuevos (ordinales 23-26) ─────────────────────────────
  // Las hojas de ruta de tres de los cuatro están escritas en años de calendario
  // y esta tabla va en años relativos, así que hay una conversión y conviene
  // dejarla escrita: **el año 0 del ecosistema es 2027**, que es donde PLANPACTO
  // y PLANFOCO ponen su Fase 0. PLANARCO ya venía en años ordinales y entra tal
  // cual. Sin estas fases, V-TIME-01 —la regla más severa del motor— hace
  // `continue` sobre las veintisiete aristas nuevas y no verifica ninguna.
  //
  // Ninguno de los cuatro tiene pre-fase (`startYear` negativo) y no se le
  // inventa una: los tres documentos que declaran dependencias críticas dicen
  // que su Fase 0 no depende de nadie, y esa Fase 0 arranca en el año 0 como la
  // de todos. V-TIME-05 avisa por eso y el aviso es correcto.

  // PLANPACTO — `PLANPACTO:703-709`. Fase 3 llega a 2042: un año más que el
  // horizonte de quince, porque la 6.1 ata su cierre al crecimiento de la masa
  // y no a una fecha.
  { planId: 'PLANPACTO', name: 'Fase 0 — El espejo (Libro Mayor por decreto + mitad nacional del Recibo)', startYear: 0, endYear: 1 },
  { planId: 'PLANPACTO', name: 'Fase 1 — El acuerdo (Fórmula en sombra + IVA que Vuelve)', startYear: 2, endYear: 4 },
  { planId: 'PLANPACTO', name: 'Fase 2 — El giro (ley-convenio ratificada + Giro Diario en producción)', startYear: 5, endYear: 8 },
  { planId: 'PLANPACTO', name: 'Fase 3 — La convergencia (Fórmula al incremento + Fondo de Compensación se apaga)', startYear: 9, endYear: 15 },

  // PLANARCO — `PLANARCO:920-926`, ya en años ordinales. Las fases se solapan a
  // propósito: «el final no termina cuando empieza el medio».
  { planId: 'PLANARCO', name: 'Fase 0 — Contar el arco (padrón y Tablero por estación)', startYear: 0, endYear: 1 },
  { planId: 'PLANARCO', name: 'Fase 1 — El piso y el final (Piso Vital, Tramo Ganado, La Última Palabra)', startYear: 1, endYear: 4 },
  { planId: 'PLANARCO', name: 'Fase 2 — La rampa y las casas (Rampa de Salida 60-72 + las dos Casas)', startYear: 4, endYear: 8 },
  { planId: 'PLANARCO', name: 'Fase 3 — Los umbrales (Llegada, Bienvenida, Dote de Origen, Pasaje, Legado)', startYear: 6, endYear: 10 },
  { planId: 'PLANARCO', name: 'Fase 4 — Régimen pleno (el arco entero)', startYear: 10, endYear: 15 },

  // PLANPREGUNTA — `PLANPREGUNTA:883-891`. Arranca en 2029 y no en 2027: es el
  // único de los cuatro cuya Fase 0 no es del primer año.
  { planId: 'PLANPREGUNTA', name: 'Fase 0 — El registro antes que la plata (Censo abierto, en papel si hace falta)', startYear: 2, endYear: 3 },
  { planId: 'PLANPREGUNTA', name: 'Fase 1 — Las primeras cien Preguntas (Ley ANCON + nueve verticales)', startYear: 4, endYear: 5 },
  { planId: 'PLANPREGUNTA', name: 'Fase 2 — La Cátedra y el Regreso (Cátedras Portátiles + Turno de Máquina)', startYear: 6, endYear: 7 },
  { planId: 'PLANPREGUNTA', name: 'Fase 3 — Régimen pleno (el Fondo de la Pregunta gira sus ocho puntos)', startYear: 8, endYear: 13 },
  { planId: 'PLANPREGUNTA', name: 'Fase 4 — El método sale del país (módulo del Stack de Soberanía)', startYear: 14, endYear: 15 },

  // PLANFOCO — `PLANFOCO:912-918`. Las cuatro fases traen su costo anual, y es
  // el mismo que la rampa de la Sección 13: 60-90, 170-260, 270-430 y 300-450.
  { planId: 'PLANFOCO', name: 'Fase 0 — La pauta se vuelve ciega (decreto de sorteo + cronograma de extinción)', startYear: 0, endYear: 1 },
  { planId: 'PLANFOCO', name: 'Fase 1 — Las primeras seiscientas sedes (convenios + concursos ciegos)', startYear: 2, endYear: 4 },
  { planId: 'PLANFOCO', name: 'Fase 2 — La red completa (1.200-1.500 sedes + compras a las Mesas Territoriales)', startYear: 5, endYear: 7 },
  { planId: 'PLANFOCO', name: 'Fase 3 — Régimen y evaluación (el indicador contra la línea de base de 2027)', startYear: 8, endYear: 14 },
];

// === CRITICAL CHAINS ===

export const CRITICAL_CHAINS: CriticalChain[] = [
  {
    id: 'chain-1',
    name: 'Cadena Institucional-Monetaria',
    description: 'PLANDIG → PLANJUS → PLANEB → PLANREP → PLANMON. La infraestructura digital habilita justicia y Bastardas; sin esa base, el Pulso monetario no tiene rieles ni enforcement. Si PLANDIG se retrasa, todo el sistema monetario se retrasa.',
    plans: ['PLANDIG', 'PLANJUS', 'PLANREP', 'PLANEB', 'PLANMON'],
    dangerLevel: 'CRITICAL',
  },
  {
    id: 'chain-2',
    name: 'Cadena Seguridad-Sustancias',
    description: 'PLANSEG debe tener 250+ EB operativas y reforma policial visible 12 meses ANTES de que PLANSUS legalice. Si PLANSEG falla, PLANSUS genera vacío de seguridad y la transición narco se descontrola.',
    plans: ['PLANSEG', 'PLANSUS'],
    dangerLevel: 'EXTREME',
  },
  {
    id: 'chain-3',
    name: 'Cadena Vivienda Integrada',
    description: 'PLANVIV necesita PLANEB (Bastarda Inmobiliaria), PLANMON (crédito en peso-canasta), PLANAGUA (co-ejecución hídrica de 1800 urbanizaciones) y PLANSEG (CPTED) para funcionar.',
    plans: ['PLANVIV', 'PLANEB', 'PLANMON', 'PLANAGUA', 'PLANSEG'],
    dangerLevel: 'HIGH',
  },
  {
    id: 'chain-4',
    name: 'Cadena Deliberativa LDEA',
    description: 'PLANMESA depende de PLANDIG (Cédula Civil), PLANEDU (Capa de Estudio desde Fase 1), PLANMEMORIA (Consulta Ancestral) y PLANTALLER (fase EXPERIMENTAR). Si un eslabón falla, el ciclo LDEA queda incompleto y las Resoluciones pierden legitimidad técnica.',
    plans: ['PLANMESA', 'PLANDIG', 'PLANEDU', 'PLANMEMORIA', 'PLANTALLER'],
    dangerLevel: 'CRITICAL',
  },
  {
    id: 'chain-5',
    name: 'Cadena de Cuidado',
    description: 'PLANCUIDADO necesita PLANSAL (APS territorial que lee Pactos desde Fase 1) y PLANREP (reconversión de cuidadoras a Referentes Territoriales). Sin ambos, los Pactos quedan en el papel.',
    plans: ['PLANCUIDADO', 'PLANSAL', 'PLANREP', 'PLANEDU'],
    dangerLevel: 'HIGH',
  },
  {
    id: 'chain-6',
    name: 'Cadena Territorial-Soberana',
    description: 'PLANTER necesita PLANSEG (protección de defensores y Guardacostas), PLANJUS (co-jurisdicción originaria) y PLANDIG (monitoreo satelital). El FSC que produce ancla al Fondo Soberano de PLANMON: si la cadena falla, la soberanía monetaria pierde su respaldo en activos reales.',
    plans: ['PLANTER', 'PLANSEG', 'PLANJUS', 'PLANDIG', 'PLANMON'],
    dangerLevel: 'HIGH',
  },
  {
    id: 'chain-7',
    name: 'Cadena de Movilidad',
    description: 'PLANMOV depende de PLANDIG (MKC/BLF/LNMA sobre ArgenCloud), PLANREP (Reconversión Móvil de 500.000 transportistas), PLANEB (BLF, Bastarda Fluvial, BAMD) y PLANEN (electrificación de la traza). El Doble Desplazamiento sin reconversión laboral es un estallido social programado.',
    plans: ['PLANMOV', 'PLANDIG', 'PLANREP', 'PLANEB', 'PLANEN'],
    dangerLevel: 'CRITICAL',
  },
  {
    id: 'chain-8',
    name: 'Cadena Urbano-Productiva y Cultural',
    description: 'PLAN24CN necesita PLANISV (suelo regenerado), PLANAGUA (red hídrica), PLANEN (Bastarda Energética antes de los primeros residentes) y PLANEB (ciudades Bastarda-nativas). PLANCUL y PLANGEO cosechan esta cadena: las ciudades son lienzo cultural y vidriera exportable del modelo.',
    plans: ['PLAN24CN', 'PLANISV', 'PLANAGUA', 'PLANEN', 'PLANEB', 'PLANCUL', 'PLANGEO'],
    dangerLevel: 'HIGH',
  },
  {
    id: 'chain-9',
    name: 'Cadena del Arco de la Vida',
    description: 'PLANARCO es el nodo más dependiente del corpus: seis dependencias críticas —PLANCUIDADO (valida las horas del Tramo Ganado), PLANMON (capa previsional), PLANTER (fondo del Tramo Común), PLANDIG (el hecho registrado que viaja solo), PLANSAL (los primeros mil días) y PLANREP (Dividendo de Productividad)— y ninguna capacidad crítica que devolver. Administra el 45-50% del presupuesto nacional con máxima criticidad entrante. Las seis traen modo degradado escrito, y dos ya están corriendo en degradado: el Tramo Común está declarado y no financiado, y la regla de absorción no computa nada hasta que el dividendo exista.',
    plans: ['PLANARCO', 'PLANCUIDADO', 'PLANMON', 'PLANTER', 'PLANDIG', 'PLANSAL', 'PLANREP'],
    dangerLevel: 'CRITICAL',
  },
  {
    id: 'chain-10',
    name: 'Cadena del Fondo Soberano Ciudadano',
    description: 'PLANTER es dueño del FSC, y de ahí cuelgan dos PLANes nuevos que no se conocen entre sí: el Tramo Común de PLANARCO y los ocho puntos del Fondo de la Pregunta de PLANPREGUNTA. Es la dependencia sin sustituto declarado del corpus — PLANPREGUNTA escribe que para su régimen pleno no hay modo degradado y que inventar una fuente de reemplazo sería menos honesto que decirlo. Si el FSC se demora o se reparte de otro modo, los dos se enteran tarde y por separado.',
    plans: ['PLANTER', 'PLANARCO', 'PLANPREGUNTA'],
    dangerLevel: 'HIGH',
  },
];

// === CONSOLIDATED METRICS ===
// Computadas en vivo desde PLAN_NODES/DEPENDENCIES — nunca volver a hardcodear:
// los valores a mano quedaron desactualizados tres veces seguidas.

/** Aristas de dependencia real (excluye anotaciones espejo 'provides'). */
export const REQUIRES_DEPENDENCIES = DEPENDENCIES.filter(d => d.kind !== 'provides');

/**
 * Suma los pisos constitucionales BRUTOS declarados por los documentos.
 *
 * Bruto, no neto: varios PLANes se autofinancian en parte (PLANSEG con
 * reasignación de gasto de seguridad, PLANVIV con repagos de la Bastarda
 * Inmobiliaria), y ese descuento se discute en PRESUPUESTO_CONSOLIDADO_BASTA.md.
 * Acá se suma la obligación legal, que es lo que consume Techo.
 */
/**
 * PLANes cuyo piso **sustituye** a los demás en vez de sumarse a ellos.
 *
 * PLANPACTO declara un piso ÚNICO del 2,40% del PBI (7,5% del gasto primario
 * consolidado) que es **bruto y sustitutivo**: reemplaza los diecisiete pisos que
 * los otros PLANes reclamaban. Sumarlo a ellos da 10,22-11,81% del PBI, que es
 * exactamente la lectura aditiva que ese PLAN existe para impedir — y es el
 * número que este grafo empezó a computar solo el día que se cargó el nodo.
 */
export const PISOS_SUSTITUTIVOS = new Set(['PLANPACTO']);

/**
 * Lo que el ecosistema reclamaba ANTES de la sustitución: la suma de los pisos
 * declarados por cada PLAN, uno por uno. Es el hallazgo que funda a PLANPACTO
 * —el proyecto no sabía cuánto estaba pidiendo— y por eso no se borra al
 * sustituir: se conserva como la cuenta de la que se viene.
 */
function sumConstitutionalFloorsGross(): string {
  let low = 0;
  let high = 0;
  for (const plan of PLAN_NODES) {
    if (!plan.constitutionalFloor) continue;
    if (PISOS_SUSTITUTIVOS.has(plan.id)) continue;
    const nums = plan.constitutionalFloor.match(/\d+(?:\.\d+)?/g);
    if (!nums || nums.length === 0) continue;
    const values = nums.map(Number);
    low += values[0];
    high += values.length > 1 ? values[1] : values[0];
  }
  return `${low.toFixed(2)}-${high.toFixed(2)}% PBI`;
}

/**
 * Lo que el ecosistema reclama DESPUÉS de la sustitución. Si hay un piso
 * sustitutivo, es ése y nada más; si no lo hay, es la suma de arriba.
 */
function constitutionalFloorEffective(): string {
  const sustitutivos = PLAN_NODES.filter((p) => PISOS_SUSTITUTIVOS.has(p.id) && p.constitutionalFloor);
  if (sustitutivos.length === 0) return sumConstitutionalFloorsGross();
  let low = 0;
  let high = 0;
  for (const plan of sustitutivos) {
    const nums = plan.constitutionalFloor?.match(/\d+(?:\.\d+)?/g);
    if (!nums || nums.length === 0) continue;
    const values = nums.map(Number);
    low += values[0];
    high += values.length > 1 ? values[1] : values[0];
  }
  return `${low.toFixed(2)}-${high.toFixed(2)}% PBI`;
}

export const ECOSYSTEM_METRICS = {
  totalPlans: PLAN_NODES.length,
  totalBudgetLow: PLAN_NODES.reduce((sum, p) => sum + p.budgetLow, 0),   // USD millions
  totalBudgetHigh: PLAN_NODES.reduce((sum, p) => sum + p.budgetHigh, 0), // USD millions
  totalLegalInstruments: PLAN_NODES.reduce((sum, p) => sum + p.legalInstruments, 0),
  /** Los pisos que los PLANes reclamaban uno por uno, sin PLANPACTO. El hallazgo. */
  constitutionalFloorGross: sumConstitutionalFloorsGross(),
  /** Lo que queda en pie después de la sustitución de PLANPACTO: el piso único. */
  constitutionalFloorEffective: constitutionalFloorEffective(),
  timelineHorizon: Math.max(...TIMELINE_PHASES.map(p => p.endYear)),
  totalDependencies: REQUIRES_DEPENDENCIES.length,
  criticalDependencies: REQUIRES_DEPENDENCIES.filter(d => d.nature === 'CRITICAL').length,
  agencies: new Set(PLAN_NODES.map(p => p.agency).filter(Boolean)).size,
};

// === HELPER FUNCTIONS ===

export function getPlanById(id: string): PlanNode | undefined {
  return PLAN_NODES.find(p => p.id === id);
}

export function getDependenciesForPlan(planId: string): { incoming: Dependency[]; outgoing: Dependency[] } {
  // Solo aristas reales: las anotaciones 'provides' duplicarían cada vínculo.
  return {
    incoming: REQUIRES_DEPENDENCIES.filter(d => d.target === planId),
    outgoing: REQUIRES_DEPENDENCIES.filter(d => d.source === planId),
  };
}

/** Anotaciones 'provides' (lado proveedor de cada vínculo) para lectura en UI. */
export function getProvisionsForPlan(planId: string): { provides: Dependency[]; receivedFrom: Dependency[] } {
  const provides = DEPENDENCIES.filter(d => d.kind === 'provides' && d.source === planId);
  const receivedFrom = DEPENDENCIES.filter(d => d.kind === 'provides' && d.target === planId);
  return { provides, receivedFrom };
}

export function getPlanPhases(planId: string): TimelinePhase[] {
  return TIMELINE_PHASES.filter(p => p.planId === planId);
}

export function getInDegree(planId: string): number {
  return REQUIRES_DEPENDENCIES.filter(d => d.target === planId).length;
}

export function simulateFailure(planId: string): { directlyAffected: string[]; cascadeAffected: string[] } {
  // Recorre SOLO aristas 'requires': con las anotaciones espejo incluidas, cualquier
  // falla cascadeaba a ~todo el ecosistema y la simulación no discriminaba nada.
  const direct = REQUIRES_DEPENDENCIES
    .filter(d => d.target === planId && d.nature === 'CRITICAL')
    .map(d => d.source);

  const cascadeSet = new Set<string>(direct);
  let frontier = [...direct];
  while (frontier.length > 0) {
    const next: string[] = [];
    for (const p of frontier) {
      const affected = REQUIRES_DEPENDENCIES
        .filter(d => d.target === p && d.nature === 'CRITICAL')
        .map(d => d.source)
        .filter(s => !cascadeSet.has(s));
      affected.forEach(a => { cascadeSet.add(a); next.push(a); });
    }
    frontier = next;
  }

  return {
    directlyAffected: direct,
    cascadeAffected: [...cascadeSet].filter(p => !direct.includes(p)),
  };
}
