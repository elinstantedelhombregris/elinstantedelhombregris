import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useEffect, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import SystemHierarchy from '@/components/SystemHierarchy';
import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';

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
        <section className="relative min-h-[85vh] flex items-center justify-center bg-[#0a0a0a] pt-20">
          {/* Subtle warm gradient */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-blue-900/[0.04] rounded-full blur-[180px]" />
          </div>

          <div className="container-content relative z-10">
            <div className="max-w-3xl mx-auto">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5, delay: 0.3 }}
                className="space-y-8"
              >
                <p className="text-xl md:text-2xl text-slate-400 leading-relaxed">
                  Cada cuatro años te dejan elegir quién te decepciona.
                  <br />
                  Y te enseñaron a llamarle democracia.
                </p>

                <p className="text-xl md:text-2xl text-slate-400 leading-relaxed">
                  Crisis, esperanza, líder, traición, crisis.
                  El ciclo no es un accidente — es el diseño.
                  Tu rol en ese diseño siempre fue el mismo: elegir entre las opciones de otros.
                </p>

                <p className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight">
                  ¿Y si tu rol nunca fue elegir
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                    — sino diseñar?
                  </span>
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ═══ 2. THE INVITATION TO DESIGN ══════════════════════════════ */}
        <section className="py-28 md:py-36 bg-[#0a0a0a] relative">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-900/[0.03] rounded-full blur-[160px]" />
          </div>

          <div className="container-content relative z-10">
            <div className="max-w-3xl mx-auto mb-20 md:mb-28">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.8 }}
                className="space-y-8"
              >
                <p className="text-lg md:text-xl text-slate-400 leading-relaxed">
                  Toda tu vida te dijeron que tu rol es elegir. Entre dos candidatos.
                  Entre dos frustraciones. Entre dos versiones del mismo fracaso.
                </p>

                <p className="text-lg md:text-xl text-slate-300 leading-relaxed">
                  Hay otra pregunta, y nadie te la hizo nunca en serio:
                </p>

                <h2 className="text-2xl md:text-4xl font-bold text-white leading-tight">
                  ¿Qué pasaría si pudieras sentarte con millones de argentinos
                  y diseñar, juntos, la mejor Argentina que se puede construir ahora?
                </h2>

                <p className="text-lg md:text-xl text-slate-400 leading-relaxed">
                  No dentro de veinte años. No con recursos imaginarios. Ahora, con lo que hay.
                </p>

                <p className="text-lg md:text-xl text-slate-400 leading-relaxed">
                  Eso no es utopía. Es <span className="text-white font-semibold">diseño idealizado</span>: arrancás
                  desde lo mejor posible y planificás hacia atrás hasta el presente.
                  No preguntás <em>"¿qué está roto?"</em> — preguntás <em>"¿qué queremos?"</em> y
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
                <p className="text-center text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                  Cuando los ciudadanos diseñan, el orden se invierte solo.
                  No necesitás que nadie lo decrete. Mirá:
                </p>

                <SystemHierarchy />

                {/* Three role statements */}
                <div className="mt-16 grid md:grid-cols-3 gap-10 text-center max-w-3xl mx-auto">
                  {[
                    { role: "El Ciudadano", action: "DEFINE", desc: "el propósito y el destino" },
                    { role: "El Estado", action: "ADMINISTRA", desc: "los recursos para llegar" },
                    { role: "La Política", action: "EJECUTA", desc: "las soluciones técnicas" }
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1, duration: 0.6 }}
                    >
                      <p className="text-sm text-slate-500 uppercase tracking-widest mb-2">{item.role}</p>
                      <p className="text-2xl font-bold text-white mb-1">{item.action}</p>
                      <p className="text-slate-400 text-sm">{item.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ═══ 3. THE PROCESS — ¿Y cómo se hace? ═══════════════════════ */}
        <section className="py-28 md:py-36 bg-[#0a0a0a] relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0d0d14] to-transparent pointer-events-none" />

          <div className="container-content relative z-10">
            <div className="max-w-3xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.8 }}
                className="space-y-8"
              >
                <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-4">
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

                <p className="text-lg md:text-xl text-slate-300 leading-relaxed font-medium">
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
        <section className="py-28 md:py-36 bg-[#0a0a0a] relative">
          <div className="container-content relative z-10">
            <div className="max-w-3xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.8 }}
                className="space-y-8"
              >
                <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-4">
                  Ya está pasando.
                </h2>

                <p className="text-lg md:text-xl text-slate-400 leading-relaxed">
                  Esto no es un manifiesto que espera su momento.
                  {realStats.uniqueVoices > 0 && (
                    <> {realStats.uniqueVoices.toLocaleString()} personas ya trajeron su realidad al mapa.</>
                  )}
                  {realStats.uniqueLocations > 0 && (
                    <> Desde {realStats.uniqueLocations} localidades distintas.</>
                  )}
                  {realStats.totalContributions > 0 && (
                    <> {realStats.totalContributions.toLocaleString()} aportes concretos que se cruzan, se confirman y empiezan a dibujar algo que antes no existía.</>
                  )}
                </p>

                {(platformStats?.totalMembers ?? 0) > 0 && (
                  <p className="text-lg md:text-xl text-slate-400 leading-relaxed">
                    {platformStats!.totalMembers.toLocaleString()} personas se sumaron a la comunidad.
                    {(platformStats?.newMembersThisWeek ?? 0) > 0 && (
                      <> {platformStats!.newMembersThisWeek} esta semana.</>
                    )}
                  </p>
                )}

                <div className="border-l-2 border-blue-500/30 pl-6 py-2 space-y-4">
                  <p className="text-lg text-slate-300 leading-relaxed">
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
                  <p className="text-slate-400 leading-relaxed">
                    Lo que no vamos a hacer es prometerte lo que no construimos todavía.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ═══ 5. THE CONTINUATION — Into El Hombre Gris ═══════════════ */}
        <section className="py-28 md:py-40 bg-[#0a0a0a] relative">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-slate-500/[0.03] rounded-full blur-[150px]" />
          </div>

          <div className="container-content relative z-10">
            <div className="max-w-3xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 1 }}
                className="space-y-8"
              >
                <p className="text-lg md:text-xl text-slate-400 leading-relaxed">
                  Todo lo que leíste es arquitectura. Pero la arquitectura no se sostiene sola.
                </p>

                <p className="text-lg md:text-xl text-slate-300 leading-relaxed">
                  Se sostiene con personas que pueden mirar la niebla sin inventar certezas.
                  Que pueden sostener la visión cuando todo empuja para atrás.
                  Que no se convierten en lo que vinieron a reemplazar.
                </p>

                <p className="text-xl md:text-2xl text-white leading-relaxed font-medium">
                  Ese tipo de persona tiene un nombre.
                </p>

                <div className="pt-8">
                  <Link href="/el-instante-del-hombre-gris">
                    <span className="group inline-flex items-center text-lg md:text-xl text-slate-300 hover:text-white transition-colors duration-300 cursor-pointer">
                      <span className="border-b border-slate-600 group-hover:border-white transition-colors duration-300">
                        El Instante del Hombre Gris
                      </span>
                      <ArrowRight className="ml-3 w-5 h-5 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                    </span>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default LaVision;
