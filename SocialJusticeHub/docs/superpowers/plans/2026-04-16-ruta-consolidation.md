# Ruta Consolidation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidate Una Ruta Para Argentina, El Arquitecto, and Iniciativas Estratégicas into a single long-scroll page at `/recursos/ruta`.

**Architecture:** Rewrite `UnaRutaParaArgentina.tsx` as a 4-section page (Hero → Iniciativas → Arquitecto → Cinematic chapters). Reuse all existing sub-components. Update all route references across the codebase. Add legacy redirects.

**Tech Stack:** React, wouter, Framer Motion, Tailwind, CinematicScroll, existing arquitecto/ and iniciativas/ components.

---

### Task 1: Create the new consolidated page

**Files:**
- Rewrite: `client/src/pages/UnaRutaParaArgentina.tsx`

This is the main task. The page has 4 sections with lazy-loaded heavy components.

- [ ] **Step 1: Write the new UnaRutaParaArgentina.tsx**

Replace the entire content of `client/src/pages/UnaRutaParaArgentina.tsx` with:

```tsx
import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import {
  Lightbulb, Search, Network, Loader2,
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
import { INITIATIVE_CATEGORIES } from '@/lib/initiative-utils';
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

import {
  GitBranch, Route, DollarSign, BarChart3,
  Activity, Zap, Shield, Edit3, Swords,
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

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
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-radial from-purple-600/8 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[300px] bg-gradient-radial from-blue-500/5 via-transparent to-transparent" />
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

      {/* ═══════════════ INICIATIVAS ESTRATÉGICAS ═══════════════ */}
      <section id="iniciativas" className="py-24 scroll-mt-20">
        <div className="container mx-auto px-4">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-medium text-white/60 uppercase tracking-wider">
                Diseño Idealizado
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">
                Iniciativas Estratégicas
              </span>
            </h2>
            <p className="text-lg text-white/50 leading-relaxed max-w-2xl mx-auto">
              Propuestas detalladas de rediseño de país. Cada iniciativa presenta el problema,
              la proyección sin cambios, el diseño ideal y un camino concreto con indicadores medibles.
            </p>
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

          {/* Methodology callout (dark) */}
          <div className="max-w-4xl mx-auto mt-24 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-400 shrink-0">
                <Lightbulb className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-serif font-bold text-white/90 mb-3">
                  ¿Qué es el Diseño Idealizado?
                </h3>
                <p className="text-white/50 leading-relaxed mb-4">
                  El Diseño Idealizado es una metodología creada por Russell Ackoff, pionero del pensamiento sistémico.
                  En lugar de mejorar lo que existe, propone diseñar desde cero el sistema ideal y luego trabajar
                  hacia atrás para crear un camino viable desde el presente hasta ese ideal.
                </p>
                <p className="text-white/50 leading-relaxed">
                  Cada iniciativa sigue 5 fases: identificar el problema, proyectar qué pasa sin cambios,
                  diseñar la solución ideal sin restricciones, trazar el camino desde la meta hacia el presente,
                  y definir indicadores para medir el avance.
                </p>
              </div>
            </div>
          </div>
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
              16 mandatos. Un organismo vivo. Esta herramienta combina todas las iniciativas
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
                subtitle="2026 — 2028"
                epigraph="Todo empieza con alguien que hace las cuentas."
              />
              <NarratorBlock>
                Seis crisis en 135 años. El patrón no era un accidente — era una arquitectura.
                Dependencia de commodities, bimonetarismo peso-dólar, federalismo fiscal
                disfuncional, impunidad judicial, especulación inmobiliaria. Las mismas cinco
                fracturas estructurales desde 1890.
              </NarratorBlock>
              <NarratorBlock emphasis="strong">
                Pero esta vez fue diferente. Esta vez alguien hizo las cuentas.
              </NarratorBlock>
              <NarratorBlock>
                La idea era una locura. Una aseguradora cooperativa, construida por ciudadanos,
                a costo. Contra el mercado. Contra 200 mil millones de dólares anuales en rentas
                capturadas. Con $320 dólares por persona.
              </NarratorBlock>
              <NarratorBlock>
                25.000 personas invirtieron sin saber si iban a volver a ver esa plata. Eso no
                era comercio. Era un acto político.
              </NarratorBlock>
            </CinematicChapter>

            <CinematicChapter index={1}>
              <ChapterTitle
                number={2}
                title="La Prueba"
                subtitle="2028 — 2032"
                epigraph="Gobernar no es mandar. Gobernar es escuchar."
              />
              <NarratorBlock>
                El movimiento decidió probar el modelo. Un municipio. La pregunta era simple
                y brutal: ¿puede gobernar gente que nunca gobernó?
              </NarratorBlock>
              <NarratorBlock emphasis="strong">
                Lo primero que hicieron fue escuchar.
              </NarratorBlock>
              <NarratorBlock>
                10.000 voces en el primer mes. Sueños, necesidades, declaraciones de ¡BASTA!
                Las señales se hicieron visibles en el mapa. Se agruparon alrededor de problemas.
                Agua. Seguridad. Escuelas.
              </NarratorBlock>
              <NarratorBlock>
                Demostraron que funciona. Una ciudad. Ahora la pregunta era: ¿puede escalar?
              </NarratorBlock>
            </CinematicChapter>

            <CinematicChapter index={2}>
              <ChapterTitle
                number={3}
                title="La Circunscripción"
                subtitle="2032 — 2036"
                epigraph="No fue un partido. Fue una forma de vivir que se expandió."
              />
              <NarratorBlock>
                De un municipio a una provincia. El efecto red. Pero la política provincial
                tiene depredadores más grandes. Narcos, sindicatos, la vieja guardia.
              </NarratorBlock>
              <NarratorBlock>
                Necesitaban articular lo que querían. No eslóganes — sistemas. No promesas —
                diseños idealizados con métricas y caminos concretos.
              </NarratorBlock>
              <NarratorBlock emphasis="strong">
                Tenían las ideas. Tenían el territorio. Ahora necesitaban ver cómo encajaba todo.
              </NarratorBlock>
            </CinematicChapter>

            <CinematicChapter index={3}>
              <ChapterTitle
                number={4}
                title="La Cabecera de Puente"
                subtitle="2036 — 2038"
                epigraph="Dieciséis planes. Un organismo vivo."
              />
              <NarratorBlock>
                Congreso Nacional. Bancas ganadas. El movimiento entró en la institución
                que estaba diseñado para transformar.
              </NarratorBlock>
              <NarratorBlock>
                16 planes. Cientos de dependencias. USD 283-526 mil millones. Un horizonte
                de 20 años. ¿Quién orquesta esto?
              </NarratorBlock>
              <NarratorBlock emphasis="strong">
                Por primera vez, la nación vio su propio rediseño como un sistema interconectado.
              </NarratorBlock>
            </CinematicChapter>

            <CinematicChapter index={4}>
              <ChapterTitle
                number={5}
                title="La Ejecución"
                subtitle="2038 — 2040+"
                epigraph="La crisis llegó. Pero esta vez, el pueblo tenía un plan."
              />
              <NarratorBlock emphasis="strong">
                La crisis. Como siempre en Argentina — cíclica, estructural, inevitable.
                Pero esta vez: plataforma, asambleas, gobierno alternativo, organización.
                Todo construido. Todo probado.
              </NarratorBlock>
              <NarratorBlock>
                72 horas. Esa era la ventana. La Regla de la Ventana: desplegá lo que tenés.
                Un ¡BASTA! a medio construir es infinitamente mejor que ningún plan.
              </NarratorBlock>
              <NarratorBlock emphasis="strong">
                Lo que pasó en Argentina entre 2026 y 2040 no tiene precedente. No porque
                fuera perfecto. Porque fue nuestro.
              </NarratorBlock>
            </CinematicChapter>
          </CinematicScroll>
        </div>
      </section>

      <Footer />
    </div>
  );
}
```

