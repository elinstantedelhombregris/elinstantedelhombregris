import { BookOpen, MapPin } from 'lucide-react';
import PowerCTA from "./PowerCTA";

const HeroSectionHombreGris = () => {
  const handleExploreMap = () => {
    // Scroll to map section
    const mapSection = document.getElementById('mapa-sueños');
    if (mapSection) {
      mapSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleReadManifesto = () => {
    // Navigate to blog
    window.location.href = '/recursos/blog';
  };

  return (
    <section className="relative min-h-screen hero-gradient-dark overflow-hidden flex items-center text-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236477C0' fill-opacity='0.12'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Animated circles background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10 py-20">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge - Simplified design */}
          <div className="mb-12 inline-block">
            <div className="bg-white/5 backdrop-blur-lg border border-white/15 rounded-full px-8 py-3 text-sm tracking-[0.3em] uppercase text-white/70">
              El Despertar del Ciudadano Común
            </div>
          </div>

          {/* Main Title - Simplified typography */}
          <h1 className="heading-hero text-white mb-10">
            <span className="block text-white/70 text-lg md:text-xl tracking-[0.35em] uppercase mb-4">
              El instante
            </span>
            <span className="block">del Hombre Gris</span>
          </h1>

          {/* Main Quote - Unified styling */}
          <div className="mb-12 max-w-4xl mx-auto">
            <blockquote className="text-xl md:text-2xl text-white/75 leading-relaxed italic">
              "El momento en que lo invisible se hace visible, cuando el ciudadano común despierta y se convierte en arquitecto de su destino."
            </blockquote>
          </div>

          {/* Subtitle - Consistent typography */}
          <div className="text-lg md:text-xl text-white/75 mb-12 max-w-4xl mx-auto leading-relaxed space-y-4">
            <p>
              No somos espectadores de la historia argentina: somos sus co-creadores. 
              Este es el espacio donde la filosofía se encuentra con la acción, 
              donde las ideas se transforman en movimiento,
            </p>
            <p className="text-white font-semibold">
              y donde cada argentino puede contribuir a construir el país que siempre supimos posible.
            </p>
          </div>

          {/* Action Buttons - Consistent styling */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <PowerCTA
              size="lg"
              variant="accent"
              text="Explorar el Mapa de Sueños"
              onClick={handleExploreMap}
              icon={<MapPin className="h-5 w-5" />}
            />
            <PowerCTA
              size="lg"
              variant="outline"
              text="Descubrir la filosofía"
              onClick={handleReadManifesto}
              icon={<BookOpen className="h-5 w-5" />}
            />
          </div>
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

export default HeroSectionHombreGris;
