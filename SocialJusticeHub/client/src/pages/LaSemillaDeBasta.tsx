import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useEffect, useState, useRef } from 'react';
import { Link } from 'wouter';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Users,
  ArrowRight,
  Quote,
  Target,
  Eye,
  Brain,
  Crown,
  Star,
  Shield,
  Lightbulb,
  CheckCircle,
  TreePine,
  Globe,
  BookOpen,
  Sprout,
  Droplets,
  Sunrise,
  HandHeart,
  MapPin,
  Leaf,
  Wind,
  Sun
} from 'lucide-react';
import ShockStats from '@/components/ShockStats';
import PowerCTA from '@/components/PowerCTA';
import CommitmentModal from '@/components/CommitmentModal';
import NextStepCard from '@/components/NextStepCard';

const LaSemillaDeBasta = () => {
  const [showCommitmentModal, setShowCommitmentModal] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const rootPathLength = useTransform(scrollYProgress, [0, 0.8], [0, 1]);

  const handleCommitment = (commitmentData: any) => {
    console.log('Commitment made:', commitmentData);
    setShowCommitmentModal(false);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'La Semilla del Cambio Personal | ¡BASTA!';
  }, []);

  const semillaIndicators = [
    {
      id: 'semillas',
      label: 'Semillas activadas',
      value: 3400,
      unit: '',
      trend: 'up' as const,
      color: 'green' as const,
      icon: <Sprout className="w-6 h-6" />,
      description: 'Personas que sembraron compromisos personales conscientes'
    },
    {
      id: 'redes',
      label: 'Redes enraizadas',
      value: 8900,
      unit: '',
      trend: 'up' as const,
      color: 'blue' as const,
      icon: <Droplets className="w-6 h-6" />,
      description: 'Relaciones cuidadas para evitar “sangre en las calles”'
    },
    {
      id: 'comunidades',
      label: 'Comunidades floreciendo',
      value: 15600,
      unit: '',
      trend: 'up' as const,
      color: 'purple' as const,
      icon: <Sunrise className="w-6 h-6" />,
      description: 'Personas impactadas por el efecto multiplicador colectivo'
    }
  ];

  const germinationSteps = [
    {
      step: 1,
      title: "PREPARAR LA TIERRA",
      subtitle: "Ver lo que no vimos",
      description: "Así como Parravicini anunció que “Argentina verá lo que no vio”, el primer paso es cultivar conciencia. Removemos el terreno interno para reconocer patrones, dolores y mandatos que aún nos secan.",
      icon: <TreePine className="w-12 h-12" />,
      gradient: "from-amber-900/80 to-orange-900/80",
      details: [
        "Nombrar las crisis personales sin negarlas",
        "Practicar autoobservación y silencio",
        "Registrar qué produce hastío",
        "Identificar el instante antes del “basta”"
      ]
    },
    {
      step: 2,
      title: "SEMBRAR HÁBITOS",
      subtitle: "Acciones pequeñas, lluvias constantes",
      description: "“El árbol seco sabrá de una era de nueva lluvia.” Cada hábito noble es una gota que despierta la semilla. Definimos prácticas diarias que nos conecten con propósito y servicio.",
      icon: <Droplets className="w-12 h-12" />,
      gradient: "from-blue-600/80 to-cyan-600/80",
      details: [
        "Diseñar rituales diarios de gratitud",
        "Sumar micro-acciones de justicia",
        "Elegir un hábito de servicio semanal",
        "Perseverar en la tercera jornada"
      ]
    },
    {
      step: 3,
      title: "CUIDAR EL BROTE",
      subtitle: "Relaciones que evitan la violencia",
      description: "Parravicini advirtió: “Puede ver sangre en las calles si no ve el instante”. Cuidar nuestras relaciones es garantizar que la revolución sea consciente y no sanguinaria.",
      icon: <Shield className="w-12 h-12" />,
      gradient: "from-emerald-600/80 to-green-600/80",
      details: [
        "Practicar empatía radical",
        "Cuidar los vínculos familiares",
        "Resolver conflictos pacíficamente",
        "Multiplicar círculos de diálogo"
      ]
    },
    {
      step: 4,
      title: "MULTIPLICAR LA COSECHA",
      subtitle: "Del individuo al país ejemplo",
      description: "“Argentina sufrirá la tormenta en pequeña, la que luego azotará al mundo. ¡Será ejemplo!” Cuando nuestra semilla madura inspira a otros, comenzamos a rediseñar el sistema.",
      icon: <Sun className="w-12 h-12" />,
      gradient: "from-yellow-500/80 to-orange-500/80",
      details: [
        "Compartir aprendizajes en la Tribu",
        "Crear proyectos colectivos",
        "Mentorear a nuevos despiertos",
        "Ser la “Argentina samaritana”"
      ]
    }
  ];

  const timelineEvents = [
    {
      year: "1937",
      title: "Plazas despiertas",
      description: "“Momento llega a las plazas de B.A...” anunció la movilización popular.",
      quote: "Convoca tu semillero en la plaza más cercana.",
      action: "Organiza asambleas barriales conscientes."
    },
    {
      year: "1938",
      title: "Nuevo sol, nueva lluvia",
      description: "“El árbol seco sabrá de una era de nueva lluvia.” La crisis es preámbulo del renacimiento.",
      quote: "Registra tu compromiso para ser esa lluvia.",
      action: "Documenta tus hábitos y súbelos a La Semilla."
    },
    {
      year: "1941 / 1971",
      title: "Revolución interna",
      description: "“Puede ver sangre en las calles si no ve el instante.” Reconocer el momento es tarea ciudadana.",
      quote: "Cada conversación evita violencia.",
      action: "Acompaña a otra persona a despertar."
    }
  ];

  return (
    <div className="min-h-screen bg-[#050a05] text-emerald-50 selection:bg-emerald-500/30 font-sans" ref={containerRef}>
      <Header />
      <main className="overflow-hidden relative">
        
        {/* THE LIVING ROOT - Global Connector */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-6xl pointer-events-none z-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 100 1000" preserveAspectRatio="none">
            <motion.path
              d="M50,0 C50,100 20,200 50,300 C80,400 50,500 50,600 C20,700 80,800 50,900 C20,1000 50,1000 50,1000"
              fill="none"
              stroke="url(#rootGradient)"
              strokeWidth="0.5"
              style={{ pathLength: rootPathLength }}
            />
            <defs>
              <linearGradient id="rootGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#d97706" />
                <stop offset="50%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
          {/* Organic Background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-[#050a05] to-[#050a05]" />
          
          {/* Floating Spores */}
          <div className="absolute inset-0 opacity-30 pointer-events-none">
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute bg-emerald-400 rounded-full blur-[1px]"
                initial={{ 
                  width: Math.random() * 4 + 'px',
                  height: Math.random() * 4 + 'px',
                  x: Math.random() * 100 + '%',
                  y: Math.random() * 100 + '%',
                  opacity: 0
                }}
                animate={{ 
                  y: [0, -100],
                  opacity: [0, 0.8, 0],
                }}
                transition={{ 
                  duration: Math.random() * 10 + 10,
                  repeat: Infinity,
                  delay: Math.random() * 5
                }}
              />
            ))}
          </div>

          <div className="container-content relative z-10">
            <div className="max-w-5xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.5 }}
                className="mb-8"
              >
                <div className="inline-flex items-center justify-center p-4 rounded-full bg-emerald-900/30 border border-emerald-500/30 mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                  <Sprout className="w-12 h-12 text-emerald-400" />
                </div>
              </motion.div>

              <h1 className="heading-hero mb-6">
                <span className="block text-transparent bg-clip-text bg-gradient-to-b from-emerald-200 via-emerald-400 to-green-600">
                  La Semilla
                </span>
                <span className="block text-3xl md:text-5xl font-light text-emerald-100/70 mt-2">
                  Del Cambio Personal
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-emerald-100/60 max-w-3xl mx-auto mb-12 leading-relaxed font-light">
                “El árbol seco de la Argentina sabrá de una era de nueva lluvia.” <br />
                Hoy sembramos los hábitos que impedirán que la tormenta termine en violencia.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20">
                <PowerCTA
                  text="SEMBRAR MI SEMILLA"
                  variant="primary"
                  onClick={() => setShowCommitmentModal(true)}
                  size="lg"
                  animate={true}
                />
                <Button 
                  variant="outline"
                  size="lg"
                  onClick={() => window.scrollTo({ top: 900, behavior: 'smooth' })}
                  className="bg-transparent border-emerald-500/30 text-emerald-400 hover:bg-emerald-900/20 hover:text-emerald-200 rounded-full px-8 h-14"
                >
                  VER EL CICLO
                </Button>
              </div>

              {/* Living Metrics */}
              <div className="grid grid-cols-3 gap-4 max-w-4xl mx-auto">
                {semillaIndicators.map((stat) => (
                  <motion.div 
                    key={stat.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="relative group"
                  >
                    <div className="absolute inset-0 bg-emerald-500/10 rounded-2xl blur-md group-hover:bg-emerald-500/20 transition-colors" />
                    <div className="relative bg-[#0a150a] border border-emerald-500/20 rounded-2xl p-6 text-center">
                      <div className="text-emerald-400 mb-2 flex justify-center">{stat.icon}</div>
                      <div className="text-3xl font-bold text-white font-mono">{stat.value.toLocaleString()}</div>
                      <div className="text-xs text-emerald-500/70 uppercase tracking-wider mt-1">{stat.label}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Germination Cycle Interactive */}
        <section className="section-spacing bg-[#050a05] relative border-t border-emerald-900/20">
          <div className="container-content">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="heading-section mb-6">El Ciclo de Germinación</h2>
                <p className="text-body max-w-2xl mx-auto">
                  Parravicini habló de “luchas serias” antes de la bendición. Este ciclo te guía para preparar la tierra y sembrar consciencia.
                </p>
              </div>

              <div className="grid lg:grid-cols-2 gap-16 items-center">
                {/* Interactive Visual */}
                <div className="relative aspect-square rounded-full bg-emerald-900/10 border border-emerald-500/20 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#050a05_70%)]" />
                  
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeStep}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.2 }}
                      transition={{ duration: 0.5 }}
                      className="text-center relative z-10"
                    >
                      <div className={`w-32 h-32 mx-auto rounded-full bg-gradient-to-br ${germinationSteps[activeStep].gradient} flex items-center justify-center mb-8 shadow-[0_0_60px_rgba(16,185,129,0.3)]`}>
                        <div className="text-white">{germinationSteps[activeStep].icon}</div>
                      </div>
                      <h3 className="text-3xl font-bold text-white mb-2">{germinationSteps[activeStep].title}</h3>
                      <p className="text-emerald-200/70">{germinationSteps[activeStep].subtitle}</p>
                    </motion.div>
                  </AnimatePresence>

                  {/* Controls */}
                  <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2 z-20">
                    {germinationSteps.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveStep(idx)}
                        className={`w-3 h-3 rounded-full transition-all ${activeStep === idx ? 'bg-emerald-400 w-8' : 'bg-emerald-900 hover:bg-emerald-700'}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Steps List */}
                <div className="space-y-4">
                  {germinationSteps.map((step, idx) => (
                    <motion.div
                      key={idx}
                      className={`p-6 rounded-2xl border transition-all cursor-pointer ${activeStep === idx ? 'bg-emerald-900/20 border-emerald-500/50' : 'bg-transparent border-transparent hover:bg-white/5'}`}
                      onClick={() => setActiveStep(idx)}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`text-sm font-mono mt-1 ${activeStep === idx ? 'text-emerald-400' : 'text-emerald-800'}`}>
                          0{idx + 1}
                        </div>
                        <div>
                          <h4 className={`text-lg font-bold mb-2 ${activeStep === idx ? 'text-white' : 'text-emerald-100/50'}`}>
                            {step.title}
                          </h4>
                          {activeStep === idx && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              className="text-emerald-200/70 text-sm leading-relaxed"
                            >
                              <p className="mb-4">{step.description}</p>
                              <ul className="space-y-2">
                                {step.details.map((detail, i) => (
                                  <li key={i} className="flex items-center gap-2">
                                    <div className="w-1 h-1 bg-emerald-400 rounded-full" />
                                    {detail}
                                  </li>
                                ))}
                              </ul>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Prophetic Timeline - Organic Style */}
        <section className="section-spacing bg-[#081008]">
          <div className="container-content">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="heading-section mb-6">Cronología Viva</h2>
                <p className="text-body">Hitos que marcan el crecimiento del nuevo árbol argentino.</p>
              </div>

              <div className="relative border-l border-emerald-900/50 pl-8 space-y-16">
                {timelineEvents.map((event, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[39px] top-0 w-6 h-6 rounded-full bg-[#081008] border-2 border-emerald-500 flex items-center justify-center">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                    </div>
                    <div>
                      <span className="text-emerald-500 font-mono text-sm tracking-widest uppercase mb-2 block">{event.year}</span>
                      <h3 className="text-xl font-bold text-white mb-3">{event.title}</h3>
                      <p className="text-emerald-100/60 mb-4 text-lg">"{event.description}"</p>
                      <div className="bg-emerald-900/20 p-4 rounded-xl border border-emerald-500/20">
                        <p className="text-sm text-emerald-300">
                          <strong className="text-emerald-400 block mb-1">Acción Semillero:</strong>
                          {event.action}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Argentina Samaritana */}
        <section className="section-spacing relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-900/20 via-[#050a05] to-[#050a05]" />
          
          <div className="container-content relative z-10">
            <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-900/30 border border-orange-500/30 text-orange-400 text-sm font-mono mb-6 tracking-widest uppercase">
                  <HandHeart className="w-4 h-4" />
                  Visión 1942
                </div>
                <h2 className="heading-section mb-6">
                  Argentina <span className="text-orange-400">Samaritana</span>
                </h2>
                <p className="text-body mb-8">
                  "Tierras tengo para el que sufre en quemazón..." Parravicini visualizó a nuestro país como refugio. 
                  Ese destino comienza con individuos que se convierten en semilla viva de hospitalidad.
                </p>
                <div className="space-y-4">
                  {[
                    "Me comprometo a abrir espacios seguros.",
                    "Me preparo para compartir recursos.",
                    "Acompaño a Sudamérica a curar heridas."
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
                      <CheckCircle className="w-5 h-5 text-orange-500" />
                      <span className="text-emerald-100/80">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-orange-500/10 blur-3xl rounded-full" />
                <div className="card-unified p-10 relative border-orange-500/20 bg-orange-950/10 backdrop-blur-xl text-center">
                  <Globe className="w-16 h-16 text-orange-400 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-white mb-4">Tu Semilla es Global</h3>
                  <p className="text-emerald-100/60 mb-8">
                    Al sanar tu parte del tejido social, estás preparando a la nación para su rol histórico de sanadora mundial.
                  </p>
                  <PowerCTA
                    text="ASUMIR ROL SAMARITANO"
                    variant="accent"
                    onClick={() => setShowCommitmentModal(true)}
                    size="lg"
                    animate={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Next Steps */}
        <NextStepCard
          title="Diseña la Visión Colectiva"
          description="Tus semillas personales alimentan el mapa maestro. Ve al siguiente paso para plasmar la Argentina regenerada."
          href="/la-vision"
          gradient="from-emerald-900 to-blue-900"
          icon={<Eye className="w-5 h-5" />}
        />


      </main>
      <Footer />

      <CommitmentModal
        isOpen={showCommitmentModal}
        onClose={() => setShowCommitmentModal(false)}
        onCommit={handleCommitment}
        type="intermediate"
        title="SEMBRAR MI SEMILLA"
      />
    </div>
  );
};

export default LaSemillaDeBasta;
