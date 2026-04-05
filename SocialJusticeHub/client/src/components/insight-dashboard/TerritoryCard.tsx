import { MapPin, Sparkles, Users, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

interface TerritoryCardProps {
  data: {
    hasLocation: boolean;
    territoryName?: string;
    dreamCount?: number;
    recentDreams?: Array<{ id: number; type: string; text: string; createdAt: string }>;
    memberCount?: number;
  } | null | undefined;
}

const TYPE_EMOJI: Record<string, string> = {
  dream: '💭',
  value: '💎',
  need: '🔔',
  basta: '✋',
};

export default function TerritoryCard({ data }: TerritoryCardProps) {
  if (!data || data.hasLocation === false) {
    return (
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="h-3.5 w-3.5 text-slate-500" />
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-slate-500">
            EN TU ZONA
          </span>
        </div>
        <p className="text-xs text-slate-400 mb-3 leading-relaxed">
          Agrega tu ubicacion para ver que pasa en tu zona.
        </p>
        <Link href="/profile">
          <Button
            size="sm"
            variant="outline"
            className="border-white/10 text-slate-400 hover:text-white hover:bg-white/5 text-xs h-7 px-3"
          >
            Completar perfil
            <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </Link>
      </div>
    );
  }

  const { territoryName, dreamCount = 0, recentDreams = [], memberCount = 0 } = data;

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <MapPin className="h-3.5 w-3.5 text-emerald-400" />
        <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-slate-500">
          EN TU ZONA
        </span>
      </div>

      {/* Territory name */}
      <p className="text-sm font-bold text-white mb-3 truncate">{territoryName}</p>

      {/* Stats */}
      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          <span className="text-sm text-white font-bold">{dreamCount}</span>
          <span className="text-xs text-slate-500">senales</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-blue-400" />
          <span className="text-sm text-white font-bold">{memberCount}</span>
          <span className="text-xs text-slate-500">miembros</span>
        </div>
      </div>

      {/* Recent dreams */}
      {recentDreams.length > 0 && (
        <div className="space-y-1.5 mb-3">
          {recentDreams.map(dream => (
            <div key={dream.id} className="flex items-center gap-2">
              <span className="text-xs flex-shrink-0">{TYPE_EMOJI[dream.type] ?? '💭'}</span>
              <span className="text-xs text-slate-400 truncate">
                {dream.text.length > 50 ? dream.text.slice(0, 50) + '…' : dream.text}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* CTA */}
      <Link href="/el-mapa">
        <Button
          size="sm"
          variant="outline"
          className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 text-xs h-7 px-3 w-full justify-between"
        >
          Ver mapa
          <ArrowRight className="h-3 w-3" />
        </Button>
      </Link>
    </div>
  );
}
