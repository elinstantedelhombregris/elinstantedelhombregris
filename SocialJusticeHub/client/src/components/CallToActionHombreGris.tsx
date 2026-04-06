import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowRight, 
  Star, 
  Users, 
  Globe, 
  BookOpen,
  Play,
  MapPin,
  MessageCircle
} from 'lucide-react';

const CallToActionHombreGris = () => {
  const actions = [
    {
      icon: <MapPin className="w-8 h-8" />,
      title: "Explorar el Mapa",
      description: "Descubre los sueños, valores y necesidades de otros argentinos en nuestro mapa interactivo.",
      buttonText: "Ver Mapa",
      color: "from-blue-500 to-blue-600",
      bgColor: "from-blue-50 to-blue-100",
      borderColor: "border-blue-200",
      action: () => {
        const mapSection = document.getElementById('mapa-sueños');
        if (mapSection) {
          mapSection.scrollIntoView({ behavior: 'smooth' });
        }
      }
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: "Compartir mi Sueño",
      description: "Agrega tu sueño al mapa y conecta con otros que comparten tu visión de Argentina.",
      buttonText: "Compartir",
      color: "from-pink-500 to-pink-600",
      bgColor: "from-pink-50 to-pink-100",
      borderColor: "border-pink-200",
      action: () => {
        const mapSection = document.getElementById('mapa-sueños');
        if (mapSection) {
          mapSection.scrollIntoView({ behavior: 'smooth' });
        }
      }
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Leer el Manifiesto",
      description: "Sumérgete en las reflexiones profundas del Hombre Gris sobre la transformación de Argentina.",
      buttonText: "Leer Blog",
      color: "from-green-500 to-green-600",
      bgColor: "from-green-50 to-green-100",
      borderColor: "border-green-200",
      action: () => {
        window.location.href = '/recursos/blog';
      }
    },
    {
      icon: <Play className="w-8 h-8" />,
      title: "Ver Videos",
      description: "Escucha las reflexiones en video del Hombre Gris sobre sistemas, amabilidad y transformación.",
      buttonText: "Ver Vlog",
      color: "from-purple-500 to-purple-600",
      bgColor: "from-purple-50 to-purple-100",
      borderColor: "border-purple-200",
      action: () => {
        window.location.href = '/recursos/vlog';
      }
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "La Semilla de ¡BASTA!",
      description: "Explora el árbol interactivo del movimiento y descubre cómo cada elemento se conecta.",
      buttonText: "Explorar Árbol",
      color: "from-amber-500 to-amber-600",
      bgColor: "from-amber-50 to-amber-100",
      borderColor: "border-amber-200",
      action: () => {
        window.location.href = '/la-semilla-de-basta';
      }
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Unirse al Movimiento",
      description: "Conecta con otros argentinos que comparten la visión de transformación sistémica.",
      buttonText: "Conectar",
      color: "from-indigo-500 to-indigo-600",
      bgColor: "from-indigo-50 to-indigo-100",
      borderColor: "border-indigo-200",
      action: () => {
        // Scroll to community section or redirect to community page
        window.location.href = '/community';
      }
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6 font-serif">
            ¿Listo para ser parte del cambio?
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Cada acción individual se convierte en transformación colectiva. 
            Tu contribución es la semilla que puede cambiar todo el sistema.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {actions.map((action, index) => (
            <Card 
              key={index} 
              className={`bg-gradient-to-br ${action.bgColor} border-2 ${action.borderColor} hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group`}
              onClick={action.action}
            >
              <CardHeader>
                <div className={`w-16 h-16 bg-gradient-to-br ${action.color} text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {action.icon}
                </div>
                <CardTitle className="text-xl font-bold text-gray-800 group-hover:text-gray-900 transition-colors">
                  {action.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 leading-relaxed text-base mb-6">
                  {action.description}
                </CardDescription>
                <Button 
                  className={`w-full bg-gradient-to-r ${action.color} hover:opacity-90 text-white font-semibold py-3 rounded-xl transition-all transform group-hover:scale-105`}
                >
                  {action.buttonText}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Este es el Instante Section */}
        <section className="py-16 bg-gradient-to-br from-slate-900 via-gray-800 to-slate-900 text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-block bg-gradient-to-r from-amber-500 to-orange-600 rounded-full px-6 py-2 mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">⚡</span>
                    </div>
                    <p className="text-sm font-semibold text-white">El Momento Decisivo</p>
                  </div>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6 font-serif">
                  Este es el Instante
                </h2>
                <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
                  Parravicini vio este momento hace casi un siglo. Ahora es nuestro tiempo de hacerlo realidad.
                </p>
              </div>

              <div className="bg-gradient-to-br from-amber-900/40 to-orange-900/40 backdrop-blur-md rounded-3xl p-10 md:p-12 border border-amber-500/30 shadow-2xl mb-12">
                <div className="text-center mb-8">
                  <p className="text-2xl md:text-3xl font-serif italic text-white leading-relaxed mb-6">
                    "Argentina tendrá su revolución francesa en triunfo<br />
                    <span className="text-yellow-300">si ve el instante del hombre gris que será"</span>
                  </p>
                  <p className="text-center text-amber-200 text-lg">
                    — Benjamín Solari Parravicini, 1937
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8">
                  <h3 className="text-2xl font-bold text-white mb-6 text-center">
                    ¿Qué pasará si no decidimos hacer algo completamente diferente?
                  </h3>
                  <p className="text-lg text-gray-200 leading-relaxed mb-6 text-center">
                    Es obvio que nos vamos a terminar peleando todos contra todos si no vemos el instante de cambiar de verdad.
                    Nos vamos a pegar y va a llegar un día en que llegaremos a la misma realización colectiva:
                  </p>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-amber-300 mb-4">
                      "¡BASTA! de pelear, ¡BASTA! de ser idiotas"
                    </p>
                    <p className="text-xl text-gray-300">
                      Esto va a pasar inevitablemente. La pregunta no es SI, sino CUÁNDO.
                    </p>
                  </div>
                </div>

                <div className="text-center bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8">
                  <h4 className="text-2xl font-bold text-white mb-4">
                    La Organización Acelera el Cambio
                  </h4>
                  <p className="text-lg text-green-100 leading-relaxed mb-6">
                    Mientras más rápido nos organicemos alrededor de principios claros de transformación sistémica,
                    más rápido estaremos viviendo en la Argentina que siempre supimos posible: próspera, justa,
                    amable y verdaderamente soberana.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                      <p className="text-white font-semibold">Más organización temprana</p>
                      <p className="text-green-200 text-sm">= Más rápido el cambio positivo</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                      <p className="text-white font-semibold">Más caos prolongado</p>
                      <p className="text-green-200 text-sm">= Más sufrimiento innecesario</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-xl font-bold text-white mb-6">
                  El Hombre Gris que Parravicini profetizó no es una persona: <span className="text-amber-300">somos todos nosotros</span>
                </p>
                <p className="text-2xl font-bold text-amber-300 mb-8">
                  El instante es ahora. El Hombre Gris sos vos.
                </p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                  >
                    <div className="w-6 h-6 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mr-2">
                      <span className="text-white font-bold">⚡</span>
                    </div>
                    Actuar Ahora
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-gray-900 font-bold py-4 px-8 rounded-xl transition-all transform hover:scale-105"
                  >
                    <div className="w-6 h-6 bg-amber-400/20 backdrop-blur-sm rounded-full flex items-center justify-center mr-2">
                      <span className="text-amber-400 font-bold">📚</span>
                    </div>
                    Leer Más Psicografías
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final Call to Action */}
        <div className="text-center bg-gradient-to-br from-slate-50 to-blue-50 rounded-3xl p-12 border-2 border-blue-200">
          <h3 className="text-3xl font-bold text-gray-800 mb-6 font-serif">
            El Pozo se Desborda
          </h3>
          <blockquote className="text-xl text-gray-600 mb-8 italic leading-relaxed">
            *"Camina hacia adelante, no como quien espera, sino como quien recuerda. 
            El pozo siempre estuvo lleno. Ahora es tiempo de desbordarse."*
          </blockquote>
          <p className="text-lg text-gray-700 mb-8">
            — El Hombre Gris
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              onClick={() => {
                const mapSection = document.getElementById('mapa-sueños');
                if (mapSection) {
                  mapSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              <Star className="w-5 h-5 mr-2" />
              Comenzar Ahora
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold py-4 px-8 rounded-xl transition-all transform hover:scale-105"
              onClick={() => window.location.href = '/recursos/blog'}
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Leer Reflexiones
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToActionHombreGris;
