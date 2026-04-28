import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EnsayoLinkCard from '@/components/EnsayoLinkCard';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Eye,
  Shield,
  Lightbulb,
  Sprout,
} from 'lucide-react';
import NextStepCard from '@/components/NextStepCard';

const greyVisionCards = [
  {
    title: "Leer patrones, no titulares",
    description: "Dejá de consumir el relato que te venden. Mirá los flujos, las causas, los sistemas. ¿Qué se mueve de verdad debajo del ruido? Esto no es cinismo — es atención.",
    icon: <Eye className="w-5 h-5" />,
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
    gradient: 'from-indigo-400 to-indigo-600',
    glow: 'group-hover:shadow-[0_0_40px_rgba(99,102,241,0.12)]',
    hoverBorder: 'group-hover:border-indigo-500/40',
  },
  {
    title: "Integrar, no polarizar",
    description: "La zona gris entre blanco y negro es donde vive cada solución real. No es tibieza — es síntesis. Tomá lo mejor de cada extremo y construí algo que ningún bando imaginó.",
    icon: <Shield className="w-5 h-5" />,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    gradient: 'from-purple-400 to-purple-600',
    glow: 'group-hover:shadow-[0_0_40px_rgba(139,92,246,0.12)]',
    hoverBorder: 'group-hover:border-purple-500/40',
  },
  {
    title: "Refinar, no reaccionar",
    description: "Como la plata en el fuego, la claridad viene del calor sostenido. No reacciones a la crisis del día. Quedate en el proceso. El reflejo aparece cuando dejás de pestañear.",
    icon: <Lightbulb className="w-5 h-5" />,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    gradient: 'from-amber-400 to-amber-600',
    glow: 'group-hover:shadow-[0_0_40px_rgba(245,158,11,0.12)]',
    hoverBorder: 'group-hover:border-amber-500/40',
  },
];

const foundations = [
  {
    title: "Humildad radical",
    text: "No es modestia. No es bajarse. Es precisión: bajás el ruido del ego para ver lo que tenés enfrente. Escuchás antes de hablar. Dejás que gane la mejor idea, aunque no sea tuya. En un país adicto a los caudillos, no tener nombre es el acto más revolucionario posible.",
    borderColor: 'border-l-blue-500',
    numColor: 'text-blue-500/[0.07]',
  },
  {
    title: "Amor que reconstruye",
    text: "No el amor de las canciones ni el de los discursos. El amor operativo — el que se levanta a las cinco a construir algo que no va a llevar su firma. El que sostiene al otro sin condiciones y sin cámaras. La fuerza que el gris lleva adentro no es verdad ni razón. Es amor convertido en infraestructura.",
    borderColor: 'border-l-purple-500',
    numColor: 'text-purple-500/[0.07]',
  },
  {
    title: "Servicio sin nombre",
    text: "Servir no es caridad y no es un escenario. Es rediseñar la cosa para que funcione para todos y después dar un paso atrás. La infraestructura más fuerte es la que nadie nota porque simplemente funciona. Construís eso — y te vas sin dejar tarjeta.",
    borderColor: 'border-l-amber-500',
    numColor: 'text-amber-500/[0.07]',
  },
];

