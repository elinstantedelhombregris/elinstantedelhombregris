import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EnsayoLinkCard from '@/components/EnsayoLinkCard';
import { useEffect, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import SystemHierarchy from '@/components/SystemHierarchy';
import NextStepCard from '@/components/NextStepCard';
import { MoonStar } from 'lucide-react';

const LaVision = () => {
  const [isVisible, setIsVisible] = useState(false);

  const { data: platformStats } = useQuery<{
    totalMembers: number;
    activeMembers: number;
    newMembersThisWeek: number;
    totalPosts: number;
    totalDreams: number;
    projectPosts: number;
    jobPosts: number;
    resourcePosts: number;
  }>({ queryKey: ['/api/stats'] });

  const { data: dreams = [] } = useQuery<Array<{
    id: number;
    userId: number | null;
    location: string | null;
    type: string;
  }>>({ queryKey: ['/api/dreams'] });

  const realStats = useMemo(() => {
    const uniqueVoices = new Set(dreams.filter(d => d.userId).map(d => d.userId)).size;
    const uniqueLocations = new Set(dreams.filter(d => d.location).map(d => d.location)).size;
    return { uniqueVoices, uniqueLocations, totalContributions: dreams.length };
  }, [dreams]);

  useEffect(() => {
    setIsVisible(true);
    window.scrollTo(0, 0);
    document.title = 'La Visión — ¡BASTA!';
  }, []);

  return (
    <div className={`min-h-screen bg-[#0a0a0a] text-slate-200 selection:bg-blue-500/30 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <Header />
      <main className="overflow-hidden">

        {/* ═══ 1. THE FRAME BREAK ═══════════════════════════════════════ */}
        <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden pt-20">
          {/* Layered ambient lighting */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] bg-blue-900/[0.06] rounded-full blur-[180px]" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-900/[0.04] rounded-full blur-[150px]" />
          </div>
          {/* Dot pattern */}
          <div className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle, rgba(148,163,184,0.12) 1px, transparent 1px)`,
              backgroundSize: '60px 60px'
            }}
          />

          <div className="container-content relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 0.5 }}
                className="mb-4"
              >
                <span className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/[0.08] text-[11px] uppercase tracking-[0.3em] text-blue-300/70">
                  El diseño de lo que viene
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold leading-tight mb-8"
              >
                <span className="text-white">La</span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400">
                  Visión
                </span>
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 0.3 }}
                className="space-y-10"
              >
                <p className="text-xl md:text-2xl text-slate-400/90 leading-relaxed">
                  Cada cuatro años te dejan elegir quién te decepciona.
                  <br />
                  Y te enseñaron a llamarle democracia.
                </p>

                <p className="text-xl md:text-2xl text-slate-400/90 leading-relaxed">
                  Crisis, esperanza, líder, traición, crisis.
                  El ciclo no es un accidente — es el diseño.
                  Tu rol en ese diseño siempre fue el mismo: elegir entre las opciones de otros.
                </p>

                <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-black text-white leading-[1.1] tracking-tight">
                  ¿Y si tu rol nunca fue elegir
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400">
                    — sino diseñar?
                  </span>
                </h1>
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

        {/* ═══ 2. THE INVITATION TO DESIGN ══════════════════════════════ */}
        <section className="py-28 md:py-36 relative overflow-hidden border-t border-white/5">
          {/* Ambient lighting */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0d0d14] to-[#0a0a0a] pointer-events-none" />
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-900/[0.05] rounded-full blur-[180px]" />
            <div className="absolute bottom-1/3 left-0 w-[400px] h-[400px] bg-blue-900/[0.04] rounded-full blur-[150px]" />
          </div>

          <div className="container-content relative z-10">
            <div className="max-w-3xl mx-auto mb-24 md:mb-32">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.8 }}
                className="space-y-8"
              >
                <span className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/[0.08] text-[11px] uppercase tracking-[0.3em] text-purple-300/70 mb-2">
                  Diseño idealizado
                </span>

                <p className="text-lg md:text-xl text-slate-400 leading-relaxed">
                  Toda tu vida te dijeron que tu rol es elegir. Entre dos candidatos.
                  Entre dos frustraciones. Entre dos versiones del mismo fracaso.
                </p>

                <p className="text-lg md:text-xl text-slate-300/90 leading-relaxed font-medium">
                  Hay otra pregunta, y nadie te la hizo nunca en serio:
                </p>

                <h2 className="text-[clamp(1.5rem,3.5vw,2.5rem)] font-black text-white leading-[1.15] tracking-tight">
                  ¿Qué pasaría si pudieras sentarte con millones de argentinos
                  y diseñar, juntos, la mejor Argentina que se puede construir ahora?
                </h2>

                <p className="text-lg md:text-xl text-slate-400 leading-relaxed">
                  No dentro de veinte años. No con recursos imaginarios. Ahora, con lo que hay.
                </p>

                <p className="text-lg md:text-xl text-slate-400 leading-relaxed">
                  Eso no es utopía. Es <span className="text-white font-semibold">diseño idealizado</span>: arrancás
                  desde lo mejor posible y planificás hacia atrás hasta el presente.
                  No preguntás <em className="text-slate-300/80">"¿qué está roto?"</em> — preguntás <em className="text-slate-300/80">"¿qué queremos?"</em> y
                  después trazás el camino.
                </p>
              </motion.div>
            </div>

            {/* The consequence: hierarchy inversion */}
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.8 }}
              >
                <p className="text-center text-lg md:text-xl text-slate-300/90 mb-12 max-w-2xl mx-auto leading-relaxed">
                  Cuando los ciudadanos diseñan, el orden se invierte solo.
                  No necesitás que nadie lo decrete. Mirá:
                </p>

                <SystemHierarchy />

                {/* Three role statements */}
                <div className="mt-20 grid md:grid-cols-3 gap-10 text-center max-w-3xl mx-auto">
                  {[
                    { role: "El Ciudadano", action: "DEFINE", desc: "el propósito y el destino", color: "text-blue-400" },
                    { role: "El Estado", action: "ADMINISTRA", desc: "los recursos para llegar", color: "text-purple-400" },
                    { role: "La Política", action: "EJECUTA", desc: "las soluciones técnicas", color: "text-emerald-400" }
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.15, duration: 0.6 }}
                    >
                      <p className="text-xs text-slate-500 uppercase tracking-[0.25em] mb-3">{item.role}</p>
                      <p className={`text-2xl font-black ${item.color} mb-2`}>{item.action}</p>
                      <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ═══ 3. THE PROCESS — ¿Y cómo se hace? ═══════════════════════ */}
        <section className="py-28 md:py-36 relative overflow-hidden border-t border-white/5">
          {/* Ambient lighting */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-indigo-900/[0.06] to-[#0a0a0a] pointer-events-none" />
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-indigo-900/[0.05] rounded-full blur-[160px]" />
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
                <span className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/[0.08] text-[11px] uppercase tracking-[0.3em] text-indigo-300/70 mb-2">
                  El proceso
                </span>

                <h2 className="text-[clamp(1.5rem,3.5vw,2.5rem)] font-black text-white leading-[1.15] tracking-tight">
                  ¿Y cómo se hace?
                </h2>

                <p className="text-lg md:text-xl text-slate-400 leading-relaxed">
                  Cada persona trae lo suyo: su vida real, su territorio, lo que funciona
                  y lo que no, lo que construiría si pudiera. Eso es materia prima.
                </p>

                <p className="text-lg md:text-xl text-slate-400 leading-relaxed">
                  Cuando miles de personas hacen lo mismo, aparecen patrones.
                  Las heridas se repiten. Las ideas se cruzan.
                  Lo que parecía caos empieza a tener forma.
                </p>

                <p className="text-lg md:text-xl text-slate-300/90 leading-relaxed font-medium">
                  No hace falta que nadie lo decida desde arriba.
                  El diseño aparece solo cuando la señal es suficiente.
                </p>

                <p className="text-lg md:text-xl text-slate-400 leading-relaxed">
                  La plataforma no te dice qué pensar. Te da la infraestructura para
                  que tu realidad se sume a un mapa compartido — y de ese mapa
                  emerge el diseño que ningún político podría haber imaginado solo,
                  porque ninguno vive tu vida.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ═══ 4. QUIET PROOF — Ya está pasando ════════════════════════ */}
        <section className="py-28 md:py-36 relative overflow-hidden border-t border-white/5">
          {/* Ambient lighting */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-emerald-900/[0.04] to-[#0a0a0a] pointer-events-none" />
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-emerald-900/[0.04] rounded-full blur-[160px]" />
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
                <span className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/[0.08] text-[11px] uppercase tracking-[0.3em] text-emerald-300/70 mb-2">
                  En marcha
                </span>

                <h2 className="text-[clamp(1.5rem,3.5vw,2.5rem)] font-black text-white leading-[1.15] tracking-tight">
                  Ya está pasando.
                </h2>

                <p className="text-lg md:text-xl text-slate-400 leading-relaxed">
                  Esto no es un manifiesto que espera su momento.
                  {realStats.uniqueVoices > 0 && (
                    <> <span className="text-white font-semibold">{realStats.uniqueVoices.toLocaleString()}</span> personas ya trajeron su realidad al mapa.</>
                  )}
                  {realStats.uniqueLocations > 0 && (
                    <> Desde <span className="text-white font-semibold">{realStats.uniqueLocations}</span> localidades distintas.</>
                  )}
                  {realStats.totalContributions > 0 && (
                    <> <span className="text-white font-semibold">{realStats.totalContributions.toLocaleString()}</span> aportes concretos que se cruzan, se confirman y empiezan a dibujar algo que antes no existía.</>
                  )}
                </p>

                {(platformStats?.totalMembers ?? 0) > 0 && (
                  <p className="text-lg md:text-xl text-slate-400 leading-relaxed">
                    <span className="text-white font-semibold">{platformStats!.totalMembers.toLocaleString()}</span> personas se sumaron a la comunidad.
                    {(platformStats?.newMembersThisWeek ?? 0) > 0 && (
                      <> <span className="text-white font-semibold">{platformStats!.newMembersThisWeek}</span> esta semana.</>
                    )}
                  </p>
                )}

                <div className="rounded-2xl bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] p-8 space-y-5">
                  <p className="text-lg text-slate-300/90 leading-relaxed font-medium">
                    Vamos a ser honestos con lo que sabemos y lo que no.
                  </p>
                  <p className="text-slate-400 leading-relaxed">
                    Sabemos que el modelo funciona: cuando la gente trae su realidad,
                    los patrones aparecen. Sabemos que la infraestructura está en construcción
                    y que cada voz la hace más precisa.
                  </p>
                  <p className="text-slate-400 leading-relaxed">
                    No sabemos todavía cuántas voces hacen falta para que el mapa sea
                    lo suficientemente denso en cada territorio. No sabemos qué va a pasar
                    cuando el diseño colectivo sea tan claro que no se pueda ignorar.
                  </p>
                  <div className="pt-4 border-t border-white/5">
                    <p className="text-slate-300/80 leading-relaxed font-medium">
                      Lo que no vamos a hacer es prometerte lo que no construimos todavía.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ═══ 5. THE CONTINUATION — Into El Hombre Gris ═══════════════ */}
        <section className="py-32 md:py-44 relative overflow-hidden border-t border-white/5">
          {/* Ambient lighting — shifting to silver/slate for Hombre Gris */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-slate-900/[0.15] to-[#0a0a0a] pointer-events-none" />
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-slate-500/[0.04] rounded-full blur-[180px]" />
          </div>

          <div className="container-content relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 1 }}
                className="space-y-8"
              >
                <p className="text-lg md:text-xl text-slate-400/90 leading-relaxed">
                  Todo lo que leíste es arquitectura. Pero la arquitectura no se sostiene sola.
                </p>

                <p className="text-xl md:text-2xl text-slate-300/90 leading-relaxed max-w-2xl mx-auto">
                  Se sostiene con personas que pueden mirar la niebla sin inventar certezas.
                  Que pueden sostener la visión cuando todo empuja para atrás.
                  Que no se convierten en lo que vinieron a reemplazar.
                </p>

                <p className="text-2xl md:text-3xl font-black text-white leading-tight tracking-tight">
                  Ese tipo de persona tiene un nombre.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ═══ 6. NEXT STEP — El Instante del Hombre Gris ═════════════ */}
        <NextStepCard
          title="El Instante del Hombre Gris"
          description="La arquitectura no se sostiene sola. Se sostiene con personas que pueden mirar la niebla sin inventar certezas, sostener la visión cuando todo empuja para atrás, y no convertirse en lo que vinieron a reemplazar."
          href="/el-instante-del-hombre-gris"
          gradient="from-[#10131f] to-[#1f2335]"
          icon={<MoonStar className="w-5 h-5" />}
        />

        <section className="max-w-4xl mx-auto px-4 py-16">
          <div className="space-y-2 mb-8">
            <p className="uppercase tracking-widest text-xs text-amber-300/80">Pensamiento</p>
            <h2 className="font-serif text-3xl">La arquitectura, en largo</h2>
            <p className="text-mist-white/60 max-w-2xl">La visión condensa. El ensayo despliega — capa por capa, rol por rol, lo que ¡BASTA! pretende.</p>
          </div>
          <EnsayoLinkCard slug="arquitectura" />
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default LaVision;
