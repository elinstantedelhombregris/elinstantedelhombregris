import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Eye, 
  Map, 
  Lightbulb, 
  Target, 
  Heart,
  ArrowRight,
  Quote
} from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

const AparatoPolitico = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  // Datos para el gráfico comparativo mejorado
  type MetricKey = 'participacion' | 'vision' | 'coordinacion' | 'ejecucion';

  const comparisonData: Array<{ name: string } & Record<MetricKey, number>> = [
    { 
      name: 'Delegación Tradicional', 
      participacion: 15, 
      vision: 5,
      coordinacion: 10,
      ejecucion: 80
    },
    { 
      name: 'Coordinación Nueva', 
      participacion: 75, 
      vision: 90,
      coordinacion: 85,
      ejecucion: 30
    }
  ];

  const chartConfig: Record<MetricKey, { label: string; color: string }> = {
    participacion: { label: 'Participación Ciudadana', color: '#60a5fa' },
    vision: { label: 'Visión Compartida', color: '#34d399' },
    coordinacion: { label: 'Coordinación', color: '#f59e0b' },
    ejecucion: { label: 'Ejecución Técnica', color: '#a78bfa' },
  };

  const gradientByMetric: Record<MetricKey, string> = {
    participacion: 'from-blue-500 to-cyan-500',
    vision: 'from-emerald-500 to-green-500',
    coordinacion: 'from-amber-500 to-orange-500',
    ejecucion: 'from-purple-500 to-violet-500'
  };

  const metricDetails: Array<{ key: MetricKey; title: string; sub: string }> = [
    { key: 'participacion', title: 'Participación', sub: 'Ciudadana' },
    { key: 'vision', title: 'Visión', sub: 'Compartida' },
    { key: 'coordinacion', title: 'Coordinación', sub: 'Sistémica' },
    { key: 'ejecucion', title: 'Ejecución', sub: 'Técnica' }
  ];

  const metricNarrative: Record<MetricKey, { before: string; after: string }> = {
    participacion: {
      before: 'Votar cada 2 años y esperar.',
      after: 'Co-diseñar políticas cada semana.'
    },
    vision: {
      before: 'Agendas opacas y sin trazabilidad.',
      after: 'Visión compartida y verificable.'
    },
    coordinacion: {
      before: 'Silos, favores y decisiones aisladas.',
      after: 'Coordinación abierta guiada por datos.'
    },
    ejecucion: {
      before: 'Discrecionalidad técnica sin control.',
      after: 'Mandatos claros y medibles.'
    }
  };

  const baselineModel = comparisonData[0];
  const coordinationModel = comparisonData[1];

  const segments = metricDetails.map((metric) => ({
    key: metric.key,
    title: metric.title,
    sub: metric.sub,
    color: chartConfig[metric.key].color,
    gradient: gradientByMetric[metric.key],
    delegacion: baselineModel[metric.key],
    coordinacion: coordinationModel[metric.key],
    diff: coordinationModel[metric.key] - baselineModel[metric.key],
    before: metricNarrative[metric.key].before,
    after: metricNarrative[metric.key].after
  }));

  const sections = [
    {
      title: "El país real se organiza desde abajo",
      icon: <Users className="w-8 h-8" />,
      content: "El centro de gravedad no está en los edificios del poder: está en hogares, trabajos, escuelas y barrios. La política se vuelve útil cuando escucha y ejecuta sobre esa realidad concreta.",
      color: "blue",
      textColor: "text-blue-400",
      borderColor: "border-blue-500/20",
      bgColor: "bg-blue-500/10"
    },
    {
      title: "Lo que se mide con claridad se puede priorizar",
      icon: <Eye className="w-8 h-8" />,
      content: "Cuando las prioridades ciudadanas se vuelven visibles y trazables, baja la discrecionalidad y sube la responsabilidad pública. La evidencia reemplaza al relato vacío.",
      color: "purple",
      textColor: "text-purple-400",
      borderColor: "border-purple-500/20",
      bgColor: "bg-purple-500/10"
    },
    {
      title: "Infraestructura cívica para decidir mejor",
      icon: <Map className="w-8 h-8" />,
      content: "Un mapa vivo que integra necesidades, propuestas y consensos. No reemplaza la democracia representativa: la fortalece con información abierta para orientar decisiones y monitorear cumplimiento.",
      color: "emerald",
      textColor: "text-emerald-400",
      borderColor: "border-emerald-500/20",
      bgColor: "bg-emerald-500/10"
    },
    {
      title: "De delegar todo a coordinar en serio",
      icon: <Target className="w-8 h-8" />,
      content: "La ciudadanía no solo elige representantes: también aporta dirección estratégica. Las instituciones ejecutan, rinden cuentas y corrigen con base en prioridades públicas explícitas.",
      color: "orange",
      textColor: "text-orange-400",
      borderColor: "border-orange-500/20",
      bgColor: "bg-orange-500/10"
    }
  ];

  return (
    <section className="py-32 bg-[#0a0a0a] relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#111] to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent opacity-50" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <motion.div
            variants={itemVariants}
            className="text-center mb-20"
          >
            <motion.div 
              variants={itemVariants}
              className="inline-flex items-center justify-center p-3 mb-6 rounded-full bg-purple-500/10 border border-purple-500/20"
            >
              <Heart className="w-6 h-6 text-purple-400" />
            </motion.div>
            
            <motion.h2 
              variants={itemVariants}
              className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight leading-tight"
            >
              Cómo poner al aparato político<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                a trabajar para el pueblo
              </span>
            </motion.h2>
            
            <motion.p 
              variants={itemVariants}
              className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-light"
            >
              La transformación no depende de esperar un salvador: depende de construir una ciudadanía que piense, priorice y exija ejecución.
            </motion.p>
            
            <motion.p 
              variants={itemVariants}
              className="text-2xl md:text-3xl font-bold text-white mt-6 max-w-3xl mx-auto leading-relaxed"
            >
              Del desorden a la coordinación.<br />
              Del enojo aislado a la acción con rumbo.
            </motion.p>
          </motion.div>

          {/* Main Quote */}
          <motion.div
            variants={itemVariants}
            className="mb-20"
          >
            <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 backdrop-blur-sm border border-purple-500/20 rounded-3xl p-12 md:p-16 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
              <div className="relative z-10">
                <Quote className="w-12 h-12 text-purple-400 mb-6 opacity-50" />
                <p className="text-2xl md:text-3xl font-serif italic text-slate-200 leading-relaxed mb-6">
                  Durante años confundimos representación con delegación total. Votamos, esperamos y perdimos capacidad de orientar el rumbo.
                </p>
                <p className="text-xl text-slate-300 leading-relaxed">
                  Recuperar esa capacidad es pasar de la queja crónica a la coordinación pública: prioridades claras, seguimiento ciudadano y ejecución verificable.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Gráfico Comparativo: Delegación vs Coordinación - ALUCINANTE */}
          <motion.div
            variants={itemVariants}
            className="mb-24 relative"
          >
            {/* Glow Effects */}
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl opacity-20 blur-2xl animate-pulse" />
            
            <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 overflow-hidden shadow-2xl ring-1 ring-white/5">
              {/* Decorative background elements */}
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl pointer-events-none transform translate-x-1/3 -translate-y-1/3" />
              <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none transform -translate-x-1/3 translate-y-1/3" />
              
              <div className="mb-12 text-center relative z-10">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="inline-block mb-4"
                >
                  <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 text-sm font-mono text-purple-300 tracking-widest">
                    ANALÍTICA DE SISTEMAS
                  </span>
                </motion.div>
                
                <h3 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-blue-200 mb-6 drop-shadow-lg">
                  Delegación vs Coordinación
                </h3>
                <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                  Visualización del cambio de paradigma: de la entrega pasiva de poder a la construcción activa de realidad.
                </p>

                <div className="mt-10 grid gap-4 md:grid-cols-2 text-left max-w-5xl mx-auto">
                  <motion.div 
                    whileHover={{ y: -5 }}
                    className="p-6 rounded-2xl bg-gradient-to-br from-red-500/5 to-red-900/10 border border-red-500/20 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-3 opacity-20">
                       <div className="w-16 h-16 rounded-full bg-red-500 blur-2xl" />
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500/20 text-red-300 text-xs font-bold">✕</span>
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-red-300/70">Delegación tradicional</p>
                            <h4 className="text-lg font-bold text-red-400">Paradigma de Delegación</h4>
                          </div>
                        </div>
                        <span className="text-[11px] uppercase tracking-widest text-red-300/70">Caja negra</span>
                      </div>
                      <ul className="space-y-2 text-sm text-slate-300">
                        <li className="flex gap-2">
                          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-red-400/80 flex-shrink-0" />
                          <span><span className="text-slate-200 font-semibold">Ciudadano:</span> entrega soberanía y participa esporádicamente.</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-red-400/80 flex-shrink-0" />
                          <span><span className="text-slate-200 font-semibold">Decisión:</span> opaca, cerrada, sin trazabilidad pública.</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-red-400/80 flex-shrink-0" />
                          <span><span className="text-slate-200 font-semibold">Resultado:</span> desconexión, corrupción y sin propósito compartido.</span>
                        </li>
                      </ul>
                    </div>
                  </motion.div>

                  <motion.div 
                    whileHover={{ y: -5 }}
                    className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-emerald-900/10 border border-emerald-500/20 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-3 opacity-20">
                       <div className="w-16 h-16 rounded-full bg-emerald-500 blur-2xl" />
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">✓</span>
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-300/70">Coordinación nueva</p>
                            <h4 className="text-lg font-bold text-emerald-400">Paradigma de Coordinación</h4>
                          </div>
                        </div>
                        <span className="text-[11px] uppercase tracking-widest text-emerald-300/70">Red distribuida</span>
                      </div>
                      <ul className="space-y-2 text-sm text-slate-300">
                        <li className="flex gap-2">
                          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-400/80 flex-shrink-0" />
                          <span><span className="text-slate-200 font-semibold">Ciudadano:</span> aporta datos, visión y control continuo.</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-400/80 flex-shrink-0" />
                          <span><span className="text-slate-200 font-semibold">Decisión:</span> trazable, abierta y verificable.</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-400/80 flex-shrink-0" />
                          <span><span className="text-slate-200 font-semibold">Resultado:</span> inteligencia colectiva, transparencia y mandato claro.</span>
                        </li>
                      </ul>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Leyenda fija y visible en mobile */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 mb-6 relative z-10">
                {metricDetails.map((metric) => (
                  <div key={metric.key} className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 px-3 py-2">
                    <span
                      className="h-3 w-3 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.35)]"
                      style={{ background: chartConfig[metric.key].color }}
                    />
                    <div className="leading-tight">
                      <p className="text-[11px] uppercase text-slate-400 tracking-widest">{metric.title}</p>
                      <p className="text-xs text-slate-200">{chartConfig[metric.key].label}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Comparador compacto */}
              <div className="w-full mb-12 relative z-10">
                <motion.div 
                  className="absolute inset-0 pointer-events-none z-20 overflow-hidden rounded-2xl"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                >
                  <motion.div
                    className="h-full w-32 absolute top-0 bg-gradient-to-r from-transparent via-white/10 to-transparent blur-xl transform skew-x-12"
                    animate={{ left: ['-20%', '120%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
                  />
                </motion.div>

                <div className="flex flex-col gap-4">
                  {/* Leyenda compacta */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                      <span className="w-2 h-2 rounded-full bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.7)]" />
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-200">Delegación Tradicional</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.7)]" />
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-200">Coordinación Nueva</span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono uppercase tracking-[0.2em]">Comparación directa sin hover</span>
                  </div>

                  {/* Tarjetas por métrica */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {segments.map((segment, idx) => (
                      <motion.div
                        key={segment.key}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: idx * 0.05 }}
                        className="relative p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.35)]"
                      >
                        <div className={`absolute inset-0 opacity-20 bg-gradient-to-br ${segment.gradient}`} />
                        <div className="relative z-10 space-y-4">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <h4 className="text-lg md:text-xl font-bold text-white">{segment.title}</h4>
                              <p className="text-xs text-slate-400">{segment.sub}</p>
                            </div>
                            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] uppercase tracking-widest text-slate-400">
                              <span>Brecha</span>
                              <span className={`font-bold ${segment.diff >= 0 ? 'text-emerald-200' : 'text-red-200'}`}>
                                {segment.diff >= 0 ? '+' : ''}{segment.diff} pts
                              </span>
                            </div>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="h-2 w-2 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.6)]" />
                                  <span className="text-[11px] uppercase tracking-widest text-slate-400">Antes</span>
                                </div>
                                <span className="text-sm font-bold text-slate-100">{segment.delegacion}%</span>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-1">Delegación</p>
                              <div className="mt-2 h-2 bg-white/5 rounded-full border border-white/10 overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${segment.delegacion}%` }}
                                  transition={{ duration: 1, delay: 0.1 + idx * 0.05, ease: "easeOut" }}
                                  className={`h-full bg-gradient-to-r ${segment.gradient} opacity-60`}
                                />
                              </div>
                              <p className="mt-2 text-xs text-slate-400 leading-relaxed">{segment.before}</p>
                            </div>

                            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                                  <span className="text-[11px] uppercase tracking-widest text-emerald-200">Después</span>
                                </div>
                                <span className="text-sm font-bold text-emerald-100">{segment.coordinacion}%</span>
                              </div>
                              <p className="text-[11px] text-emerald-200/70 mt-1">Coordinación</p>
                              <div className="mt-2 h-2 bg-white/5 rounded-full border border-white/10 overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${segment.coordinacion}%` }}
                                  transition={{ duration: 1, delay: 0.15 + idx * 0.05, ease: "easeOut" }}
                                  className={`h-full bg-gradient-to-r ${segment.gradient} from-emerald-400 to-emerald-500`}
                                />
                              </div>
                              <p className="mt-2 text-xs text-slate-200 leading-relaxed">{segment.after}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
              
            </div>
          </motion.div>

          {/* Sections Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {sections.map((section, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className={`group relative p-8 rounded-3xl bg-white/5 backdrop-blur-sm border ${section.borderColor} overflow-hidden hover:border-${section.color}-500/40 transition-all duration-500 hover:-translate-y-2`}
              >
                <div className={`absolute top-0 right-0 w-32 h-32 ${section.bgColor} rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity`} />
                <div className="relative z-10">
                  <div className={`w-14 h-14 rounded-2xl ${section.bgColor} flex items-center justify-center mb-6 border ${section.borderColor} ${section.textColor}`}>
                    {section.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    {section.title}
                  </h3>
                  <p className="text-slate-400 leading-relaxed">
                    {section.content}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Call to Action */}
          <motion.div
            variants={itemVariants}
            className="text-center bg-gradient-to-r from-purple-900/30 to-blue-900/30 backdrop-blur-sm border border-purple-500/20 rounded-3xl p-12"
          >
            <Lightbulb className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
            <h3 className="text-3xl font-bold text-white mb-4">
              Del diagnóstico a la coordinación pública
            </h3>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              La pregunta no es quién promete más. La pregunta es cómo convertimos prioridades ciudadanas en decisiones trazables y resultados sostenidos.
            </p>
            <Link href="/el-mapa">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-10 py-7 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
              >
                ENTRAR AL MAPA CIUDADANO
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default AparatoPolitico;
