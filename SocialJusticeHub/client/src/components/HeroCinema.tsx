import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

interface HeroCinemaProps {
  title: React.ReactNode;
  subtitle: string;
  backgroundImage?: string;
  overlayGradient?: string;
  ctaText?: string;
  ctaLink?: string;
  onScrollDown?: () => void;
}

const HeroCinema: React.FC<HeroCinemaProps> = ({
  title,
  subtitle,
  backgroundImage,
  overlayGradient = "bg-gradient-to-b from-[#0a0a0a]/80 via-[#1a1f2e]/60 to-[#0a0a0a]",
  ctaText,
  ctaLink,
  onScrollDown
}) => {
  return (
    <section className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-[#0a0a0a]">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        {backgroundImage && (
          <motion.div
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 10, ease: "easeOut" }}
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: backgroundImage.startsWith('url') ? backgroundImage : `url(${backgroundImage})`,
            }}
          />
        )}
        {/* Cinematic Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0a0a0a_90%)] opacity-80" />
        <div className={`absolute inset-0 ${overlayGradient}`} />
        {/* Animated Dust/Particles Effect (CSS based) */}
        <div className="absolute inset-0 opacity-30 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
      </div>

      {/* Content Layer */}
      <div className="relative z-10 container mx-auto px-4 md:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="max-w-5xl mx-auto"
        >
          <motion.div 
            initial={{ opacity: 0, letterSpacing: "0.5em" }}
            animate={{ opacity: 1, letterSpacing: "0.3em" }}
            transition={{ delay: 0.2, duration: 1.5 }}
            className="mb-8"
          >
            <span className="inline-block py-1.5 px-4 rounded-full bg-white/5 border border-white/10 text-blue-300 text-xs md:text-sm uppercase backdrop-blur-md shadow-lg tracking-[0.3em]">
              El Despertar del Hombre Gris
            </span>
          </motion.div>

          <div className="heading-hero mb-8 drop-shadow-2xl">
            {title}
          </div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="heading-hero-subtitle mb-12 font-light text-slate-300/90"
          >
            {subtitle}
          </motion.p>

          {ctaText && ctaLink && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.8 }}
            >
              <Link href={ctaLink}>
                <Button 
                  size="lg" 
                  className="relative group bg-blue-600 hover:bg-blue-500 text-white px-10 py-7 rounded-full text-lg tracking-widest shadow-[0_0_40px_rgba(37,99,235,0.4)] transition-all duration-500 hover:shadow-[0_0_60px_rgba(37,99,235,0.6)] hover:-translate-y-1 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center font-semibold">
                    {ctaText}
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  {/* Inner Glow Pulse */}
                  <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md" />
                </Button>
              </Link>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 cursor-pointer z-20"
        onClick={onScrollDown}
      >
        <div className="flex flex-col items-center gap-3 opacity-60 hover:opacity-100 transition-opacity group">
          <span className="text-[10px] uppercase tracking-[0.3em] text-slate-400 group-hover:text-white transition-colors">Descubrir</span>
          <div className="w-px h-12 bg-gradient-to-b from-transparent via-slate-400 to-transparent group-hover:via-white transition-colors relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1/2 bg-white animate-slide-down" />
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default HeroCinema;
