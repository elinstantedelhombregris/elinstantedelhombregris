import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroCinema from '@/components/HeroCinema';
import BastaPrincipio from '@/components/BastaPrincipio';
import AparatoPolitico from '@/components/AparatoPolitico';
import { Eye, Sprout, Users, Brain, MapPin, ScrollText, ArrowRight, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

/* ── Journey step data ─────────────────────────────────── */
const steps = [
  {
    num: '01',
    title: 'Ver',
    subtitle: 'La Visión',
    description: 'Comprender la herida y el marco. Una lectura clara de la Argentina real para alinear prioridades con evidencia.',
    href: '/la-vision',
    cta: 'Ver',
    icon: <Eye className="w-6 h-6" />,
    accent: 'from-blue-400 to-blue-600',
    text: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/15',
    hoverBorder: 'hover:border-blue-500/30',
    hoverBg: 'hover:bg-blue-500/[0.04]',
    glow: 'hover:shadow-[0_8px_40px_rgba(59,130,246,0.08)]',
    numColor: 'text-blue-500/[0.06]',
  },
  {
    num: '02',
    title: 'Entender',
    subtitle: 'El Hombre Gris',
    description: 'Incorporar el marco ético. Hace falta entendimiento antes de declarar: humildad, verdad operativa, servicio.',
    href: '/el-instante-del-hombre-gris',
    cta: 'Entender',
    icon: <Brain className="w-6 h-6" />,
    accent: 'from-purple-400 to-purple-600',
    text: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/15',
    hoverBorder: 'hover:border-purple-500/30',
    hoverBg: 'hover:bg-purple-500/[0.04]',
    glow: 'hover:shadow-[0_8px_40px_rgba(139,92,246,0.08)]',
    numColor: 'text-purple-500/[0.06]',
  },
  {
    num: '03',
    title: 'Declarar',
    subtitle: 'La Semilla',
    description: 'Plantar tu compromiso. Decir qué soñás, qué necesitás, qué rechazás y qué estás dispuesto a sostener.',
    href: '/la-semilla-de-basta',
    cta: 'Declarar',
    icon: <Sprout className="w-6 h-6" />,
    accent: 'from-emerald-400 to-emerald-600',
    text: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/15',
    hoverBorder: 'hover:border-emerald-500/30',
    hoverBg: 'hover:bg-emerald-500/[0.04]',
    glow: 'hover:shadow-[0_8px_40px_rgba(16,185,129,0.08)]',
    numColor: 'text-emerald-500/[0.06]',
  },
  {
    num: '04',
    title: 'Servir',
    subtitle: 'El Mapa',
    description: 'Cargar tu verdad en el mapa. Tu información es un acto de servicio: lo que el territorio dice se vuelve legible.',
    href: '/el-mapa',
    cta: 'Servir',
    icon: <MapPin className="w-6 h-6" />,
    accent: 'from-amber-400 to-orange-500',
    text: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/15',
    hoverBorder: 'hover:border-amber-500/30',
    hoverBg: 'hover:bg-amber-500/[0.04]',
    glow: 'hover:shadow-[0_8px_40px_rgba(245,158,11,0.08)]',
    numColor: 'text-amber-500/[0.06]',
  },
  {
    num: '05',
    title: 'Probar',
    subtitle: 'El Mandato',
    description: 'Las señales se convierten en iniciativa cívica para la gestión pública. Lo que se prueba se puede exigir.',
    href: '/el-mandato-vivo',
    cta: 'Probar',
    icon: <ScrollText className="w-6 h-6" />,
    accent: 'from-red-400 to-red-600',
    text: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/15',
    hoverBorder: 'hover:border-red-500/30',
    hoverBg: 'hover:bg-red-500/[0.04]',
    glow: 'hover:shadow-[0_8px_40px_rgba(239,68,68,0.08)]',
    numColor: 'text-red-500/[0.06]',
  },
  {
    num: '06',
    title: 'Multiplicar',
    subtitle: 'Los Círculos',
    description: 'Encontrar tu círculo de reconstrucción. Células territoriales que sostienen lo que una persona sola no puede. Cuando la prueba se comparte, el relato se vuelve legítimo.',
    href: '/community',
    cta: 'Multiplicar',
    icon: <Users className="w-6 h-6" />,
    accent: 'from-pink-400 to-rose-500',
    text: 'text-pink-400',
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/15',
    hoverBorder: 'hover:border-pink-500/30',
    hoverBg: 'hover:bg-pink-500/[0.04]',
    glow: 'hover:shadow-[0_8px_40px_rgba(236,72,153,0.08)]',
    numColor: 'text-pink-500/[0.06]',
  },
] as const;

/* ── Component ─────────────────────────────────────────── */
const Home = () => {
  const [showStickyShare, setShowStickyShare] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = '¡BASTA! — Todo nuevo comienzo empieza con un ¡BASTA!';

    const handleScroll = () => setShowStickyShare(window.scrollY > 600);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToContent = () => {
    document.getElementById('narrative-start')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleShare = () => {
    const text = encodeURIComponent(
      `¡BASTA! No es solo un grito, es una reconstrucción. Cinco misiones, seis verbos, y millones de autores. ${window.location.origin}`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 selection:bg-blue-500/30 font-sans">
      <Header />

      <main>
        {/* ═══ 1. HERO ═══════════════════════════════════ */}
        <HeroCinema
          title={
            <span className="flex flex-col items-center">
              <span className="block text-[clamp(4rem,12vw,9rem)] font-black tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-400 mb-4 filter drop-shadow-2xl">
                ¡BASTA!
              </span>
              <span className="block text-[clamp(1.4rem,3.5vw,2.6rem)] font-serif italic text-blue-200/90 font-light">
                Todo nuevo comienzo empieza con un ¡BASTA!
              </span>
            </span>
          }
          subtitle="No venimos a pedir permiso: venimos a coordinar poder ciudadano, barrio por barrio."
          ctaText="VER LA VISIÓN"
          ctaLink="/la-vision"
          onScrollDown={scrollToContent}
        />

        {/* ═══ 2 & 3. NARRATIVE ══════════════════════════ */}
        <div id="narrative-start">
          <BastaPrincipio />
          <AparatoPolitico />
        </div>

        {/* ═══ 3.5. FIVE MISSIONS ═════════════════════════ */}
        <section className="py-28 md:py-36 bg-[#0a0a0a] relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage:
              'radial-gradient(at 30% 40%, hsla(200,70%,50%,0.04) 0px, transparent 50%),' +
              'radial-gradient(at 70% 70%, hsla(40,70%,50%,0.03) 0px, transparent 50%)',
          }} />

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="text-center mb-14"
              >
                <span className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/[0.08] text-[11px] uppercase tracking-[0.3em] text-amber-300/70 mb-6">
                  Cinco misiones nacionales
                </span>
                <h2 className="text-4xl md:text-[3.5rem] lg:text-6xl font-black text-white mb-6 tracking-tight leading-[0.95]">
                  No hay reconstrucción
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-red-400">
                    sin orden de prioridad
                  </span>
                </h2>
                <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
                  Miramos la Argentina real y encontramos cinco heridas que no se pueden resolver por separado.
                </p>
              </motion.div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { num: '01', title: 'La Base Está', desc: 'Agua, vivienda, salud, energía, seguridad de proximidad', accent: 'text-blue-400', border: 'border-blue-500/15', bg: 'bg-blue-500/10', numColor: 'text-blue-500/[0.06]' },
                  { num: '02', title: 'Territorio Legible', desc: 'Señales, mandatos, datos abiertos, rieles digitales básicos', accent: 'text-emerald-400', border: 'border-emerald-500/15', bg: 'bg-emerald-500/10', numColor: 'text-emerald-500/[0.06]' },
                  { num: '03', title: 'Producción y Suelo Vivo', desc: 'Empleo útil, suelo regenerado, empresas bastardas, cadenas territoriales', accent: 'text-amber-400', border: 'border-amber-500/15', bg: 'bg-amber-500/10', numColor: 'text-amber-500/[0.06]' },
                  { num: '04', title: 'Infancia, Escuela y Cultura', desc: 'Niñez cuidada, escuela significativa, cultura viva', accent: 'text-purple-400', border: 'border-purple-500/15', bg: 'bg-purple-500/10', numColor: 'text-purple-500/[0.06]' },
                  { num: '05', title: 'Instituciones y Futuro', desc: 'Justicia, integridad, anticaptura, pacto institucional duradero', accent: 'text-red-400', border: 'border-red-500/15', bg: 'bg-red-500/10', numColor: 'text-red-500/[0.06]' },
                ].map((mission, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.08 }}
                    className={`relative rounded-2xl bg-white/[0.02] border ${mission.border} p-6 overflow-hidden`}
                  >
                    <span className={`absolute -top-2 right-3 text-[4.5rem] font-black ${mission.numColor} leading-none select-none pointer-events-none`}>
                      {mission.num}
                    </span>
                    <div className={`w-8 h-8 rounded-lg ${mission.bg} flex items-center justify-center mb-3 ${mission.accent} text-sm font-bold border ${mission.border}`}>
                      {mission.num}
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{mission.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{mission.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ 4. THE JOURNEY ════════════════════════════ */}
        <section className="py-28 md:py-36 bg-[#0a0a0a] relative overflow-hidden">
          {/* Multi-color ambient glow */}
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage:
              'radial-gradient(at 20% 30%, hsla(220,80%,50%,0.04) 0px, transparent 50%),' +
              'radial-gradient(at 80% 60%, hsla(280,80%,50%,0.04) 0px, transparent 50%),' +
              'radial-gradient(at 50% 90%, hsla(150,80%,50%,0.03) 0px, transparent 50%)',
          }} />

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-7xl mx-auto">
              {/* Section Header */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="text-center mb-16 md:mb-20"
              >
                <span className="text-slate-500 tracking-[0.3em] text-xs font-bold uppercase mb-6 block">
                  El camino
                </span>
                <h2 className="text-4xl md:text-[3.5rem] lg:text-6xl font-black text-white mb-6 tracking-tight leading-[0.95]">
                  De ver la herida a probar
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400">
                    que se puede reconstruir
                  </span>
                </h2>
                <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
                  Ver. Entender. Declarar. Servir. Probar. Multiplicar.
                  Seis verbos. Una arquitectura cívica.
                </p>
              </motion.div>

              {/* Step Grid — 3 + 2 layout */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
                {steps.map((step, i) => (
                  <Link key={i} href={step.href}>
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: i * 0.08 }}
                      className="group cursor-pointer relative h-full"
                    >
                      <div className={`
                        h-full relative rounded-2xl bg-white/[0.02] border ${step.border}
                        ${step.hoverBorder} ${step.hoverBg} ${step.glow}
                        transition-all duration-500 hover:-translate-y-1 overflow-hidden
                      `}>
                        {/* Top accent line */}
                        <div className={`h-[3px] bg-gradient-to-r ${step.accent} opacity-60 group-hover:opacity-100 transition-opacity duration-500`} />

                        <div className="p-7 relative">
                          {/* Ghost number */}
                          <span className={`absolute -top-2 right-3 text-[5.5rem] font-black ${step.numColor} leading-none select-none pointer-events-none transition-all duration-500 group-hover:opacity-[0.12]`}>
                            {step.num}
                          </span>

                          {/* Icon */}
                          <div className={`w-11 h-11 rounded-xl ${step.bg} flex items-center justify-center mb-5 ${step.text} border ${step.border} group-hover:scale-110 transition-transform duration-500`}>
                            {step.icon}
                          </div>

                          {/* Subtitle */}
                          <p className={`text-[11px] font-semibold uppercase tracking-[0.2em] ${step.text} mb-1.5 opacity-80`}>
                            {step.subtitle}
                          </p>

                          {/* Title */}
                          <h3 className="text-[1.35rem] font-bold text-white mb-3 group-hover:text-slate-50 transition-colors">
                            {step.title}
                          </h3>

                          {/* Description */}
                          <p className="text-slate-400 text-[15px] leading-relaxed mb-6">
                            {step.description}
                          </p>

                          {/* CTA link */}
                          <div className={`flex items-center ${step.text} text-xs font-semibold uppercase tracking-wider group-hover:translate-x-1 transition-transform duration-300`}>
                            {step.cta}
                            <ArrowRight className="w-3.5 h-3.5 ml-2" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ 5. FINAL CTA ══════════════════════════════ */}
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

                <h2 className="text-4xl md:text-[3.5rem] font-black text-white mb-6 tracking-tight leading-[0.95]">
                  No venimos a administrar ruinas.
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                    Venimos a dejar armado un país que sepa escucharse, priorizar, producir, cuidarse y corregirse.
                  </span>
                </h2>

                <p className="text-lg text-slate-400 mb-10 max-w-xl mx-auto leading-relaxed">
                  Elegí tu primer verbo: ver lo que pasa, entender el marco, o declarar lo que no vas a negociar.
                  No hace falta esperar a millones. Hace falta dejar de delegar la primera parte.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/la-vision">
                    <Button
                      size="lg"
                      className="relative group bg-blue-600 hover:bg-blue-500 text-white px-9 py-6 rounded-full text-base font-semibold shadow-[0_0_30px_rgba(37,99,235,0.25)] hover:shadow-[0_0_50px_rgba(37,99,235,0.35)] transition-all duration-500 hover:-translate-y-0.5 overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center">
                        Empezar por La Visión
                        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                      <div className="absolute inset-0 rounded-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md" />
                    </Button>
                  </Link>
                  <Link href="/el-mapa">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-white/10 text-slate-300 bg-white/[0.03] hover:bg-white/[0.07] hover:text-white hover:border-white/20 px-9 py-6 rounded-full text-base font-semibold transition-all duration-300 hover:-translate-y-0.5"
                    >
                      Ir al Mapa Ciudadano
                      <MapPin className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </div>
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
              className="fixed bottom-6 right-6 z-50"
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