- [ ] **Step 2: Verify the file compiles**

Run: `cd SocialJusticeHub && npx tsc --noEmit 2>&1 | head -30`

Fix any type errors before proceeding.

- [ ] **Step 3: Commit**

```bash
git add client/src/pages/UnaRutaParaArgentina.tsx
git commit -m "feat: rewrite UnaRutaParaArgentina as consolidated page with 4 sections"
```

---

### Task 2: Update InitiativeCard link to use new route

**Files:**
- Modify: `client/src/components/iniciativas/InitiativeCard.tsx:19`

The card currently links to `/recursos/iniciativas/:slug`. Update to `/recursos/ruta/iniciativas/:slug`.

- [ ] **Step 1: Update the Link href**

In `client/src/components/iniciativas/InitiativeCard.tsx`, change line 19:

```tsx
// Old:
<Link href={`/recursos/iniciativas/${initiative.slug}`}>
// New:
<Link href={`/recursos/ruta/iniciativas/${initiative.slug}`}>
```

- [ ] **Step 2: Commit**

```bash
git add client/src/components/iniciativas/InitiativeCard.tsx
git commit -m "fix: update InitiativeCard link to new /recursos/ruta route"
```

---

### Task 3: Update IniciativaDetalle breadcrumbs and links

**Files:**
- Modify: `client/src/pages/IniciativaDetalle.tsx`

