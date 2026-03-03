import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Brain } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

const TerrenoLimpio = () => {
  // Partículas flotantes para efecto visual
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 3,
    duration: 3 + Math.random() * 2,
  }));

  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-[#0a0a0a] via-[#0b1020] to-[#0a0a0a] relative overflow-hidden min-h-[50vh] flex items-center">
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
              scale: [0.8, 1.4, 0.8],
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
              <Brain className="w-8 h-8 text-blue-300/70" />
            </motion.div>

            {/* Mensaje condensado */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 1 }}
              className="space-y-8 mb-10"
            >
              <h2 className="text-3xl md:text-5xl font-serif italic text-slate-50 leading-relaxed font-light">
                El límite ya se nombró. Ahora toca diseñar el siguiente paso.
              </h2>
              
              <div className="flex items-center gap-4 justify-center text-xs md:text-sm uppercase tracking-[0.25em] text-slate-400">
                <span className="px-4 py-2 rounded-full border border-white/10 bg-white/5">
                  Diagnóstico ciudadano
                </span>
                <div className="flex-1 h-px bg-gradient-to-r from-blue-500/40 via-slate-500/40 to-emerald-500/40 max-w-[140px] md:max-w-[200px]" />
                <span className="px-4 py-2 rounded-full border border-white/10 bg-white/5">
                  Hoja de ruta compartida
                </span>
              </div>
            </motion.div>

            {/* CTAs directas */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 1, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/la-vision">
                <Button 
                  variant="ghost"
                  className="bg-white/5 border border-white/10 text-slate-100 hover:bg-blue-500/10 hover:text-white hover:border-blue-400/40 px-8 py-6 rounded-full text-lg transition-all duration-300 group shadow-[0_20px_80px_rgba(56,189,248,0.10)]"
                >
                  Ver la visión completa
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button
                asChild
                variant="outline"
                className="border border-blue-500/30 text-blue-200 bg-transparent hover:bg-blue-500/10 hover:text-white px-8 py-6 rounded-full text-lg transition-all duration-300 group"
              >
                <a href="#plan-transformacion">
                  Revisar la hoja de ruta
                  <ArrowRight className="ml-2 w-5 h-5 inline group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TerrenoLimpio;
