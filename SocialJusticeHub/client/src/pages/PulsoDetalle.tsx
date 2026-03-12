import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { getQueryFn } from '@/lib/queryClient';
import { useRoute, Link } from 'wouter';
import {
  Activity,
  ChevronLeft,
  Target,
  FileText,
  AlertCircle,
  AlertTriangle,
  Lightbulb,
  BarChart3,
  Users,
  Heart,
  ShieldAlert,
  MessageSquare,
  ArrowUpRight,
  Unplug,
  ChevronRight,
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FormattedText from '@/components/FormattedText';
import TrendIcon from '@/components/TrendIcon';

type Proposal = {
  id: number;
  title: string;
  summary: string;
  targetCategory: string;
  urgency: 'critica' | 'importante' | 'oportunidad';
  status: string;
  weeksActive: number;
  territory: string;
  suggestedActionType: string;
  evidence: { voiceCount: number; convergencePercent: number; territories: string[]; quotes: string[] } | null;
};

type PulseDetail = {
  id: number;
  weekNumber: number;
  year: number;
  weekStartDate: string;
  weekEndDate: string;
  totalNewVoices: number;
  newDreams: number;
  newNeeds: number;
  newBastas: number;
  newValues: number;
  newCommitments: number;
  newResources: number;
  cumulativeVoices: number;
  cumulativeResources: number;
  emergingThemes: Array<{ theme: string; trend: string; count: number; description: string }> | null;
  patterns: Array<{ pattern: string; territories: string[]; description: string; evidence: string[] }> | null;
  unconnectedResources: Array<{ resource: string; category: string; suggestion: string }> | null;
  seedOfWeek: { title: string; description: string; inspiration: string } | null;
  comparisonWithPrevious: { trends: Array<{ theme: string; direction: string; detail: string }>; escalations: string[] } | null;
  fullAnalysis: string | null;
  generatedAt: string;
  proposals: Proposal[];
};

const URGENCY_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  critica: { label: 'Crítica', color: 'text-rose-400', bg: 'bg-rose-500/15 border-rose-500/20', icon: AlertCircle },
  importante: { label: 'Importante', color: 'text-amber-400', bg: 'bg-amber-500/15 border-amber-500/20', icon: AlertTriangle },
  oportunidad: { label: 'Oportunidad', color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/20', icon: Lightbulb },
};

const TARGET_LABELS: Record<string, string> = {
  gobierno_municipal: 'Gobierno Municipal',
  gobierno_provincial: 'Gobierno Provincial',
  gobierno_nacional: 'Gobierno Nacional',
  organizaciones: 'Organizaciones',
  medios: 'Medios',
  sector_privado: 'Sector Privado',
  comunidad: 'Comunidad',
};

const ACTION_LABELS: Record<string, string> = {
  carta: 'Carta',
  peticion: 'Petición',
  iniciativa_comunitaria: 'Iniciativa',
  difusion: 'Difusión',
  nota_periodistica: 'Nota',
  proyecto_ley: 'Proyecto de Ley',
};

export default function PulsoDetalle() {
  const [, params] = useRoute('/mandato/pulso/:id');
  const id = params?.id;

  const { data: res, isLoading } = useQuery<{ data: PulseDetail }>({
    queryKey: [`/api/pulsos/${id}`],
    queryFn: getQueryFn({ on401: 'returnNull' }),
    enabled: !!id,
  });

  const pulse = res?.data;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <Header />
        <main className="pt-24 pb-16">
          <div className="max-w-5xl mx-auto px-4 text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4" />
            <p className="text-slate-400">Cargando pulso...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!pulse) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <Header />
        <main className="pt-24 pb-16">
          <div className="max-w-5xl mx-auto px-4 text-center py-20">
            <Activity className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h2 className="text-white font-serif font-bold text-xl mb-2">Pulso no encontrado</h2>
            <Link href="/el-mandato-vivo" className="text-amber-400 hover:text-amber-300 text-sm">
              ← Volver al Mandato
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">
      <Header />

      <main>
        {/* ═══════ HERO ═══════ */}
        <section className="relative pt-32 pb-16 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-950/20 via-[#0a0a0a] to-[#0a0a0a]" />

          <div className="relative z-10 max-w-5xl mx-auto px-4">
            <Link href="/el-mandato-vivo" className="inline-flex items-center gap-1 text-slate-400 hover:text-amber-400 text-sm mb-8 transition-colors">
              <ChevronLeft className="w-4 h-4" />
              Volver al Mandato
            </Link>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6"
            >
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-amber-500 font-mono text-xs tracking-[0.3em] uppercase">
                Pulso #{pulse.weekNumber} · {pulse.year}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold leading-[0.95] mb-4"
            >
              Pulso Semanal{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500">
                #{pulse.weekNumber}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-slate-400 text-sm font-mono"
            >
              {new Date(pulse.weekStartDate).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })}
              {' — '}
              {new Date(pulse.weekEndDate).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
              {pulse.generatedAt && (
                <> · Generado {new Date(pulse.generatedAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</>
              )}
            </motion.p>
          </div>
        </section>

        {/* ═══════ THERMOMETER ═══════ */}
        <section className="py-20 md:py-28 bg-gradient-to-b from-[#0a0a0a] via-[#0f1116] to-[#0a0a0a]">
          <div className="container mx-auto px-4 max-w-5xl">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-amber-500 font-mono text-xs tracking-[0.3em] uppercase text-center mb-3"
            >
              Termómetro
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-2xl md:text-3xl font-serif font-bold text-center mb-10"
            >
              Lo que se movió esta semana
            </motion.h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Voces nuevas', value: pulse.totalNewVoices, icon: MessageSquare, bg: 'bg-amber-500/10 text-amber-400' },
                { label: 'Sueños', value: pulse.newDreams, icon: Heart, bg: 'bg-blue-500/10 text-blue-400' },
                { label: 'Necesidades', value: pulse.newNeeds, icon: AlertCircle, bg: 'bg-rose-500/10 text-rose-400' },
                { label: '¡Bastas!', value: pulse.newBastas, icon: ShieldAlert, bg: 'bg-red-500/10 text-red-400' },
                { label: 'Valores', value: pulse.newValues, icon: Sparkles, bg: 'bg-teal-500/10 text-teal-400' },
                { label: 'Compromisos', value: pulse.newCommitments, icon: Target, bg: 'bg-emerald-500/10 text-emerald-400' },
                { label: 'Recursos', value: pulse.newResources, icon: Users, bg: 'bg-purple-500/10 text-purple-400' },
                { label: 'Acumulado total', value: pulse.cumulativeVoices + pulse.cumulativeResources, icon: BarChart3, bg: 'bg-white/10 text-white' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-center"
                >
                  <div className={`w-10 h-10 rounded-full ${item.bg} flex items-center justify-center mx-auto mb-3`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <p className="text-2xl font-bold text-white">{item.value.toLocaleString('es-AR')}</p>
                  <p className="text-slate-500 text-xs mt-1 font-mono uppercase tracking-wider">{item.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════ EMERGING THEMES ═══════ */}
        {pulse.emergingThemes && pulse.emergingThemes.length > 0 && (
          <section className="py-20 md:py-28">
            <div className="container mx-auto px-4 max-w-5xl">
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-amber-500 font-mono text-xs tracking-[0.3em] uppercase text-center mb-3"
              >
                Temas
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-2xl md:text-3xl font-serif font-bold text-center mb-10"
              >
                Temas Emergentes
              </motion.h2>

              <div className="space-y-4">
                {pulse.emergingThemes.map((theme, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex items-start gap-4"
                  >
                    <div className="flex-shrink-0 mt-1">
                      <TrendIcon trend={theme.trend} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-white font-serif font-bold">{theme.theme}</h3>
                        <span className="text-amber-400 text-xs font-mono tracking-wider">
                          {theme.count} menciones
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm leading-relaxed">{theme.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ═══════ PATTERNS ═══════ */}
        {pulse.patterns && pulse.patterns.length > 0 && (
          <section className="py-20 md:py-28 bg-gradient-to-b from-[#0a0a0a] via-[#0f1116] to-[#0a0a0a]">
            <div className="container mx-auto px-4 max-w-5xl">
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-amber-500 font-mono text-xs tracking-[0.3em] uppercase text-center mb-3"
              >
                Patrones
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-2xl md:text-3xl font-serif font-bold text-center mb-10"
              >
                Patrones Detectados
              </motion.h2>

              <div className="space-y-4">
                {pulse.patterns.map((pattern, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6"
                  >
                    <h3 className="text-white font-serif font-bold text-lg mb-2">{pattern.pattern}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed mb-3">{pattern.description}</p>
                    {pattern.territories.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {pattern.territories.map((t, j) => (
                          <span key={j} className="text-[10px] text-slate-400 bg-white/5 border border-white/5 px-2 py-0.5 rounded-full font-mono">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                    {pattern.evidence && pattern.evidence.length > 0 && (
                      <div className="mt-3 space-y-2 border-t border-white/5 pt-3">
                        {pattern.evidence.slice(0, 3).map((e, j) => (
                          <p key={j} className="text-slate-500 text-xs italic pl-3 border-l-2 border-amber-500/30">
                            "{e}"
                          </p>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ═══════ PROPOSALS ═══════ */}
        {pulse.proposals && pulse.proposals.length > 0 && (
          <section className="py-20 md:py-28">
            <div className="container mx-auto px-4 max-w-5xl">
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-amber-500 font-mono text-xs tracking-[0.3em] uppercase text-center mb-3"
              >
                Propuestas
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-2xl md:text-3xl font-serif font-bold text-center mb-3"
              >
                Propuestas de este Pulso ({pulse.proposals.length})
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-slate-400 text-sm text-center mb-10 max-w-lg mx-auto"
              >
                Propuestas autoevidentes con plantilla de acción lista para copiar y enviar.
              </motion.p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pulse.proposals.map((proposal, i) => {
                  const urgency = URGENCY_CONFIG[proposal.urgency] || URGENCY_CONFIG.oportunidad;
                  const UrgencyIcon = urgency.icon;
                  return (
                    <Link key={proposal.id} href={`/mandato/propuesta/${proposal.id}`}>
                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                        className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-amber-500/20 hover:shadow-[0_0_24px_rgba(245,158,11,0.08)] transition-all cursor-pointer group"
                      >
                        {/* Top accent line */}
                        <div className={`h-[2px] -mx-6 -mt-6 mb-5 rounded-t-2xl ${
                          proposal.urgency === 'critica' ? 'bg-gradient-to-r from-rose-500/60 via-rose-400/30 to-transparent' :
                          proposal.urgency === 'importante' ? 'bg-gradient-to-r from-amber-500/60 via-amber-400/30 to-transparent' :
                          'bg-gradient-to-r from-emerald-500/60 via-emerald-400/30 to-transparent'
                        }`} />

                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest border ${urgency.bg} ${urgency.color}`}>
                              <UrgencyIcon className="w-3 h-3" />
                              {urgency.label}
                            </span>
                            {proposal.weeksActive >= 3 && (
                              <span className="text-[10px] text-rose-400 font-mono tracking-wider uppercase">
                                {proposal.weeksActive} semanas
                              </span>
                            )}
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-amber-400 transition-colors flex-shrink-0 mt-1" />
                        </div>

                        <h3 className="text-white font-serif font-bold text-lg mb-2 group-hover:text-amber-300 transition-colors">
                          {proposal.title}
                        </h3>
                        <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 mb-4">
                          {proposal.summary}
                        </p>

                        <div className="flex items-center gap-3 flex-wrap text-xs text-slate-500 font-mono">
                          <span className="inline-flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-full">
                            <Target className="w-3 h-3" />
                            {TARGET_LABELS[proposal.targetCategory] || proposal.targetCategory}
                          </span>
                          <span className="inline-flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-full">
                            <FileText className="w-3 h-3" />
                            {ACTION_LABELS[proposal.suggestedActionType] || proposal.suggestedActionType}
                          </span>
                          {proposal.evidence?.voiceCount ? (
                            <span className="inline-flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-full">
                              <Users className="w-3 h-3" />
                              {proposal.evidence.voiceCount} voces
                            </span>
                          ) : null}
                        </div>
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ═══════ UNCONNECTED RESOURCES ═══════ */}
        {pulse.unconnectedResources && pulse.unconnectedResources.length > 0 && (
          <section className="py-20 md:py-28 bg-gradient-to-b from-[#0a0a0a] via-[#0f1116] to-[#0a0a0a]">
            <div className="container mx-auto px-4 max-w-5xl">
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-amber-500 font-mono text-xs tracking-[0.3em] uppercase text-center mb-3"
              >
                Recursos
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-2xl md:text-3xl font-serif font-bold text-center mb-10"
              >
                Recursos sin Conectar
              </motion.h2>

              <div className="space-y-3">
                {pulse.unconnectedResources.map((r, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.06 }}
                    className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex items-start gap-4"
                  >
                    <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                      <Unplug className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-white font-serif font-bold text-sm">{r.resource}</p>
                      <p className="text-slate-400 text-xs mt-1 leading-relaxed">{r.suggestion}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ═══════ COMPARISON WITH PREVIOUS ═══════ */}
        {pulse.comparisonWithPrevious && (
          <section className="py-20 md:py-28">
            <div className="container mx-auto px-4 max-w-5xl">
              {pulse.comparisonWithPrevious.trends && pulse.comparisonWithPrevious.trends.length > 0 && (
                <>
                  <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-amber-500 font-mono text-xs tracking-[0.3em] uppercase text-center mb-3"
                  >
                    Evolución
                  </motion.p>
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-2xl md:text-3xl font-serif font-bold text-center mb-10"
                  >
                    Evolución vs Semana Anterior
                  </motion.h2>

                  <div className="space-y-3 mb-10">
                    {pulse.comparisonWithPrevious.trends.map((t, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: i * 0.06 }}
                        className="flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5"
                      >
                        <TrendIcon trend={t.direction} />
                        <div>
                          <span className="text-white font-serif font-bold">{t.theme}</span>
                          <p className="text-slate-500 text-xs mt-0.5">{t.detail}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}

              {pulse.comparisonWithPrevious.escalations && pulse.comparisonWithPrevious.escalations.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-rose-500/5 border border-rose-500/15 rounded-2xl p-6"
                >
                  <h3 className="text-rose-400 font-serif font-bold text-lg mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Escalamientos
                  </h3>
                  <div className="space-y-2">
                    {pulse.comparisonWithPrevious.escalations.map((e, i) => (
                      <p key={i} className="text-slate-400 text-sm pl-4 border-l-2 border-rose-500/30">{e}</p>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </section>
        )}

        {/* ═══════ SEED ═══════ */}
        {pulse.seedOfWeek && pulse.seedOfWeek.title && (
          <section className="py-20 md:py-28 bg-gradient-to-b from-[#0a0a0a] via-[#0f1116] to-[#0a0a0a]">
            <div className="container mx-auto px-4 max-w-3xl">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-amber-950/40 to-amber-900/10 border border-amber-500/20 rounded-2xl p-8 text-center"
              >
                <Sparkles className="w-8 h-8 text-amber-400 mx-auto mb-4" />
                <p className="text-amber-500 font-mono text-xs tracking-[0.3em] uppercase mb-4">Semilla de la Semana</p>
                <h3 className="text-white font-serif font-bold text-2xl mb-4">{pulse.seedOfWeek.title}</h3>
                <p className="text-slate-300 text-sm leading-relaxed mb-4 max-w-xl mx-auto">{pulse.seedOfWeek.description}</p>
                <p className="text-slate-400 text-sm italic leading-relaxed max-w-xl mx-auto border-t border-white/10 pt-4 mt-4">
                  {pulse.seedOfWeek.inspiration}
                </p>
              </motion.div>
            </div>
          </section>
        )}

        {/* ═══════ FULL ANALYSIS ═══════ */}
        {pulse.fullAnalysis && (
          <section className="py-20 md:py-28">
            <div className="container mx-auto px-4 max-w-4xl">
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-amber-500 font-mono text-xs tracking-[0.3em] uppercase text-center mb-3"
              >
                Análisis
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-2xl md:text-3xl font-serif font-bold text-center mb-10"
              >
                Análisis Narrativo Completo
              </motion.h2>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <FormattedText text={pulse.fullAnalysis} variant="analysis" />
              </motion.div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
