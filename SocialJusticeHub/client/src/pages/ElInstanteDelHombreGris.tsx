import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  ArrowRight,
  Quote,
  Flame,
  Target,
  Zap,
  Eye,
  Heart,
  Crown,
  Star,
  AlertTriangle,
  Brain,
  Users,
  Shield,
  Lightbulb,
  CheckCircle,
  MapPin,
  Sprout,
  Sparkles,
  Feather,
  Hourglass
} from 'lucide-react';

// Icono personalizado de Espejo para mayor belleza estética
const MirrorIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <defs>
      <linearGradient id="mirror-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="currentColor" stopOpacity="0.8" />
        <stop offset="100%" stopColor="currentColor" stopOpacity="0.3" />
      </linearGradient>
    </defs>
    {/* Marco del espejo */}
    <circle cx="12" cy="10" r="8" stroke="url(#mirror-gradient)" strokeWidth="1.5" />
    {/* Brillo/Reflejo en el cristal */}
    <path d="M14 7c0-1.5-1.5-2.5-3-2.5" stroke="currentColor" strokeOpacity="0.4" />
    <path d="M9 12c0 1.5 1 2.5 2 2.5" stroke="currentColor" strokeOpacity="0.2" />
    {/* Mango elegante */}
    <path d="M12 18v4" strokeWidth="1.5" />
    <path d="M10 22h4" strokeWidth="1.5" />
  </svg>
);

import PowerCTA from '@/components/PowerCTA';
import CommitmentModal from '@/components/CommitmentModal';
import NextStepCard from '@/components/NextStepCard';

