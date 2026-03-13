import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Lightbulb, ChevronRight, Search } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FluidBackground from '@/components/ui/FluidBackground';
import SmoothReveal from '@/components/ui/SmoothReveal';
import InitiativeCard from '@/components/iniciativas/InitiativeCard';
import { INITIATIVE_CATEGORIES } from '@/lib/initiative-utils';
import { STRATEGIC_INITIATIVES } from '../../../shared/strategic-initiatives';
import type { InitiativeCategory } from '../../../shared/strategic-initiatives';

export default function IniciativasEstrategicas() {
  const [selectedCategory, setSelectedCategory] = useState<InitiativeCategory | 'todas'>('todas');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    document.title = 'Iniciativas Estratégicas - El Instante del Hombre Gris';
    window.scrollTo(0, 0);
  }, []);

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
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 theme-light">
      <FluidBackground className="opacity-30" />
      <Header />

      <main className="relative z-10 container mx-auto px-4 pt-24 pb-20">
        {/* Breadcrumb */}
        <SmoothReveal direction="up" className="mb-8">
          <nav className="flex items-center gap-2 text-sm text-slate-500">
            <Link href="/recursos" className="hover:text-blue-600 transition-colors">Recursos</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-slate-900 font-medium">Iniciativas Estratégicas</span>
          </nav>
        </SmoothReveal>

        {/* Hero */}
        <section className="max-w-4xl mx-auto text-center mb-16">
          <SmoothReveal direction="up" className="mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm mb-8">
              <Lightbulb className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Diseño Idealizado</span>
            </div>
          </SmoothReveal>

          <SmoothReveal direction="up" delay={0.1}>
            <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tight mb-6 text-slate-900">
              Iniciativas{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">
                Estratégicas
              </span>
            </h1>
          </SmoothReveal>

          <SmoothReveal direction="up" delay={0.2}>
            <p className="text-xl md:text-2xl text-slate-600 leading-relaxed font-light max-w-3xl mx-auto">
              Propuestas detalladas de rediseño de país. Cada iniciativa presenta el problema,
              la proyección sin cambios, el diseño ideal y un camino concreto con indicadores medibles.
            </p>
          </SmoothReveal>
        </section>

        {/* Search + Filters */}
        <SmoothReveal direction="up" delay={0.3} className="mb-12">
          <div className="max-w-4xl mx-auto space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar iniciativas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition-all shadow-sm"
              />
            </div>

            {/* Category pills */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('todas')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === 'todas'
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
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
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <meta.icon className="w-3.5 h-3.5" />
                    {meta.label} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        </SmoothReveal>

        {/* Initiative Cards Grid */}
        {filtered.length > 0 ? (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {filtered.map((initiative, index) => (
              <InitiativeCard
                key={initiative.slug}
                initiative={initiative}
                index={index}
                delay={0.1 * index}
              />
            ))}
          </section>
        ) : (
          <SmoothReveal direction="up" className="text-center py-20">
            <div className="max-w-md mx-auto">
              <Lightbulb className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-serif font-bold text-slate-700 mb-2">
                No se encontraron iniciativas
              </h3>
              <p className="text-slate-500">
                Probá ajustando los filtros o la búsqueda.
              </p>
            </div>
          </SmoothReveal>
        )}

        {/* Methodology callout */}
        <SmoothReveal delay={0.5} className="mt-24">
          <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-lg p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="p-4 rounded-2xl bg-amber-100 text-amber-700 shrink-0">
                <Lightbulb className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-serif font-bold text-slate-900 mb-3">
                  ¿Qué es el Diseño Idealizado?
                </h3>
                <p className="text-slate-600 leading-relaxed mb-4">
                  El Diseño Idealizado es una metodología creada por Russell Ackoff, pionero del pensamiento sistémico.
                  En lugar de mejorar lo que existe, propone diseñar desde cero el sistema ideal y luego trabajar
                  hacia atrás para crear un camino viable desde el presente hasta ese ideal.
                </p>
                <p className="text-slate-600 leading-relaxed">
                  Cada iniciativa sigue 5 fases: identificar el problema, proyectar qué pasa sin cambios,
                  diseñar la solución ideal sin restricciones, trazar el camino desde la meta hacia el presente,
                  y definir indicadores para medir el avance.
                </p>
              </div>
            </div>
          </div>
        </SmoothReveal>
      </main>

      <Footer />
    </div>
  );
}
