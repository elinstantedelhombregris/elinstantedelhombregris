import GlassCard from '@/components/ui/GlassCard';
import { ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';

interface GuardrailsPanelProps {
  pauseConditions: string[];
  evidence: any[];
  missionStatus: string;
}

function countFlags(evidence: any[], condition: string): number {
  return evidence.filter(
    (e) =>
      e.status === 'flagged' &&
      (e.flagCategory ?? '').toLowerCase().includes(condition.toLowerCase().slice(0, 15)),
  ).length;
}

function indicatorClass(count: number): { dot: string; text: string; bar: string } {
  if (count === 0) return { dot: 'bg-emerald-500', text: 'text-emerald-400', bar: 'bg-emerald-500' };
  if (count <= 2)  return { dot: 'bg-amber-500',   text: 'text-amber-400',   bar: 'bg-amber-500' };
  return              { dot: 'bg-red-500',     text: 'text-red-400',     bar: 'bg-red-500' };
}

export default function GuardrailsPanel({ pauseConditions, evidence, missionStatus }: GuardrailsPanelProps) {
  const isPaused = missionStatus === 'paused';

  return (
    <GlassCard
      className={`bg-white/5 backdrop-blur-md border ${isPaused ? 'border-amber-500/40 bg-amber-500/5' : 'border-white/10'}`}
      hoverEffect={false}
    >
      <div className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <ShieldAlert className={`w-4 h-4 ${isPaused ? 'text-amber-400' : 'text-slate-400'}`} />
          <span className={`font-mono text-xs tracking-[0.3em] uppercase ${isPaused ? 'text-amber-400' : 'text-slate-400'}`}>
            Condiciones de guardia
          </span>
        </div>

        {/* Paused banner */}
        {isPaused && (
          <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-mono text-xs tracking-[0.3em] uppercase text-amber-400">
                Misión en pausa
              </p>
              <p className="text-xs text-amber-300/80 mt-1">
                Se activó una condición de guardia. La misión está pausada mientras se evalúa la situación.
              </p>
            </div>
          </div>
        )}

        {/* Condition list */}
        <div className="space-y-3">
          {pauseConditions.map((condition, idx) => {
            const count = countFlags(evidence, condition);
            const { dot, text, bar } = indicatorClass(count);

            return (
              <div key={idx} className="flex items-start gap-3">
                {/* Colored dot */}
                <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${dot}`} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-slate-300 text-sm leading-snug">{condition}</p>
                    <span className={`text-xs font-mono flex-shrink-0 ${text}`}>
                      {count === 0 ? 'Sin alertas' : `${count} alerta${count !== 1 ? 's' : ''}`}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-1.5 h-1 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${bar}`}
                      style={{ width: `${Math.min(count * 33.3, 100)}%`, opacity: count === 0 ? 0.2 : 0.7 }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* All clear note */}
        {!isPaused && pauseConditions.every((c) => countFlags(evidence, c) === 0) && (
          <div className="flex items-center gap-2 text-xs text-emerald-500 pt-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Sin alertas activas — misión en curso</span>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
