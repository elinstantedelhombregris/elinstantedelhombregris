import React from 'react';
import { motion } from 'framer-motion';
import { Target, Cog, Building2, Infinity, ArrowRight } from 'lucide-react';

// CSS para animación del círculo
const circleAnimationStyle = `
  @keyframes drawCircle1 {
    0% {
      stroke-dashoffset: 628.32;
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
    100% {
      stroke-dashoffset: 0;
      opacity: 1;
    }
  }
  @keyframes drawCircle2 {
    0% {
      stroke-dashoffset: 628.32;
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
    100% {
      stroke-dashoffset: -209.44;
      opacity: 1;
    }
  }
  @keyframes drawCircle3 {
    0% {
      stroke-dashoffset: 628.32;
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
    100% {
      stroke-dashoffset: -418.88;
      opacity: 1;
    }
  }
  @keyframes pulseRing {
    0%, 100% {
      transform: scale(1);
      opacity: 0.5;
    }
    50% {
      transform: scale(1.3);
      opacity: 0;
    }
  }
  @keyframes pulseDot {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.2);
    }
  }
`;

const BastaPrincipio = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
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

  const phases = [
    {
      title: 'El Inicio',
      subtitle: 'El momento del quiebre',
      description: 'El momento en que una persona deja de normalizar lo que la daña y nombra el límite con claridad. No es solo rechazo: es el inicio de una responsabilidad nueva.',
      quote: 'Nombrar el límite es recuperar dirección.',
      icon: <Target className="w-10 h-10" />,
      color: 'blue',
      gradient: 'from-blue-500/20 to-blue-600/5',
      border: 'border-blue-500/20',
      hoverBorder: 'group-hover:border-blue-500/40',
      text: 'text-blue-400',
      bg: 'bg-blue-500/10'
    },
    {
      title: 'El Proceso',
      subtitle: 'La construcción',
      description: 'La etapa donde la energía del quiebre se convierte en método: diagnóstico compartido, prioridades y decisiones coordinadas. Menos reacción, más diseño.',
      quote: 'Lo que no se ordena, se dispersa.',
      icon: <Cog className="w-10 h-10" />,
      color: 'purple',
      gradient: 'from-purple-500/20 to-purple-600/5',
      border: 'border-purple-500/20',
      hoverBorder: 'group-hover:border-purple-500/40',
      text: 'text-purple-400',
      bg: 'bg-purple-500/10'
    },
    {
      title: 'El Fin',
      subtitle: 'La transformación',
      description: 'La fase en que el trabajo sostenido produce resultados verificables. La ciudadanía marca rumbo y las instituciones ejecutan con trazabilidad.',
      quote: 'Cuando la ciudadanía coordina, la política responde.',
      icon: <Building2 className="w-10 h-10" />,
      color: 'emerald',
      gradient: 'from-emerald-500/20 to-emerald-600/5',
      border: 'border-emerald-500/20',
      hoverBorder: 'group-hover:border-emerald-500/40',
      text: 'text-emerald-400',
      bg: 'bg-emerald-500/10'
    }
  ];

  return (
    <section className="py-32 bg-gradient-to-b from-[#0a0a0a] via-[#1a1f2e] to-[#0a0a0a] relative overflow-hidden">
      <style>{circleAnimationStyle}</style>
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent opacity-50" />
      
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
              className="inline-flex items-center justify-center p-3 mb-6 rounded-full bg-blue-500/10 border border-blue-500/20"
            >
              <Infinity className="w-6 h-6 text-blue-400" />
            </motion.div>
            
            <motion.h2 
              variants={itemVariants}
              className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight leading-tight"
            >
              ¡BASTA! <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Como Principio</span>
            </motion.h2>
            
            <motion.p 
              variants={itemVariants}
              className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-light"
            >
              No es solo un grito. Es una <span className="text-blue-400 font-semibold">decisión de madurez cívica</span>.
              <br className="hidden md:block" />
              Un principio con <span className="text-blue-400 font-semibold">inicio</span>, proceso y <span className="text-purple-400 font-semibold">resultado</span>.
              <br className="hidden md:block" />
              Cada ciclo convierte indignación en capacidad de transformación.
            </motion.p>
          </motion.div>

          {/* Visualización del Ciclo - Diagrama Circular Mejorado */}
          <motion.div
            variants={itemVariants}
            className="mb-20"
          >
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 md:p-12">
              <h3 className="text-xl font-semibold text-slate-300 text-center mb-8 uppercase tracking-wider font-serif">
                El Ciclo del Principio
              </h3>
              <div className="max-w-3xl mx-auto">
                <div className="relative w-full aspect-square max-w-lg mx-auto">
                  {/* Círculo base con fondo sutil */}
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 240 240">
                    {/* Círculo de fondo completo */}
                    <circle
                      cx="120"
                      cy="120"
                      r="100"
                      fill="none"
                      stroke="rgba(255,255,255,0.05)"
                      strokeWidth="2"
                    />
                    
                    <defs>
                      <linearGradient id="gradient-inicio" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="1" />
                      </linearGradient>
                      <linearGradient id="gradient-proceso" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="1" />
                      </linearGradient>
                      <linearGradient id="gradient-fin" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#34d399" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="1" />
                      </linearGradient>
                      <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge>
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>
                    
                    {/* Segmento 1 - INICIO (120 grados) */}
                    <circle
                      cx="120"
                      cy="120"
                      r="100"
                      fill="none"
                      stroke="#60a5fa"
                      strokeWidth="16"
                      strokeLinecap="round"
                      strokeDasharray={`${(120 / 360) * 628.32} 628.32`}
                      strokeDashoffset="628.32"
                      style={{
                        animation: 'drawCircle1 1.5s ease-out 0.3s forwards',
                        opacity: 0,
                      }}
                    />
                    
                    {/* Segmento 2 - PROCESO (120 grados, offset 120) */}
                    <circle
                      cx="120"
                      cy="120"
                      r="100"
                      fill="none"
                      stroke="#a78bfa"
                      strokeWidth="16"
                      strokeLinecap="round"
                      strokeDasharray={`${(120 / 360) * 628.32} 628.32`}
                      strokeDashoffset="628.32"
                      style={{
                        animation: 'drawCircle2 1.5s ease-out 0.8s forwards',
                        opacity: 0,
                      }}
                    />
                    
                    {/* Segmento 3 - FIN (120 grados, offset 240) */}
                    <circle
                      cx="120"
                      cy="120"
                      r="100"
                      fill="none"
                      stroke="#34d399"
                      strokeWidth="16"
                      strokeLinecap="round"
                      strokeDasharray={`${(120 / 360) * 628.32} 628.32`}
                      strokeDashoffset="628.32"
                      style={{
                        animation: 'drawCircle3 1.5s ease-out 1.3s forwards',
                        opacity: 0,
                      }}
                    />
                    
                    {/* Líneas divisorias con efecto */}
                    {[0, 120, 240].map((angle, i) => (
                      <line
                        key={i}
                        x1="120"
                        y1="120"
                        x2={120 + 100 * Math.cos((angle - 90) * Math.PI / 180)}
                        y2={120 + 100 * Math.sin((angle - 90) * Math.PI / 180)}
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth="1"
                      />
                    ))}
                  </svg>
                  
                  {/* Centro con icono animado */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div 
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 2.2, duration: 0.6, type: "spring" }}
                      className="relative"
                    >
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm border-2 border-white/10 flex items-center justify-center shadow-xl">
                        <Infinity className="w-12 h-12 text-blue-400" />
                      </div>
                      {/* Anillo pulsante alrededor del centro */}
                      <div
                        className="absolute inset-0 rounded-full border-2 border-blue-500/30"
                        style={{
                          animation: 'pulseRing 3s ease-in-out infinite',
                        }}
                      />
                    </motion.div>
                  </div>
                  
                  {/* Labels mejorados alrededor del círculo */}
                  <div className="absolute inset-0">
                    {/* INICIO - arriba */}
                    <motion.div 
                      initial={{ opacity: 0, y: -20, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: 2.5, duration: 0.6, type: "spring" }}
                      className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
                    >
                      <div 
                        className="w-4 h-4 rounded-full bg-blue-400 mx-auto mb-2 shadow-lg shadow-blue-400/50"
                        style={{
                          animation: 'pulseDot 2s ease-in-out infinite',
                        }}
                      />
                      <p className="text-sm text-blue-300 uppercase tracking-wider font-bold">Inicio</p>
                      <p className="text-xs text-slate-400 mt-1">El Quiebre</p>
                    </motion.div>
                    
                    {/* PROCESO - abajo izquierda */}
                    <motion.div 
                      initial={{ opacity: 0, x: -20, scale: 0.8 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      transition={{ delay: 2.7, duration: 0.6, type: "spring" }}
                      className="absolute bottom-6 left-6 text-center"
                    >
                      <div 
                        className="w-4 h-4 rounded-full bg-purple-400 mx-auto mb-2 shadow-lg shadow-purple-400/50"
                        style={{
                          animation: 'pulseDot 2s ease-in-out 0.3s infinite',
                        }}
                      />
                      <p className="text-sm text-purple-300 uppercase tracking-wider font-bold">Proceso</p>
                      <p className="text-xs text-slate-400 mt-1">La Construcción</p>
                    </motion.div>
                    
                    {/* FIN - abajo derecha */}
                    <motion.div 
                      initial={{ opacity: 0, x: 20, scale: 0.8 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      transition={{ delay: 2.9, duration: 0.6, type: "spring" }}
                      className="absolute bottom-6 right-6 text-center"
                    >
                      <div 
                        className="w-4 h-4 rounded-full bg-emerald-400 mx-auto mb-2 shadow-lg shadow-emerald-400/50"
                        style={{
                          animation: 'pulseDot 2s ease-in-out 0.6s infinite',
                        }}
                      />
                      <p className="text-sm text-emerald-300 uppercase tracking-wider font-bold">Fin</p>
                      <p className="text-xs text-slate-400 mt-1">La Transformación</p>
                    </motion.div>
                  </div>
                  
                  {/* Flechas simples indicando dirección del flujo */}
                  <div className="absolute inset-0">
                    {/* Flecha 1: Inicio → Proceso */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 0.6, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 3.5, duration: 0.5 }}
                      className="absolute"
                      style={{
                        top: '50%',
                        left: '60%',
                        transform: 'translate(-50%, -50%) rotate(60deg)',
                      }}
                    >
                      <ArrowRight className="w-6 h-6 text-blue-400/60" />
                    </motion.div>
                    
                    {/* Flecha 2: Proceso → Fin */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 0.6, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 3.8, duration: 0.5 }}
                      className="absolute"
                      style={{
                        bottom: '25%',
                        left: '40%',
                        transform: 'translate(-50%, 50%) rotate(180deg)',
                      }}
                    >
                      <ArrowRight className="w-6 h-6 text-purple-400/60" />
                    </motion.div>
                    
                    {/* Flecha 3: Fin → Inicio (ciclo) */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 0.6, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 4.1, duration: 0.5 }}
                      className="absolute"
                      style={{
                        bottom: '25%',
                        right: '40%',
                        transform: 'translate(50%, 50%) rotate(-60deg)',
                      }}
                    >
                      <ArrowRight className="w-6 h-6 text-emerald-400/60" />
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Three Phase Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {phases.map((phase, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className={`group relative p-8 rounded-3xl bg-white/5 backdrop-blur-sm border ${phase.border} ${phase.hoverBorder} overflow-hidden transition-all duration-500 hover:-translate-y-2`}
              >
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${phase.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                {/* Glow Effect */}
                <div className={`absolute top-0 right-0 w-32 h-32 ${phase.bg} rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity`} />
                
                <div className="relative z-10">
                  <div className={`mb-6 p-4 rounded-2xl ${phase.bg} w-fit ${phase.text} ring-1 ring-white/10`}>
                    {phase.icon}
                  </div>
                  
                  <div className="mb-2">
                    <span className={`text-sm ${phase.text} font-medium uppercase tracking-wider`}>
                      {phase.subtitle}
                    </span>
                  </div>
                  
                  <h3 className="text-2xl font-serif font-bold text-white mb-4">
                    {phase.title}
                  </h3>
                  
                  <p className="text-slate-400 leading-relaxed mb-6">
                    {phase.description}
                  </p>
                  
                  <div className="border-t border-white/10 pt-4">
                    <p className={`text-sm ${phase.text} italic font-light`}>
                      "{phase.quote}"
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Quote Section */}
          <motion.div
            variants={itemVariants}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-12">
              <p className="text-2xl md:text-3xl font-serif italic text-slate-200 mb-6 leading-relaxed">
                "Sin diagnóstico compartido no hay estrategia; sin estrategia no hay transformación."
              </p>
              <p className="text-slate-400 text-lg leading-relaxed">
                El objetivo no es repetir consignas, sino crear capacidades públicas nuevas: claridad para decidir, coordinación para ejecutar y continuidad para sostener resultados.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default BastaPrincipio;
