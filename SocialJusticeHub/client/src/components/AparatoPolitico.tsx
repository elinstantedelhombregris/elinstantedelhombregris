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

  const metricNarrative: Record<MetricKey, string> = {
    participacion: 'De votar cada 2 años a co-diseñar políticas cada semana.',
    vision: 'De agendas opacas a una visión compartida y trazable.',
    coordinacion: 'De silos y favores a coordinación abierta por datos.',
    ejecucion: 'De discrecionalidad técnica a mandatos claros y medibles.'
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
    narrative: metricNarrative[metric.key]
  }));

  const sections = [
    {
      title: "El país real somos nosotros",
      icon: <Users className="w-8 h-8" />,
      content: "Este país no es el Congreso. No es la Casa Rosada. El país real es el mate que el argentino comparte en su casa. Es la palabra que honra. Es el trabajo que ofrece. Es la familia que protege. Es el barrio que construye. El país real es quien lee esto, quien decide que ya es suficiente, quien elige construir.",
      color: "blue",
      textColor: "text-blue-400",
      borderColor: "border-blue-500/20",
      bgColor: "bg-blue-500/10"
    },
    {
      title: "El mundo cambia cuando lo evidente se vuelve imposible de ignorar",
      icon: <Eye className="w-8 h-8" />,
      content: "Cuando quien decide hacer evidente lo que quiere construye con claridad, el sistema se ordena solo. Cuando el mapa emocional y estratégico del país real se vuelve visible, cuando millones de sueños, valores y necesidades se convierten en datos imposibles de ignorar, la política pierde margen para desviarse.",
      color: "purple",
      textColor: "text-purple-400",
      borderColor: "border-purple-500/20",
      bgColor: "bg-purple-500/10"
    },
    {
      title: "La primera infraestructura política que Argentina jamás tuvo",
      icon: <Map className="w-8 h-8" />,
      content: "Un mapa emocional y estratégico de la Argentina real. Un mapa vivo donde quien sueña, quien valora, quien necesita puede hacer visible su visión. Un mapa preciso que ordena el aparato político porque lo evidente se vuelve imposible de ignorar. Ese mapa, construido por millones, se convierte en política pública porque la verdad compartida vence a la mentira administrada.",
      color: "emerald",
      textColor: "text-emerald-400",
      borderColor: "border-emerald-500/20",
      bgColor: "bg-emerald-500/10"
    },
    {
      title: "Repensar la democracia: de la delegación a la coordinación",
      icon: <Target className="w-8 h-8" />,
      content: "La democracia madura no es un sistema donde el pueblo vota cada dos años y delega todo, incluida la visión. Es un sistema donde el pueblo piensa, diseña, sueña, prioriza y delega solo la ejecución técnica. Donde quien decide participa en la construcción del futuro, no solo en la elección de administradores.",
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
              Quien lee esto no necesita que le pidan nada. Quien lee esto ya sabe algo que el ruido del mundo intentó hacerle olvidar:
            </motion.p>
            
            <motion.p 
              variants={itemVariants}
              className="text-2xl md:text-3xl font-bold text-white mt-6 max-w-3xl mx-auto leading-relaxed"
            >
              El poder nunca estuvo allá arriba.<br />
              El poder siempre estuvo acá: en el argentino que decide recordarlo.
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
                  Durante demasiados años el argentino miró al aparato político como si fuera un padre autoritario que debía guiarlo, protegerlo, resolverle la vida.
                </p>
                <p className="text-xl text-slate-300 leading-relaxed">
                  Y ese error, esa renuncia silenciosa, permitió que un subsistema minúsculo e incompetente intentara definir el destino de todos. Permitió que quienes deberían servir se convirtieran en quienes esperan ser servidos.
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
                        className="relative p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.35)]"
                      >
                        <div className={`absolute inset-0 opacity-20 bg-gradient-to-br ${segment.gradient}`} />
                        <div className="relative z-10 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-[11px] uppercase tracking-widest text-slate-400">VARIABLE</p>
                              <h4 className="text-lg font-bold text-white">{segment.title}</h4>
                              <p className="text-xs text-slate-400">{segment.sub}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[11px] uppercase tracking-widest text-slate-400">Brecha</p>
                              <p className={`text-xl font-black ${segment.diff >= 0 ? 'text-emerald-200' : 'text-red-200'} drop-shadow-sm`}>
                                {segment.diff >= 0 ? '+' : ''}{segment.diff} pts
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-[11px] uppercase tracking-widest text-slate-400">
                              <span>Delegación</span>
                              <span className="text-slate-200 font-black text-sm">{segment.delegacion}%</span>
                            </div>
                            <div className="h-3 bg-white/5 rounded-full border border-white/10 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${segment.delegacion}%` }}
                                transition={{ duration: 1, delay: 0.1 + idx * 0.05, ease: "easeOut" }}
                                className={`h-full bg-gradient-to-r ${segment.gradient} opacity-80`}
                              />
                            </div>

                            <div className="flex items-center justify-between text-[11px] uppercase tracking-widest text-slate-400">
                              <span className="flex items-center gap-2">
                                Coordinación 
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]" />
                              </span>
                              <span className="text-emerald-200 font-black text-sm">{segment.coordinacion}%</span>
                            </div>
                            <div className="h-3 bg-white/5 rounded-full border border-white/10 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${segment.coordinacion}%` }}
                                transition={{ duration: 1, delay: 0.15 + idx * 0.05, ease: "easeOut" }}
                                className={`h-full bg-gradient-to-r ${segment.gradient} from-emerald-400 to-emerald-500`}
                              />
                            </div>
                          </div>

                          <div className="flex items-start justify-between gap-3">
                            <p className="text-sm text-slate-300 leading-relaxed">{segment.narrative}</p>
                            <div className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border border-white/10 bg-white/5 text-slate-200">
                              Cambio clave
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Insights del gráfico - Futuristic Cards */}
              <div className="grid md:grid-cols-2 gap-6">
                <motion.div 
                  whileHover={{ y: -5 }}
                  className="p-6 rounded-2xl bg-gradient-to-br from-red-500/5 to-red-900/10 border border-red-500/20 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-3 opacity-20">
                     <div className="w-16 h-16 rounded-full bg-red-500 blur-2xl" />
                  </div>
                  <h4 className="text-lg font-bold text-red-400 mb-3 flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500/20 text-red-400 text-xs">✕</span>
                    Paradigma de Delegación
                  </h4>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Modelo obsoleto de "caja negra". El ciudadano entrega su soberanía y espera resultados pasivamente. Genera desconexión, corrupción y falta de propósito compartido. Es la política del siglo XX.
                  </p>
                </motion.div>

                <motion.div 
                  whileHover={{ y: -5 }}
                  className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-emerald-900/10 border border-emerald-500/20 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-3 opacity-20">
                     <div className="w-16 h-16 rounded-full bg-emerald-500 blur-2xl" />
                  </div>
                  <h4 className="text-lg font-bold text-emerald-400 mb-3 flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">✓</span>
                    Paradigma de Coordinación
                  </h4>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Modelo de "red distribuida". El ciudadano aporta datos, visión y control. El político ejecuta técnicamente bajo mandato claro. Maximiza la inteligencia colectiva y la transparencia.
                  </p>
                </motion.div>
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
              Hacer visible lo que soñamos, para ordenar lo que nos gobierna
            </h3>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              La pregunta no es "¿Quién va a salvarnos?". 
              La pregunta es "¿Cuándo quien decide que ya es suficiente va a mostrar claramente qué país quiere construir?" 
              Cuando eso ocurra, cuando el mapa emocional y estratégico sea evidente, el aparato político deberá alinearse o volverse obsoleto.
            </p>
            <Link href="/el-mapa">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-10 py-7 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
              >
                CREAR EL MAPA
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
