import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';
import SmoothReveal from '@/components/ui/SmoothReveal';
import { INITIATIVE_CATEGORIES, PHASE_META } from '@/lib/initiative-utils';
import { GLASS_CARD, GLASS_CARD_HOVER } from '@/lib/design-tokens';
import type { StrategicInitiative } from '../../../../shared/strategic-initiatives';
import StatusBadge from '@/components/StatusBadge';

interface InitiativeCardProps {
  initiative: StrategicInitiative;
  index: number;
  delay?: number;
}

export default function InitiativeCard({ initiative, index, delay = 0 }: InitiativeCardProps) {
  const categoryMeta = INITIATIVE_CATEGORIES[initiative.category];
  const CategoryIcon = categoryMeta.icon;

  return (
    <SmoothReveal delay={delay} className="h-full">
      <Link href={`/recursos/ruta/iniciativas/${initiative.slug}`}>
        <div className={`h-full ${GLASS_CARD} ${GLASS_CARD_HOVER} cursor-pointer overflow-hidden group flex flex-col relative`}>
          <div className="p-8 relative z-10 flex-1 flex flex-col">
            {/* Header: category badge + index */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex flex-col gap-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
                  <CategoryIcon className="w-4 h-4" />
                  <span className="text-xs font-bold tracking-wide uppercase">{categoryMeta.label}</span>
                </div>
                <StatusBadge kind="idealizado" />
              </div>
              <span className="text-4xl font-serif font-bold text-white/[0.08] group-hover:text-white/[0.14] transition-colors">
                0{index + 1}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-2xl font-serif font-bold text-white mb-3 leading-tight">
              {initiative.title}
            </h3>

            {/* Summary */}
            <p className="text-base text-slate-400 leading-relaxed mb-6 flex-1 line-clamp-3">
              {initiative.summary}
            </p>

            {/* Phase dots */}
            <div className="flex items-center gap-1.5 mb-6">
              {PHASE_META.map((phase) => (
                <div key={phase.key} className="flex items-center gap-1.5">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: phase.accent }}
                    title={phase.label}
                  />
                  {phase.number < 5 && (
                    <div className="w-3 h-px bg-white/10" />
                  )}
                </div>
              ))}
              <span className="text-xs text-slate-500 ml-2">5 fases</span>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {initiative.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="px-2.5 py-1 rounded-full bg-white/5 text-xs text-slate-400 font-medium">
                  {tag}
                </span>
              ))}
            </div>

            {/* CTA */}
            <div className="pt-5 border-t border-white/10 flex items-center justify-between mt-auto">
              <div>
                <p className="text-sm text-slate-400 font-medium">{initiative.kpis.length} indicadores</p>
              </div>
              <div className="flex items-center text-[#9D85E8] font-bold text-sm tracking-wide group-hover:translate-x-2 transition-transform">
                Leer Propuesta <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </SmoothReveal>
  );
}
