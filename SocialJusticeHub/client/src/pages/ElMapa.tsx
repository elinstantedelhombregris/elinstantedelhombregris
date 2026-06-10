import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useInView, animate } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SovereignMap from '@/components/SovereignMap';
import ConvergenceDashboard from '@/components/ConvergenceDashboard';
import NarrativeBridge from '@/components/NarrativeBridge';
import MapPulseAnalytics from '@/components/MapPulseAnalytics';
import PowerCTA from '@/components/PowerCTA';
import NextStepCard from '@/components/NextStepCard';
import { useConvergenceAnalysis } from '@/hooks/useConvergenceAnalysis';
import { JourneyBadge } from '@/components/ui/JourneyBadge';
import * as Accordion from '@radix-ui/react-accordion';
import { Link } from 'wouter';
import {
  Compass,
  Target,
  ShieldCheck,
  Brain,
  Wrench,
  ChevronDown,
  ArrowDown,
} from 'lucide-react';

// ─── Hero Stat (animated counter) ───

const HeroStat: React.FC<{ value: number; suffix: string; label: string }> = ({
  value, suffix, label,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const mv = useMotionValue(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(mv, value, {
      duration: 1.8,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return controls.stop;
  }, [isInView, value, mv]);

  return (
    <div ref={ref} className="text-center">
      <span className="text-3xl md:text-4xl font-black text-white tabular-nums">
        {display.toLocaleString('es-AR')}{suffix}
      </span>
      <span className="block text-xs text-slate-400 mt-1 font-mono uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
};

// ─── Page ───

const ElMapa = () => {
  const { convergencePercentage, totalContributions } = useConvergenceAnalysis();

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'El Mapa — ¡BASTA!';
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 selection:bg-blue-900/30 font-sans">
      <Header />

      <main className="overflow-hidden">

        {/* ═══ SECTION 1: HERO + KILLER STAT ═══ */}
        <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
          {/* Background FX */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-950/40 via-[#0a0a0a] to-[#0a0a0a]" />
          {/* Ambient blob */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-blue-600/[0.06] rounded-full blur-[160px] pointer-events-none" />

          <div className="container mx-auto px-4 relative z-10 text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center gap-3 mb-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/[0.08] text-[11px] uppercase tracking-[0.3em] text-blue-300 font-mono">
                <Compass className="w-4 h-4 animate-pulse" />
                El país, en sus propias palabras
              </div>
              <JourneyBadge step={4} />
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold leading-tight mb-4"
            >
              El{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                Mapa
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.25 }}
              className="text-sm font-mono uppercase tracking-[0.25em] text-slate-500 mb-8"
            >
              La brújula soberana del pueblo
            </motion.p>

            {/* Subtitle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.3 }}
            >
              <p className="text-xl md:text-2xl text-slate-300/90 max-w-2xl mx-auto leading-relaxed font-light">
                Acá marcás en el mapa lo que soñás, lo que te falta y lo que ya no bancás.
                Cuando todo eso se ve junto, la política se queda sin excusas.
              </p>
            </motion.div>

            {/* Hero CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.45 }}
              className="mt-10"
            >
              <button
                type="button"
                onClick={() => document.getElementById('mapa-interactivo')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center gap-2.5 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-semibold text-base transition-all duration-300 hover:-translate-y-0.5 shadow-[0_0_30px_rgba(37,99,235,0.25)]"
              >
                Dejar mi señal en el mapa
                <ArrowDown className="w-4 h-4" />
              </button>
              <p className="mt-3 text-xs text-slate-500">Una frase alcanza. Treinta segundos.</p>
            </motion.div>

            {/* Killer stats */}
            {totalContributions > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="mt-12 flex items-center justify-center gap-8 md:gap-12"
              >
                <HeroStat
                  value={totalContributions}
                  suffix=""
                  label="voces"
                />
                <div className="w-px h-10 bg-white/10" />
                <HeroStat
                  value={convergencePercentage}
                  suffix="%"
                  label="convergencia"
                />
              </motion.div>
            )}

            {/* Live feed indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
              className="mt-10"
            >
              <div className="flex justify-center gap-2 text-xs text-slate-400 font-mono uppercase tracking-widest">
                <span>En vivo</span>
                <span className="animate-pulse text-red-500">●</span>
                <span>Señales llegando de todo el país</span>
              </div>
            </motion.div>
          </div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-1.5">
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-white/60"
                animate={{ y: [0, 16, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
          </motion.div>
        </section>

        {/* ═══ POR QUÉ ESTE MAPA (visible) ═══ */}
        <section className="py-16 border-t border-white/5">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 text-center">
                ¿Por qué este mapa?
              </h2>
              <p className="text-slate-400 leading-relaxed text-center max-w-2xl mx-auto mb-8">
                Porque la política decide a ciegas — o peor, decide por otros.
                Pero si el pueblo define claramente:
              </p>
              <ul className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-8">
                <li className="flex items-center gap-3 rounded-xl bg-white/[0.03] border border-white/[0.07] px-5 py-4 text-slate-300">
                  <Target className="w-5 h-5 text-blue-400 flex-shrink-0" /> Qué necesita para vivir bien
                </li>
                <li className="flex items-center gap-3 rounded-xl bg-white/[0.03] border border-white/[0.07] px-5 py-4 text-slate-300">
                  <Brain className="w-5 h-5 text-purple-400 flex-shrink-0" /> Qué sueña para su futuro
                </li>
                <li className="flex items-center gap-3 rounded-xl bg-white/[0.03] border border-white/[0.07] px-5 py-4 text-slate-300">
                  <ShieldCheck className="w-5 h-5 text-amber-400 flex-shrink-0" /> Qué no está dispuesto a negociar
                </li>
                <li className="flex items-center gap-3 rounded-xl bg-white/[0.03] border border-white/[0.07] px-5 py-4 text-slate-300">
                  <Wrench className="w-5 h-5 text-teal-400 flex-shrink-0" /> Qué puede aportar al cambio
                </li>
              </ul>
              <p className="font-semibold text-blue-200 text-center text-lg mb-6">
                Entonces la política pierde margen para desviarse.
              </p>

              <Accordion.Root type="single" collapsible className="max-w-2xl mx-auto">
                <Accordion.Item value="manifesto">
                  <Accordion.Trigger className="group flex items-center justify-center gap-2 w-full py-3 text-center">
                    <span className="text-sm font-mono uppercase tracking-[0.2em] text-slate-500 group-hover:text-slate-300 transition-colors">
                      La metáfora completa: el barco sin brújula
                    </span>
                    <ChevronDown className="w-4 h-4 text-slate-500 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                  </Accordion.Trigger>
                  <Accordion.Content className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                    <div className="pb-8 pt-2 space-y-6">
                      <div className="prose prose-invert prose-sm text-slate-400 leading-relaxed mx-auto">
                        <p>
                          La ausencia de visión deja a la clase política sin guía.
                          Como un barco a la deriva, oscilan entre lo urgente y lo absurdo,
                          tomando decisiones que nadie pidió.
                        </p>
                      </div>
                      <div className="relative bg-gradient-to-br from-blue-900/10 to-transparent rounded-3xl border border-white/5 p-8 flex items-center justify-center">
                        <blockquote className="text-xl font-serif italic text-center text-slate-300">
                          "Lo evidente disciplina.<br />
                          Lo invisible habilita el abuso."
                        </blockquote>
                      </div>
                    </div>
                  </Accordion.Content>
                </Accordion.Item>
              </Accordion.Root>
            </div>
          </div>
        </section>

        {/* ═══ SECTION 2: SOVEREIGN MAP (promoted) ═══ */}
        <section id="mapa-interactivo" className="py-16 relative">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <span className="text-blue-500 font-mono text-xs tracking-[0.3em] uppercase">
                La herramienta · En vivo
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mt-4 mb-4">
                Poné tu verdad en el mapa
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-sm leading-relaxed">
                Elegí qué querés decir: un{' '}
                <span className="text-blue-400 font-medium">sueño</span> que tenés, un{' '}
                <span className="text-pink-400 font-medium">valor</span> que defendés, una{' '}
                <span className="text-amber-400 font-medium">necesidad</span> que no espera, un{' '}
                <span className="text-red-400 font-medium">¡basta!</span> que ponés como límite, un{' '}
                <span className="text-emerald-400 font-medium">compromiso</span> que asumís o un{' '}
                <span className="text-teal-400 font-medium">recurso</span> que podés aportar.
                Una frase alcanza.
              </p>
            </div>

            <div className="relative z-20">
              <SovereignMap />
            </div>

            <p className="text-center text-sm text-slate-500 mt-6 max-w-2xl mx-auto">
              Cada señal alimenta el{' '}
              <Link href="/el-mandato-vivo" className="text-blue-400 hover:text-blue-300 transition-colors">Mandato Vivo</Link>{' '}
              de tu territorio — y muestra, con datos, lo que la gente realmente quiere.
              ¿Querés ver cómo podría verse el diseño terminado? Mirá los{' '}
              <Link href="/recursos/ruta" className="text-amber-400 hover:text-amber-300 transition-colors">22 planes de ejemplo</Link>.
            </p>
          </div>
        </section>

        {/* ═══ BRIDGE 1 ═══ */}
        <NarrativeBridge text="Cada punto es una verdad. Ahora mirá lo que emerge cuando se suman." />

        {/* ═══ SECTION 3: CONVERGENCE DASHBOARD ═══ */}
        <ConvergenceDashboard />

        {/* ═══ BRIDGE 2 ═══ */}
        <NarrativeBridge text="Eso que sentís, lo siente tu vecino. Así late el territorio." />

        {/* ═══ SECTION 4: TERRITORY PULSE ═══ */}
        <section className="py-24 bg-[#0f1116] border-y border-white/5">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="text-blue-500 font-mono text-xs tracking-[0.3em] uppercase">
                Síntesis territorial
              </span>
              <h2 className="text-4xl font-bold text-white mt-4 mb-6">
                El Pulso del Territorio
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto">
                Lo que pensás, lo piensa tu vecino. Lo que soñás, lo sueña tu país.
                Esta es la prueba.
              </p>
            </div>
            <MapPulseAnalytics />
          </div>
        </section>

        {/* ═══ SECTION 5: CTA TO EXPLORAR DATOS ═══ */}
        <section className="py-24 relative">
          <div className="absolute inset-0 bg-purple-900/5" />
          <div className="container mx-auto px-4 relative z-10 text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              ¿Querés ir más profundo?
            </h2>
            <p className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto">
              Visualizaciones avanzadas, flujos de datos entre territorios,
              y la inteligencia que emerge cuando miles hablan.
            </p>

            <div className="flex justify-center">
              <PowerCTA
                text="VER LOS DATOS DEL PAÍS"
                href="/explorar-datos"
                variant="accent"
                size="xl"
                animate={true}
              />
            </div>
          </div>
        </section>

        {/* ═══ CLOSING PATTERN ═══ */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm p-8 md:p-10 space-y-6">
              {[
                { label: 'Qué estamos viendo', text: 'Un país que siente mucho pero no tiene dónde depositar su verdad de manera útil.', color: 'text-emerald-400' },
                { label: 'Qué hacemos ahora', text: 'Volver legible lo que hoy está disperso. Cada señal es un acto de servicio.', color: 'text-emerald-400' },
                { label: 'Qué no vamos a hacer todavía', text: 'Publicar como representativo lo que todavía es parcial. Los territorios con baja cobertura se marcan como tales.', color: 'text-blue-400' },
                { label: 'Cómo se mide', text: 'Cobertura territorial, densidad de señal por tipo, tiempo entre señal y síntesis.', color: 'text-emerald-400' },
                { label: 'Qué podés hacer vos', text: 'Cargar tu verdad en el mapa. Explorar los datos en profundidad. Es servicio. Es orden. Es dignidad.', color: 'text-emerald-400' },
              ].map((item, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                  <span className={`${item.color} font-bold text-sm whitespace-nowrap min-w-[220px]`}>
                    {item.label}:
                  </span>
                  <span className="text-slate-400 text-sm leading-relaxed">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ NEXT STEPS ═══ */}
        <NextStepCard
          title="El Mandato Vivo"
          description="Lo que se carga acá no queda flotando: cada semana se sintetiza en un documento que dice, con datos, qué pide cada territorio. Mirá cómo sigue."
          href="/el-mandato-vivo"
          gradient="from-[#1a1500] to-[#1e1a0b]"
          icon={<Target className="w-5 h-5" />}
          ctaLabel="Ver el Mandato Vivo"
        />

      </main>

      <Footer />
    </div>
  );
};

export default ElMapa;
