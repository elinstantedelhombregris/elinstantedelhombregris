import { motion } from "framer-motion";
import { Rocket, BookOpen } from "lucide-react";

interface SimulatedMandateProps {
  territory: string;
  level: "provincial" | "municipal" | "national";
  voiceCount: number;
  convergenceScore: number;
  priorities: Array<{
    rank: number;
    theme: string;
    convergencePercent: number;
    voiceCount: number;
  }>;
  resources: Array<{
    category: string;
    count: number;
  }>;
  gaps: Array<{
    theme: string;
    needCount: number;
    resourceCount: number;
    urgency: "critical" | "high" | "medium";
  }>;
  suggestedActions: Array<{
    title: string;
    description: string;
    estimatedImpact: string;
  }>;
  precedent?: string;
}

const LEVEL_CONFIG: Record<
  SimulatedMandateProps["level"],
  { label: string; emoji: string }
> = {
  provincial: { label: "Provincial", emoji: "🗺️" },
  municipal: { label: "Municipal", emoji: "🏙️" },
  national: { label: "Nacional", emoji: "🇦🇷" },
};

const URGENCY_CONFIG: Record<
  "critical" | "high" | "medium",
  { label: string; classes: string }
> = {
  critical: {
    label: "Crítico",
    classes: "bg-rose-500/15 text-rose-400 border border-rose-500/20",
  },
  high: {
    label: "Alto",
    classes: "bg-amber-500/15 text-amber-400 border border-amber-500/20",
  },
  medium: {
    label: "Medio",
    classes: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20",
  },
};

export default function SimulatedMandate({
  territory,
  level,
  voiceCount,
  convergenceScore,
  priorities,
  resources,
  gaps,
  suggestedActions,
  precedent,
}: SimulatedMandateProps) {
  const levelInfo = LEVEL_CONFIG[level];
  const maxNeedCount = Math.max(...gaps.map((g) => g.needCount), 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden"
    >
      {/* "SIMULACIÓN" badge */}
      <div className="absolute top-4 right-4 z-10">
        <span className="bg-amber-500/15 text-amber-400 border border-amber-500/20 text-[10px] font-mono uppercase tracking-widest px-3 py-1 rounded-full">
          Simulación
        </span>
      </div>

      {/* Amber top accent line */}
      <div className="h-[2px] bg-gradient-to-r from-amber-500/60 via-amber-400/30 to-transparent" />

      <div className="p-6 space-y-6">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-xl font-serif font-bold text-white">
              {territory}
            </h3>
            <span className="inline-flex items-center gap-1 bg-white/10 text-white/70 text-xs px-2.5 py-1 rounded-full border border-white/10">
              {levelInfo.emoji} {levelInfo.label}
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-white/70 text-sm">
              {voiceCount.toLocaleString("es-AR")} voces
            </span>
            <div className="w-11 h-11 rounded-full border-2 border-amber-500 flex items-center justify-center">
              <span className="text-amber-400 font-bold text-xs">
                {convergenceScore}%
              </span>
            </div>
          </div>
        </div>

        {/* Priorities section */}
        <div className="space-y-3">
          <span className="text-xs font-mono uppercase text-amber-500 tracking-wide">
            Prioridades
          </span>
          <div className="space-y-2.5">
            {priorities.map((p, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-amber-400 font-bold text-sm w-5 text-right shrink-0">
                  {p.rank}
                </span>
                <span className="text-white text-sm min-w-[120px] shrink-0">
                  {p.theme}
                </span>
                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-400"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${p.convergencePercent}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 + i * 0.1, ease: "easeOut" }}
                  />
                </div>
                <span className="text-amber-400/70 text-xs font-mono w-10 text-right shrink-0">
                  {p.convergencePercent}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Resources section */}
        <div className="space-y-3">
          <span className="text-xs font-mono uppercase text-teal-500 tracking-wide">
            Recursos Disponibles
          </span>
          <div className="flex flex-wrap gap-2">
            {resources.map((r, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 bg-teal-500/10 text-teal-400 border border-teal-500/20 text-xs px-3 py-1.5 rounded-full"
              >
                {r.category}
                <span className="font-bold">{r.count}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Gaps section */}
        <div className="space-y-3">
          <span className="text-xs font-mono uppercase text-rose-500 tracking-wide">
            Brechas
          </span>
          <div className="space-y-3">
            {gaps.map((g, i) => {
              const urgencyInfo = URGENCY_CONFIG[g.urgency];
              return (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-white text-sm">{g.theme}</span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${urgencyInfo.classes}`}
                    >
                      {urgencyInfo.label}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 space-y-1">
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-rose-600 to-rose-400"
                          initial={{ width: 0 }}
                          whileInView={{
                            width: `${(g.needCount / maxNeedCount) * 100}%`,
                          }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.7, delay: 0.3 + i * 0.1 }}
                        />
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-teal-600 to-teal-400"
                          initial={{ width: 0 }}
                          whileInView={{
                            width: `${(g.resourceCount / maxNeedCount) * 100}%`,
                          }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.7, delay: 0.4 + i * 0.1 }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions section */}
        <div className="space-y-3">
          <span className="text-xs font-mono uppercase text-emerald-500 tracking-wide">
            Acción Sugerida
          </span>
          <div className="space-y-3">
            {suggestedActions.map((a, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-start gap-2">
                  <Rocket className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <div className="space-y-1">
                    <p className="text-white font-semibold text-sm">
                      {a.title}
                    </p>
                    <p className="text-white/70 text-sm">{a.description}</p>
                  </div>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2 ml-6">
                  <p className="text-emerald-400 text-xs">{a.estimatedImpact}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Precedent box */}
        {precedent && (
          <div className="border-l-2 border-amber-500/40 pl-4">
            <div className="flex items-start gap-2">
              <BookOpen className="w-4 h-4 text-amber-500/50 mt-0.5 shrink-0" />
              <div>
                <span className="text-white/50 text-xs font-mono">
                  Precedente real:
                </span>
                <p className="text-white/50 text-sm italic mt-1">{precedent}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
