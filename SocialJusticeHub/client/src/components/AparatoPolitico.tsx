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
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';

const CustomBar = (props: any) => {
  const { fill, x, y, width, height, payload } = props;
  
  // Determine if this is a "Delegación" bar (first in the dataset)
  // We can infer this by checking if the payload is the first item in our data array logic,
  // but here custom shape is rendered for each bar.
  // The payload contains the data object ({name: "Delegación...", ...}).
  const isDelegacion = payload.name === 'Delegación Tradicional';

  if (isDelegacion) {
    return (
      <motion.rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
        rx={6}
        ry={6}
        animate={{
          x: [x, x - 2, x + 2, x - 1, x + 1, x]
        }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
          repeatDelay: 2 + Math.random(), // Randomize shake timing
          ease: "easeInOut"
        }}
        filter="url(#glow)"
      />
    );
  }

  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill={fill}
      rx={6}
      ry={6}
      filter="url(#glow)"
    />
  );
};

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
  const comparisonData = [
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

  const chartConfig = {
    participacion: { label: 'Participación Ciudadana', color: '#60a5fa' },
    vision: { label: 'Visión Compartida', color: '#34d399' },
    coordinacion: { label: 'Coordinación', color: '#f59e0b' },
    ejecucion: { label: 'Ejecución Técnica', color: '#a78bfa' },
  };

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
              
              {/* Gráfico de barras agrupadas mejorado */}
              <div className="h-[500px] w-full mb-12 relative z-10">
                
                {/* Lighting Transfer Effect */}
                <motion.div 
                  className="absolute inset-0 pointer-events-none z-20 overflow-hidden rounded-xl"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                >
                  <motion.div
                    className="h-full w-32 absolute top-0 bg-gradient-to-r from-transparent via-white/10 to-transparent blur-xl transform skew-x-12"
                    animate={{
                      left: ['-20%', '120%']
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                      repeatDelay: 1
                    }}
                  />
                </motion.div>

                <ChartContainer config={chartConfig}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={comparisonData}
                      margin={{ top: 30, right: 20, left: 0, bottom: 60 }}
                      barGap={8}
                    >
                      <defs>
                        {/* Gradientes Neón */}
                        <linearGradient id="gradParticipacion" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#60a5fa" stopOpacity={1} />
                          <stop offset="100%" stopColor="#2563eb" stopOpacity={0.8} />
                        </linearGradient>
                        <linearGradient id="gradVision" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#34d399" stopOpacity={1} />
                          <stop offset="100%" stopColor="#059669" stopOpacity={0.8} />
                        </linearGradient>
                        <linearGradient id="gradCoordinacion" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#fbbf24" stopOpacity={1} />
                          <stop offset="100%" stopColor="#d97706" stopOpacity={0.8} />
                        </linearGradient>
                        <linearGradient id="gradEjecucion" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#a78bfa" stopOpacity={1} />
                          <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.8} />
                        </linearGradient>
                        
                        <filter id="glow" height="130%">
                          <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
                          <feOffset in="blur" dx="0" dy="0" result="offsetBlur" />
                          <feMerge>
                              <feMergeNode in="offsetBlur" />
                              <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                      </defs>
                      
                      <XAxis 
                        dataKey="name" 
                        stroke="#94a3b8"
                        fontSize={14}
                        fontWeight={700}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: '#e2e8f0' }}
                        dy={30}
                        angle={-10}
                        textAnchor="middle"
                        height={80}
                      />
                      <YAxis 
                        stroke="#94a3b8"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: '#64748b' }}
                        dx={-10}
                      />
                      <ChartTooltip 
                        cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                        content={({ active, payload }) => {
                          if (!active || !payload || !payload.length) return null;
                          return (
                            <div className="bg-black/90 backdrop-blur-xl border border-white/10 p-4 rounded-xl shadow-2xl ring-1 ring-white/10">
                              <p className="text-slate-400 text-xs font-mono mb-2 uppercase tracking-wider">Métricas</p>
                              {payload.map((entry: any, i: number) => (
                                <div key={i} className="flex items-center gap-3 mb-1">
                                  <div className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]" style={{ backgroundColor: entry.color }} />
                                  <span className="text-slate-300 text-sm font-medium">{entry.name}:</span>
                                  <span className="text-white font-bold font-mono">{entry.value}%</span>
                                </div>
                              ))}
                            </div>
                          );
                        }}
                      />
                      
                      <Bar 
                        dataKey="participacion" 
                        fill="url(#gradParticipacion)" 
                        radius={[6, 6, 2, 2]}
                        shape={<CustomBar />}
                        animationDuration={1500}
                        animationBegin={200}
                      />
                      <Bar 
                        dataKey="vision" 
                        fill="url(#gradVision)" 
                        radius={[6, 6, 2, 2]}
                        shape={<CustomBar />}
                        animationDuration={1500}
                        animationBegin={400}
                      />
                      <Bar 
                        dataKey="coordinacion" 
                        fill="url(#gradCoordinacion)" 
                        radius={[6, 6, 2, 2]}
                        shape={<CustomBar />}
                        animationDuration={1500}
                        animationBegin={600}
                      />
                      <Bar 
                        dataKey="ejecucion" 
                        fill="url(#gradEjecucion)" 
                        radius={[6, 6, 2, 2]}
                        shape={<CustomBar />}
                        animationDuration={1500}
                        animationBegin={800}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
                {[
                  { label: "Participación", sub: "Ciudadana", color: "blue", grad: "from-blue-500 to-cyan-500" },
                  { label: "Visión", sub: "Compartida", color: "emerald", grad: "from-emerald-500 to-green-500" },
                  { label: "Coordinación", sub: "Sistémica", color: "amber", grad: "from-amber-500 to-orange-500" },
                  { label: "Ejecución", sub: "Técnica", color: "purple", grad: "from-purple-500 to-violet-500" }
                ].map((stat, i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.08)' }}
                    className="relative group p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm transition-all duration-300 overflow-hidden"
                  >
                    <div className={`absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r ${stat.grad} opacity-50 group-hover:opacity-100 transition-opacity`} />
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${stat.grad} mb-3 shadow-[0_0_10px_rgba(0,0,0,0.3)]`} />
                    <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wide mb-1">{stat.label}</h4>
                    <p className="text-xs text-slate-500 font-medium">{stat.sub}</p>
                  </motion.div>
                ))}
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

