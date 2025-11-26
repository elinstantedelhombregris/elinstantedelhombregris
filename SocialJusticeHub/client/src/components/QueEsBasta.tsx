import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Heart,
  Lightbulb,
  Cog,
  Star
} from 'lucide-react';
import { useState } from 'react';
import PowerCTA, { PredefinedCTAs } from './PowerCTA';

const QueEsBasta = () => {
  const [selectedConcept, setSelectedConcept] = useState<number | null>(null);

  const handleConceptClick = (index: number) => {
    setSelectedConcept(selectedConcept === index ? null : index);
  };

  const concepts = [
    {
      titulo: "¿Qué es ¡BASTA!?",
      descripcion: "Más que una palabra, es una declaración de intención. Un movimiento ciudadano que reconoce que la transformación real viene de la base, no desde arriba.",
      explicacionDetallada: `¡BASTA! es más que una palabra. Es una declaración de intención, un compromiso con el cambio y una invitación a la acción.

      No es un partido político ni una organización tradicional. Es un movimiento ciudadano que reconoce algo simple pero profundo:
      
      La transformación real viene de la base, no desde arriba. Cada persona tiene el poder de crear cambio positivo. Juntos podemos construir la Argentina que soñamos.
      
      ¡BASTA! surge de la convicción de que ha llegado el momento de pasar de la queja a la acción, 
      de la crítica destructiva a la construcción colectiva. Pero no de cualquier construcción: una que respete la inteligencia de cada persona y confíe en su capacidad de encontrar su propio camino.`,
      icono: <Star className="w-7 h-7" />,
      color: "from-blue-500 to-blue-600",
      bgColor: "from-blue-50 to-blue-100"
    },
    {
      titulo: "La filosofía del movimiento",
      descripcion: "Creemos en el poder de la inteligencia colectiva y confiamos en que cada persona puede encontrar su propio camino de transformación.",
      explicacionDetallada: `Nuestra filosofía se basa en principios simples pero profundos:

      No somos espectadores. Somos protagonistas de nuestro propio futuro. Juntos somos más fuertes, no porque tengamos las mismas ideas, sino porque la diversidad de perspectivas enriquece las soluciones.
      
      Buscamos nuevas formas de abordar viejos problemas. Construimos pensando en las generaciones futuras. La honestidad y la claridad son fundamentales en todo lo que hacemos.
      
      Pero sobre todo, confiamos en vos. En tu inteligencia, en tu capacidad de discernir, en tu poder de encontrar tu propio camino. No queremos que sigas un manual, queremos que descubras tu potencial.`,
      icono: <Heart className="w-7 h-7" />,
      color: "from-purple-500 to-purple-600",
      bgColor: "from-purple-50 to-purple-100"
    },
    {
      titulo: "Cómo funciona",
      descripcion: "Simple: a través de la plataforma, los argentinos pueden compartir sueños, proponer soluciones y coordinar acciones concretas. Sin presiones, sin caminos obligatorios.",
      explicacionDetallada: `El funcionamiento de ¡BASTA! es simple pero poderoso:

      Los ciudadanos expresan qué Argentina quieren construir. Identificamos problemas y oportunidades en cada región. Colaboramos para crear propuestas concretas y viables. Pasamos de las ideas a los hechos con proyectos reales. Evaluamos los resultados y mejoramos continuamente.
      
      Este ciclo se repite constantemente, pero no como un proceso mecánico. Es un movimiento vivo, que respira, que se adapta. No hay un único camino correcto. Hay múltiples formas de participar, de contribuir, de transformar. Vos elegís la tuya.`,
      icono: <Cog className="w-7 h-7" />,
      color: "from-green-500 to-green-600",
      bgColor: "from-green-50 to-green-100"
    }
  ];

  return (
    <section className="section-spacing page-bg-light">
      <div className="container-content">
        <div className="max-content-width">
          
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-block mb-6">
              <span className="text-sm uppercase tracking-widest text-blue-600 font-semibold bg-blue-50 px-4 py-2 rounded-full">
                Conocé el Movimiento
              </span>
            </div>
            <h2 className="heading-section text-gray-900 mb-8">
              ¿Qué es <span className="text-blue-600">¡BASTA!</span>?
            </h2>
            <p className="text-body text-gray-600 max-w-4xl mx-auto">
              Probablemente sea más simple de lo que pensás. Y también más profundo.
              <br />
              <span className="text-gray-500">Un movimiento ciudadano que cree en el poder de la participación activa 
              para construir la Argentina que todos queremos.</span>
            </p>
          </div>

          {/* Concept Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {concepts.map((concept, index) => (
              <Card 
                key={index} 
                className={`cursor-pointer card-unified hover-lift ${concept.bgColor.includes('blue') ? 'border-blue-200' : concept.bgColor.includes('purple') ? 'border-purple-200' : 'border-green-200'}`}
                onClick={() => handleConceptClick(index)}
              >
                <CardContent className="p-8 text-center h-full flex flex-col">
                  <div className={`text-${concept.color.split('-')[1]}-600 mb-6 flex justify-center`}>
                    {concept.icono}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {concept.titulo}
                  </h3>
                  <p className="text-gray-600 mb-6 flex-grow">
                    {concept.descripcion}
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-auto"
                  >
                    Leer más
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Detailed Explanations */}
          {selectedConcept !== null && (
            <div className="mb-16">
              <Card className="border-2 border-blue-200 shadow-xl">
                <CardContent className="p-8">
                  <div className="flex items-start gap-6">
                    <div className="text-blue-600 flex-shrink-0">
                      {concepts[selectedConcept].icono}
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        {concepts[selectedConcept].titulo}
                      </h3>
                      <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {concepts[selectedConcept].explicacionDetallada}
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      onClick={() => setSelectedConcept(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}


          {/* Call to Action */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-4">
                Si algo de esto resuena con vos, explorá más
              </h3>
              <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                Si no, está bien. No todos los caminos son para todos. 
                Tu participación importa, pero solo si realmente querés.
              </p>
              <PowerCTA
                text="Explorar la visión"
                variant="primary"
                onClick={() => window.location.href = '/la-vision'}
                size="lg"
                animate={true}
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default QueEsBasta;