All internal links referencing `/recursos/iniciativas` must point to `/recursos/ruta` or `/recursos/ruta/iniciativas`.

- [ ] **Step 1: Update all link references**

In `client/src/pages/IniciativaDetalle.tsx`, replace all occurrences:

| Old | New |
|-----|-----|
| `href="/recursos/iniciativas"` | `href="/recursos/ruta"` |
| `href={\`/recursos/iniciativas/${initiative.slug}/documento\`}` | `href={\`/recursos/ruta/iniciativas/${initiative.slug}/documento\`}` |
| `href={\`/recursos/iniciativas/${related.slug}\`}` | `href={\`/recursos/ruta/iniciativas/${related.slug}\`}` |

Lines to change: 81, 179, 185, 241, 280.

- [ ] **Step 2: Commit**

```bash
git add client/src/pages/IniciativaDetalle.tsx
git commit -m "fix: update IniciativaDetalle links to /recursos/ruta"
```

---

### Task 4: Update IniciativaDocumento breadcrumbs and links

**Files:**
- Modify: `client/src/pages/IniciativaDocumento.tsx`

- [ ] **Step 1: Update all link references**

In `client/src/pages/IniciativaDocumento.tsx`, replace all occurrences:

| Old | New |
|-----|-----|
| `href="/recursos/iniciativas"` | `href="/recursos/ruta"` |
| `href={\`/recursos/iniciativas/${initiative.slug}\`}` | `href={\`/recursos/ruta/iniciativas/${initiative.slug}\`}` |

Lines to change: 60, 79, 116, 118.

- [ ] **Step 2: Commit**

```bash
git add client/src/pages/IniciativaDocumento.tsx
git commit -m "fix: update IniciativaDocumento links to /recursos/ruta"
```

---

### Task 5: Update InitiativeHero and PlanDetailDrawer links

**Files:**
- Modify: `client/src/components/iniciativas/InitiativeHero.tsx:89`
- Modify: `client/src/components/arquitecto/PlanDetailDrawer.tsx:420`

- [ ] **Step 1: Update InitiativeHero**

In `client/src/components/iniciativas/InitiativeHero.tsx` line 89, change:

```tsx
// Old:
href={`/recursos/iniciativas/${initiative.slug}/documento`}
// New:
href={`/recursos/ruta/iniciativas/${initiative.slug}/documento`}
```

- [ ] **Step 2: Update PlanDetailDrawer**

In `client/src/components/arquitecto/PlanDetailDrawer.tsx` line 420, change:

```tsx
// Old:
href={`/recursos/iniciativas/${plan.slug}`}
// New:
href={`/recursos/ruta/iniciativas/${plan.slug}`}
```

- [ ] **Step 3: Commit**

