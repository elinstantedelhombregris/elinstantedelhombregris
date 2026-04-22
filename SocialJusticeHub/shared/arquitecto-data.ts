// El Arquitecto — Structured ecosystem data for the ¡BASTA! strategic planning platform
// Extracted from 22 PLANes + support documents (April 2026)

import type { MissionSlug, TemporalOrder, InitiativePriority, InitiativeState } from './strategic-initiatives';

export type DependencyNature = 'CRITICAL' | 'IMPORTANT' | 'MINOR';
export type DependencyType = 'FINANCIAL' | 'INSTITUTIONAL' | 'TECHNICAL' | 'LEGAL' | 'LABOR' | 'DATA' | 'TEMPORAL';
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
  source: string; // plan that DEPENDS
  target: string; // plan depended ON
  nature: DependencyNature;
  type: DependencyType;
  description: string;
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

export const PLAN_NODES: PlanNode[] = [
  {
    id: 'PLANJUS', name: 'Plan Nacional de Justicia Popular', ordinal: 1,
    category: 'justicia', agency: 'ANJUS', agencyFull: 'Agencia Nacional de Justicia Popular',
    organMetaphor: 'sistema inmunológico', organLabel: 'Immune System',
    status: 'PUBLISHED', budgetLow: 3300, budgetHigh: 5700, timelineYears: 10,
    legalInstruments: 6, constitutionalFloor: '0.25-0.30% PBI',
    mainSource: 'Reasignación presupuesto judicial + tasas comerciales',
    color: '#f59e0b', slug: 'planjus-justicia-popular',
    missionSlug: 'instituciones-y-futuro', temporalOrder: 'transicion', priority: 'media', state: 'ambar',
  },
  {
    id: 'PLANREP', name: 'Plan Nacional de Reconversión del Empleo Público', ordinal: 2,
    category: 'economia', agency: 'ANREP', agencyFull: 'Agencia Nacional de Reconversión del Empleo Público',
    organMetaphor: 'metabolismo', organLabel: 'Metabolism',
    status: 'PUBLISHED', budgetLow: 15000, budgetHigh: 25000, timelineYears: 20,
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
    category: 'tecnologia', agency: 'ANDIG', agencyFull: 'Agencia Nacional de Infraestructura Digital',
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
    status: 'PUBLISHED', budgetLow: 6000, budgetHigh: 6000, timelineYears: 10,
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
    category: 'medio-ambiente', agency: 'ANAGUA', agencyFull: 'Agencia Nacional del Agua',
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
    status: 'PUBLISHED', budgetLow: 14200, budgetHigh: 14200, timelineYears: 10,
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
    legalInstruments: 1, constitutionalFloor: '0.50% PBI',
    mainSource: 'Inversión privada condicionada (35%) + multilaterales + reasignación subsidios',
    color: '#64748b', slug: 'planen-soberania-energetica',
    missionSlug: 'la-base-esta', secondaryMissionSlug: 'produccion-y-suelo-vivo', temporalOrder: 'transicion', priority: 'media', state: 'ambar',
  },
  {
    id: 'PLANSEG', name: 'Plan Nacional de Seguridad Ciudadana', ordinal: 14,
    category: 'instituciones', agency: 'ANSEG', agencyFull: 'Agencia Nacional de Seguridad Ciudadana',
    organMetaphor: 'guardián', organLabel: 'Guardian',
    status: 'PUBLISHED', budgetLow: 3000, budgetHigh: 6000, timelineYears: 15,
    legalInstruments: 1, constitutionalFloor: '0.05-0.10% PBI neto',
    mainSource: 'Reasignación gasto seguridad (60%) + presupuesto nacional + multilaterales',
    color: '#6366f1', slug: 'planseg-seguridad-ciudadana',
    missionSlug: 'la-base-esta', secondaryMissionSlug: 'instituciones-y-futuro', temporalOrder: 'emergencia', priority: 'alta', state: 'ambar',
  },
  {
    id: 'PLANVIV', name: 'Plan Nacional de Vivienda Digna', ordinal: 15,
    category: 'infraestructura', agency: 'ANVIV', agencyFull: 'Agencia Nacional de Vivienda Digna y Hábitat',
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
    legalInstruments: 2, constitutionalFloor: '0.08% PBI',
    mainSource: 'Reasignación programas empleo + convenio galpones públicos + Red Bastarda',
    color: '#f97316', slug: 'plantaller-talleres-federales',
    missionSlug: 'produccion-y-suelo-vivo', temporalOrder: 'transicion', priority: 'alta', state: 'verde',
  },
  {
    id: 'PLANCUIDADO', name: 'Plan Nacional de Cuidado y Vínculo', ordinal: 19,
    category: 'salud', agency: 'ANCV', agencyFull: 'Agencia Nacional de Cuidado y Vínculo',
    organMetaphor: 'capa cero', organLabel: 'Zero Layer',
    status: 'PUBLISHED', budgetLow: 30000, budgetHigh: 45000, timelineYears: 15,
    legalInstruments: 5, constitutionalFloor: '0.75-1.1% PBI',
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
];

// === DEPENDENCIES (~41 critical edges) ===

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
  { id: 'd77', source: 'PLANDIG', target: 'PLANMON', nature: 'CRITICAL', type: 'TECHNICAL', description: 'IDS provee los nodos soberanos sobre los cuales corren los rieles SAPI y el registro del Pulso monetario' },
  { id: 'd78', source: 'PLANDIG', target: 'PLANEB', nature: 'CRITICAL', type: 'TECHNICAL', description: 'IDS provee el substrato on-chain y los servicios federados que el Protocolo Bastardo necesita para operar sin dependencias extranjeras' },
  { id: 'd79', source: 'PLANDIG', target: 'PLAN24CN', nature: 'CRITICAL', type: 'TECHNICAL', description: 'IDS + SAPI + El Mapa proveen la capa operativa de las ciudades inteligentes antes de que reciban residentes' },
  { id: 'd80', source: 'PLANDIG', target: 'PLANAGUA', nature: 'CRITICAL', type: 'DATA', description: 'ArgenCloud y la Red IoT soberana alojan el Gemelo Digital del Agua y la telemetría de cuencas' },
  { id: 'd81', source: 'PLANDIG', target: 'PLANJUS', nature: 'IMPORTANT', type: 'TECHNICAL', description: 'LANIA y la plataforma de Resolución Popular proveen el modelo IA legal y la traza digital de disputas' },
  { id: 'd82', source: 'PLANDIG', target: 'PLANSEG', nature: 'IMPORTANT', type: 'TECHNICAL', description: 'Red soberana provee cadena de custodia criptográfica a body cams, video IA y sensores urbanos' },
  { id: 'd83', source: 'PLANDIG', target: 'PLANVIV', nature: 'IMPORTANT', type: 'TECHNICAL', description: 'Housing OS y el registro digital de títulos de propiedad corren sobre nodos IDS con firma criptográfica soberana' },
  { id: 'd84', source: 'PLANDIG', target: 'PLANEN', nature: 'IMPORTANT', type: 'TECHNICAL', description: 'IDS provee Smart Grid IoT y Tablero Nacional de Energía con telemetría en tiempo real sobre nodos federados' },
  { id: 'd85', source: 'PLANDIG', target: 'PLANEDU', nature: 'IMPORTANT', type: 'TECHNICAL', description: 'Plataforma de Aprendizaje Adaptativo (PAA) corre sobre ArgenCloud con modelos educativos abiertos y gobernanza pública' },

  // Inversas de PLANJUS (sistema inmunológico) → demandantes de justicia
  { id: 'd86', source: 'PLANJUS', target: 'PLANEB', nature: 'CRITICAL', type: 'INSTITUTIONAL', description: 'Resolución Popular resuelve disputas de usuarios de cada Bastarda en primera instancia no-jurisdiccional, con apelación a JUS formal' },
  { id: 'd87', source: 'PLANJUS', target: 'PLANMON', nature: 'CRITICAL', type: 'INSTITUTIONAL', description: 'Sala Financiera de JUS arbitra disputas on-chain del Pulso y del Fondo Soberano con enforcement automatizado' },
  { id: 'd88', source: 'PLANJUS', target: 'PLANSUS', nature: 'IMPORTANT', type: 'INSTITUTIONAL', description: 'Sala de Sustancias resuelve conflictos de licencias, zonificación y disputas comunitarias sobre uso de sustancias' },
  { id: 'd89', source: 'PLANJUS', target: 'PLANVIV', nature: 'IMPORTANT', type: 'INSTITUTIONAL', description: 'Sala de Propiedad resuelve disputas de inquilinos, fideicomisos y títulos digitales de vivienda' },

  // Inversa de PLANSUS→PLANSEG (d16/d17 comparten esta inversa)
  { id: 'd90', source: 'PLANSEG', target: 'PLANSUS', nature: 'CRITICAL', type: 'TEMPORAL', description: 'Reforma policial + 250+ EB operativas + protocolo GREEN/YELLOW/RED son precondición para la legalización escalonada: PLANSEG marca el pulso temporal de la transición narco' },

  // Inversas de PLANEN
  { id: 'd91', source: 'PLANEN', target: 'PLAN24CN', nature: 'CRITICAL', type: 'TECHNICAL', description: 'Bastarda Energética y red 100% renovable provistas antes de que cada Ciudad Nueva reciba residentes' },
  { id: 'd92', source: 'PLANEN', target: 'PLANMON', nature: 'CRITICAL', type: 'FINANCIAL', description: 'Regalías energéticas (USD 800M-3500M+/año) por hidrocarburos, minería y renovables capitalizan el Fondo Soberano Ciudadano' },

  // Inversas de PLANREP (motor fiscal)
  { id: 'd93', source: 'PLANREP', target: 'PLANEDU', nature: 'CRITICAL', type: 'FINANCIAL', description: '15% del ahorro neto fiscal de la reconversión financia el lanzamiento de PLANEDU; además los graduados del Camino se convierten en Maestros de Oficio docentes' },
  { id: 'd94', source: 'PLANREP', target: 'PLANVIV', nature: 'IMPORTANT', type: 'LABOR', description: 'Artesanos del Refugio formados por PLANREP construyen y retrofitean las 1800 urbanizaciones planificadas' },
  { id: 'd95', source: 'PLANREP', target: 'PLANSEG', nature: 'IMPORTANT', type: 'LABOR', description: 'Oficiales reconvertidos de fuerzas desmanteladas migran a seguridad comunitaria y enforcement sin violencia' },

  // Inversas de PLAN24CN
  { id: 'd96', source: 'PLANISV', target: 'PLAN24CN', nature: 'CRITICAL', type: 'TECHNICAL', description: 'Suelo regenerado y balances agua-suelo-carbono recalibrados se destinan a agricultura urbana y anillos verdes de las Ciudades Nuevas' },
  { id: 'd97', source: 'PLANAGUA', target: 'PLAN24CN', nature: 'IMPORTANT', type: 'TECHNICAL', description: 'Red hídrica troncal, acueductos y tratamiento provistos por ANAGUA cuando la ciudad pasa de diseño a ocupación' },
  { id: 'd98', source: 'PLANEB', target: 'PLAN24CN', nature: 'CRITICAL', type: 'INSTITUTIONAL', description: 'Red Bastarda aloja al costo todos los servicios urbanos de las 24 ciudades: energía, agua, telecomunicaciones y transporte' },

  // Inversas de PLANVIV (transversal)
  { id: 'd99', source: 'PLANMON', target: 'PLANVIV', nature: 'IMPORTANT', type: 'FINANCIAL', description: 'Peso-canasta denomina el Crédito Hipotecario Bastardo; el Pulso provee liquidez estable a la vivienda familiar' },
  { id: 'd100', source: 'PLANEB', target: 'PLANVIV', nature: 'IMPORTANT', type: 'INSTITUTIONAL', description: 'Protocolo Bastardo implementa el fideicomiso perpetuo de la Bastarda Inmobiliaria: propiedad perpetua del ocupante, no especulable' },
  { id: 'd101', source: 'PLANAGUA', target: 'PLANVIV', nature: 'IMPORTANT', type: 'TECHNICAL', description: 'Co-ejecución hídrica con ANAGUA para las 1800 urbanizaciones nuevas: conexión, tratamiento y rehúso' },
  { id: 'd102', source: 'PLANSEG', target: 'PLANVIV', nature: 'IMPORTANT', type: 'INSTITUTIONAL', description: 'Protocolos CPTED (prevención del delito por diseño ambiental) aplicados en urbanizaciones y retrofits' },

  // Inversas de PLANGEO (modelo que se exporta)
  { id: 'd103', source: 'PLANDIG', target: 'PLANGEO', nature: 'IMPORTANT', type: 'INSTITUTIONAL', description: 'IDS produce ArgenCloud como producto exportable que PLANGEO comercializa en la Red Soberana de América Latina' },
  { id: 'd104', source: 'PLANSUS', target: 'PLANGEO', nature: 'IMPORTANT', type: 'LEGAL', description: 'Cuerpo legal de salida de convenciones internacionales de drogas provisto por PLANSUS permite a PLANGEO ejecutar la cascada diplomática' },
  { id: 'd105', source: 'PLANMON', target: 'PLANGEO', nature: 'IMPORTANT', type: 'INSTITUTIONAL', description: 'Peso-canasta y Pulso son exportables como estándar monetario regional para el comercio Mercosur' },
  { id: 'd106', source: 'PLANEB', target: 'PLANGEO', nature: 'IMPORTANT', type: 'INSTITUTIONAL', description: 'Protocolo Bastardo open-source es la pieza central del estándar internacional de empresas al costo que PLANGEO promociona' },

  // Inversas de PLANCUL (hospedaje cultural)
  { id: 'd107', source: 'PLAN24CN', target: 'PLANCUL', nature: 'IMPORTANT', type: 'INSTITUTIONAL', description: 'Las Ciudades Nuevas son lienzos donde Dendritas (células culturales) nacen nativas en comunidades vírgenes' },
  { id: 'd108', source: 'PLANREP', target: 'PLANCUL', nature: 'IMPORTANT', type: 'INSTITUTIONAL', description: 'Centros de la Vida (ex-oficinas públicas reconvertidas) son los puntos físicos de reunión donde cristaliza la comunidad cultural' },
  { id: 'd109', source: 'PLANEDU', target: 'PLANCUL', nature: 'IMPORTANT', type: 'INSTITUTIONAL', description: 'La escuela enseña Rondas de Escucha desde primaria: los niños crecen como Dendritas nativas' },
  { id: 'd110', source: 'PLANVIV', target: 'PLANCUL', nature: 'IMPORTANT', type: 'INSTITUTIONAL', description: 'Barrios urbanizados proveen el tejido social territorial sobre el cual se reconstruye la cultura comunitaria' },

  // Inversas de data/financial flows transversales
  { id: 'd111', source: 'PLANMON', target: 'PLANISV', nature: 'IMPORTANT', type: 'DATA', description: 'El Pulso consume la telemetría de producción agrícola y rendimientos de Suelo Vivo como insumo para la estabilidad del peso-canasta' },
  { id: 'd112', source: 'PLANMON', target: 'PLANSUS', nature: 'IMPORTANT', type: 'FINANCIAL', description: 'El Fondo Soberano Ciudadano absorbe la recaudación fiscal de sustancias legalizadas como uno de sus pilares de capitalización' },
  { id: 'd113', source: 'PLANSUS', target: 'PLANSAL', nature: 'IMPORTANT', type: 'INSTITUTIONAL', description: 'PLANSUS habilita el uso terapéutico de sustancias e incluidos psicodélicos; los protocolos clínicos resultantes alimentan la medicina mental de PLANSAL' },

  // Inversas de PLANMESA (ciclo LDEA)
  { id: 'd114', source: 'PLANDIG', target: 'PLANMESA', nature: 'CRITICAL', type: 'TECHNICAL', description: 'IDS aloja la plataforma de auto-postulación, la Credencial de Materia y la Cédula Civil sobre nodos federados soberanos' },
  { id: 'd115', source: 'PLANEDU', target: 'PLANMESA', nature: 'CRITICAL', type: 'INSTITUTIONAL', description: 'A partir de Fase 1: PLANEDU construye la Capa de Estudio de la Credencial de Materia — currículum obligatorio y evaluación continua de servidores de Mesa' },
  { id: 'd116', source: 'PLANMEMORIA', target: 'PLANMESA', nature: 'CRITICAL', type: 'INSTITUTIONAL', description: 'PLANMEMORIA opera la Consulta Ancestral obligatoria en Fase APRENDER: el archivo federado responde en cada ciclo LDEA' },
  { id: 'd117', source: 'PLANTALLER', target: 'PLANMESA', nature: 'CRITICAL', type: 'INSTITUTIONAL', description: 'Tallers son los ejecutores operativos de Fase EXPERIMENTAR: prototipan, miden y retornan hallazgos a Mesa' },
  { id: 'd118', source: 'PLANCUIDADO', target: 'PLANMESA', nature: 'IMPORTANT', type: 'INSTITUTIONAL', description: 'Red de Cuidado provee la Capa de Vínculo de la Credencial y el sostén relacional de quienes sirven en Mesa' },
  { id: 'd119', source: 'PLANJUS', target: 'PLANMESA', nature: 'IMPORTANT', type: 'INSTITUTIONAL', description: 'JUS aporta control legal de las Resoluciones de Mesa y arbitra disputas sobre auto-postulación o Credenciales revocadas' },

  // Inversas de PLANTALLER (red productiva)
  { id: 'd120', source: 'PLANEB', target: 'PLANTALLER', nature: 'CRITICAL', type: 'INSTITUTIONAL', description: 'Red Bastarda es el canal de distribución at-cost de todo lo que produce la Red Taller: insumos a Bastardas y excedentes al mercado popular' },
  { id: 'd121', source: 'PLANDIG', target: 'PLANTALLER', nature: 'IMPORTANT', type: 'TECHNICAL', description: 'Protocolo Taller corre sobre ArgenCloud como plataforma federada de inventario, hallazgos y coordinación inter-Taller' },
  { id: 'd122', source: 'PLANREP', target: 'PLANTALLER', nature: 'IMPORTANT', type: 'LABOR', description: 'Empleo público reconvertido se redirige hacia coordinación, mentoría técnica y gestión operativa de los Tallers federales' },

  // Inversas de PLANCUIDADO (capa cero del pacto)
  { id: 'd123', source: 'PLANSAL', target: 'PLANCUIDADO', nature: 'CRITICAL', type: 'INSTITUTIONAL', description: 'A partir de Fase 1: APS territorial provee la ventana clínica que lee Pactos como dato de salud; Referentes articulan con médicos de cabecera' },
  { id: 'd124', source: 'PLANREP', target: 'PLANCUIDADO', nature: 'CRITICAL', type: 'LABOR', description: 'Cuidadoras domiciliarias informales son reconvertidas por PLANREP en Referentes Territoriales con salario, formación y protección' },
  { id: 'd125', source: 'PLANEDU', target: 'PLANCUIDADO', nature: 'IMPORTANT', type: 'INSTITUTIONAL', description: 'PLANEDU incluye currículum de cuidado desde primaria y formación inicial diferenciada para cada tipo de Pacto' },
  { id: 'd126', source: 'PLANJUS', target: 'PLANCUIDADO', nature: 'IMPORTANT', type: 'INSTITUTIONAL', description: 'JUS provee mediación de disputas de Pactos en primera instancia no-jurisdiccional antes de escalar al sistema formal' },
  { id: 'd127', source: 'PLANDIG', target: 'PLANCUIDADO', nature: 'IMPORTANT', type: 'TECHNICAL', description: 'IDS aloja el Registro Nacional de Vínculos, el Libro de Cuidado y la Alerta de Soledad Total con criptografía y consentimiento granular' },

  // Inversas de PLANMEMORIA (archivo federado)
  { id: 'd128', source: 'PLANDIG', target: 'PLANMEMORIA', nature: 'CRITICAL', type: 'TECHNICAL', description: 'IDS provee los 7 nodos federados con hash criptográfico resistente a borrado donde vive el archivo distribuido de la Memoria' },
  { id: 'd129', source: 'PLANEDU', target: 'PLANMEMORIA', nature: 'CRITICAL', type: 'INSTITUTIONAL', description: 'A partir de Fase 1: la escuela incorpora el rito cívico del Bastón Memorial a los 12 años como ceremonia de ingreso a la memoria activa' },
  { id: 'd130', source: 'PLANJUS', target: 'PLANMEMORIA', nature: 'IMPORTANT', type: 'INSTITUTIONAL', description: 'JUS coopera con la Inscripción de Captura en investigaciones sin sustituir su función mnémica autónoma' },

  // Inversas de PLANTER (soberanía territorial)
  { id: 'd131', source: 'PLANSEG', target: 'PLANTER', nature: 'CRITICAL', type: 'INSTITUTIONAL', description: 'PLANSEG extiende protección formal a defensores territoriales y amplía la Guardia Costera para soberanía marítima' },
  { id: 'd132', source: 'PLANJUS', target: 'PLANTER', nature: 'CRITICAL', type: 'INSTITUTIONAL', description: 'JUS implementa la co-jurisdicción con derecho originario y arbitra disputas territoriales entre pueblos y Estado' },
  { id: 'd133', source: 'PLANDIG', target: 'PLANTER', nature: 'CRITICAL', type: 'TECHNICAL', description: 'IDS provee monitoreo satelital soberano, registro ciudadano territorial y dashboard público del Dividendo del Suelo' },
  { id: 'd134', source: 'PLANCUIDADO', target: 'PLANTER', nature: 'IMPORTANT', type: 'INSTITUTIONAL', description: 'La red de Pactos reconoce y formaliza los parentescos interculturales de comunidades originarias como Pactos Interculturales' },
  { id: 'd135', source: 'PLANMEMORIA', target: 'PLANTER', nature: 'IMPORTANT', type: 'DATA', description: 'PLANMEMORIA aloja el Archivo Territorial con los depósitos testimoniales y documentales de comunidades originarias' },
  { id: 'd136', source: 'PLANTER', target: 'PLANMON', nature: 'IMPORTANT', type: 'FINANCIAL', description: 'El Dividendo del Suelo y el FSC son la palanca territorial que ancla al Fondo Soberano Ciudadano en activos reales' },
  { id: 'd137', source: 'PLANTER', target: 'PLANEN', nature: 'IMPORTANT', type: 'LEGAL', description: 'Licencia Territorial (reemplazo del RIGI) condiciona cualquier proyecto hidrocarburífero o minero a consulta previa y retorno comunitario' },

  // Inversas de PLANMOV (arterias logísticas)
  { id: 'd138', source: 'PLANMESA', target: 'PLANMOV', nature: 'IMPORTANT', type: 'INSTITUTIONAL', description: 'Mesas Civiles de Corredor son los cuerpos deliberativos que priorizan la reactivación ferroviaria kilómetro por kilómetro' },
  { id: 'd139', source: 'PLANMEMORIA', target: 'PLANMOV', nature: 'IMPORTANT', type: 'DATA', description: 'Archivo Técnico Ferroviario (con depósitos de ex-ferroviarios) aloja el conocimiento operativo histórico de los 25.000 km de red' },
  { id: 'd140', source: 'PLANEN', target: 'PLANMOV', nature: 'IMPORTANT', type: 'TECHNICAL', description: 'Red eléctrica + fibra sobre la misma traza ferroviaria: PLANEN electrifica la red reactivada con energía renovable soberana' },
  { id: 'd141', source: 'PLANDIG', target: 'PLANMOV', nature: 'CRITICAL', type: 'TECHNICAL', description: 'IDS + LANIA alojan la gestión de MKC, BLF, Red Federal de Puertos y el Laboratorio Nacional de Movilidad Autónoma con data-logging obligatorio' },
  { id: 'd142', source: 'PLANREP', target: 'PLANMOV', nature: 'CRITICAL', type: 'LABOR', description: 'Cuadros técnicos ferroviarios y portuarios son reconvertidos por PLANREP; la Ruta "Reconversión Móvil" absorbe 500.000 transportistas desplazados por automatización' },
  { id: 'd143', source: 'PLANEB', target: 'PLANMOV', nature: 'CRITICAL', type: 'INSTITUTIONAL', description: 'Bastarda Logística Federal, Bastarda Fluvial y BAMD son las formas bastardas que operan canales at-cost y redistribuyen el Canon de Automatización Logística' },

  // Inversas de conexiones nuevas (d75, d76)
  { id: 'd144', source: 'PLANDIG', target: 'PLANSAL', nature: 'CRITICAL', type: 'TECHNICAL', description: 'IDS aloja la Historia Clínica Unificada, telemedicina rural y el Registro de Salud Integral con criptografía y consentimiento explícito del paciente' },
  { id: 'd145', source: 'PLANTER', target: 'PLANISV', nature: 'IMPORTANT', type: 'INSTITUTIONAL', description: 'PLANTER provee la Licencia Territorial y el marco de co-soberanía indígena donde PLANISV regenera suelo en tierras fiscales y comunidades originarias' },
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
  { planId: 'PLANJUS', name: 'Pre-Fase — Diseño del Nuevo Código y Selección de Salas', startYear: -1, endYear: -1 },
  { planId: 'PLANJUS', name: 'Fase 1', startYear: 0, endYear: 2 },
  { planId: 'PLANJUS', name: 'La Preferencia', startYear: 3, endYear: 7 },
  { planId: 'PLANJUS', name: 'La Sucesión Natural', startYear: 8, endYear: 10 },
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
  { planId: 'PLANMON', name: 'Diseño Fundacional — Auditoría BCRA + Marco Legal del Pulso', startYear: -1, endYear: -1 },
  { planId: 'PLANMON', name: 'Pre-Fase', startYear: 2, endYear: 2 },
  { planId: 'PLANMON', name: 'Pulso Beta', startYear: 3, endYear: 3 },
  { planId: 'PLANMON', name: 'Expansión', startYear: 4, endYear: 5 },
  { planId: 'PLANMON', name: 'Desdolarización', startYear: 7, endYear: 10 },
  { planId: 'PLANMON', name: 'Pulso Dominante', startYear: 11, endYear: 15 },
  // PLANSUS
  { planId: 'PLANSUS', name: 'Pre-Fase — Estudios Epidemiológicos y Ley Marco', startYear: -1, endYear: -1 },
  { planId: 'PLANSUS', name: 'El Alivio', startYear: 1, endYear: 1 },
  { planId: 'PLANSUS', name: 'La Expansión', startYear: 2, endYear: 3 },
  { planId: 'PLANSUS', name: 'La Soberanía', startYear: 4, endYear: 5 },
  // PLANEDU
  { planId: 'PLANEDU', name: 'Pre-Fase — Diseño Curricular y Movilización Docente', startYear: -1, endYear: 0 },
  { planId: 'PLANEDU', name: 'Escudo', startYear: 1, endYear: 7 },
  { planId: 'PLANEDU', name: 'Transición', startYear: 8, endYear: 14 },
  { planId: 'PLANEDU', name: 'Abundancia', startYear: 15, endYear: 20 },
  // PLANSAL
  { planId: 'PLANSAL', name: 'Pre-Fase — Diagnóstico Sanitario Nacional', startYear: -1, endYear: -1 },
  { planId: 'PLANSAL', name: 'Demostrar', startYear: 1, endYear: 2 },
  { planId: 'PLANSAL', name: 'Escalar', startYear: 3, endYear: 5 },
  { planId: 'PLANSAL', name: 'Consolidar', startYear: 6, endYear: 10 },
  // PLANISV
  { planId: 'PLANISV', name: 'Pre-Fase — Mapeo de Suelos Degradados y Ley ANSV', startYear: -1, endYear: -1 },
  { planId: 'PLANISV', name: 'Demostrar', startYear: 0, endYear: 0 },
  { planId: 'PLANISV', name: 'Regionalizar', startYear: 1, endYear: 2 },
  { planId: 'PLANISV', name: 'Escala Nacional', startYear: 3, endYear: 10 },
  { planId: 'PLANISV', name: 'Consolidación', startYear: 11, endYear: 15 },
  // PLANAGUA
  { planId: 'PLANAGUA', name: 'Pre-Fase — Diagnóstico Hídrico Nacional', startYear: -1, endYear: -1 },
  { planId: 'PLANAGUA', name: 'Emergencia', startYear: 2, endYear: 2 },
  { planId: 'PLANAGUA', name: 'Infraestructura', startYear: 3, endYear: 5 },
  { planId: 'PLANAGUA', name: 'Modernización', startYear: 6, endYear: 8 },
  { planId: 'PLANAGUA', name: 'Excelencia', startYear: 9, endYear: 10 },
  // PLAN24CN
  { planId: 'PLAN24CN', name: 'Pre-Fase — Censo de Sitios y Diseño Urbano', startYear: -1, endYear: -1 },
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
  { planId: 'PLANTER', name: 'Pre-Fase — Diagnóstico Territorial y Consulta Previa', startYear: -1, endYear: -1 },
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
];

