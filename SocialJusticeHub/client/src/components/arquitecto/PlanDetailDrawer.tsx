import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'wouter';
import {
  X,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  Zap,
  Clock,
  DollarSign,
  FileText,
  Building2,
  ShieldAlert,
} from 'lucide-react';
import {
  getDependenciesForPlan,
  getPlanById,
  getPlanPhases,
  simulateFailure,
} from '../../../../shared/arquitecto-data';
import type { PlanNode, Dependency } from '../../../../shared/arquitecto-data';

interface PlanDetailDrawerProps {
  plan: PlanNode | null;
  onClose: () => void;
}

function formatBudgetFull(low: number, high: number): string {
  if (low === 0 && high === 0) return 'Sin presupuesto estatal';
  const fmt = (n: number) => {
    if (n >= 1000) return `USD ${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}B`;
    return `USD ${n}M`;
  };
  if (low === high) return fmt(low);
  return `${fmt(low)} – ${fmt(high)}`;
}

function BudgetBar({ low, high, maxHigh }: { low: number; high: number; maxHigh: number }) {
  if (low === 0 && high === 0) return null;
  const lowPct = Math.max((low / maxHigh) * 100, 2);
  const highPct = Math.max((high / maxHigh) * 100, 3);
  return (
    <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden relative">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${highPct}%` }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="absolute inset-y-0 left-0 bg-emerald-500/25 rounded-full"
      />
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${lowPct}%` }}
        transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
        className="absolute inset-y-0 left-0 bg-emerald-500/60 rounded-full"
      />
    </div>
  );
}

function DependencyRow({
  dep,
  direction,
  isAffected,
}: {
  dep: Dependency;
  direction: 'incoming' | 'outgoing';
  isAffected: boolean;
}) {
  const otherPlanId = direction === 'incoming' ? dep.source : dep.target;
  const otherPlan = getPlanById(otherPlanId);
  if (!otherPlan) return null;

  const natureColors: Record<string, string> = {
    CRITICAL: 'text-red-400 bg-red-500/15 border-red-500/20',
    IMPORTANT: 'text-amber-400 bg-amber-500/15 border-amber-500/20',
    MINOR: 'text-slate-400 bg-slate-500/15 border-slate-500/20',
  };

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${
        isAffected
          ? 'bg-red-500/10 border-red-500/30'
          : 'bg-white/3 border-white/5 hover:border-white/10'
      }`}
    >
      <div className="mt-0.5 shrink-0">
        {direction === 'incoming' ? (
          <ArrowLeft className="w-4 h-4 text-white/30" />
        ) : (
          <ArrowRight className="w-4 h-4 text-white/30" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span
            className="text-xs font-mono font-bold px-1.5 py-0.5 rounded"
            style={{ backgroundColor: `${otherPlan.color}20`, color: otherPlan.color }}
          >
            {otherPlan.id}
          </span>
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${natureColors[dep.nature]}`}>
            {dep.nature}
          </span>
          <span className="text-[10px] text-white/25 uppercase">{dep.type}</span>
        </div>
        <p className="text-xs text-white/40 leading-relaxed">{dep.description}</p>
      </div>
    </div>
  );
}

export default function PlanDetailDrawer({ plan, onClose }: PlanDetailDrawerProps) {
  const [failureResult, setFailureResult] = useState<{
    directlyAffected: string[];
    cascadeAffected: string[];
  } | null>(null);

  // Reset failure simulation when plan changes
  useEffect(() => {
    setFailureResult(null);
  }, [plan?.id]);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (plan) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [plan, onClose]);

  const deps = useMemo(
    () => (plan ? getDependenciesForPlan(plan.id) : { incoming: [], outgoing: [] }),
    [plan?.id]
  );

  const phases = useMemo(
    () => (plan ? getPlanPhases(plan.id) : []),
    [plan?.id]
  );

  const allAffected = useMemo(() => {
    if (!failureResult) return new Set<string>();
    return new Set([...failureResult.directlyAffected, ...failureResult.cascadeAffected]);
  }, [failureResult]);

  const handleSimulateFailure = useCallback(() => {
    if (!plan) return;
    if (failureResult) {
      setFailureResult(null);
    } else {
      setFailureResult(simulateFailure(plan.id));
    }
  }, [plan, failureResult]);

  // Max budget across all plans for the bar
  const maxBudget = 120000; // PLANVIV high end

  return (
    <AnimatePresence>
      {plan && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Drawer Panel */}
          <motion.div
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-lg z-50 bg-[#0c0c0c] border-l border-white/10 overflow-y-auto"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-white/5 border border-white/10
                         hover:bg-white/10 flex items-center justify-center transition-colors z-10"
              aria-label="Cerrar"
            >
              <X className="w-4 h-4 text-white/60" />
            </button>

            <div className="p-6 pt-8">
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="text-xs font-mono font-bold px-2 py-1 rounded-lg"
                    style={{ backgroundColor: `${plan.color}20`, color: plan.color }}
                  >
                    {plan.id}
                  </span>
                  <span className="text-xs text-white/25">#{plan.ordinal}</span>
                </div>
                <h2 className="text-xl font-bold text-white mb-2 leading-tight">{plan.name}</h2>
                <p className="text-sm text-white/40 italic">{plan.organMetaphor} — {plan.organLabel}</p>
              </div>

              {/* Key Info Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {plan.agency && (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Building2 className="w-3.5 h-3.5 text-white/30" />
                      <span className="text-[10px] text-white/30 uppercase">Agencia</span>
                    </div>
                    <p className="text-sm font-semibold text-white">{plan.agency}</p>
                    {plan.agencyFull && (
                      <p className="text-[11px] text-white/30 mt-0.5 leading-tight">{plan.agencyFull}</p>
                    )}
                  </div>
                )}
                <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Clock className="w-3.5 h-3.5 text-white/30" />
                    <span className="text-[10px] text-white/30 uppercase">Horizonte</span>
                  </div>
                  <p className="text-sm font-semibold text-white">
                    {plan.timelineYears === -1 ? 'Permanente' : `${plan.timelineYears} anos`}
                  </p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <FileText className="w-3.5 h-3.5 text-white/30" />
                    <span className="text-[10px] text-white/30 uppercase">Leyes</span>
                  </div>
                  <p className="text-sm font-semibold text-white">{plan.legalInstruments} instrumentos</p>
                </div>
                {plan.constitutionalFloor && (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <ShieldAlert className="w-3.5 h-3.5 text-white/30" />
                      <span className="text-[10px] text-white/30 uppercase">Piso PBI</span>
                    </div>
                    <p className="text-sm font-semibold text-white">{plan.constitutionalFloor}</p>
                  </div>
                )}
              </div>

              {/* Budget Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-semibold text-white">Presupuesto</span>
                  </div>
                  <span className="text-xs text-white/40">
                    {formatBudgetFull(plan.budgetLow, plan.budgetHigh)}
                  </span>
                </div>
                <BudgetBar low={plan.budgetLow} high={plan.budgetHigh} maxHigh={maxBudget} />
                <p className="text-[11px] text-white/25 mt-1.5">{plan.mainSource}</p>
              </div>

              {/* Timeline Phases */}
              {phases.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-white mb-3">Fases</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {phases.map((phase, i) => (
                      <span
                        key={i}
                        className="text-xs px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white/50"
                      >
                        <span className="font-semibold text-white/70">{phase.name}</span>
                        {' '}
                        <span className="text-white/25">
                          {phase.startYear === phase.endYear
                            ? `A${phase.startYear >= 0 ? '+' : ''}${phase.startYear}`
                            : `A${phase.startYear >= 0 ? '+' : ''}${phase.startYear}–${phase.endYear}`}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Dependencies */}
              {(deps.incoming.length > 0 || deps.outgoing.length > 0) && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-white mb-3">Dependencias</h3>

                  {deps.incoming.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-white/30 uppercase tracking-wider mb-2">
                        Dependen de este plan ({deps.incoming.length})
                      </p>
                      <div className="space-y-2">
                        {deps.incoming.map((dep) => (
                          <DependencyRow
                            key={dep.id}
                            dep={dep}
                            direction="incoming"
                            isAffected={allAffected.has(dep.source)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {deps.outgoing.length > 0 && (
                    <div>
                      <p className="text-xs text-white/30 uppercase tracking-wider mb-2">
                        Este plan depende de ({deps.outgoing.length})
                      </p>
                      <div className="space-y-2">
                        {deps.outgoing.map((dep) => (
                          <DependencyRow
                            key={dep.id}
                            dep={dep}
                            direction="outgoing"
                            isAffected={allAffected.has(dep.target)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Failure Simulation */}
              <div className="mb-6">
                <button
                  onClick={handleSimulateFailure}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold
                    transition-all duration-200 ${
                      failureResult
                        ? 'bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/25'
                        : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white/80'
                    }`}
                >
                  <Zap className="w-4 h-4" />
                  {failureResult ? 'Ocultar Simulacion' : 'Simular Fallo'}
                </button>

                <AnimatePresence>
                  {failureResult && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                        <div className="flex items-center gap-2 mb-3">
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                          <span className="text-sm font-bold text-red-300">
                            Impacto de fallo en {plan.id}
                          </span>
                        </div>

                        {failureResult.directlyAffected.length > 0 && (
                          <div className="mb-3">
                            <p className="text-[11px] text-red-300/60 uppercase tracking-wider mb-1.5">
                              Afectados directos ({failureResult.directlyAffected.length})
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {failureResult.directlyAffected.map((id) => {
                                const p = getPlanById(id);
                                return (
                                  <span
                                    key={id}
                                    className="text-xs font-mono font-bold px-2 py-1 rounded-lg bg-red-500/20 text-red-300 border border-red-500/25"
                                  >
                                    {id}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {failureResult.cascadeAffected.length > 0 && (
                          <div>
                            <p className="text-[11px] text-orange-300/60 uppercase tracking-wider mb-1.5">
                              Cascada ({failureResult.cascadeAffected.length})
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {failureResult.cascadeAffected.map((id) => (
                                <span
                                  key={id}
                                  className="text-xs font-mono font-bold px-2 py-1 rounded-lg bg-orange-500/15 text-orange-300 border border-orange-500/20"
                                >
                                  {id}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {failureResult.directlyAffected.length === 0 && failureResult.cascadeAffected.length === 0 && (
                          <p className="text-xs text-white/40">
                            Ningun plan depende criticamente de {plan.id}. Fallo contenido.
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Link to full initiative */}
              <Link
                href={`/recursos/ruta/iniciativas/${plan.slug}`}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl
                           bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20
                           text-sm font-semibold text-white/70 hover:text-white transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                Ver Iniciativa Completa
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
