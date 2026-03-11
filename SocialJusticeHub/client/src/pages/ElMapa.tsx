import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SovereignMap from '@/components/SovereignMap';
import MeaningNetwork from '@/components/MeaningNetwork';
import MapPulseAnalytics from '@/components/MapPulseAnalytics';
import ConstellationGraph from '@/components/ConstellationGraph';
import PowerCTA from '@/components/PowerCTA';
import NextStepCard from '@/components/NextStepCard';
import {
  Compass,
  Anchor,
  Target,
  ShieldCheck,
  Brain,
  Wrench,
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
          title="El Mandato Vivo"
          description="Los datos del mapa se convierten en mandatos territoriales. Descubrí cómo la convergencia de voces genera el plan de acción."
          href="/el-mandato-vivo"
          gradient="from-[#1a1500] to-[#1e1a0b]"
          icon={<Target className="w-5 h-5" />}
        />

      </main>

      <Footer />
    </div>
  );
};

export default ElMapa;
