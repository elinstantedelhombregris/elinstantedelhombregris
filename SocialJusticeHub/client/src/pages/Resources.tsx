import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { FileText, Video, GraduationCap, ArrowRight, Sparkles, BookOpen, PlayCircle, Rocket, Lightbulb } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import FluidBackground from '@/components/ui/FluidBackground';
import GlassCard from '@/components/ui/GlassCard';
import SmoothReveal from '@/components/ui/SmoothReveal';
import PowerCTA from '@/components/PowerCTA';
import { STRATEGIC_INITIATIVES } from '../../../shared/strategic-initiatives';
import { PHASE_META } from '@/lib/initiative-utils';

const Resources = () => {
  const [blogCount, setBlogCount] = useState(0);
  const [vlogCount, setVlogCount] = useState(0);
  const [coursesCount, setCoursesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Recursos - El Instante del Hombre Gris';
    window.scrollTo(0, 0);

    const fetchCounts = async () => {
      try {
        const statsResponse = await apiRequest('GET', '/api/blog/stats');
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setBlogCount(statsData.blog ?? 0);
          setVlogCount(statsData.vlog ?? 0);
        }
        
        const coursesResponse = await apiRequest('GET', '/api/courses?limit=1');
        if (coursesResponse.ok) {
          const coursesData = await coursesResponse.json();
          const totalCourses = coursesData.total || coursesData.courses?.length || 0;
          setCoursesCount(totalCourses);
        }
      } catch (error) {
        console.error("Error fetching stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, []);

  const resourceCards = [
    {
      title: 'Blog',
      subtitle: 'REFLEXIONES',
      description: 'Análisis extensos sobre visión de país, cultura cívica y pensamiento sistémico aplicado a la realidad argentina.',
      icon: FileText,
      href: '/recursos/blog',
      count: blogCount,
      gradient: 'from-blue-500/10 to-cyan-500/10',
      iconColor: 'bg-blue-100 text-blue-700',
      cta: 'Leer Artículos',
      delay: 0.2
    },
    {
      title: 'Vlog',
      subtitle: 'MULTIMEDIA',
      description: 'Conversaciones, cápsulas y piezas audiovisuales para bajar ideas complejas a ejemplos concretos y accionables.',
      icon: PlayCircle,
      href: '/recursos/vlog',
      count: vlogCount,
      gradient: 'from-purple-500/10 to-pink-500/10',
      iconColor: 'bg-purple-100 text-purple-700',
      cta: 'Ver Videos',
      delay: 0.3
    },
    {
      title: 'Rutas de Transformación',
      subtitle: 'FORMACIÓN',
      description: 'Recorridos estructurados para pasar de la comprensión teórica a la práctica personal y comunitaria.',
      icon: GraduationCap,
      href: '/recursos/guias-estudio',
      count: coursesCount,
      gradient: 'from-emerald-500/10 to-teal-500/10',
      iconColor: 'bg-emerald-100 text-emerald-700',
      cta: 'Explorar Rutas',
      delay: 0.4
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 theme-light">
      <FluidBackground className="opacity-30" />
      <Header />
      
      <main className="relative z-10 container mx-auto px-4 pt-24 pb-20">
        
        {/* Hero Section: Lucid Data Style aligned */}
        <section className="min-h-[40vh] flex flex-col justify-center items-center text-center mb-20">
          <SmoothReveal direction="up" className="mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm mb-8">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Centro de Conocimiento</span>
            </div>
          </SmoothReveal>
          
          <SmoothReveal direction="up" delay={0.1}>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold tracking-tight mb-6 text-slate-900">
              Recursos para <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Pasar a la Acción</span>
            </h1>
          </SmoothReveal>
          
          <SmoothReveal direction="up" delay={0.2} className="max-w-2xl">
            <p className="text-xl md:text-2xl text-slate-600 leading-relaxed font-light">
              Herramientas, historias y guías para entender mejor la realidad y convertir visión en práctica sostenida.
            </p>
          </SmoothReveal>
        </section>

        {/* Portal Cards: Unified Card Style */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-32">
          {resourceCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <SmoothReveal key={card.title} delay={card.delay} className="h-full">
                <Link href={card.href}>
                  <div className="h-full bg-white rounded-3xl border border-slate-200 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer overflow-hidden group flex flex-col relative">
                    {/* Hover Gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                    
                    <div className="p-8 relative z-10 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-8">
                        <div className={`p-4 rounded-2xl ${card.iconColor} shadow-inner`}>
                          <Icon className="w-8 h-8" />
                        </div>
                        <span className="text-4xl font-serif font-bold text-slate-100 group-hover:text-slate-200 transition-colors">
                          0{index + 1}
                        </span>
                      </div>
                      
                      <div className="space-y-3 mb-6">
                        <span className="text-xs font-bold tracking-[0.2em] text-slate-400 uppercase group-hover:text-slate-500">
                          {card.subtitle}
                        </span>
                        <h2 className="text-3xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                          {card.title}
                        </h2>
                      </div>
                      
                      <p className="text-lg text-slate-600 leading-relaxed mb-8 flex-1">
                        {card.description}
                      </p>

                      <div className="pt-6 border-t border-slate-100 flex items-center justify-between mt-auto">
                        <div>
                          <p className="text-2xl font-bold text-slate-900">{loading ? '...' : card.count}</p>
                          <p className="text-xs text-slate-500 font-medium uppercase">Disponibles</p>
                        </div>
                        <div className="flex items-center text-blue-600 font-bold text-sm tracking-wide group-hover:translate-x-2 transition-transform">
                          {card.cta} <ArrowRight className="w-4 h-4 ml-2" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </SmoothReveal>
            );
          })}
        </section>

        {/* Featured: Iniciativas Estratégicas */}
        <SmoothReveal delay={0.5} className="mb-32">
          <Link href="/recursos/iniciativas">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 cursor-pointer overflow-hidden group relative">
              {/* Hover gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center gap-8">
                {/* Left side: icon + text */}
                <div className="flex-1">
                  <div className="flex items-start gap-5 mb-6">
                    <div className="p-4 rounded-2xl bg-amber-100 text-amber-700 shadow-inner shrink-0">
                      <Rocket className="w-8 h-8" />
                    </div>
                    <div>
                      <span className="text-xs font-bold tracking-[0.2em] text-amber-600 uppercase block mb-2">
                        Política Pública
                      </span>
                      <h2 className="text-3xl md:text-4xl font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                        Iniciativas Estratégicas
                      </h2>
                    </div>
                  </div>

                  <p className="text-lg text-slate-600 leading-relaxed mb-6 max-w-2xl">
                    Propuestas de rediseño de país usando Diseño Idealizado: del problema a la solución ideal,
                    con un camino concreto y métricas para medir el avance. Cada iniciativa es un plan de acción completo.
                  </p>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{STRATEGIC_INITIATIVES.length}</p>
                      <p className="text-xs text-slate-500 font-medium uppercase">Propuestas</p>
                    </div>
                    <div className="flex items-center text-amber-600 font-bold text-sm tracking-wide group-hover:translate-x-2 transition-transform">
                      Ver Iniciativas <ArrowRight className="w-4 h-4 ml-2" />
                    </div>
                  </div>
                </div>

                {/* Right side: phase journey preview */}
                <div className="hidden md:flex flex-col items-center gap-0 shrink-0 pr-4">
                  {PHASE_META.map((phase, i) => {
                    const PhaseIcon = phase.icon;
                    return (
                      <div key={phase.key} className="flex flex-col items-center">
                        <div
                          className="w-11 h-11 rounded-full flex items-center justify-center border-2 bg-white shadow-sm"
                          style={{ borderColor: phase.accent }}
                        >
                          <PhaseIcon className="w-4 h-4" style={{ color: phase.accent }} />
                        </div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1 max-w-[70px] text-center leading-tight">
                          {phase.label}
                        </span>
                        {i < PHASE_META.length - 1 && (
                          <div className="w-px h-4 bg-slate-200 my-1" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Link>
        </SmoothReveal>

        {/* Featured Section - CTA */}
        <SmoothReveal delay={0.6} className="mb-20">
          <div className="relative rounded-[3rem] overflow-hidden bg-slate-900 text-white p-12 md:p-24 text-center shadow-2xl">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
               <div className="absolute -top-[50%] -left-[20%] w-[800px] h-[800px] rounded-full bg-blue-600 blur-[120px]" />
               <div className="absolute -bottom-[50%] -right-[20%] w-[800px] h-[800px] rounded-full bg-purple-600 blur-[120px]" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto space-y-8">
              <h2 className="text-4xl md:text-6xl font-serif font-bold tracking-tight leading-tight">
                Comprender, practicar, compartir.<br />
                <span className="text-blue-300">Ese es el ciclo de transformación</span>
              </h2>
              <p className="text-xl md:text-2xl text-slate-300 leading-relaxed font-light max-w-2xl mx-auto">
                No te quedes solo con la teoría. Sumate a la comunidad donde estas ideas se traducen en acciones reales.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-6 pt-8">
                 <PowerCTA 
                   text="SUMARME A LA COMUNIDAD" 
                   variant="primary" 
                   onClick={() => window.location.href = '/community'} 
                   size="lg" 
                   animate 
                   className="bg-white text-slate-900 hover:bg-slate-100"
                 />
                 <Link href="/recursos/guias-estudio">
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 text-lg px-8 py-6 rounded-full h-auto font-medium backdrop-blur-sm">
                    <BookOpen className="w-5 h-5 mr-3" />
                    Ver Caminos de Estudio
                  </Button>
                 </Link>
              </div>
            </div>
          </div>
        </SmoothReveal>

      </main>

      <Footer />
    </div>
  );
};

export default Resources;
