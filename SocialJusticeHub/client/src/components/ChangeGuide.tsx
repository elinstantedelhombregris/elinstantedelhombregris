import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

const ChangeGuide = () => {
  const changeLevels = [
    {
      level: 1,
      title: 'Vos',
      description: 'El camino comienza con tu conciencia, tus valores y tus hábitos diarios.',
      actions: [
        'Cultivá hábitos de consumo responsable',
        'Practicá la honestidad y transparencia',
        'Aprendé constantemente y compartí conocimiento'
      ],
      bgColor: 'bg-[hsl(var(--primary))]'
    },
    {
      level: 2,
      title: 'Tu familia',
      description: 'Compartí tus valores y construí juntos un entorno de respeto y crecimiento.',
      actions: [
        'Fomentá el diálogo y la comunicación genuina',
        'Compartí las tareas domésticas equitativamente',
        'Transmití valores de solidaridad y trabajo en equipo'
      ],
      bgColor: 'bg-[hsl(var(--accent))]'
    },
    {
      level: 3,
      title: 'Tu barrio',
      description: 'Conectate con tu comunidad local y participá en acciones colectivas.',
      actions: [
        'Asistí a reuniones vecinales y aportá ideas',
        'Iniciá o participá en proyectos comunitarios',
        'Apoyá el comercio local y las iniciativas barriales'
      ],
      bgColor: 'bg-[hsl(var(--earth-sand))]'
    },
    {
      level: 4,
      title: 'Tu provincia',
      description: 'Conectá iniciativas locales y participá en políticas regionales.',
      actions: [
        'Informate sobre las políticas provinciales',
        'Votá de manera consciente e informada',
        'Conectá iniciativas de diferentes localidades'
      ],
      bgColor: 'bg-[hsl(var(--secondary))]'
    },
    {
      level: 5,
      title: 'La Nación',
      description: 'El impacto colectivo genera la transformación que Argentina necesita.',
      actions: [
        'Participá en debates nacionales con propuestas',
        'Apoyá políticas públicas que promuevan la inclusión',
        'Difundí logros y buenas prácticas que unen al país'
      ],
      bgColor: 'bg-[hsl(var(--primary))]'
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Guía para el cambio: De vos al país</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto font-['Lora']">
            Cada pequeña acción importa. Descubrí cómo tus decisiones diarias pueden generar un impacto que se extiende desde tu entorno inmediato hasta toda la nación.
          </p>
        </div>
        
        {/* Change process visualization */}
        <div className="relative max-w-4xl mx-auto">
          <div className="hidden md:block absolute left-1/2 top-12 bottom-12 w-1 bg-[hsl(var(--primary))] transform -translate-x-1/2 z-0"></div>
          
          {/* Change levels */}
          <div className="md:grid md:grid-cols-2 gap-8">
            {changeLevels.map((level, index) => {
              const isEven = index % 2 === 0;
              
              // For odd indices (0-indexed), we want right side on desktop
              const cardPositionClass = isEven 
                ? "md:transform md:translate-x-4" 
                : "md:transform md:-translate-x-4";
              
              // Space between cards
              const spacingClass = index < changeLevels.length - 1 
                ? "mb-8 md:mb-0" 
                : "";
              
              return (
                <div key={`level-group-${level.level}`} className="flex flex-col">
                  {!isEven && <div className="md:h-36"></div>}
                  
                  <div 
                    className={`bg-white rounded-xl shadow-md p-6 ${spacingClass} ${cardPositionClass} z-10 relative`}
                  >
                    <div className={`w-12 h-12 ${level.bgColor} text-white rounded-full flex items-center justify-center text-xl font-bold mb-4`}>
                      {level.level}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{level.title}</h3>
                    <p className="text-gray-600 mb-4">{level.description}</p>
                    <ul className="text-sm space-y-2">
                      {level.actions.map((action, actionIndex) => (
                        <li key={actionIndex} className="flex items-start">
                          <Check className="h-4 w-4 text-green-500 mt-1 mr-2" />
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {isEven && index < changeLevels.length - 1 && <div className="md:h-36"></div>}
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="mt-12 text-center">
          <Button className="inline-flex items-center bg-[hsl(var(--primary))] hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-md transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Descargá la guía completa
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ChangeGuide;
