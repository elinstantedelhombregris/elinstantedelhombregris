import { useState } from 'react';
import SmoothReveal from '@/components/ui/SmoothReveal';
import PowerCTA from '@/components/PowerCTA';
import ShareButtons from '@/components/ShareButtons';
import { Target, Zap, Sparkles, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';

interface StoryScrollProps {
  ayudaCompartirPost?: any | null;
  onNavigateToPost?: (id: number) => void;
}

const CATEGORIES = [
  { type: 'Proyectos', icon: Target, color: 'text-blue-400', accent: '#3b82f6', example: 'Huertas comunitarias, cooperativas de servicio, redes de cuidado' },
  { type: 'Acciones', icon: Zap, color: 'text-orange-400', accent: '#f97316', example: 'Auditorías ciudadanas, relevamientos territoriales, cuadrillas de reparación' },
  { type: 'Intercambios', icon: Sparkles, color: 'text-purple-400', accent: '#a855f7', example: 'Tiempo por tiempo, saber por saber, recursos por recursos' },
];

export default function StoryScroll({ ayudaCompartirPost, onNavigateToPost }: StoryScrollProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="py-12">
      <div className="container-content">
        {/* Featured CTA — Ayuda a compartir BASTA */}
        {ayudaCompartirPost && (
          <SmoothReveal>
            <div className="relative rounded-2xl overflow-hidden border border-amber-500/20 bg-gradient-to-br from-amber-950/20 via-[#0a0a0a] to-orange-950/20 mb-12">
              <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500" />
              <div className="p-6 md:p-10">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/15 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-amber-500/70">Primera Acción</span>
                    <h3 className="text-xl md:text-2xl font-serif font-bold text-white mt-1">
                      {ayudaCompartirPost.title}
                    </h3>
                  </div>
                </div>

                {/* First paragraphs always visible */}
                <div className="space-y-3 text-slate-400 leading-relaxed text-[15px]">
                  {(ayudaCompartirPost.description ?? '').split('\n\n').slice(0, expanded ? undefined : 3).map((paragraph: string, i: number) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>

                <div className="mt-6 flex flex-col sm:flex-row items-start gap-4">
                  <PowerCTA
                    text="VER COMPLETO Y SUMARME"
                    variant="primary"
                    onClick={() => onNavigateToPost?.(ayudaCompartirPost.id)}
                    size="lg"
                    animate={true}
                    icon={<ArrowRight className="w-5 h-5" />}
                  />
                  <button
                    onClick={() => setExpanded(!expanded)}
                    className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    {expanded ? 'Ver menos' : 'Leer más'}
                  </button>
                </div>

                <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-3">
                  <span className="text-xs text-slate-500">Compartí con tu tribu:</span>
                  <ShareButtons
                    title="Ayuda a compartir ¡BASTA! — Hacenos visibles"
                    url={`${window.location.origin}/community`}
                  />
                </div>
              </div>
            </div>
          </SmoothReveal>
        )}

        {/* What you can create — compact category strip */}
        <SmoothReveal delay={0.1}>
          <div className="mb-8">
            <h3 className="font-mono text-xs tracking-[0.3em] uppercase text-slate-500 mb-5">Qué podés crear acá</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {CATEGORIES.map((cat, i) => (
                <div
                  key={cat.type}
                  className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${cat.accent}15` }}>
                    <cat.icon className={`w-4 h-4 ${cat.color}`} />
                  </div>
                  <div>
                    <h4 className={`text-sm font-bold ${cat.color}`}>{cat.type}</h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{cat.example}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SmoothReveal>
      </div>
    </section>
  );
}
