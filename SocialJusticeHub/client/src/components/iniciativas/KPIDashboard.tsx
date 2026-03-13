import { BarChart3 } from 'lucide-react';
import SmoothReveal from '@/components/ui/SmoothReveal';
import KPIGauge from './KPIGauge';
import type { KPI } from '../../../../shared/strategic-initiatives';

interface KPIDashboardProps {
  kpis: KPI[];
}

export default function KPIDashboard({ kpis }: KPIDashboardProps) {
  return (
    <section id="phase-kpis" className="relative py-20 md:py-32 bg-indigo-50/30">
      {/* Watermark number */}
      <div className="absolute top-8 right-8 md:right-16 text-[12rem] md:text-[16rem] font-serif font-bold text-indigo-100/50 leading-none select-none pointer-events-none">
        05
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 lg:pl-24">
        {/* Phase header */}
        <SmoothReveal direction="up">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-indigo-100 text-indigo-600">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Fase 05</span>
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-slate-900">Indicadores</h2>
            </div>
          </div>
        </SmoothReveal>

        <SmoothReveal direction="up" delay={0.1}>
          <p className="text-lg text-slate-600 leading-relaxed mb-12 max-w-3xl">
            Métricas concretas para medir el avance. Cada indicador tiene un valor actual,
            una meta y hitos intermedios para mantener el rumbo.
          </p>
        </SmoothReveal>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kpis.map((kpi, index) => (
            <SmoothReveal key={kpi.id} direction="up" delay={0.15 + index * 0.08}>
              <KPIGauge kpi={kpi} />
            </SmoothReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
