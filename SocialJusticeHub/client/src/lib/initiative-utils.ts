import {
  GraduationCap, TrendingUp, Scale, Heart, Building2,
  Cpu, Leaf, Palette, Landmark,
  AlertTriangle, TrendingDown, Sparkles, Route, BarChart3,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { InitiativeCategory } from '../../../shared/strategic-initiatives';

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
