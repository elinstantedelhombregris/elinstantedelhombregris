import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Activity, TrendingUp, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { PLAN_NODES, type PlanNode } from '@shared/arquitecto-data';
import { STRATEGIC_INITIATIVES, type KPI } from '@shared/strategic-initiatives';

interface PlanKPIGroup {
  plan: PlanNode;
  kpis: KPI[];
  avgProgress: number;
}

function computeProgress(kpi: KPI): number {
  const { currentValue, targetValue } = kpi;
  // Handle "reduction" KPIs where target < current (e.g., deficit reduction)
  if (targetValue < currentValue) {
    // Progress = how much has been reduced already (for initial state, progress = 0)
    return 0;
  }
  if (targetValue === 0) return currentValue === 0 ? 100 : 0;
  return Math.min(100, Math.max(0, (currentValue / targetValue) * 100));
}

function healthColor(progress: number): { bg: string; text: string; label: string; icon: typeof CheckCircle2 } {
  if (progress > 66) return { bg: 'bg-emerald-500/15', text: 'text-emerald-400', label: 'Saludable', icon: CheckCircle2 };
  if (progress > 33) return { bg: 'bg-amber-500/15', text: 'text-amber-400', label: 'En progreso', icon: Clock };
  return { bg: 'bg-red-500/15', text: 'text-red-400', label: 'Inicial', icon: AlertCircle };
}

function healthGradient(progress: number): string {
  if (progress > 66) return 'from-emerald-500 to-emerald-400';
  if (progress > 33) return 'from-amber-500 to-amber-400';
  return 'from-red-500 to-red-400';
}

export default function KPICommandBoard() {
  const planKPIGroups: PlanKPIGroup[] = useMemo(() => {
    const groups: PlanKPIGroup[] = [];

    for (const plan of [...PLAN_NODES].sort((a, b) => a.ordinal - b.ordinal)) {
      const initiative = STRATEGIC_INITIATIVES.find((si) => si.slug === plan.slug);
      if (!initiative || initiative.kpis.length === 0) continue;

      const kpis = initiative.kpis;
      const progresses = kpis.map(computeProgress);
      const avgProgress =
        progresses.length > 0
          ? progresses.reduce((sum, p) => sum + p, 0) / progresses.length
          : 0;

      groups.push({ plan, kpis, avgProgress });
    }

    return groups;
  }, []);

  const overallHealth = useMemo(() => {
    if (planKPIGroups.length === 0) return 0;
    return (
      planKPIGroups.reduce((sum, g) => sum + g.avgProgress, 0) /
      planKPIGroups.length
    );
  }, [planKPIGroups]);

  const totalKPIs = useMemo(
    () => planKPIGroups.reduce((sum, g) => sum + g.kpis.length, 0),
    [planKPIGroups],
  );

  const health = healthColor(overallHealth);
  const HealthIcon = health.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <h3 className="text-lg font-semibold text-white mb-4">
        Panel de KPIs — Salud del Ecosistema
      </h3>

      {/* Ecosystem health header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="rounded-xl bg-white/5 backdrop-blur-md border border-white/10 p-5 mb-6"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Health ring */}
            <div className="relative w-16 h-16 flex-shrink-0">
              <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="5"
                />
                <motion.circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeLinecap="round"
                  className={health.text}
                  strokeDasharray={`${2 * Math.PI * 28}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 28 }}
                  animate={{
                    strokeDashoffset:
                      2 * Math.PI * 28 * (1 - overallHealth / 100),
                  }}
                  transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-sm font-bold ${health.text}`}>
                  {Math.round(overallHealth)}%
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-4 h-4 text-white/40" />
                <span className="text-xs text-white/40 uppercase tracking-wider font-medium">
                  Salud del Ecosistema
                </span>
              </div>
              <div className="flex items-center gap-2">
                <HealthIcon className={`w-4 h-4 ${health.text}`} />
                <span className={`text-sm font-semibold ${health.text}`}>
                  {health.label}
                </span>
              </div>
            </div>
          </div>

          {/* Summary stats */}
          <div className="flex gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">
                {planKPIGroups.length}
              </p>
              <p className="text-[11px] text-white/40">mandatos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{totalKPIs}</p>
              <p className="text-[11px] text-white/40">KPIs</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">
                {planKPIGroups.filter((g) => g.avgProgress > 0).length}
              </p>
              <p className="text-[11px] text-white/40">con avance</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Plan KPI cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {planKPIGroups.map((group, groupIndex) => {
          const planHealth = healthColor(group.avgProgress);
          const PlanHealthIcon = planHealth.icon;

          return (
            <motion.div
              key={group.plan.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 + groupIndex * 0.04 }}
              className="rounded-xl bg-white/5 backdrop-blur-md border border-white/10 p-4 hover:bg-white/[0.07] transition-colors"
            >
              {/* Plan header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: group.plan.color }}
                  />
                  <span className="text-sm font-bold text-white truncate">
                    {group.plan.id}
                  </span>
                </div>
                <div
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${planHealth.bg}`}
                >
                  <PlanHealthIcon className={`w-3 h-3 ${planHealth.text}`} />
                  <span className={`text-[10px] font-semibold ${planHealth.text}`}>
                    {Math.round(group.avgProgress)}%
                  </span>
                </div>
              </div>

              {/* Plan name */}
              <p className="text-[11px] text-white/40 mb-3 truncate">
                {group.plan.name}
              </p>

              {/* KPI list */}
              <div className="space-y-3">
                {group.kpis.map((kpi, kpiIndex) => {
                  const progress = computeProgress(kpi);
                  const isReduction = kpi.targetValue < kpi.currentValue;

                  return (
                    <div key={kpi.id}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-white/70 truncate pr-2 flex-1">
                          {kpi.metric}
                        </span>
                        <span className="text-[10px] text-white/40 whitespace-nowrap">
                          {kpi.currentValue}
                          {isReduction ? ' → ' : ' / '}
                          {kpi.targetValue} {kpi.unit}
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="relative h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.max(progress, 2)}%` }}
                          transition={{
                            duration: 0.8,
                            delay: 0.3 + groupIndex * 0.04 + kpiIndex * 0.06,
                            ease: 'easeOut',
                          }}
                          className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${healthGradient(progress)}`}
                        />
                      </div>

                      {/* Milestones indicators */}
                      {kpi.milestones && kpi.milestones.length > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <TrendingUp className="w-2.5 h-2.5 text-white/20 flex-shrink-0" />
                          <div className="flex gap-1.5 overflow-hidden">
                            {kpi.milestones.map((ms, msIdx) => (
                              <span
                                key={msIdx}
                                className="text-[9px] text-white/25 whitespace-nowrap"
                              >
                                {ms.date}: {ms.targetValue}
                                {msIdx < kpi.milestones!.length - 1 ? ' →' : ''}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer */}
      <p className="mt-4 text-[11px] text-white/30 text-center">
        KPIs extraídos de los documentos estratégicos de cada mandato. Los valores actuales
        representan la línea base pre-implementación. Fuentes: INDEC, INTA, BCRA, organismos
        sectoriales.
      </p>
    </motion.div>
  );
}
