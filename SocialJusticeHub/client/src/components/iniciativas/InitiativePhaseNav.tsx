import { useEffect, useState } from 'react';
import { PHASE_META } from '@/lib/initiative-utils';

interface InitiativePhaseNavProps {
  activePhase: string;
  visible: boolean;
}

export default function InitiativePhaseNav({ activePhase, visible }: InitiativePhaseNavProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const scrollToPhase = (key: string) => {
    const el = document.getElementById(`phase-${key}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (!visible) return null;

  // Mobile: sticky top bar with dots
  if (isMobile) {
    return (
      <div className="fixed top-16 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="flex items-center justify-center gap-3 px-4 py-3">
          {PHASE_META.map((phase, i) => {
            const isActive = activePhase === phase.key;
            return (
              <div key={phase.key} className="flex items-center gap-3">
                <button
                  onClick={() => scrollToPhase(phase.key)}
                  className="flex flex-col items-center gap-1 transition-all"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isActive
                        ? 'text-white shadow-md scale-110'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                    style={isActive ? { backgroundColor: phase.accent } : {}}
                  >
                    {phase.number}
                  </div>
                </button>
                {i < PHASE_META.length - 1 && (
                  <div className="w-4 h-px bg-slate-200" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Desktop: sticky left sidebar
  return (
    <div className="fixed left-6 xl:left-10 top-1/2 -translate-y-1/2 z-40">
      <div className="relative flex flex-col items-center gap-0">
        {/* Vertical line */}
        <div className="absolute top-4 bottom-4 left-1/2 -translate-x-1/2 w-px bg-slate-200" />

        {PHASE_META.map((phase) => {
          const isActive = activePhase === phase.key;
          const PhaseIcon = phase.icon;

          return (
            <button
              key={phase.key}
              onClick={() => scrollToPhase(phase.key)}
              className="relative flex items-center gap-3 py-3 group"
            >
              {/* Dot/circle */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isActive
                    ? 'bg-white shadow-lg scale-110'
                    : 'bg-white/80 border-slate-200 hover:border-slate-300'
                }`}
                style={isActive ? { borderColor: phase.accent } : {}}
              >
                <PhaseIcon
                  className="w-4 h-4 transition-colors"
                  style={{ color: isActive ? phase.accent : '#94a3b8' }}
                />
              </div>

              {/* Label (visible on hover or active) */}
              <span
                className={`absolute left-14 whitespace-nowrap text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'
                }`}
                style={{ color: isActive ? phase.accent : '#64748b' }}
              >
                {phase.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
