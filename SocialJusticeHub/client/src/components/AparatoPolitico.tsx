import React from 'react';
import { motion } from 'framer-motion';
import { X, Check, ArrowRight } from 'lucide-react';

const AparatoPolitico = () => {
  const delegacion = [
    { bold: 'Votás cada 2 años', rest: ' y esperás que funcione.' },
    { bold: 'Las decisiones', rest: ' se toman a puertas cerradas.' },
    { bold: 'Cada sector', rest: ' opera en su propio silo.' },
    { bold: 'Sin métricas', rest: ', sin rendición de cuentas.' },
  ];

  const coordinacion = [
    { bold: 'Co-diseñás', rest: ' prioridades con tu comunidad.' },
    { bold: 'Las decisiones', rest: ' son abiertas y verificables.' },
    { bold: 'Redes ciudadanas', rest: ' conectan esfuerzos.' },
    { bold: 'Mandatos claros', rest: ', medibles y exigibles.' },
  ];

  return (
    <section className="py-28 md:py-36 bg-[#0a0a0a] relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0d0d14] to-transparent" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-900/8 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-900/5 rounded-full blur-[180px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16 md:mb-20"
          >
            <span className="text-purple-400 tracking-[0.3em] text-xs font-bold uppercase mb-6 block">
              El cambio de paradigma
            </span>
            <h2 className="text-4xl md:text-[3.5rem] lg:text-6xl font-black text-white mb-6 tracking-tight leading-[0.95]">
              De delegar todo
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                a coordinar en serio
              </span>
            </h2>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Durante años confundimos representación con delegación total.
              Recuperar capacidad de rumbo es pasar de la queja a la coordinación pública.
            </p>
          </motion.div>

          {/* The Comparison — Split Design */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mb-16 md:mb-20"
          >
            <div className="rounded-3xl overflow-hidden border border-white/[0.06] relative">
              {/* Subtle ambient glow behind the card */}
              <div className="absolute -inset-1 bg-gradient-to-br from-red-900/10 via-transparent to-emerald-900/10 rounded-3xl blur-xl pointer-events-none opacity-60" />

              <div className="grid md:grid-cols-2 relative">
                {/* Delegación Side */}
                <div className="bg-[#0c0c0c] p-8 md:p-10 relative">
                  {/* Top accent */}
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-red-500/60 to-red-600/20" />
                  <div className="absolute top-0 right-0 w-40 h-40 bg-red-900/8 rounded-full blur-[60px] pointer-events-none" />

                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-9 h-9 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                        <X className="w-4 h-4 text-red-400" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.25em] text-red-400/50 mb-0.5">El modelo viejo</p>
                        <h3 className="text-xl font-bold text-white">Delegación pasiva</h3>
                      </div>
                    </div>

                    <ul className="space-y-5">
                      {delegacion.map((item, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.4, delay: 0.15 + i * 0.06 }}
                          className="flex items-start gap-3"
                        >
                          <span className="mt-[9px] w-1.5 h-1.5 rounded-full bg-red-400/40 flex-shrink-0" />
                          <span className="text-slate-400 text-[15px] leading-relaxed">
                            <span className="text-slate-300 font-medium">{item.bold}</span>{item.rest}
                          </span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Center Divider (desktop) */}
                <div className="hidden md:block absolute top-6 bottom-6 left-1/2 -translate-x-1/2 w-px z-10">
                  <div className="w-full h-full bg-gradient-to-b from-transparent via-white/10 to-transparent" />
                  {/* Arrow node */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#111] border border-white/10 flex items-center justify-center">
                    <ArrowRight className="w-3.5 h-3.5 text-white/40" />
                  </div>
                </div>

                {/* Mobile divider */}
                <div className="md:hidden h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                {/* Coordinación Side */}
                <div className="bg-[#0c0e12] p-8 md:p-10 relative">
                  {/* Top accent */}
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-500/60 to-blue-500/20" />
                  <div className="absolute top-0 left-0 w-40 h-40 bg-emerald-900/8 rounded-full blur-[60px] pointer-events-none" />

                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <Check className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.25em] text-emerald-400/50 mb-0.5">El modelo nuevo</p>
                        <h3 className="text-xl font-bold text-white">Coordinación activa</h3>
                      </div>
                    </div>

                    <ul className="space-y-5">
                      {coordinacion.map((item, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: 10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.4, delay: 0.15 + i * 0.06 }}
                          className="flex items-start gap-3"
                        >
                          <span className="mt-[9px] w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                          <span className="text-slate-200 text-[15px] leading-relaxed">
                            <span className="text-white font-medium">{item.bold}</span>{item.rest}
                          </span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Bridge Statement */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto"
          >
            <p className="text-xl md:text-2xl font-serif italic text-slate-300/90 leading-relaxed">
              &ldquo;La pregunta no es quién promete más. Es cómo convertimos
              prioridades ciudadanas en decisiones trazables y resultados sostenidos.&rdquo;
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AparatoPolitico;
