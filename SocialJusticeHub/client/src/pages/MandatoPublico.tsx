import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Users,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  Quote,
  Brain,
  Rocket,
  Share2,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";


// ── Types ──────────────────────────────────────────────────────────────────

interface Priority {
  rank: number;
  theme: string;
  description: string;
  convergencePercent: number;
  voiceCount: number;
  sampleQuotes: string[];
}

interface ResourceCategory {
  category: string;
  count: number;
  description: string;
}

interface Gap {
  theme: string;
  needCount: number;
  resourceCount: number;
  gap: number;
  urgency: "critical" | "high" | "medium";
}

interface SuggestedAction {
  title: string;
  description: string;
  needsAddressed: string;
  resourcesRequired: string;
  estimatedImpact: string;
}

interface Mandate {
  territoryLevel: string;
  territoryName: string;
  voiceCount: number;
  convergenceScore: number;
  diagnosis: { priorities: Priority[] };
  availableResources: {
    categories: ResourceCategory[];
    totalVolunteers: number;
  };
  gaps: { critical: Gap[] };
  suggestedActions: { actions: SuggestedAction[] };
  rawSummary: string;
  status: string;
  generatedAt: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

const LEVEL_LABELS: Record<string, string> = {
  barrio: "Barrio",
  city: "Ciudad",
  province: "Provincia",
  national: "Nacional",
};

const LEVEL_EMOJI: Record<string, string> = {
  national: "\u{1F1E6}\u{1F1F7}",
  province: "\u{1F5FA}\u{FE0F}",
  city: "\u{1F3D9}\u{FE0F}",
  barrio: "\u{1F3D8}\u{FE0F}",
};

const fadeIn = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("es-AR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

// ── Skeleton ───────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="container mx-auto px-4 py-24 space-y-10">
        {/* Header skeleton */}
        <div className="flex justify-between items-center">
          <div className="h-5 w-36 rounded bg-white/10 animate-pulse" />
          <div className="h-5 w-48 rounded bg-white/10 animate-pulse" />
        </div>
        {/* Hero skeleton */}
        <div className="space-y-6 text-center py-16">
          <div className="h-12 w-80 mx-auto rounded bg-white/10 animate-pulse" />
          <div className="h-6 w-64 mx-auto rounded bg-white/10 animate-pulse" />
          <div className="h-24 w-24 mx-auto rounded-full bg-white/10 animate-pulse" />
          <div className="h-4 w-56 mx-auto rounded bg-white/10 animate-pulse" />
        </div>
        {/* Cards skeleton */}
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-48 rounded-2xl bg-white/5 animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────

export default function MandatoPublico() {
  const [, params] = useRoute("/mandato-publico/:level/:name");
  const level = params?.level ?? "";
  const name = params?.name ?? "";
  const [linkCopied, setLinkCopied] = useState(false);

  const {
    data: mandate,
    isLoading,
    isError,
  } = useQuery<Mandate>({
    queryKey: [`/api/mandates/${level}/${name}`],
    enabled: !!level && !!name,
  });

  // ── Share helpers ──
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";
  const topPriority = mandate?.diagnosis?.priorities?.[0];

  function shareOnTwitter() {
    const text = `\u{1F4CA} ${mandate?.voiceCount} ciudadanos de ${mandate?.territoryName} hablan: ${topPriority?.theme} es la prioridad #1 con ${topPriority?.convergencePercent}% de convergencia. Le\u00e9 el mandato completo: ${currentUrl} #MandatoVivo #Argentina`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  function shareOnWhatsApp() {
    const text = `Mandato Ciudadano de ${mandate?.territoryName}: ${mandate?.voiceCount} voces, ${mandate?.convergenceScore?.toFixed(1)}% de convergencia. Mir\u00e1 el documento completo: ${currentUrl}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2500);
    });
  }

  // ── Loading state ──
  if (isLoading) return <Skeleton />;

  // ── Error state ──
  if (isError) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
        <div className="text-center space-y-6">
          <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto" />
          <h2 className="text-2xl font-bold">Error al cargar el mandato</h2>
          <p className="text-white/50">
            No pudimos obtener la información de este territorio. Intentá de nuevo más tarde.
          </p>
          <Link
            href="/el-mapa"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Ir al mapa
          </Link>
        </div>
      </div>
    );
  }

  // ── Empty state ──
  if (!mandate) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
        <div className="text-center space-y-6">
          <Sparkles className="w-12 h-12 text-amber-400 mx-auto" />
          <h2 className="text-2xl font-bold">
            Aún no hay mandato para este territorio
          </h2>
          <p className="text-white/50 max-w-md mx-auto">
            Cuando suficientes voces se expresen, el mandato colectivo se generará automáticamente.
          </p>
          <Link
            href="/el-mapa"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Ir al mapa
          </Link>
        </div>
      </div>
    );
  }

  const maxNeedCount = Math.max(
    ...((mandate.gaps?.critical ?? []).map((g) => g.needCount)),
    1
  );

  // ── Render ──
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-blue-900/30">
      {/* ── 1. Public Header ── */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-lg border-b border-white/5"
      >
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <span className="text-sm font-serif font-bold text-white/70 tracking-wide">
            El Mandato Vivo
          </span>
          <div className="flex items-center gap-2 text-xs text-white/50">
            <span>{LEVEL_EMOJI[mandate.territoryLevel] ?? ""}</span>
            <span>{LEVEL_LABELS[mandate.territoryLevel] ?? mandate.territoryLevel}</span>
            <span className="text-white/20">|</span>
            <span className="text-white/70 font-medium">{mandate.territoryName}</span>
          </div>
        </div>
      </motion.header>

      {/* ── 2. Hero Banner ── */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        custom={0}
        className="relative pt-28 pb-20 overflow-hidden"
      >
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-900/20 rounded-full blur-[120px]" />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/50 font-mono uppercase tracking-widest">
            <span>{LEVEL_EMOJI[mandate.territoryLevel] ?? ""}</span>
            <span>{LEVEL_LABELS[mandate.territoryLevel] ?? mandate.territoryLevel}</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold leading-tight">
            {mandate.territoryName}
          </h1>

          <p className="text-lg md:text-xl font-mono uppercase tracking-[0.3em] text-white/50">
            Mandato Ciudadano
          </p>

          <p className="text-sm text-white/40">
            Basado en {mandate.voiceCount} declaraciones ciudadanas
          </p>

          {/* Convergence score — large circle */}
          <div className="flex justify-center pt-4">
            <div className="w-32 h-32 rounded-full bg-white/5 border-2 border-amber-500/40 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-amber-400">
                {mandate.convergenceScore.toFixed(1)}%
              </span>
              <span className="text-[10px] uppercase tracking-widest text-white/40">
                Convergencia
              </span>
            </div>
          </div>

          <p className="text-xs text-white/30">
            Generado el {formatDate(mandate.generatedAt)}
          </p>
        </div>
      </motion.section>

      <div className="container mx-auto px-4 pb-16 space-y-16">
        {/* ── 3. Opening Statement ── */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          custom={1}
        >
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 md:p-12 space-y-6 max-w-4xl mx-auto">
            <h2 className="text-xl md:text-2xl font-serif font-bold text-white/90">
              A las autoridades de {mandate.territoryName}:
            </h2>
            <p className="text-white/70 leading-relaxed">
              Este documento sintetiza la voluntad expresada por{" "}
              <span className="text-white font-semibold">{mandate.voiceCount} ciudadanos/as</span>{" "}
              que han declarado públicamente sus sueños, necesidades, valores y compromisos para{" "}
              {mandate.territoryName}.
            </p>
            <p className="text-white/70 leading-relaxed">
              No es una encuesta. No es una petición. Es un{" "}
              <span className="text-amber-400 font-semibold">mandato emergente</span> — la
              convergencia verificable de voluntades individuales que forma una dirección colectiva innegable.
            </p>
          </div>
        </motion.section>

        {/* ── 4. Diagnóstico: Las Prioridades del Pueblo ── */}
        {mandate.diagnosis?.priorities?.length > 0 && (
          <motion.section
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            custom={2}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <h2 className="text-2xl md:text-3xl font-serif font-bold">
                Diagnóstico: Las Prioridades del Pueblo
              </h2>
              <p className="text-sm text-white/40">
                Ordenadas por convergencia ciudadana
              </p>
            </div>

            <div className="space-y-4 max-w-4xl mx-auto">
              {mandate.diagnosis.priorities.map((p) => (
                <div
                  key={p.rank}
                  className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 space-y-4"
                >
                  <div className="flex items-start gap-4">
                    <span className="text-3xl font-bold text-amber-400 leading-none min-w-[2ch] text-right font-mono">
                      {p.rank}
                    </span>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between gap-4">
                        <h3 className="text-lg font-semibold">{p.theme}</h3>
                        <div className="flex items-center gap-2 text-xs text-white/50 shrink-0">
                          <Users className="w-3.5 h-3.5" />
                          <span>{p.voiceCount} voces</span>
                        </div>
                      </div>
                      <p className="text-white/70 text-sm">{p.description}</p>
                    </div>
                  </div>

                  {/* Convergence bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-white/50">
                      <span>Convergencia</span>
                      <span className="font-mono">{p.convergencePercent}%</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${p.convergencePercent}%` }}
                        transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400"
                      />
                    </div>
                  </div>

                  {/* Sample quotes */}
                  {p.sampleQuotes?.length > 0 && (
                    <div className="space-y-2 pl-4 border-l-2 border-amber-500/30">
                      {p.sampleQuotes.map((q, qi) => (
                        <div
                          key={qi}
                          className="flex items-start gap-2 text-sm text-white/50 italic"
                        >
                          <Quote className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-400/50" />
                          <span>"{q}"</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* ── 5. Recursos Declarados ── */}
        {mandate.availableResources?.categories?.length > 0 && (
          <motion.section
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            custom={3}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <h2 className="text-2xl md:text-3xl font-serif font-bold">
                Recursos Declarados
              </h2>
              <p className="text-sm text-white/40">
                Lo que el territorio tiene para ofrecer
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
              {mandate.availableResources.categories.map((r) => (
                <div
                  key={r.category}
                  className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{r.category}</h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-400 text-xs font-bold font-mono">
                      {r.count}
                    </span>
                  </div>
                  <p className="text-white/70 text-sm">{r.description}</p>
                </div>
              ))}
            </div>

            {/* Total volunteers highlight */}
            <div className="text-center space-y-2 pt-4">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-teal-500/10 border border-teal-500/20">
                <Users className="w-5 h-5 text-teal-400" />
                <span className="text-2xl font-bold text-teal-400">
                  {mandate.availableResources.totalVolunteers}
                </span>
                <span className="text-sm text-white/50">voluntarios/as disponibles</span>
              </div>
              <p className="text-sm text-white/50 max-w-lg mx-auto">
                Estas personas se pusieron a disposición. Solo falta coordinación.
              </p>
            </div>
          </motion.section>
        )}

        {/* ── 6. Brechas Críticas: Donde Falla el Sistema ── */}
        {mandate.gaps?.critical?.length > 0 && (
          <motion.section
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            custom={4}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <h2 className="text-2xl md:text-3xl font-serif font-bold">
                Brechas Críticas: Donde Falla el Sistema
              </h2>
              <p className="text-sm text-white/40">
                Análisis de necesidades vs. recursos disponibles
              </p>
            </div>

            <div className="space-y-4 max-w-4xl mx-auto">
              {mandate.gaps.critical.map((g, gi) => (
                <div
                  key={gi}
                  className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">{g.theme}</h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        g.urgency === "critical"
                          ? "bg-rose-500/20 text-rose-400"
                          : g.urgency === "high"
                            ? "bg-amber-500/20 text-amber-400"
                            : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {g.urgency === "critical"
                        ? "Cr\u00edtico"
                        : g.urgency === "high"
                          ? "Alto"
                          : "Medio"}
                    </span>
                  </div>

                  {/* Need vs resource bars */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-white/50 w-20 shrink-0">
                        Necesidad
                      </span>
                      <div className="flex-1 h-3 rounded-full bg-white/10 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(g.needCount / maxNeedCount) * 100}%` }}
                          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                          className="h-full rounded-full bg-gradient-to-r from-rose-600 to-rose-400"
                        />
                      </div>
                      <span className="text-sm font-bold text-rose-400 w-10 text-right font-mono">
                        {g.needCount}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-white/50 w-20 shrink-0">
                        Recursos
                      </span>
                      <div className="flex-1 h-3 rounded-full bg-white/10 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(g.resourceCount / maxNeedCount) * 100}%` }}
                          transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                          className="h-full rounded-full bg-gradient-to-r from-teal-600 to-teal-400"
                        />
                      </div>
                      <span className="text-sm font-bold text-teal-400 w-10 text-right font-mono">
                        {g.resourceCount}
                      </span>
                    </div>
                  </div>

                  <div className="text-sm text-white/50">
                    Brecha:{" "}
                    <span className="text-rose-400 font-bold font-mono">{g.gap}</span>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-sm text-white/40 text-center max-w-2xl mx-auto italic">
              Estas brechas representan donde el Estado falla y la ciudadanía demanda acción.
            </p>
          </motion.section>
        )}

        {/* ── 7. Plan de Acción Sugerido ── */}
        {mandate.suggestedActions?.actions?.length > 0 && (
          <motion.section
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            custom={5}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <h2 className="text-2xl md:text-3xl font-serif font-bold">
                Plan de Acción Sugerido
              </h2>
              <p className="text-sm text-white/40">
                Acciones concretas que conectan necesidades con recursos
              </p>
            </div>

            <div className="space-y-4 max-w-4xl mx-auto">
              {mandate.suggestedActions.actions.map((a, ai) => (
                <div
                  key={ai}
                  className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 space-y-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-sm font-bold text-emerald-400 font-mono">
                        {ai + 1}
                      </span>
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start gap-2">
                        <Rocket className="w-4 h-4 text-emerald-400 mt-1 shrink-0" />
                        <h3 className="font-semibold text-lg">{a.title}</h3>
                      </div>
                      <p className="text-white/70 text-sm">{a.description}</p>
                      <div className="grid sm:grid-cols-3 gap-3 text-sm">
                        <div className="bg-white/5 rounded-xl p-3">
                          <span className="text-white/40 text-xs block mb-1">
                            Necesidades atendidas
                          </span>
                          <span className="text-white/80">{a.needsAddressed}</span>
                        </div>
                        <div className="bg-white/5 rounded-xl p-3">
                          <span className="text-white/40 text-xs block mb-1">
                            Recursos requeridos
                          </span>
                          <span className="text-white/80">{a.resourcesRequired}</span>
                        </div>
                        <div className="bg-white/5 rounded-xl p-3">
                          <span className="text-white/40 text-xs block mb-1">
                            Impacto estimado
                          </span>
                          <span className="text-emerald-400 font-medium">
                            {a.estimatedImpact}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* ── 8. Síntesis Ejecutiva (AI Summary) ── */}
        {mandate.rawSummary && (
          <motion.section
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            custom={6}
          >
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 md:p-12 max-w-4xl mx-auto space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-purple-400" />
                </div>
                <h2 className="text-xl md:text-2xl font-serif font-bold">
                  Síntesis Ejecutiva
                </h2>
              </div>
              <p className="text-white/70 leading-relaxed whitespace-pre-wrap">
                {mandate.rawSummary}
              </p>
            </div>
          </motion.section>
        )}

        {/* ── 9. Call to Action Footer ── */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          custom={7}
        >
          <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 backdrop-blur-md border border-white/10 rounded-2xl p-8 md:p-12 max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-3">
              <TrendingUp className="w-8 h-8 text-blue-400 mx-auto" />
              <h2 className="text-xl md:text-2xl font-serif font-bold">
                Este mandato se actualiza en tiempo real
              </h2>
              <p className="text-white/50 max-w-lg mx-auto">
                Cada nueva voz lo fortalece. Cada declaración lo hace más representativo.
                Cada persona que participa consolida la dirección colectiva.
              </p>
            </div>

            <Link
              href="/el-mapa"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg transition-colors"
            >
              Sumá tu voz
              <ExternalLink className="w-5 h-5" />
            </Link>

            {/* Share buttons */}
            <div className="space-y-3 pt-4">
              <div className="flex items-center justify-center gap-2 text-sm text-white/40">
                <Share2 className="w-4 h-4" />
                <span>Compartí este mandato</span>
              </div>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={shareOnTwitter}
                  className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-all text-sm font-medium"
                >
                  Twitter / X
                </button>
                <button
                  onClick={shareOnWhatsApp}
                  className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-all text-sm font-medium"
                >
                  WhatsApp
                </button>
                <button
                  onClick={copyLink}
                  className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-all text-sm font-medium inline-flex items-center gap-2"
                >
                  {linkCopied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copiar link</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <p className="text-xs text-white/30">
              Última actualización: {formatDate(mandate.generatedAt)}
            </p>
          </div>
        </motion.section>
      </div>

      {/* ── 10. Minimal Footer ── */}
      <footer className="border-t border-white/5 py-8">
        <div className="container mx-auto px-4 text-center space-y-2">
          <p className="text-sm text-white/40">
            El Instante del Hombre Gris — Plataforma de Soberanía Ciudadana
          </p>
          <p className="text-xs text-white/20">
            © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
