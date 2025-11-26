import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SovereignMap from '@/components/SovereignMap';
import SystemHierarchy from '@/components/SystemHierarchy';
import ImpactCaseStudy from '@/components/ImpactCaseStudy';
import MapPulseAnalytics from '@/components/MapPulseAnalytics';
import PowerCTA from '@/components/PowerCTA';
import NextStepCard from '@/components/NextStepCard';
import { 
  Compass, 
  Anchor, 
  Target, 
  ShieldCheck, 
  Brain, 
  Map as MapIcon
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

        {/* PULSE ANALYTICS: Intelligence Dashboard */}
        <section className="py-24 bg-[#0f1116] border-y border-white/5">
          <div className="container-content">
            <div className="text-center mb-16">
              <span className="text-blue-500 font-mono text-xs tracking-[0.3em] uppercase">Inteligencia en Tiempo Real</span>
              <h2 className="text-4xl font-bold text-white mt-4 mb-6">El Pulso del Territorio</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">
                Cada contribución genera datos. Cada dato revela patrones. 
                Cada patrón es una orden para la acción política.
              </p>
            </div>
            <MapPulseAnalytics />
          </div>
        </section>

        {/* MANIFESTO II: System Engineering */}
        <section className="py-24 bg-[#0a0a0a] relative overflow-hidden">
          {/* Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f0a_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f0a_1px,transparent_1px)] bg-[size:14px_24px]" />
          
          <div className="container-content relative z-10">
            <div className="max-w-5xl mx-auto mb-16 text-center">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-8">
                Ingeniería de Sistemas Humanos
              </h2>
              <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
                El problema argentino es un error de diseño: dejamos que un subsistema (la política) 
                decida el propósito de todo el sistema (el país). Es hora de invertir la pirámide.
              </p>
            </div>

            <SystemHierarchy />

            <div className="mt-20 grid md:grid-cols-3 gap-8 text-center">
              {[
                { title: "El Ciudadano", action: "DEFINE", desc: "Establece el propósito y el 'qué'." },
                { title: "El Estado", action: "ADMINISTRA", desc: "Gestiona los recursos para ese fin." },
                { title: "La Política", action: "EJECUTA", desc: "Implementa las soluciones técnicas." }
              ].map((item, i) => (
                <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <h3 className="text-slate-500 text-sm uppercase tracking-widest mb-2">{item.title}</h3>
                  <p className="text-2xl font-bold text-white mb-2">{item.action}</p>
                  <p className="text-slate-400 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* STRATEGIC IMPACT: Case Studies */}
        <section className="py-24 bg-gradient-to-b from-[#0f1116] to-[#0a0a0a]">
          <div className="container-content">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
              <div className="max-w-2xl">
                <h2 className="text-3xl font-bold text-white mb-6">
                  La Política ya no tiene excusas
                </h2>
                <p className="text-slate-400 text-lg">
                  El mapa se ha convertido en la herramienta de consulta #1 para concejales 
                  y nuevos líderes que entienden que la legitimidad nace de los datos, no de los discursos.
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