// === CRITICAL CHAINS ===

export const CRITICAL_CHAINS: CriticalChain[] = [
  {
    id: 'chain-1',
    name: 'Cadena Institucional-Monetaria',
    description: 'PLANDIG → PLANJUS → PLANDIG formal → PLANREP → PLANMON. Si PLANDIG se retrasa, todo el sistema monetario se retrasa.',
    plans: ['PLANDIG', 'PLANJUS', 'PLANREP', 'PLANEB', 'PLANMON'],
    dangerLevel: 'CRITICAL',
  },
  {
    id: 'chain-2',
    name: 'Cadena Seguridad-Sustancias',
    description: 'PLANSEG debe tener presencia visible ANTES de que PLANSUS legalice. Si PLANSEG falla, PLANSUS genera vacío de seguridad.',
    plans: ['PLANSEG', 'PLANSUS'],
    dangerLevel: 'EXTREME',
  },
  {
    id: 'chain-3',
    name: 'Cadena Vivienda Integrada',
    description: 'PLANVIV necesita PLANEB (Bastarda), PLANMON (peso-canasta), PLANAGUA (agua) y PLANSEG (CPTED) para funcionar.',
    plans: ['PLANVIV', 'PLANEB', 'PLANMON', 'PLANAGUA', 'PLANSEG'],
    dangerLevel: 'HIGH',
  },
];

