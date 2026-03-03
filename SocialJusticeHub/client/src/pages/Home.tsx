import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroCinema from '@/components/HeroCinema';
import BastaPrincipio from '@/components/BastaPrincipio';
import AparatoPolitico from '@/components/AparatoPolitico';
import TerrenoLimpio from '@/components/TerrenoLimpio';
import NextStepCard from '@/components/NextStepCard';
import { Eye, Sprout, Users, Target, ArrowRight, Share2, Brain, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

const Home = () => {
  const [showStickyShare, setShowStickyShare] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = '¡BASTA! - Todo nuevo comienzo empieza con un ¡BASTA!';

    const handleScroll = () => {
      if (window.scrollY > 600) {
        setShowStickyShare(true);
      } else {
        setShowStickyShare(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToContent = () => {
    const element = document.getElementById('narrative-start');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleShare = () => {
    const shareText = encodeURIComponent(
      `¡BASTA! No es solo un grito, es un movimiento. Argentina despierta. El cambio empieza en cada uno de nosotros. ${window.location.origin}`
    );
    window.open(`https://twitter.com/intent/tweet?text=${shareText}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 selection:bg-blue-500/30 font-sans">
      <Header />
      <main>
        {/* 1. HERO: The Call to Adventure */}
        <HeroCinema 
          title={
            <span className="flex flex-col items-center">
              <span className="block text-[clamp(4rem,12vw,9rem)] font-black tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-400 mb-4 filter drop-shadow-2xl">
                ¡BASTA!
              </span>
              <span className="block text-[clamp(1.5rem,4vw,3rem)] font-serif italic text-blue-200 font-light">
                Todo nuevo comienzo empieza con un ¡BASTA!
              </span>
            </span>
          }
          subtitle="No venimos a pedir permiso: venimos a coordinar poder ciudadano, barrio por barrio."
          ctaText="VER LA VISIÓN"
          ctaLink="/la-vision"
          backgroundImage="https://images.unsplash.com/photo-1532186651327-6ac23687d078?q=80&w=2669&auto=format&fit=crop"
          onScrollDown={scrollToContent}
        />

        <div id="narrative-start">
          {/* 2. ¡BASTA! Como Principio */}
          <BastaPrincipio />

          {/* 3. Cómo poner al aparato político a trabajar para el pueblo */}
          <AparatoPolitico />

          {/* 4. Terreno Limpio - Transición */}
          <TerrenoLimpio />
        </div>

        {/* 5. BRIDGE TO VISION: The Why */}
        <section className="py-32 relative overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#111] to-[#0a0a0a]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent opacity-50" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative"
              >
                {/* Portal Effect */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />
                
                <Eye className="w-16 h-16 text-blue-400 mx-auto mb-8 animate-pulse" />
                
                <h2 className="heading-section mb-8">
                  Primero entender, después avanzar
                </h2>

                <p className="text-xl md:text-2xl text-slate-300 leading-relaxed mb-10 font-light">
                  El punto de partida no es una consigna: es un diagnóstico compartido.
                  <strong className="text-white font-medium"> La Visión</strong> traduce datos reales, prioridades ciudadanas y escenarios de futuro en una hoja de ruta clara para orientar decisiones públicas.
                </p>

                <Link href="/la-vision">
                  <Button 
                    className="bg-transparent border border-blue-500/30 text-blue-300 hover:bg-blue-500/10 hover:text-white hover:border-blue-400 px-8 py-6 rounded-full text-lg transition-all duration-300"
                  >
                    VER LA VISIÓN COMPLETA
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* 6. THE SOLUTION: The Journey Grid */}
        <section id="plan-transformacion" className="py-32 bg-[#0a0a0a] relative">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-center mb-24"
              >
                <span className="text-blue-500 tracking-[0.3em] text-sm font-bold uppercase mb-4 block">El Camino</span>
                <h2 className="heading-section mb-6">Hoja de Ruta de Transformación</h2>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
                  Este recorrido ordena el proceso completo: entender la realidad, formar criterio, pasar a la acción, coordinar esfuerzos y sostener comunidad.
                </p>
              </motion.div>

              {/* Journey Grid - 5 Steps */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 relative">
                {/* Step 1 - La Visión */}
                <Link href="/la-vision">
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="group cursor-pointer relative"
                  >
                    <div className="h-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:bg-white/[0.07] hover:border-blue-500/30 transition-all duration-500 overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <span className="text-7xl font-serif font-bold text-white">01</span>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-blue-500/20 text-blue-400">
                        <Eye className="w-6 h-6" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-300 transition-colors">La Visión</h3>
                      <p className="text-slate-400 mb-2 text-sm font-semibold uppercase tracking-wider text-blue-400/80">Diagnóstico compartido</p>
                      <p className="text-slate-400 text-base mb-6 leading-relaxed">Una lectura clara de la Argentina real para alinear prioridades, evitar improvisación y orientar decisiones con evidencia.</p>
                      <div className="flex items-center text-blue-400 font-medium tracking-wide uppercase text-xs group-hover:translate-x-2 transition-transform">
                        Ver diagnóstico <ArrowRight className="w-4 h-4 ml-2" />
                      </div>
                    </div>
                  </motion.div>
                </Link>

                {/* Step 2 - El Hombre Gris */}
                <Link href="/el-instante-del-hombre-gris">
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="group cursor-pointer relative"
                  >
                    <div className="h-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:bg-white/[0.07] hover:border-purple-500/30 transition-all duration-500 overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <span className="text-7xl font-serif font-bold text-white">02</span>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-purple-500/20 text-purple-400">
                        <Brain className="w-6 h-6" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors">El Hombre Gris</h3>
                      <p className="text-slate-400 mb-2 text-sm font-semibold uppercase tracking-wider text-purple-400/80">Cambio cultural</p>
                      <p className="text-slate-400 text-base mb-6 leading-relaxed">Un marco ético y práctico para pasar del enojo disperso a una forma madura de participación y liderazgo ciudadano.</p>
                      <div className="flex items-center text-purple-400 font-medium tracking-wide uppercase text-xs group-hover:translate-x-2 transition-transform">
                        Profundizar <ArrowRight className="w-4 h-4 ml-2" />
                      </div>
                    </div>
                  </motion.div>
                </Link>

                {/* Step 3 - La Semilla */}
                <Link href="/la-semilla-de-basta">
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="group cursor-pointer relative"
                  >
                    <div className="h-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:bg-white/[0.07] hover:border-emerald-500/30 transition-all duration-500 overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <span className="text-7xl font-serif font-bold text-white">03</span>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-emerald-500/20 text-emerald-400">
                        <Sprout className="w-6 h-6" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-emerald-300 transition-colors">La Semilla</h3>
                      <p className="text-slate-400 mb-2 text-sm font-semibold uppercase tracking-wider text-emerald-400/80">Primer movimiento</p>
                      <p className="text-slate-400 text-base mb-6 leading-relaxed">Convertir visión en hábito: una acción concreta, repetible y medible para generar tracción real desde el primer día.</p>
                      <div className="flex items-center text-emerald-400 font-medium tracking-wide uppercase text-xs group-hover:translate-x-2 transition-transform">
                        Activar <ArrowRight className="w-4 h-4 ml-2" />
                      </div>
                    </div>
                  </motion.div>
                </Link>

                {/* Step 4 - El Mapa */}
                <Link href="/el-mapa">
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="group cursor-pointer relative"
                  >
                    <div className="h-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:bg-white/[0.07] hover:border-orange-500/30 transition-all duration-500 overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <span className="text-7xl font-serif font-bold text-white">04</span>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-orange-500/20 text-orange-400">
                        <MapPin className="w-6 h-6" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-orange-300 transition-colors">El Mapa</h3>
                      <p className="text-slate-400 mb-2 text-sm font-semibold uppercase tracking-wider text-orange-400/80">Coordinación territorial</p>
                      <p className="text-slate-400 text-base mb-6 leading-relaxed">Una infraestructura abierta para conectar personas, causas y acciones locales con foco en impacto colectivo.</p>
                      <div className="flex items-center text-orange-400 font-medium tracking-wide uppercase text-xs group-hover:translate-x-2 transition-transform">
                        Entrar al mapa <ArrowRight className="w-4 h-4 ml-2" />
                      </div>
                    </div>
                  </motion.div>
                </Link>

                {/* Step 5 - La Tribu */}
                <Link href="/community">
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                    className="group cursor-pointer relative md:col-span-2 lg:col-span-1"
                  >
                    <div className="h-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:bg-white/[0.07] hover:border-pink-500/30 transition-all duration-500 overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <span className="text-7xl font-serif font-bold text-white">05</span>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-pink-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-pink-500/20 text-pink-400">
                        <Users className="w-6 h-6" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-pink-300 transition-colors">La Tribu</h3>
                      <p className="text-slate-400 mb-2 text-sm font-semibold uppercase tracking-wider text-pink-400/80">Comunidad activa</p>
                      <p className="text-slate-400 text-base mb-6 leading-relaxed">Un espacio para sostener aprendizaje, colaboración y ejecución. La transformación se consolida cuando nadie trabaja solo.</p>
                      <div className="flex items-center text-pink-400 font-medium tracking-wide uppercase text-xs group-hover:translate-x-2 transition-transform">
                        Sumarme <ArrowRight className="w-4 h-4 ml-2" />
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 5. FINAL CALL: The Hook */}
        <NextStepCard
          title="El primer paso es comprender"
          description="Antes de actuar, necesitamos una lectura común de la realidad. Entrá a La Visión y revisá la hoja de ruta completa."
          href="/la-vision"
          gradient="from-[#1a1f2c] to-[#32244f]"
          icon={<Eye className="w-5 h-5" />}
        />

        <Footer />

        {/* Sticky Share Button */}
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
                className="rounded-full h-14 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-2xl shadow-blue-900/50 flex items-center gap-3 transition-transform hover:scale-105"
              >
                <Share2 className="w-5 h-5" />
                <span className="font-bold tracking-wide hidden md:inline">COMPARTIR EL DESPERTAR</span>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Home;
