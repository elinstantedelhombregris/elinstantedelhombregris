import React from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, ResponsiveContainer,
} from 'recharts';
import {
  RefreshCw, Heart, Zap, GraduationCap, Scale,
  Briefcase, HeartPulse, Users, Sunrise,
  MapPin, TrendingUp, TrendingDown, Flame, Quote,
} from 'lucide-react';
import {
  useTerritoryPulse,
  TYPE_COLORS,
  TYPE_LABELS,
  type DreamType,
  type MandatoArticle,
  type VoiceEntry,
  type BastaKeyword,
  type TerritoryCard as TerritoryCardData,
  type MomentumData,
  type RedLinesSection as RedLinesSectionData,
} from '@/hooks/useTerritoryPulse';

// ─── Constants ───

const DREAM_TYPES: DreamType[] = ['dream', 'value', 'need', 'basta'];

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  RefreshCw, Heart, Zap, GraduationCap, Scale,
  Briefcase, HeartPulse, Users, Sunrise,
};

// ─── Shared sub-components ───

const SectionHeader: React.FC<{
  tag: string;
  title: string;
  subtitle: string;
  tagColor?: string;
}> = ({ tag, title, subtitle, tagColor = 'text-blue-500' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6 }}
    className="text-center mb-10"
  >
    <span className={`${tagColor} font-mono text-xs tracking-[0.3em] uppercase`}>{tag}</span>
    <h3 className="text-3xl md:text-4xl font-bold text-white mt-3 mb-4">{title}</h3>
    <p className="text-slate-400 max-w-2xl mx-auto">{subtitle}</p>
  </motion.div>
);

const EmptyState: React.FC<{ message?: string }> = ({ message }) => (
  <div className="text-center py-8 text-slate-500 text-sm">
    {message || 'Se necesitan más contribuciones para revelar este patrón.'}
  </div>
);

// ─── Section 1: El Mandato ───

const PenetrationBar: React.FC<{ type: DreamType; percent: number }> = ({ type, percent }) => (
  <div className="flex items-center gap-2">
    <span className="w-24 text-xs text-slate-400 text-right truncate">{TYPE_LABELS[type]}</span>
    <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: TYPE_COLORS[type] }}
        initial={{ width: 0 }}
        whileInView={{ width: `${percent}%` }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </div>
    <span className="w-10 text-xs font-mono text-slate-300 text-right">{percent}%</span>
  </div>
);

