import React, { useRef, useEffect, useState } from 'react';
import { motion, useMotionValue, useInView, animate } from 'framer-motion';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
} from 'recharts';
import {
  RefreshCw, Heart, Zap, GraduationCap, Scale,
  Briefcase, HeartPulse, Users, Sunrise,
} from 'lucide-react';
import {
  useConvergenceAnalysis,
  TYPE_COLORS,
  TYPE_LABELS,
  THEME_META,
  type DreamType,
  type ThemeCard,
} from '@/hooks/useConvergenceAnalysis';
import { staggerContainer, fadeUp } from '@/lib/motion-variants';

// ─── Icon map for theme cards ───

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  RefreshCw, Heart, Zap, GraduationCap, Scale,
  Briefcase, HeartPulse, Users, Sunrise,
};

const DREAM_TYPES: DreamType[] = ['dream', 'value', 'need', 'basta', 'compromiso', 'recurso'];

// ─── Block 1: Animated Convergence Number ───

const ConvergenceNumber: React.FC<{
  percentage: number;
  totalContributions: number;
}> = ({ percentage, totalContributions }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const motionVal = useMotionValue(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(motionVal, percentage, {
      duration: 2,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return controls.stop;
  }, [isInView, percentage, motionVal]);

  return (
    <div ref={ref} className="text-center py-12 md:py-16 relative">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-72 h-72 rounded-full bg-purple-600/20 blur-[100px]" />
      </div>

      <div className="relative z-10">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-7xl md:text-9xl font-black text-white tabular-nums"
        >
          {display}
          <span className="text-purple-400">%</span>
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-6 text-lg md:text-xl text-slate-300 max-w-xl mx-auto leading-relaxed"
        >
          de convergencia entre{' '}
          <strong className="text-white">{totalContributions.toLocaleString('es-AR')}</strong>{' '}
          voces
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-3 text-sm text-slate-500 font-mono"
        >
          Lo que soñás, lo sueña tu vecino
        </motion.p>
      </div>
    </div>
  );
};

// ─── Block 2: Radar Chart ───

const ConvergenceRadar: React.FC<{
  data: Array<{ type: DreamType; label: string; count: number }>;
}> = ({ data }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  const radarData = data.map((d) => ({
    subject: d.label,
    value: d.count,
    fullMark: Math.max(...data.map((x) => x.count), 1),
  }));

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-8"
    >
      <h3 className="text-center text-sm font-mono uppercase tracking-[0.2em] text-slate-400 mb-6">
        Distribución por Tipo de Señal
      </h3>
      <ResponsiveContainer width="100%" height={320}>
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
          <PolarGrid stroke="rgba(255,255,255,0.08)" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
          />
          <Radar
            name="Señales"
            dataKey="value"
            stroke="#7D5BDE"
            fill="#7D5BDE"
            fillOpacity={0.2}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

// ─── Block 3: Top Theme Cards ───

const TopThemeCards: React.FC<{ cards: ThemeCard[] }> = ({ cards }) => {
  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: '-60px' }}
      className="grid grid-cols-1 md:grid-cols-3 gap-4"
    >
      {cards.slice(0, 3).map((card) => {
        const Icon = ICON_MAP[card.icon];
        const firstQuote = Object.values(card.quotes).flat()[0];

        return (
          <motion.div
            key={card.theme}
            variants={fadeUp}
            className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:-translate-y-1 transition-transform duration-300"
          >
            <div className="flex items-center gap-3 mb-4">
              {Icon && <Icon className="w-5 h-5 text-purple-400" />}
              <h4 className="text-white font-semibold text-sm">{card.label}</h4>
            </div>

            {/* Convergence dots */}
            <div className="flex gap-1.5 mb-4">
              {DREAM_TYPES.map((t) => (
                <div
                  key={t}
                  className="w-2.5 h-2.5 rounded-full transition-opacity"
                  style={{
                    backgroundColor: TYPE_COLORS[t],
                    opacity: card.presentTypes.includes(t) ? 1 : 0.15,
                  }}
                  title={TYPE_LABELS[t]}
                />
              ))}
            </div>

            <p className="text-xs text-slate-500 font-mono mb-2">
              {card.convergenceCount} de 6 tipos convergen
            </p>

            {firstQuote && (
              <p className="text-xs text-slate-400 italic leading-relaxed line-clamp-3">
                "{firstQuote}"
              </p>
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
};

// ─── Main Component ───

const ConvergenceDashboard: React.FC = () => {
  const {
    convergencePercentage,
    totalContributions,
    themeCards,
    typeDistribution,
    isLoading,
  } = useConvergenceAnalysis();

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto" />
        <p className="text-slate-500 text-sm mt-4">Analizando convergencia...</p>
      </div>
    );
  }

  if (totalContributions === 0) {
    return (
      <div className="py-24 text-center">
        <p className="text-slate-400 text-lg">
          Todavía no hay señales. Sé el primero en cargar tu verdad en el mapa.
        </p>
      </div>
    );
  }

  return (
    <section className="py-24 bg-gradient-to-b from-[#0a0a0a] via-[#0f1116] to-[#0a0a0a] relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-8">
          <span className="text-purple-500 font-mono text-xs tracking-[0.3em] uppercase">
            Convergencia
          </span>
          <h2 className="text-4xl font-bold text-white mt-4 mb-6">
            Lo Que Emerge
          </h2>
        </div>

        {/* Block 1: The big number */}
        <ConvergenceNumber
          percentage={convergencePercentage}
          totalContributions={totalContributions}
        />

        {/* Block 2: Radar chart */}
        <div className="max-w-lg mx-auto mb-16">
          <ConvergenceRadar data={typeDistribution} />
        </div>

        {/* Block 3: Top theme cards */}
        <div className="max-w-4xl mx-auto">
          <TopThemeCards cards={themeCards} />
        </div>
      </div>
    </section>
  );
};

export default ConvergenceDashboard;
