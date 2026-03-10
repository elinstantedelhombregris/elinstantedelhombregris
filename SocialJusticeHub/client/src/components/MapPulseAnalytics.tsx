import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import {
  RefreshCw, Heart, Zap, GraduationCap, Scale,
  Briefcase, HeartPulse, Users, Sunrise,
  MapPin, TrendingUp, TrendingDown, Flame,
} from 'lucide-react';
import {
  useTerritoryPulse,
  TYPE_COLORS,
  TYPE_LABELS,
  type DreamType,
  type MandatoArticle,
  type VoiceEntry,
  type TerritoryCard as TerritoryCardData,
  type MomentumData,
  type RedLinesSection as RedLinesSectionData,
} from '@/hooks/useTerritoryPulse';

const DREAM_TYPES: DreamType[] = ['dream', 'value', 'need', 'basta', 'compromiso'];

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  RefreshCw, Heart, Zap, GraduationCap, Scale,
  Briefcase, HeartPulse, Users, Sunrise,
};

// ─── Animated Counter ───

const AnimatedCounter: React.FC<{ value: number; className?: string }> = ({ value, className }) => {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (value === 0) { node.textContent = '0'; return; }

    const duration = 2000;
    const startTime = performance.now();
    let rafId: number;

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      node.textContent = Math.round(eased * value).toLocaleString();
      if (progress < 1) rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [value]);

  return <span ref={ref} className={className}>0</span>;
};

// ─── 1. El Latido — Hero Stats ───

