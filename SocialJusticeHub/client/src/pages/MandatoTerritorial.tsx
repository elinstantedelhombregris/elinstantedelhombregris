import { useContext } from "react";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Users,
  TrendingUp,
  Wrench,
  AlertTriangle,
  Brain,
  Rocket,
  Sparkles,
  Quote,
  ShieldCheck,
  Zap,
} from "lucide-react";
import Footer from "@/components/Footer";
import MandateCascade from "@/components/MandateCascade";
import { apiRequest } from "@/lib/queryClient";
import { UserContext } from "@/App";

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
  id: number;
  territoryLevel: string;
  territoryName: string;
  version: number;
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

interface Suggestion {
  id: number;
  territoryName: string;
  needCategory: string;
  needCount: number;
  resourceCount: number;
  suggestedAction: string;
  precedent: string;
  status: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

const LEVEL_LABELS: Record<string, string> = {
  barrio: "Barrio",
  city: "Ciudad",
  province: "Provincia",
  national: "Nacional",
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
        {/* Title skeleton */}
        <div className="space-y-4">
          <div className="h-4 w-32 rounded bg-white/10 animate-pulse" />
          <div className="h-10 w-72 rounded bg-white/10 animate-pulse" />
          <div className="h-4 w-48 rounded bg-white/10 animate-pulse" />
        </div>
        {/* Stats skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-2xl bg-white/5 animate-pulse"
            />
          ))}
        </div>
        {/* Cards skeleton */}
        {Array.from({ length: 3 }).map((_, i) => (
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

export default function MandatoTerritorial() {
  const [, params] = useRoute("/mandato/:level/:name");
  const level = params?.level ?? "";
  const name = params?.name ?? "";

  const userContext = useContext(UserContext);
  const isLoggedIn = !!userContext?.isLoggedIn;
  const qc = useQueryClient();

  // Fetch mandate
  const {
    data: mandate,
    isLoading,
    isError,
  } = useQuery<Mandate>({
    queryKey: [`/api/mandates/${level}/${name}`],
    enabled: !!level && !!name,
  });

  // Fetch suggestions
  const { data: suggestions } = useQuery<Suggestion[]>({
    queryKey: [`/api/suggestions/${name}`],
    enabled: !!name,
  });

  // Activate suggestion mutation
  const activateMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/suggestions/${id}/activate`);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [`/api/suggestions/${name}`] });
    },
  });

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
            <ArrowLeft className="w-4 h-4" />
            Volver al mapa
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
            <ArrowLeft className="w-4 h-4" />
            Volver al mapa
          </Link>
        </div>
      </div>
    );
  }

  const maxNeedCount = Math.max(
    ...((mandate.gaps?.critical ?? []).map((g) => g.needCount)),
    1
  );

  const maxResourceCategoryCount = Math.max(
    ...((mandate.availableResources?.categories ?? []).map((c) => c.count)),
    1
  );

  // ── Render ──
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-blue-900/30">
      <div className="container mx-auto px-4 pt-24 pb-16 space-y-16">
        {/* ── 1. Header ── */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          custom={0}
        >
          <Link
            href="/el-mapa"
            className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al mapa
          </Link>

          <div className="flex flex-wrap items-center gap-4 mb-3">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold">
              {mandate.territoryName}
            </h1>
            <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-mono uppercase tracking-widest">
              {LEVEL_LABELS[mandate.territoryLevel] ?? mandate.territoryLevel}
            </span>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-white/50">
            <span>Versión {mandate.version}</span>
            <span>·</span>
            <span>Generado {formatDate(mandate.generatedAt)}</span>
            <span>·</span>
            <span>{mandate.voiceCount} voces</span>
            {mandate.status && (
              <>
                <span>·</span>
                <span className="capitalize">{mandate.status}</span>
              </>
            )}
          </div>
        </motion.section>

        {/* ── 2. Hero Stats Row ── */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          custom={1}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            {
              label: "Voces",
              value: mandate.voiceCount,
              Icon: Users,
              color: "text-blue-400",
              bg: "bg-blue-500/10",
            },
            {
              label: "Convergencia",
              value: `${mandate.convergenceScore.toFixed(1)}%`,
              Icon: TrendingUp,
              color: "text-amber-400",
              bg: "bg-amber-500/10",
            },
            {
              label: "Recursos",
              value: mandate.availableResources?.totalVolunteers ?? 0,
              Icon: Wrench,
              color: "text-teal-400",
              bg: "bg-teal-500/10",
            },
            {
              label: "Brechas",
              value: mandate.gaps?.critical?.length ?? 0,
              Icon: AlertTriangle,
              color: "text-rose-400",
              bg: "bg-rose-500/10",
            },
          ].map(({ label, value, Icon, color, bg }) => (
            <div
              key={label}
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center gap-2"
            >
              <div
                className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}
              >
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <span className="text-2xl font-bold">{value}</span>
              <span className="text-xs text-white/50 uppercase tracking-wider">
                {label}
              </span>
            </div>
          ))}
        </motion.section>

        {/* ── 3. AI Summary ── */}
        {mandate.rawSummary && (
          <motion.section
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            custom={2}
          >
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-purple-400" />
                </div>
                <h2 className="text-xl font-bold">Síntesis del Mandato</h2>
              </div>
              <p className="text-white/70 leading-relaxed whitespace-pre-wrap">
                {mandate.rawSummary}
              </p>
            </div>
          </motion.section>
        )}

        {/* ── 4. Diagnóstico — Prioridades ── */}
        {mandate.diagnosis?.priorities?.length > 0 && (
          <motion.section
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            custom={3}
            className="space-y-6"
          >
            <h2 className="text-2xl font-serif font-bold">
              Diagnóstico — Prioridades
            </h2>
            <div className="space-y-4">
              {mandate.diagnosis.priorities.map((p) => (
                <div
                  key={p.rank}
                  className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 space-y-4"
                >
                  <div className="flex items-start gap-4">
                    <span className="text-3xl font-bold text-amber-400 leading-none min-w-[2ch] text-right">
                      {p.rank}
                    </span>
                    <div className="flex-1 space-y-2">
                      <h3 className="text-lg font-semibold">{p.theme}</h3>
                      <p className="text-white/70 text-sm">{p.description}</p>
                    </div>
                  </div>

                  {/* Convergence bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-white/50">
                      <span>Convergencia</span>
                      <span>{p.convergencePercent}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-700"
                        style={{ width: `${p.convergencePercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-white/50">
                    <Users className="w-3.5 h-3.5" />
                    <span>{p.voiceCount} voces</span>
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
                          <span>{q}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* ── 5. Recursos Disponibles ── */}
        {mandate.availableResources?.categories?.length > 0 && (
          <motion.section
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            custom={4}
            className="space-y-6"
          >
            <h2 className="text-2xl font-serif font-bold">
              Recursos Disponibles
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {mandate.availableResources.categories.map((r) => (
                <div
                  key={r.category}
                  className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{r.category}</h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-400 text-xs font-bold">
                      {r.count}
                    </span>
                  </div>
                  <p className="text-white/70 text-sm">{r.description}</p>
                  <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-teal-500 to-teal-400 transition-all duration-700"
                      style={{
                        width: `${(r.count / maxResourceCategoryCount) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* ── 6. Brechas Críticas ── */}
        {mandate.gaps?.critical?.length > 0 && (
          <motion.section
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            custom={5}
            className="space-y-6"
          >
            <h2 className="text-2xl font-serif font-bold">
              Brechas Críticas
            </h2>
            <div className="space-y-4">
              {mandate.gaps.critical.map((g, gi) => (
                <div
                  key={gi}
                  className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{g.theme}</h3>
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
                        ? "Crítico"
                        : g.urgency === "high"
                          ? "Alto"
                          : "Medio"}
                    </span>
                  </div>

                  {/* Visual comparison bars */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-white/50 w-20 shrink-0">
                        Necesidad
                      </span>
                      <div className="flex-1 h-3 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-rose-600 to-rose-400 transition-all duration-700"
                          style={{
                            width: `${(g.needCount / maxNeedCount) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-bold text-rose-400 w-10 text-right">
                        {g.needCount}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-white/50 w-20 shrink-0">
                        Recursos
                      </span>
                      <div className="flex-1 h-3 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-teal-600 to-teal-400 transition-all duration-700"
                          style={{
                            width: `${(g.resourceCount / maxNeedCount) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-bold text-teal-400 w-10 text-right">
                        {g.resourceCount}
                      </span>
                    </div>
                  </div>

                  <div className="text-sm text-white/50">
                    Brecha:{" "}
                    <span className="text-rose-400 font-bold">{g.gap}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* ── 7. Acciones Sugeridas ── */}
        {mandate.suggestedActions?.actions?.length > 0 && (
          <motion.section
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            custom={6}
            className="space-y-6"
          >
            <h2 className="text-2xl font-serif font-bold">
              Acciones Sugeridas
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {mandate.suggestedActions.actions.map((a, ai) => (
                <div
                  key={ai}
                  className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 space-y-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <Rocket className="w-5 h-5 text-emerald-400" />
                    </div>
                    <h3 className="font-semibold text-lg leading-snug">
                      {a.title}
                    </h3>
                  </div>
                  <p className="text-white/70 text-sm">{a.description}</p>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-white/50">Necesidades atendidas: </span>
                      <span className="text-white/80">{a.needsAddressed}</span>
                    </div>
                    <div>
                      <span className="text-white/50">Recursos requeridos: </span>
                      <span className="text-white/80">
                        {a.resourcesRequired}
                      </span>
                    </div>
                    <div>
                      <span className="text-white/50">Impacto estimado: </span>
                      <span className="text-emerald-400 font-medium">
                        {a.estimatedImpact}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* ── 8. El Casamentero — Iniciativas Sugeridas ── */}
        {suggestions && suggestions.length > 0 && (
          <motion.section
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            custom={7}
            className="space-y-6"
          >
            <div className="flex items-center gap-3">
              <Zap className="w-6 h-6 text-amber-400" />
              <h2 className="text-2xl font-serif font-bold">
                El Casamentero — Iniciativas Sugeridas
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {suggestions.map((s) => (
                <div
                  key={s.id}
                  className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-white/90 font-medium">
                      {s.suggestedAction}
                    </p>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold shrink-0 ${
                        s.status === "activated"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : s.status === "suggested"
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-white/10 text-white/50"
                      }`}
                    >
                      {s.status === "activated"
                        ? "Activada"
                        : s.status === "suggested"
                          ? "Sugerida"
                          : s.status}
                    </span>
                  </div>

                  <div className="flex gap-4 text-xs text-white/50">
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                      {s.needCount} necesidades
                    </span>
                    <span className="flex items-center gap-1">
                      <Wrench className="w-3.5 h-3.5 text-teal-400" />
                      {s.resourceCount} recursos
                    </span>
                  </div>

                  {s.precedent && (
                    <div className="bg-white/5 rounded-xl p-4 text-sm text-white/50 italic border border-white/5">
                      <div className="flex items-start gap-2">
                        <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0 text-blue-400/50" />
                        <span>{s.precedent}</span>
                      </div>
                    </div>
                  )}

                  {isLoggedIn && s.status === "suggested" && (
                    <button
                      onClick={() => activateMutation.mutate(s.id)}
                      disabled={activateMutation.isPending}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <Rocket className="w-4 h-4" />
                      {activateMutation.isPending
                        ? "Activando..."
                        : "Activar Iniciativa"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* ── 9. Mandate Cascade ── */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          custom={8}
        >
          <MandateCascade currentLevel={level as any} currentName={name} />
        </motion.section>
      </div>

      {/* ── 10. Footer ── */}
      <Footer />
    </div>
  );
}
