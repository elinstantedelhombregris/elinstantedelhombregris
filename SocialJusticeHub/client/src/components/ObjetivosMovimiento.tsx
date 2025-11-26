import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Globe,
  Users, 
  Heart,
  Target,
  Lightbulb,
  Cog,
  UserCheck,
  FileText,
  ArrowUp,
  BookOpen,
  AlertTriangle,
  Zap,
  Flame,
  Shield,
  Star,
  CheckCircle,
  TrendingUp,
  Eye,
  Brain,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useState } from 'react';
import PowerCTA, { PredefinedCTAs } from './PowerCTA';
import { cn } from '@/lib/utils';

const ObjetivosMovimiento = () => {
  const [expandedObjetivo, setExpandedObjetivo] = useState<number | null>(null);

  const toggleObjetivo = (index: number) => {
    setExpandedObjetivo(expandedObjetivo === index ? null : index);
  };

  const objetivos = [
    {
      titulo: "Construir el país que ofrezca la mejor experiencia humana",
      descripcion: "Diseñar una Argentina donde cada persona pueda vivir una vida plena, significativa y auténtica.",
      explicacionDetallada: `Nuestra visión:
      
      Un país donde la experiencia humana sea lo primero. Donde cada argentino pueda:
      
      • Despertar su potencial único y vivir su propósito
      • Experimentar dignidad, respeto y conexión auténtica
      • Sentirse parte de algo más grande que sí mismo
      • Vivir con belleza, significado y alegría profunda
      
      Cómo lo creamos:
      
      Diseñando sistemas que pongan a las personas en el centro. Creando espacios donde la creatividad y el propósito se encuentren. Construyendo comunidades donde cada uno aporta su valor único. Transformando la experiencia cotidiana en algo extraordinario.
      
      El resultado:
      Un país que no solo funciona, sino que inspira. Un lugar donde la vida humana florece en toda su expresión.`,
      icono: <Star className="w-7 h-7" />,
      color: "from-purple-500 to-purple-600",
      bgColor: "from-purple-50 to-purple-100",
      numero: "01",
      prioridad: "Fundamental"
    },
    {
      titulo: "Liberar el potencial humano que duerme en cada persona",
      descripcion: "Crear condiciones donde cada argentino pueda descubrir y desarrollar su genio único.",
      explicacionDetallada: `Nuestra visión:
      
      Un país que cree en el potencial infinito de cada persona. Donde:
      
      • Cada niño pueda descubrir su talento único desde temprano
      • Cada adulto tenga oportunidades reales de reinventarse
      • Cada anciano pueda compartir su sabiduría acumulada
      • Nadie quede atrás ni se sienta invisible
      
      Cómo lo creamos:
      
      Educación que despierta la curiosidad y el pensamiento propio. Sistemas que eliminan barreras artificiales. Espacios donde las ideas pueden florecer sin restricciones. Una cultura que celebra el talento en todas sus formas.
      
      El resultado:
      Una Argentina donde cada persona puede ser la mejor versión de sí misma.`,
      icono: <Lightbulb className="w-7 h-7" />,
      color: "from-yellow-500 to-orange-600",
      bgColor: "from-yellow-50 to-orange-50",
      numero: "02",
      prioridad: "Fundamental"
    },
    {
      titulo: "Diseñar sistemas que sirvan a la vida, no a la burocracia",
      descripcion: "Revolucionar las instituciones para que funcionen como herramientas de transformación humana.",
      explicacionDetallada: `Nuestra visión:
      
      Sistemas que realmente funcionan. Donde:
      
      • La salud sea un derecho vivido, no una promesa
      • La justicia llegue a tiempo y con sentido
      • La educación prepare para la vida real
      • La economía sirva al bienestar, no al revés
      
      Cómo lo creamos:
      
      Rediseñando desde cero, no parcheando sistemas rotos. Enfocándonos en resultados humanos, no en métricas vacías. Construyendo con las personas, no para ellas. Eliminando todo lo que no suma valor real.
      
      El resultado:
      Instituciones que la gente confía y usa con orgullo. Sistemas que realmente mejoran vidas.`,
      icono: <Cog className="w-7 h-7" />,
      color: "from-blue-500 to-blue-600",
      bgColor: "from-blue-50 to-blue-100",
      numero: "03",
      prioridad: "Fundamental"
    },
    {
      titulo: "Crear una cultura de interdependencia consciente",
      descripcion: "Construir una sociedad donde cada persona se sienta parte esencial de un todo mayor.",
      explicacionDetallada: `Nuestra visión:
      
      Una Argentina donde:
      
      • Entendemos que nuestro bienestar está conectado al de todos
      • Celebramos el éxito de otros como si fuera nuestro
      • Cuidamos de los demás como nos cuidamos a nosotros mismos
      • Construimos juntos, no competimos unos contra otros
      
      Cómo lo creamos:
      
      Diseñando espacios de encuentro y colaboración real. Promoviendo una cultura del cuidado mutuo. Conectando personas con propósitos compartidos. Reviviendo el arte de vivir en comunidad.
      
      El resultado:
      Una sociedad donde nadie se siente solo. Una Argentina unida por elección, no por obligación.`,
      icono: <Users className="w-7 h-7" />,
      color: "from-green-500 to-emerald-600",
      bgColor: "from-green-50 to-emerald-50",
      numero: "04",
      prioridad: "Fundamental"
    },
    {
      titulo: "Restaurar la dignidad como base de todo",
      descripcion: "Construir un país donde la dignidad humana no sea negociable ni excepcional.",
      explicacionDetallada: `Nuestra visión:
      
      Una Argentina donde la dignidad es:
      
      • El cimiento sobre el que se construye todo
      • Visible en cada interacción, grande o pequeña
      • Protegida por sistemas que la defienden activamente
      • Sentida por cada persona, sin excepción
      
      Cómo lo creamos:
      
      Diseñando sistemas que no permiten la indignidad. Creando trabajos que honran la persona, no solo el rol. Construyendo espacios que respetan a quienes los habitan. Reviviendo la amabilidad como ley invisible.
      
      El resultado:
      Un país donde cada persona se siente vista, respetada y valorada. Donde la dignidad es la norma, no la excepción.`,
      icono: <Heart className="w-7 h-7" />,
      color: "from-red-500 to-pink-600",
      bgColor: "from-red-50 to-pink-50",
      numero: "05",
      prioridad: "Fundamental"
    },
    {
      titulo: "Diseñar el país que nuestros hijos necesitan",
      descripcion: "Construir pensando en las generaciones futuras, no solo en las próximas elecciones.",
      explicacionDetallada: `Nuestra visión:
      
      Un país donde:
      
      • Cada decisión considera el impacto en 50 años
      • Los niños heredan un mundo mejor, no deudas
      • Las próximas generaciones tienen más oportunidades, no menos
      • El futuro se construye con visión, no con parches
      
      Cómo lo creamos:
      
      Protegiendo el planeta para quienes vienen. Construyendo una educación que prepara para el futuro real. Diseñando sistemas económicos sostenibles a largo plazo. Tomando decisiones con visión generacional.
      
      El resultado:
      Un país que mejora con el tiempo. Una Argentina que nuestros hijos y nietos agradecerán que hayamos construido.`,
      icono: <Target className="w-7 h-7" />,
      color: "from-teal-500 to-cyan-600",
      bgColor: "from-teal-50 to-cyan-50",
      numero: "06",
      prioridad: "Fundamental"
    },
    {
      titulo: "Crear espacios donde la creatividad y el propósito se encuentran",
      descripcion: "Diseñar lugares donde las personas puedan crear, innovar y construir lo que realmente importa.",
      explicacionDetallada: `Nuestra visión:
      
      Un país lleno de espacios donde:
      
      • La creatividad puede florecer sin restricciones absurdas
      • El propósito personal se encuentra con el colectivo
      • Las ideas locas se convierten en realidades transformadoras
      • El arte, la ciencia y la innovación se encuentran naturalmente
      
      Cómo lo creamos:
      
      Construyendo espacios físicos y digitales que inspiran. Eliminando barreras que matan la creatividad. Conectando a personas con ideas complementarias. Celebrando la innovación en todas sus formas.
      
      El resultado:
      Una Argentina que genera ideas que cambian el mundo. Un país donde la creatividad es el motor de la transformación.`,
      icono: <Zap className="w-7 h-7" />,
      color: "from-indigo-500 to-purple-600",
      bgColor: "from-indigo-50 to-purple-50",
      numero: "07",
      prioridad: "Importante"
    },
    {
      titulo: "Transformar la experiencia cotidiana en algo extraordinario",
      descripcion: "Elevar lo ordinario: hacer que cada día sea una experiencia significativa y hermosa.",
      explicacionDetallada: `Nuestra visión:
      
      Un país donde:
      
      • Ir al médico no sea una experiencia traumática
      • Ir a trabajar sea ir a crear valor real
      • Caminar por la calle sea disfrutar de la belleza
      • Vivir el día a día sea una experiencia rica y significativa
      
      Cómo lo creamos:
      
      Diseñando la belleza en espacios públicos y privados. Elevando la calidad de cada interacción humana. Integrando naturaleza y arte en la vida cotidiana. Cuidando los detalles que hacen la diferencia.
      
      El resultado:
      Una Argentina donde lo cotidiano es hermoso. Donde vivir bien no es lujo, es la norma.`,
      icono: <Flame className="w-7 h-7" />,
      color: "from-orange-500 to-red-600",
      bgColor: "from-orange-50 to-red-50",
      numero: "08",
      prioridad: "Importante"
    }
  ];

  return (
    <section className="section-spacing bg-gradient-to-br from-slate-50 via-white to-purple-50">
      <div className="container-content">
        <div className="max-content-width">
          
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-block mb-6">
              <span className="text-sm uppercase tracking-widest text-purple-600 font-semibold bg-purple-50 px-4 py-2 rounded-full">
                Nuestra Visión
              </span>
            </div>
            <h2 className="heading-section text-gray-900 mb-8">
              Los <span className="text-purple-600">8 Pilares</span> de la Transformación
            </h2>
            <p className="text-body text-gray-600 max-w-4xl mx-auto">
              No son promesas políticas. Son visiones revolucionarias para construir 
              el país que realmente queremos: uno que ofrezca la mejor experiencia humana posible.
            </p>
          </div>

          {/* Objectives Expandable Boxes */}
          <div className="space-y-4 mb-16">
            {objetivos.map((objetivo, index) => {
              const isExpanded = expandedObjetivo === index;
              const borderColor = objetivo.bgColor.includes('blue') ? 'border-blue-300' : 
                objetivo.bgColor.includes('green') ? 'border-green-300' :
                objetivo.bgColor.includes('red') ? 'border-red-300' :
                objetivo.bgColor.includes('emerald') ? 'border-emerald-300' :
                objetivo.bgColor.includes('purple') ? 'border-purple-300' :
                objetivo.bgColor.includes('orange') ? 'border-orange-300' :
                objetivo.bgColor.includes('cyan') ? 'border-cyan-300' :
                'border-teal-300';
              
              return (
                <Card 
                  key={index} 
                  className={cn(
                    "overflow-hidden card-unified transition-smooth",
                    borderColor,
                    isExpanded && "shadow-xl ring-2 ring-purple-200"
                  )}
                >
                  {/* Header - Clickable */}
                  <div 
                    className={cn(
                      "p-6 cursor-pointer transition-all hover:bg-gray-50",
                      `bg-gradient-to-r ${objetivo.bgColor}`
                    )}
                    onClick={() => toggleObjetivo(index)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6 flex-1">
                        {/* Number Badge */}
                        <div className={cn(
                          "w-16 h-16 rounded-xl text-white flex items-center justify-center text-2xl font-bold shadow-lg transition-transform",
                          `bg-gradient-to-br ${objetivo.color}`,
                          isExpanded && "scale-110"
                        )}>
                          {objetivo.numero}
                        </div>
                        
                        {/* Icon and Title */}
                        <div className="flex items-center gap-4 flex-1">
                          <div className={`text-${objetivo.color.split('-')[1]}-600`}>
                            {objetivo.icono}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 leading-tight">
                              {objetivo.titulo}
                            </h3>
                            <p className="text-gray-700 text-sm md:text-base">
                              {objetivo.descripcion}
                            </p>
                          </div>
                        </div>
                        
                        {/* Priority Badge */}
                        <div className="flex flex-col items-end gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            objetivo.prioridad === 'Fundamental' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {objetivo.prioridad}
                          </span>
                        </div>
                      </div>
                      
                      {/* Expand/Collapse Icon */}
                      <div className="ml-4">
                        {isExpanded ? (
                          <ChevronUp className="w-6 h-6 text-gray-600" />
                        ) : (
                          <ChevronDown className="w-6 h-6 text-gray-600" />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 bg-white">
                      <div className="p-6 space-y-6">
                        <div className="flex items-start gap-4">
                          <div className={`text-${objetivo.color.split('-')[1]}-600 mt-1`}>
                            {objetivo.icono}
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-700 leading-relaxed whitespace-pre-line text-base">
                              {objetivo.explicacionDetallada}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-end pt-4 border-t border-gray-200">
                          <PowerCTA
                            text="Explorar este pilar"
                            variant="primary"
                            onClick={() => window.location.href = '/la-vision'}
                            size="sm"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-4 font-serif">
                ¿Estás listo para construir esta visión?
              </h3>
              <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
                Esta no es una promesa electoral. Es una invitación a construir juntos 
                el país que ofrezca la mejor experiencia humana. Tu participación es esencial.
              </p>
              <PowerCTA
                text="SUMARME A ESTA VISIÓN"
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

export default ObjetivosMovimiento;