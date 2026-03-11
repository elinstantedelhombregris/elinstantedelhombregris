import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  Eye,
  Users,
  AlertTriangle,
  Sparkles,
  Globe,
  Zap,
  TrendingUp,
  Brain,
  MapPin,
  Rocket,
  Scan,
  Activity
} from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import ShockStats from '@/components/ShockStats';
import PowerCTA from '@/components/PowerCTA';
import CommitmentModal from '@/components/CommitmentModal';
import NextStepCard from '@/components/NextStepCard';
import SystemHierarchy from '@/components/SystemHierarchy';

const LaVision = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showCommitmentModal, setShowCommitmentModal] = useState(false);
  const [activePillar, setActivePillar] = useState<number | null>(null);

  const { data: platformStats } = useQuery<{
    totalMembers: number;
    activeMembers: number;
    newMembersThisWeek: number;
    totalPosts: number;
    totalDreams: number;
    projectPosts: number;
    jobPosts: number;
    resourcePosts: number;
  }>({ queryKey: ['/api/stats'] });

  const { data: dreams = [] } = useQuery<Array<{
    id: number;
    userId: number | null;
    location: string | null;
    type: string;
  }>>({ queryKey: ['/api/dreams'] });

  const realStats = useMemo(() => {
    const uniqueVoices = new Set(dreams.filter(d => d.userId).map(d => d.userId)).size;
    const uniqueLocations = new Set(dreams.filter(d => d.location).map(d => d.location)).size;
    return { uniqueVoices, uniqueLocations, totalContributions: dreams.length };
  }, [dreams]);

  const handleCommitment = (commitmentData: any) => {
    console.log('Commitment made:', commitmentData);
    setShowCommitmentModal(false);
  };

  useEffect(() => {
    setIsVisible(true);
    window.scrollTo(0, 0);
    document.title = 'La Visión - ¡BASTA! | Transformar Argentina Juntos';
  }, []);

  const processSteps = [
    {
      step: 1,
      title: "Diagnosticar lo Real",
      subtitle: "Escuchar la vida cotidiana en vivo",
      description: "Recolectamos datos voluntarios sobre cómo viven, sienten y sueñan las personas. La nación se mira en el espejo de su gente.",
      icon: <Eye className="w-8 h-8" />,
      color: "text-blue-400",
      border: "border-blue-500/30",
      bg: "bg-blue-500/10",
      details: [
        "Mapeamos bienestar financiero, mental, relacional y territorial",
        "Detectamos tensiones recurrentes y capacidades disponibles",
        "Convertimos testimonios en datos accionables",
        "Regresamos a cada persona un diagnóstico útil"
      ]
    },
    {
      step: 2,
      title: "Sincronizar la Visión",
      subtitle: "Un mismo horizonte compartido",
      description: "Traducimos los diagnósticos en relatos deseados. La visión se vuelve inevitable porque nace de millones de coincidencias.",
      icon: <Sparkles className="w-8 h-8" />,
      color: "text-purple-400",
      border: "border-purple-500/30",
      bg: "bg-purple-500/10",
      details: [
        "Identificamos principios comunes y aspiraciones repetidas",
        "Diseñamos un lenguaje de país sin ideologías",
        "Priorizamos bienestar integral y dignidad económica",
        "Publicamos metas claras y verificables"
      ]
    },
    {
      step: 3,
      title: "Cartografiar Conexiones",
      subtitle: "Del dato al mapa vivo",
      description: "Construimos tableros que muestran interdependencias entre personas, comunidades y gobiernos.",
      icon: <MapPin className="w-8 h-8" />,
      color: "text-green-400",
      border: "border-green-500/30",
      bg: "bg-green-500/10",
      details: [
        "Detectamos puntos de apalancamiento locales",
        "Coordinamos recursos entre actores públicos y civiles",
        "Generamos alertas tempranas para territorios críticos",
        "Diseñamos rutas de acción que cualquier nivel puede replicar"
      ]
    },
    {
      step: 4,
      title: "Ejecutar con Coherencia",
      subtitle: "Micro y macro alineados",
      description: "Cada compromiso individual alimenta políticas, proyectos y alianzas. Medimos en tiempo real y ajustamos.",
      icon: <Rocket className="w-8 h-8" />,
      color: "text-orange-400",
      border: "border-orange-500/30",
      bg: "bg-orange-500/10",
      details: [
        "Acompañamos proyectos ciudadanos con herramientas concretas",
        "Compartimos métricas abiertas para aprender rápido",
        "Escalamos lo que funciona y cuidamos lo emergente",
        "Celebramos y difundimos cada avance colectivo"
      ]
    }
  ];

  const visionStats = [
    {
      id: 'voices',
      label: 'Voces escuchadas',
      value: realStats.uniqueVoices,
    },
    {
      id: 'contributions',
      label: 'Contribuciones',
      value: realStats.totalContributions,
    },
    {
      id: 'territories',
      label: 'Territorios',
      value: realStats.uniqueLocations,
    }
  ];

  const diagnosticPillars = [
    {
      title: "Diagnosticar el estado real",
      description: "Escuchamos la vida cotidiana sin filtros para entender qué tan lejos estamos de la Argentina deseada.",
      detail: "Lo cotidiano se convierte en información estratégica.",
      icon: <AlertTriangle className="w-6 h-6 text-amber-500" />,
      stats: `${realStats.uniqueLocations} localidades`
    },
    {
      title: "Revelar patrones invisibles",
      description: "Analizamos datos y relatos para mostrar dinámicas que los modelos tradicionales no ven.",
      detail: "Mostramos cómo se concatenan los problemas.",
      icon: <Scan className="w-6 h-6 text-indigo-500" />,
      stats: `${realStats.totalContributions} datos`
    },
    {
      title: "Mostrar interdependencia",
      description: "Traducimos cómo decisiones personales y públicas se afectan mutuamente.",
      detail: "Historias y métricas en una sola narrativa.",
      icon: <Globe className="w-6 h-6 text-emerald-500" />,
      stats: "Global & Local"
    },
    {
      title: "Detectar brechas sistémicas",
      description: "Identificamos nodos donde falta articulación, inversión o acompañamiento.",
      detail: "El mapa señala dónde intervenir primero.",
      icon: <Activity className="w-6 h-6 text-blue-500" />,
      stats: "En curso"
    }
  ];

  const pulseStats = [
    {
      id: 'members',
      label: 'Miembros de la comunidad',
      value: platformStats?.totalMembers ?? 0,
      unit: '',
      trend: 'up' as const,
      color: 'purple' as const,
      icon: <Users className="w-6 h-6" />,
      description: 'Personas que se sumaron al movimiento'
    },
    {
      id: 'projects',
      label: 'Proyectos ciudadanos',
      value: platformStats?.totalPosts ?? 0,
      unit: '',
      trend: 'up' as const,
      color: 'green' as const,
      icon: <Zap className="w-6 h-6" />,
      description: 'Iniciativas creadas por la comunidad'
    },
    {
      id: 'newThisWeek',
      label: 'Nuevos esta semana',
      value: platformStats?.newMembersThisWeek ?? 0,
      unit: '',
      trend: 'up' as const,
      color: 'orange' as const,
      icon: <TrendingUp className="w-6 h-6" />,
      description: 'Personas que se unieron en los últimos 7 días'
    }
  ];

  return (
    <div className={`min-h-screen bg-[#0a0a0a] text-slate-200 selection:bg-blue-500/30 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <Header />
      <main className="overflow-hidden">

        {/* Hero Section: Chaos to Order */}
        <section className="relative min-h-screen flex items-center justify-center bg-[#0a0a0a] overflow-hidden pt-20">
          {/* Blueprint Grid Background */}
          <div className="absolute inset-0 opacity-20" 
               style={{ backgroundImage: 'linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
          </div>
          
          {/* Floating Particles (Simulated Chaos) */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-blue-500/50 rounded-full"
                initial={{ 
                  x: Math.random() * 100 + "%", 
                  y: Math.random() * 100 + "%",
                  opacity: 0
                }}
                animate={{ 
                  x: Math.random() * 100 + "%", 
                  y: Math.random() * 100 + "%",
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0]
                }}
                transition={{ 
                  duration: Math.random() * 10 + 10, 
                  repeat: Infinity,
                  ease: "linear" 
                }}
              />
            ))}
          </div>

          <div className="container-content relative z-10">
            <div className="max-w-5xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-900/20 border border-blue-500/30 text-blue-400 text-sm font-mono mb-8 tracking-widest uppercase">
                  <Scan className="w-4 h-4 animate-pulse" />
                  El diseño que Argentina necesita
                </div>
                
                <h1 className="heading-hero mb-8">
                  <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-500">
                    Del Caos al Orden
                  </span>
                  <span className="block text-2xl md:text-4xl font-sans font-light text-slate-400 mt-4 tracking-wide">
                    Diseñando la Argentina del Futuro
                  </span>
                </h1>

                <p className="text-xl md:text-2xl text-slate-400/80 max-w-3xl mx-auto mb-12 leading-relaxed">
                  Argentina no es un problema sin solución. Es un sistema mal diseñado.
                  <br/>
                  Nuestra plataforma convierte el ruido de millones de voces en un plano maestro de acción colectiva.
                </p>

                <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
                  <PowerCTA
                    text="EMPEZAR MI DIAGNÓSTICO"
                    variant="primary"
                    onClick={() => setShowCommitmentModal(true)}
                    size="lg"
                    animate={true}
                  />
                  <PowerCTA
                    text="VER LAS 4 FASES"
                    variant="secondary"
                    onClick={() => window.scrollTo({ top: 1000, behavior: 'smooth' })}
                    size="lg"
                    animate={true}
                  />
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto border-t border-white/10 pt-8">
                  {visionStats.map((stat) => (
                    <div key={stat.id} className="text-center">
                      <div className="text-2xl md:text-3xl font-bold text-white font-mono">
                        {stat.value.toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Interactive Diagnostic Scanner */}
        <section className="section-spacing bg-[#0f1116] border-t border-white/5">
          <div className="container-content">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div>
                  <span className="text-blue-500 font-mono text-sm tracking-widest uppercase mb-4 block">Fase 1: Diagnóstico</span>
                  <h2 className="heading-section mb-6">La vida cotidiana se vuelve mapa nacional</h2>
                  <p className="text-body mb-8">
                    Cada diagnóstico personal alimenta un modelo que permite detectar brechas sistémicas, visibilizar patrones invisibles y diseñar soluciones que incluyen a todos.
                  </p>
                  
                  <div className="space-y-4">
                    {diagnosticPillars.map((pillar, index) => (
                      <motion.div 
                        key={index}
                        className={`p-4 rounded-xl border transition-all cursor-pointer ${activePillar === index ? 'bg-blue-900/20 border-blue-500/50' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                        onMouseEnter={() => setActivePillar(index)}
                        onMouseLeave={() => setActivePillar(null)}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${activePillar === index ? 'bg-blue-500/20 text-blue-400' : 'bg-white/10 text-slate-400'}`}>
                            {pillar.icon}
                          </div>
                          <div>
                            <h3 className={`font-bold ${activePillar === index ? 'text-white' : 'text-slate-300'}`}>{pillar.title}</h3>
                            <AnimatePresence>
                              {activePillar === index && (
                                <motion.p 
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="text-sm text-blue-200 mt-2"
                                >
                                  {pillar.description}
                                </motion.p>
                              )}
                            </AnimatePresence>
                          </div>
                          <div className="ml-auto font-mono text-xs text-slate-500">
                            {pillar.stats}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Scanner Visual */}
                <div className="relative aspect-square bg-blue-900/5 rounded-full border border-blue-500/20 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 border border-blue-500/10 rounded-full m-12"></div>
                  <div className="absolute inset-0 border border-blue-500/10 rounded-full m-24"></div>
                  <div className="absolute inset-0 border border-blue-500/10 rounded-full m-36"></div>
                  
                  {/* Scanning Line */}
                  <motion.div 
                    className="absolute w-full h-[2px] bg-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.8)]"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  />
                  
                  {/* Central Node */}
                  <div className="relative z-10 bg-[#0a0a0a] p-8 rounded-full border border-blue-500/30 shadow-[0_0_50px_rgba(59,130,246,0.2)]">
                    <Brain className="w-12 h-12 text-blue-400" />
                  </div>

                  {/* Floating Data Points */}
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-blue-400 rounded-full"
                      style={{
                        top: '50%',
                        left: '50%',
                      }}
                      animate={{
                        x: Math.cos(i * 45 * (Math.PI / 180)) * 140,
                        y: Math.sin(i * 45 * (Math.PI / 180)) * 140,
                        opacity: [0.2, 1, 0.2],
                        scale: [1, 1.2, 1]
                      }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MANIFESTO II: System Engineering */}
        <section className="py-24 bg-[#0a0a0a] relative overflow-hidden">
          {/* Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f0a_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f0a_1px,transparent_1px)] bg-[size:14px_24px]" />
          
          <div className="container-content relative z-10">
            <div className="max-w-5xl mx-auto mb-16 text-center">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-8">
                Ingeniería de Sistemas Humanos
              </h2>
              <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
                El problema argentino es un error de diseño: dejamos que un subsistema (la política) 
                decida el propósito de todo el sistema (el país). Es hora de invertir la pirámide.
              </p>
            </div>

            <SystemHierarchy />

            <div className="mt-20 grid md:grid-cols-3 gap-8 text-center">
              {[
                { title: "El Ciudadano", action: "DEFINE", desc: "Establece el propósito y el 'qué'." },
                { title: "El Estado", action: "ADMINISTRA", desc: "Gestiona los recursos para ese fin." },
                { title: "La Política", action: "EJECUTA", desc: "Implementa las soluciones técnicas." }
              ].map((item, i) => (
                <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <h3 className="text-slate-500 text-sm uppercase tracking-widest mb-2">{item.title}</h3>
                  <p className="text-2xl font-bold text-white mb-2">{item.action}</p>
                  <p className="text-slate-400 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* The Blueprint Timeline */}
        <section className="section-spacing bg-[#0a0a0a] relative">
          {/* Energy Line Connector */}
          <div className="absolute top-0 bottom-0 left-8 md:left-1/2 w-px bg-gradient-to-b from-transparent via-blue-900 to-transparent -z-10" />

          <div className="container-content">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-20">
                <h2 className="heading-section mb-6">
                  El <span className="text-blue-500">Blueprint</span> de Transformación
                </h2>
                <p className="text-body max-w-2xl mx-auto">
                  Cuatro fases secuenciales para rediseñar el sistema operativo de la nación.
                </p>
              </div>

              <div className="space-y-24">
                {processSteps.map((step, index) => (
                  <motion.div 
                    key={step.step}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className={`flex flex-col md:flex-row gap-8 items-center ${index % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}
                  >
                    {/* Content Card */}
                    <div className="flex-1">
                      <div className={`card-unified p-8 border-l-4 ${step.border.replace('border', 'border-l')}`}>
                        <div className="flex items-center gap-4 mb-6">
                          <div className={`w-12 h-12 rounded-xl ${step.bg} flex items-center justify-center ${step.color} border ${step.border}`}>
                            {step.icon}
                          </div>
                          <div className="text-sm font-mono text-slate-500 uppercase tracking-widest">
                            Fase 0{step.step}
                          </div>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">{step.title}</h3>
                        <p className="text-blue-200 font-medium mb-4">{step.subtitle}</p>
                        <p className="text-slate-400 mb-6 leading-relaxed">{step.description}</p>
                        
                        <ul className="space-y-3">
                          {step.details.map((detail, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-sm text-slate-300">
                              <div className={`w-1.5 h-1.5 rounded-full mt-2 ${step.bg.replace('bg-', 'bg-')}`} />
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Timeline Node */}
                    <div className="relative flex items-center justify-center w-16 h-16">
                      <div className={`w-4 h-4 rounded-full ${step.bg.replace('bg-', 'bg-')} shadow-[0_0_20px_currentColor] z-10`} />
                      <div className="absolute w-16 h-16 border border-white/10 rounded-full animate-ping opacity-20" />
                    </div>

                    {/* Empty Spacer for grid balance */}
                    <div className="flex-1 hidden md:block" />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Living Pulse Metrics */}
        <section className="section-spacing bg-gradient-to-b from-[#0a0a0a] via-blue-900/10 to-[#0a0a0a]">
          <div className="container-content">
            <div className="max-content-width text-center mb-10">
              <p className="text-blue-500 font-mono text-sm tracking-widest uppercase mb-4">Pulso en Tiempo Real</p>
              <h2 className="heading-section mb-4">Datos que se transforman en decisiones</h2>
              <p className="text-body max-w-3xl mx-auto">
                Cada aporte ciudadano alimenta tableros que muestran señales sistémicas, proyectos articulados y políticas alineadas con la visión compartida.
              </p>
            </div>

            <ShockStats
              stats={pulseStats}
              title="Impacto del Modelo Vivo"
              variant="dark"
            />
          </div>
        </section>

        {/* Next Step */}
        <NextStepCard
          title="Una Nueva Visión Necesita una Nueva Cultura"
          description="Conocés la visión. Ahora descubrí al Hombre Gris: la identidad colectiva que despierta para construir la Argentina que soñamos."
          href="/el-instante-del-hombre-gris"
          gradient="from-gray-900 to-blue-900"
          icon={<Eye className="w-5 h-5" />}
        />

      </main>
      <Footer />

      {/* Commitment Modal */}
      <CommitmentModal
        isOpen={showCommitmentModal}
        onClose={() => setShowCommitmentModal(false)}
        onCommit={handleCommitment}
        type="intermediate"
        title="CONTRIBUIR MI VISIÓN PARA ARGENTINA"
      />
    </div>
  );
};

export default LaVision;
