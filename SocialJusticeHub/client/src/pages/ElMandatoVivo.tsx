import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { getQueryFn } from '@/lib/queryClient';
import { Link } from 'wouter';
import {
  Scroll,
  Anchor,
  Users,
  Brain,
  FileText,
  Rocket,
  Wrench,
  MapPin,
  Map,
  Activity,
  BarChart3,
  Zap,
  Target,
  Clock,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PoliticalSimulation from '@/components/PoliticalSimulation';
import MandateCascade from '@/components/MandateCascade';
import ImpactCaseStudy from '@/components/ImpactCaseStudy';
import PowerCTA from '@/components/PowerCTA';
import NextStepCard from '@/components/NextStepCard';
import TrendIcon from '@/components/TrendIcon';
import ProposalCard from '@/components/ProposalCard';

// ─── Types ────────────────────────────────────────────────────────────────────

type PulseStats = {
  totalPulses: number;
  totalProposals: number;
  activeProposals: number;
  completedProposals: number;
  lastPulseDate: string | null;
  lastPulseWeek: number | null;
};

type PulseData = {
  id: number;
  weekNumber: number;
  year: number;
  weekStartDate: string;
  weekEndDate: string;
  totalNewVoices: number;
  newDreams: number;
  newNeeds: number;
  newBastas: number;
  emergingThemes: Array<{ theme: string; trend: string; count: number; description: string }> | null;
  generatedAt: string;
  proposals: Array<{
    id: number;
    title: string;
    summary: string;
    targetCategory: string;
    urgency: 'critica' | 'importante' | 'oportunidad';
    status: string;
    weeksActive: number;
    territory: string;
    suggestedActionType: string;
    evidence: { voiceCount: number; convergencePercent: number } | null;
  }>;
};

type PulseSummary = {
  id: number;
  weekNumber: number;
  year: number;
  totalNewVoices: number;
  generatedAt: string;
  emergingThemes: Array<{ theme: string; trend: string }> | null;
};

// ─── How-it-works cards data ──────────────────────────────────────────────────

const howItWorksCards = [
  {
    icon: Users,
    color: "blue-400",
    bg: "blue-500/10",
    title: "El Pueblo Habla",
    desc: "El mapa recoge sueños, necesidades, valores, gritos de ¡BASTA! y recursos de cada rincón del territorio argentino.",
  },
  {
    icon: Brain,
    color: "purple-400",
    bg: "purple-500/10",
    title: "La Inteligencia Emerge",
    desc: "Algoritmos de convergencia detectan patrones: qué pide cada territorio, qué tiene disponible, qué le falta.",
  },
  {
    icon: FileText,
    color: "amber-400",
    bg: "amber-500/10",
    title: "El Mandato Se Escribe Solo",
    desc: "Cada viernes a las 17:55, el motor de convergencia sintetiza las señales del territorio en un mandato legible. No reemplaza la deliberación: la vuelve posible con verdad operativa.",
  },
  {
    icon: Rocket,
    color: "emerald-400",
    bg: "emerald-500/10",
    title: "La Acción Se Activa",
    desc: "Cada mandato incluye propuestas con plantilla de acción lista para enviar: carta, petición, proyecto de ley.",
  },
];

// ─── Color maps for dynamic Tailwind classes ──────────────────────────────────

const iconColorMap: Record<string, string> = {
  "blue-400": "text-blue-400",
  "purple-400": "text-purple-400",
  "amber-400": "text-amber-400",
  "emerald-400": "text-emerald-400",
};

const bgColorMap: Record<string, string> = {
  "blue-500/10": "bg-blue-500/10",
  "purple-500/10": "bg-purple-500/10",
  "amber-500/10": "bg-amber-500/10",
  "emerald-500/10": "bg-emerald-500/10",
};

// ─── Stat card color map ──────────────────────────────────────────────────────

const statStyles: Record<string, { text: string; bgIcon: string }> = {
  blue: { text: "text-blue-400", bgIcon: "text-blue-500/10" },
  teal: { text: "text-teal-400", bgIcon: "text-teal-500/10" },
  purple: { text: "text-purple-400", bgIcon: "text-purple-500/10" },
  amber: { text: "text-amber-400", bgIcon: "text-amber-500/10" },
  emerald: { text: "text-emerald-400", bgIcon: "text-emerald-500/10" },
  rose: { text: "text-rose-400", bgIcon: "text-rose-500/10" },
};

// ─── Component ────────────────────────────────────────────────────────────────

const ElMandatoVivo = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'El Mandato Vivo - Convergencia ciudadana en tiempo real';
  }, []);

  // Map data
  const { data: dreams = [] } = useQuery<any[]>({ queryKey: ['/api/dreams'] });
  const { data: resources = [] } = useQuery<any[]>({ queryKey: ['/api/resources-map'] });
  const { data: mandates = [] } = useQuery<any[]>({ queryKey: ['/api/mandates'] });

  // Pulse data
  const { data: latestPulse } = useQuery<{ data: PulseData | null }>({
    queryKey: ['/api/pulsos/latest'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
  });
  const { data: pulseStatsRes } = useQuery<{ data: PulseStats }>({
    queryKey: ['/api/pulsos/stats'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
  });
  const { data: historyRes } = useQuery<{ data: PulseSummary[] }>({
    queryKey: ['/api/pulsos'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
  });

  const totalVoices = dreams.length + resources.length;
  const uniqueLocations = new Set(dreams.filter((d: any) => d.location).map((d: any) => d.location)).size;
  const pulse = latestPulse?.data;
  const pulseStats = pulseStatsRes?.data;
  const history = historyRes?.data;

  const stats = [
    { value: dreams.length, label: "Voces en el Mapa", icon: Users, color: "blue" },
    { value: resources.length, label: "Recursos Ofrecidos", icon: Wrench, color: "teal" },
    { value: uniqueLocations, label: "Territorios Activos", icon: MapPin, color: "purple" },
    { value: mandates.length, label: "Mandatos Generados", icon: FileText, color: "amber" },
    { value: pulseStats?.totalProposals || 0, label: "Propuestas Generadas", icon: Target, color: "emerald" },
    { value: pulseStats?.activeProposals || 0, label: "Propuestas Activas", icon: Zap, color: "rose" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 selection:bg-blue-900/30 font-sans">
      <Header />
      <main className="overflow-hidden">

        {/* ━━━ SECTION 1: HERO ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-950/40 via-[#0a0a0a] to-[#0a0a0a]" />
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]" />

          <div className="relative z-10 text-center px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center justify-center gap-2 mb-8"
            >
              <Scroll className="w-4 h-4 text-amber-500 animate-pulse" />
              <span className="text-amber-500 font-mono text-xs tracking-[0.3em] uppercase">
                Probar — Convergencia Ciudadana
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold leading-tight mb-6"
            >
              <span className="text-white">El Mandato</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500">
                Vivo
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto mb-10"
            >
              Las señales del mapa se convierten en iniciativa cívica para la gestión pública. Cuando la convergencia es clara, el mandato se vuelve exigible.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-5 py-2.5 mb-16"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
              </span>
              <span className="text-white/70 text-sm">
                <span className="text-amber-400 font-bold">{totalVoices}</span> voces
                {pulseStats && (
                  <>
                    {' · '}
                    <span className="text-amber-400 font-bold">{pulseStats.totalProposals}</span> propuestas
                    {' · '}
                    <span className="text-amber-400 font-bold">{pulseStats.totalPulses}</span> mandatos semanales
                  </>
                )}
              </span>
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              <Anchor className="w-5 h-5 text-slate-600 mx-auto" />
            </motion.div>
          </div>
        </section>

        {/* ━━━ SECTION 2: HOW IT WORKS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="bg-[#0f1116] border-y border-white/5 py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14">
              <span className="text-amber-500 font-mono text-xs tracking-[0.3em] uppercase">
                El Sistema
              </span>
              <h2 className="text-4xl font-bold text-white mt-3 font-serif">
                Cómo Nace un Mandato
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {howItWorksCards.map((card, index) => {
                const Icon = card.icon;
                return (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.12 }}
                    className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-center"
                  >
                    <div className={`w-14 h-14 rounded-full ${bgColorMap[card.bg]} flex items-center justify-center mx-auto mb-5`}>
                      <Icon className={`w-6 h-6 ${iconColorMap[card.color]}`} />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-3 font-serif">{card.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{card.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ━━━ SECTION 3: LIVE STATS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14">
              <span className="text-amber-500 font-mono text-xs tracking-[0.3em] uppercase">
                Datos Reales
              </span>
              <h2 className="text-4xl font-bold text-white mt-3 font-serif">
                La Base del Mandato — Ahora Mismo
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-6xl mx-auto">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                const style = statStyles[stat.color];
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.08 }}
                    className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 overflow-hidden"
                  >
                    <Icon className={`absolute -bottom-2 -right-2 w-16 h-16 ${style.bgIcon} opacity-30`} />
                    <div className="relative z-10">
                      <span className={`text-3xl font-bold ${style.text}`}>
                        {stat.value}
                      </span>
                      <p className="text-slate-400 text-xs mt-2">{stat.label}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {pulseStats?.lastPulseDate && (
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-slate-500 text-xs text-center mt-8 font-mono flex items-center justify-center gap-1.5"
              >
                <Clock className="w-3 h-3" />
                Último mandato semanal: {new Date(pulseStats.lastPulseDate).toLocaleDateString('es-AR', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </motion.p>
            )}
          </div>
        </section>

        {/* ━━━ SECTION 4: LATEST MANDATE (PULSE) ━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {pulse ? (
          <section className="bg-gradient-to-b from-[#0a0a0a] via-[#0f1116] to-[#0a0a0a] py-20 md:py-28">
            <div className="container mx-auto px-4 max-w-5xl">
              <div className="text-center mb-14">
                <span className="text-amber-500 font-mono text-xs tracking-[0.3em] uppercase">
                  Mandato Semanal #{pulse.weekNumber}
                </span>
                <h2 className="text-4xl font-bold text-white mt-3 font-serif">
                  El Último Mandato
                </h2>
                <p className="text-slate-400 max-w-2xl mx-auto mt-4 text-sm">
                  {new Date(pulse.weekStartDate).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })}
                  {' — '}
                  {new Date(pulse.weekEndDate).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  {' · '}
                  <span className="text-amber-400 font-bold">{pulse.totalNewVoices}</span> voces nuevas procesadas
                </p>
              </div>

              {/* Emerging themes */}
              {pulse.emergingThemes && pulse.emergingThemes.length > 0 && (
                <div className="mb-12">
                  <h3 className="text-sm font-mono text-amber-500 tracking-[0.2em] uppercase text-center mb-6">
                    Temas Emergentes
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {pulse.emergingThemes.slice(0, 3).map((theme, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                        className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <TrendIcon trend={theme.trend} />
                          <h4 className="text-white font-serif font-bold text-sm">{theme.theme}</h4>
                        </div>
                        <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">{theme.description}</p>
                        <p className="text-amber-400 text-xs font-mono mt-2">{theme.count} menciones</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top proposals */}
              {pulse.proposals && pulse.proposals.length > 0 && (
                <div className="mb-10">
                  <h3 className="text-sm font-mono text-amber-500 tracking-[0.2em] uppercase text-center mb-6">
                    Propuestas del Mandato
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {pulse.proposals.slice(0, 4).map((proposal, i) => (
                      <ProposalCard key={proposal.id} proposal={proposal} index={i} />
                    ))}
                  </div>
                </div>
              )}

              {/* Link to full mandate */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <Link
                  href={`/mandato/pulso/${pulse.id}`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-xl text-amber-400 text-sm font-mono uppercase tracking-wider transition-all"
                >
                  Ver mandato completo
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </div>
          </section>
        ) : (
          <section className="bg-gradient-to-b from-[#0a0a0a] via-[#0f1116] to-[#0a0a0a] py-20 md:py-28">
            <div className="container mx-auto px-4 text-center max-w-3xl">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-12"
              >
                <Activity className="w-16 h-16 text-slate-700 mx-auto mb-6" />
                <h3 className="text-white font-serif font-bold text-2xl mb-3">El primer mandato se genera pronto</h3>
                <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
                  El motor de convergencia genera mandatos automáticamente cada viernes a las 17:55.
                  Mientras tanto, seguí cargando sueños, necesidades y recursos en{' '}
                  <Link href="/el-mapa" className="text-amber-400 hover:text-amber-300">El Mapa</Link>.
                </p>
              </motion.div>
            </div>
          </section>
        )}

        {/* ━━━ SECTION 5: POLITICAL SIMULATION ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14">
              <span className="text-amber-500 font-mono text-xs tracking-[0.3em] uppercase">
                Simulación a Escala
              </span>
              <h2 className="text-4xl font-bold text-white mt-3 font-serif">
                Cómo el Sistema Obliga a la Política
              </h2>
              <p className="text-slate-400 max-w-3xl mx-auto mt-4 text-lg">
                Cuando el mandato es claro y la política no responde, el sistema genera automáticamente las herramientas para exigir cumplimiento.
              </p>
            </div>

            <div className="max-w-6xl mx-auto">
              <PoliticalSimulation />
            </div>
          </div>
        </section>

        {/* ━━━ SECTION 6: MANDATE CASCADE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="bg-gradient-to-b from-[#0a0a0a] via-[#0f1116] to-[#0a0a0a] py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14">
              <span className="text-amber-500 font-mono text-xs tracking-[0.3em] uppercase">
                La Cascada
              </span>
              <h2 className="text-4xl font-bold text-white mt-3 font-serif">
                Del Barrio a la Nación
              </h2>
              <p className="text-slate-400 max-w-3xl mx-auto mt-4 text-lg">
                Cada nivel alimenta al siguiente. El mandato no baja: sube. Desde el barrio hasta la nación, la voz del pueblo se amplifica.
              </p>
            </div>

            <div className="max-w-5xl mx-auto">
              <MandateCascade currentLevel="national" currentName="Argentina" />
            </div>

            {mandates.length === 0 && (
              <p className="text-center text-slate-500 text-sm mt-8 font-mono">
                A medida que el mapa crece, los mandatos reales aparecerán aquí.
              </p>
            )}
          </div>
        </section>

        {/* ━━━ SECTION 7: IMPACT CASE STUDIES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
                <Map className="w-3 h-3 text-blue-400" />
                <span className="text-blue-400 font-mono text-[10px] tracking-widest uppercase">
                  Verificado en Territorio
                </span>
              </div>
              <h2 className="text-4xl font-bold text-white font-serif">
                Imaginen qué pasaría si dejamos las cosas en claro
              </h2>
              <p className="text-slate-400 max-w-3xl mx-auto mt-4 text-lg">
                La política ya no tiene excusas; imaginen cuando escenarios como estos sean moneda corriente.
              </p>
            </div>

            <div className="max-w-6xl mx-auto">
              <ImpactCaseStudy />
            </div>
          </div>
        </section>

        {/* ━━━ SECTION 8: MANDATE ARCHIVE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="bg-gradient-to-b from-[#0a0a0a] via-[#0f1116] to-[#0a0a0a] py-20 md:py-28">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center mb-14">
              <span className="text-amber-500 font-mono text-xs tracking-[0.3em] uppercase">
                Archivo
              </span>
              <h2 className="text-4xl font-bold text-white mt-3 font-serif">
                Mandatos Anteriores
              </h2>
              <p className="text-slate-400 max-w-md mx-auto mt-4 text-sm">
                Cada mandato semanal es un registro histórico de la evolución de la voz colectiva.
              </p>
            </div>

            {history && history.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {history.map((p, i) => (
                  <Link key={p.id} href={`/mandato/pulso/${p.id}`}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: i * 0.08 }}
                      className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:border-amber-500/20 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center">
                            <Activity className="w-4 h-4 text-amber-400" />
                          </div>
                          <span className="text-white font-serif font-bold">
                            Mandato #{p.weekNumber}
                          </span>
                        </div>
                        <span className="text-slate-500 text-xs font-mono">
                          {p.generatedAt ? new Date(p.generatedAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                        </span>
                      </div>

                      <p className="text-slate-400 text-sm mb-3">
                        <span className="text-amber-400 font-bold">{p.totalNewVoices}</span> voces procesadas
                      </p>

                      {p.emergingThemes && p.emergingThemes.length > 0 && (
                        <div className="flex gap-1.5 flex-wrap">
                          {p.emergingThemes.slice(0, 3).map((t, j) => (
                            <span key={j} className="flex items-center gap-1 text-[10px] text-slate-400 bg-white/5 border border-white/5 px-2 py-0.5 rounded-full font-mono">
                              <TrendIcon trend={t.trend} />
                              {t.theme}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-1 text-xs text-slate-500 group-hover:text-amber-400 transition-colors">
                        <span>Ver mandato completo</span>
                        <ChevronRight className="w-3 h-3" />
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center"
              >
                <Calendar className="w-10 h-10 text-slate-700 mx-auto mb-4" />
                <p className="text-slate-400 text-sm">
                  Los mandatos semanales aparecerán acá a medida que se generen cada viernes.
                </p>
              </motion.div>
            )}
          </div>
        </section>

        {/* ━━━ SECTION 9: CTA ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="relative py-20 md:py-28 overflow-hidden">
          <div className="absolute inset-0 bg-amber-900/5" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-amber-500/[0.03] rounded-full blur-[120px] pointer-events-none" />

          <div className="container mx-auto px-4 relative z-10 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-6xl font-bold text-white font-serif mb-6"
            >
              Alimentá el mandato con tu señal
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-slate-400 max-w-2xl mx-auto text-lg mb-10"
            >
              Cada voz que entra al mapa hace el mandato más fuerte, más preciso, más irrefutable. No hay mínimo. No hay máximo. Solo convergencia.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex gap-4 justify-center flex-wrap"
            >
              <PowerCTA
                text="ALIMENTÁ EL MANDATO"
                variant="primary"
                size="xl"
                onClick={() => {
                  window.location.href = '/el-mapa#mapa-interactivo';
                }}
              />
              <Link
                href="/mandato/national/Argentina"
                className="px-8 py-4 rounded-xl border border-white/20 text-white hover:bg-white/5 transition-all font-semibold text-lg inline-flex items-center gap-2"
              >
                EXPLORÁ LOS MANDATOS
              </Link>
            </motion.div>
          </div>
        </section>

        {/* ━━━ CLOSING PATTERN ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto rounded-2xl border border-white/10 bg-white/[0.02] p-8 md:p-10 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                <span className="font-bold text-emerald-400 whitespace-nowrap min-w-[220px]">Qué estamos viendo:</span>
                <span className="text-slate-400">Un sistema político que decide sin datos y una ciudadanía que grita sin síntesis.</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                <span className="font-bold text-emerald-400 whitespace-nowrap min-w-[220px]">Qué hacemos ahora:</span>
                <span className="text-slate-400">Convertir señales territoriales en mandatos legibles que la gestión pública pueda ejecutar y la ciudadanía pueda exigir.</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                <span className="font-bold text-blue-400 whitespace-nowrap min-w-[220px]">Qué no vamos a hacer todavía:</span>
                <span className="text-slate-400">Tratar como representativo un mandato con baja densidad. Los mandatos muestran cobertura y no simulan certeza donde no la hay.</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                <span className="font-bold text-emerald-400 whitespace-nowrap min-w-[220px]">Cómo se mide:</span>
                <span className="text-slate-400">Porcentaje de mandatos con llamada a la acción visible. Propuestas generadas. Propuestas con respuesta institucional.</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                <span className="font-bold text-emerald-400 whitespace-nowrap min-w-[220px]">Qué podés hacer vos:</span>
                <span className="text-slate-400">Alimentar el mapa con tu verdad. Lo que declarás se sintetiza. Lo que se sintetiza se puede probar. Lo que se prueba se puede exigir.</span>
              </div>
            </div>
          </div>
        </section>

        {/* ━━━ SECTION 10: NEXT STEP CARD ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <NextStepCard
          title="Encontrá tu círculo de reconstrucción"
          description="El mandato se sostiene en células territoriales. Lo que se probó necesita quien lo multiplique. Encontrá la que necesita tu capacidad."
          href="/community"
          gradient="from-[#0f172a] to-[#1e293b]"
          icon={<Users className="w-5 h-5" />}
        />

      </main>
      <Footer />
    </div>
  );
};

export default ElMandatoVivo;
