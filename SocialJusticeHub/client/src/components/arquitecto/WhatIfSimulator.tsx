import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Zap, AlertTriangle } from 'lucide-react';
import { PLAN_NODES, DEPENDENCIES, TIMELINE_PHASES, type PlanNode } from '@shared/arquitecto-data';

export default function WhatIfSimulator() {
  const [delays, setDelays] = useState<Record<string, number>>({});

  const cascadedDelays = useMemo(() => {
    const result: Record<string, number> = {};
    PLAN_NODES.forEach(p => { result[p.id] = delays[p.id] || 0; });

    // Propagate through critical dependencies (BFS)
    let changed = true;
    let iterations = 0;
    while (changed && iterations < 20) {
      changed = false;
      iterations++;
      for (const dep of DEPENDENCIES.filter(d => d.nature === 'CRITICAL')) {
        const targetDelay = result[dep.target] || 0;
        if (targetDelay > (result[dep.source] || 0)) {
          // If a plan I depend on is delayed, I'm delayed too
        }
        // Actually: if TARGET is delayed, SOURCE (which depends on target) is also delayed
        const sourceCurrentDelay = result[dep.source] || 0;
        const inheritedDelay = result[dep.target] || 0;
        if (inheritedDelay > sourceCurrentDelay) {
          result[dep.source] = inheritedDelay;
          changed = true;
        }
      }
    }
    return result;
  }, [delays]);

  const setDelay = (planId: string, years: number) => {
    setDelays(prev => ({ ...prev, [planId]: years }));
  };

  const reset = () => setDelays({});
  const hasDelays = Object.values(delays).some(d => d > 0);
  const totalAffected = Object.values(cascadedDelays).filter(d => d > 0).length;
  const maxCascade = Math.max(0, ...Object.values(cascadedDelays));

  const sortedPlans = [...PLAN_NODES].sort((a, b) => a.ordinal - b.ordinal);
  const minYear = -1;
  const maxYear = 20;
  const totalYears = maxYear - minYear + 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white/90 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" /> Simulador ¿Qué Pasa Si...?
          </h3>
          <p className="text-sm text-white/50 mt-1">Arrastrá los sliders para simular retrasos. Las dependencias críticas se propagan automáticamente.</p>
        </div>
        <div className="flex items-center gap-4">
          {hasDelays && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-center gap-3 text-sm">
              <span className="text-amber-400 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" /> {totalAffected} planes afectados
              </span>
              <span className="text-red-400">Cascada máx: +{maxCascade} años</span>
            </motion.div>
          )}
          <button onClick={reset} disabled={!hasDelays}
            className="flex items-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-white/15 disabled:opacity-30 rounded-lg text-xs text-white/70 border border-white/10">
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>
      </div>

      {/* Timeline Visualization */}
      <div className="bg-white/5 rounded-xl border border-white/10 overflow-x-auto">
        {/* Year headers */}
        <div className="flex border-b border-white/10 sticky top-0 bg-white/5 backdrop-blur-sm z-10">
          <div className="w-32 shrink-0 p-2 text-xs text-white/50 border-r border-white/10">Plan</div>
          <div className="w-20 shrink-0 p-2 text-xs text-white/50 border-r border-white/10 text-center">Retraso</div>
          <div className="flex flex-1">
            {Array.from({ length: totalYears }, (_, i) => i + minYear).map(year => (
              <div key={year} className="flex-1 min-w-[40px] p-1 text-xs text-white/30 text-center border-r border-white/5">
                {year < 0 ? `A${year}` : `A${year}`}
              </div>
            ))}
          </div>
        </div>

        {/* Plan rows */}
        {sortedPlans.map(plan => {
          const directDelay = delays[plan.id] || 0;
          const totalDelay = cascadedDelays[plan.id] || 0;
          const isCascaded = totalDelay > directDelay;
          const phases = TIMELINE_PHASES.filter(p => p.planId === plan.id);
          const barColor = totalDelay === 0 ? plan.color : totalDelay <= 2 ? '#f59e0b' : '#ef4444';

          return (
            <div key={plan.id} className="flex border-b border-white/5 hover:bg-white/5 transition-colors items-center">
              {/* Plan name */}
              <div className="w-32 shrink-0 p-2 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: plan.color }} />
                <span className="text-xs font-medium text-white/80 truncate">{plan.id}</span>
              </div>

              {/* Delay slider */}
              <div className="w-20 shrink-0 p-2 border-r border-white/10">
                <div className="flex items-center gap-1">
                  <input type="range" min={0} max={5} value={directDelay}
                    onChange={e => setDelay(plan.id, parseInt(e.target.value))}
                    className="w-full h-1 accent-amber-400" />
                  <span className={`text-xs w-6 text-right ${totalDelay > 0 ? 'text-amber-400 font-bold' : 'text-white/30'}`}>
                    {totalDelay > 0 ? `+${totalDelay}` : '0'}
                  </span>
                </div>
                {isCascaded && (
                  <div className="text-[10px] text-red-400 mt-0.5">cascada</div>
                )}
              </div>

              {/* Timeline bars */}
              <div className="flex flex-1 relative h-10">
                {phases.map((phase, i) => {
                  const left = ((phase.startYear + totalDelay - minYear) / totalYears) * 100;
                  const width = ((phase.endYear - phase.startYear + 1) / totalYears) * 100;
                  const originalLeft = ((phase.startYear - minYear) / totalYears) * 100;

                  return (
                    <motion.div key={i}
                      className="absolute top-1.5 h-7 rounded-md flex items-center justify-center overflow-hidden border"
                      style={{
                        backgroundColor: `${barColor}33`,
                        borderColor: `${barColor}66`,
                      }}
                      initial={false}
                      animate={{
                        left: `${Math.max(0, Math.min(left, 95))}%`,
                        width: `${Math.max(width, 2)}%`,
                      }}
                      transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                      title={`${phase.name}: Año ${phase.startYear + totalDelay} - ${phase.endYear + totalDelay}`}
                    >
                      <span className="text-[9px] text-white/70 truncate px-1 whitespace-nowrap">{phase.name}</span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Impact Summary */}
      {hasDelays && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 rounded-xl border border-white/10 p-4">
          <h4 className="text-sm font-semibold text-white/80 mb-3">Impacto de la Simulación</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {sortedPlans.filter(p => cascadedDelays[p.id] > 0).map(plan => {
              const d = cascadedDelays[plan.id];
              const direct = delays[plan.id] || 0;
              return (
                <div key={plan.id} className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: plan.color }} />
                  <span className="text-xs text-white/70">{plan.id}</span>
                  <span className={`text-xs font-bold ml-auto ${d > 2 ? 'text-red-400' : 'text-amber-400'}`}>
                    +{d} año{d > 1 ? 's' : ''}
                  </span>
                  {d > direct && (
                    <span className="text-[10px] text-red-400/60">(cascada)</span>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
