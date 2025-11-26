import { motion } from 'framer-motion';
import { Quote, ArrowUpRight, Building2, MapPin } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

const cases = [
  {
    id: 1,
    role: "Concejal Municipal",
    location: "San Martín, Buenos Aires",
    quote: "Antes gobernábamos con intuición. Ahora abro el mapa y veo exactamente qué pide el barrio. Es imposible ignorar un reclamo cuando tiene 500 puntos rojos en una manzana.",
    metric: "8 Ordenanzas aprobadas",
    metricLabel: "Basadas en datos del mapa",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2576&auto=format&fit=crop"
  },
  {
    id: 2,
    role: "Diputada Provincial",
    location: "Córdoba",
    quote: "Mi campaña no tuvo promesas, tuvo respuestas. Usé la capa de 'Necesidades' para armar mi plataforma legislativa. La gente no votó un slogan, votó sus propias palabras.",
    metric: "120% Aumento",
    metricLabel: "En participación ciudadana",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=2574&auto=format&fit=crop"
  },
  {
    id: 3,
    role: "Asamblea Vecinal",
    location: "Rosario, Santa Fe",
    quote: "Logramos frenar una obra innecesaria porque demostramos con el mapa que la prioridad del barrio era la seguridad y no el embellecimiento de veredas.",
    metric: "$45M Redirigidos",
    metricLabel: "A prioridades reales",
    image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2670&auto=format&fit=crop"
  }
];

const ImpactCaseStudy = () => {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {cases.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.2 }}
          viewport={{ once: true }}
          className="group relative h-full"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 to-purple-600/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative h-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden hover:border-slate-600 transition-all duration-300 flex flex-col">
            
            {/* Image Header */}
            <div className="h-48 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent z-10" />
              <img 
                src={item.image} 
                alt={item.role} 
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 opacity-60 group-hover:opacity-80" 
              />
              <div className="absolute bottom-4 left-4 z-20">
                <Badge variant="secondary" className="bg-blue-900/50 text-blue-200 border-blue-500/30 backdrop-blur-md mb-2">
                  {item.role}
                </Badge>
                <div className="flex items-center text-slate-400 text-xs">
                  <MapPin className="w-3 h-3 mr-1" /> {item.location}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col flex-grow">
              <Quote className="w-8 h-8 text-slate-600 mb-4 opacity-50" />
              <p className="text-slate-300 leading-relaxed mb-6 italic flex-grow">
                "{item.quote}"
              </p>
              
              <div className="pt-6 border-t border-slate-800 flex items-end justify-between">
                <div>
                  <div className="text-2xl font-bold text-white font-mono">{item.metric}</div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider">{item.metricLabel}</div>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            </div>

          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ImpactCaseStudy;

