import {
  GraduationCap, TrendingUp, Scale, Heart, Building2,
  Cpu, Leaf, Palette, Landmark, Globe,
  AlertTriangle, TrendingDown, Sparkles, Route, BarChart3,
  ShieldCheck, Map, Hammer, BookOpen, Eye, MessageSquare,
  Shield, Users, Zap, RefreshCw, Target,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type {
  InitiativeCategory,
  MissionSlug,
  TemporalOrder,
  InitiativeState,
  InitiativePriority,
  CitizenRole,
  StrategicInitiative,
} from '../../../shared/strategic-initiatives';
import { STRATEGIC_INITIATIVES } from '../../../shared/strategic-initiatives';

export interface CategoryMeta {
  label: string;
  icon: LucideIcon;
  color: string;
  accent: string;
  gradient: string;
  bgLight: string;
}

export const INITIATIVE_CATEGORIES: Record<InitiativeCategory, CategoryMeta> = {
  educacion:        { label: 'Educación',        icon: GraduationCap, color: 'text-blue-700',    accent: '#1d4ed8', gradient: 'from-blue-500/10 to-indigo-500/10',    bgLight: 'bg-blue-100' },
  economia:         { label: 'Economía',         icon: TrendingUp,    color: 'text-emerald-700', accent: '#047857', gradient: 'from-emerald-500/10 to-green-500/10',  bgLight: 'bg-emerald-100' },
  justicia:         { label: 'Justicia',         icon: Scale,         color: 'text-amber-700',   accent: '#b45309', gradient: 'from-amber-500/10 to-yellow-500/10',   bgLight: 'bg-amber-100' },
  salud:            { label: 'Salud',            icon: Heart,         color: 'text-rose-700',    accent: '#be123c', gradient: 'from-rose-500/10 to-pink-500/10',      bgLight: 'bg-rose-100' },
  infraestructura:  { label: 'Infraestructura',  icon: Building2,     color: 'text-slate-700',   accent: '#475569', gradient: 'from-slate-500/10 to-gray-500/10',     bgLight: 'bg-slate-200' },
  tecnologia:       { label: 'Tecnología',       icon: Cpu,           color: 'text-cyan-700',    accent: '#0e7490', gradient: 'from-cyan-500/10 to-sky-500/10',       bgLight: 'bg-cyan-100' },
  'medio-ambiente': { label: 'Medio Ambiente',   icon: Leaf,          color: 'text-green-700',   accent: '#15803d', gradient: 'from-green-500/10 to-lime-500/10',     bgLight: 'bg-green-100' },
  cultura:          { label: 'Cultura',          icon: Palette,       color: 'text-purple-700',  accent: '#7e22ce', gradient: 'from-purple-500/10 to-fuchsia-500/10', bgLight: 'bg-purple-100' },
  instituciones:    { label: 'Instituciones',    icon: Landmark,      color: 'text-indigo-700',  accent: '#4338ca', gradient: 'from-indigo-500/10 to-violet-500/10',  bgLight: 'bg-indigo-100' },
  geopolitica:      { label: 'Geopolítica',      icon: Globe,         color: 'text-sky-700',     accent: '#0369a1', gradient: 'from-sky-500/10 to-blue-500/10',       bgLight: 'bg-sky-100' },
};

export interface PhaseMeta {
  key: string;
  label: string;
  number: number;
  icon: LucideIcon;
  color: string;
  bg: string;
  border: string;
  accent: string;
}

export const PHASE_META: PhaseMeta[] = [
  { key: 'elProblema',           label: 'El Problema',               number: 1, icon: AlertTriangle, color: 'text-red-600',     bg: 'bg-red-50/50',     border: 'border-red-200',     accent: '#dc2626' },
  { key: 'quePasaSiNoCambiamos', label: '¿Qué pasa si no cambiamos?', number: 2, icon: TrendingDown,  color: 'text-amber-600',   bg: 'bg-amber-50/50',   border: 'border-amber-200',   accent: '#d97706' },
  { key: 'elDisenoIdeal',        label: 'El Diseño Ideal',           number: 3, icon: Sparkles,      color: 'text-blue-600',    bg: 'bg-blue-50/50',    border: 'border-blue-200',    accent: '#2563eb' },
  { key: 'elCamino',             label: 'El Camino',                 number: 4, icon: Route,         color: 'text-emerald-600', bg: 'bg-emerald-50/50', border: 'border-emerald-200', accent: '#059669' },
  { key: 'kpis',                 label: 'Indicadores',               number: 5, icon: BarChart3,     color: 'text-indigo-600',  bg: 'bg-indigo-50/50',  border: 'border-indigo-200',  accent: '#4f46e5' },
];

// === Mission metadata ===

export interface MissionMeta {
  slug: MissionSlug;
  number: number;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  color: string;
  accent: string;
  gradient: string;
  bgLight: string;
  bgDark: string;
  description: string;
}

export const MISSION_META: Record<MissionSlug, MissionMeta> = {
  'la-base-esta': {
    slug: 'la-base-esta', number: 1,
    label: 'La Base Está', shortLabel: 'La Base',
    icon: Heart, color: 'text-red-600', accent: '#dc2626',
    gradient: 'from-red-500/10 to-rose-500/10',
    bgLight: 'bg-red-50', bgDark: 'bg-red-500/10',
    description: 'Agua, vivienda, salud, energia, seguridad de proximidad',
  },
  'territorio-legible': {
    slug: 'territorio-legible', number: 2,
    label: 'Territorio Legible y Mando Cívico', shortLabel: 'Territorio',
    icon: Map, color: 'text-sky-600', accent: '#0284c7',
    gradient: 'from-sky-500/10 to-cyan-500/10',
    bgLight: 'bg-sky-50', bgDark: 'bg-sky-500/10',
    description: 'Señales, mandatos, datos abiertos, rieles digitales básicos',
  },
  'produccion-y-suelo-vivo': {
    slug: 'produccion-y-suelo-vivo', number: 3,
    label: 'Trabajo, Producción y Suelo Vivo', shortLabel: 'Producción',
    icon: Leaf, color: 'text-emerald-600', accent: '#059669',
    gradient: 'from-emerald-500/10 to-green-500/10',
    bgLight: 'bg-emerald-50', bgDark: 'bg-emerald-500/10',
    description: 'Empleo útil, suelo regenerado, empresas bastardas, cadenas territoriales',
  },
  'infancia-escuela-cultura': {
    slug: 'infancia-escuela-cultura', number: 4,
    label: 'Infancia, Escuela y Cultura', shortLabel: 'Infancia',
    icon: BookOpen, color: 'text-violet-600', accent: '#7c3aed',
    gradient: 'from-violet-500/10 to-purple-500/10',
    bgLight: 'bg-violet-50', bgDark: 'bg-violet-500/10',
    description: 'Niñez cuidada, escuela significativa, cultura viva',
  },
  'instituciones-y-futuro': {
    slug: 'instituciones-y-futuro', number: 5,
    label: 'Instituciones Confiables y Pacto de Futuro', shortLabel: 'Instituciones',
    icon: Landmark, color: 'text-amber-600', accent: '#d97706',
    gradient: 'from-amber-500/10 to-yellow-500/10',
    bgLight: 'bg-amber-50', bgDark: 'bg-amber-500/10',
    description: 'Justicia, integridad, blindaje, settlement institucional',
  },
};

// Ordered array for iteration
export const MISSION_ORDER: MissionSlug[] = [
  'la-base-esta',
  'territorio-legible',
  'produccion-y-suelo-vivo',
  'infancia-escuela-cultura',
  'instituciones-y-futuro',
];

// === Temporal order metadata ===

export interface TemporalMeta {
  key: TemporalOrder;
  label: string;
  range: string;
  icon: LucideIcon;
  color: string;
  accent: string;
  bgClass: string;
}

export const TEMPORAL_META: Record<TemporalOrder, TemporalMeta> = {
  emergencia:  { key: 'emergencia',  label: 'Emergencia',  range: '0–90 días',   icon: Zap,       color: 'text-red-500',   accent: '#ef4444', bgClass: 'bg-red-500/15' },
  transicion:  { key: 'transicion',  label: 'Transición',  range: '3–24 meses',  icon: RefreshCw, color: 'text-amber-500', accent: '#f59e0b', bgClass: 'bg-amber-500/15' },
  permanencia: { key: 'permanencia', label: 'Permanencia', range: '2–10 años',   icon: Landmark,  color: 'text-blue-500',  accent: '#3b82f6', bgClass: 'bg-blue-500/15' },
};

// === State (traffic light) metadata ===

export interface StateMeta {
  key: InitiativeState;
  label: string;
  color: string;
  bgClass: string;
  dotClass: string;
}

export const STATE_META: Record<InitiativeState, StateMeta> = {
  verde: { key: 'verde', label: 'Ejecutar',            color: 'text-emerald-500', bgClass: 'bg-emerald-500/15', dotClass: 'bg-emerald-500' },
  ambar: { key: 'ambar', label: 'Simplificar / Dividir', color: 'text-amber-500',   bgClass: 'bg-amber-500/15',   dotClass: 'bg-amber-500' },
  rojo:  { key: 'rojo',  label: 'Diferir',              color: 'text-red-500',     bgClass: 'bg-red-500/15',     dotClass: 'bg-red-500' },
};

// === Priority metadata ===

export const PRIORITY_META: Record<InitiativePriority, { label: string; color: string }> = {
  alta:     { label: 'Alta',     color: 'text-red-600' },
  media:    { label: 'Media',    color: 'text-amber-600' },
  diferida: { label: 'Diferida', color: 'text-slate-500' },
};

// === Citizen role metadata ===

export interface CitizenRoleMeta {
  key: CitizenRole;
  label: string;
  icon: LucideIcon;
  description: string;
}

export const CITIZEN_ROLE_META: Record<CitizenRole, CitizenRoleMeta> = {
  testigo:     { key: 'testigo',     label: 'Testigo',     icon: Eye,           description: 'Ve y documenta realidad' },
  declarante:  { key: 'declarante',  label: 'Declarante',  icon: MessageSquare, description: 'Expresa sueño, valor, necesidad o basta' },
  constructor: { key: 'constructor', label: 'Constructor',  icon: Hammer,        description: 'Aporta tiempo, oficio, recurso o trabajo' },
  custodio:    { key: 'custodio',    label: 'Custodio',    icon: Shield,        description: 'Verifica, audita, corrige y alerta' },
  organizador: { key: 'organizador', label: 'Organizador', icon: Users,         description: 'Coordina célula, círculo o nodo' },
  narrador:    { key: 'narrador',    label: 'Narrador',    icon: BookOpen,      description: 'Convierte prueba y proceso en relato compartible' },
};

// === Helper functions ===

export function getInitiativesByMission(slug: MissionSlug): StrategicInitiative[] {
  return STRATEGIC_INITIATIVES.filter(
    i => i.missionSlug === slug || i.secondaryMissionSlug === slug,
  );
}

export function getMissionForInitiative(initiative: StrategicInitiative): MissionMeta | null {
  if (!initiative.missionSlug) return null;
  return MISSION_META[initiative.missionSlug] ?? null;
}

export function getInitiativesByTemporalOrder(order: TemporalOrder): StrategicInitiative[] {
  return STRATEGIC_INITIATIVES.filter(i => i.temporalOrder === order);
}

export function getInitiativesByState(state: InitiativeState): StrategicInitiative[] {
  return STRATEGIC_INITIATIVES.filter(i => i.state === state);
}

export function getMissionStateCounts(slug: MissionSlug): Record<InitiativeState, number> {
  const initiatives = getInitiativesByMission(slug);
  return {
    verde: initiatives.filter(i => i.state === 'verde').length,
    ambar: initiatives.filter(i => i.state === 'ambar').length,
    rojo: initiatives.filter(i => i.state === 'rojo').length,
  };
}
