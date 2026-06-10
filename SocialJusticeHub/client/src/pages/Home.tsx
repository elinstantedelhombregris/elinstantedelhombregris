import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroCinema from '@/components/HeroCinema';
import {
  ArrowRight, Share2,
  Activity, MapPin, FileText, ScrollText,
  Target, Cog, Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { StatusBadge, type PlatformStatus } from '@/components/ui/StatusBadge';
import {
  GLASS_CARD,
  GLASS_CARD_HOVER,
  SECTION_BADGE,
  DISPLAY_GRADIENT,
  PULL_QUOTE,
} from '@/lib/design-tokens';

/* ── Feature cards data (Section 2) ───────────────────── */
const features: ReadonlyArray<{
  title: string;
  description: string;
  href: string;
  status: PlatformStatus;
  icon: React.ReactNode;
}> = [
  {
    title: 'Diagnóstico Personal',
    description: 'Mapeá tu vida real en 12 áreas. Tu punto de partida, sin filtro.',
    href: '/evaluacion',
    status: 'live',
    icon: <Activity className="w-5 h-5" />,
  },
  {
    title: 'El Mapa Ciudadano',
    description: 'Lo que soñás, necesitás y rechazás — visible en tu territorio, junto a miles de voces más.',
    href: '/el-mapa',
    status: 'live',
    icon: <MapPin className="w-5 h-5" />,
  },
  {
    title: '22 Planes de Ejemplo',
    description: 'Educación, suelo, justicia, ciudades: el ejercicio completo de diseñar el país desde cero, escrito en detalle para mostrar que se puede. Imaginate hacerlo entre millones.',
    href: '/recursos/ruta',
    status: 'ejercicio',
    icon: <FileText className="w-5 h-5" />,
  },
  {
    title: 'El Mandato Vivo',
    description: 'Lo que pide tu barrio, contado y publicado cada semana — para que nadie pueda decir que no lo sabía.',
    href: '/el-mandato-vivo',
    status: 'construccion',
    icon: <ScrollText className="w-5 h-5" />,
  },
];

/* ── Differentiator blocks data (Section 3) ───────────── */
const differentiators = [
  {
    title: 'Sin caudillo, sin aparato',
    text: 'No hay nadie a quien seguir. Hay infraestructura que la ciudadanía opera. ¿Quién la sostiene? El hombre gris: alguien común que se salió de la grieta y eligió construir en vez de pelear. No es uno — somos muchos. Si mañana desaparecemos, las herramientas quedan.',
  },
  {
    title: 'Planes, no consignas',
    text: 'Cada propuesta tiene diseño, presupuesto, métricas y mecanismo de rendición de cuentas. No pedimos que nos crean — pedimos que lo lean.',
  },
  {
    title: 'Arranca con vos',
    text: 'No arranca con una marcha ni un voto. Arranca con tu diagnóstico, tu visión, tu territorio. El sistema se construye de abajo hacia arriba.',
  },
] as const;

/* ── Method phases data (Section 4) ───────────────────── */
const phases = [
  {
    num: '01',
    title: 'El quiebre',
    description: 'Dejás de normalizar. Nombrás lo que no va más — en tu vida, en tu barrio, en el país. No es bronca: es claridad.',
    icon: <Target className="w-5 h-5" />,
  },
  {
    num: '02',
    title: 'La construcción',
    description: 'La energía del quiebre se vuelve método: diagnóstico, datos, prioridades compartidas, decisiones coordinadas.',
    icon: <Cog className="w-5 h-5" />,
  },
  {
    num: '03',
    title: 'La prueba',
    description: 'Lo construido se mide, se exige, se corrige. La ciudadanía no pide — demuestra que hay otro camino y lo sostiene.',
    icon: <Building2 className="w-5 h-5" />,
  },
] as const;

/* ── Component ─────────────────────────────────────────── */
const Home = () => {
  const [showStickyShare, setShowStickyShare] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = '¡BASTA! — Herramientas ciudadanas para reconstruir la Argentina';

    const handleScroll = () => setShowStickyShare(window.scrollY > 600);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToContent = () => {
    document.getElementById('lo-que-existe')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleShare = () => {
    const text = encodeURIComponent(
      `¡BASTA! Un grupo de ciudadanos dejó de esperar y empezó a construir. La ciudadanía diseña, el Estado administra, la política ejecuta. Sin líder. Sin partido. Hay método. ${window.location.origin}`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 selection:bg-[#7D5BDE]/30 font-sans">
      <Header />

      <main>
        {/* ═══ 1. HERO — The Shared Wound + The Turn ════════════════════ */}
        <HeroCinema
          title={
            <span className="flex flex-col items-center">
              <span className="block text-[clamp(2.2rem,6vw,4.5rem)] font-black tracking-tight leading-[1.15] pb-[0.1em] text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-400 mb-2 filter drop-shadow-2xl">
                Votaste. Marchaste. Esperaste.
              </span>
              <span className="block text-[clamp(2.2rem,6vw,4.5rem)] font-black tracking-tight leading-[1.15] pb-[0.1em] text-transparent bg-clip-text bg-gradient-to-b from-slate-300 to-slate-500">
                Y todo sigue igual.
              </span>
            </span>
          }
          subtitle={
            <div className="max-w-2xl mx-auto space-y-4">
              <p className="text-[clamp(1rem,1.8vw,1.25rem)] leading-relaxed text-slate-300/90">
                Un grupo de ciudadanos dejó de esperar y empezó a construir
                herramientas para hacer evidente lo que queremos y lo que ya no
                aguantamos — cada uno desde su barrio, su provincia, su lugar.
              </p>
              <p className="text-[clamp(1.1rem,2vw,1.4rem)] font-semibold text-white/90">
                Se llama <span className="text-[#9D85E8] font-bold">¡BASTA!</span>:
                la ciudadanía diseña, el Estado administra, la política ejecuta.
                Sin líder, sin partido, sin promesas.
              </p>
            </div>
          }
          ctaText="Conocé la Visión"
          ctaLink="/la-vision"
          secondaryCtaText="Ver los 22 planes de ejemplo"
          secondaryCtaLink="/recursos/ruta"
          onScrollDown={scrollToContent}
        />

        {/* ═══ 2. LO QUE YA EXISTE — Concrete tools ═══════════════════ */}
        <section id="lo-que-existe" className="py-20 md:py-28 bg-[#0a0a0a] relative overflow-hidden">
          {/* Layered ambient lighting */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-[#7D5BDE]/[0.05] rounded-full blur-[160px]" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-6xl mx-auto">
              {/* Section Header */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7 }}
                className="text-center mb-16 md:mb-20"
              >
                <span className={`${SECTION_BADGE} mb-6`}>
                  Lo que ya existe
                </span>
                <h2 className="text-4xl md:text-[3.5rem] lg:text-6xl font-black text-white mb-6 tracking-tight leading-[0.95]">
                  No es una idea.
                  <br />
                  <span className={DISPLAY_GRADIENT}>
                    Es una plataforma en construcción.
                  </span>
                </h2>
                <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                  Cada herramienta está diseñada para que la ciudadanía pueda hacer
                  lo que el sistema político nunca le permitió: ver, decidir y exigir con datos.
                </p>
              </motion.div>

              {/* El modelo en nueve palabras */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6 }}
                className="grid sm:grid-cols-3 gap-4 mb-6"
              >
                {[
                  { who: 'La ciudadanía', verb: 'DISEÑA' },
                  { who: 'El Estado', verb: 'ADMINISTRA' },
                  { who: 'La política', verb: 'EJECUTA' },
                ].map((role) => (
                  <div key={role.verb} className={`${GLASS_CARD} px-6 py-5 text-center`}>
                    <p className="text-sm text-slate-400">{role.who}</p>
                    <p className="text-xl md:text-2xl font-black tracking-wide text-white">{role.verb}</p>
                    <div className="mx-auto mt-2 h-px w-8 bg-[#7D5BDE]" />
                  </div>
                ))}
              </motion.div>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-center text-slate-400 text-base md:text-lg mb-14 max-w-2xl mx-auto"
              >
                Porque si nos escuchamos de verdad, vamos a descubrir que todos apuntamos para el mismo lado.
              </motion.p>

              {/* Feature Cards — 2×2 grid */}
              <div className="grid sm:grid-cols-2 gap-5 lg:gap-6 mb-14">
                {features.map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="group relative"
                  >
                    <Link href={feature.href} className="block h-full">
                      <div className={`relative h-full ${GLASS_CARD} ${GLASS_CARD_HOVER} overflow-hidden cursor-pointer`}>
                        <div className="p-7 md:p-8 relative">
                          {/* Icon + status */}
                          <div className="flex items-start justify-between mb-5">
                            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300">
                              {feature.icon}
                            </div>
                            <StatusBadge status={feature.status} />
                          </div>

                          {/* Title */}
                          <h3 className="text-xl font-bold text-white mb-3">
                            {feature.title}
                          </h3>

                          {/* Description */}
                          <p className="text-slate-400 text-[15px] leading-relaxed mb-4">
                            {feature.description}
                          </p>

                          {/* Affordance */}
                          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#9D85E8]">
                            Entrar <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Closing line */}
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className={`text-center text-lg md:text-xl ${PULL_QUOTE}`}
              >
                Todo abierto. Todo auditable. Todo construido por ciudadanos como vos.
              </motion.p>
            </div>
          </div>
        </section>

        {/* ═══ 3. POR QUÉ ES DISTINTO — Differentiators ═══════════════ */}
        <section className="py-20 md:py-28 bg-[#0a0a0a] relative overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0d0d14] to-transparent" />
          <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-[#7D5BDE]/[0.04] rounded-full blur-[180px] pointer-events-none" />

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto">
              {/* Section Header */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7 }}
                className="text-center mb-16 md:mb-20"
              >
                <span className={`${SECTION_BADGE} mb-6`}>
                  Por qué es distinto
                </span>
                <h2 className="text-4xl md:text-[3.5rem] lg:text-6xl font-black text-white mb-6 tracking-tight leading-[0.95]">
                  No hay líder. No hay partido.
                  <br />
                  <span className={DISPLAY_GRADIENT}>
                    Hay método.
                  </span>
                </h2>
                <p className="text-lg text-slate-400 max-w-xl mx-auto leading-relaxed">
                  Esto no se parece a nada que hayas visto en la política argentina. A propósito.
                </p>
              </motion.div>

              {/* Differentiator Blocks */}
              <div className="space-y-6 md:space-y-8 mb-16 md:mb-20">
                {differentiators.map((d, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.6, delay: i * 0.12 }}
                    className="relative border-l-4 border-l-white/25 pl-7 md:pl-9 py-2"
                  >
                    {/* Ghost number */}
                    <span className="absolute -top-4 right-0 text-[5rem] md:text-[6rem] font-black text-white/[0.04] leading-none select-none pointer-events-none">
                      {String(i + 1).padStart(2, '0')}
                    </span>

                    <h3 className="text-xl md:text-2xl font-bold text-white mb-3">
                      {d.title}
                    </h3>
                    <p className="text-slate-400 text-[15px] md:text-base leading-relaxed max-w-2xl">
                      {d.text}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Closing statement */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="text-center max-w-3xl mx-auto"
              >
                <p className={`text-xl md:text-2xl leading-relaxed ${PULL_QUOTE}`}>
                  La pregunta no es quién promete más.
                  <br />
                  Es si estás dispuesto a mirar lo que ya se está construyendo.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ═══ 4. EL MÉTODO — The Emotional Bridge ════════════════════ */}
        <section className="py-20 md:py-28 bg-[#0a0a0a] relative overflow-hidden">
          {/* Ambient background */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0d1117] to-[#0a0a0a]" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[#7D5BDE]/[0.05] rounded-full blur-[150px] pointer-events-none" />

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-6xl mx-auto">
              {/* Section Header */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7 }}
                className="text-center mb-16 md:mb-20"
              >
                <span className={`${SECTION_BADGE} mb-6`}>
                  El método
                </span>
                <h2 className="text-4xl md:text-[3.5rem] lg:text-6xl font-black text-white mb-6 tracking-tight leading-[0.95]">
                  ¡BASTA! no es solo un grito.
                  <br />
                  <span className={DISPLAY_GRADIENT}>
                    Es lo que pasa después.
                  </span>
                </h2>
                <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                  Tres momentos: te das cuenta, construís con otros,
                  y lo que construiste se mide y se sostiene.
                </p>
              </motion.div>

              {/* Three Phases — Horizontal Timeline */}
              <div className="relative mb-20 md:mb-24">
                {/* Connecting gradient line (desktop only) */}
                <div className="hidden md:block absolute top-[3.25rem] left-[16%] right-[16%] h-px z-0">
                  <div className="w-full h-full bg-white/10" />
                </div>

                <div className="grid md:grid-cols-3 gap-6 md:gap-5 relative z-10">
                  {phases.map((phase, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 40 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-60px" }}
                      transition={{ duration: 0.6, delay: index * 0.12 }}
                      className="relative"
                    >
                      {/* Timeline node (desktop) */}
                      <div className="hidden md:flex justify-center mb-6">
                        <div className="relative z-20 w-7 h-7 rounded-full border-2 border-[#7D5BDE]/40 flex items-center justify-center bg-[#0a0a0a]">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#7D5BDE]" />
                        </div>
                      </div>

                      {/* Card */}
                      <div className={`group relative ${GLASS_CARD} ${GLASS_CARD_HOVER} overflow-hidden`}>
                        <div className="p-7 relative">
                          {/* Ghost number */}
                          <span className="absolute -top-1 right-4 text-[5rem] font-black text-white/[0.04] leading-none select-none pointer-events-none">
                            {phase.num}
                          </span>

                          {/* Icon */}
                          <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-5 text-slate-300">
                            {phase.icon}
                          </div>

                          {/* Title */}
                          <h3 className="text-[1.4rem] font-bold text-white mb-3 text-balance">
                            {phase.title}
                          </h3>

                          {/* Description */}
                          <p className="text-slate-400 text-[15px] leading-relaxed">
                            {phase.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Closing Statement */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="text-center max-w-3xl mx-auto"
              >
                <p className="text-xl md:text-2xl text-slate-300/90 leading-relaxed">
                  <span className={`block ${PULL_QUOTE}`}>Indignación sin método es ruido.</span>
                  <span className={`block mt-1 ${PULL_QUOTE}`}>Método sin gente es burocracia.</span>
                  <span className="block mt-4 font-bold text-white text-2xl md:text-3xl tracking-tight">
                    Esto es las dos cosas juntas.
                  </span>
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ═══ 5. TU TURNO — The Close ════════════════════════════════ */}
        <section className="relative py-28 md:py-36 overflow-hidden">
          {/* Full-width gradient atmosphere */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#10132a] to-[#0a0a0a]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-blue-600/[0.06] rounded-full blur-[130px] pointer-events-none" />
          <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-purple-600/[0.04] rounded-full blur-[100px] pointer-events-none" />

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <span className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/[0.08] text-[11px] uppercase tracking-[0.3em] text-blue-300/70 mb-8">
                  Tu turno
                </span>

                <h2 className="text-4xl md:text-[3.5rem] font-black text-white mb-3 tracking-tight leading-[0.95]">
                  No hace falta que creas.
                </h2>
                <h2 className="text-4xl md:text-[3.5rem] font-black mb-8 tracking-tight leading-[0.95]">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                    Hace falta que leas.
                  </span>
                </h2>

                <div className="max-w-xl mx-auto mb-10 space-y-4">
                  <p className="text-lg text-slate-400 leading-relaxed">
                    Escribimos una visión de la Argentina que queremos — con datos, con diseño,
                    con la honestidad de decir lo que no sabemos todavía. No te pedimos que te
                    sumes a nada. Te pedimos 20 minutos.
                  </p>
                  <p className="text-lg text-slate-300 leading-relaxed font-medium">
                    Si después de leerla sentís que hay algo acá, vas a saber qué hacer.
                  </p>
                </div>

                <Link href="/la-vision">
                  <Button
                    size="lg"
                    className="relative group bg-blue-600 hover:bg-blue-500 text-white px-10 py-7 rounded-full text-lg font-semibold shadow-[0_0_40px_rgba(37,99,235,0.3)] hover:shadow-[0_0_60px_rgba(37,99,235,0.5)] transition-all duration-500 hover:-translate-y-1 overflow-hidden tracking-wide"
                  >
                    <span className="relative z-10 flex items-center">
                      Leer La Visión
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                    {/* Inner Glow Pulse */}
                    <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md" />
                  </Button>
                </Link>

                <p className="mt-6 text-sm text-slate-500">
                  ¿Tenés 2 minutos nomás?{' '}
                  <Link href="/recursos/ruta" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
                    Mirá los 22 planes de ejemplo →
                  </Link>
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        <Footer />

        {/* Sticky Share */}
        <AnimatePresence>
          {showStickyShare && (
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="fixed bottom-24 right-6 z-50"
            >
              <Button
                onClick={handleShare}
                className="rounded-full h-12 px-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-2xl shadow-blue-900/40 flex items-center gap-2.5 transition-transform hover:scale-105"
              >
                <Share2 className="w-4 h-4" />
                <span className="font-semibold tracking-wide text-sm hidden md:inline">COMPARTIR</span>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Home;