// === CONSOLIDATED METRICS ===

export const ECOSYSTEM_METRICS = {
  totalPlans: 22,
  totalBudgetLow: 425600,  // USD millions (base 283000 + 6 nuevos: 137600 low + PLANMOV v2.0 +5000 low)
  totalBudgetHigh: 725000, // base 526000 + 6 nuevos: 194500 high + PLANMOV v2.0 +4500 high (99500→104000)
  totalLegalInstruments: 85, // +5 por PLANMOV v2.0 (9 leyes en lugar de 4)
  constitutionalFloorNet: '3.87-4.84% PBI', // piso PLANMOV sube 0.35% → 0.50% PBI
  timelineHorizon: 20, // years (PLANMOV v2.0 extiende Visión a 2046, mismo horizonte de ejecución 20 años)
  totalDependencies: 74, // +3 por PLANMOV v2.0 (d72-d74: LNMA↔LANIA, Reconversión Móvil, BAMD)
  criticalDependencies: 27, // +3 críticas de PLANMOV v2.0
  agencies: 21, // 15 originales + 6 nuevas agencias (AMCC, ANT, ANCV, ANM, ANTSPO, ANMov). PLANMOV v2.0 suma 4 sub-entidades: BAMD, LNMA, FRM, AMBA-T (y homólogas) + protocolo PCAV
};

// === HELPER FUNCTIONS ===

export function getPlanById(id: string): PlanNode | undefined {
  return PLAN_NODES.find(p => p.id === id);
}

export function getDependenciesForPlan(planId: string): { incoming: Dependency[]; outgoing: Dependency[] } {
  return {
    incoming: DEPENDENCIES.filter(d => d.target === planId),
    outgoing: DEPENDENCIES.filter(d => d.source === planId),
  };
}

export function getPlanPhases(planId: string): TimelinePhase[] {
  return TIMELINE_PHASES.filter(p => p.planId === planId);
}

export function getInDegree(planId: string): number {
  return DEPENDENCIES.filter(d => d.target === planId).length;
}

export function simulateFailure(planId: string): { directlyAffected: string[]; cascadeAffected: string[] } {
  const direct = DEPENDENCIES
    .filter(d => d.target === planId && d.nature === 'CRITICAL')
    .map(d => d.source);

  const cascadeSet = new Set<string>(direct);
  let frontier = [...direct];
  while (frontier.length > 0) {
    const next: string[] = [];
    for (const p of frontier) {
      const affected = DEPENDENCIES
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
