import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lightbulb, Search, Network, Loader2, Rocket,
  GitBranch, Route, DollarSign, BarChart3,
  Activity, Zap, Shield, Edit3, Swords,
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useImmersion } from '@/components/ImmersionContext';
import {
  CinematicScroll,
  CinematicChapter,
  ChapterTitle,
  NarratorBlock,
} from '@cinematic-scroll/index';
import type { ChapterPalette } from '@cinematic-scroll/types';
import InitiativeCard from '@/components/iniciativas/InitiativeCard';
import { INITIATIVE_CATEGORIES, PHASE_META } from '@/lib/initiative-utils';
import { STRATEGIC_INITIATIVES } from '../../../shared/strategic-initiatives';
import type { InitiativeCategory } from '../../../shared/strategic-initiatives';

/* ── Arquitecto tab components (lazy) ── */
const ArquitectoOverview = lazy(() => import('@/components/arquitecto/ArquitectoOverview'));
const DependencyGraph = lazy(() => import('@/components/arquitecto/DependencyGraph'));
const CriticalPathTimeline = lazy(() => import('@/components/arquitecto/CriticalPathTimeline'));
const BudgetFlow = lazy(() => import('@/components/arquitecto/BudgetFlow'));
const KPICommandBoard = lazy(() => import('@/components/arquitecto/KPICommandBoard'));
const CommandCenter = lazy(() => import('@/components/arquitecto/CommandCenter'));
const WhatIfSimulator = lazy(() => import('@/components/arquitecto/WhatIfSimulator'));
const ValidationDashboard = lazy(() => import('@/components/arquitecto/ValidationDashboard'));
const PlanEditor = lazy(() => import('@/components/arquitecto/PlanEditor'));
const AdversarialSimulator = lazy(() => import('@/components/arquitecto/AdversarialSimulator'));

/* ── Cinematic scroll palettes ── */
const RUTA_PALETTES: ChapterPalette[] = [
  {
    bg: '#0a0a0a', text: '#8a8a8a', textMuted: '#555555', accent: '#6a6a6a',
    border: '#1a1a1a', cardBg: '#ffffff', testimonialAccent: '#777777',
    statColor: '#999999', grain: 0.06, vignette: 0.4,
  },
  {
    bg: '#0e0c09', text: '#a08060', textMuted: '#6b5540', accent: '#886644',
    border: '#1e1a14', cardBg: '#d4c5a0', testimonialAccent: '#997755',
    statColor: '#bb9966', grain: 0.04, vignette: 0.35,
  },
  {
    bg: '#080c10', text: '#6699bb', textMuted: '#3d5f7a', accent: '#4488aa',
    border: '#121e28', cardBg: '#88bbdd', testimonialAccent: '#5599bb',
    statColor: '#77aacc', grain: 0.035, vignette: 0.3,
  },
  {
    bg: '#080e0b', text: '#66cc88', textMuted: '#3d7a55', accent: '#44aa66',
    border: '#122e1a', cardBg: '#88ddaa', testimonialAccent: '#55bb77',
    statColor: '#77cc99', grain: 0.025, vignette: 0.25,
  },
  {
    bg: '#0c0a10', text: '#bb88ee', textMuted: '#7a55aa', accent: '#7D5BDE',
    border: '#1e1428', cardBg: '#bb88ee', testimonialAccent: '#9966cc',
    statColor: '#cc99ff', grain: 0.015, vignette: 0.15,
  },
];

const CHAPTER_TITLES = [
  'La Semilla', 'La Prueba', 'La Circunscripción',
  'La Cabecera de Puente', 'La Ejecución',
];

/* ── Arquitecto tabs ── */
type TabId = 'organismo' | 'dependencias' | 'ruta' | 'presupuesto' | 'indicadores' | 'comando' | 'whatif' | 'validacion' | 'editor' | 'adversarial';

interface Tab {
  id: TabId;
  label: string;
  icon: typeof Network;
}

const TABS: Tab[] = [
  { id: 'organismo', label: 'Organismo', icon: Network },
  { id: 'dependencias', label: 'Dependencias', icon: GitBranch },
  { id: 'ruta', label: 'Ruta Crítica', icon: Route },
  { id: 'presupuesto', label: 'Presupuesto', icon: DollarSign },
  { id: 'indicadores', label: 'Indicadores', icon: BarChart3 },
  { id: 'comando', label: 'Centro de Mando', icon: Activity },
  { id: 'whatif', label: '¿Qué Pasa Si?', icon: Zap },
  { id: 'validacion', label: 'Validación', icon: Shield },
  { id: 'editor', label: 'Editor', icon: Edit3 },
  { id: 'adversarial', label: 'Adversarial', icon: Swords },
];

function TabFallback() {
  return (
    <div className="flex items-center justify-center py-32">
      <Loader2 className="w-8 h-8 text-white/40 animate-spin" />
    </div>
  );
}

