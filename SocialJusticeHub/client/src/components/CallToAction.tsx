import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { ArrowRight, Sparkles, Heart } from 'lucide-react';

const CallToAction = () => {

  return (
    <section className="section-spacing bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 relative overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.2'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="container-content text-center relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md rounded-full mb-8 border border-white/20">
          <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
          <span className="text-white font-semibold text-sm">Una invitación, no una demanda</span>
        </div>

        {/* Title */}
        <h2 className="heading-hero text-white mb-8">
          Si algo de esto resuena con quien lee,
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 mt-2">
            puede explorar más
          </span>
        </h2>

        {/* Subtitle */}
        <p className="heading-hero-subtitle text-blue-100 max-content-width mx-auto mb-8 font-light">
          Si no, está bien. No todos los caminos son para todos. 
          <br />
          <span className="text-white">La participación importa, pero solo si quien decide realmente lo elige.</span>
        </p>
        
        {/* Nueva sección: Comparte */}
        <div className="max-w-3xl mx-auto mb-16">
          <p className="text-lg text-blue-200 mb-6">
            Quien decide puede compartir sus sueños, valores, necesidades y ¡BASTA!:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all">
              <div className="text-3xl mb-2">💭</div>
              <p className="text-white font-semibold">Sueños</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all">
              <div className="text-3xl mb-2">💎</div>
              <p className="text-white font-semibold">Valores</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all">
              <div className="text-3xl mb-2">🤲</div>
              <p className="text-white font-semibold">Necesidades</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-red/20 hover:bg-red-500/30 transition-all">
              <div className="text-3xl mb-2">⚡</div>
              <p className="text-white font-semibold">¡BASTA!</p>
            </div>
          </div>
        </div>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mb-16">
          <Link href="/register">
            <Button 
              size="lg"
              className="bg-white text-indigo-900 hover:bg-gray-100 font-bold py-6 px-10 rounded-2xl transition-all transform hover:scale-105 shadow-2xl text-lg group"
            >
              <Heart className="w-6 h-6 mr-3 group-hover:animate-pulse" />
              Explorar el movimiento
              <ArrowRight className="w-6 h-6 ml-3" />
            </Button>
          </Link>
        </div>


        {/* Quote */}
        <div className="mt-16">
          <p className="text-xl md:text-2xl text-blue-200 italic font-light max-w-3xl mx-auto">
            "El pozo siempre estuvo lleno. Ahora es tiempo de desbordarse."
          </p>
          <p className="text-blue-300 mt-4 font-semibold">— El Hombre Gris</p>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