const MandatoCard: React.FC<{ article: MandatoArticle; index: number }> = ({ article, index }) => {
  const IconComp = ICON_MAP[article.icon];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.12 }}
      className="relative rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden p-6"
    >
      {/* Watermark rank */}
      <span className="absolute top-3 right-4 text-6xl font-serif font-bold text-white/[0.04] select-none">
        #{article.rank}
      </span>

      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        {IconComp && (
          <div className="p-2 rounded-xl bg-purple-500/10">
            <IconComp className="w-5 h-5 text-purple-400" />
          </div>
        )}
        <div>
          <p className="text-lg font-bold text-white">{article.label}</p>
          <p className="text-xs text-slate-500 font-mono">Señal combinada: {article.combinedSignal}</p>
        </div>
      </div>

      {/* Penetration bars */}
      <div className="space-y-2 mb-5">
        {DREAM_TYPES.map((t) => (
          <PenetrationBar key={t} type={t} percent={article.penetration[t]} />
        ))}
      </div>

      {/* Quotes */}
      {Object.keys(article.quotes).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-4 border-t border-white/5">
          {DREAM_TYPES.filter((t) => article.quotes[t]).map((t) => (
            <div
              key={t}
              className="rounded-lg bg-black/30 px-3 py-2 text-xs text-slate-300 border-l-2"
              style={{ borderLeftColor: TYPE_COLORS[t] }}
            >
              <span className="block text-[10px] uppercase tracking-wider mb-0.5" style={{ color: TYPE_COLORS[t] }}>
                {TYPE_LABELS[t]}
              </span>
              "{article.quotes[t]}"
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

const MandatoSectionComponent: React.FC<{ articles: MandatoArticle[] }> = ({ articles }) => {
  if (articles.length === 0) return <EmptyState />;

  return (
    <section>
      <SectionHeader
        tag="Artículo I"
        title="El Mandato"
        subtitle="Las prioridades que el pueblo ya definió — articuladas en sus propias palabras, medidas en su propia frecuencia."
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {articles.map((a, i) => (
          <MandatoCard key={a.theme} article={a} index={i} />
        ))}
      </div>
    </section>
  );
};

// ─── Section 2: En Sus Propias Palabras ───

const VoiceCard: React.FC<{ entry: VoiceEntry; index: number }> = ({ entry, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, delay: index * 0.06 }}
    className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4 border-l-4"
    style={{ borderLeftColor: TYPE_COLORS[entry.type] }}
  >
    <p className="text-sm text-slate-300 italic leading-relaxed">"{entry.text}"</p>
    <div className="mt-3 flex items-center justify-between">
      {entry.location ? (
        <span className="text-xs text-slate-500 flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {entry.location}
        </span>
      ) : <span />}
      <span
        className="text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-full"
        style={{ color: TYPE_COLORS[entry.type], backgroundColor: `${TYPE_COLORS[entry.type]}15` }}
      >
        {TYPE_LABELS[entry.type]}
      </span>
    </div>
  </motion.div>
);

const VocesSectionComponent: React.FC<{ entries: VoiceEntry[] }> = ({ entries }) => {
  if (entries.length === 0) return <EmptyState />;

  return (
    <section>
      <SectionHeader
        tag="Las Voces"
        title="En Sus Propias Palabras"
        subtitle="Las voces reales que componen el mandato colectivo. Sin filtro, sin edición."
        tagColor="text-indigo-400"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {entries.map((e, i) => (
          <VoiceCard key={`${e.id}-${e.type}`} entry={e} index={i} />
        ))}
      </div>
    </section>
  );
};

// ─── Section 3: Lo que Ya No Se Tolera ───

const BastaKeywordCard: React.FC<{ keyword: BastaKeyword; index: number }> = ({ keyword, index }) => (
  <motion.div
    initial={{ opacity: 0, x: -16 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, delay: index * 0.08 }}
    className="rounded-xl bg-slate-900/90 border border-red-500/20 border-l-4 border-l-red-500 p-4"
  >
    <div className="flex items-center justify-between mb-2">
      <span className="text-base font-bold text-red-400 uppercase tracking-wider">
        {keyword.word}
      </span>
      <span className="text-xs font-mono text-red-400/70">{keyword.count}x</span>
    </div>
    <div className="space-y-1.5">
      {keyword.declarations.map((d, i) => (
        <p key={i} className="text-xs text-slate-400 leading-relaxed">"{d}"</p>
      ))}
    </div>
  </motion.div>
);

const RedLinesSectionComponent: React.FC<{ data: RedLinesSectionData }> = ({ data }) => {
  if (data.totalBastaCount === 0 && data.keywords.length === 0) {
    return <EmptyState message="Todavía no hay declaraciones de ¡BASTA!" />;
  }

  return (
    <section>
      <SectionHeader
        tag="Líneas Rojas"
        title="Lo que Ya No Se Tolera"
        subtitle="Las líneas rojas que el territorio marcó con fuego. Las demandas innegociables."
        tagColor="text-red-500"
      />

      {data.totalBastaCount > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex justify-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-950/30 border border-red-500/20">
            <Flame className="w-4 h-4 text-red-400" />
            <span className="text-sm font-semibold text-red-300">
              {data.totalBastaCount} declaraciones de ¡BASTA!
            </span>
          </div>
        </motion.div>
      )}

      {/* Keyword cards */}
      {data.keywords.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {data.keywords.map((kw, i) => (
            <BastaKeywordCard key={kw.word} keyword={kw} index={i} />
          ))}
        </div>
      )}

      {/* Raw declarations as blockquotes */}
      {data.rawDeclarations.length > 0 && (
        <div className="space-y-4 max-w-3xl mx-auto">
          {data.rawDeclarations.map((d, i) => (
            <motion.blockquote
              key={i}
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative rounded-2xl bg-red-950/10 border border-red-500/10 p-6 md:p-8 text-center"
            >
              <Quote className="w-6 h-6 text-red-500/30 absolute top-4 left-4" />
              <p className="text-lg md:text-xl font-serif italic text-red-200/80 leading-relaxed">
                "{d.text}"
              </p>
              {d.location && (
                <span className="block mt-3 text-xs text-slate-500">— {d.location}</span>
              )}
            </motion.blockquote>
          ))}
        </div>
      )}
    </section>
  );
};

// ─── Section 4: El Termómetro del Territorio ───

const TerritoryCardComponent: React.FC<{ card: TerritoryCardData; index: number }> = ({ card, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, delay: index * 0.08 }}
    className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-5"
  >
    <div className="flex items-center gap-2 mb-2">
      <MapPin className="w-4 h-4 text-blue-400" />
      <span className="text-base font-bold text-white">{card.location}</span>
    </div>
    <p className="text-sm text-slate-400 italic mb-4">{card.headline}</p>

    {/* Type breakdown bars */}
    <div className="space-y-1.5">
      {DREAM_TYPES.map((t) => {
        const pct = card.totalCount > 0 ? (card.typeCounts[t] / card.totalCount) * 100 : 0;
        return (
          <div key={t} className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: TYPE_COLORS[t] }}
            />
            <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ backgroundColor: TYPE_COLORS[t], width: `${pct}%` }}
              />
            </div>
            <span className="text-[11px] text-slate-500 w-6 text-right font-mono">{card.typeCounts[t]}</span>
          </div>
        );
      })}
    </div>

    <div className="mt-3 pt-3 border-t border-white/5 text-xs text-slate-500 font-mono text-right">
      {card.totalCount} contribuciones
    </div>
  </motion.div>
);

