import { useState, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Network,
  GitBranch,
  Route,
  DollarSign,
  BarChart3,
  Loader2,
  Activity,
  Zap,
  Shield,
  Edit3,
  Swords,
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

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

type TabId = 'organismo' | 'dependencias' | 'ruta' | 'presupuesto' | 'indicadores' | 'comando' | 'whatif' | 'validacion' | 'editor' | 'adversarial';

interface Tab {
  id: TabId;
  label: string;
  icon: typeof Network;
}

const TABS: Tab[] = [
  { id: 'organismo', label: 'Organismo', icon: Network },
  { id: 'dependencias', label: 'Dependencias', icon: GitBranch },
  { id: 'ruta', label: 'Ruta Critica', icon: Route },
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

function ComingSoon({ label }: { label: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-32 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
        <Loader2 className="w-7 h-7 text-white/30" />
      </div>
      <h3 className="text-xl font-semibold text-white/60 mb-2">{label}</h3>
      <p className="text-white/30 text-sm max-w-md">
        Esta vista esta en desarrollo. Pronto vas a poder explorar este modulo del ecosistema.
      </p>
    </motion.div>
  );
}

export default function ElArquitecto() {
  const [activeTab, setActiveTab] = useState<TabId>('organismo');

  useEffect(() => {
    document.title = 'El Arquitecto — Sistema de Planificacion Estrategica';
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />

      {/* Hero */}
      <section className="relative pt-28 pb-16 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-radial from-blue-600/8 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[300px] bg-gradient-radial from-emerald-500/5 via-transparent to-transparent" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-gradient-radial from-purple-500/5 via-transparent to-transparent" />
        </div>

        <div className="relative container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6">
              <Network className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-medium text-white/60 uppercase tracking-wider">
                Sistema de Planificacion Estrategica
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4">
              <span className="bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
                El Arquitecto
              </span>
            </h1>

            <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed">
              16 mandatos. Un organismo vivo. El pueblo gobierna, el gobierno ejecuta.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Tab Navigation */}
      <div className="sticky top-16 z-30 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-4">
          <nav className="flex overflow-x-auto scrollbar-hide gap-1 py-2" role="tablist">
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
                      layoutId="activeTabIndicator"
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
      </div>

      {/* Tab Content */}
      <main className="container mx-auto px-4 py-8 pb-20 min-h-[60vh]">
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
      </main>

      <Footer />
    </div>
  );
}
