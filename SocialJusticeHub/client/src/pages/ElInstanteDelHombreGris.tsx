import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Eye,
  Heart,
  Feather,
  Lightbulb,
  Shield,
  Sprout,
} from 'lucide-react';
import NextStepCard from '@/components/NextStepCard';

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

const greyVisionCards = [
  {
    title: "Leer patrones, no titulares",
    description: "Dejá de consumir el relato que te venden. Mirá los flujos, las causas, los sistemas. ¿Qué se mueve de verdad debajo del ruido? Esto no es cinismo — es atención.",
    icon: <Eye className="w-10 h-10" />,
    gradient: "from-indigo-500/20 to-blue-500/20",
    accent: "text-indigo-300",
  },
  {
    title: "Integrar, no polarizar",
    description: "La zona gris entre blanco y negro es donde vive cada solución real. No es tibieza — es síntesis. Tomá lo mejor de cada extremo y construí algo que ningún bando imaginó.",
    icon: <Shield className="w-10 h-10" />,
    gradient: "from-purple-500/20 to-pink-500/20",
    accent: "text-purple-300",
  },
  {
    title: "Refinar, no reaccionar",
    description: "Como la plata en el fuego, la claridad viene del calor sostenido. No reacciones a la crisis del día. Quedate en el proceso. El reflejo aparece cuando dejás de pestañear.",
    icon: <Lightbulb className="w-10 h-10" />,
    gradient: "from-amber-500/20 to-orange-500/20",
    accent: "text-amber-300",
  },
];

const foundations = [
  {
    title: "Humildad radical",
    description: "La humildad no es debilidad, es precisión. Bajás el ego para ver lo que tenés enfrente. Escuchás antes de hablar. Dejás que gane la mejor idea, aunque no sea tuya. En un país adicto a los caudillos, esto es el acto más revolucionario posible.",
    icon: <Feather className="w-10 h-10" />,
    gradient: "from-indigo-500/20 to-blue-500/20",
    accent: "text-indigo-300",
  },
  {
    title: "Verdad que integra",
    description: "La verdad no es un arma que le tirás al otro bando. Es la zona gris donde sostenés lo real sin pestañear — aunque sea incómodo, aunque te implique. No \"mi verdad\" contra \"tu verdad\". La verdad que aparece cuando dejás de defender una posición.",
    icon: <Eye className="w-10 h-10" />,
    gradient: "from-purple-500/20 to-pink-500/20",
    accent: "text-purple-300",
  },
  {
    title: "Servicio invisible",
    description: "Servir no es caridad y no es un escenario. Es rediseñar la cosa para que funcione para todos, y después dar un paso atrás. La infraestructura más fuerte es la que nadie nota porque simplemente funciona. Construí eso.",
    icon: <Heart className="w-10 h-10" />,
    gradient: "from-amber-500/20 to-orange-500/20",
    accent: "text-amber-300",
  },
];

