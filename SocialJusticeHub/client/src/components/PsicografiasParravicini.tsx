import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, 
  Lightbulb, 
  Users, 
  Heart,
  Flame,
  BookOpen,
  Sparkles
} from 'lucide-react';

const PsicografiasParravicini = () => {
  const psicografias = [
    {
      icon: <Users className="w-8 h-8" />,
      titulo: "Nuevo Sol para Argentina",
      año: "1938",
      prediccion: "\"Nuevo sol. Nueva luz. El árbol seco de la Argentina sabrá de una era de nueva lluvia. Llegará hacia su suelo la bendición luego de luchas serias, de encuentros y desencuentros, de soberbios en gritos y de gritos vencidos. Llegarán tres jefes y dirán. No serán, mas después serán en fuerza y verdad. Ellos llamarán al hombre a ser y éste será. ¡Él será un Hombre Gris!\"",
      conexion: "Esta profecía fundamental describe el renacimiento de Argentina después de crisis profundas. El 'árbol seco' representa al país estéril que reverdecerá. Los 'tres jefes' que inicialmente fallan pero luego encuentran fuerza verdadera anuncian la llegada del Hombre Gris como catalizador de la transformación nacional.",
      color: "from-slate-500 to-gray-600",
      bgColor: "from-slate-50 to-gray-100",
      borderColor: "border-slate-300",
      tema: "Renacimiento",
      imagenUrl: "https://www.buenosairesshows.com.ar/imgs/noticias/20230831/parravicini-clase-media.jpg"
    },
    {
      icon: <Flame className="w-8 h-8" />,
      titulo: "La Revolución Argentina",
      año: "1941/1971",
      prediccion: "\"La Argentina tendrá su 'Revolución Francesa', en triunfo. Puede ver sangre en las calles si no ve el instante del Hombre Gris.\"",
      conexion: "Esta psicografía advierte sobre la posibilidad de violencia si Argentina no reconoce el momento oportuno del Hombre Gris. El movimiento ¡BASTA! representa ese reconocimiento colectivo que puede evitar el derramamiento de sangre y llevar a una revolución triunfante y pacífica.",
      color: "from-orange-500 to-red-600",
      bgColor: "from-orange-50 to-red-100",
      borderColor: "border-orange-300",
      tema: "El Instante",
      imagenUrl: "https://www.cronicasdeltiempo.com/imgs/parravicini-argentina-luz.jpg"
    },
    {
      icon: <Eye className="w-8 h-8" />,
      titulo: "El Despertar Colectivo",
      año: "1967",
      prediccion: "\"PAX. El hombre humilde en la Argentina se allega para gobernar. Él será de casta joven y desconocida en el ambiente, más será santo de maneras, creencia y sabiduría. ¡Él llegará luego de la tercera jornada!\"",
      conexion: "Esta profecía describe al Hombre Humilde (equivalente al Hombre Gris) como alguien de origen joven y desconocido en la política tradicional, pero con virtudes morales ejemplares. La 'tercera jornada' se interpreta como el ballotage electoral que marca el momento del verdadero cambio.",
      color: "from-purple-500 to-indigo-600",
      bgColor: "from-purple-50 to-indigo-100",
      borderColor: "border-purple-300",
      tema: "Liderazgo",
      imagenUrl: "https://www.profeciasdeparravicini.com/imgs/hombre-gris.jpg"
    },
    {
      icon: <Heart className="w-8 h-8" />,
      titulo: "El Hombre Humilde",
      año: "1967",
      prediccion: "\"El Hombre Humilde — el H.H. — se allega a las Argentinas unificadas y gobernará en caridad y amor.\"",
      conexion: "Complementando la visión anterior, esta psicografía enfatiza la unidad nacional ('Argentinas unificadas') y el gobierno basado en caridad y amor cristiano. El Hombre Humilde representa la síntesis de virtudes morales necesarias para la verdadera transformación del país.",
      color: "from-pink-500 to-rose-600",
      bgColor: "from-pink-50 to-rose-100",
      borderColor: "border-pink-300",
      tema: "Unidad",
      imagenUrl: "https://www.parravicinirevela.com/imgs/prepotencia.jpg"
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      titulo: "El Fantoche y la Oración",
      año: "1939",
      prediccion: "\"La Argentina despedazada, partida en dos ideas levantará un fantoche de nueva doctrina. La Iglesia hará silencio. La oración vencerá.\"",
      conexion: "Esta visión describe un período de división nacional donde surge un 'fantoche' (líder falso) con una nueva doctrina. A pesar del silencio de instituciones tradicionales como la Iglesia, la oración (conciencia ética colectiva) finalmente triunfa, anunciando la regeneración nacional.",
      color: "from-emerald-500 to-green-600",
      bgColor: "from-emerald-50 to-green-100",
      borderColor: "border-emerald-300",
      tema: "Esperanza",
      imagenUrl: "https://www.parravicini.com/imgs/fantoche.jpg"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-slate-900 via-gray-800 to-slate-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-6 text-lg px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-600 border-none">
            <BookOpen className="w-5 h-5 mr-2" />
            Profecías y Visión
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 font-serif">
            Las Psicografías de Benjamín Solari Parravicini
          </h2>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Conocido como el "Nostradamus argentino", Parravicini dibujó entre 1936 y 1972 cientos de 
            profecías sobre Argentina y el mundo. Sus visiones sobre el despertar del "hombre común" 
            y la transformación argentina resuenan profundamente con el espíritu del Hombre Gris.
          </p>
        </div>

        {/* Intro Card */}
        <div className="mb-16 max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-amber-900/40 to-orange-900/40 backdrop-blur-sm border-2 border-amber-500/30 text-white">
            <CardContent className="p-8">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl">
                  <Eye className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-4">¿Quién fue Benjamín Solari Parravicini?</h3>
                  <p className="text-gray-200 leading-relaxed mb-4">
                    Artista plástico argentino (1898-1974) que desarrolló la capacidad de realizar "psicografías": 
                    dibujos proféticos acompañados de textos que anticipaban eventos futuros. Sin buscarlo, sin 
                    pretenderlo, su mano plasmaba visiones de un futuro que muchos consideran se está cumpliendo.
                  </p>
                  <p className="text-gray-200 leading-relaxed">
                    Sus predicciones sobre Argentina son particularmente relevantes para nuestro movimiento: 
                    habló del despertar del ciudadano común, del fin de los falsos líderes, de una Argentina 
                    que sería "luz del Sur" después del caos.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Psicografías Grid */}
        <div className="grid md:grid-cols-1 gap-10 mb-16 max-w-5xl mx-auto">
          {psicografias.map((psico, index) => (
            <Card 
              key={index} 
              className={`bg-gradient-to-br ${psico.bgColor} border-2 ${psico.borderColor} hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group overflow-hidden`}
            >
              <div className="grid md:grid-cols-5 gap-6">
                {/* Imagen de la psicografía */}
                <div className="md:col-span-2 relative bg-white/20 backdrop-blur-sm overflow-hidden">
                  <div className="aspect-square relative">
                    {/* Placeholder para imagen - aquí iría la imagen real */}
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                      <div className="text-center p-6">
                        <div className={`w-20 h-20 bg-gradient-to-br ${psico.color} text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                          {psico.icon}
                        </div>
                        <p className="text-white/60 text-sm italic">
                          Psicografía Original
                        </p>
                        <p className="text-white/40 text-xs mt-2">
                          {psico.año}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contenido */}
                <div className="md:col-span-3 p-6">
                  <CardHeader className="p-0 mb-4">
                    <div className="flex items-start justify-between mb-3">
                      <Badge className={`bg-gradient-to-r ${psico.color} border-none text-white`}>
                        {psico.tema}
                      </Badge>
                      <Badge variant="outline" className="text-sm border-gray-400 text-gray-700 bg-white/50">
                        Año {psico.año}
                      </Badge>
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-800 mb-3">
                      {psico.titulo}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="bg-white/70 rounded-xl p-5 mb-4 border-l-4 border-gray-700 shadow-sm">
                      <p className="text-gray-800 italic font-serif text-lg leading-relaxed">
                        {psico.prediccion}
                      </p>
                    </div>
                    <CardDescription className="text-gray-700 leading-relaxed text-base">
                      <strong className="text-gray-900 block mb-2">💡 Conexión con el Movimiento:</strong>
                      {psico.conexion}
                    </CardDescription>
                  </CardContent>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Conclusión Mejorada */}
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-br from-indigo-900/80 to-purple-900/80 backdrop-blur-md rounded-3xl p-10 md:p-12 border border-indigo-500/30 shadow-2xl">
            <div className="text-center mb-10">
              <Sparkles className="w-16 h-16 text-yellow-300 mx-auto mb-6 animate-pulse" />
              <h3 className="text-3xl md:text-4xl font-bold mb-4 font-serif">
                Este es el Instante
              </h3>
              <p className="text-xl text-blue-200 max-w-3xl mx-auto leading-relaxed">
                Parravicini vio este momento hace casi un siglo. Ahora es nuestro tiempo de hacerlo realidad.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8">
              <p className="text-2xl font-serif italic text-center text-white leading-relaxed mb-6">
                "Argentina tendrá su revolución en triunfo<br />
                <span className="text-yellow-300">si ve el instante del hombre gris que será"</span>
              </p>
              <p className="text-center text-blue-200">
                — Benjamín Solari Parravicini, 1937
              </p>
            </div>

            <div className="text-center">
              <p className="text-lg text-gray-200 leading-relaxed max-w-3xl mx-auto mb-6">
                El Hombre Gris que Parravicini profetizó no es una persona: <strong className="text-white">somos todos nosotros</strong> 
                cuando decidimos despertar, actuar y co-crear el país que siempre supimos posible.
              </p>
              <p className="text-xl font-bold text-white">
                El instante es ahora. El Hombre Gris sos vos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PsicografiasParravicini;

