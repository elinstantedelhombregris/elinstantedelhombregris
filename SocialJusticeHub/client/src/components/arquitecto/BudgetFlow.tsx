import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Landmark, Building2 } from 'lucide-react';
import { PLAN_NODES, ECOSYSTEM_METRICS, type PlanNode } from '@shared/arquitecto-data';

function formatBudget(millions: number): string {
  if (millions >= 1000) {
    const b = millions / 1000;
    return b % 1 === 0 ? `${b}` : `${b.toFixed(1)}`;
  }
  return `${millions}`;
}

function budgetUnit(millions: number): string {
  return millions >= 1000 ? 'B' : 'M';
}

function formatRange(low: number, high: number): string {
  if (low === 0 && high === 0) return 'Sin costo directo';
  if (low === high) return `USD ${formatBudget(low)}${budgetUnit(low)}`;
  return `USD ${formatBudget(low)}-${formatBudget(high)}${budgetUnit(high)}`;
}

// Calculate a relative area weight for the treemap-style grid
function getBudgetWeight(plan: PlanNode): number {
  const avg = (plan.budgetLow + plan.budgetHigh) / 2;
  if (avg === 0) return 0;
  return avg;
}

// Argentina PBI ~640B USD (2025 est.)
const PBI_USD_M = 640_000;

export default function BudgetFlow() {
  const sortedPlans = useMemo(
    () =>
      [...PLAN_NODES].sort((a, b) => {
        const avgA = (a.budgetLow + a.budgetHigh) / 2;
        const avgB = (b.budgetLow + b.budgetHigh) / 2;
        return avgB - avgA; // largest first
      }),
    [],
  );

  const totalLow = ECOSYSTEM_METRICS.totalBudgetLow;
  const totalHigh = ECOSYSTEM_METRICS.totalBudgetHigh;
  const totalAvg = (totalLow + totalHigh) / 2;
  const annualAvg = totalAvg / 15; // ~15 year average horizon
  const pbiPercent = ((annualAvg / PBI_USD_M) * 100).toFixed(1);

  // Max budget for relative bar sizing
  const maxAvgBudget = useMemo(
    () => Math.max(...PLAN_NODES.map((p) => (p.budgetLow + p.budgetHigh) / 2)),
    [],
  );

  // Assign column spans based on budget weight tiers
  function getSpanClass(plan: PlanNode): string {
    const avg = getBudgetWeight(plan);
    if (avg === 0) return 'col-span-1';
    if (avg >= 80000) return 'col-span-2 row-span-2'; // PLANVIV, PLANEDU
    if (avg >= 40000) return 'col-span-2'; // PLANEN
    if (avg >= 15000) return 'col-span-1 row-span-2'; // PLANREP, PLANAGUA, PLAN24CN
    return 'col-span-1';
  }

  const summaryStats = [
    {
      icon: DollarSign,
      label: 'Inversión Total (20 años)',
      value: `USD ${formatBudget(totalLow)}-${formatBudget(totalHigh)}${budgetUnit(totalHigh)}`,
      sub: `${ECOSYSTEM_METRICS.totalPlans} mandatos`,
    },
    {
      icon: TrendingUp,
      label: 'Promedio Anual',
      value: `USD ${formatBudget(Math.round(annualAvg))}${budgetUnit(Math.round(annualAvg))}`,
      sub: `~${pbiPercent}% del PBI`,
    },
    {
      icon: Landmark,
      label: 'Piso Constitucional Neto',
      value: ECOSYSTEM_METRICS.constitutionalFloorNet,
      sub: 'del PBI garantizado',
    },
    {
      icon: Building2,
      label: 'Instrumentos Legales',
      value: `${ECOSYSTEM_METRICS.totalLegalInstruments}`,
      sub: 'leyes + decretos + reformas',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <h3 className="text-lg font-semibold text-white mb-4">
        Arquitectura Presupuestaria — 16 Mandatos
      </h3>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {summaryStats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="rounded-xl bg-white/5 backdrop-blur-md border border-white/10 p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className="w-4 h-4 text-white/40" />
              <span className="text-[11px] text-white/40 uppercase tracking-wider font-medium">
                {stat.label}
              </span>
            </div>
            <p className="text-xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-white/40 mt-0.5">{stat.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Budget treemap grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 auto-rows-min">
        {sortedPlans.map((plan, i) => {
          const avg = getBudgetWeight(plan);
          const isZero = avg === 0;
          const barPercent = isZero ? 0 : (avg / maxAvgBudget) * 100;

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.03 }}
              className={`
                rounded-xl p-4 transition-all duration-200 hover:scale-[1.02]
                ${getSpanClass(plan)}
                ${isZero
                  ? 'border-2 border-dashed border-white/10 bg-transparent'
                  : 'bg-white/5 backdrop-blur-md border border-white/10'
                }
              `}
            >
              {/* Plan header */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: plan.color }}
                  />
                  <span className="text-sm font-bold text-white truncate">
                    {plan.id}
                  </span>
                </div>
                {plan.constitutionalFloor && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-medium whitespace-nowrap">
                    {plan.constitutionalFloor}
                  </span>
                )}
              </div>

              {/* Plan name */}
              <p className="text-xs text-white/60 mb-3 line-clamp-2 leading-relaxed">
                {plan.name}
              </p>

              {isZero ? (
                <div className="flex items-center justify-center py-3">
                  <span className="text-xs text-white/30 italic">
                    Sin costo directo
                  </span>
                </div>
              ) : (
                <>
                  {/* Budget display */}
                  <div className="mb-3">
                    <p className="text-base font-semibold text-white">
                      {formatRange(plan.budgetLow, plan.budgetHigh)}
                    </p>
                  </div>

                  {/* Budget bar with range visualization */}
                  <div className="relative h-2 rounded-full bg-white/5 overflow-hidden mb-3">
                    {/* Low range bar */}
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(plan.budgetLow / maxAvgBudget) * 100}%` }}
                      transition={{ duration: 0.8, delay: 0.2 + i * 0.03, ease: 'easeOut' }}
                      className="absolute inset-y-0 left-0 rounded-full"
                      style={{ backgroundColor: plan.color, opacity: 0.7 }}
                    />
                    {/* High range extension */}
                    {plan.budgetHigh > plan.budgetLow && (
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(plan.budgetHigh / maxAvgBudget) * 100}%` }}
                        transition={{ duration: 0.8, delay: 0.2 + i * 0.03, ease: 'easeOut' }}
                        className="absolute inset-y-0 left-0 rounded-full"
                        style={{ backgroundColor: plan.color, opacity: 0.3 }}
                      />
                    )}
                  </div>

                  {/* Agency + funding source */}
                  <div className="space-y-1.5">
                    {plan.agency && (
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3 h-3 text-white/30 flex-shrink-0" />
                        <span className="text-[11px] text-white/40 truncate">
                          {plan.agency}
                        </span>
                      </div>
                    )}
                    <p className="text-[10px] text-white/30 line-clamp-2 leading-relaxed">
                      {plan.mainSource}
                    </p>
                  </div>
                </>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Footer note */}
      <p className="mt-4 text-[11px] text-white/30 text-center">
        Presupuestos en USD millones acumulados sobre el horizonte del plan. Fuentes: documentos
        estratégicos de cada mandato (marzo 2026). PBI estimado: USD 640 mil M.
      </p>
    </motion.div>
  );
}