const ElInstanteDelHombreGris = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'El Instante del Hombre Gris — La filosofía fundacional | ¡BASTA!';
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 selection:bg-purple-500/30" ref={containerRef}>
      <Header />
      <main className="overflow-hidden">

        {/* Section 1: Hero — "The Blindness We Share" */}
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
                Nos enseñaron a ver en blanco y negro. Izquierda o derecha. Líder o seguidor. Héroe o villano.
                Y nos cansamos — porque la realidad no funciona en dos colores.
                Hay otra forma de mirar. Y empieza por entender qué significa <em>gris</em>.
              </motion.p>
            </div>
          </div>
        </section>

        {/* Section 2: Grey Thesis — text-dominant with silver polish animation */}
        <section className="section-spacing relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#0a0a0a] via-[#131a24] to-[#0a0a0a]" />
          <div className="container-content relative z-10">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div className="space-y-6">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="heading-section text-left"
                >
                  Gris no es lo que te dijeron
                </motion.h2>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="space-y-5"
                >
                  <p className="text-body">
                    Te vendieron que gris es burocracia. Ni fu ni fa. El color del que no se la juega, del tibio que no molesta a nadie.
                    El color de la mediocridad cómoda.
                  </p>
                  <p className="text-body">
                    Pero gris es lo que pasa cuando integrás luz y sombra en la misma mirada. No elegís un bando — elegís ver todo el tablero.
                    Es el color de la síntesis, no de la rendición.
                  </p>
                  <p className="text-white font-medium text-lg leading-relaxed">
                    La palabra <em>gris</em> viene del francés antiguo: brillante, plateado. Y Argentina viene de <em>argentum</em>: plata.
                    El país lleva en su nombre el metal que solo brilla cuando se refina en el fuego.
                  </p>
                  <p className="text-body">
                    Un país llamado Plata que se olvidó de verse brillar. El gris de todos los días — el bondi,
                    la lucha, el "no llego a fin de mes" — es plata cruda. No está pulida todavía.
                    Pero no es basura. Al contrario: es potencial sin refinar.
                  </p>
                </motion.div>
              </div>

              {/* Silver polish animation — from "Llegada a Argentina" */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_60px_rgba(59,130,246,0.15)] bg-gradient-to-br from-[#0f141b] via-[#0c1017] to-[#0b0f14] aspect-[4/3]"
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
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-2 w-16 rounded-full bg-gradient-to-r from-slate-500 to-slate-200 shadow-[0_0_10px_rgba(148,163,184,0.6)]" />
                    <span className="text-sm text-slate-300">Gris → Plata</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Section 3: Sight Thesis — 3 cards */}
        <section className="section-spacing relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-indigo-900/10 to-[#0a0a0a]" />
          <div className="container-content relative z-10">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-16">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="heading-section mb-6"
                >
                  Ver de otra manera
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-body max-w-3xl mx-auto"
                >
                  Si el gris no es lo que te dijeron, entonces ver en gris tampoco. No es tibieza ni indecisión.
                  Es una disciplina: leer lo que realmente pasa debajo del ruido que te venden.
                </motion.p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {greyVisionCards.map((card, index) => (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ delay: index * 0.15 }}
                    className="group relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative h-full bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 hover:border-white/20 transition-all duration-500 flex flex-col">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                        <div className={card.accent}>{card.icon}</div>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3">{card.title}</h3>
                      <p className="text-slate-400 leading-relaxed flex-grow">{card.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Hombre — single centered card */}
        <section className="section-spacing relative border-t border-white/5">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-slate-900/20 to-[#0a0a0a]" />
          <div className="container-content relative z-10">
            <div className="max-w-3xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-10 md:p-14 hover:border-white/20 transition-all duration-500">
                  <div className="flex justify-center mb-8">
                    <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                      <MirrorIcon className="w-8 h-8 text-purple-200/60" />
                    </div>
                  </div>

                  <div className="space-y-6 text-center">
                    <p className="text-body leading-relaxed">
                      <em>Hombre</em> viene del latín <em>homo</em>, que viene de <em>humus</em>: tierra, suelo.
                      La misma raíz de <em>humildad</em>. No es un género — es estar con los pies en la tierra.
                      Es la condición de quien acepta ser parte del barro antes de pretender dar lecciones.
                    </p>
                    <p className="text-body leading-relaxed">
                      Y <em>El Instante</em> es eso: el momento del click. Cuando dejás de ver en binario y empezás a ver en gris.
                      No es un proceso largo ni un retiro espiritual. Es un cambio de foco que pasa en un segundo
                      — y después ya no podés volver atrás.
                    </p>
                    <p className="text-white font-medium text-xl leading-relaxed">
                      El Hombre Gris no es otro. Es tu reflejo cuando dejás de delegar tu propia conciencia.
                      Cuando el gris se vuelve plata en vos.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Section 5: Three Foundations — 3 cards */}
        <section className="section-spacing bg-[#0a0a0a] border-t border-white/5">
          <div className="container-content">
            <div className="max-content-width">
              <div className="text-center mb-20">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="heading-section mb-6"
                >
                  En qué se sostiene
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-body max-w-3xl mx-auto"
                >
                  Si vas a ver de otra manera, necesitás pararte en algo sólido. No son valores abstractos — son posturas concretas.
                  Cómo te presentás en una reunión, en un barrio, en una crisis.
                </motion.p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {foundations.map((trait, index) => (
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
                      <p className="text-slate-400 flex-grow leading-relaxed">{trait.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section 6: NextStepCard → La Semilla */}
        <NextStepCard
          title="Si algo de esto ya lo sentías antes de leerlo"
          description="Lo que sigue es darle forma. En La Semilla plantás tu primer compromiso concreto con la reconstrucción — no una promesa abstracta, sino algo que podés sostener."
          href="/la-semilla-de-basta"
          gradient="from-[#1f2335] to-[#3b275c]"
          icon={<Sprout className="w-5 h-5" />}
        />

      </main>
      <Footer />
    </div>
  );
};

export default ElInstanteDelHombreGris;
