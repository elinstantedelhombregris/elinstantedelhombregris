import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import type { Leader } from './LeaderHeroCard';

interface LeaderTileProps {
  leader: Leader;
  index: number; // 0-based index relative to rank 2 (so index 0 = rank 2)
}

// Muted podium accents for ranks 2 and 3 only
const rankTone = (rank: number) => {
  if (rank === 2) return {
    border: 'border-slate-300/20',
    glow: 'shadow-[0_0_20px_rgba(203,213,225,0.04)]',
    rankText: 'text-slate-200',
    rankBg: 'bg-slate-300/5',
  };
  if (rank === 3) return {
    border: 'border-orange-400/15',
    glow: 'shadow-[0_0_20px_rgba(251,146,60,0.04)]',
    rankText: 'text-orange-300',
    rankBg: 'bg-orange-400/5',
  };
  return {
    border: 'border-white/10',
    glow: '',
    rankText: 'text-slate-400',
    rankBg: 'bg-white/5',
  };
};

const LeaderTile = ({ leader, index }: LeaderTileProps) => {
  const [, setLocation] = useLocation();
  const rank = index + 2;
  const tone = rankTone(rank);
  const initials = (leader.user.name || leader.user.username || '?').charAt(0).toUpperCase();

  return (
    <motion.button
      onClick={() => setLocation(`/u/${leader.user.username}`)}
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      className={cn(
        'group w-full text-left rounded-xl p-4',
        'bg-white/[0.03] backdrop-blur-md border',
        tone.border, tone.glow,
        'hover:bg-white/[0.05] hover:border-white/20 transition-all duration-300'
      )}
      aria-label={`Ver perfil de ${leader.user.name}, puesto ${rank}`}
    >
      <div className="flex items-center gap-4">
        {/* Rank */}
        <div className={cn(
          'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-mono text-sm font-bold border',
          tone.rankBg, tone.border, tone.rankText
        )}>
          {String(rank).padStart(2, '0')}
        </div>

        {/* Avatar */}
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center">
          {leader.user.avatarUrl ? (
            <img src={leader.user.avatarUrl} alt={leader.user.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-lg font-bold text-slate-300">{initials}</span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="text-white font-semibold truncate">{leader.user.name}</div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
            {leader.user.location ? (
              <span className="inline-flex items-center gap-1 truncate">
                <MapPin className="w-3 h-3 flex-shrink-0" /> <span className="truncate">{leader.user.location}</span>
              </span>
            ) : (
              <span className="text-slate-600 font-mono">@{leader.user.username}</span>
            )}
          </div>
        </div>

        {/* XP + level */}
        <div className="flex-shrink-0 text-right">
          <div className="text-base font-bold text-white leading-tight">{(leader.points || 0).toLocaleString('es-AR')}</div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-mono">
            XP · Nv {leader.level ?? 1}
          </div>
        </div>
      </div>
    </motion.button>
  );
};

export default LeaderTile;