const ElInstanteDelHombreGris = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'El Instante del Hombre Gris — La filosofía fundacional | ¡BASTA!';
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 selection:bg-purple-500/30">
      <Header />
      <main className="overflow-hidden">

        {/* ═══ 1. HERO — The Title Lands ══════════════════════════════ */}
        <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden pt-20">
          {/* Ambient lighting */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-slate-500/[0.04] rounded-full blur-[180px]" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-900/[0.04] rounded-full blur-[150px]" />
          </div>
          {/* Dot pattern */}
          <div className="absolute inset-0 pattern-dots opacity-20 pointer-events-none" />

          <div className="container-content relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 0.5 }}
                className="mb-4"
              >
                <span className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/[0.08] text-[11px] uppercase tracking-[0.3em] text-slate-300/70">
                  La filosofía fundacional
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold leading-tight mb-8"
              >
                <span className="text-white">El Instante del</span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-300 via-white to-slate-400">
                  Hombre Gris
                </span>
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 0.3 }}
              >
                <div className="space-y-4">
                  <p className="text-xl md:text-2xl text-slate-400/90 leading-relaxed">
                    Hay algo que pasa cuando un país colapsa y nadie viene a salvarte.
                  </p>
                  <p className="text-xl md:text-2xl text-slate-400/90 leading-relaxed">
                    Algunos se quiebran. Otros esperan. Y unos pocos despiertan.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Scroll hint */}
          <motion.div
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
          >
            <div className="w-5 h-8 rounded-full border-2 border-white/20 flex items-start justify-center p-1">
              <motion.div
                className="w-1 h-2 bg-white/40 rounded-full"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        </section>

        {/* ═══ 2. EL INSTANTE — The Moment You Can't Undo ═════════════ */}
        <section className="py-28 md:py-36 relative overflow-hidden border-t border-white/5">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-slate-900/[0.08] to-[#0a0a0a] pointer-events-none" />
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-slate-500/[0.03] rounded-full blur-[160px]" />
          </div>

          <div className="container-content relative z-10">
            <div className="max-w-3xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.8 }}
                className="space-y-8"
              >
                <span className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/[0.08] text-[11px] uppercase tracking-[0.3em] text-slate-300/70 mb-2">
                  El instante
                </span>

                <h2 className="text-[clamp(1.5rem,3.5vw,2.5rem)] font-black text-white leading-[1.15] tracking-tight">
                  No se busca. Llega.
                </h2>

                <p className="text-lg md:text-xl text-slate-400 leading-relaxed">
                  Hay un momento en el que dejás de esperar que alguien arregle las cosas.
                  No es rabia. No es resignación. Es algo más silencioso
                  — como un foco que se ajusta solo y de golpe ves nítido lo que siempre estuvo borroso.
                </p>

                <p className="text-lg md:text-xl text-slate-400 leading-relaxed">
                  No tiene fecha. No necesita un libro, un maestro, ni una crisis particular.
                  A veces pasa en un colectivo. A veces mirando las noticias.
                  A veces en el medio de una discusión que venís repitiendo hace años.
                </p>

                <p className="text-xl md:text-2xl text-white font-semibold leading-relaxed">
                  Es el segundo exacto en el que dejás de delegar tu propia conciencia.
                  Y después de eso, no hay vuelta atrás.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ═══ 3. EL HOMBRE — From the Earth, Not the Pedestal ════════ */}
        <section className="py-28 md:py-36 relative overflow-hidden border-t border-white/5">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0d0d14] to-[#0a0a0a] pointer-events-none" />
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-purple-900/[0.03] rounded-full blur-[160px]" />
          </div>

          <div className="container-content relative z-10">
            <div className="max-w-3xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.8 }}
                className="space-y-8"
              >
                <span className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/[0.08] text-[11px] uppercase tracking-[0.3em] text-purple-300/70 mb-2">
                  El hombre
                </span>

                <h2 className="text-[clamp(1.5rem,3.5vw,2.5rem)] font-black text-white leading-[1.15] tracking-tight">
                  De la tierra, no del pedestal
                </h2>

                <p className="text-lg md:text-xl text-slate-400 leading-relaxed">
                  La palabra <em className="text-slate-300/80">hombre</em> viene del latín <em className="text-slate-300/80">homo</em>,
                  que viene de <em className="text-slate-300/80">humus</em>: tierra, suelo.
                  La misma raíz que <em className="text-slate-300/80">humildad</em>.
                  No es un título — es una condición.
                  La de quien acepta ser parte del barro antes de pretender dar lecciones.
                </p>

                <p className="text-lg md:text-xl text-slate-400 leading-relaxed">
                  El que despierta no se convierte en líder. No tiene nombre, no tiene escenario,
                  no junta seguidores. Camina entre la gente y nadie lo nota
                  — porque no necesita que lo noten.
                  Despertó en el medio del derrumbe, no antes.
                  No es especial. Simplemente dejó de mirar para otro lado.
                </p>

                <p className="text-xl md:text-2xl text-white font-semibold leading-relaxed">
                  No es otro. Es cualquiera que decide dejar de esperar
                  y empezar a construir sin pedir permiso ni aplausos.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ═══ 4. EL GRIS — The Silver Beneath ════════════════════════ */}
        <section className="py-28 md:py-36 relative overflow-hidden border-t border-white/5">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0d0d14] to-[#0a0a0a] pointer-events-none" />
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-slate-500/[0.04] rounded-full blur-[180px]" />
          </div>

          <div className="container-content relative z-10">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                {/* Left: Prose */}
                <div>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.8 }}
                    className="space-y-8"
                  >
                    <span className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/[0.08] text-[11px] uppercase tracking-[0.3em] text-slate-300/70 mb-2">
                      El gris
                    </span>

                    <h2 className="text-[clamp(1.5rem,3.5vw,2.5rem)] font-black text-white leading-[1.15] tracking-tight">
                      El color que te enseñaron a despreciar
                    </h2>

                    <p className="text-lg md:text-xl text-slate-400 leading-relaxed">
                      Te dijeron que gris es burocracia. Ni fu ni fa.
                      El color del tibio, del que no molesta.
                      El color de la mediocridad cómoda.
                    </p>

                    <p className="text-lg md:text-xl text-slate-400 leading-relaxed">
                      Pero gris es lo que aparece cuando sostenés la luz y la sombra en la misma mirada.
                      No elegís un bando — elegís ver todo el tablero.
                      No es tibieza. Es síntesis.
                    </p>

                    <p className="text-lg md:text-xl text-white font-semibold leading-relaxed">
                      La palabra <em>gris</em> viene del francés antiguo: brillante, plateado.
                      Y Argentina viene de <em>argentum</em> — plata.
                      Un país con nombre de metal que brilla cuando se refina en el fuego.
                      Un país entero que se olvidó de lo que lleva en el nombre.
                    </p>

                    <p className="text-lg md:text-xl text-slate-400 leading-relaxed">
                      El gris de todos los días — el bondi, la lucha, el "no llego a fin de mes"
                      — es plata sin pulir. No es descarte.
                      Es potencial crudo esperando el fuego que lo aclare.
                    </p>
                  </motion.div>
                </div>

                {/* Right: Silver atmospheric panel */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="relative rounded-2xl overflow-hidden border border-white/[0.06] bg-gradient-to-br from-[#0f141b] to-[#0b0f14] aspect-[3/4] hidden lg:block"
                >
                  {/* Ambient inner glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-500/[0.06] via-transparent to-transparent pointer-events-none" />

                  {/* Silver sweep animation — background texture */}
                  <motion.div
                    initial={{ x: "-40%" }}
                    animate={{ x: "120%" }}
                    transition={{ duration: 5, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
                    className="absolute inset-0 pointer-events-none opacity-30"
                    style={{
                      background: 'linear-gradient(120deg, rgba(75,85,99,0.6) 0%, rgba(203,213,225,0.85) 40%, rgba(255,255,255,0.95) 55%, rgba(55,65,81,0.4) 80%, rgba(17,24,39,0.1) 100%)',
                      mixBlendMode: 'screen'
                    }}
                  />

                  {/* Ghost watermark */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4" aria-hidden="true">
                    <span className="text-slate-500/20 text-6xl md:text-7xl font-black font-serif tracking-tight select-none pointer-events-none">
                      GRIS
                    </span>
                    <div className="h-[2px] w-16 bg-gradient-to-r from-transparent via-slate-400/30 to-transparent" />
                    <span className="text-slate-400/20 text-6xl md:text-7xl font-black font-serif tracking-tight select-none pointer-events-none">
                      PLATA
                    </span>
                  </div>

                  {/* Bottom subtle glow */}
                  <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-gradient-to-br from-slate-500/20 via-slate-200/30 to-white/20 blur-3xl opacity-30 pointer-events-none" />
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ 5. LA MIRADA GRIS — Three Ways of Seeing ═══════════════ */}
        <section className="py-28 md:py-36 relative overflow-hidden border-t border-white/5">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-indigo-900/[0.04] to-[#0a0a0a] pointer-events-none" />
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-indigo-900/[0.05] rounded-full blur-[160px]" />
          </div>

          <div className="container-content relative z-10">
            <div className="max-w-6xl mx-auto">
              {/* Section Header */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7 }}
                className="text-center mb-16 md:mb-20"
              >
                <span className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/[0.08] text-[11px] uppercase tracking-[0.3em] text-indigo-300/70 mb-6">
                  La mirada gris
                </span>
                <h2 className="text-4xl md:text-[3.5rem] lg:text-6xl font-black text-white mb-6 tracking-tight leading-[0.95]">
                  Ver de otra manera
                </h2>
                <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                  Si el gris no es lo que te dijeron, entonces ver en gris tampoco.
                  No es tibieza ni indecisión. Es una disciplina: leer lo que realmente pasa debajo del ruido.
                </p>
              </motion.div>

              {/* Cards */}
              <div className="grid md:grid-cols-3 gap-5 lg:gap-6">
                {greyVisionCards.map((card, i) => (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 30, scale: 0.97 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="group relative"
                  >
                    <div className={`
                      relative rounded-2xl bg-white/[0.02] border ${card.border}
                      ${card.hoverBorder} ${card.glow}
                      transition-all duration-500 hover:-translate-y-1 overflow-hidden
                    `}>
                      {/* Top accent line */}
                      <div className={`h-[3px] bg-gradient-to-r ${card.gradient} opacity-60 group-hover:opacity-100 transition-opacity duration-500`} />

                      <div className="p-7 md:p-8 relative">
                        <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center mb-5 ${card.color} border ${card.border} group-hover:scale-110 transition-transform duration-500`}>
                          {card.icon}
                        </div>

                        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-slate-50 transition-colors">
                          {card.title}
                        </h3>

                        <p className="text-slate-400 text-[15px] leading-relaxed">
                          {card.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ 6. LOS CIMIENTOS — What Sustains It ════════════════════ */}
        <section className="py-28 md:py-36 relative overflow-hidden border-t border-white/5">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-purple-900/[0.04] to-[#0a0a0a] pointer-events-none" />
          <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-purple-900/[0.05] rounded-full blur-[180px] pointer-events-none" />
          <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-blue-900/[0.04] rounded-full blur-[150px] pointer-events-none" />

          <div className="container-content relative z-10">
            <div className="max-w-4xl mx-auto">
              {/* Section Header */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7 }}
                className="text-center mb-16 md:mb-20"
              >
                <span className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/[0.08] text-[11px] uppercase tracking-[0.3em] text-purple-300/70 mb-6">
                  Los cimientos
                </span>
                <h2 className="text-4xl md:text-[3.5rem] lg:text-6xl font-black text-white mb-6 tracking-tight leading-[0.95]">
                  En qué se sostiene
                </h2>
                <p className="text-lg text-slate-400 max-w-xl mx-auto leading-relaxed">
                  Si vas a ver de otra manera, necesitás pararte en algo sólido.
                  No son valores abstractos — son posturas que se prueban todos los días.
                </p>
              </motion.div>

              {/* Editorial Blocks */}
              <div className="space-y-6 md:space-y-8">
                {foundations.map((f, i) => (
                  <motion.div
                    key={f.title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.6, delay: i * 0.12 }}
                    className={`relative border-l-4 ${f.borderColor} pl-7 md:pl-9 py-2`}
                  >
                    {/* Ghost number */}
                    <span aria-hidden="true" className={`absolute -top-4 right-0 text-[5rem] md:text-[6rem] font-black ${f.numColor} leading-none select-none pointer-events-none`}>
                      {String(i + 1).padStart(2, '0')}
                    </span>

                    <h3 className="text-xl md:text-2xl font-bold text-white mb-3">
                      {f.title}
                    </h3>
                    <p className="text-slate-400 text-[15px] md:text-base leading-relaxed max-w-2xl">
                      {f.text}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ 7. NEXT STEP — La Semilla ══════════════════════════════ */}
        <NextStepCard
          title="Si algo de esto ya lo sentías antes de leerlo"
          description="Lo que sigue es darle forma. En La Semilla plantás tu primer compromiso concreto — no una promesa abstracta, sino algo que podés sostener."
          href="/la-semilla-de-basta"
          gradient="from-[#1f2335] to-[#3b275c]"
          icon={<Sprout className="w-5 h-5" />}
        />

        <section className="max-w-4xl mx-auto px-4 py-16">
          <div className="space-y-2 mb-8">
            <p className="uppercase tracking-widest text-xs text-amber-300/80">Pensamiento</p>
            <h2 className="font-serif text-3xl">Qué soberanía recuperás</h2>
            <p className="text-mist-white/60 max-w-2xl">El instante es el verbo. Este ensayo es el cuerpo del verbo: atención, voz, agencia, mano, hogar, calle, no.</p>
          </div>
          <EnsayoLinkCard slug="soberania" />
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default ElInstanteDelHombreGris;