const ElInstanteDelHombreGris = () => {
  const [showCommitmentModal, setShowCommitmentModal] = useState(false);
  const [isAwakened, setIsAwakened] = useState(false);
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const handleCommitment = (commitmentData: any) => {
    console.log('Commitment made:', commitmentData);
    setShowCommitmentModal(false);
    setIsAwakened(true);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'El Instante del Hombre Gris - El Despertar de la Consciencia | ¡BASTA!';
  }, []);

  const awakeningSteps = [
    {
      title: "RECONOCER TU PODER",
      description: "Entender que tienes la capacidad de crear cambio positivo en tu vida y comunidad.",
      icon: <Eye className="w-8 h-8" />,
      panel: "bg-indigo-500/10",
      border: "border-indigo-500/20",
      accent: "text-indigo-400"
    },
    {
      title: "ASUMIR RESPONSABILIDAD",
      description: "Tomar consciencia de tu papel como agente de cambio en la transformación de Argentina.",
      icon: <Target className="w-8 h-8" />,
      panel: "bg-violet-500/10",
      border: "border-violet-500/20",
      accent: "text-violet-400"
    },
    {
      title: "COMPROMETERSE A ACTUAR",
      description: "Decidir conscientemente ser parte de la solución y no solo un espectador del problema.",
      icon: <Flame className="w-8 h-8" />,
      panel: "bg-fuchsia-500/10",
      border: "border-fuchsia-500/20",
      accent: "text-fuchsia-400"
    }
  ];

  const hombreGrisDNA = [
    {
      title: "Líder Humilde",
      description: "“Será de casta joven y desconocida en el ambiente… llegará luego de la tercera jornada”. Liderar es servir con caridad.",
      quote: "PAX es fruto de la humildad activa.",
      action: "Eleva a nuevas voces y practica la santidad de maneras.",
      icon: <Feather className="w-10 h-10" />,
      gradient: "from-indigo-500/20 to-blue-500/20",
      accent: "text-indigo-300"
    },
    {
      title: "Pueblo Despierto",
      description: "“Puede ver sangre en las calles si no ve el instante”. El reconocimiento colectivo evita la violencia.",
      quote: "Somos el instante que detiene la sangre.",
      action: "Organiza círculos para “ver lo que no vio”.",
      icon: <Sparkles className="w-10 h-10" />,
      gradient: "from-purple-500/20 to-pink-500/20",
      accent: "text-purple-300"
    },
    {
      title: "Clase Media Gris",
      description: "El gris integra blanco y negro; simboliza la tercera postura que une las dos Argentinas.",
      quote: "Toma lo mejor de cada orilla.",
      action: "Construye puentes entre bandos y diseña acuerdos.",
      icon: <Users className="w-10 h-10" />,
      gradient: "from-amber-500/20 to-orange-500/20",
      accent: "text-amber-300"
    }
  ];

  const prophecyTimeline = [
    {
      year: "1937",
      title: "Plazas que despiertan",
      description: "“Momento llega a las plazas de B.A.” Anticipa protestas masivas que gritan ¡BASTA!",
      action: "Canaliza la indignación en organización consciente.",
      color: "border-blue-500"
    },
    {
      year: "1938",
      title: "Nuevo Sol, nueva lluvia",
      description: "“El árbol seco sabrá de una era de nueva lluvia… llegarán tres jefes.” Tras las luchas, aparece el Hombre Gris.",
      action: "Reconoce los falsos salvadores y prepara la bendición.",
      color: "border-indigo-500"
    },
    {
      year: "1941 / 1971",
      title: "Revolución Francesa interna",
      description: "“Puede ver sangre en las calles si no ve el instante.” El pueblo debe discernir antes de la violencia.",
      action: "Entrena tu percepción para detectar el instante colectivo.",
      color: "border-purple-500"
    },
    {
      year: "1967",
      title: "PAX del Hombre Humilde",
      description: "“Será de casta joven y desconocida… llegará luego de la tercera jornada.”",
      action: "Apoya liderazgos nuevos, santos en maneras y sabiduría.",
      color: "border-fuchsia-500"
    },
    {
      year: "1972",
      title: "La gran prueba",
      description: "“Argentina ve lo que no vio… es el comienzo del comienzo.”",
      action: "Mantén la fe organizada hasta atravesar la prueba.",
      color: "border-rose-500"
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 selection:bg-purple-500/30" ref={containerRef}>
      <Header />
      <main className="overflow-hidden">
        
        {/* Hero: The Mirror */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
          {/* Starfield Background */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1a103c] via-[#0a0a0a] to-[#0a0a0a]" />
          <div className="absolute inset-0 opacity-30 pointer-events-none">
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute bg-white rounded-full"
                initial={{ 
                  width: Math.random() * 2 + 1 + 'px',
                  height: Math.random() * 2 + 1 + 'px',
                  x: Math.random() * 100 + '%',
                  y: Math.random() * 100 + '%',
                  opacity: Math.random()
                }}
                animate={{ 
                  opacity: [0.2, 1, 0.2],
                  scale: [1, 1.5, 1]
                }}
                transition={{ 
                  duration: Math.random() * 3 + 2,
                  repeat: Infinity,
                  delay: Math.random() * 2
                }}
              />
            ))}
          </div>

          <div className="container-content relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="mb-12 relative inline-block"
              >
                {/* The Mirror Circle */}
                <div className="w-48 h-48 md:w-64 md:h-64 rounded-full bg-gradient-to-b from-white/5 to-transparent border border-white/10 backdrop-blur-md relative flex items-center justify-center mx-auto overflow-hidden shadow-[0_0_50px_rgba(139,92,246,0.2)]">
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2694&auto=format&fit=crop')] bg-cover opacity-20 mix-blend-overlay" />
                  <MirrorIcon className="w-24 h-24 text-purple-200/60 drop-shadow-[0_0_15px_rgba(192,132,252,0.4)] animate-pulse" />
                </div>
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-[#0a0a0a] px-4 py-1 rounded-full border border-purple-500/30 text-xs uppercase tracking-widest text-purple-300">
                  El Espejo
                </div>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 1 }}
                className="heading-hero mb-6"
              >
                <span className="block text-transparent bg-clip-text bg-gradient-to-b from-purple-200 via-purple-400 to-indigo-600">
                  El Instante
                </span>
                <span className="block text-3xl md:text-5xl font-light text-slate-400 mt-2">
                  Del Hombre Gris
                </span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 1 }}
                className="text-xl md:text-2xl text-slate-300/80 max-w-2xl mx-auto mb-12 leading-relaxed font-light"
              >
                "La profecía no habla de un salvador que baja del cielo. <br />
                Habla de un despertar que surge de la tierra."
              </motion.p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
                <PowerCTA
                  text="RECONOCER EL INSTANTE"
                  variant="primary"
                  onClick={() => setShowCommitmentModal(true)}
                  size="lg"
                  animate={true}
                />
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => window.scrollTo({ top: 900, behavior: 'smooth' })}
                  className="bg-transparent border-purple-500/30 text-purple-300 hover:bg-purple-500/10 hover:text-white hover:border-purple-400 rounded-full px-8 h-14 text-lg tracking-wide transition-all"
                >
                  EXPLORAR LA PROFECÍA
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ADN Holográfico */}
        <section className="section-spacing bg-[#0a0a0a] border-t border-white/5">
          <div className="container-content">
            <div className="max-content-width">
              <div className="text-center mb-20">
                <h2 className="heading-section mb-6">ADN del Hombre Gris</h2>
                <p className="text-body max-w-2xl mx-auto">
                  No es una persona, es una frecuencia. Cualquiera que vibre en humildad, verdad y servicio encarna al Hombre Gris.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {hombreGrisDNA.map((trait, index) => (
                  <motion.div 
                    key={trait.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.2 }}
                    viewport={{ once: true }}
                    className="group relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative h-full bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 hover:border-white/20 transition-all duration-500 flex flex-col">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${trait.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                        <div className={trait.accent}>{trait.icon}</div>
                      </div>
                      
                      <h3 className="text-2xl font-bold text-white mb-4">{trait.title}</h3>
                      <p className="text-slate-400 mb-6 flex-grow leading-relaxed">{trait.description}</p>
                      
                      <div className="pt-6 border-t border-white/5">
                        <p className={`text-sm font-mono ${trait.accent} mb-2`}>{trait.quote}</p>
                        <p className="text-xs text-slate-500 uppercase tracking-wider">Acción: {trait.action}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Prophecy Scroll */}
        <section className="section-spacing relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-purple-900/5 to-[#0a0a0a]" />
          
          <div className="container-content relative z-10">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-24">
                <h2 className="heading-section mb-6">La Cronología Profética</h2>
                <p className="text-body max-w-2xl mx-auto">
                  Cada hito describe señales precisas. Esta línea de tiempo te ayuda a ubicarte en el mapa del destino.
                </p>
              </div>

              <div className="relative pl-8 md:pl-0">
                {/* Center Line */}
                <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-purple-500/50 to-transparent" />

                <div className="space-y-24">
                  {prophecyTimeline.map((event, index) => (
                    <motion.div 
                      key={event.year}
                      initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 0.8 }}
                      className={`relative flex items-center justify-between md:flex-row ${index % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}
                    >
                      {/* Timeline Dot */}
                      <div className={`absolute left-8 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#0a0a0a] border-2 ${event.color} shadow-[0_0_15px_currentColor] z-10`} />

                      {/* Content */}
                      <div className="md:w-[45%] pl-12 md:pl-0">
                        <div className="card-unified p-8 hover:border-purple-500/30 group">
                          <div className="flex justify-between items-start mb-4">
                            <span className={`text-2xl font-serif font-bold ${event.color.replace('border', 'text')}`}>
                              {event.year}
                            </span>
                            <Hourglass className="w-5 h-5 text-slate-600 group-hover:animate-spin" />
                          </div>
                          <h3 className="text-xl font-bold text-white mb-3">{event.title}</h3>
                          <p className="text-slate-400 mb-4 leading-relaxed">{event.description}</p>
                          <div className="bg-white/5 rounded-lg p-3 text-sm text-slate-300 border-l-2 border-purple-500">
                            <span className="text-purple-400 font-bold">Acción:</span> {event.action}
                          </div>
                        </div>
                      </div>
                      
                      {/* Spacer */}
                      <div className="hidden md:block md:w-[45%]" />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The Awakening Call */}
        <section className="section-spacing relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-[#0a0a0a] to-[#0a0a0a]" />
          
          <div className="container-content relative z-10">
            <div className="max-w-5xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div>
                  <h2 className="heading-section mb-8">
                    El Llamado al <span className="text-purple-400">Despertar</span>
                  </h2>
                  <p className="text-body mb-12">
                    No es un evento místico lejano. Es una decisión que tomas hoy.
                    Transformarte de espectador en protagonista del cambio.
                  </p>

                  <div className="space-y-6">
                    {awakeningSteps.map((step, index) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.2 }}
                        viewport={{ once: true }}
                        className={`flex gap-6 p-4 rounded-2xl border ${step.border} bg-opacity-5 transition-all hover:bg-opacity-10`}
                      >
                        <div className={`w-12 h-12 rounded-full ${step.panel} flex items-center justify-center flex-shrink-0 ${step.accent}`}>
                          {step.icon}
                        </div>
                        <div>
                          <h4 className="text-white font-bold mb-1">{step.title}</h4>
                          <p className="text-slate-400 text-sm leading-relaxed">{step.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-3xl blur-2xl opacity-20" />
                  <div className="card-unified p-10 relative text-center backdrop-blur-xl border-purple-500/30">
                    <div className="w-20 h-20 mx-auto bg-purple-500/20 rounded-full flex items-center justify-center mb-8 text-purple-300">
                      <Crown className="w-10 h-10" />
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-4">¿Eres tú?</h3>
                    <p className="text-slate-300 mb-8 text-lg">
                      "Argentina no necesita un nuevo líder político. Necesita millones de líderes éticos."
                    </p>
                    <PowerCTA
                      text="SÍ, ACEPTO EL LLAMADO"
                      variant="primary"
                      onClick={() => setShowCommitmentModal(true)}
                      size="lg"
                      animate={true}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Special Badge Unlock */}
        <AnimatePresence>
          {isAwakened && (
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4"
            >
              <div className="bg-[#1a103c] border border-purple-500/50 rounded-2xl p-6 shadow-[0_0_50px_rgba(168,85,247,0.4)] text-center">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <Crown className="w-6 h-6 text-yellow-400 animate-pulse" />
                  <h3 className="text-white font-bold text-lg">Hombre Gris Despertado</h3>
                </div>
                <p className="text-purple-200 text-sm mb-4">Has tomado el primer paso. Tu consciencia se ha encendido.</p>
                <Button 
                  onClick={() => setIsAwakened(false)}
                  size="sm"
                  variant="ghost"
                  className="text-slate-400 hover:text-white"
                >
                  Cerrar
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Next Step */}
        <NextStepCard
          title="Siembra la Semilla del Cambio"
          description="Transforma tu despertar en hábitos y compromisos dentro de La Semilla para nutrir la revolución consciente."
          href="/la-semilla-de-basta"
          gradient="from-[#1f2335] to-[#3b275c]"
          icon={<Sprout className="w-5 h-5" />}
        />

      </main>
      <Footer />

      <CommitmentModal
        isOpen={showCommitmentModal}
        onClose={() => setShowCommitmentModal(false)}
        onCommit={handleCommitment}
        type="intermediate"
        title="COMPROMISO DEL HOMBRE GRIS"
      />
    </div>
  );
};

export default ElInstanteDelHombreGris;