```bash
git add client/src/components/iniciativas/InitiativeHero.tsx client/src/components/arquitecto/PlanDetailDrawer.tsx
git commit -m "fix: update initiative links in InitiativeHero and PlanDetailDrawer"
```

---

### Task 6: Update other pages referencing old routes

**Files:**
- Modify: `client/src/pages/KitDePrensa.tsx:728-729`
- Modify: `client/src/pages/MisionDetalle.tsx:390`
- Modify: `client/src/pages/InitiativeDetail.tsx:177`

- [ ] **Step 1: Update KitDePrensa**

In `client/src/pages/KitDePrensa.tsx`, change lines 728-729:

```tsx
// Old:
{ label: 'Explorar El Arquitecto', href: '/recursos/el-arquitecto', icon: Brain },
{ label: 'Conocer las Iniciativas Estratégicas', href: '/recursos/iniciativas', icon: BookOpen },
// New:
{ label: 'Explorar Una Ruta Para Argentina', href: '/recursos/ruta', icon: Brain },
```

(Collapse both into a single link since they now live on the same page)

- [ ] **Step 2: Update MisionDetalle**

In `client/src/pages/MisionDetalle.tsx` line 390, change:

```tsx
// Old:
setLocation(`/recursos/iniciativas/${initiative.slug}`)
// New:
setLocation(`/recursos/ruta/iniciativas/${initiative.slug}`)
```

- [ ] **Step 3: Update InitiativeDetail**

In `client/src/pages/InitiativeDetail.tsx` line 177, change:

```tsx
// Old:
href={`/recursos/iniciativas/${initiative.slug}`}
// New:
href={`/recursos/ruta/iniciativas/${initiative.slug}`}
```

- [ ] **Step 4: Commit**

```bash
git add client/src/pages/KitDePrensa.tsx client/src/pages/MisionDetalle.tsx client/src/pages/InitiativeDetail.tsx
git commit -m "fix: update old route references in KitDePrensa, MisionDetalle, InitiativeDetail"
```

---

### Task 7: Update routing in App.tsx

**Files:**
- Modify: `client/src/App.tsx`

- [ ] **Step 1: Update lazy imports**

Remove the `ElArquitecto` and `IniciativasEstrategicas` lazy imports (lines 61, 67). The `UnaRutaParaArgentina` import stays.

```tsx
// DELETE these two lines:
const IniciativasEstrategicas = React.lazy(() => import("@/pages/IniciativasEstrategicas"));
const ElArquitecto = React.lazy(() => import("@/pages/ElArquitecto"));
```

- [ ] **Step 2: Update route definitions**

Replace the old routes (lines 101, 116-119) with the new structure:

```tsx
// DELETE:
<Route path="/una-ruta-para-argentina" component={UnaRutaParaArgentina} />
// ...
<Route path="/recursos/iniciativas" component={IniciativasEstrategicas} />
<Route path="/recursos/el-arquitecto" component={ElArquitecto} />
<Route path="/recursos/iniciativas/:slug/documento" component={IniciativaDocumento} />
<Route path="/recursos/iniciativas/:slug" component={IniciativaDetalle} />

// ADD (in the recursos routes section):
<Route path="/recursos/ruta" component={UnaRutaParaArgentina} />
<Route path="/recursos/ruta/iniciativas/:slug/documento" component={IniciativaDocumento} />
<Route path="/recursos/ruta/iniciativas/:slug" component={IniciativaDetalle} />

// ADD (legacy redirects, before the NotFound route):
<Route path="/una-ruta-para-argentina">{() => <Redirect to="/recursos/ruta" />}</Route>
<Route path="/recursos/el-arquitecto">{() => <Redirect to="/recursos/ruta" />}</Route>
<Route path="/recursos/iniciativas">{() => <Redirect to="/recursos/ruta" />}</Route>
<Route path="/recursos/iniciativas/:slug">{(params) => <Redirect to={`/recursos/ruta/iniciativas/${params.slug}`} />}</Route>
<Route path="/recursos/iniciativas/:slug/documento">{(params) => <Redirect to={`/recursos/ruta/iniciativas/${params.slug}/documento`} />}</Route>
```

