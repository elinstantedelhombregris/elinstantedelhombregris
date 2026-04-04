import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Eye,
  Heart,
  Crown,
  Brain,
  Shield,
  Lightbulb,
  Feather,
  MapPin,
  Sprout,
  Sparkles,
  Quote,
  BookOpen,
  MessageSquare,
  Hammer,
  Users
} from 'lucide-react';
import { Link } from 'wouter';

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

  const handleCommitment = (commitmentData: any) => {
    console.log('Commitment made:', commitmentData);
    setShowCommitmentModal(false);
    setIsAwakened(true);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'El Instante del Hombre Gris - Un marco ético para la reconstrucción | ¡BASTA!';
  }, []);

  const awakeningSteps = [
    {
      title: "Entrar en Modo Observador",
      description: "Cambiar la forma de mirar: leer patrones, no titulares. Detectar lo que vibra en los bordes.",
      icon: <Eye className="w-8 h-8" />,
      panel: "bg-indigo-500/10",
      border: "border-indigo-500/20",
      accent: "text-indigo-400"
    },
    {
      title: "Diseñar la Jugada",
      description: "Pensar como ingeniero de sistemas humanos: reescribir procesos en lugar de maquillar síntomas.",
      icon: <Brain className="w-8 h-8" />,
      panel: "bg-purple-500/10",
      border: "border-purple-500/20",
      accent: "text-purple-400"
    },
    {
      title: "Influir sin Ruido",
      description: "Moverse en gris: liderar sin altar, actuar con amabilidad radical y precisión quirúrgica.",
      icon: <Shield className="w-8 h-8" />,
      panel: "bg-fuchsia-500/10",
      border: "border-fuchsia-500/20",
      accent: "text-fuchsia-400"
    }
  ];

  const hombreGrisDNA = [
    {
      title: "Humildad radical",
      description: "Humildad no es tibieza: es bajar el ego para que suba la precisión. Escucha profunda, liderazgo que rota y cero altar personal.",
      quote: "La PAX nace de la humildad activa.",
      action: "Cede el foco, eleva nuevas voces y documenta lo que aprendes.",
      icon: <Feather className="w-10 h-10" />,
      gradient: "from-indigo-500/20 to-blue-500/20",
      accent: "text-indigo-300"
    },
    {
      title: "Verdad que integra",
      description: "El gris es luz y sombra dialogando. Nombra la realidad sin maquillaje y une lo mejor de cada extremo en síntesis lúcida.",
      quote: "La verdad es el color exacto entre blanco y negro.",
      action: "Habla con precisión, mide con evidencia y corrige rápido.",
      icon: <Eye className="w-10 h-10" />,
      gradient: "from-purple-500/20 to-pink-500/20",
      accent: "text-purple-300"
    },
    {
      title: "Servicio invisible",
      description: "Servir es rediseñar sistemas para que otros brillen. Amabilidad radical como infraestructura y acción silenciosa que baja fricción.",
      quote: "El impacto más fuerte ocurre sin tribuna.",
      action: "Construye herramientas que hagan obsoleto el problema.",
      icon: <Heart className="w-10 h-10" />,
      gradient: "from-amber-500/20 to-orange-500/20",
      accent: "text-amber-300"
    }
  ];

  const visionFrames = [
    {
      title: "Mirar la trama",
      description: "Reeducar la retina para ver causas, procesos y flujos invisibles en vez de flashes y titulares.",
      accent: "text-indigo-300",
      border: "border-indigo-500/30",
      icon: <Eye className="w-10 h-10" />
    },
    {
      title: "Ver la tercera vía",
      description: "El gris integra extremos y disuelve trincheras: es síntesis lúcida que permite crear acuerdos nuevos.",
      accent: "text-purple-300",
      border: "border-purple-500/30",
      icon: <Shield className="w-10 h-10" />
    },
    {
      title: "Refinar la realidad",
      description: "Como la plata pulida, la mirada limpia revela el reflejo. Prototipa soluciones inevitables en silencio elegante.",
      accent: "text-amber-300",
      border: "border-amber-500/30",
      icon: <Lightbulb className="w-10 h-10" />
    }
  ];

  const identityFrames = [
    {
      title: "Por qué Hombre",
      description: "Hombre viene del latín homo (tierra, humano) y humus (suelo, raíz de humildad). Es cualquiera y es todos: pies en la tierra y responsabilidad radical sin mitos de héroe.",
      accent: "from-emerald-500/20 to-teal-500/20",
      icon: <Heart className="w-12 h-12 text-emerald-300" />
    },
    {
      title: "Por qué Gris",
      description: "Gris viene del francés gris (brillante, plateado). Es el color de la plata refinada y de la ceniza que guarda calor. Equilibra luz y sombra, pasión y rigor.",
      accent: "from-slate-500/30 to-purple-500/20",
      icon: <Sparkles className="w-12 h-12 text-purple-300" />
    },
    {
      title: "El espejo",
      description: "El Hombre Gris viene a mostrarte el reflejo de lo que ya eres cuando dejas de delegar tu conciencia: una mezcla exacta de luz y sombra lista para crear.",
      accent: "from-blue-500/20 to-indigo-500/20",
      icon: <MirrorIcon className="w-12 h-12 text-indigo-200" />
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
                className="text-xl md:text-2xl text-slate-300/80 max-w-3xl mx-auto mb-12 leading-relaxed font-light"
              >
                Para una visión nueva, primero cambiamos la mirada. El Hombre Gris te entrena a leer la niebla, a ver los bordes donde nacen los futuros. 
                Llega a Argentina como idea que refina la plata: cuando se pule, brilla y refleja la diferencia.
              </motion.p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
                <PowerCTA
                  text="ACTIVAR LA VISIÓN"
                  variant="primary"
                  onClick={() => setShowCommitmentModal(true)}
                  size="lg"
                  animate={true}
                />
                <Link href="/manifiesto">
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="bg-transparent border-purple-500/30 text-purple-300 hover:bg-purple-500/10 hover:text-white hover:border-purple-400 rounded-full px-8 h-14 text-lg tracking-wide transition-all"
                  >
                    LEER EL MANIFIESTO
                  </Button>
                </Link>
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

        {/* Seis Roles Ciudadanos */}
        <section className="section-spacing relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-purple-900/5 to-[#0a0a0a]" />
          <div className="container-content relative z-10">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="heading-section mb-6">Seis formas de encarnar al Hombre Gris</h2>
                <p className="text-body max-w-3xl mx-auto">
                  El Hombre Gris no es una abstracción. Es un rol concreto que podés ocupar en la reconstrucción.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { title: "Testigo", description: "Ve y documenta la realidad. Mira de frente lo que otros normalizan.", icon: <Eye className="w-8 h-8" />, accent: "text-indigo-300", gradient: "from-indigo-500/20 to-blue-500/20", border: "border-indigo-500/20" },
                  { title: "Declarante", description: "Expresa sueño, valor, necesidad o basta. Pone la verdad en el mapa.", icon: <MessageSquare className="w-8 h-8" />, accent: "text-purple-300", gradient: "from-purple-500/20 to-pink-500/20", border: "border-purple-500/20" },
                  { title: "Constructor", description: "Aporta tiempo, oficio, recurso o trabajo. Hace con las manos.", icon: <Hammer className="w-8 h-8" />, accent: "text-amber-300", gradient: "from-amber-500/20 to-orange-500/20", border: "border-amber-500/20" },
                  { title: "Custodio", description: "Verifica, audita, corrige y alerta. Cuida que lo que funciona no se pudra.", icon: <Shield className="w-8 h-8" />, accent: "text-emerald-300", gradient: "from-emerald-500/20 to-teal-500/20", border: "border-emerald-500/20" },
                  { title: "Organizador", description: "Coordina células, círculos y nodos. Teje la red territorial.", icon: <Users className="w-8 h-8" />, accent: "text-sky-300", gradient: "from-sky-500/20 to-cyan-500/20", border: "border-sky-500/20" },
                  { title: "Narrador", description: "Convierte prueba y proceso en relato compartible. La historia que legitima.", icon: <BookOpen className="w-8 h-8" />, accent: "text-rose-300", gradient: "from-rose-500/20 to-pink-500/20", border: "border-rose-500/20" },
                ].map((role, index) => (
                  <motion.div
                    key={role.title}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ delay: index * 0.1 }}
                    className="group relative"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${role.gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    <div className={`relative h-full bg-white/5 backdrop-blur-md border ${role.border} rounded-2xl p-6 hover:border-white/20 transition-all duration-500 flex flex-col`}>
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${role.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500`}>
                        <div className={role.accent}>{role.icon}</div>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">{role.title}</h3>
                      <p className="text-slate-400 text-sm leading-relaxed flex-grow">{role.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Nueva Mirada */}
        <section className="section-spacing relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-indigo-900/10 to-[#0a0a0a]" />
          <div className="container-content relative z-10">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="heading-section mb-6">Nueva visión, nueva forma de ver</h2>
                <p className="text-body max-w-3xl mx-auto">
                  Para cambiar el mundo hay que pulir la mirada. El Hombre Gris te entrena a leer procesos ocultos, a detectar reflejos en la niebla
                  y a trazar rutas donde otros solo ven paredes. No es espectáculo: es disciplina visual y precisión ética.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 mb-16">
                {visionFrames.map((frame, index) => (
                  <motion.div
                    key={frame.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ delay: index * 0.15 }}
                    className="group relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative h-full bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 hover:border-white/20 transition-all duration-500 flex flex-col">
                      <div className="flex items-center justify-between mb-6">
                        <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center ${frame.accent.replace('text', 'bg')} bg-opacity-10`}>
                          <div className={frame.accent}>{frame.icon}</div>
                        </div>
                        <Sparkles className="w-5 h-5 text-slate-500" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3">{frame.title}</h3>
                      <p className="text-slate-400 leading-relaxed flex-grow">{frame.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative h-full bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-10 hover:border-white/20 transition-all duration-500">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                      <Quote className="w-7 h-7 text-purple-200" />
                    </div>
                    <div className="flex-1">
                      <p className="text-lg text-slate-200 leading-relaxed">
                        "Esto no es un manual de juego: es fuego en la mente. Es la proclama de que otro país es posible,
                        no por decreto sino por diseño. Si estás leyendo, ya sabes que no podemos seguir así: es hora de
                        dejar de delegar la conciencia y convertir el cansancio en sagrado."
                      </p>
                      <p className="text-sm text-purple-200/80 mt-3 font-mono uppercase tracking-[0.25em]">
                        Manifiesto del Hombre Gris
                      </p>
                    </div>
                    <div className="w-full md:w-auto">
                      <Link href="/manifiesto">
                        <Button 
                          variant="outline"
                          className="bg-white/5 border-purple-400/40 text-purple-200 hover:bg-purple-500/10 hover:text-white"
                        >
                          LEER EL MANIFIESTO
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Identidad: Hombre y Gris */}
        <section className="section-spacing relative border-t border-white/5">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-slate-900/20 to-[#0a0a0a]" />
          <div className="container-content relative z-10">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-14">
                <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full bg-white/5 border border-white/10 text-[11px] uppercase tracking-[0.25em] text-slate-300">
                  <Sparkles className="w-4 h-4 text-purple-200" />
                  <span>Etimología y reflejo</span>
                </div>
                <h2 className="heading-section mb-4">Por qué Hombre. Por qué Gris.</h2>
                <p className="text-body max-w-3xl mx-auto">
                  Hombre (homo, humus) nos recuerda suelo y humildad; gris (gris, plateado) trae el brillo de la plata pulida. No es un héroe individual, es la síntesis lúcida de quien integra extremos y usa la responsabilidad como poder.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {identityFrames.map((card, index) => (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.15 }}
                    className="group relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative h-full bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 hover:border-white/20 transition-all duration-500 flex flex-col gap-4">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.accent} border border-white/10 flex items-center justify-center`}>
                        {card.icon}
                      </div>
                      <h3 className="text-2xl font-bold text-white">{card.title}</h3>
                      <p className="text-slate-300 leading-relaxed flex-grow">{card.description}</p>
                      <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-500 pt-2 border-t border-white/5">
                        <MapPin className="w-3 h-3" />
                        <span>ZONA GRIS</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Llegada a Argentina */}
        <section className="section-spacing relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#0a0a0a] via-[#131a24] to-[#0a0a0a]" />
          <div className="container-content relative z-10">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-xs uppercase tracking-[0.25em]">
                  <Sparkles className="w-4 h-4" />
                  <span>El Hombre Gris llega a Argentina</span>
                </div>
                <h2 className="heading-section text-left">
                  Al igual que la plata, los argentinos necesitan refinación para brillar y ver su reflejo en la visión del país
                </h2>
                <p className="text-body">
                  Argentina viene de <em>argentum</em>: plata. La plata se refina en el fuego hasta que el orfebre ve su reflejo en ella.
                  El país estará listo cuando podamos vernos en él con dignidad, verdad y servicio. El gris cotidiano se vuelve plata cuando
                  decidimos pulir nuestro sistema vivo hasta que refleje lo que somos capaces de diseñar.
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="card-unified p-5 border border-emerald-500/30 bg-emerald-500/5">
                    <div className="flex items-center gap-3 mb-2">
                      <MapPin className="w-5 h-5 text-emerald-300" />
                      <span className="text-sm font-bold text-white uppercase tracking-wide">Mapa vivo</span>
                    </div>
                    <p className="text-slate-300 text-sm">
                      Diseña nodos de influencia silenciosa en tu barrio, escuela o empresa. Sin tribuna, con evidencia.
                    </p>
                  </div>
                  <div className="card-unified p-5 border border-indigo-500/30 bg-indigo-500/5">
                    <div className="flex items-center gap-3 mb-2">
                      <BookOpen className="w-5 h-5 text-indigo-300" />
                      <span className="text-sm font-bold text-white uppercase tracking-wide">Refinar la mirada</span>
                    </div>
                    <p className="text-slate-300 text-sm">
                      La plata refleja cuando se pule. Pulir la mirada es nuestra alquimia: menos ruido, más precisión.
                    </p>
                  </div>
                </div>
              </div>

              <motion.div 
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_60px_rgba(59,130,246,0.15)] bg-gradient-to-br from-[#0f141b] via-[#0c1017] to-[#0b0f14]"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-purple-500/10 to-transparent pointer-events-none" />
                <motion.div
                  initial={{ x: "-40%", opacity: 0.45 }}
                  animate={{ x: "120%", opacity: 0.9 }}
                  transition={{ duration: 4, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'linear-gradient(120deg, rgba(75,85,99,0.6) 0%, rgba(203,213,225,0.85) 40%, rgba(255,255,255,0.95) 55%, rgba(55,65,81,0.4) 80%, rgba(17,24,39,0.1) 100%)',
                    mixBlendMode: 'screen'
                  }}
                />
                <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-gradient-to-br from-slate-500/30 via-slate-200/50 to-white/40 blur-3xl opacity-40 pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.08),transparent_35%),radial-gradient(circle_at_80%_60%,rgba(255,255,255,0.05),transparent_45%)]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-80 h-10 rounded-full border border-white/20 bg-gradient-to-r from-slate-800 via-slate-600 to-slate-900 shadow-[0_0_30px_rgba(148,163,184,0.35)] overflow-hidden relative">
                    <motion.div
                      initial={{ x: "-80%" }}
                      animate={{ x: "140%" }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-white/10 via-white/60 to-white/10 blur-sm"
                    />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-2 w-16 rounded-full bg-gradient-to-r from-slate-500 to-slate-200 shadow-[0_0_10px_rgba(148,163,184,0.6)]" />
                    <span className="text-[11px] font-mono uppercase tracking-[0.3em] text-slate-200">Gris → Plata</span>
                  </div>
                  <p className="text-sm text-slate-300 font-mono uppercase tracking-[0.25em]">Zona Gris // Buenos Aires</p>
                  <p className="text-lg text-white font-serif">"Cuando el suelo vuelve a reflejar, la mirada colectiva se afila."</p>
                </div>
              </motion.div>
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
                    Entrena tu mirada <span className="text-purple-400">en gris</span>
                  </h2>
                  <p className="text-body mb-12">
                    No es un milagro lejano: es gimnasia visual diaria. La nueva visión nace cuando
                    eliges ser arquitecto de tu destino y dejas de consumir relatos prefabricados.
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
                    <h3 className="text-3xl font-bold text-white mb-4">¿Sos vos?</h3>
                    <p className="text-slate-300 mb-8 text-lg">
                      "Argentina no necesita un nuevo líder político. Necesita testigos que miren de frente, constructores que armen con evidencia, y custodios que no dejen pudrir lo que funciona. ¿Qué rol es el tuyo?"
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
                  <h3 className="text-white font-bold text-lg">Primer compromiso registrado</h3>
                </div>
                <p className="text-purple-200 text-sm mb-4">Diste el primer paso. Lo que sigue es sostenerlo.</p>
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

        {/* Closing Pattern */}
        <section className="section-spacing">
          <div className="container-content">
            <div className="max-w-3xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 space-y-5"
              >
                {[
                  { label: "Qué estamos viendo", text: "Un país que confunde liderazgo con caudillismo y participación con fanatismo." },
                  { label: "Qué hacemos ahora", text: "Entrenar otra forma de mirar: con humildad, con verdad operativa, con servicio." },
                  { label: "Qué no vamos a hacer todavía", text: "Prometer pureza moral ni adornar la complejidad como si fuera sabiduría." },
                  { label: "Cómo se mide", text: "Roles ocupados, compromisos sostenidos, relevos generados." },
                  { label: "Qué podés hacer vos", text: "Elegir un rol, sostenerlo con estándar, y dejar de esperar permiso para cuidar lo común." },
                ].map((item, index) => (
                  <div key={index} className={index > 0 ? "pt-4 border-t border-white/5" : ""}>
                    <span className="text-sm font-semibold text-purple-400 block mb-1">{item.label}</span>
                    <p className="text-slate-300 leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Next Step */}
        <NextStepCard
          title="Siembra la Semilla del Cambio"
          description="Entendiste el marco. Ahora declaralo. En La Semilla plantás tu primer compromiso concreto con la reconstrucción."
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
