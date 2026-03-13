import { ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import SmoothReveal from '@/components/ui/SmoothReveal';
import { INITIATIVE_CATEGORIES, PHASE_META } from '@/lib/initiative-utils';
import type { StrategicInitiative } from '../../../../shared/strategic-initiatives';

interface InitiativeHeroProps {
  initiative: StrategicInitiative;
  onScrollToContent: () => void;
}

export default function InitiativeHero({ initiative, onScrollToContent }: InitiativeHeroProps) {
  const categoryMeta = INITIATIVE_CATEGORIES[initiative.category];
  const CategoryIcon = categoryMeta.icon;

  return (
    <section className="relative min-h-[85vh] flex flex-col justify-center items-center text-center px-4 overflow-hidden">
      {/* Subtle gradient bg */}
      <div className={`absolute inset-0 bg-gradient-to-br ${categoryMeta.gradient} opacity-50`} />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-50" />

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Category badge */}
        <SmoothReveal direction="up" className="mb-8">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm ${categoryMeta.color}`}>
            <CategoryIcon className="w-4 h-4" />
            <span className="text-sm font-bold tracking-wider uppercase">{categoryMeta.label}</span>
          </div>
        </SmoothReveal>

        {/* Title */}
        <SmoothReveal direction="up" delay={0.1}>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold tracking-tight mb-6 text-slate-900 leading-[1.1]">
            {initiative.title}
          </h1>
        </SmoothReveal>

        {/* Subtitle */}
        {initiative.subtitle && (
          <SmoothReveal direction="up" delay={0.2}>
            <p className="text-xl md:text-2xl text-slate-600 leading-relaxed font-light max-w-3xl mx-auto mb-12">
              {initiative.subtitle}
            </p>
          </SmoothReveal>
        )}

        {/* Phase journey breadcrumb */}
        <SmoothReveal direction="up" delay={0.3}>
          <div className="flex items-center justify-center gap-0 mb-12">
            {PHASE_META.map((phase, i) => {
              const PhaseIcon = phase.icon;
              return (
                <div key={phase.key} className="flex items-center">
                  <div className="flex flex-col items-center gap-1.5">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center border-2 bg-white shadow-sm"
                      style={{ borderColor: phase.accent }}
                    >
                      <PhaseIcon className="w-4 h-4" style={{ color: phase.accent }} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden md:block max-w-[80px] text-center leading-tight">
                      {phase.label}
                    </span>
                  </div>
                  {i < PHASE_META.length - 1 && (
                    <div className="w-8 md:w-16 h-px bg-slate-300 mx-1 mt-[-12px] md:mt-[-16px]" />
                  )}
                </div>
              );
            })}
          </div>
        </SmoothReveal>

        {/* Scroll CTA */}
        <SmoothReveal direction="up" delay={0.4}>
          <motion.button
            onClick={onScrollToContent}
            className="inline-flex flex-col items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span className="text-sm font-medium tracking-wide uppercase">Comenzar a Leer</span>
            <ChevronDown className="w-6 h-6" />
          </motion.button>
        </SmoothReveal>
      </div>
    </section>
  );
}
