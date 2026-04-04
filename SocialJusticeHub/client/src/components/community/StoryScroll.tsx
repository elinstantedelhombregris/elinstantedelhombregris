import SmoothReveal from '@/components/ui/SmoothReveal';
import GlassCard from '@/components/ui/GlassCard';
import PowerCTA from '@/components/PowerCTA';
import { Target, Zap, Sparkles, MapPin, ArrowRight } from 'lucide-react';

interface StoryScrollProps {
  ayudaCompartirPost?: any | null;
  onNavigateToPost?: (id: number) => void;
}

const EXAMPLES = [
  {
    type: 'PROYECTO',
    gradient: 'from-blue-500 to-cyan-500',
    badgeBg: 'bg-blue-500/10',
    badgeColor: 'text-blue-400',
    icon: Target,
    title: 'Red de Huertas Regenerativas del Conurbano',
    description: 'Imaginá que 40 familias de Florencio Varela se organizan para transformar baldíos en huertas comunitarias. Comparten semillas, herramientas, saberes. Producen alimento y dignidad. Eso es un proyecto.',
    breath: 'Cada proyecto empieza con una persona que se cansa de esperar.',
  },
  {
    type: 'ACCION',
    gradient: 'from-orange-500 to-red-500',
    badgeBg: 'bg-orange-500/10',
    badgeColor: 'text-orange-400',
    icon: Zap,
    title: 'Verificación Ciudadana del Presupuesto Municipal',
    description: 'Imaginá que un grupo de vecinos audita en qué se gasta cada peso del presupuesto municipal. Publican los datos. Comparan lo prometido con lo ejecutado. Eso es una acción.',
    breath: 'La acción es la prueba de que la esperanza dejó de ser pasiva.',
  },
  {
    type: 'INTERCAMBIO',
    gradient: 'from-purple-500 to-pink-500',
    badgeBg: 'bg-purple-500/10',
    badgeColor: 'text-purple-400',
    icon: Sparkles,
    title: 'Ofrezco: Diseño gráfico / Necesito: Clases de inglés',
    description: 'Imaginá una red donde el tiempo y el saber circulan sin plata de por medio. Donde alguien ofrece lo que tiene y recibe lo que necesita. Sin intermediarios. Eso es un intercambio.',
    breath: 'El intercambio demuestra que ya somos la economía que necesitamos.',
  },
];

export default function StoryScroll({ ayudaCompartirPost, onNavigateToPost }: StoryScrollProps) {
  return (
    <section className="py-16">
      <div className="container-content max-w-3xl mx-auto">
        {/* Intro */}
        <SmoothReveal>
          <div className="text-center mb-16">
            <div className="font-mono text-xs tracking-[0.3em] uppercase text-slate-500 mb-4">Lo que podemos construir juntos</div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">La Tribu en Acción</h2>
            <p className="text-slate-400 text-lg">Proyectos, acciones e intercambios que transforman la realidad desde abajo.</p>
          </div>
        </SmoothReveal>

        {/* Example Cards */}
        {EXAMPLES.map((example, i) => (
          <div key={example.type}>
            <SmoothReveal delay={i * 0.15}>
              <GlassCard className="mb-6 overflow-hidden relative">
                {/* Type gradient bar */}
                <div className={`h-1.5 w-full bg-gradient-to-r ${example.gradient}`} />

                <div className="p-6 md:p-8">
                  {/* EJEMPLO badge */}
                  <div className="absolute top-4 right-4">
                    <span className="text-[10px] font-mono tracking-widest uppercase text-slate-600 bg-white/5 px-2 py-1 rounded-full border border-white/10">Ejemplo</span>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <div className={`w-8 h-8 rounded-lg ${example.badgeBg} flex items-center justify-center`}>
                      <example.icon className={`w-4 h-4 ${example.badgeColor}`} />
                    </div>
                    <span className={`font-mono text-xs tracking-[0.2em] uppercase font-bold ${example.badgeColor}`}>{example.type}</span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3 font-serif">{example.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{example.description}</p>

                  <div className="mt-4 flex items-center gap-2 text-xs text-slate-600">
                    <div className="w-6 h-6 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-slate-500 text-[10px] font-bold">?</div>
                    <span>Podrías ser vos</span>
                    <span className="mx-1">·</span>
                    <MapPin className="w-3 h-3" />
                    <span>Tu barrio, Argentina</span>
                  </div>
                </div>
              </GlassCard>
            </SmoothReveal>

            {/* Narrative breath */}
            <SmoothReveal delay={i * 0.15 + 0.08}>
              <p className="text-center italic font-serif text-slate-500 py-8 text-lg">
                "{example.breath}"
              </p>
            </SmoothReveal>
          </div>
        ))}

        {/* Transition to CTA */}
        <SmoothReveal delay={0.5}>
          <p className="text-center font-serif text-slate-400 py-8 text-xl leading-relaxed">
            Pero antes de que todo esto exista,<br />
            <span className="text-white font-bold">hay algo que necesitamos de vos:</span>
          </p>
        </SmoothReveal>

        {/* Featured "Ayuda a compartir" card */}
        <SmoothReveal delay={0.6}>
          <div className="relative rounded-2xl overflow-hidden border border-amber-500/30 bg-gradient-to-br from-amber-900/10 to-orange-900/10 backdrop-blur-md">
            {/* Header gradient */}
            <div className="h-2 w-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500" />

            <div className="p-8 md:p-12">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-amber-400" />
                </div>
                <span className="font-mono text-xs tracking-[0.2em] uppercase font-bold text-amber-400">Acción Urgente</span>
              </div>

              <h3 className="text-2xl md:text-3xl font-serif font-bold text-white mb-6">
                Ayuda a compartir ¡BASTA!
              </h3>

              {ayudaCompartirPost ? (
                <>
                  <div className="prose prose-invert max-w-none">
                    {ayudaCompartirPost.description.split('\n\n').slice(0, 4).map((paragraph: string, i: number) => (
                      <p key={i} className="text-slate-300 leading-relaxed mb-4">{paragraph}</p>
                    ))}
                  </div>

                  <div className="mt-8 flex flex-col sm:flex-row gap-4">
                    <PowerCTA
                      text="SUMARME"
                      variant="primary"
                      onClick={() => onNavigateToPost?.(ayudaCompartirPost.id)}
                      size="lg"
                      animate={true}
                      icon={<ArrowRight className="w-5 h-5" />}
                    />
                  </div>
                </>
              ) : (
                <p className="text-slate-400 leading-relaxed">
                  No venimos a administrar ruinas. Venimos a estrenar país. Otro país es posible, no por decreto sino por diseño.
                </p>
              )}
            </div>
          </div>
        </SmoothReveal>
      </div>
    </section>
  );
}
