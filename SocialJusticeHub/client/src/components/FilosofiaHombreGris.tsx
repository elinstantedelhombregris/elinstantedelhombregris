import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Brain,
  Heart,
  Users,
  Target,
  Lightbulb,
  Shield,
  ArrowRight,
  Quote,
  Star
} from 'lucide-react';
import { useState } from 'react';

const FilosofiaHombreGris = () => {
  const [selectedPilar, setSelectedPilar] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handlePilarClick = (index: number) => {
    setSelectedPilar(index);
    setIsModalOpen(true);
  };

  const pilaresDetallados = [
    {
      titulo: "Superinteligencia Sistémica",
      descripcion: "Ve el mundo como una vasta red de procesos interconectados donde cada acción genera consecuencias en cascada. Su mente entrenada detecta patrones donde otros ven caos, comprendiendo que los problemas de Argentina no son aislados sino síntomas de sistemas mal diseñados.",
      contenido: `La superinteligencia sistémica es la capacidad de ver las relaciones ocultas entre fenómenos aparentemente desconectados. El Hombre Gris comprende que la inflación argentina y la falta de autoestima nacional están íntimamente relacionadas, que la corrupción no es solo un problema moral sino un síntoma de procesos mal diseñados.

      Esta inteligencia no es académica sino práctica: ve oportunidades donde otros ven crisis. Cada problema argentino es, para él, una oportunidad disfrazada esperando a ser reconocida y aprovechada. Su mente funciona como un detector de posibilidades latentes.

      Esta forma de pensar trasciende disciplinas: integra economía, psicología social, ingeniería de sistemas y filosofía para crear soluciones que otros ni siquiera imaginan. Es la inteligencia que diseña sistemas que hacen irrelevantes los problemas actuales.`,
      icono: <Brain className="w-8 h-8" />,
      color: "from-blue-500 to-blue-600"
    },
    {
      titulo: "Amabilidad Radical",
      descripcion: "Comprende que la amabilidad no es debilidad sino fuerza transformadora. Del latín amabilis (digno de ser amado), practica la amabilidad como ingeniería social, entendiendo que cada gesto de cortesía construye confianza y cooperación espontánea.",
      contenido: `La amabilidad radical transforma la debilidad percibida en verdadera fortaleza. En un país marcado por la desconfianza y el conflicto, el Hombre Gris entiende que la amabilidad no es un rasgo de carácter sino una estrategia inteligente de transformación social.

      Cada acto de cortesía genera confianza, cada gesto amable multiplica la cooperación. Esta práctica consciente crea redes de colaboración que trascienden las divisiones tradicionales argentinas.

      La amabilidad radical no es ingenua: es estratégica. Reconoce que en un ecosistema de desconfianza, la vulnerabilidad auténtica genera reciprocidad genuina. Es la ingeniería social que construye puentes donde otros levantan muros.

      Esta filosofía transforma la política de la confrontación en la política de la colaboración, reconociendo que la verdadera revolución comienza con la forma en que nos relacionamos unos con otros.`,
      icono: <Heart className="w-8 h-8" />,
      color: "from-pink-500 to-pink-600"
    },
    {
      titulo: "Liderazgo Distribuido",
      descripcion: "Rechaza el liderazgo tradicional y sus peligros inherentes. Crea círculos de liderazgo distribuido donde cada persona asume responsabilidad rotativa según sus talentos y el momento, reconociendo que el verdadero poder surge de la multiplicación de líderes.",
      contenido: `El liderazgo distribuido surge del reconocimiento profundo de que los sistemas tradicionales de liderazgo son inherentemente peligrosos. El Hombre Gris comprende que concentrar poder en una sola persona o grupo genera corrupción inevitable y limita la creatividad colectiva.

      En su lugar, diseña sistemas donde el liderazgo fluye naturalmente según las necesidades del momento y los talentos disponibles. Cada persona se convierte en líder en su dominio de competencia, creando una red dinámica de responsabilidades compartidas.

      Esta forma de liderazgo no diluye la autoridad: la multiplica. Reconoce que la verdadera transformación surge cuando cada individuo asume responsabilidad por el cambio que desea ver, creando una cultura de empoderamiento colectivo.

      El liderazgo distribuido transforma seguidores en co-creadores, reconociendo que el cambio sistémico requiere la participación activa de todos los involucrados, no la obediencia pasiva a unos pocos.`,
      icono: <Users className="w-8 h-8" />,
      color: "from-green-500 to-green-600"
    },
    {
      titulo: "Diseño Idealizado",
      descripcion: "Aplica la metodología del diseño idealizado de Russell Ackoff: imaginar el país como si pudiera crearse desde cero, sin las limitaciones del presente. Su visión no es utópica sino científica, basada en procesos medibles y alcanzable por etapas.",
      contenido: `El diseño idealizado trasciende el pensamiento incremental para imaginar sistemas completamente nuevos. Inspirado en Russell Ackoff, el Hombre Gris aplica esta metodología para visualizar Argentina como si pudiera crearse desde cero, liberándose de las restricciones del presente.

      Esta visión no es utópica sino científica: se basa en procesos verificables, se mide por resultados tangibles y se alcanza mediante etapas claramente definidas. Reconoce que los problemas actuales son síntomas de diseños obsoletos, no limitaciones inevitables.

      El diseño idealizado pregunta: "¿Cómo sería Argentina si pudiéramos empezar de nuevo con el conocimiento actual?" Esta pregunta libera la creatividad y revela posibilidades que el pensamiento tradicional no puede imaginar.

      Esta metodología transforma la resignación en esperanza activa, reconociendo que el futuro no está determinado por el pasado sino diseñado por nuestra imaginación colectiva y nuestra voluntad de implementación.`,
      icono: <Target className="w-8 h-8" />,
      color: "from-purple-500 to-purple-600"
    },
    {
      titulo: "Disolvedor de Problemas",
      descripcion: "No cree en reparar lo irreparable. Su filosofía es simple: la mejor forma de resolver un problema es crear herramientas que lo vuelvan irrelevante. Su pregunta favorita no es '¿cómo arreglo esto?' sino '¿qué herramienta puedo crear para que este problema deje de existir?'",
      contenido: `El disolvedor de problemas representa una filosofía radicalmente diferente al enfoque tradicional de resolución de problemas. Mientras otros intentan reparar sistemas rotos, el Hombre Gris crea herramientas que hacen obsoletos los problemas actuales.

      Esta mentalidad trasciende el pensamiento reactivo para abrazar la creación proactiva. Reconoce que muchos problemas argentinos son síntomas de diseños obsoletos que no pueden ser parcheados indefinidamente.

      La pregunta guía no es "¿cómo solucionamos esto?" sino "¿qué podemos crear para que este problema deje de existir?" Esta orientación hacia la creación genera innovación genuina y transforma limitaciones en oportunidades.

      Esta filosofía reconoce que la verdadera solución no es ganar batallas contra problemas existentes, sino diseñar sistemas que hagan irrelevantes esos problemas, creando un futuro donde las dificultades actuales se vuelven inconcebibles.`,
      icono: <Lightbulb className="w-8 h-8" />,
      color: "from-orange-500 to-orange-600"
    },
    {
      titulo: "Transparencia Radical",
      descripcion: "Comparte procesos completos, no solo conclusiones. Muestra vulnerabilidades, no solo fortalezas. Su apertura genera confianza auténtica y colaboración genuina, reconociendo que la verdadera transparencia surge de la vulnerabilidad compartida.",
      contenido: `La transparencia radical trasciende la mera apertura de información para abrazar la vulnerabilidad auténtica. El Hombre Gris comprende que compartir solo éxitos genera desconfianza, mientras que revelar procesos completos construye confianza genuina.

      Esta práctica reconoce que la verdadera transparencia surge cuando mostramos nuestras dudas, no solo nuestras certezas; nuestros procesos de pensamiento, no solo nuestras conclusiones finales. Esta vulnerabilidad compartida genera colaboración auténtica y aprendizaje colectivo.

      La transparencia radical transforma la relación entre líderes y ciudadanos, reconociendo que la confianza no surge de la perfección sino de la honestidad auténtica. Crea espacios donde el error se convierte en oportunidad de aprendizaje colectivo.

      Esta filosofía reconoce que en un país marcado por la corrupción y la desconfianza, la verdadera transparencia no es un acto de exposición sino de invitación: invita a otros a participar en el proceso de transformación, reconociendo que nadie tiene todas las respuestas pero todos tenemos algo valioso que aportar.`,
      icono: <Shield className="w-8 h-8" />,
      color: "from-indigo-500 to-indigo-600"
    }
  ];

  const filosofias = pilaresDetallados.map((pilar, index) => ({
    icon: pilar.icono,
    title: pilar.titulo,
    description: pilar.descripcion,
    color: pilar.color,
    numero: (index + 1).toString().padStart(2, '0')
  }));

  const citas = [
    {
      texto: "No busques permiso para crear el país que imaginás. Nadie te lo va a dar porque nadie tiene la autoridad para otorgarlo. La construcción de Argentina es tu derecho y tu responsabilidad.",
      autor: "El Hombre Gris"
    },
    {
      texto: "La verdad que estás evitando es que estás listo. Sigues esperando la estructura perfecta, el momento perfecto, la versión perfecta de ti. Pero tú eres el sistema. Tú eres el puente.",
      autor: "El Hombre Gris"
    },
    {
      texto: "El problema de Argentina no es la falta de recursos sino el diseño de los sistemas. No necesitamos más de lo mismo: necesitamos sistemas que vuelvan irrelevantes los problemas actuales.",
      autor: "El Hombre Gris"
    },
    {
      texto: "La amabilidad no es debilidad: es ingeniería social. Cada acto de cortesía construye confianza, cada gesto de amabilidad multiplica cooperación. En un país desconfiado, ser amable es revolucionario.",
      autor: "El Hombre Gris"
    }
  ];


  return (
    <section className="py-20 bg-gradient-to-br from-white via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block bg-indigo-100 rounded-full px-6 py-2 mb-6">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-indigo-600" />
              <p className="text-sm font-semibold text-indigo-600">Nuestra Filosofía</p>
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 font-serif">
            Los Pilares del Hombre Gris
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            El Hombre Gris no es una persona, es una idea que cobra vida. Es la encarnación de todo argentino 
            que ha despertado del letargo colectivo y ha decidido que <strong className="text-indigo-600">¡BASTA!</strong>
          </p>
          
          {/* Introducción ampliada */}
          <div className="max-w-5xl mx-auto bg-white rounded-2xl p-8 shadow-lg border-2 border-blue-100 mb-12">
            <div className="prose prose-lg mx-auto text-left">
              <p className="text-gray-700 leading-relaxed mb-4">
                Esta filosofía nace de la intersección entre el <strong>pensamiento sistémico</strong>, 
                la <strong>transformación personal</strong> y el <strong>compromiso cívico</strong>. 
                No es una ideología política ni un movimiento partidario: es una forma de ver y actuar en el mundo 
                que trasciende las divisiones tradicionales.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                El Hombre Gris comprende que los problemas de Argentina no son aislados sino <strong>síntomas de sistemas mal diseñados</strong>. 
                Ve que la corrupción no es inevitable, que la pobreza no es destino, que la desconfianza no es naturaleza argentina. 
                Son bugs en el software social que pueden y deben ser debugeados.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Esta filosofía se construye sobre <strong>seis pilares fundamentales</strong> que guían tanto el pensamiento 
                como la acción de quienes abrazan esta visión:
              </p>
            </div>
          </div>
        </div>

        {/* Philosophy Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {filosofias.map((filosofia, index) => (
            <Dialog key={index} open={isModalOpen && selectedPilar === index} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Card
                  className="bg-white hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border-2 border-gray-100 group overflow-hidden relative cursor-pointer"
                  onClick={() => handlePilarClick(index)}
                >
              <CardContent className="p-0">
                {/* Top colorful section */}
                <div className={`bg-gradient-to-br ${filosofia.color} p-6 relative overflow-hidden`}>
                  {/* Decorative elements */}
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>
                  
                  <div className="relative z-10">
                    {/* Number badge */}
                    <div className="absolute top-0 right-0 bg-white/20 backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">{filosofia.numero}</span>
                    </div>
                    
                    {/* Icon */}
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 shadow-xl group-hover:scale-110 transition-transform duration-300">
                      <div className="text-white">
                        {filosofia.icon}
                      </div>
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-xl font-bold text-white leading-tight pr-16">
                      {filosofia.title}
                    </h3>
                  </div>
                </div>
                
                {/* Bottom description */}
                <div className="p-6 bg-gradient-to-b from-white to-gray-50">
                  <p className="text-gray-700 leading-relaxed text-sm">
                    {filosofia.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </DialogTrigger>

          <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto p-0">
            <DialogHeader className="sr-only">
              <DialogTitle>{filosofia.title}</DialogTitle>
              <DialogDescription>Detalles del pilar {filosofia.numero} de la filosofía del Hombre Gris</DialogDescription>
            </DialogHeader>
            {/* Header con gradiente */}
            <div className={`bg-gradient-to-br ${filosofia.color} text-white p-8 relative overflow-hidden`}>
              {/* Elementos decorativos */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-6 mb-6">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-xl">
                    <div className="text-white text-2xl">
                      {filosofia.icon}
                    </div>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">
                      {filosofia.title}
                    </h2>
                    <div className="flex items-center gap-3">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-1">
                        <span className="text-white font-semibold text-sm">Pilar #{filosofia.numero}</span>
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-1">
                        <span className="text-white font-semibold text-sm">Hombre Gris</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Descripción corta destacada */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <p className="text-white/90 text-lg leading-relaxed">
                    {filosofia.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Contenido principal con mejor diseño */}
            <div className="p-8 bg-gradient-to-b from-white to-gray-50">
              <div className="max-w-4xl mx-auto">
                {/* Secciones del contenido */}
                <div className="space-y-8">
                  {pilaresDetallados[index]?.contenido.split('\n\n').map((section, sectionIndex) => {
                    if (section.trim() === '') return null;
                    
                    return (
                      <div key={sectionIndex} className="group">
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                          <div className="flex items-start gap-4">
                            {/* Número de sección */}
                            <div className={`w-8 h-8 bg-gradient-to-br ${filosofia.color} text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1`}>
                              {sectionIndex + 1}
                            </div>
                            
                            {/* Contenido */}
                            <div className="flex-1">
                              <p className="text-gray-700 leading-relaxed text-base">
                                {section.trim()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer con call to action */}
                <div className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border-2 border-indigo-200">
                  <div className="text-center">
                    <h4 className="text-xl font-bold text-gray-800 mb-3">
                      ¿Te resuena este pilar?
                    </h4>
                    <p className="text-gray-600 mb-4">
                      Cada pilar del Hombre Gris es una invitación a transformar tu forma de ver y actuar en el mundo.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button 
                        size="sm"
                        className={`bg-gradient-to-r ${filosofia.color} hover:opacity-90 text-white font-semibold px-6 py-2 rounded-xl transition-all transform hover:scale-105`}
                      >
                        <Star className="w-4 h-4 mr-2" />
                        Aplicar este Pilar
                      </Button>
                      <Button 
                        size="sm"
                        variant="outline"
                        className="border-2 border-indigo-300 text-indigo-600 hover:bg-indigo-50 font-semibold px-6 py-2 rounded-xl transition-all"
                      >
                        <ArrowRight className="w-4 h-4 mr-2" />
                        Explorar Otros Pilares
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
          ))}
        </div>

        {/* Quotes Section */}
        <div className="mb-20">
          <h3 className="text-3xl font-bold text-gray-800 mb-12 text-center font-serif">
            Palabras del Hombre Gris
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            {citas.map((cita, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
                <div className="flex items-start mb-4">
                  <Quote className="w-8 h-8 text-blue-500 mr-3 flex-shrink-0 mt-1" />
                  <blockquote className="text-lg text-gray-700 leading-relaxed italic">
                    "{cita.texto}"
                  </blockquote>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <cite className="text-gray-600 font-medium">— {cita.autor}</cite>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to explore */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl p-8 text-center shadow-xl mb-20">
          <p className="text-xl md:text-2xl font-semibold mb-4">
            🧠 Estos seis pilares fundamentales guían toda la transformación
          </p>
          <p className="text-lg opacity-90 max-w-4xl mx-auto leading-relaxed">
            Desde la superinteligencia sistémica hasta la transparencia radical, cada pilar 
            es un fundamento esencial de la filosofía del Hombre Gris. <strong>Tu comprensión de estos pilares es el primer paso hacia la transformación.</strong>
          </p>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-3xl p-12 text-center shadow-2xl">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-4xl font-bold mb-6 font-serif">
              ¿Sos el Hombre Gris?
            </h3>
            <p className="text-xl mb-8 opacity-90 leading-relaxed">
              El Hombre Gris no es una persona, es una idea. Una idea que puede habitar en cualquiera que esté dispuesto 
              a ver más allá de lo evidente, a pensar más allá de lo convencional, y a actuar más allá de lo cómodo.
            </p>
            <p className="text-lg mb-10 opacity-80">
              <strong>El Hombre Gris sos vos, cuando decidís que ya es suficiente y te comprometés a ser parte de la solución.</strong>
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button 
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                <Star className="w-5 h-5 mr-2" />
                Compartir mi Sueño
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold rounded-xl transition-all transform hover:scale-105"
              >
                <ArrowRight className="w-5 h-5 mr-2" />
                Leer el Manifiesto Completo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FilosofiaHombreGris;
