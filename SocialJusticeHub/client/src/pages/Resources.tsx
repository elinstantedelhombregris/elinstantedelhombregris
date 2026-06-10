import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { FileText, GraduationCap, ArrowRight, Sparkles, BookOpen, PlayCircle, Lightbulb, Compass } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import FluidBackground from '@/components/ui/FluidBackground';
import SmoothReveal from '@/components/ui/SmoothReveal';
import PowerCTA from '@/components/PowerCTA';
import { ensayos } from '@/content/ensayos.generated';

const Resources = () => {
  const [, navigate] = useLocation();
  const [blogCount, setBlogCount] = useState(0);
  const [vlogCount, setVlogCount] = useState(0);
  const [coursesCount, setCoursesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Recursos — ¡BASTA! | El Instante del Hombre Gris';
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

  // Ordenadas por nivel de compromiso: Mirá → Leé → Estudiá → Profundizá
  const resourceCards = [
    {
      title: 'Vlog',
      subtitle: 'MIRÁ · LO MÁS FÁCIL',
      description: 'Videos cortos que explican las ideas del movimiento con ejemplos concretos. El mejor punto de partida si tenés poco tiempo.',
      icon: PlayCircle,
      href: '/recursos/vlog',
      count: vlogCount,
      countLabel: 'Videos',
      gradient: 'from-purple-500/10 to-pink-500/10',
      iconColor: 'bg-purple-100 text-purple-700',
      cta: 'Ver videos',
      delay: 0.2
    },
    {
      title: 'Blog',
      subtitle: 'LEÉ · PARA PONERTE AL DÍA',
      description: 'Artículos para entender qué propone el movimiento, por qué, y qué está pasando ahora. Lecturas de 5 a 15 minutos.',
      icon: FileText,
      href: '/recursos/blog',
      count: blogCount,
      countLabel: 'Artículos',
      gradient: 'from-blue-500/10 to-cyan-500/10',
      iconColor: 'bg-blue-100 text-blue-700',
      cta: 'Leer artículos',
      delay: 0.3
    },
    {
      title: 'Guías de Estudio',
      subtitle: 'ESTUDIÁ · PASO A PASO',
      description: 'Cursos estructurados con lecciones y ejercicios para pasar de entender a practicar — en tu vida y en tu comunidad.',
      icon: GraduationCap,
      href: '/recursos/guias-estudio',
      count: coursesCount,
      countLabel: 'Guías',
      gradient: 'from-emerald-500/10 to-teal-500/10',
      iconColor: 'bg-emerald-100 text-emerald-700',
      cta: 'Empezar una guía',
      delay: 0.4
    },
    {
      title: 'Ensayos',
      subtitle: 'PROFUNDIZÁ · LECTURA LARGA',
      description: 'Textos largos para pensar la república desde abajo. El cuaderno abierto del Hombre Gris: ideas en borrador, dichas en serio.',
      icon: BookOpen,
      href: '/recursos/ensayos',
      count: ensayos.length,
      countLabel: 'Ensayos',
      gradient: 'from-amber-500/10 to-rose-500/10',
      iconColor: 'bg-amber-100 text-amber-700',
      cta: 'Leer ensayos',
      delay: 0.5
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
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold tracking-tight mb-6 text-slate-900">
              Todo lo que necesitás para <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">entender ¡BASTA!</span>
            </h1>
          </SmoothReveal>
          
          <SmoothReveal direction="up" delay={0.2} className="max-w-2xl">
            <p className="text-xl md:text-2xl text-slate-600 leading-relaxed font-light">
              Videos, artículos, guías y ensayos para entender de qué se trata el movimiento
              — y encontrar tu manera de sumarte.
            </p>
          </SmoothReveal>

          <SmoothReveal direction="up" delay={0.3} className="mt-10">
            <div className="flex flex-col sm:flex-row items-center gap-3 rounded-2xl bg-white border border-slate-200 shadow-sm px-6 py-4">
              <span className="inline-flex items-center gap-2 text-sm font-bold text-slate-700">
                <Compass className="w-4 h-4 text-blue-600" /> ¿Primera vez acá?
              </span>
              <span className="hidden sm:block text-slate-300">|</span>
              <Link href="/la-vision" className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                Empezá por La Visión (5 min) →
              </Link>
              <span className="hidden sm:block text-slate-300">·</span>
              <Link href="/recursos/ruta" className="text-sm font-semibold text-purple-600 hover:text-purple-700 transition-colors">
                O mirá los 22 planes de ejemplo →
              </Link>
            </div>
          </SmoothReveal>
        </section>

        {/* Portal Cards: Unified Card Style */}
        <p className="text-center text-sm font-bold tracking-[0.25em] text-slate-400 uppercase mb-8">
          Mirá → Leé → Estudiá → Profundizá
        </p>
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-32">
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
                        <span aria-hidden="true" className="text-4xl font-serif font-bold text-slate-200 group-hover:text-slate-300 transition-colors">
                          0{index + 1}
                        </span>
                      </div>
                      
                      <div className="space-y-3 mb-6">
                        <span className="text-xs font-bold tracking-[0.2em] text-slate-500 uppercase group-hover:text-slate-600">
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
                        <div aria-busy={loading}>
                          {(loading || card.count > 0) && (
                            <>
                              <p className="text-2xl font-bold text-slate-900">{loading ? '…' : card.count}</p>
                              <p className="text-xs text-slate-500 font-medium uppercase">{card.countLabel}</p>
                            </>
                          )}
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

        {/* Featured: Una Ruta Para Argentina — idealized design exercise */}
        <SmoothReveal delay={0.5} className="mb-32">
          <Link href="/recursos/ruta">
            <div className="relative rounded-[2.5rem] overflow-hidden cursor-pointer group transition-all duration-500 hover:-translate-y-1 shadow-2xl hover:shadow-purple-500/20 bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950 text-white">
              {/* Ambient glow */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-purple-600/20 blur-[120px]" />
                <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full bg-blue-600/10 blur-[100px]" />
              </div>

              <div className="relative z-10 p-8 md:p-14">
                <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
                  {/* Left: intro */}
                  <div className="flex-1">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 mb-6 backdrop-blur-sm">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-300" />
                      <span className="text-xs font-bold tracking-[0.2em] text-amber-100 uppercase">
                        ¿Y si rediseñáramos el país?
                      </span>
                    </div>

                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold tracking-tight mb-6 leading-[1.05]">
                      <span className="bg-gradient-to-br from-white via-purple-50 to-purple-300 bg-clip-text text-transparent">
                        Una Ruta Para Argentina
                      </span>
                    </h2>

                    <p className="text-lg text-slate-300 leading-relaxed max-w-xl mb-4">
                      ¿Y si empezáramos de cero? En lugar de mejorar lo que existe, imaginar
                      la solución ideal sin restricciones — y recién después trazar el camino
                      desde el presente hasta ese ideal.
                    </p>
                    <p className="text-sm text-slate-400 leading-relaxed max-w-xl mb-8">
                      Para mostrar que se puede, una sola persona hizo el ejercicio completo:
                      22 planes de ejemplo. No son promesas — son una invitación a hacerlo entre todos.
                    </p>

                    <div className="inline-flex items-center gap-2 text-purple-200 font-bold text-sm tracking-wide group-hover:translate-x-2 transition-transform">
                      Comenzar el Ejercicio
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Right: three-part journey */}
                  <div className="flex-1 w-full space-y-3">
                    {[
                      { num: '01', label: 'Iniciativas Estratégicas', sub: 'Propuestas de rediseño de país' },
                      { num: '02', label: 'El Arquitecto', sub: 'Qué se construye primero, qué cuesta y en qué orden' },
                      { num: '03', label: 'Imaginá Qué Pasaría', sub: 'Mini novela desde el futuro' },
                    ].map((step) => (
                      <div
                        key={step.num}
                        className="flex items-start gap-4 p-5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-sm group-hover:bg-white/[0.07] group-hover:border-white/15 transition-colors"
                      >
                        <span className="text-2xl font-serif font-bold text-purple-300/70 shrink-0 leading-none pt-0.5">
                          {step.num}
                        </span>
                        <div>
                          <h3 className="font-bold text-white text-base mb-1 leading-tight">
                            {step.label}
                          </h3>
                          <p className="text-sm text-slate-400 leading-relaxed">
                            {step.sub}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
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
                   onClick={() => navigate('/community')} 
                   size="lg" 
                   animate 
                   className="bg-white text-slate-900 hover:bg-slate-100"
                 />
                 <Link href="/recursos/guias-estudio">
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 text-lg px-8 py-6 rounded-full h-auto font-medium backdrop-blur-sm">
                    <BookOpen className="w-5 h-5 mr-3" />
                    Ver las Guías de Estudio
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
