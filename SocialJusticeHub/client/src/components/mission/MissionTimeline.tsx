import { useMemo } from 'react';
import { CheckCircle2, Clock, Circle } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import SmoothReveal from '@/components/ui/SmoothReveal';
import { TEMPORAL_META } from '@/lib/initiative-utils';
import type { MissionDefinition } from '../../../../shared/mission-registry';

interface MissionTimelineProps {
  milestones: any[];
  mission: MissionDefinition;
}

type TemporalPhase = 'emergencia' | 'transicion' | 'permanencia';

function detectPhase(title: string): TemporalPhase {
  const lower = title.toLowerCase();
  if (lower.includes('emergencia') || lower.includes('emergenc')) return 'emergencia';
  if (lower.includes('transición') || lower.includes('transicion')) return 'transicion';
  if (lower.includes('consolidación') || lower.includes('consolidacion') || lower.includes('permanencia')) return 'permanencia';
  return 'transicion';
}

const STATUS_DOT: Record<string, string> = {
  pending: 'bg-slate-500',
  in_progress: 'bg-amber-500',
  completed: 'bg-emerald-500',
};

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendiente',
  in_progress: 'En progreso',
  completed: 'Completado',
};

function StatusIcon({ status }: { status: string }) {
  if (status === 'completed') return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
  if (status === 'in_progress') return <Clock className="w-4 h-4 text-amber-500" />;
  return <Circle className="w-4 h-4 text-slate-500" />;
}

export default function MissionTimeline({ milestones, mission }: MissionTimelineProps) {
  const grouped = useMemo(() => {
    const phases: Record<TemporalPhase, any[]> = {
      emergencia: [],
      transicion: [],
      permanencia: [],
    };
    for (const m of milestones) {
      const phase = detectPhase(m.title ?? '');
      phases[phase].push(m);
    }
    return phases;
  }, [milestones]);

  const orderedPhases = mission.temporalOrders as TemporalPhase[];
  const allPhases: TemporalPhase[] = ['emergencia', 'transicion', 'permanencia'];
  const phasesToShow = allPhases.filter(p => orderedPhases.includes(p) || grouped[p].length > 0);

  if (milestones.length === 0) {
    return (
      <GlassCard className="p-6 bg-white/5 backdrop-blur-md border border-white/10" hoverEffect={false}>
        <p className="text-slate-400 text-sm text-center py-4">No hay hitos registrados aún.</p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      {phasesToShow.map((phase) => {
        const meta = TEMPORAL_META[phase];
        const Icon = meta.icon;
        const items = grouped[phase];
        if (items.length === 0) return null;

        return (
          <GlassCard
            key={phase}
            className={`p-5 bg-white/5 backdrop-blur-md border border-white/10 ${meta.bgClass}/30`}
            hoverEffect={false}
          >
            {/* Phase header */}
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/10">
              <div className={`p-2 rounded-xl ${meta.bgClass}`}>
                <Icon className={`w-4 h-4 ${meta.color}`} />
              </div>
              <div>
                <p className={`font-mono text-xs tracking-[0.3em] uppercase ${meta.color}`}>
                  {meta.label}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">{meta.range}</p>
              </div>
            </div>

            {/* Milestones */}
            <div className="relative pl-4">
              {/* Vertical line */}
              <div
                className="absolute left-0 top-2 bottom-2 w-px"
                style={{ background: `${meta.accent}33` }}
              />

              <div className="space-y-4">
                {items.map((milestone: any, idx: number) => (
                  <SmoothReveal key={milestone.id ?? idx} delay={idx * 0.07}>
                    <div className="relative flex gap-3">
                      {/* Dot on the line */}
                      <div
                        className="absolute -left-4 top-1 w-2 h-2 rounded-full border-2 flex-shrink-0"
                        style={{
                          borderColor: meta.accent,
                          background: milestone.status === 'completed' ? meta.accent : 'transparent',
                        }}
                      />

                      <div className="pl-2 flex-1">
                        <div className="flex items-start gap-2 justify-between">
                          <p className="text-slate-200 text-sm font-medium leading-snug">
                            {milestone.title}
                          </p>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span
                              className={`inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_DOT[milestone.status] ?? 'bg-slate-500'}`}
                            />
                            <span className="text-xs text-slate-500">
                              {STATUS_LABEL[milestone.status] ?? milestone.status}
                            </span>
                          </div>
                        </div>
                        {milestone.description && (
                          <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                            {milestone.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </SmoothReveal>
                ))}
              </div>
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
}
