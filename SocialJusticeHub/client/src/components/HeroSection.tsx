import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Heart } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import PowerCTA from './PowerCTA';

const HeroSection = () => {
  const handleExploreVision = () => {
    // Scroll to vision section
    window.scrollTo({ top: 800, behavior: 'smooth' });
  };

  // Fetch dreams count for real-time counter
  const { data: dreams = [] } = useQuery({
    queryKey: ['/api/dreams'],
    staleTime: 60000,
  });

  const totalParticipants = Array.isArray(dreams) ? dreams.length : 0;

  return (
    <section className="relative min-h-screen hero-gradient-default overflow-hidden text-white">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-20 pattern-dots"></div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0f111c]/50 to-[#0b0d16]"></div>
      
      <div className="container-content h-full flex flex-col justify-center relative z-10 section-spacing">
        <div className="max-content-width text-center">
          {/* Main Title - Conversacional */}
          <h1 className="heading-hero text-white mb-6">
            <span className="block heading-hero-subtitle text-white/70 italic mb-6">
              “Eres un pozo tallado no en piedra, sino en tiempo.”
            </span>
            <span className="block text-white">Y estás destinado a desbordarte</span>
          </h1>

          {/* Subtitle - Más conversacional */}
          <div className="heading-hero-subtitle text-white/75 mb-12 space-y-4">
            <p>
              Si estás aquí es porque ya sabés que algo tiene que cambiar.
              Que el equilibrio nuevo no llega desde arriba sino desde adentro.
            </p>
            <p className="text-white/85">
              Este es un espacio sereno, diseñado para quienes actúan con precisión
              y eligen transformar su vida, su comunidad y el movimiento entero.
            </p>
          </div>

          {/* Single CTA - Invitación */}
          <div className="mb-12">
            <PowerCTA
              text="Explorar el movimiento"
              variant="primary"
              onClick={handleExploreVision}
              size="lg"
              animate={true}
            />
          </div>

          {/* Stats - Más sutiles y humanos */}
          {totalParticipants > 0 && (
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/15 max-w-2xl mx-auto">
              <p className="text-white/70 text-lg mb-2">
                Hay otros como vos que están empezando a actuar
              </p>
              <div className="flex items-center justify-center gap-3">
                <Heart className="w-5 h-5 text-accent" />
                <span className="text-2xl font-semibold text-white">{totalParticipants.toLocaleString('es-AR')}</span>
                <span className="text-white/70">
                  {totalParticipants === 1 ? 'argentino' : 'argentinos'} participando
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="scroll-indicator">
        <div className="scroll-indicator-inner border-white/40">
          <div className="scroll-indicator-dot bg-white/60"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;