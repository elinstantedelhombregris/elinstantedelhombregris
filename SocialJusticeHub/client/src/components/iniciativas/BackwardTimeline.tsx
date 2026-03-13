import { Sparkles, MapPin, Route } from 'lucide-react';
import SmoothReveal from '@/components/ui/SmoothReveal';
import type { PathStep } from '../../../../shared/strategic-initiatives';

interface BackwardTimelineProps {
  overview: string;
  steps: PathStep[];
}

export default function BackwardTimeline({ overview, steps }: BackwardTimelineProps) {
  const sortedSteps = [...steps].sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <section id="phase-elCamino" className="relative py-20 md:py-32 bg-emerald-50/30">
      {/* Watermark number */}
      <div className="absolute top-8 right-8 md:right-16 text-[12rem] md:text-[16rem] font-serif font-bold text-emerald-100/50 leading-none select-none pointer-events-none">
        04
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 lg:pl-24">
        {/* Phase header */}
        <SmoothReveal direction="up">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-emerald-100 text-emerald-600">
              <Route className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Fase 04</span>
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-slate-900">El Camino</h2>
            </div>
          </div>
        </SmoothReveal>

        <SmoothReveal direction="up" delay={0.1}>
          <p className="text-lg text-slate-600 leading-relaxed mb-16 max-w-3xl">
            {overview}
          </p>
        </SmoothReveal>

        {/* Timeline */}
        <div className="relative">
          {/* ===== GOAL NODE (top) ===== */}
          <SmoothReveal direction="up" delay={0.15}>
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div className="mt-3 text-center">
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Meta</span>
                <p className="text-lg font-serif font-bold text-slate-900">Estado Ideal</p>
              </div>
            </div>
          </SmoothReveal>

          {/* ===== STEPS ===== */}
          <div className="relative">
            {/* Central vertical line */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-emerald-200 md:-translate-x-px" />

            {sortedSteps.map((step, index) => {
              const isEven = index % 2 === 0;

              return (
                <SmoothReveal key={step.id} direction="up" delay={0.2 + index * 0.1}>
                  <div className={`relative flex items-start mb-8 ${
                    /* Mobile: always right of the line. Desktop: alternate */
                    'pl-16 md:pl-0'
                  }`}>
                    {/* Desktop: alternating layout */}
                    <div className={`hidden md:flex w-full items-start ${isEven ? 'flex-row-reverse' : ''}`}>
                      {/* Card side */}
                      <div className="w-[calc(50%-2rem)]">
                        <div className="bg-white rounded-2xl border border-emerald-100 shadow-lg p-6 hover:shadow-xl transition-shadow">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                              {step.timeline}
                            </span>
                          </div>
                          <h4 className="text-xl font-serif font-bold text-slate-900 mb-2">{step.title}</h4>
                          <p className="text-slate-600 leading-relaxed text-sm">{step.description}</p>
                        </div>
                      </div>

                      {/* Center dot */}
                      <div className="flex flex-col items-center w-16 shrink-0">
                        <div className="w-8 h-8 rounded-full bg-white border-2 border-emerald-400 flex items-center justify-center shadow-sm z-10">
                          <span className="text-xs font-bold text-emerald-600">{step.orderIndex}</span>
                        </div>
                      </div>

                      {/* Empty side */}
                      <div className="w-[calc(50%-2rem)]" />
                    </div>

                    {/* Mobile layout: all on the right */}
                    <div className="md:hidden">
                      {/* Dot on the line */}
                      <div className="absolute left-3 top-2 w-7 h-7 rounded-full bg-white border-2 border-emerald-400 flex items-center justify-center shadow-sm z-10">
                        <span className="text-[10px] font-bold text-emerald-600">{step.orderIndex}</span>
                      </div>

                      <div className="bg-white rounded-2xl border border-emerald-100 shadow-lg p-5">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                            {step.timeline}
                          </span>
                        </div>
                        <h4 className="text-lg font-serif font-bold text-slate-900 mb-1">{step.title}</h4>
                        <p className="text-slate-600 leading-relaxed text-sm">{step.description}</p>
                      </div>
                    </div>
                  </div>
                </SmoothReveal>
              );
            })}
          </div>

          {/* ===== TODAY NODE (bottom) ===== */}
          <SmoothReveal direction="up" delay={0.2 + sortedSteps.length * 0.1}>
            <div className="flex flex-col items-center mt-8">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center shadow-lg">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div className="mt-3 text-center">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Punto de Partida</span>
                <p className="text-lg font-serif font-bold text-slate-900">Estamos acá</p>
              </div>
            </div>
          </SmoothReveal>
        </div>
      </div>
    </section>
  );
}