const ElLatido: React.FC<{
  totalVoices: number;
  topArticle: MandatoArticle | null;
  momentum: MomentumData;
}> = ({ totalVoices, topArticle, momentum }) => {
  const TopIcon = topArticle ? ICON_MAP[topArticle.icon] : null;
  const ArrowIcon = momentum.isGrowing ? TrendingUp : TrendingDown;
  const changeColor = momentum.isGrowing ? 'text-emerald-400' : 'text-red-400';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
      {/* Total Voices */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="rounded-2xl bg-gradient-to-br from-blue-950/40 to-purple-950/20 border border-blue-500/20 p-6 text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-blue-500/5 animate-pulse" />
        <p className="text-xs uppercase tracking-[0.3em] text-blue-400 font-mono mb-2 relative z-10">
          Voces Escuchadas
        </p>
        <AnimatedCounter
          value={totalVoices}
          className="text-5xl md:text-6xl font-bold text-white relative z-10 block"
        />
        <p className="text-sm text-slate-400 mt-2 relative z-10">y sumando</p>
      </motion.div>

      {/* Top Priority */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl bg-white/5 border border-white/10 p-6 text-center flex flex-col justify-center"
      >
        <p className="text-xs uppercase tracking-[0.3em] text-purple-400 font-mono mb-3">
          Prioridad #1
        </p>
        <div className="flex items-center justify-center gap-3">
          {TopIcon && (
            <div className="p-2 rounded-xl bg-purple-500/10">
              <TopIcon className="w-6 h-6 text-purple-400" />
            </div>
          )}
          <span className="text-xl font-bold text-white">{topArticle?.label || '\u2014'}</span>
        </div>
        {topArticle && (
          <div className="mt-3 flex items-center justify-center gap-1.5">
            {DREAM_TYPES.filter(t => topArticle.penetration[t] > 0).map(t => (
              <div
                key={t}
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: TYPE_COLORS[t] }}
              />
            ))}
            <span className="text-[10px] text-slate-500 ml-1">
              {DREAM_TYPES.filter(t => topArticle.penetration[t] > 0).length}/5 tipos convergen
            </span>
          </div>
        )}
      </motion.div>

      {/* Momentum */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl bg-white/5 border border-white/10 p-6 text-center"
      >
        <p className="text-xs uppercase tracking-[0.3em] text-emerald-400 font-mono mb-2">
          Momentum
        </p>
        <div className="flex items-center justify-center gap-2 mb-1">
          <ArrowIcon className={`w-5 h-5 ${changeColor}`} />
          <span className={`text-3xl font-bold ${changeColor}`}>
            {momentum.changePercent > 0 ? '+' : ''}{momentum.changePercent}%
          </span>
        </div>
        <p className="text-xs text-slate-500 mb-3">esta semana vs. anterior</p>
        {momentum.dailyTotals.length > 0 && (
          <div className="h-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={momentum.dailyTotals} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="pulseSparkGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#10b981"
                  strokeWidth={1.5}
                  fill="url(#pulseSparkGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </motion.div>
    </div>
  );
};

// ─── 2. Convergence Bars — Lo Que Nos Une ───

const ConvergenceBars: React.FC<{ articles: MandatoArticle[] }> = ({ articles }) => {
  if (articles.length === 0) return null;

  const maxSignal = Math.max(...articles.map(a => a.combinedSignal));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="mb-14"
    >
      <div className="text-center mb-8">
        <span className="text-purple-500 font-mono text-xs tracking-[0.3em] uppercase">
          Convergencia
        </span>
        <h3 className="text-3xl md:text-4xl font-bold text-white mt-3 mb-3">Lo Que Nos Une</h3>
        <p className="text-slate-400 max-w-xl mx-auto text-sm">
          Sueños, valores, necesidades y compromisos — todos confluyen en las mismas prioridades.
        </p>
      </div>

      {/* Type legend */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {DREAM_TYPES.map(t => (
          <div key={t} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: TYPE_COLORS[t] }} />
            <span className="text-xs text-slate-400">{TYPE_LABELS[t]}</span>
          </div>
        ))}
      </div>

      {/* Bars */}
      <div className="space-y-3 max-w-3xl mx-auto">
        {articles.slice(0, 7).map((article, i) => {
          const Icon = ICON_MAP[article.icon];
          const barWidth = maxSignal > 0 ? (article.combinedSignal / maxSignal) * 100 : 0;
          const totalPenetration = DREAM_TYPES.reduce((sum, t) => sum + article.penetration[t], 0) || 1;
          const convergenceScore = DREAM_TYPES.filter(t => article.penetration[t] > 0).length;

          return (
            <motion.div
              key={article.theme}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group"
            >
              {/* Mobile: label above bar */}
              <div className="flex items-center gap-2 mb-1.5 md:hidden">
                {Icon && <Icon className="w-3.5 h-3.5 text-purple-400/70" />}
                <span className="text-xs font-medium text-slate-300">{article.label}</span>
                <span className="text-[10px] font-mono text-slate-500 ml-auto">
                  {convergenceScore}/5
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Desktop: label left of bar */}
                <div className="hidden md:flex w-44 items-center gap-2 flex-shrink-0">
                  {Icon && <Icon className="w-4 h-4 text-purple-400/70 flex-shrink-0" />}
                  <span className="text-sm font-medium text-slate-300 truncate">{article.label}</span>
                </div>

                {/* Stacked bar */}
                <div
                  className={`flex-1 h-7 rounded-lg overflow-hidden relative transition-colors ${
                    convergenceScore === 5 ? 'bg-purple-500/10' : 'bg-white/5'
                  } group-hover:bg-white/[0.07]`}
                >
                  <motion.div
                    className="h-full flex rounded-lg overflow-hidden"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${barWidth}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {DREAM_TYPES.map(t => {
                      const segPct = (article.penetration[t] / totalPenetration) * 100;
                      return segPct > 0 ? (
                        <div
                          key={t}
                          className="h-full"
                          style={{ backgroundColor: TYPE_COLORS[t], width: `${segPct}%`, opacity: 0.85 }}
                        />
                      ) : null;
                    })}
                  </motion.div>
                </div>

                {/* Convergence badge */}
                <div className="hidden md:flex items-center gap-1 w-12 justify-end flex-shrink-0">
                  <span className="text-[10px] font-mono text-slate-500">{convergenceScore}/5</span>
                </div>
              </div>

              {/* Hover quote */}
              {(() => {
                const firstQuote = Object.values(article.quotes).find(Boolean);
                return firstQuote ? (
                  <div className="md:ml-[11.75rem] md:pl-3 mt-1 max-h-0 overflow-hidden opacity-0 group-hover:max-h-16 group-hover:opacity-100 transition-all duration-300 ease-out">
                    <p className="text-xs italic text-slate-500 leading-relaxed truncate">
                      &ldquo;{firstQuote}&rdquo;
                    </p>
                  </div>
                ) : null;
              })()}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

// ─── 3. Voice Stream — El Río de Voces ───

const VoiceChip: React.FC<{ entry: VoiceEntry }> = ({ entry }) => (
  <div
    className="flex-shrink-0 w-72 rounded-xl bg-white/5 border border-white/10 px-4 py-3"
    style={{ borderLeftWidth: '3px', borderLeftColor: TYPE_COLORS[entry.type] }}
  >
    <p className="text-sm text-slate-300 italic leading-relaxed line-clamp-2">
      &ldquo;{entry.text}&rdquo;
    </p>
    <div className="flex items-center justify-between mt-2">
      {entry.location ? (
        <span className="text-[10px] text-slate-500 flex items-center gap-1">
          <MapPin className="w-2.5 h-2.5" />
          {entry.location}
        </span>
      ) : <span />}
      <span
        className="text-[9px] uppercase tracking-wider font-medium px-1.5 py-0.5 rounded-full"
        style={{ color: TYPE_COLORS[entry.type], backgroundColor: `${TYPE_COLORS[entry.type]}15` }}
      >
        {TYPE_LABELS[entry.type]}
      </span>
    </div>
  </div>
);

const VoiceStream: React.FC<{ entries: VoiceEntry[] }> = ({ entries }) => {
  if (entries.length === 0) return null;

  const header = (
    <div className="text-center mb-6">
      <span className="text-indigo-400 font-mono text-xs tracking-[0.3em] uppercase">Las Voces</span>
      <h3 className="text-2xl font-bold text-white mt-2">El Río de Voces</h3>
      <p className="text-slate-400 text-sm mt-1 max-w-md mx-auto">
        Sin filtro. Sin edición. La voluntad colectiva en movimiento.
      </p>
    </div>
  );

  // Static layout for few entries
  if (entries.length < 5) {
    return (
      <div className="mb-16">
        {header}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-4xl mx-auto">
          {entries.map((e, i) => (
            <motion.div
              key={`${e.id}-${e.type}`}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <VoiceChip entry={e} />
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // Marquee layout — triple entries to ensure smooth looping
  const mid = Math.ceil(entries.length / 2);
  const row1 = entries.slice(0, mid);
  const row2 = entries.slice(mid);
  const tripled1 = [...row1, ...row1, ...row1];
  const tripled2 = [...row2, ...row2, ...row2];

  return (
    <div className="mb-16">
      {header}
      <div className="space-y-3 overflow-hidden">
        {/* Row 1 — scrolls left */}
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#0f1116] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#0f1116] to-transparent z-10 pointer-events-none" />
          <motion.div
            className="flex gap-3 w-max"
            animate={{ x: ['0%', '-33.33%'] }}
            transition={{ duration: row1.length * 10, repeat: Infinity, ease: 'linear' }}
          >
            {tripled1.map((e, i) => <VoiceChip key={`r1-${i}`} entry={e} />)}
          </motion.div>
        </div>

        {/* Row 2 — scrolls right */}
        {row2.length > 1 && (
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#0f1116] to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#0f1116] to-transparent z-10 pointer-events-none" />
            <motion.div
              className="flex gap-3 w-max"
              animate={{ x: ['-33.33%', '0%'] }}
              transition={{ duration: row2.length * 10, repeat: Infinity, ease: 'linear' }}
            >
              {tripled2.map((e, i) => <VoiceChip key={`r2-${i}`} entry={e} />)}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── 4. La Línea Roja ───

const LaLineaRoja: React.FC<{ data: RedLinesSectionData }> = ({ data }) => {
  if (data.totalBastaCount === 0 && data.keywords.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="mb-16"
    >
      <div className="relative rounded-2xl bg-red-950/10 border border-red-500/15 p-8 md:p-10 overflow-hidden">
        {/* Top red glow line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-red-500 to-transparent" />

        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Left: count */}
          <div className="text-center md:text-left flex-shrink-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/30 border border-red-500/20 mb-3">
              <Flame className="w-3.5 h-3.5 text-red-400" />
              <span className="text-xs font-mono uppercase tracking-wider text-red-400">
                Líneas Rojas
              </span>
            </div>
            <p className="text-5xl font-bold text-red-400">
              <AnimatedCounter value={data.totalBastaCount} className="text-red-400" />
            </p>
            <p className="text-sm text-red-300/50 mt-1">declaraciones de ¡BASTA!</p>
          </div>

          {/* Right: keywords + quote */}
          <div className="flex-1 min-w-0">
            {data.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {data.keywords.slice(0, 5).map((kw, i) => (
                  <motion.span
                    key={kw.word}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="px-3 py-1.5 rounded-full bg-red-950/40 border border-red-500/20 text-red-300 font-bold text-xs uppercase tracking-wider"
                  >
                    {kw.word}
                  </motion.span>
                ))}
              </div>
            )}

            {data.rawDeclarations.length > 0 && (
              <p className="text-base font-serif italic text-red-200/60 leading-relaxed">
                &ldquo;{data.rawDeclarations[0].text}&rdquo;
                {data.rawDeclarations[0].location && (
                  <span className="text-xs text-slate-500 not-italic ml-2">
                    — {data.rawDeclarations[0].location}
                  </span>
                )}
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ─── 5. Territories Strip — El Territorio Habla ───

const TerritoriesStrip: React.FC<{ territories: TerritoryCardData[] }> = ({ territories }) => {
  if (territories.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <div className="text-center mb-6">
        <span className="text-emerald-400 font-mono text-xs tracking-[0.3em] uppercase">
          Geografía
        </span>
        <h3 className="text-2xl font-bold text-white mt-2">El Territorio Habla</h3>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {territories.map((t, i) => (
          <motion.div
            key={t.location}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className="rounded-xl bg-white/5 border border-white/10 px-4 py-3 hover:bg-white/[0.08] transition-colors min-w-[180px]"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
              <span className="text-sm font-medium text-white">{t.location}</span>
              <span className="text-xs font-mono text-slate-500 ml-auto">{t.totalCount}</span>
            </div>
            <div className="flex gap-px h-1.5 rounded-full overflow-hidden">
              {DREAM_TYPES.map(dt => {
                const pct = t.totalCount > 0 ? (t.typeCounts[dt] / t.totalCount) * 100 : 0;
                return pct > 0 ? (
                  <div
                    key={dt}
                    className="h-full"
                    style={{ backgroundColor: TYPE_COLORS[dt], width: `${pct}%` }}
                  />
                ) : null;
              })}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// ─── Main Component ───

const MapPulseAnalytics: React.FC = () => {
  const {
    mandato,
    voces,
    redLines,
    termometro,
    momentum,
    totalContributions,
    isLoading,
  } = useTerritoryPulse();

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 rounded-2xl bg-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  if (totalContributions === 0) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
        <p className="text-white text-lg font-semibold">El territorio todavía no tiene voz suficiente.</p>
        <p className="text-slate-400 mt-2">
          Cuando aparezcan contribuciones, acá vas a ver el mandato colectivo.
        </p>
      </div>
    );
  }

  return (
    <div>
      <ElLatido
        totalVoices={totalContributions}
        topArticle={mandato.articles[0] || null}
        momentum={momentum}
      />

      <ConvergenceBars articles={mandato.articles} />

      {/* Transition message */}
      {termometro.territories.length > 1 && (
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-lg text-slate-300/80 mb-14 max-w-xl mx-auto font-serif italic"
        >
          Desde {termometro.territories.length} territorios, la señal es clara:
          todos apuntamos hacia el mismo horizonte.
        </motion.p>
      )}

      <VoiceStream entries={voces.entries} />
      <LaLineaRoja data={redLines} />
      <TerritoriesStrip territories={termometro.territories} />
    </div>
  );
};

export default MapPulseAnalytics;
