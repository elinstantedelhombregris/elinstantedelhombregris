import { useState } from 'react';
import SmoothReveal from '@/components/ui/SmoothReveal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';

interface SignalFeedProps {
  signals: any[];
}

const TYPE_META: Record<string, { label: string; className: string }> = {
  dream:  { label: 'Sueño',     className: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  value:  { label: 'Valor',     className: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
  need:   { label: 'Necesidad', className: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  basta:  { label: '¡BASTA!',   className: 'bg-red-500/15 text-red-400 border-red-500/30' },
};

/** Unwrap: API returns { dream: DreamObj, score, ... } */
function unwrap(signal: any): any {
  return signal.dream && typeof signal.dream === 'object' ? signal.dream : signal;
}

function getContent(signal: any): string {
  const d = unwrap(signal);
  return d.dream ?? d.value ?? d.need ?? d.basta ?? '';
}

function getType(signal: any): string {
  const d = unwrap(signal);
  if (d.type) return d.type;
  if (d.dream) return 'dream';
  if (d.value) return 'value';
  if (d.need) return 'need';
  if (d.basta) return 'basta';
  return 'dream';
}

const PAGE_SIZE = 10;

export default function SignalFeed({ signals }: SignalFeedProps) {
  const [showAll, setShowAll] = useState(false);

  const displayed = showAll ? signals : signals.slice(0, PAGE_SIZE);

  if (signals.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
        <p className="text-slate-400 text-sm text-center py-4">
          Aún no hay señales vinculadas a esta misión.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {displayed.map((signal: any, idx: number) => {
        const d = unwrap(signal);
        const type = getType(signal);
        const meta = TYPE_META[type] ?? TYPE_META.dream;
        const content = getContent(signal);

        return (
          <SmoothReveal key={d.id ?? idx} delay={idx * 0.04}>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-3 flex gap-3">
              {/* Left accent */}
              <div className="flex-shrink-0 pt-0.5">
                <Badge className={`text-xs border ${meta.className} bg-transparent`}>
                  {meta.label}
                </Badge>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-slate-200 text-sm leading-relaxed line-clamp-3">
                  {content}
                </p>

                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  {(d.location || d.city) && (
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <MapPin className="w-3 h-3" />
                      {d.location ?? d.city}
                    </span>
                  )}
                  {(signal.score != null || signal.matchCount != null) && (
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <TrendingUp className="w-3 h-3" />
                      {signal.matchCount ?? signal.score} coincidencia{(signal.matchCount ?? signal.score) !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </SmoothReveal>
        );
      })}

      {signals.length > PAGE_SIZE && (
        <div className="text-center pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAll(v => !v)}
            className="border-white/10 text-slate-400 hover:bg-white/10 text-xs"
          >
            {showAll ? (
              <>
                <ChevronUp className="w-3.5 h-3.5 mr-1.5" />
                Ver menos
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5 mr-1.5" />
                Ver {signals.length - PAGE_SIZE} más
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
