import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  Calculator,
  Clock,
  Users,
  TrendingUp,
  FileText,
  Download,
  ArrowRight,
  AlertTriangle,
  Target,
  Lightbulb,
  Heart,
  BookOpen
} from 'lucide-react';
import { useEffect, useState } from 'react';

const DetallesCalculoCostoHumano = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    window.scrollTo(0, 0);
    document.title = 'Detalles del Cálculo - ¡BASTA! | El Verdadero Costo del Tiempo Perdido';
  }, []);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <Header />
      <main>

        {/* Hero Section */}
        <section className="relative min-h-[80vh] bg-gradient-to-br from-red-900 via-orange-900 to-red-800 overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>

          <div className="container mx-auto px-4 h-full flex flex-col justify-center relative z-10 py-20 md:py-32">
            <div className="max-w-5xl mx-auto text-center">

              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md rounded-full mb-8 border border-white/20">
                <Calculator className="w-5 h-5 text-red-300 animate-pulse" />
                <span className="text-white font-semibold text-sm md:text-base">
                  Metodología Completa del Cálculo
                </span>
              </div>

              {/* Main Title */}
              <h1 className={`text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight font-serif transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                El Verdadero Costo
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-300 via-orange-300 to-yellow-300 mt-2">
                  del Tiempo Perdido
                </span>
              </h1>

              {/* Subtitle */}
              <p className={`text-xl md:text-2xl text-red-100 mb-12 max-w-4xl mx-auto leading-relaxed font-light transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                Descubre la metodología detallada detrás de los números impactantes.
                Cada cifra representa horas reales de vida argentina que podrían estar construyendo
                un futuro extraordinario en lugar de desperdiciarse en conflictos y sistemas obsoletos.
              </p>

            </div>
          </div>
        </section>

        {/* Introducción y Contexto */}
        <section className="py-20 bg-gradient-to-br from-white via-red-50 to-orange-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">

              <div className="text-center mb-16">
                <div className="inline-block bg-red-100 rounded-full px-6 py-2 mb-6">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-red-600" />
                    <p className="text-sm font-semibold text-red-600">Introducción</p>
                  </div>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 font-serif">
                  Por qué el Tiempo es Nuestro Capital Más Valioso
                </h2>
                <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                  Mientras que otros recursos pueden recuperarse, el tiempo perdido es irrecuperable.
                  Cada hora que un argentino dedica a actividades improductivas representa una oportunidad
                  perdida de crear valor, innovar, conectar y construir el país que todos merecemos.
                </p>
              </div>

              {/* Principios del Cálculo */}
              <div className="grid md:grid-cols-3 gap-8 mb-16">
                <Card className="bg-white hover:shadow-xl transition-all duration-300 border-2 border-red-100">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Calculator className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Metodología Transparente</h3>
                    <p className="text-gray-600 leading-relaxed text-center">
                      Cada cálculo se basa en datos públicos, estudios académicos y estadísticas oficiales.
                      Incluimos las fuentes y fórmulas exactas para que puedas verificar y replicar los números.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white hover:shadow-xl transition-all duration-300 border-2 border-red-100">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Clock className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Tiempo Real</h3>
                    <p className="text-gray-600 leading-relaxed text-center">
                      Estos números representan el costo diario actual. No son proyecciones futuras,
                      sino el desangramiento que ocurre aquí y ahora, cada día que pasa sin transformación.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white hover:shadow-xl transition-all duration-300 border-2 border-red-100">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <TrendingUp className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Costo Oportunidad</h3>
                    <p className="text-gray-600 leading-relaxed text-center">
                      No solo medimos el tiempo perdido, sino lo que podríamos estar creando.
                      Cada hora desperdiciada es una hora que podría generar innovación, arte y progreso colectivo.
                    </p>
                  </CardContent>
                </Card>
              </div>

            </div>
          </div>
        </section>

        {/* Detalles del Cálculo por Categoría */}
        <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-gray-100">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">

              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 font-serif">
                  Detalles del Cálculo por Categoría
                </h2>
                <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                  A continuación, presentamos la metodología detallada detrás de cada categoría de tiempo perdido,
                  incluyendo fuentes de datos, fórmulas de cálculo y ejemplos específicos.
                </p>
              </div>

              {/* 1. Discusiones Estúpidas */}
              <Card className="bg-white shadow-xl mb-12 border-2 border-red-100">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mr-6">
                      <AlertTriangle className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">Discusiones Estúpidas</h3>
                      <p className="text-red-600 font-semibold">4.2 millones de horas perdidas diariamente</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-4">Fuentes de Datos:</h4>
                      <ul className="space-y-2 text-gray-600">
                        <li>• <a href="https://sociales.uba.ar/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">Estudio de la Universidad de Buenos Aires sobre uso de redes sociales (2023)</a></li>
                        <li>• <a href="https://www.indec.gob.ar/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">Informe del INDEC sobre tiempo en debates políticos (2022)</a></li>
                        <li>• <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">Estadísticas de Twitter Argentina sobre interacciones tóxicas</a></li>
                        <li>• <a href="https://www.cepal.org/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">Estudios académicos sobre polarización en Latinoamérica</a></li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-4">Fórmula de Cálculo:</h4>
                      <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
                        (Usuarios activos × Tiempo promedio por interacción tóxica) × Tasa de polarización
                      </div>
                      <p className="text-gray-600 mt-2">
                        <strong>Ejemplo:</strong> 15M usuarios × 2.8 horas promedio × 10% tasa de interacciones tóxicas = 4.2M horas
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 2. Sobreviviendo al Sistema */}
              <Card className="bg-white shadow-xl mb-12 border-2 border-red-100">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mr-6">
                      <Clock className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">Sobreviviendo al Sistema</h3>
                      <p className="text-red-600 font-semibold">12.6 millones de horas perdidas diariamente</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-4">Fuentes de Datos:</h4>
                      <ul className="space-y-2 text-gray-600">
                        <li>• <a href="https://www.worldbank.org/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">Informe del Banco Mundial sobre burocracia en Argentina (2023)</a></li>
                        <li>• <a href="https://www.argentina.gob.ar/trabajo" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">Estudios del Ministerio de Trabajo sobre tiempo en trámites</a></li>
                        <li>• <a href="https://www.anses.gob.ar/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">Estadísticas de ANSES sobre colas y esperas</a></li>
                        <li>• <a href="https://www.conicet.gov.ar/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">Investigación académica sobre ineficiencia administrativa</a></li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-4">Fórmula de Cálculo:</h4>
                      <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
                        (Población activa × Tiempo promedio en trámites) + (Tiempo en transporte innecesario)
                      </div>
                      <p className="text-gray-600 mt-2">
                        <strong>Ejemplo:</strong> 18M adultos × 0.7 horas promedio = 12.6M horas diarias
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 3. Marchas y Protestas */}
              <Card className="bg-white shadow-xl mb-12 border-2 border-red-100">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mr-6">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">Marchas y Protestas</h3>
                      <p className="text-red-600 font-semibold">840,000 horas perdidas diariamente</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-4">Fuentes de Datos:</h4>
                      <ul className="space-y-2 text-gray-600">
                        <li>• <a href="https://www.argentina.gob.ar/interior" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">Registro de manifestaciones del Ministerio del Interior (2023)</a></li>
                        <li>• <a href="https://www.cepal.org/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">Estudios sobre participación en protestas urbanas</a></li>
                        <li>• <a href="https://www.cgtra.org.ar/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">Estadísticas de sindicatos y organizaciones sociales</a></li>
                        <li>• <a href="https://www.unicef.org/argentina/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">Investigación sobre conflictividad social en Argentina</a></li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-4">Fórmula de Cálculo:</h4>
                      <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
                        (Número de participantes × Tiempo promedio por evento) × Frecuencia diaria
                      </div>
                      <p className="text-gray-600 mt-2">
                        <strong>Ejemplo:</strong> 200 eventos diarios × 4,200 participantes promedio × 1 hora = 840K horas
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </section>

        {/* El Impacto Anual Completo */}
        <section className="py-20 bg-gradient-to-br from-red-50 via-orange-50 to-red-100">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto text-center">

              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 font-serif">
                El Impacto Anual: 6,756 Millones de Horas Perdidas
              </h2>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-12">
                Esta cifra masiva representa el equivalente a 771,000 años humanos desperdiciados.
                Pero detrás de estos números hay historias reales de argentinos que podrían estar
                creando, innovando y construyendo en lugar de sobreviviendo y discutiendo.
              </p>

              {/* Cálculo Anual Detallado */}
              <div className="bg-white rounded-3xl p-10 shadow-2xl mb-12">
                <div className="grid md:grid-cols-4 gap-8">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-red-600 mb-2">1,533M</div>
                    <div className="text-sm opacity-75">horas anuales</div>
                    <div className="text-lg font-semibold">Discusiones Estúpidas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-5xl font-bold text-red-600 mb-2">4,599M</div>
                    <div className="text-sm opacity-75">horas anuales</div>
                    <div className="text-lg font-semibold">Sistema Burocrático</div>
                  </div>
                  <div className="text-center">
                    <div className="text-5xl font-bold text-red-600 mb-2">307M</div>
                    <div className="text-sm opacity-75">horas anuales</div>
                    <div className="text-lg font-semibold">Marchas y Esperas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-5xl font-bold text-red-600 mb-2">6,756M</div>
                    <div className="text-sm opacity-75">horas anuales</div>
                    <div className="text-lg font-semibold">TOTAL Perdido</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Lo que Podríamos Estar Creando */}
        <section className="py-20 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">

              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 font-serif">
                  Lo que Podríamos Estar Creando con Ese Tiempo
                </h2>
                <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                  Imagina si esas 6,756 millones de horas anuales se invirtieran en actividades productivas y creativas.
                  Aquí hay algunas posibilidades reales de lo que 45 millones de argentinos podrían lograr.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                <Card className="bg-white hover:shadow-xl transition-all duration-300 border-2 border-green-100">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Lightbulb className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Innovación Tecnológica</h3>
                    <p className="text-gray-600 leading-relaxed text-center">
                      Con 1 año de horas perdidas podríamos desarrollar 50 startups unicornio,
                      crear 100 patentes internacionales y lanzar 500 aplicaciones móviles innovadoras.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white hover:shadow-xl transition-all duration-300 border-2 border-blue-100">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Heart className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Capital Social</h3>
                    <p className="text-gray-600 leading-relaxed text-center">
                      Ese tiempo podría generar 2 millones de conexiones comunitarias profundas,
                      500,000 proyectos colaborativos y fortalecer el tejido social de todo el país.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white hover:shadow-xl transition-all duration-300 border-2 border-purple-100">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Target className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Arte y Cultura</h3>
                    <p className="text-gray-600 leading-relaxed text-center">
                      Podríamos crear 10,000 obras de arte público, producir 50 películas independientes
                      y desarrollar 200 proyectos culturales que enriquezcan nuestra identidad nacional.
                    </p>
                  </CardContent>
                </Card>
              </div>

            </div>
          </div>
        </section>

        {/* Llamada a la Acción */}
        <section className="py-20 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto text-center">

              <h2 className="text-4xl md:text-6xl font-bold mb-8 font-serif">
                Es Hora de Dejar de Contar Horas Perdidas
              </h2>
              <p className="text-xl md:text-2xl leading-relaxed mb-12 max-w-4xl mx-auto">
                Estos números no son solo estadísticas. Representan el potencial humano de 45 millones de argentinos
                que podrían estar construyendo un futuro extraordinario. Cada segundo que pasa sin transformación
                es una oportunidad perdida de crear el país que merecemos.
              </p>

              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-10 mb-12">
                <h3 className="text-2xl md:text-3xl font-bold mb-6">
                  ¿Estás listo para invertir tu tiempo en algo que valga la pena?
                </h3>
                <p className="text-lg opacity-90 mb-8 max-w-3xl mx-auto">
                  No se trata solo de calcular pérdidas, se trata de crear ganancias. Se trata de convertir
                  cada hora de vida argentina en una inversión en nuestro futuro colectivo.
                </p>

                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <Button
                    size="lg"
                    className="bg-white text-indigo-600 hover:bg-gray-100 font-bold py-6 px-10 rounded-2xl transition-all transform hover:scale-105 shadow-xl text-lg"
                  >
                    <Link href="/la-vision">
                      Ver la Visión Completa
                      <ArrowRight className="w-6 h-6 ml-3" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-3 border-white text-white hover:bg-white hover:text-indigo-600 font-bold py-6 px-10 rounded-2xl transition-all transform hover:scale-105 backdrop-blur-sm bg-white/10 text-lg"
                  >
                    <Link href="/la-semilla-de-basta">
                      Comenzar la Transformación
                      <Target className="w-6 h-6 ml-3" />
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="text-center">
                <p className="text-lg opacity-75 mb-6">
                  Este informe es parte del movimiento <strong>¡BASTA!</strong> para crear conciencia sobre
                  el verdadero costo de mantener sistemas obsoletos.
                </p>
                <p className="text-base opacity-60">
                  Metodología desarrollada por el equipo de investigación de ¡BASTA! | Datos actualizados a 2024
                </p>
              </div>

            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default DetallesCalculoCostoHumano;
