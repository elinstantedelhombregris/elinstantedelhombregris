import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Wind } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

const TerrenoLimpio = () => {
  // Partículas flotantes para efecto visual
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 3,
    duration: 3 + Math.random() * 2,
  }));

  return (
    <section className="py-24 md:py-32 bg-[#0a0a0a] relative overflow-hidden min-h-[60vh] flex items-center">
      {/* Fondo minimalista con partículas sutiles */}
      <div className="absolute inset-0">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-1 h-1 bg-blue-500/20 rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.5, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Líneas sutiles que se desvanecen */}
      <div className="absolute inset-0 opacity-10">
        {Array.from({ length: 5 }, (_, i) => (
          <motion.div
            key={i}
            className="absolute w-px h-full bg-gradient-to-b from-transparent via-blue-500 to-transparent"
            style={{
              left: `${20 + i * 20}%`,
            }}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, 0.3, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: i * 0.8,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="text-center"
          >
            {/* Icono sutil */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.8, type: "spring" }}
              className="inline-flex items-center justify-center p-4 mb-8 rounded-full bg-white/5 border border-white/10"
            >
              <Wind className="w-8 h-8 text-blue-400/60" />
            </motion.div>

            {/* Quote principal */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 1 }}
              className="space-y-8 mb-12"
            >
              <h2 className="text-3xl md:text-5xl font-serif italic text-slate-200 leading-relaxed font-light">
                Ahora que quien decidió dijo <span className="text-blue-400 font-normal">¡BASTA!</span>,
                <br className="hidden md:block" />
                el terreno está limpio.
              </h2>
              
              <div className="h-px w-32 bg-gradient-to-r from-transparent via-slate-600 to-transparent mx-auto" />
              
              <p className="text-xl md:text-2xl text-slate-400 leading-relaxed font-light">
                El espacio está preparado. El pozo tallado en tiempo decidió desbordarse.
                <br className="hidden md:block" />
                <span className="text-slate-300">
                  ¿Qué construye el Hombre Gris sobre esta base?
                </span>
              </p>
            </motion.div>

            {/* Espacio vacío visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8, duration: 1 }}
              className="relative w-full max-w-md mx-auto h-48 mb-12"
            >
              <div className="absolute inset-0 border border-white/10 rounded-3xl backdrop-blur-sm bg-white/5" />
              
              {/* Interior del espacio vacío con efecto de profundidad */}
              <div className="absolute inset-4 border border-white/5 rounded-2xl" />
              
              {/* Efecto de luz central */}
              <motion.div
                animate={{
                  opacity: [0.1, 0.2, 0.1],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl"
              />
            </motion.div>

            {/* CTA suave */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 1, duration: 0.8 }}
            >
              <Link href="/la-vision">
                <Button 
                  variant="ghost"
                  className="bg-transparent border border-white/10 text-slate-300 hover:bg-white/5 hover:text-white hover:border-blue-500/30 px-8 py-6 rounded-full text-lg transition-all duration-300 group"
                >
                  Ver la visión que ordena
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TerrenoLimpio;

