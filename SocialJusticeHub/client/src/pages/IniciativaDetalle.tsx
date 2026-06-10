import { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useParams } from 'wouter';
import { ChevronRight, ArrowLeft, ExternalLink, FileText, Download, Users } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SmoothReveal from '@/components/ui/SmoothReveal';
import PowerCTA from '@/components/PowerCTA';
import InitiativeHero from '@/components/iniciativas/InitiativeHero';
import InitiativePhaseNav from '@/components/iniciativas/InitiativePhaseNav';
import ProblemSection from '@/components/iniciativas/ProblemSection';
import ProjectionSection from '@/components/iniciativas/ProjectionSection';
import IdealDesignSection from '@/components/iniciativas/IdealDesignSection';
import BackwardTimeline from '@/components/iniciativas/BackwardTimeline';
import KPIDashboard from '@/components/iniciativas/KPIDashboard';
import { PHASE_META, MISSION_META } from '@/lib/initiative-utils';
import { STRATEGIC_INITIATIVES } from '../../../shared/strategic-initiatives';
import type { MissionSlug } from '../../../shared/strategic-initiatives';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import {
  GLASS_CARD,
  GLASS_CARD_HOVER,
  ACCENT_BUTTON,
} from '@/lib/design-tokens';

export default function IniciativaDetalle() {
  const params = useParams<{ slug: string }>();
  const [activePhase, setActivePhase] = useState('elProblema');
  const [showPhaseNav, setShowPhaseNav] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const initiative = STRATEGIC_INITIATIVES.find(i => i.slug === params.slug);

  useEffect(() => {
    if (initiative) {
      document.title = `${initiative.title} - Iniciativas Estratégicas`;
    }
    window.scrollTo(0, 0);
  }, [initiative]);

  // Intersection Observer for phase tracking
  useEffect(() => {
    const phaseKeys = PHASE_META.map(p => p.key);
    const observers: IntersectionObserver[] = [];

    phaseKeys.forEach((key) => {
      const el = document.getElementById(`phase-${key}`);
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActivePhase(key);
          }
        },
        { rootMargin: '-30% 0px -60% 0px' }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach(o => o.disconnect());
  }, [initiative]);

  // Show phase nav after scrolling past hero
  useEffect(() => {
    const handleScroll = () => {
      setShowPhaseNav(window.scrollY > window.innerHeight * 0.6);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollToContent = useCallback(() => {
    contentRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  if (!initiative) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <Header />
        <main className="container mx-auto px-4 pt-32 pb-20 text-center">
          <h1 className="text-3xl font-serif font-bold mb-4">Iniciativa no encontrada</h1>
          <p className="text-white/60 mb-8">La iniciativa que buscás no existe o fue movida.</p>
          <Link href="/recursos/ruta#iniciativas" className="text-[#9D85E8] hover:underline font-medium">
            ← Volver a Iniciativas Estratégicas
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const relatedInitiatives = initiative.relatedInitiativeSlugs
    ?.map(slug => STRATEGIC_INITIATIVES.find(i => i.slug === slug))
    .filter(Boolean) ?? [];

  const missionMeta = initiative.missionSlug ? MISSION_META[initiative.missionSlug] : null;

  // Find the Círculos post for this mission (to link "Sumate")
  const { data: missionPost } = useQuery({
    queryKey: ['mission-post', initiative.missionSlug],
    queryFn: async () => {
      if (!initiative.missionSlug) return null;
      const response = await apiRequest('GET', '/api/community?type=mission');
      if (!response.ok) return null;
      const posts = await response.json();
      return posts.find((p: any) => p.missionSlug === initiative.missionSlug) ?? null;
    },
    enabled: !!initiative.missionSlug,
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />

      {/* Phase Nav */}
      <InitiativePhaseNav activePhase={activePhase} visible={showPhaseNav} />

      {/* Hero */}
      <InitiativeHero initiative={initiative} onScrollToContent={handleScrollToContent} />

      {/* Phase Sections */}
      <div ref={contentRef}>
        <ProblemSection data={initiative.elProblema} />
        <ProjectionSection data={initiative.quePasaSiNoCambiamos} />
        <IdealDesignSection data={initiative.elDisenoIdeal} />
        <BackwardTimeline overview={initiative.elCamino.overview} steps={initiative.elCamino.steps} />
        <KPIDashboard kpis={initiative.kpis} />
      </div>

      {/* Sources */}
      {initiative.sources && initiative.sources.length > 0 && (
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 lg:pl-24">
            <SmoothReveal direction="up">
              <h3 className="text-2xl font-serif font-bold text-white mb-6">Fuentes</h3>
              <ul className="space-y-3">
                {initiative.sources.map((source, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-white/30 mt-1">•</span>
                    {source.url ? (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#9D85E8] hover:underline inline-flex items-center gap-1"
                      >
                        {source.title}
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <span className="text-white/70">{source.title}</span>
                    )}
                  </li>
                ))}
              </ul>
            </SmoothReveal>
          </div>
        </section>
      )}

      {/* Full Document CTA */}
      {initiative.documentFile && (
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 lg:pl-24">
            <SmoothReveal direction="up">
              <div className={`relative overflow-hidden p-8 md:p-12 ${GLASS_CARD}`}>
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#7D5BDE]/[0.05] blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-slate-300 shrink-0">
                    <FileText className="w-8 h-8" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-serif font-bold text-white mb-2">
                      Documento Completo
                    </h3>
                    <p className="text-white/60 leading-relaxed">
                      Este resumen presenta las 5 fases del diseño idealizado. El documento estratégico completo contiene el análisis detallado, las tablas de datos, los mecanismos de implementación y las proyecciones fiscales.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full md:w-auto">
                    <Link href={`/recursos/ruta/iniciativas/${initiative.slug}/documento`}>
                      <button className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all w-full sm:w-auto ${ACCENT_BUTTON}`}>
                        <FileText className="w-4 h-4" />
                        Leer Documento
                      </button>
                    </Link>
                    <Link href={`/recursos/ruta/iniciativas/${initiative.slug}/documento`}>
                      <button className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/15 text-white/70 hover:bg-white/5 text-sm font-medium transition-colors w-full sm:w-auto">
                        <Download className="w-4 h-4" />
                        Descargar PDF
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </SmoothReveal>
          </div>
        </section>
      )}

      {/* Mission CTA — Link to Los Círculos */}
      {missionMeta && missionPost && (
        <section className="py-12">
          <div className="max-w-4xl mx-auto px-4 lg:pl-24">
            <SmoothReveal direction="up">
              <div className={`p-6 md:p-8 ${GLASS_CARD}`}>
                <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-white/5 border border-white/10">
                    <missionMeta.icon className="w-6 h-6 text-[#9D85E8]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#9D85E8] mb-1">
                      Misión {missionMeta.number}: {missionMeta.shortLabel}
                    </p>
                    <h3 className="text-lg font-serif font-bold text-white mb-1">
                      Este plan forma parte de una misión más grande
                    </h3>
                    <p className="text-sm text-white/60">
                      Sumate al círculo de reconstrucción de esta misión. Hay tareas concretas, hitos por cumplir y gente que ya está poniendo el cuerpo.
                    </p>
                  </div>
                  <Link href={`/community/${missionPost.id}`}>
                    <button className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all shrink-0 ${ACCENT_BUTTON}`}>
                      <Users className="w-4 h-4" />
                      Sumate a la misión
                    </button>
                  </Link>
                </div>
              </div>
            </SmoothReveal>
          </div>
        </section>
      )}

      {/* Related Initiatives */}
      {relatedInitiatives.length > 0 && (
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 lg:pl-24">
            <SmoothReveal direction="up">
              <h3 className="text-2xl font-serif font-bold text-white mb-6">Iniciativas Relacionadas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {relatedInitiatives.map((related) => related && (
                  <Link key={related.slug} href={`/recursos/ruta/iniciativas/${related.slug}`}>
                    <div className={`p-5 cursor-pointer ${GLASS_CARD} ${GLASS_CARD_HOVER}`}>
                      <h4 className="font-serif font-bold text-white mb-1">{related.title}</h4>
                      <p className="text-sm text-white/50 line-clamp-2">{related.summary}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </SmoothReveal>
          </div>
        </section>
      )}

      {/* Footer CTA */}
      <SmoothReveal delay={0.2}>
        <section className="relative overflow-hidden py-20 md:py-28">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-[#7D5BDE]/[0.06] blur-[120px]" />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto px-4 text-center space-y-8">
            <h2 className="text-4xl md:text-6xl font-serif font-bold tracking-tight leading-tight text-white">
              Esta propuesta necesita<br />
              <span className="text-[#9D85E8]">tu voz</span>
            </h2>
            <p className="text-xl text-white/50 leading-relaxed font-light max-w-2xl mx-auto">
              Las ideas sin acción son sueños. Las acciones sin ideas son caos.
              Sumate a la conversación y ayudá a construir el camino.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <PowerCTA
                text="SUMARME A LA COMUNIDAD"
                variant="primary"
                onClick={() => window.location.href = '/community'}
                size="lg"
                animate
                className="bg-[#7D5BDE] hover:bg-[#8D6FE4] text-white"
              />
              <Link href="/recursos/ruta#iniciativas">
                <button className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-white/15 text-white/70 hover:bg-white/5 text-lg font-medium backdrop-blur-sm transition-all">
                  <ArrowLeft className="w-5 h-5" />
                  Ver Todas las Iniciativas
                </button>
              </Link>
            </div>
          </div>
        </section>
      </SmoothReveal>

      <Footer />
    </div>
  );
}
