import React from 'react';
import { motion } from 'framer-motion';
import { Target, Cog, Building2 } from 'lucide-react';

const BastaPrincipio = () => {
  const phases = [
    {
      num: '01',
      title: 'El Inicio',
      subtitle: 'El quiebre',
      description: 'Dejás de normalizar lo que te daña y nombrás el límite con claridad. No es solo rechazo: es el inicio de una responsabilidad nueva.',
      quote: 'Nombrar el límite es recuperar dirección.',
      icon: <Target className="w-5 h-5" />,
      accent: 'from-blue-400 to-blue-600',
      text: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/15',
      glow: 'group-hover:shadow-[0_0_40px_rgba(59,130,246,0.08)]',
      hoverBorder: 'group-hover:border-blue-500/30',
      hoverBg: 'group-hover:bg-blue-500/[0.03]',
      dotBg: 'bg-blue-400',
      numColor: 'text-blue-500/[0.07]',
    },
    {
      num: '02',
      title: 'El Proceso',
      subtitle: 'La construcción',
      description: 'La energía del quiebre se convierte en método: diagnóstico compartido, prioridades claras y decisiones coordinadas.',
      quote: 'Lo que no se ordena, se dispersa.',
      icon: <Cog className="w-5 h-5" />,
      accent: 'from-purple-400 to-purple-600',
      text: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/15',
      glow: 'group-hover:shadow-[0_0_40px_rgba(139,92,246,0.08)]',
      hoverBorder: 'group-hover:border-purple-500/30',
      hoverBg: 'group-hover:bg-purple-500/[0.03]',
      dotBg: 'bg-purple-400',
      numColor: 'text-purple-500/[0.07]',
    },
    {
      num: '03',
      title: 'El Fin',
      subtitle: 'La transformación',
      description: 'El trabajo sostenido produce resultados verificables. La ciudadanía marca rumbo y las instituciones ejecutan con trazabilidad.',
      quote: 'Cuando la ciudadanía coordina, la política responde.',
      icon: <Building2 className="w-5 h-5" />,
      accent: 'from-emerald-400 to-emerald-600',
      text: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/15',
      glow: 'group-hover:shadow-[0_0_40px_rgba(16,185,129,0.08)]',
      hoverBorder: 'group-hover:border-emerald-500/30',
      hoverBg: 'group-hover:bg-emerald-500/[0.03]',
      dotBg: 'bg-emerald-400',
      numColor: 'text-emerald-500/[0.07]',
    },
  ];

  return (
    <section className="py-28 md:py-36 bg-[#0a0a0a] relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0d1117] to-[#0a0a0a]" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-blue-900/8 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-purple-900/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-20 md:mb-24"
          >
            <span className="text-blue-400 tracking-[0.3em] text-xs font-bold uppercase mb-6 block">
              El principio
            </span>
            <h2 className="text-4xl md:text-[3.5rem] lg:text-6xl font-black text-white mb-6 tracking-tight leading-[0.95]">
              No es solo un grito.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400">
                Es un método.
              </span>
            </h2>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Cada ciclo de ¡BASTA! convierte indignación en capacidad de transformación.
              Un principio con inicio, proceso y resultado.
            </p>
          </motion.div>

          {/* Three Phases - Horizontal Timeline */}
          <div className="relative mb-20 md:mb-24">
            {/* Connecting gradient line (desktop only) */}
            <div className="hidden md:block absolute top-[3.25rem] left-[16%] right-[16%] h-px z-0">
              <div className="w-full h-full bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-emerald-500/30" />
            </div>

            <div className="grid md:grid-cols-3 gap-6 md:gap-5 relative z-10">
              {phases.map((phase, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.12 }}
                  className="relative"
                >
                  {/* Timeline node (desktop) */}
                  <div className="hidden md:flex justify-center mb-6">
                    <div className={`relative z-20 w-7 h-7 rounded-full border-2 ${phase.border} flex items-center justify-center bg-[#0d1117]`}>
                      <div className={`w-2.5 h-2.5 rounded-full ${phase.dotBg}`} />
                    </div>
                  </div>

                  {/* Card */}
                  <div className={`group relative rounded-2xl bg-white/[0.02] border ${phase.border} ${phase.hoverBorder} ${phase.hoverBg} ${phase.glow} overflow-hidden transition-all duration-500 hover:-translate-y-1`}>
                    {/* Top accent line */}
                    <div className={`h-[3px] bg-gradient-to-r ${phase.accent}`} />

                    <div className="p-7 relative">
                      {/* Ghost number */}
                      <span className={`absolute -top-1 right-4 text-[5rem] font-black ${phase.numColor} leading-none select-none pointer-events-none`}>
                        {phase.num}
                      </span>

                      {/* Icon */}
                      <div className={`w-9 h-9 rounded-xl ${phase.bg} flex items-center justify-center mb-5 ${phase.text} border ${phase.border}`}>
                        {phase.icon}
                      </div>

                      {/* Label */}
                      <p className={`text-[11px] font-semibold uppercase tracking-[0.2em] ${phase.text} mb-1.5`}>
                        {phase.subtitle}
                      </p>

                      {/* Title */}
                      <h3 className="text-[1.4rem] font-bold text-white mb-3">
                        {phase.title}
                      </h3>

                      {/* Description */}
                      <p className="text-slate-400 text-[15px] leading-relaxed mb-5">
                        {phase.description}
                      </p>

                      {/* Quote */}
                      <div className="border-t border-white/5 pt-4">
                        <p className={`text-[13px] italic ${phase.text} opacity-70 leading-relaxed`}>
                          &ldquo;{phase.quote}&rdquo;
                        </p>
                      </div>
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
            <p className="text-xl md:text-2xl font-serif italic text-slate-300/90 leading-relaxed">
              &ldquo;El objetivo no es repetir consignas, sino crear capacidades nuevas:
              claridad para decidir, coordinación para ejecutar y continuidad para sostener.&rdquo;
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BastaPrincipio;
