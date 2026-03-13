import { useEffect, useState, useRef } from 'react';
import { useInView } from 'framer-motion';
import type { KPI } from '../../../../shared/strategic-initiatives';

interface KPIGaugeProps {
  kpi: KPI;
}

export default function KPIGauge({ kpi }: KPIGaugeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [displayValue, setDisplayValue] = useState(0);

  const progress = Math.min((kpi.currentValue / kpi.targetValue) * 100, 100);

  // Color based on progress
  const getColor = () => {
    if (progress < 33) return { bar: 'bg-red-500', text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' };
    if (progress < 66) return { bar: 'bg-amber-500', text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' };
    return { bar: 'bg-emerald-500', text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' };
  };

  const colors = getColor();

  // Animated count-up
  useEffect(() => {
    if (!isInView) return;

    const duration = 1200;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const p = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplayValue(Math.round(kpi.currentValue * eased));

      if (p < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, kpi.currentValue]);

  return (
    <div ref={ref} className={`bg-white rounded-2xl p-6 border ${colors.border} shadow-sm hover:shadow-md transition-shadow`}>
      {/* Metric name */}
      <h4 className="text-sm font-bold text-slate-900 mb-4 leading-snug">{kpi.metric}</h4>

      {/* Values */}
      <div className="flex items-baseline justify-between mb-3">
        <div>
          <span className={`text-3xl font-bold ${colors.text}`}>{displayValue}</span>
          <span className="text-sm text-slate-400 ml-1">{kpi.unit}</span>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold text-emerald-600">{kpi.targetValue}</span>
          <span className="text-xs text-slate-400 ml-1">{kpi.unit}</span>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider">Meta</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden mb-3">
        <div
          className={`absolute top-0 left-0 h-full ${colors.bar} rounded-full transition-all duration-1000 ease-out`}
          style={{ width: isInView ? `${progress}%` : '0%' }}
        />
        {/* Milestone markers */}
        {kpi.milestones?.map((milestone) => {
          const pos = (milestone.targetValue / kpi.targetValue) * 100;
          return (
            <div
              key={milestone.date}
              className="absolute top-0 h-full w-px bg-slate-300"
              style={{ left: `${pos}%` }}
              title={`${milestone.date}: ${milestone.targetValue}${kpi.unit}`}
            />
          );
        })}
      </div>

      {/* Milestones row */}
      {kpi.milestones && kpi.milestones.length > 0 && (
        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-3">
          <span>Actual</span>
          {kpi.milestones.map((m) => (
            <span key={m.date} className="font-medium">
              {m.date}: {m.targetValue}{kpi.unit}
            </span>
          ))}
        </div>
      )}

      {/* Source */}
      {kpi.source && (
        <p className="text-[10px] text-slate-400 mt-2">
          Fuente: {kpi.source}
        </p>
      )}
    </div>
  );
}
