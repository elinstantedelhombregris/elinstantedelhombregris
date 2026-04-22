import { motion } from 'framer-motion';
import { MapPin, Award, Sparkles } from 'lucide-react';
import { useLocation } from 'wouter';
import { cn } from '@/lib/utils';

export type Leader = {
  userId: number;
  points: number;
  rank?: number | string | null;
  level?: number;
  badgeCount?: number;
  topBadges?: Array<{ id: number; name: string; iconName: string; rarity: string }>;
  user: {
    id: number;
    name: string;
    username: string;
    location?: string | null;
    avatarUrl?: string | null;
  };
};

interface LeaderHeroCardProps {
  leader: Leader;
}

const rarityTone: Record<string, string> = {
  legendary: 'text-yellow-200 border-yellow-400/30 bg-yellow-400/5',
  epic: 'text-purple-200 border-purple-400/30 bg-purple-400/5',
  rare: 'text-sky-200 border-sky-400/30 bg-sky-400/5',
  common: 'text-slate-200 border-white/10 bg-white/5',
};

const LeaderHeroCard = ({ leader }: LeaderHeroCardProps) => {
  const [, setLocation] = useLocation();
  const initials = (leader.user.name || leader.user.username || '?').charAt(0).toUpperCase();
  const go = () => setLocation(`/u/${leader.user.username}`);

  return (
    <motion.button
      onClick={go}
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      className={cn(
        'group relative w-full text-left rounded-2xl p-6 md:p-8',
        'bg-gradient-to-br from-white/[0.07] via-white/[0.03] to-transparent',
        'border border-yellow-400/20 backdrop-blur-md',
        'shadow-[0_0_40px_rgba(250,204,21,0.04)]',
        'hover:border-yellow-400/40 hover:shadow-[0_0_60px_rgba(250,204,21,0.08)]',
        'transition-all duration-500'
      )}
      aria-label={`Ver perfil de ${leader.user.name}`}
    >
      {/* Subtle gold shimmer */}
      <div className="absolute inset-0 rounded-2xl opacity-40 pointer-events-none bg-[radial-gradient(circle_at_top_left,rgba(250,204,21,0.08),transparent_60%)]" />

      <div className="relative flex flex-col md:flex-row gap-6 md:items-center">
        {/* Avatar */}
        <div className="flex-shrink-0 relative">
          <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/10 border-2 border-yellow-400/30 overflow-hidden flex items-center justify-center shadow-[0_0_30px_rgba(250,204,21,0.15)]">
            {leader.user.avatarUrl ? (
              <img src={leader.user.avatarUrl} alt={leader.user.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl md:text-4xl font-bold text-yellow-100">{initials}</span>
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#0a0a0a] border border-yellow-400/40 flex items-center justify-center text-[10px] font-mono font-bold text-yellow-300">
            01
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-[10px] font-mono tracking-[0.2em] uppercase text-yellow-300 mb-3">
            <Sparkles className="w-3 h-3" /> Faro Principal
          </div>
          <h3 className="text-2xl md:text-3xl font-serif font-bold text-white mb-1 truncate">
            {leader.user.name}
          </h3>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-400">
            <span className="font-mono text-slate-500">@{leader.user.username}</span>
            {leader.user.location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {leader.user.location}
              </span>
            )}
          </div>

          {/* Stats strip */}
          <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2 mt-4">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-mono">Nivel</div>
              <div className="text-xl font-bold text-white">{leader.level ?? 1}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-mono">XP</div>
              <div className="text-xl font-bold text-white">{(leader.points || 0).toLocaleString('es-AR')}</div>
            </div>
            {typeof leader.badgeCount === 'number' && (
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-mono">Insignias</div>
                <div className="text-xl font-bold text-white">{leader.badgeCount}</div>
              </div>
            )}
          </div>

          {/* Top badges */}
          {leader.topBadges && leader.topBadges.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {leader.topBadges.map((b) => (
                <span
                  key={b.id}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium',
                    rarityTone[b.rarity] ?? rarityTone.common
                  )}
                >
                  <Award className="w-3 h-3" />
                  {b.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.button>
  );
};

export default LeaderHeroCard;
