import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SovereignMap from '@/components/SovereignMap';
import MeaningNetwork from '@/components/MeaningNetwork';
import ImpactCaseStudy from '@/components/ImpactCaseStudy';
import MapPulseAnalytics from '@/components/MapPulseAnalytics';
import ConstellationGraph from '@/components/ConstellationGraph';
import GapAnalysisDashboard from '@/components/GapAnalysisDashboard';
import PowerCTA from '@/components/PowerCTA';
import NextStepCard from '@/components/NextStepCard';
import {
  Compass,
  Anchor,
  Target,
  ShieldCheck,
  Brain,
  Map as MapIcon,
  Wrench,
  ArrowRight
} from 'lucide-react';

const ElMapa = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'El Mapa de Mando - Soberanía en Tiempo Real';
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 selection:bg-blue-900/30 font-sans">
      <Header />
      
      <main className="overflow-hidden">
        
        {/* HERO: The Command Center */}
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
          {/* Background FX */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-950/40 via-[#0a0a0a] to-[#0a0a0a]" />
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]" />
          
          <div className="container-content relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-900/20 border border-blue-500/30 text-blue-400 text-xs font-mono uppercase tracking-[0.2em] mb-8">
                <Compass className="w-4 h-4 animate-pulse" />
                Sala de Situación Nacional
              </div>
              
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold leading-tight mb-8">
                La Brújula <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                  Soberana
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-light">
                Lo evidente disciplina. Lo invisible habilita el abuso. <br />
                Este es el mapa que devuelve el mando a su dueño legítimo.
              </p>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="mt-12"
              >
                <div className="flex justify-center gap-2 text-xs text-slate-500 font-mono uppercase tracking-widest">
                  <span>Live Feed</span>
                  <span className="animate-pulse text-red-500">●</span>
                  <span>Sincronizando Visión Nacional</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
          
          {/* Scroll Indicator */}
          <motion.div 
            className="absolute bottom-10 left-1/2 -translate-x-1/2 text-slate-600"
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Anchor className="w-6 h-6" />
          </motion.div>
        </section>

        {/* MANIFESTO I: The Lost Compass */}
        <section className="py-24 bg-[#0f1116] border-y border-white/5 relative">
          <div className="container-content">
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-16 items-center">
                <div className="space-y-8">
                  <h2 className="text-3xl font-bold text-white border-l-4 border-blue-500 pl-6">
                    El Barco sin Brújula
                  </h2>
                  <div className="prose prose-invert prose-lg text-slate-400 leading-relaxed">
                    <p>
                      La ausencia de visión deja a la clase política sin guía. 
                      Como un barco a la deriva, oscilan entre lo urgente y lo absurdo, 
                      tomando decisiones que nadie pidió.
                    </p>
                    <p>
                      Pero si el pueblo define claramente:
                    </p>
                    <ul className="space-y-2 my-4">
                      <li className="flex items-center gap-3">
                        <Target className="w-4 h-4 text-blue-400 flex-shrink-0" /> Qué necesita para vivir bien
                      </li>
                      <li className="flex items-center gap-3">
                        <Brain className="w-4 h-4 text-purple-400 flex-shrink-0" /> Qué sueña para su futuro
                      </li>
                      <li className="flex items-center gap-3">
                        <ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0" /> Qué no está dispuesto a negociar
                      </li>
                      <li className="flex items-center gap-3">
                        <Wrench className="w-4 h-4 text-teal-400 flex-shrink-0" /> Qué puede aportar al cambio
                      </li>
                    </ul>
                    <p className="font-semibold text-blue-200">
                      Entonces la política pierde margen para desviarse.
                    </p>
                  </div>
                </div>
                
                <div className="relative h-full min-h-[300px] bg-gradient-to-br from-blue-900/10 to-transparent rounded-3xl border border-white/5 p-8 flex items-center justify-center">
                  <blockquote className="text-2xl font-serif italic text-center text-slate-300">
                    "Lo evidente disciplina.<br/>
                    Lo invisible habilita el abuso."
                  </blockquote>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* THE TOOL: Sovereign Map */}
        <section id="mapa-interactivo" className="py-20 relative">
          <div className="container-content">
            <div className="text-center mb-12">
              <span className="text-blue-500 font-mono text-xs tracking-[0.3em] uppercase">Herramienta Táctica</span>
              <h2 className="text-4xl font-bold text-white mt-4 mb-6">Definir el Territorio</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">
                Tu visión geolocalizada es una orden directa. Cuando miles de puntos coinciden, 
                el mandato se vuelve irrefutable.
              </p>
            </div>
            
            <div className="relative z-20">
              <SovereignMap />
            </div>
          </div>
        </section>

        {/* MEANING NETWORK: Semantic Connections */}
        <section id="red-neuronal" className="py-24 bg-gradient-to-b from-[#0a0a0a] via-[#0f1116] to-[#0a0a0a] relative overflow-hidden">
          <div className="container-content">
            <div className="text-center mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <span className="text-purple-500 font-mono text-xs tracking-[0.3em] uppercase">
                  Inteligencia Colectiva
                </span>
                <h2 className="text-4xl font-bold text-white mt-4 mb-6">
                  La Red que Nos Une
                </h2>
                <p className="text-slate-400 max-w-2xl mx-auto">
                  Todos buscamos lo mismo. Esta red muestra las palabras que compartimos,
                  los puentes entre capas y las conexiones que sostienen una visión común.
                </p>
              </motion.div>
            </div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <MeaningNetwork />
            </motion.div>
          </div>
        </section>

        {/* CONSTELLATION: Interactive Knowledge Graph */}
        <section id="constelacion" className="py-24 relative">
          <div className="container-content">
            <ConstellationGraph />
          </div>
        </section>

        {/* PULSE ANALYTICS: Intelligence Dashboard */}
        <section className="py-24 bg-[#0f1116] border-y border-white/5">
          <div className="container-content">
            <div className="text-center mb-16">
              <span className="text-blue-500 font-mono text-xs tracking-[0.3em] uppercase">Inteligencia Colectiva</span>
              <h2 className="text-4xl font-bold text-white mt-4 mb-6">El Pulso del Territorio</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">
                Lo que pensás, lo piensa tu vecino. Lo que soñás, lo sueña tu país.
                Esta es la prueba.
              </p>
            </div>
            <MapPulseAnalytics />
          </div>
        </section>

        {/* GAP ENGINE: Need vs Resource Analysis */}
        <section id="motor-brechas" className="py-24 bg-gradient-to-b from-[#0f1116] via-[#0a0a0a] to-[#0f1116] relative overflow-hidden">
          <div className="container-content">
            <div className="text-center mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <span className="text-teal-500 font-mono text-xs tracking-[0.3em] uppercase">
                  El Mandato Vivo
                </span>
                <h2 className="text-4xl font-bold text-white mt-4 mb-6">
                  El Motor de Brechas
                </h2>
                <p className="text-slate-400 max-w-2xl mx-auto">
                  La distancia entre lo que necesitamos y lo que tenemos <strong className="text-white">es</strong> el plan de acción.
                  Sin debates. Sin votaciones. Los datos hablan solos.
                </p>
              </motion.div>
            </div>

            <GapAnalysisDashboard />
          </div>
        </section>

        {/* MANDATO VIVO: Territory Mandate CTA */}
        <section id="mandato-vivo" className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-900/5 via-transparent to-teal-900/5" />
          <div className="container-content relative z-10">
            <div className="text-center mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <span className="text-amber-500 font-mono text-xs tracking-[0.3em] uppercase">
                  Democracia Directa por Datos
                </span>
                <h2 className="text-4xl font-bold text-white mt-4 mb-6">
                  El Mandato Vivo
                </h2>
                <p className="text-slate-400 max-w-2xl mx-auto mb-12">
                  Los datos del mapa se convierten en mandatos territoriales automáticos.
                  Nadie vota. Nadie debate. La convergencia de voces genera el mandato.
                  Cada territorio tiene su verdad — y esa verdad se vuelve plan de acción.
                </p>
              </motion.div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <Link href="/mandato/national/Argentina" className="group bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-amber-500/30 transition-all cursor-pointer block">
                  <div className="text-3xl mb-3">🇦🇷</div>
                  <h3 className="text-lg font-bold text-white mb-2">Mandato Nacional</h3>
                  <p className="text-sm text-slate-400">Todas las voces del país convergen en un mandato irrefutable</p>
                  <div className="mt-4 flex items-center gap-2 text-amber-400 text-sm font-mono">
                    Ver mandato <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <Link href="/mandato/province/Buenos%20Aires" className="group bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-teal-500/30 transition-all cursor-pointer block">
                  <div className="text-3xl mb-3">🗺️</div>
                  <h3 className="text-lg font-bold text-white mb-2">Mandatos Provinciales</h3>
                  <p className="text-sm text-slate-400">Cada provincia tiene su diagnóstico, sus brechas y su plan</p>
                  <div className="mt-4 flex items-center gap-2 text-teal-400 text-sm font-mono">
                    Explorar <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <Link href="/mandato/city/CABA" className="group bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-blue-500/30 transition-all cursor-pointer block">
                  <div className="text-3xl mb-3">🏙️</div>
                  <h3 className="text-lg font-bold text-white mb-2">Mandatos Municipales</h3>
                  <p className="text-sm text-slate-400">Tu barrio habla. Tu ciudad responde. El mandato se escribe solo</p>
                  <div className="mt-4 flex items-center gap-2 text-blue-400 text-sm font-mono">
                    Explorar <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* STRATEGIC IMPACT: Case Studies */}
        <section className="py-24 bg-gradient-to-b from-[#0f1116] to-[#0a0a0a]">
          <div className="container-content">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
              <div className="max-w-2xl">
                <h2 className="text-3xl font-bold text-white mb-6">
                  Imaginen qué pasaría si dejamos las cosas en claro
                </h2>
                <p className="text-slate-400 text-lg">
                  La política ya no tiene excusas; imaginen cuando escenarios como estos sean moneda corriente. Cuanta más gente alimente el mapa, más preciso se vuelve, y toda la base de datos quedará disponible para que cualquiera pueda usarla.
                </p>
              </div>
              <div className="flex items-center gap-2 text-blue-400 font-mono text-sm border-b border-blue-500/30 pb-1">
                <MapIcon className="w-4 h-4" />
                VERIFICADO EN TERRITORIO
              </div>
            </div>

            <ImpactCaseStudy />
            
          </div>
        </section>

        {/* FINAL CALL */}
        <section className="py-24 relative">
          <div className="absolute inset-0 bg-blue-900/5" />
          <div className="container-content relative z-10 text-center">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">
              Hacer visible lo que soñamos.
            </h2>
            <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto">
              No es rebelión. Es claridad absoluta. <br/>
              Un pueblo que sabe hacia dónde va, es imparable.
            </p>
            
            <div className="flex justify-center">
              <PowerCTA 
                text="OCUPÁ TU LUGAR EN EL MAPA"
                variant="primary"
                size="xl"
                onClick={() => document.getElementById('mapa-interactivo')?.scrollIntoView({ behavior: 'smooth' })}
                animate={true}
              />
            </div>
          </div>
        </section>

        {/* NEXT STEPS */}
        <NextStepCard
          title="Únete a la Tribu"
          description="Ahora que has declarado tu visión, encuentra a otros que vibran en tu misma frecuencia y comienza a construir."
          href="/community"
          gradient="from-[#0f172a] to-[#1e293b]"
          icon={<Target className="w-5 h-5" />}
        />

      </main>

      <Footer />
    </div>
  );
};

export default ElMapa;
