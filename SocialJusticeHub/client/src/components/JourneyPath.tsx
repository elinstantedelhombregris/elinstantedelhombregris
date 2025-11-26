import { useLocation } from 'wouter';
import { CheckCircle, Circle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface JourneyStep {
  id: string;
  label: string;
  href: string;
  color: string;
}

const journeySteps: JourneyStep[] = [
  { id: 'landing', label: 'Inicio', href: '/', color: 'journey-landing' },
  { id: 'vision', label: 'La Visión', href: '/la-vision', color: 'journey-vision' },
  { id: 'hombre-gris', label: 'El Hombre Gris', href: '/el-instante-del-hombre-gris', color: 'journey-hombre-gris' },
  { id: 'semilla', label: 'La Semilla', href: '/la-semilla-de-basta', color: 'journey-semilla' },
  { id: 'mapa', label: 'El Mapa', href: '/el-mapa', color: 'journey-mapa' },
  { id: 'tribu', label: 'La Tribu', href: '/community', color: 'journey-tribu' },
];

const JourneyPath = () => {
  const [location] = useLocation();
  const currentIndex = journeySteps.findIndex(step => step.href === location);

  return (
    <div className="bg-white/90 backdrop-blur-sm border-b border-border/60 sticky top-0 z-40 shadow-sm">
      <div className="container-content py-4">
        <div className="max-content-width">
          <div className="flex items-center justify-between overflow-x-auto gap-2 md:gap-4">
            {journeySteps.map((step, index) => {
              const isActive = location === step.href;
              const isPast = currentIndex > index;
              const isNext = currentIndex < index;

              return (
                <div key={step.id} className="flex items-center flex-shrink-0">
                  <a
                    href={step.href}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg transition-smooth text-sm font-medium",
                      isActive && `${step.color} shadow-md`,
                      isPast && "text-foreground hover:text-foreground",
                      isNext && "text-foreground/40 hover:text-foreground/70",
                      !isActive && "hover:bg-muted"
                    )}
                  >
                    {isPast ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Circle className={cn("w-4 h-4", isActive && "fill-current")} />
                    )}
                    <span className="hidden sm:inline">{step.label}</span>
                  </a>
                  {index < journeySteps.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-foreground/30 mx-1 flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JourneyPath;
