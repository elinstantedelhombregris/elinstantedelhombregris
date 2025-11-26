import { Link } from 'wouter';
import { ArrowRight, Sparkles } from 'lucide-react';
import PowerCTA from './PowerCTA';

interface NextStepCardProps {
  title: string;
  description: string;
  href: string;
  gradient?: string;
  icon?: React.ReactNode;
}

const NextStepCard = ({ 
  title, 
  description, 
  href, 
  gradient = "from-blue-600 to-purple-700",
  icon 
}: NextStepCardProps) => {
  return (
    <section className="section-spacing bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container-content">
        <div className="max-content-width">
          <div className={`bg-gradient-to-r ${gradient} text-white rounded-2xl p-8 md:p-12 card-unified-gradient hover-lift`}>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-4">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm font-semibold">Siguiente Paso</span>
                </div>
                <h2 className="heading-section text-white mb-4">
                  {title}
                </h2>
                <p className="text-body text-blue-100 mb-6 max-w-2xl">
                  {description}
                </p>
                <Link href={href}>
                  <PowerCTA
                    text="Continuar el Viaje"
                    variant="secondary"
                    size="lg"
                    animate={true}
                    icon={icon || <ArrowRight className="w-5 h-5" />}
                  />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NextStepCard;