const TermometroSectionComponent: React.FC<{ territories: TerritoryCardData[] }> = ({ territories }) => {
  if (territories.length === 0) return <EmptyState message="Sin datos geográficos suficientes." />;

  return (
    <section>
      <SectionHeader
        tag="Geografía"
        title="El Termómetro del Territorio"
        subtitle="Cada región tiene su propia voz. Lo que pide Buenos Aires no es lo mismo que grita Córdoba."
        tagColor="text-emerald-400"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {territories.map((t, i) => (
          <TerritoryCardComponent key={t.location} card={t} index={i} />
        ))}
      </div>
    </section>
  );
};

// ─── Section 5: El Momentum ───

const MomentumSectionComponent: React.FC<{ data: MomentumData }> = ({ data }) => {
  const ArrowIcon = data.isGrowing ? TrendingUp : TrendingDown;
  const changeColor = data.isGrowing ? 'text-emerald-400' : 'text-red-400';

  return (
    <section>
      <SectionHeader
        tag="Velocidad"
        title="El Momentum"
        subtitle="Esto no es una foto. Es un pulso vivo que crece con cada voz que se suma."
        tagColor="text-amber-400"
      />

      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 md:p-8"
        >
          {/* Week comparison */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Esta semana</p>
              <p className="text-3xl font-bold text-white">{data.thisWeek}</p>
            </div>
            <div className="text-center flex flex-col items-center justify-center">
              <ArrowIcon className={`w-6 h-6 ${changeColor} mb-1`} />
              <p className={`text-sm font-bold ${changeColor}`}>
                {data.changePercent > 0 ? '+' : ''}{data.changePercent}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Semana anterior</p>
              <p className="text-3xl font-bold text-white/60">{data.lastWeek}</p>
            </div>
          </div>

          {/* Sparkline */}
          {data.dailyTotals.length > 0 && (
            <div className="h-20 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data.dailyTotals}
                  margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                >
                  <defs>
                    <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#sparkGrad)"
                    isAnimationActive={true}
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Closing message */}
          <p className="text-center text-base text-slate-300">
            <span className="font-bold text-white">{data.totalAllTime}</span> voces han hablado.{' '}
            {data.isGrowing
              ? 'Cada día son más.'
              : 'El mandato sigue en pie.'}
          </p>
        </motion.div>
      </div>
    </section>
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
        {[1, 2, 3].map((i) => (
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
    <div className="space-y-24">
      <MandatoSectionComponent articles={mandato.articles} />
      <VocesSectionComponent entries={voces.entries} />
      <RedLinesSectionComponent data={redLines} />
      <TermometroSectionComponent territories={termometro.territories} />
      <MomentumSectionComponent data={momentum} />
    </div>
  );
};

export default MapPulseAnalytics;
