import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  Scale,
  FileText,
  AlertTriangle,
  DollarSign,
  Clock,
  Landmark,
} from 'lucide-react';
import {
  PLAN_NODES,
  ECOSYSTEM_METRICS,
  getInDegree,
} from '../../../../shared/arquitecto-data';
import type { PlanNode } from '../../../../shared/arquitecto-data';
import PlanDetailDrawer from './PlanDetailDrawer';

// Category icons for plans
const categoryIcons: Record<string, typeof Building2> = {
  justicia: Scale,
  economia: DollarSign,
  tecnologia: Building2,
  salud: Building2,
  educacion: Building2,
  'medio-ambiente': Building2,
  infraestructura: Building2,
  geopolitica: Building2,
  instituciones: Building2,
  cultura: Building2,
};

function formatBudget(low: number, high: number): string {
  if (low === 0 && high === 0) return 'Sin presupuesto estatal';
  const fmt = (n: number) => {
    if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}B`;
    return `${n}M`;
  };
  if (low === high) return `USD ${fmt(low)}`;
  return `USD ${fmt(low)}–${fmt(high)}`;
}

function formatTimeline(years: number): string {
  if (years === -1) return 'Permanente';
  return `${years} anos`;
}

// Summary stat card
function SummaryStat({
  icon: Icon,
  label,
  value,
  color,
  delay,
}: {
  icon: typeof Building2;
  label: string;
  value: string;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex items-center gap-4"
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${color}15`, borderColor: `${color}30`, borderWidth: 1 }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div className="min-w-0">
        <div className="text-xl font-bold text-white truncate">{value}</div>
        <div className="text-xs text-white/40 uppercase tracking-wider">{label}</div>
      </div>
    </motion.div>
  );
}

// Individual plan card
function PlanCard({
  plan,
  index,
  onSelect,
}: {
  plan: PlanNode;
  index: number;
  onSelect: (plan: PlanNode) => void;
}) {
  const inDegree = useMemo(() => getInDegree(plan.id), [plan.id]);

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.05 * index }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(plan)}
      className="group relative text-left bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5
                 hover:border-white/20 transition-all duration-300 cursor-pointer overflow-hidden"
      style={{
        boxShadow: `0 0 0 0 ${plan.color}00`,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = `0 0 30px -5px ${plan.color}30`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 0 ${plan.color}00`;
      }}
    >
      {/* Color accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 opacity-60 group-hover:opacity-100 transition-opacity"
        style={{ backgroundColor: plan.color }}
      />

      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0"
            style={{
              backgroundColor: `${plan.color}20`,
              color: plan.color,
            }}
          >
            {plan.ordinal}
          </span>
          <span
            className="text-xs font-mono font-semibold px-1.5 py-0.5 rounded shrink-0"
            style={{
              backgroundColor: `${plan.color}15`,
              color: plan.color,
            }}
          >
            {plan.agency || '—'}
          </span>
        </div>
        {/* Status dot */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] text-white/30 uppercase">{plan.status}</span>
        </div>
      </div>

      {/* Plan name */}
      <h3 className="text-sm font-bold text-white mb-1 leading-snug group-hover:text-white/95 line-clamp-2">
        {plan.name}
      </h3>

      {/* Organ metaphor */}
      <p className="text-xs text-white/30 mb-4 italic">
        {plan.organMetaphor}
      </p>

      {/* Bottom row: budget + deps */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-white/40">{formatBudget(plan.budgetLow, plan.budgetHigh)}</span>
        <div className="flex items-center gap-1 text-white/30">
          <Clock className="w-3 h-3" />
          <span>{formatTimeline(plan.timelineYears)}</span>
        </div>
      </div>

      {/* Dependency badge */}
      {inDegree > 0 && (
        <div
          className="absolute bottom-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
          style={{
            backgroundColor: `${plan.color}20`,
            color: plan.color,
          }}
          title={`${inDegree} planes dependen de este`}
        >
          {inDegree}
        </div>
      )}
    </motion.button>
  );
}

export default function ArquitectoOverview() {
  const [selectedPlan, setSelectedPlan] = useState<PlanNode | null>(null);

  const metrics = ECOSYSTEM_METRICS;

  return (
    <div>
      {/* Summary Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        <SummaryStat
          icon={Landmark}
          label="Planes Totales"
          value={String(metrics.totalPlans)}
          color="#3b82f6"
          delay={0}
        />
        <SummaryStat
          icon={DollarSign}
          label="Presupuesto Total"
          value={`USD ${(metrics.totalBudgetLow / 1000).toFixed(0)}–${(metrics.totalBudgetHigh / 1000).toFixed(0)}B`}
          color="#10b981"
          delay={0.05}
        />
        <SummaryStat
          icon={FileText}
          label="Instrumentos Legales"
          value={String(metrics.totalLegalInstruments)}
          color="#f59e0b"
          delay={0.1}
        />
        <SummaryStat
          icon={AlertTriangle}
          label="Dependencias Criticas"
          value={String(metrics.criticalDependencies)}
          color="#ef4444"
          delay={0.15}
        />
      </div>

      {/* Plan Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {PLAN_NODES.map((plan, i) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            index={i}
            onSelect={setSelectedPlan}
          />
        ))}
      </div>

      {/* Detail Drawer */}
      <PlanDetailDrawer
        plan={selectedPlan}
        onClose={() => setSelectedPlan(null)}
      />
    </div>
  );
}
