// El Arquitecto — Structured ecosystem data for the ¡BASTA! strategic planning platform
// Extracted from 16 PLANes + support documents (March 2026)

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

// === PLAN NODES (16 mandatos) ===

export const PLAN_NODES: PlanNode[] = [
  {
    id: 'PLANJUS', name: 'Plan Nacional de Justicia Popular', ordinal: 1,
    category: 'justicia', agency: 'ANJUS', agencyFull: 'Agencia Nacional de Justicia Popular',
    organMetaphor: 'sistema inmunológico', organLabel: 'Immune System',
    status: 'PUBLISHED', budgetLow: 3300, budgetHigh: 5700, timelineYears: 10,
    legalInstruments: 6, constitutionalFloor: '0.25-0.30% PBI',
    mainSource: 'Reasignación presupuesto judicial + tasas comerciales',
    color: '#f59e0b', slug: 'planjus-justicia-popular',
  },
  {
    id: 'PLANREP', name: 'Plan Nacional de Reconversión del Empleo Público', ordinal: 2,
    category: 'economia', agency: 'ANREP', agencyFull: 'Agencia Nacional de Reconversión del Empleo Público',
    organMetaphor: 'metabolismo', organLabel: 'Metabolism',
    status: 'PUBLISHED', budgetLow: 15000, budgetHigh: 25000, timelineYears: 20,
    legalInstruments: 8, constitutionalFloor: null,
    mainSource: 'Presupuesto nacional + BIS + corporativo',
    color: '#10b981', slug: 'planrep-reconversion-empleo-publico',
  },
  {
    id: 'PLANEB', name: 'Plan Nacional de Empresas Bastardas', ordinal: 3,
    category: 'economia', agency: 'ANEB', agencyFull: 'Agencia Nacional de la Red Bastarda',
    organMetaphor: 'motor económico', organLabel: 'Economic Engine',
    status: 'PUBLISHED', budgetLow: 500, budgetHigh: 600, timelineYears: -1,
    legalInstruments: 1, constitutionalFloor: '0.10% PBI',
    mainSource: 'Capitalización ciudadana directa + piso constitucional',
    color: '#10b981', slug: 'planeb-empresas-bastardas',
  },
  {
    id: 'PLANMON', name: 'Plan Nacional de Soberanía Monetaria', ordinal: 4,
    category: 'economia', agency: 'ANMON', agencyFull: 'Agencia Nacional de Estabilidad Monetaria',
    organMetaphor: 'sistema circulatorio', organLabel: 'Circulatory System',
    status: 'PUBLISHED', budgetLow: 0, budgetHigh: 0, timelineYears: 15,
    legalInstruments: 5, constitutionalFloor: null,
    mainSource: 'Regalías energéticas + recaudación PLANSUS + comisiones de red',
    color: '#10b981', slug: 'planmon-soberania-monetaria',
  },
  {
    id: 'PLANDIG', name: 'Plan Nacional de Soberanía Digital', ordinal: 5,
    category: 'tecnologia', agency: 'ANDIG', agencyFull: 'Agencia Nacional de Infraestructura Digital',
    organMetaphor: 'sistema nervioso', organLabel: 'Nervous System',
    status: 'PUBLISHED', budgetLow: 4700, budgetHigh: 9900, timelineYears: 10,
    legalInstruments: 1, constitutionalFloor: '0.50-1.0% PBI',
    mainSource: 'Reasignación gasto cloud + presupuesto CyT + multilaterales',
    color: '#06b6d4', slug: 'plandig-soberania-digital',
  },
  {
    id: 'PLANSUS', name: 'Plan Nacional de Soberanía sobre Sustancias', ordinal: 6,
    category: 'salud', agency: 'ANSUS', agencyFull: 'Agencia Nacional de Soberanía sobre Sustancias',
    organMetaphor: 'conciencia', organLabel: 'Consciousness',
    status: 'PUBLISHED', budgetLow: 800, budgetHigh: 2200, timelineYears: 5,
    legalInstruments: 3, constitutionalFloor: '0.10% PBI',
    mainSource: 'Presupuesto nacional + activos decomisados + autofinanciamiento',
    color: '#f43f5e', slug: 'plansus-soberania-sustancias',
  },
  {
    id: 'PLANEDU', name: 'Plan Nacional de Refundación Educativa', ordinal: 7,
    category: 'educacion', agency: 'ANCE', agencyFull: 'Agencia Nacional de Calidad Educativa',
    organMetaphor: 'sistema operativo', organLabel: 'Operating System',
    status: 'PUBLISHED', budgetLow: 80000, budgetHigh: 100000, timelineYears: 20,
    legalInstruments: 6, constitutionalFloor: '0.50% PBI',
    mainSource: 'Reasignación educativa + PLANREP ahorro (15%) + incremento PBI',
    color: '#3b82f6', slug: 'planedu-refundacion-educativa',
  },
  {
    id: 'PLANSAL', name: 'Plan Nacional de Salud Integral y Vitalidad', ordinal: 8,
    category: 'salud', agency: 'ANVIP', agencyFull: 'Agencia Nacional de Vitalidad Popular',
    organMetaphor: 'signos vitales', organLabel: 'Vital Signs',
    status: 'PUBLISHED', budgetLow: 6000, budgetHigh: 6000, timelineYears: 10,
    legalInstruments: 7, constitutionalFloor: '0.50-1.50% PBI',
    mainSource: 'Presupuesto nacional (% gasto salud) + reasignación',
    color: '#f43f5e', slug: 'plansal-salud-integral',
  },
  {
    id: 'PLANISV', name: 'Plan Nacional de Infraestructura de Suelo Vivo', ordinal: 9,
    category: 'medio-ambiente', agency: 'ENSV', agencyFull: 'Ente Nacional de Suelo Vivo',
    organMetaphor: 'cimiento', organLabel: 'Foundation',
    status: 'PUBLISHED', budgetLow: 1000, budgetHigh: 3000, timelineYears: 15,
    legalInstruments: 6, constitutionalFloor: '0.10% PBI',
    mainSource: 'Retenciones agropecuarias + financiamiento internacional + créditos de carbono',
    color: '#22c55e', slug: 'planisv-infraestructura-suelo-vivo',
  },
  {
    id: 'PLANAGUA', name: 'Plan Nacional de Soberanía Hídrica', ordinal: 10,
    category: 'medio-ambiente', agency: 'ANAGUA', agencyFull: 'Agencia Nacional del Agua',
    organMetaphor: 'hidratación', organLabel: 'Hydration',
    status: 'PUBLISHED', budgetLow: 15000, budgetHigh: 25000, timelineYears: 10,
    legalInstruments: 8, constitutionalFloor: '0.15% PBI',
    mainSource: 'Piso constitucional + créditos hídricos + financiamiento climático',
    color: '#22c55e', slug: 'planagua-soberania-hidrica',
  },
  {
    id: 'PLAN24CN', name: 'Plan Nacional de 24 Ciudades Nuevas', ordinal: 11,
    category: 'infraestructura', agency: 'CNDU', agencyFull: 'Corporación Nacional de Desarrollo Urbano',
    organMetaphor: 'cuerpo', organLabel: 'Body',
    status: 'PUBLISHED', budgetLow: 26350, budgetHigh: 73000, timelineYears: 20,
    legalInstruments: 5, constitutionalFloor: null,
    mainSource: 'FGS + presupuesto nacional + bonos de ciudad + valorización de suelo',
    color: '#64748b', slug: 'plan24cn-24-ciudades-nuevas',
  },
  {
    id: 'PLANGEO', name: 'Plan Nacional de Posicionamiento Geopolítico', ordinal: 12,
    category: 'geopolitica', agency: 'CNEG', agencyFull: 'Consejo Nacional de Estrategia Geopolítica',
    organMetaphor: 'escudo', organLabel: 'Shield',
    status: 'PUBLISHED', budgetLow: 14200, budgetHigh: 14200, timelineYears: 10,
    legalInstruments: 1, constitutionalFloor: null,
    mainSource: 'Presupuesto nacional + YPF + bonos soberanos + inversión mixta',
    color: '#0ea5e9', slug: 'plangeo-posicionamiento-geopolitico',
  },
  {
    id: 'PLANEN', name: 'Plan Nacional de Soberanía Energética', ordinal: 13,
    category: 'infraestructura', agency: 'ANEN', agencyFull: 'Agencia Nacional de Energía y Transición de Matriz',
    organMetaphor: 'energía', organLabel: 'Energy',
    status: 'PUBLISHED', budgetLow: 45000, budgetHigh: 76000, timelineYears: 15,
    legalInstruments: 1, constitutionalFloor: '0.50% PBI',
    mainSource: 'Inversión privada condicionada (35%) + multilaterales + reasignación subsidios',
    color: '#64748b', slug: 'planen-soberania-energetica',
  },
  {
    id: 'PLANSEG', name: 'Plan Nacional de Seguridad Ciudadana', ordinal: 14,
    category: 'instituciones', agency: 'ANSEG', agencyFull: 'Agencia Nacional de Seguridad Ciudadana',
    organMetaphor: 'guardián', organLabel: 'Guardian',
    status: 'PUBLISHED', budgetLow: 3000, budgetHigh: 6000, timelineYears: 15,
    legalInstruments: 1, constitutionalFloor: '0.05-0.10% PBI neto',
    mainSource: 'Reasignación gasto seguridad (60%) + presupuesto nacional + multilaterales',
    color: '#6366f1', slug: 'planseg-seguridad-ciudadana',
  },
  {
    id: 'PLANVIV', name: 'Plan Nacional de Vivienda Digna', ordinal: 15,
    category: 'infraestructura', agency: 'ANVIV', agencyFull: 'Agencia Nacional de Vivienda Digna y Hábitat',
    organMetaphor: 'refugio', organLabel: 'Shelter',
    status: 'PUBLISHED', budgetLow: 80000, budgetHigh: 120000, timelineYears: 15,
    legalInstruments: 2, constitutionalFloor: '2.00% PBI',
    mainSource: 'Autofinanciamiento repagos (40%) + inversión privada (25%) + presupuesto (20%)',
    color: '#64748b', slug: 'planviv-vivienda-digna',
  },
  {
    id: 'PLANCUL', name: 'Plan Nacional de Cultura Viva', ordinal: 16,
    category: 'cultura', agency: null, agencyFull: null,
    organMetaphor: 'alma', organLabel: 'Soul',
    status: 'PUBLISHED', budgetLow: 0, budgetHigh: 0, timelineYears: -1,
    legalInstruments: 0, constitutionalFloor: null,
    mainSource: 'Autofinanciamiento comunitario — sin presupuesto estatal por diseño',
    color: '#a855f7', slug: 'plancul-cultura-viva',
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
  { planId: 'PLANJUS', name: 'Fase 1', startYear: 0, endYear: 2 },
  { planId: 'PLANJUS', name: 'La Preferencia', startYear: 3, endYear: 7 },
  { planId: 'PLANJUS', name: 'La Sucesión Natural', startYear: 8, endYear: 10 },
  // PLANREP
  { planId: 'PLANREP', name: 'Lanzamiento', startYear: 0, endYear: 1 },
  { planId: 'PLANREP', name: 'Inversión', startYear: 2, endYear: 3 },
  { planId: 'PLANREP', name: 'Primer Superávit', startYear: 4, endYear: 4 },
  { planId: 'PLANREP', name: 'Régimen', startYear: 5, endYear: 10 },
  { planId: 'PLANREP', name: 'Economía Contribución', startYear: 11, endYear: 20 },
  // PLANEB
  { planId: 'PLANEB', name: 'Semilla', startYear: 0, endYear: 0 },
  { planId: 'PLANEB', name: 'Auto Simple', startYear: 0, endYear: 1 },
  { planId: 'PLANEB', name: 'Expansión', startYear: 1, endYear: 2 },
  { planId: 'PLANEB', name: 'Espectro Completo', startYear: 3, endYear: 5 },
  { planId: 'PLANEB', name: 'Red Madura', startYear: 5, endYear: 15 },
  // PLANMON
  { planId: 'PLANMON', name: 'Pre-Fase', startYear: 2, endYear: 2 },
  { planId: 'PLANMON', name: 'Pulso Beta', startYear: 3, endYear: 3 },
  { planId: 'PLANMON', name: 'Expansión', startYear: 4, endYear: 5 },
  { planId: 'PLANMON', name: 'Desdolarización', startYear: 7, endYear: 10 },
  { planId: 'PLANMON', name: 'Pulso Dominante', startYear: 11, endYear: 15 },
  // PLANSUS
  { planId: 'PLANSUS', name: 'El Alivio', startYear: 1, endYear: 1 },
  { planId: 'PLANSUS', name: 'La Expansión', startYear: 2, endYear: 3 },
  { planId: 'PLANSUS', name: 'La Soberanía', startYear: 4, endYear: 5 },
  // PLANEDU
  { planId: 'PLANEDU', name: 'Escudo', startYear: 1, endYear: 7 },
  { planId: 'PLANEDU', name: 'Transición', startYear: 8, endYear: 14 },
  { planId: 'PLANEDU', name: 'Abundancia', startYear: 15, endYear: 20 },
  // PLANSAL
  { planId: 'PLANSAL', name: 'Demostrar', startYear: 1, endYear: 2 },
  { planId: 'PLANSAL', name: 'Escalar', startYear: 3, endYear: 5 },
  { planId: 'PLANSAL', name: 'Consolidar', startYear: 6, endYear: 10 },
  // PLANISV
  { planId: 'PLANISV', name: 'Demostrar', startYear: 0, endYear: 0 },
  { planId: 'PLANISV', name: 'Regionalizar', startYear: 1, endYear: 2 },
  { planId: 'PLANISV', name: 'Escala Nacional', startYear: 3, endYear: 10 },
  { planId: 'PLANISV', name: 'Consolidación', startYear: 11, endYear: 15 },
  // PLANAGUA
  { planId: 'PLANAGUA', name: 'Emergencia', startYear: 2, endYear: 2 },
  { planId: 'PLANAGUA', name: 'Infraestructura', startYear: 3, endYear: 5 },
  { planId: 'PLANAGUA', name: 'Modernización', startYear: 6, endYear: 8 },
  { planId: 'PLANAGUA', name: 'Excelencia', startYear: 9, endYear: 10 },
  // PLAN24CN
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
  totalPlans: 16,
  totalBudgetLow: 283000,  // USD millions
  totalBudgetHigh: 526000,
  totalLegalInstruments: 58,
  constitutionalFloorNet: '2.17-2.92% PBI',
  timelineHorizon: 20, // years
  totalDependencies: 41,
  criticalDependencies: 14,
  agencies: 15, // 14 + PLANCUL with none
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