/* ── Main page ── */
export default function UnaRutaParaArgentina() {
  const { setImmersive } = useImmersion();
  const [selectedCategory, setSelectedCategory] = useState<InitiativeCategory | 'todas'>('todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabId>('organismo');
  const cinematicRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = 'Una Ruta Para Argentina — El Instante del Hombre Gris';
    window.scrollTo(0, 0);
  }, []);

  // Activate immersive mode when cinematic section is in view
  useEffect(() => {
    const el = cinematicRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setImmersive(entry.isIntersecting),
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      setImmersive(false);
    };
  }, [setImmersive]);

  // Iniciativas filtering
  const filtered = STRATEGIC_INITIATIVES.filter((initiative) => {
    const matchesCategory = selectedCategory === 'todas' || initiative.category === selectedCategory;
    const matchesSearch = searchQuery === '' ||
      initiative.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      initiative.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      initiative.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const categoriesWithCount = Object.entries(INITIATIVE_CATEGORIES).filter(
    ([key]) => STRATEGIC_INITIATIVES.some(i => i.category === key)
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />

      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full blur-[120px] bg-purple-600/[0.08]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[300px] rounded-full blur-[120px] bg-blue-500/[0.05]" />
        </div>

        <div className="relative container mx-auto px-4 max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tight mb-8">
              <span className="bg-gradient-to-b from-white via-white/90 to-white/60 bg-clip-text text-transparent">
                Una Ruta Para Argentina
              </span>
            </h1>

            <p className="text-lg md:text-xl text-white/50 leading-relaxed max-w-3xl mx-auto">
              En esta página vas a encontrar un ejercicio que hice para imaginar otro camino.
              Primero, una serie de <strong className="text-white/70">iniciativas estratégicas</strong> bien
              documentadas — propuestas de rediseño de país usando Diseño Idealizado.
              Después, una herramienta que llamé <strong className="text-white/70">El Arquitecto</strong>,
              que combina todas las iniciativas para analizar dependencias, ruta crítica y presupuesto.
              Y al final, una especie de mini novela que cuenta — desde el futuro — cómo podríamos
              haberlas aplicado. Un ejercicio para ver que otro camino es posible.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mt-12">
              <a href="#diseno-idealizado" className="px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all text-sm font-medium">
                Diseño Idealizado
              </a>
              <a href="#iniciativas" className="px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all text-sm font-medium">
                Iniciativas Estratégicas
              </a>
              <a href="#arquitecto" className="px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all text-sm font-medium">
                El Arquitecto
              </a>
              <a href="#imagina" className="px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all text-sm font-medium">
                Imaginá Qué Pasaría
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ DISEÑO IDEALIZADO (explicación + 5 fases) ═══════════════ */}
      <section id="diseno-idealizado" className="py-20 scroll-mt-20">
        <div className="container mx-auto px-4">
          {/* ¿Qué es el Diseño Idealizado? */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto mb-16 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md p-8 md:p-12"
          >
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-400 shrink-0">
                <Lightbulb className="w-8 h-8" />
              </div>
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4">
                  <span className="text-[10px] font-bold tracking-[0.2em] text-amber-400 uppercase">
                    Metodología
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-white/95 mb-4 leading-tight">
                  ¿Qué es el Diseño Idealizado?
                </h2>
                <p className="text-white/60 leading-relaxed mb-4">
                  El Diseño Idealizado es una metodología creada por <strong className="text-white/80">Russell Ackoff</strong>,
                  pionero del pensamiento sistémico. En lugar de mejorar lo que existe, propone
                  diseñar desde cero el sistema ideal y luego trabajar hacia atrás para crear un
                  camino viable desde el presente hasta ese ideal.
                </p>
                <p className="text-white/60 leading-relaxed">
                  Cada iniciativa de esta página sigue el mismo recorrido: identificar el problema,
                  proyectar qué pasa sin cambios, diseñar la solución ideal sin restricciones,
                  trazar el camino desde la meta hacia el presente, y definir indicadores para
                  medir el avance.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Las 5 Fases del Diseño Idealizado */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-5xl mx-auto"
          >
            <div className="bg-white/[0.03] rounded-3xl border border-white/10 backdrop-blur-md p-8 md:p-10">
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-5">
                  <span className="text-xs font-bold tracking-[0.2em] text-white/60 uppercase">
                    Las 5 Fases
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-serif font-bold text-white mb-3">
                  El recorrido de cada iniciativa
                </h3>
                <p className="text-white/50 max-w-2xl mx-auto leading-relaxed">
                  Del problema a la solución ideal, con un camino concreto y métricas
                  para medir el avance. Cada iniciativa del ecosistema sigue exactamente
                  estas cinco fases.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { meta: PHASE_META[0], desc: 'Identificar con claridad qué está roto hoy.' },
                  { meta: PHASE_META[1], desc: 'Proyectar el costo de no cambiar nada.' },
                  { meta: PHASE_META[2], desc: 'Imaginar la solución sin restricciones.' },
                  { meta: PHASE_META[3], desc: 'Trazar el recorrido desde el ideal al presente.' },
                  { meta: PHASE_META[4], desc: 'Medir el avance con métricas concretas.' },
                ].map(({ meta, desc }) => {
                  const PhaseIcon = meta.icon;
                  return (
                    <div
                      key={meta.key}
                      className="relative rounded-2xl border border-white/10 bg-white/[0.02] p-5 hover:bg-white/[0.04] hover:border-white/15 transition-all duration-300"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: `${meta.accent}1a`, border: `1px solid ${meta.accent}33` }}
                        >
                          <PhaseIcon className="w-5 h-5" style={{ color: meta.accent }} />
                        </div>
                        <span className="text-3xl font-serif font-bold text-white/10 leading-none">
                          0{meta.number}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white mb-2 leading-tight">
                        {meta.label}
                      </h4>
                      <p className="text-xs text-white/40 leading-relaxed">
                        {desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ INICIATIVAS ESTRATÉGICAS ═══════════════ */}
      <section id="iniciativas" className="py-24 scroll-mt-20">
        <div className="container mx-auto px-4">
          {/* Featured card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-5xl mx-auto mb-16"
          >
            <div className="bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md overflow-hidden">
              <div className="p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center gap-8">
                {/* Left side: icon + text */}
                <div className="flex-1">
                  <div className="flex items-start gap-5 mb-6">
                    <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-400 shrink-0">
                      <Rocket className="w-8 h-8" />
                    </div>
                    <div>
                      <span className="text-xs font-bold tracking-[0.2em] text-amber-400 uppercase block mb-2">
                        Política Pública
                      </span>
                      <h2 className="text-3xl md:text-4xl font-bold text-white">
                        Iniciativas Estratégicas
                      </h2>
                    </div>
                  </div>

                  <p className="text-lg text-white/50 leading-relaxed mb-6 max-w-2xl">
                    Propuestas de rediseño de país usando Diseño Idealizado: del problema a la solución ideal,
                    con un camino concreto y métricas para medir el avance. Cada iniciativa es un plan de acción completo.
                  </p>

                  <div>
                    <p className="text-2xl font-bold text-white">{STRATEGIC_INITIATIVES.length}</p>
                    <p className="text-xs text-white/40 font-medium uppercase">Propuestas</p>
                  </div>
                </div>

                {/* Right side: phase journey preview */}
                <div className="hidden md:flex flex-col items-center gap-0 shrink-0 pr-4">
                  {PHASE_META.map((phase, i) => {
                    const PhaseIcon = phase.icon;
                    return (
                      <div key={phase.key} className="flex flex-col items-center">
                        <div
                          className="w-11 h-11 rounded-full flex items-center justify-center border-2 bg-white/5"
                          style={{ borderColor: phase.accent }}
                        >
                          <PhaseIcon className="w-4 h-4" style={{ color: phase.accent }} />
                        </div>
                        <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider mt-1 max-w-[70px] text-center leading-tight">
                          {phase.label}
                        </span>
                        {i < PHASE_META.length - 1 && (
                          <div className="w-px h-4 bg-white/10 my-1" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Search + Filters (dark adapted) */}
          <div className="max-w-4xl mx-auto space-y-4 mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
              <input
                type="text"
                placeholder="Buscar iniciativas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400/30 transition-all"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('todas')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === 'todas'
                    ? 'bg-white/15 text-white border border-white/20'
                    : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'
                }`}
              >
                Todas ({STRATEGIC_INITIATIVES.length})
              </button>
              {categoriesWithCount.map(([key, meta]) => {
                const count = STRATEGIC_INITIATIVES.filter(i => i.category === key).length;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key as InitiativeCategory)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all inline-flex items-center gap-2 ${
                      selectedCategory === key
                        ? 'bg-white/15 text-white border border-white/20'
                        : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <meta.icon className="w-3.5 h-3.5" />
                    {meta.label} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Initiative Cards Grid */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {filtered.map((initiative, index) => (
                <InitiativeCard
                  key={initiative.slug}
                  initiative={initiative}
                  index={index}
                  delay={0.1 * index}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Lightbulb className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-xl font-serif font-bold text-white/60 mb-2">
                No se encontraron iniciativas
              </h3>
              <p className="text-white/30">
                Probá ajustando los filtros o la búsqueda.
              </p>
            </div>
          )}

        </div>
      </section>

      {/* ═══════════════ EL ARQUITECTO ═══════════════ */}
      <section id="arquitecto" className="py-24 scroll-mt-20">
        <div className="container mx-auto px-4">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6">
              <Network className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-medium text-white/60 uppercase tracking-wider">
                Sistema de Planificación Estratégica
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
                El Arquitecto
              </span>
            </h2>
            <p className="text-lg text-white/50 max-w-2xl mx-auto leading-relaxed">
              22 mandatos. Un organismo vivo. Esta herramienta combina todas las iniciativas
              para analizar dependencias, ruta crítica y presupuesto como un sistema interconectado.
            </p>
          </motion.div>

          {/* Tab Navigation */}
          <div className="sticky top-16 z-30 bg-[#0a0a0a]/80 backdrop-blur-xl border-y border-white/5 -mx-4 px-4">
            <nav className="container mx-auto flex overflow-x-auto scrollbar-hide gap-1 py-2" role="tablist">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                      whitespace-nowrap transition-all duration-200
                      ${isActive
                        ? 'text-white bg-white/10 border border-white/15'
                        : 'text-white/40 hover:text-white/70 hover:bg-white/5 border border-transparent'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                    {isActive && (
                      <motion.div
                        layoutId="rutaActiveTabIndicator"
                        className="absolute inset-0 rounded-xl bg-white/5 border border-white/10"
                        style={{ zIndex: -1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="py-8 min-h-[60vh]">
            <AnimatePresence mode="wait">
              <Suspense fallback={<TabFallback />} key={activeTab}>
                {activeTab === 'organismo' && <ArquitectoOverview />}
                {activeTab === 'dependencias' && <DependencyGraph onSelectPlan={() => {}} />}
                {activeTab === 'ruta' && <CriticalPathTimeline onSelectPlan={() => {}} />}
                {activeTab === 'presupuesto' && <BudgetFlow />}
                {activeTab === 'indicadores' && <KPICommandBoard />}
                {activeTab === 'comando' && <CommandCenter />}
                {activeTab === 'whatif' && <WhatIfSimulator />}
                {activeTab === 'validacion' && <ValidationDashboard />}
                {activeTab === 'editor' && <PlanEditor />}
                {activeTab === 'adversarial' && <AdversarialSimulator />}
              </Suspense>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ═══════════════ IMAGINÁ QUÉ PASARÍA ═══════════════ */}
      <section id="imagina" className="scroll-mt-20">
        <div className="container mx-auto px-4 text-center py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-purple-300 to-violet-400 bg-clip-text text-transparent">
                Imaginá Qué Pasaría
              </span>
            </h2>
            <p className="text-lg text-white/50 max-w-2xl mx-auto leading-relaxed mb-4">
              Una mini novela en cinco capítulos que cuenta — desde el futuro — cómo podríamos
              haber aplicado estas ideas. No es una predicción. Es un ejercicio para ver que
              otro camino es posible.
            </p>
            <p className="text-sm text-white/30 mb-8">
              Desplazá hacia abajo para comenzar la lectura inmersiva.
            </p>
          </motion.div>
        </div>

        <div ref={cinematicRef}>
          <CinematicScroll palettes={RUTA_PALETTES} chapters={CHAPTER_TITLES}>
            <CinematicChapter index={0}>
              <ChapterTitle
                number={1}
                title="La Semilla"
                subtitle="2026"
                epigraph="Dejar de esperar — ese fue el verbo que faltaba."
              />
              <NarratorBlock>
                Al principio nadie creía. &quot;Ya lo intentamos.&quot; &quot;Argentina es así.&quot;
                &quot;No va a funcionar.&quot; La frase más repetida del país desde hacía
                generaciones era también la más cómoda: no se puede.
              </NarratorBlock>
              <NarratorBlock>
                Seis crisis en 135 años habían entrenado a un pueblo entero para esperar lo
                peor. El cinismo se había vuelto sabiduría popular. &quot;¿Otra utopía? Ya
                vimos esta película.&quot;
              </NarratorBlock>
              <NarratorBlock emphasis="strong">
                Pero el cambio, esta vez, no empezó por arriba.
              </NarratorBlock>
              <NarratorBlock>
                Empezó en una cocina en Tafí del Valle, donde una maestra jubilada abrió El
                Mapa y marcó un pozo que hacía quince años no andaba. Tardó seis minutos.
                Fue su primer acto cívico en dos décadas.
              </NarratorBlock>
              <NarratorBlock>
                Empezó en un banco de plaza en Caballito, donde un jubilado que nunca había
                militado en nada subió una señal sobre una rampa rota. Escribió tres líneas.
                Las corrigió dos veces. Le dio &quot;enviar&quot;.
              </NarratorBlock>
              <NarratorBlock>
                Empezó en Resistencia, en un taller mecánico, donde un pibe de veintitrés
                años que había pensado en irse del país escribió una propuesta para recuperar
                una escuela abandonada del barrio. Nunca antes le había dicho a nadie que
                quería quedarse.
              </NarratorBlock>
              <NarratorBlock>
                No se conocían. No se coordinaron. Cada uno pensó que era el único.
              </NarratorBlock>
              <NarratorBlock emphasis="strong">
                Y sin embargo, en el primer trimestre, treinta y seis mil personas hicieron
                lo mismo. Sin liderazgo central. Sin campaña de marketing. Porque alguien,
                en algún lado, había dejado de esperar — y esa es la única noticia que se
                contagia más rápido que el miedo.
              </NarratorBlock>
              <NarratorBlock>
                Los incrédulos miraban. &quot;No va a servir para nada.&quot; &quot;¿Qué
                cambia marcar un pozo?&quot; Y sin embargo, el pozo de Tafí se reparó en
                cuarenta días. Con plata de una partida municipal que se había estado
                perdiendo desde 2019 y que salió a la luz cuando trescientas firmas
                aparecieron en El Mapa pidiendo lo mismo.
              </NarratorBlock>
              <NarratorBlock>
                La rampa de Caballito se arregló en dos semanas. La escuela de Resistencia
                — esa tardó ocho meses, pero se recuperó. Y fueron los mismos vecinos los
                que pintaron las aulas.
              </NarratorBlock>
              <NarratorBlock>
                Fueron victorias pequeñas. Microscópicas frente al tamaño del país. Y sin
                embargo cada una llegaba acompañada de algo nuevo: la sensación, tan vieja
                que ya nadie la reconocía, de que hacer algo había servido para algo.
              </NarratorBlock>
              <NarratorBlock>
                La palabra que empezó a circular en esos meses no fue &quot;revolución&quot;.
                Fue &quot;probar&quot;. &quot;Vamos a probar.&quot; &quot;Probá vos
                también.&quot; Era un verbo tímido, casi vergonzoso — y exactamente por eso
                se contagió.
              </NarratorBlock>
              <NarratorBlock emphasis="strong">
                Al final de 2026, seiscientas mil personas habían usado El Mapa al menos
                una vez. Ninguna encuesta lo había predicho. Ninguna consultora lo había
                diseñado.
              </NarratorBlock>
              <NarratorBlock emphasis="strong">
                La herramienta no cambió a la gente. La gente cambió cuando se animó a
                usarla. Y una vez que una persona se anima, la que está al lado empieza a
                mirar distinto.
              </NarratorBlock>
            </CinematicChapter>

            <CinematicChapter index={1}>
              <ChapterTitle
                number={2}
                title="La Prueba"
                subtitle="2026 — 2027"
                epigraph="Gobernar no es mandar. Gobernar es escuchar."
              />
              <NarratorBlock>
                El primer pueblo entero que dijo &quot;probemos acá&quot; fue un pueblo de
                tres mil habitantes en Córdoba que casi nadie podía ubicar en el mapa. Se
                reían cuando lo anunciaron.
              </NarratorBlock>
              <NarratorBlock>
                &quot;¿Qué va a cambiar un pueblo de tres mil? Ni siquiera tienen
                semáforos.&quot; Lo dijeron en la tele nacional. Lo dijeron vecinos del mismo
                pueblo. Lo dijo el intendente, que aceptó &quot;por probar&quot;, convencido
                de que no iba a pasar nada.
              </NarratorBlock>
              <NarratorBlock emphasis="strong">
                Lo primero que hicieron fue callarse y escuchar.
              </NarratorBlock>
              <NarratorBlock>
                Diez mil señales en el primer mes. Una por cada tres habitantes. Sueños.
                Necesidades. Declaraciones de ¡BASTA!. Un señor de ochenta años tipeando
                con un dedo sobre el celular de su nieta.
              </NarratorBlock>
              <NarratorBlock>
                Las señales se agruparon solas en el Mandato Vivo. Agua. Seguridad.
                Escuelas. Los tres problemas de siempre — pero ahora visibles, cuantificados,
                mapeados, imposibles de negar.
              </NarratorBlock>
              <NarratorBlock>
                Una maestra jubilada fue quien propuso la solución al agua. No un ingeniero.
                Una maestra. Conocía cada cañería del pueblo porque había enseñado a los
                hijos de los plomeros.
              </NarratorBlock>
              <NarratorBlock>
                Un vecino que nunca había hablado en público facilitó el primer Panel
                Ciudadano. Le temblaban las manos. Cuando terminó, su esposa lloraba en la
                puerta — no lo había visto hablar así nunca.
              </NarratorBlock>
              <NarratorBlock>
                El intendente resistente — el que había aceptado &quot;por probar&quot; —
                en el tercer mes pidió la palabra en un Panel y dijo: &quot;Estoy aprendiendo
                más en estas semanas que en doce años de gestión.&quot; Lo dijo llorando.
              </NarratorBlock>
              <NarratorBlock emphasis="strong">
                Nadie previó que el cambio más profundo iba a ser el de los que gobernaban.
              </NarratorBlock>
              <NarratorBlock>
                Para fin de año, el agua andaba. Las escuelas tenían calefacción. La
                inseguridad había bajado un cuarenta por ciento — no por más policía, sino
                porque el alumbrado de tres calles se había arreglado después de que
                sesenta vecinos marcaron el mismo problema.
              </NarratorBlock>
              <NarratorBlock>
                Y entonces, sin que nadie hiciera campaña, cuatro pueblos vecinos pidieron
                entrar. Después cuarenta. Después cuatrocientos. El contagio fue más rápido
                que cualquier estrategia de comunicación.
              </NarratorBlock>
              <NarratorBlock>
                El año 2027 terminó con mil doscientos municipios usando algo del sistema —
                algunos todo, algunos partes. No hubo un plan de expansión. Hubo fuego.
              </NarratorBlock>
              <NarratorBlock>
                Los problemas aparecieron, claro. Un concejal de un pueblo bonaerense
                intentó inflar señales falsas. La misma comunidad lo detectó en tres días.
                No hizo falta denuncia penal: le tocaron el timbre los vecinos. Renunció al
                quinto día.
              </NarratorBlock>
              <NarratorBlock>
                En otro pueblo, un grupo quiso usar el Mandato para empujar un proyecto que
                beneficiaba solo a veinte familias. El sistema — que publica todas las
                señales — lo mostró tan descarnadamente que el proyecto se cayó solo.
              </NarratorBlock>
              <NarratorBlock>
                La transparencia no era una regla impuesta. Era una consecuencia
                arquitectónica. Cuando todo se ve, muchas cosas, simplemente, se vuelven
                imposibles.
              </NarratorBlock>
              <NarratorBlock emphasis="strong">
                Y mientras tanto, algo más profundo estaba pasando. Algo que no salía en
                ninguna métrica.
              </NarratorBlock>
              <NarratorBlock>
                Donde antes se decía &quot;algún día alguien va a hacer algo&quot;, ahora se
                decía &quot;lo estamos haciendo nosotros&quot;. En los almacenes. En las
                reuniones de padres. En los grupos de WhatsApp del barrio.
              </NarratorBlock>
              <NarratorBlock emphasis="strong">
                El idioma cambió primero. Y cuando el idioma de un país cambia, todo lo
                demás termina cediendo.
              </NarratorBlock>
            </CinematicChapter>

            <CinematicChapter index={2}>
              <ChapterTitle
                number={3}
                title="La Circunscripción"
                subtitle="2027 — 2029"
                epigraph="No fue un partido. Fue una forma de vivir que se expandió."
              />
              <NarratorBlock>
                La primera provincia que adoptó el sistema completo fue un caso inesperado.
                No fue una provincia grande. Tampoco una rica. Fue una que no quería seguir
                siendo el furgón de cola.
              </NarratorBlock>
              <NarratorBlock>
                La incredulidad volvió, más fuerte. &quot;A un pueblo quizás. ¿Pero una
                provincia entera? ¿Coordinando a un millón de personas? No lo vas a
                ver.&quot;
              </NarratorBlock>
              <NarratorBlock>
                Y sin embargo. Tres mil barrios usando El Mapa al mismo tiempo. Cuarenta mil
                señales por semana en el pico.
              </NarratorBlock>
              <NarratorBlock>
                Abuelas de cerámica. Adolescentes que nunca habían votado. Productores
                rurales que veían su primer panel participativo por streaming desde el
                tractor.
              </NarratorBlock>
              <NarratorBlock emphasis="strong">
                La provincia redactó su propio Diseño Idealizado. No un plan quinquenal. Un
                documento escrito por miles de personas, en miles de paneles, durante
                dieciocho meses.
              </NarratorBlock>
              <NarratorBlock>
                No lo escribieron consultores. Lo escribieron vecinos. Los técnicos hicieron
                lo que siempre deberían haber hecho: traducir, no decidir.
              </NarratorBlock>
              <NarratorBlock>
                Y cuando ese documento salió, los primeros de la lista de planes fueron los
                que más señales habían generado. PLANAGUA no nació en un ministerio — nació
                de trescientas mil señales de vecinos que habían marcado pozos secos,
                cañerías rotas, arroyos contaminados.
              </NarratorBlock>
              <NarratorBlock>
                PLANEDU no lo diseñaron expertos. Lo diseñaron maestros, padres, pibes.
                PLANSAL salió de pacientes y enfermeras cansadas de escribir en cuadernos.
                Cada plan era una constelación de voces ciudadanas hecha política pública.
              </NarratorBlock>
              <NarratorBlock emphasis="strong">
                Por primera vez en décadas, el Estado no le contaba al pueblo lo que iba a
                hacer. El pueblo le contaba al Estado.
              </NarratorBlock>
              <NarratorBlock>
                Los problemas aparecieron, como siempre. Pero aparecieron y se resolvieron
                casi en el mismo movimiento.
              </NarratorBlock>
              <NarratorBlock>
                Un grupo narco intentó capturar un Panel de una localidad fronteriza,
                plantando voluntarios falsos. El sistema — diseñado para visibilidad radical
                — mostró patrones de votación sospechosos en cuarenta y ocho horas. La
                comunidad reaccionó antes que la justicia.
              </NarratorBlock>
              <NarratorBlock>
                Un intendente quiso comprar señales. Se descubrió en dos días. El propio
                pueblo — no un auditor externo — lo sacó con una asamblea. La palabra
                &quot;revocatoria&quot; se volvió parte del idioma cotidiano.
              </NarratorBlock>
              <NarratorBlock>
                Los jóvenes que se iban empezaron a volver. No de golpe. Goteo. Pero en el
                segundo año, más matrículas en las universidades provinciales que en
                cualquier momento del siglo.
              </NarratorBlock>
              <NarratorBlock>
                Llegaron periodistas. De Uruguay, de Chile, de Colombia. Después de Brasil.
                Después de España. Se paraban en las plazas, entrevistaban a cualquier
                vecino, y se iban con cara de no entender cómo era posible.
              </NarratorBlock>
              <NarratorBlock>
                Un periodista alemán escribió: &quot;Lo sorprendente no es el sistema. Lo
                sorprendente es la forma en que la gente habla acá. Como si el país fuera
                de ellos. Porque es de ellos.&quot;
              </NarratorBlock>
              <NarratorBlock emphasis="strong">
                Y entonces pasó algo que no estaba en ninguna agenda.
              </NarratorBlock>
              <NarratorBlock>
                En una reunión de vecinos, en una localidad de cinco mil habitantes, alguien
                dijo en voz alta: &quot;Nos está saliendo bien.&quot; Hubo un silencio.
              </NarratorBlock>
              <NarratorBlock emphasis="strong">
                Nadie se rió. Hacía décadas que una frase así no podía decirse sin ironía.
                Pero esa tarde, en esa sala, se pudo decir — y el silencio que siguió fue
                el sonido de un país empezando a creerse capaz de sí mismo.
              </NarratorBlock>
            </CinematicChapter>

            <CinematicChapter index={3}>
              <ChapterTitle
                number={4}
                title="La Cabecera de Puente"
                subtitle="2029 — 2034"
                epigraph="Veintidós planes. Un organismo vivo, hecho por millones de manos."
              />
              <NarratorBlock>
                &quot;Un pueblo, sí. Una provincia, con suerte. ¿Pero el país entero?&quot;
                La incredulidad había subido de escala porque el movimiento había subido de
                escala.
              </NarratorBlock>
              <NarratorBlock>
                Las elecciones nacionales de 2029 fueron las más raras que se recuerdan. Los
                candidatos del movimiento no se presentaban como políticos. Se presentaban
                como vecinos-legisladores.
              </NarratorBlock>
              <NarratorBlock>
                Postulantes validados por sus propios barrios. Mandatos cortos. Revocabilidad
                permanente. Salarios atados a la mediana de sus comunidades.
              </NarratorBlock>
              <NarratorBlock>
                Muchos perdieron. Muchos ganaron. Y entre los que ganaron había maestras
                jubiladas, mecánicos, médicas rurales, trabajadores de comedor escolar.
              </NarratorBlock>
              <NarratorBlock emphasis="strong">
                Por primera vez en décadas, una fotografía del Congreso se parecía a una
                fotografía del país.
              </NarratorBlock>
              <NarratorBlock>
                Y entonces llegó el desafío real: veintidós planes que tenían que
                articularse entre sí. PLANAGUA, PLANEDU, PLANSAL, PLANMOV, PLANVIV, PLANJUS,
                PLANEN — cada uno una consolidación de millones de señales ciudadanas hecha
                política pública.
              </NarratorBlock>
              <NarratorBlock>
                Cientos de dependencias cruzadas. Un horizonte de veinte años. La pregunta
                no era &quot;¿quién lo paga?&quot;. La pregunta era &quot;¿quién lo orquesta
                sin capturarlo?&quot;.
              </NarratorBlock>
              <NarratorBlock>
                La respuesta ya estaba escrita — en los paneles, en los mandatos, en las
                señales. El pueblo orquestaba lo que el pueblo había diseñado.
              </NarratorBlock>
              <NarratorBlock>
                La vieja política intentó, por supuesto, lo que siempre intenta: sabotaje
                institucional. Tecnicismos legales. Presupuestos bloqueados en comisiones.
                Demandas de inconstitucionalidad a cada ley.
              </NarratorBlock>
              <NarratorBlock>
                Casi todas fracasaron. No porque los abogados del movimiento fueran mejores
                — sino porque cada ley llegaba al Congreso con la firma de millones de
                personas detrás. Sacar una ley significaba sacarle la palabra a los que la
                habían escrito.
              </NarratorBlock>
              <NarratorBlock emphasis="strong">
                La legitimidad había cambiado de domicilio. Ya no vivía en el Congreso.
                Vivía en los barrios. Y el Congreso, por primera vez, tenía que negociar con
                ese domicilio.
              </NarratorBlock>
              <NarratorBlock>
                El discurso público cambió. Se dejó de hablar de &quot;la crisis&quot; y se
                empezó a hablar de &quot;el rediseño&quot;. Las noticias dejaron de ser
                sobre qué ministro iba a renunciar — y empezaron a ser sobre qué panel
                ciudadano había aprobado qué tramo de qué plan.
              </NarratorBlock>
              <NarratorBlock>
                Los chicos crecieron con otra gramática. La palabra &quot;política&quot;
                dejó de ser una mala palabra. Volvió a significar lo que significaba antes
                de perderse: el arte de construir juntos la ciudad.
              </NarratorBlock>
              <NarratorBlock>
                Y entonces empezaron a llegar las llamadas de afuera.
              </NarratorBlock>
              <NarratorBlock>
                No embajadores. Presidentes. Alcaldes de ciudades extranjeras. Ministros de
                otros países. Querían entender. Querían copiar. Querían mandar gente a
                aprender.
              </NarratorBlock>
              <NarratorBlock>
                La respuesta argentina fue inesperada: &quot;No copien. Adapten.&quot; El
                código del sistema era libre. Los protocolos eran públicos. Pero el espíritu
                — el de hacerse cargo — eso se tenía que inventar localmente.
              </NarratorBlock>
              <NarratorBlock>
                En Brasil, equipos comunitarios empezaron a mapear favelas con una versión
                propia de El Mapa. En México, colectivos en Oaxaca armaron sus paneles
                indígenas. En España, barrios de Madrid y Barcelona experimentaron con
                asambleas al estilo del Mandato Vivo. En Filipinas, maestras de Cebú
                adaptaron la herramienta al tagalo. En Nigeria, organizadores de Lagos y
                Kano hicieron lo mismo en yoruba y en hausa.
              </NarratorBlock>
              <NarratorBlock>
                No imitaban. Diseñaban. Argentina había dejado de exportar soja: exportaba
                método — y ni siquiera el método era el punto. El punto era el permiso. La
                prueba viva de que la gente común podía.
              </NarratorBlock>
              <NarratorBlock emphasis="strong">
                Una escuela primaria de Humahuaca recibió una carta de una escuela de
                Senegal pidiéndole consejos sobre cómo habían organizado los Paneles
                Escolares.
              </NarratorBlock>
              <NarratorBlock>
                La maestra la leyó en voz alta frente a sus alumnos. Los chicos escucharon
                en silencio, sin entender del todo, pero entendiéndolo todo. Una nena de
                ocho años preguntó, al final: &quot;¿Podemos contestar?&quot; Y contestaron
                — con un dibujo y tres párrafos que la maestra subió al Mapa esa misma
                tarde.
              </NarratorBlock>
            </CinematicChapter>

            <CinematicChapter index={4}>
              <ChapterTitle
                number={5}
                title="La Ejecución"
                subtitle="2034 — 2040+"
                epigraph="La crisis llegó. Pero esta vez el pueblo ya no esperaba."
              />
              <NarratorBlock>
                La crisis llegó — como siempre en Argentina, como había llegado seis veces
                en 135 años. Cíclica. Estructural. Inevitable.
              </NarratorBlock>
              <NarratorBlock emphasis="strong">
                Pero esta vez no encontró a un país esperando al gobierno. Encontró a un
                país que ya había aprendido a no esperar.
              </NarratorBlock>
              <NarratorBlock>
                Setenta y dos horas. Esa era la ventana. La Regla de la Ventana, la habían
                llamado los que construyeron el protocolo: desplegá lo que tenés, aunque
                esté a medio hacer.
              </NarratorBlock>
              <NarratorBlock>
                Un ¡BASTA! incompleto era infinitamente mejor que ningún plan. Eso lo
                sabían. Eso lo habían ensayado.
              </NarratorBlock>
              <NarratorBlock>
                Al primer día, los Paneles Ciudadanos — cientos de miles, distribuidos por
                todo el país — se convirtieron en nodos de coordinación de asistencia.
                Comida. Agua. Transporte. Información confiable.
              </NarratorBlock>
              <NarratorBlock>
                En Rosario, una red de doscientos Paneles redirigió toneladas de alimentos
                en cuarenta y ocho horas, con una precisión logística que los organismos
                oficiales no habían alcanzado en ninguna crisis anterior.
              </NarratorBlock>
              <NarratorBlock>
                En Jujuy, las comunidades andinas que habían sido invisibilizadas durante
                décadas coordinaron directamente con sus pares del altiplano boliviano y
                chileno, sin pedir permiso. Nadie lo prohibió. Nadie hubiera podido.
              </NarratorBlock>
              <NarratorBlock>
                En el Gran Buenos Aires, vecinos de villas y de countries se sentaron en los
                mismos Paneles porque el sistema no sabía distinguir, y no le importaba.
              </NarratorBlock>
              <NarratorBlock emphasis="strong">
                No hubo saqueos generalizados. No hubo pánico. Porque donde hay sistema, el
                miedo tiene menos lugar para crecer.
              </NarratorBlock>
              <NarratorBlock>
                No fue perfecto. Hubo errores. Un sector de adultos mayores sin acceso a
                internet quedó afuera los primeros cinco días, hasta que se montaron
                brigadas puerta a puerta. Hubo capturas locales de recursos que se demoraron
                en detectar. Hubo zonas rurales donde la conectividad falló.
              </NarratorBlock>
              <NarratorBlock>
                Y todo eso se admitió en público. Sin eufemismos. Sin rueda de prensa
                defensiva. Se publicó en El Mapa. Se discutió en los Paneles. Se aprendió.
              </NarratorBlock>
              <NarratorBlock emphasis="strong">
                La costumbre de admitir errores sin vergüenza fue, quizás, la exportación
                más poderosa del movimiento.
              </NarratorBlock>
              <NarratorBlock>
                Países en crisis parecida copiaron el protocolo en semanas. Equipos de
                Chile, de Grecia, de Sri Lanka, de Túnez pidieron el código, pidieron los
                manuales, pidieron formación.
              </NarratorBlock>
              <NarratorBlock>
                Y Argentina, que durante un siglo había recibido misiones del FMI, empezó a
                mandar las suyas. Sin condicionamientos. Sin deudas. Misiones de enseñanza
                mutua.
              </NarratorBlock>
              <NarratorBlock>
                En Grecia, un intendente de una isla pequeña implementó la versión adaptada
                y ganó la reelección con el sesenta y ocho por ciento. En Filipinas, una red
                de barangays replicó los Mandatos Vivos. En Senegal — la escuela que había
                escrito a Humahuaca — ahora coordinaba los Paneles Escolares de media
                África occidental.
              </NarratorBlock>
              <NarratorBlock>
                La gente en otros países dejó de mirar a sus políticos esperando. Empezó a
                diseñar. Con sus códigos propios. En sus idiomas. Con sus paisajes.
              </NarratorBlock>
              <NarratorBlock>
                Y cada vez que alguien en Lima, o en Tel Aviv, o en Dakar, abría un mapa
                propio y marcaba un problema, estaba haciendo — sin saberlo — el mismo
                gesto que aquella maestra de Tafí del Valle había hecho en 2026, con un
                pozo que hacía quince años no andaba.
              </NarratorBlock>
              <NarratorBlock emphasis="strong">
                El gesto se había vuelto planetario. Pero había nacido en una cocina, con
                una sola persona que un día decidió dejar de esperar.
              </NarratorBlock>
              <NarratorBlock>
                Un chico de catorce años en Córdoba le escribió un mensaje a su tío, que
                hacía veinte años se había ido a Madrid buscando una vida que acá no
                encontraba.
              </NarratorBlock>
              <NarratorBlock>
                &quot;Tío, ya no necesitás volver. Las cosas cambiaron. Pero si querés, te
                esperamos. Te guardé un lugar en el Panel de nuestro barrio.&quot;
              </NarratorBlock>
              <NarratorBlock>
                El tío leyó el mensaje en un café de Lavapiés. Lo leyó dos veces. Y por
                primera vez en veinte años, lo pensó en serio.
              </NarratorBlock>
              <NarratorBlock emphasis="strong">
                Lo que pasó en Argentina entre 2026 y 2040 no tiene precedente. No porque
                fuera perfecto. Porque fue nuestro. Porque lo hicimos nosotros. Y porque,
                sin quererlo, le dimos permiso al mundo entero para que también pudiera.
              </NarratorBlock>
            </CinematicChapter>
          </CinematicScroll>
        </div>
      </section>

      <Footer />
    </div>
  );
}
