import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Lock, ChevronDown, ChevronUp, Download, Users, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';

interface ChangeLevel {
  level: number;
  title: string;
  description: string;
  actions: {
    text: string;
    completed?: boolean;
    locked?: boolean;
  }[];
  bgColor: string;
  iconColor: string;
  story?: {
    name: string;
    text: string;
  };
}

const ChangeGuideInteractive = () => {
  const [expandedLevel, setExpandedLevel] = useState<number | null>(1);
  const [userProgress, setUserProgress] = useState({
    currentLevel: 1,
    completedActions: 0,
    totalActions: 15
  });

  // Fetch real data from database
  const { data: dreams = [] } = useQuery({
    queryKey: ['/api/dreams'],
    staleTime: 60000,
  });

  // Calculate real number of participants (unique contributions)
  const totalParticipants = Array.isArray(dreams) ? dreams.length : 0;

  const changeLevels: ChangeLevel[] = [
    {
      level: 1,
      title: 'VOS',
      description: 'El camino comienza con tu conciencia, tus valores y tus hábitos diarios. Todo cambio verdadero nace desde adentro.',
      actions: [
        { text: 'Reflexioná sobre tus valores personales y escribilos', completed: false },
        { text: 'Cultivá un hábito de consumo responsable (empezá por uno)', completed: false },
        { text: 'Practicá la honestidad y transparencia en tus interacciones diarias', completed: false },
        { text: 'Dedicá 15 minutos al día a aprender algo nuevo', completed: false }
      ],
      bgColor: 'from-blue-500 to-blue-600',
      iconColor: 'bg-blue-500',
      story: {
        name: 'María, 34 años',
        text: 'Empecé siendo más consciente de mis compras. Hoy elijo productos locales y sostenibles. Es un pequeño cambio que me conectó con mi comunidad.'
      }
    },
    {
      level: 2,
      title: 'TU FAMILIA',
      description: 'Compartí tus valores y construí juntos un entorno de respeto, diálogo y crecimiento mutuo.',
      actions: [
        { text: 'Organizá una cena familiar semanal sin dispositivos electrónicos', completed: false, locked: true },
        { text: 'Fomentá el diálogo abierto: escuchá sin juzgar', completed: false, locked: true },
        { text: 'Compartí las tareas domésticas equitativamente', completed: false, locked: true },
        { text: 'Creá un pacto familiar de valores compartidos', completed: false, locked: true }
      ],
      bgColor: 'from-pink-500 to-pink-600',
      iconColor: 'bg-pink-500',
      story: {
        name: 'Carlos, 45 años',
        text: 'Instauramos "la hora del diálogo" cada domingo. Mis hijos empezaron a compartir sus preocupaciones y sueños. Nos unió como nunca.'
      }
    },
    {
      level: 3,
      title: 'TU BARRIO',
      description: 'Conectate con tu comunidad local y participá en acciones colectivas que mejoren el entorno de todos.',
      actions: [
        { text: 'Conocé a tus vecinos: presentate y conversá', completed: false, locked: true },
        { text: 'Asistí a una reunión vecinal o creá una', completed: false, locked: true },
        { text: 'Iniciá o sumate a un proyecto de mejora barrial (plaza, biblioteca, huerta)', completed: false, locked: true },
        { text: 'Apoyá el comercio local: comprá en tu barrio', completed: false, locked: true }
      ],
      bgColor: 'from-green-500 to-green-600',
      iconColor: 'bg-green-500',
      story: {
        name: 'Ana, 28 años',
        text: 'Propuse crear una huerta comunitaria en un baldío abandonado. Hoy 30 familias cultivan juntas y compartimos las cosechas.'
      }
    },
    {
      level: 4,
      title: 'TU PROVINCIA',
      description: 'Conectá iniciativas locales, participá en políticas regionales y amplificá el impacto de tu comunidad.',
      actions: [
        { text: 'Informate sobre las políticas y proyectos provinciales', completed: false, locked: true },
        { text: 'Votá de manera consciente e informada en todas las elecciones', completed: false, locked: true },
        { text: 'Conectá iniciativas de diferentes localidades de tu provincia', completed: false, locked: true }
      ],
      bgColor: 'from-purple-500 to-purple-600',
      iconColor: 'bg-purple-500',
      story: {
        name: 'Roberto, 52 años',
        text: 'Conecté 5 cooperativas de diferentes pueblos. Juntos conseguimos mejores precios y más visibilidad. La unión nos fortaleció.'
      }
    },
    {
      level: 5,
      title: 'LA NACIÓN',
      description: 'El impacto colectivo genera la transformación sistémica que Argentina necesita. Tu voz suma al coro nacional.',
      actions: [
        { text: 'Participá en debates nacionales con propuestas constructivas', completed: false, locked: true },
        { text: 'Apoyá políticas públicas que promuevan la inclusión y transparencia', completed: false, locked: true },
        { text: 'Difundí logros y buenas prácticas que inspiren a otros argentinos', completed: false, locked: true },
        { text: 'Mentorea a otros en su camino de transformación', completed: false, locked: true }
      ],
      bgColor: 'from-indigo-500 to-indigo-600',
      iconColor: 'bg-indigo-500',
      story: {
        name: 'Lucía, 38 años',
        text: 'Lo que empezó como un grupo de WhatsApp del barrio hoy es una red nacional de 500 comunidades intercambiando soluciones.'
      }
    }
  ];

  const toggleLevel = (level: number) => {
    setExpandedLevel(expandedLevel === level ? null : level);
  };

  const calculateProgress = (level: number) => {
    const totalActions = changeLevels.slice(0, level).reduce((sum, l) => sum + l.actions.length, 0);
    return Math.min(100, Math.round((userProgress.completedActions / totalActions) * 100));
  };

  const isLevelUnlocked = (level: number) => {
    return level <= userProgress.currentLevel;
  };

  return (
    <section className="py-20 bg-gradient-to-br from-white via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 rounded-full mb-4">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-semibold text-indigo-600">Tu Camino de Transformación</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 font-serif">
            Guía del Cambio: De Vos al País
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-8">
            Cada pequeña acción importa. Descubrí cómo tus decisiones diarias pueden generar un impacto 
            que se extiende desde tu entorno inmediato hasta toda la nación.
          </p>
          
          {/* User Progress Card */}
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 border-2 border-indigo-200">
            <div className="flex items-center justify-between mb-4">
              <div className="text-left">
                <p className="text-sm text-gray-500 mb-1">Tu nivel actual</p>
                <p className="text-3xl font-bold text-indigo-600">Nivel {userProgress.currentLevel}</p>
                <p className="text-sm text-gray-600 mt-1">{changeLevels[userProgress.currentLevel - 1].title}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 mb-1">Progreso Global</p>
                <p className="text-3xl font-bold text-gray-800">{Math.round((userProgress.completedActions / userProgress.totalActions) * 100)}%</p>
                <p className="text-sm text-gray-600 mt-1">{userProgress.completedActions} de {userProgress.totalActions} acciones</p>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                style={{ width: `${(userProgress.completedActions / userProgress.totalActions) * 100}%` }}
              >
                {userProgress.completedActions > 0 && (
                  <span className="text-xs text-white font-bold">🌱</span>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>
                {totalParticipants > 0 
                  ? `${totalParticipants.toLocaleString('es-AR')} ${totalParticipants === 1 ? 'argentino está' : 'argentinos están'} en este camino con vos`
                  : 'Sé el primero en comenzar este camino'}
              </span>
            </div>
          </div>
        </div>
        
        {/* The Tree Visualization */}
        <div className="max-w-5xl mx-auto mb-12">
          <div className="relative">
            {/* Vertical line connecting levels */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 via-purple-500 to-indigo-600 transform -translate-x-1/2 z-0"></div>
            
            {/* Levels */}
            <div className="space-y-8">
              {changeLevels.map((level, index) => {
                const isExpanded = expandedLevel === level.level;
                const isUnlocked = isLevelUnlocked(level.level);
                const progress = calculateProgress(level.level);
                
                return (
                  <div key={level.level} className="relative">
                    {/* Level Card */}
                    <div 
                      className={cn(
                        "bg-white rounded-2xl shadow-xl border-3 overflow-hidden transition-all duration-300",
                        isUnlocked ? "border-gray-200 hover:shadow-2xl" : "border-gray-300 opacity-60",
                        isExpanded && "ring-4 ring-indigo-300"
                      )}
                    >
                      {/* Level Header */}
                      <div 
                        className={cn(
                          "p-6 cursor-pointer transition-all",
                          isUnlocked ? "hover:bg-gray-50" : "cursor-not-allowed"
                        )}
                        onClick={() => isUnlocked && toggleLevel(level.level)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-6">
                            {/* Level Number */}
                            <div className={cn(
                              "w-16 h-16 rounded-2xl text-white flex items-center justify-center text-2xl font-bold shadow-lg transition-transform",
                              `bg-gradient-to-br ${level.bgColor}`,
                              isExpanded && "scale-110"
                            )}>
                              {isUnlocked ? level.level : <Lock className="w-6 h-6" />}
                            </div>
                            
                            {/* Level Info */}
                            <div className="flex-1">
                              <h3 className="text-2xl font-bold text-gray-800 mb-1">{level.title}</h3>
                              <p className="text-gray-600 leading-relaxed">{level.description}</p>
                              
                              {isUnlocked && (
                                <div className="mt-3 flex items-center gap-4">
                                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                                    <div 
                                      className={cn("h-2 rounded-full transition-all duration-500", `bg-gradient-to-r ${level.bgColor}`)}
                                      style={{ width: `${progress}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-sm font-semibold text-gray-600">{progress}%</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Expand Icon */}
                          {isUnlocked && (
                            <div className="ml-4">
                              {isExpanded ? (
                                <ChevronUp className="w-6 h-6 text-gray-400" />
                              ) : (
                                <ChevronDown className="w-6 h-6 text-gray-400" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Expanded Content */}
                      {isExpanded && isUnlocked && (
                        <div className="border-t border-gray-200 bg-gray-50">
                          <div className="p-6 space-y-6">
                            {/* Actions */}
                            <div>
                              <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <span className={cn("w-2 h-2 rounded-full", level.iconColor)}></span>
                                Acciones para este nivel
                              </h4>
                              <ul className="space-y-3">
                                {level.actions.map((action, actionIndex) => (
                                  <li key={actionIndex} className="flex items-start gap-3 p-3 bg-white rounded-xl hover:shadow-md transition-shadow">
                                    <div className={cn(
                                      "mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0",
                                      action.locked ? "bg-gray-300" : 
                                      action.completed ? "bg-green-500" : "border-2 border-gray-300"
                                    )}>
                                      {action.locked ? (
                                        <Lock className="w-3 h-3 text-gray-500" />
                                      ) : action.completed ? (
                                        <Check className="w-3 h-3 text-white" />
                                      ) : null}
                                    </div>
                                    <span className={cn(
                                      "text-sm leading-relaxed",
                                      action.completed ? "text-gray-500 line-through" : "text-gray-700"
                                    )}>
                                      {action.text}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            {/* Story */}
                            {level.story && (
                              <div className={cn("p-4 rounded-xl border-l-4", `bg-gradient-to-r from-gray-50 to-white border-l-${level.iconColor}`)}>
                                <p className="text-xs text-gray-500 mb-2 font-semibold">HISTORIA REAL</p>
                                <p className="text-sm font-semibold text-gray-800 mb-2">{level.story.name}</p>
                                <p className="text-sm text-gray-600 italic leading-relaxed">"{level.story.text}"</p>
                              </div>
                            )}
                            
                            {/* CTA Button */}
                            <div className="pt-4 border-t border-gray-200">
                              <Button 
                                className={cn(
                                  "w-full font-semibold py-6 rounded-xl shadow-lg transition-all transform hover:scale-[1.02]",
                                  `bg-gradient-to-r ${level.bgColor} hover:opacity-90`
                                )}
                              >
                                {level.level === 1 ? "Comenzar mi transformación" :
                                 level.level === 2 ? "Involucrar a mi familia" :
                                 level.level === 3 ? "Conectar con mi barrio" :
                                 level.level === 4 ? "Amplificar el impacto provincial" :
                                 "Participar a nivel nacional"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Download CTA */}
        <div className="mt-16 text-center bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-3xl p-12 shadow-2xl">
          <h3 className="text-3xl font-bold mb-4 font-serif">¿Listo para empezar tu transformación?</h3>
          <p className="text-xl mb-8 opacity-90 leading-relaxed max-w-2xl mx-auto">
            Descargá la guía completa en PDF con ejercicios prácticos, reflexiones y herramientas para cada nivel.
          </p>
          <Button className="bg-white text-indigo-600 hover:bg-gray-100 font-bold py-6 px-12 rounded-xl transition transform hover:scale-105 shadow-xl text-lg">
            <Download className="h-5 w-5 mr-2" />
            Descargar Guía Completa
          </Button>
          <p className="text-sm text-indigo-200 mt-4">100% gratuito • PDF de 45 páginas</p>
        </div>
      </div>
    </section>
  );
};

export default ChangeGuideInteractive;