- [ ] **Step 3: Verify compilation**

Run: `cd SocialJusticeHub && npx tsc --noEmit 2>&1 | head -30`

- [ ] **Step 4: Commit**

```bash
git add client/src/App.tsx
git commit -m "feat: update routing — consolidate ruta/arquitecto/iniciativas under /recursos/ruta"
```

---

### Task 8: Update Header navigation

**Files:**
- Modify: `client/src/components/Header.tsx`

- [ ] **Step 1: Remove nav items and darkHeroRoute**

In `client/src/components/Header.tsx`:

1. Remove from `darkHeroRoutes` array (line 38):
```tsx
// DELETE:
'/recursos/el-arquitecto',
```

2. Remove from `navItems` array (lines 88, 93):
```tsx
// DELETE these two entries:
{ label: 'Ruta', href: '/una-ruta-para-argentina' },
{ label: 'Arquitecto', href: '/recursos/el-arquitecto' },
```

- [ ] **Step 2: Commit**

```bash
git add client/src/components/Header.tsx
git commit -m "feat: remove Ruta and Arquitecto from header nav"
```

---

### Task 9: Update Resources.tsx link

**Files:**
- Modify: `client/src/pages/Resources.tsx:172`

- [ ] **Step 1: Update the Iniciativas card link**

In `client/src/pages/Resources.tsx` line 172, change:

```tsx
// Old:
<Link href="/recursos/iniciativas">
// New:
<Link href="/recursos/ruta">
```

- [ ] **Step 2: Commit**

```bash
git add client/src/pages/Resources.tsx
git commit -m "fix: update Resources iniciativas link to /recursos/ruta"
```

---

### Task 10: Delete obsolete pages

**Files:**
- Delete: `client/src/pages/ElArquitecto.tsx`
- Delete: `client/src/pages/IniciativasEstrategicas.tsx`

- [ ] **Step 1: Verify no remaining imports**

Run: `cd SocialJusticeHub && grep -r "ElArquitecto\|IniciativasEstrategicas" client/src/ --include="*.tsx" --include="*.ts"`

Should show zero results (after Task 7 removed the lazy imports).

- [ ] **Step 2: Delete the files**

```bash
rm client/src/pages/ElArquitecto.tsx client/src/pages/IniciativasEstrategicas.tsx
```

- [ ] **Step 3: Final verification**

Run: `cd SocialJusticeHub && npm run check`
Run: `cd SocialJusticeHub && npm run check:routes`

Both should pass.

- [ ] **Step 4: Commit**

```bash
git add -u client/src/pages/ElArquitecto.tsx client/src/pages/IniciativasEstrategicas.tsx
git commit -m "chore: delete ElArquitecto and IniciativasEstrategicas — absorbed into /recursos/ruta"
```

---

### Task 11: Visual test in browser

- [ ] **Step 1: Start dev server**

Run: `cd SocialJusticeHub && npm run dev`

- [ ] **Step 2: Test the new page**

Open `http://localhost:3001/recursos/ruta` and verify:
1. Hero section renders with narrative text and 3 anchor links
2. Clicking "Iniciativas Estratégicas" anchor scrolls to the section
3. Search and category filters work
4. Clicking an initiative card navigates to `/recursos/ruta/iniciativas/:slug`
5. Clicking "El Arquitecto" anchor scrolls to the section
6. All 10 tabs work and render their content
7. Clicking "Imaginá Qué Pasaría" anchor scrolls to the section
8. Cinematic scroll activates immersive mode (header hides)
9. Scrolling back up from cinematic section restores the header

- [ ] **Step 3: Test legacy redirects**

1. Navigate to `/una-ruta-para-argentina` → should redirect to `/recursos/ruta`
2. Navigate to `/recursos/el-arquitecto` → should redirect to `/recursos/ruta`
3. Navigate to `/recursos/iniciativas` → should redirect to `/recursos/ruta`

- [ ] **Step 4: Test navigation**

1. Header should NOT show "Ruta" or "Arquitecto" links
2. `/recursos` page should show the iniciativas card linking to `/recursos/ruta`
