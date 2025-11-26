import React from 'react';
import { motion } from 'framer-motion';
import { Target, Eye, Users, Waves } from 'lucide-react';

const WhatIsBasta = () => {
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

  return (
    <section className="py-32 bg-[#0a0a0a] relative overflow-hidden">
      {/* The Tide Background Effect */}
      <div className="absolute bottom-0 left-0 right-0 h-64 opacity-10 pointer-events-none">
        <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <motion.path
            fill="#3b82f6"
            fillOpacity="1"
            d="M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,165.3C672,139,768,117,864,128C960,139,1056,181,1152,197.3C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            animate={{
              d: [
                "M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,165.3C672,139,768,117,864,128C960,139,1056,181,1152,197.3C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
                "M0,192L48,186.7C96,181,192,171,288,176C384,181,480,203,576,213.3C672,224,768,224,864,202.7C960,181,1056,139,1152,128C1248,117,1344,139,1392,149.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
                "M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,165.3C672,139,768,117,864,128C960,139,1056,181,1152,197.3C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
              ]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
        </svg>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-5xl mx-auto"
        >
          {/* Header Block */}
          <div className="text-center mb-20">
            <motion.div variants={itemVariants} className="inline-flex items-center justify-center p-3 mb-6 rounded-full bg-blue-500/10 border border-blue-500/20">
              <Waves className="w-6 h-6 text-blue-400" />
            </motion.div>
            
            <motion.h2 variants={itemVariants} className="heading-section mb-6">
              ¿Qué es <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">¡BASTA!</span>?
            </motion.h2>
            
            <motion.p variants={itemVariants} className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-light">
              No es una organización. Es una <span className="text-blue-400 font-medium">marea</span> que crece cuando quien decide se une. <br className="hidden md:block" />
              No tiene dueño. Tiene <span className="text-purple-400 font-medium">dirección</span> hacia la Argentina posible. <br className="hidden md:block" />
              No tiene jefes. Tiene <span className="text-emerald-400 font-medium">principios</span> que cobran vida en quien elige construir.
            </motion.p>
          </div>

          {/* Principles Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Transformación Personal",
                desc: "El cambio comienza cuando quien decide que ¡BASTA! elige transformarse. No se espera que otros cambien primero: se es el cambio que se quiere ver en el mundo.",
                icon: <Target className="w-10 h-10" />,
                gradient: "from-blue-500/20 to-blue-600/5",
                border: "group-hover:border-blue-500/30",
                text: "text-blue-400"
              },
              {
                title: "Visión Compartida",
                desc: "Quien decide diseña Argentina desde el futuro que desea, no desde el pasado que sufrió. El mapa emocional y estratégico se construye entre quienes eligieron ver más allá de lo evidente.",
                icon: <Eye className="w-10 h-10" />,
                gradient: "from-purple-500/20 to-purple-600/5",
                border: "group-hover:border-purple-500/30",
                text: "text-purple-400"
              },
              {
                title: "Acción Coordinada",
                desc: "Millones de acciones individuales de quienes decidieron crear el cambio colectivo imparable. Individual no basta: quien elige necesita coordinarse con quien también eligió.",
                icon: <Users className="w-10 h-10" />,
                gradient: "from-emerald-500/20 to-emerald-600/5",
                border: "group-hover:border-emerald-500/30",
                text: "text-emerald-400"
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className={`group relative p-8 rounded-3xl bg-[#0f1115] border border-white/5 overflow-hidden transition-all duration-500 hover:-translate-y-2 ${item.border}`}
              >
                {/* Card Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                <div className="relative z-10">
                  <div className={`mb-6 p-4 rounded-2xl bg-white/5 w-fit ${item.text} ring-1 ring-white/10`}>
                    {item.icon}
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-white mb-4">{item.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Quote */}
          <motion.div 
            variants={itemVariants}
            className="mt-20 text-center"
          >
            <blockquote className="text-lg text-slate-500 italic max-w-2xl mx-auto leading-relaxed">
              "Cuando una marea alcanza su momento, cuando suficientes quienes decidieron se unen, nada puede detenerla."
              <footer className="text-sm text-slate-600 mt-2 not-italic uppercase tracking-widest font-bold">— Manifiesto ¡BASTA!</footer>
            </blockquote>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default WhatIsBasta;

