import { TrendingDown } from 'lucide-react';
import SmoothReveal from '@/components/ui/SmoothReveal';
import type { InitiativeSection } from '../../../../shared/strategic-initiatives';

interface ProjectionSectionProps {
  data: InitiativeSection;
}

export default function ProjectionSection({ data }: ProjectionSectionProps) {
  return (
    <section id="phase-quePasaSiNoCambiamos" className="relative py-20 md:py-32 bg-amber-50/30">
      {/* Watermark number */}
      <div className="absolute top-8 right-8 md:right-16 text-[12rem] md:text-[16rem] font-serif font-bold text-amber-100/50 leading-none select-none pointer-events-none">
        02
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 lg:pl-24">
        {/* Phase header */}
        <SmoothReveal direction="up">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-xl bg-amber-100 text-amber-600">
              <TrendingDown className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">Fase 02</span>
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-slate-900">{data.title}</h2>
            </div>
          </div>
        </SmoothReveal>

        {/* Content */}
        <SmoothReveal direction="up" delay={0.1}>
          <div
            className="prose prose-lg prose-slate max-w-none mb-10 [&>p]:text-slate-700 [&>p]:leading-relaxed [&>p]:mb-4 [&_strong]:text-slate-900"
            dangerouslySetInnerHTML={{ __html: data.content }}
          />
        </SmoothReveal>

        {/* Pull quote */}
        {data.pullQuote && (
          <SmoothReveal direction="up" delay={0.2}>
            <blockquote className="border-l-4 border-amber-400 bg-white rounded-r-2xl p-6 md:p-8 shadow-sm my-10">
              <p className="text-xl md:text-2xl font-serif italic text-slate-800 leading-relaxed">
                "{data.pullQuote}"
              </p>
            </blockquote>
          </SmoothReveal>
        )}

        {/* Stats */}
        {data.stats && data.stats.length > 0 && (
          <SmoothReveal direction="up" delay={0.3}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-10">
              {data.stats.map((stat) => (
                <div key={stat.label} className="bg-white rounded-2xl p-5 border border-amber-100 shadow-sm text-center">
                  <p className="text-2xl md:text-3xl font-bold text-amber-600 mb-1">{stat.value}</p>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{stat.label}</p>
                </div>
              ))}
            </div>
          </SmoothReveal>
        )}
      </div>
    </section>
  );
}
