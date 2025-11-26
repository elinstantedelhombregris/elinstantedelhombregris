import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Crown, Star, TrendingUp, Users, Calendar, Globe } from 'lucide-react';

interface LeaderboardUser {
  userId: number;
  points: number;
  rank: number;
  level?: number;
  user: {
    id: number;
    name: string;
    username: string;
  };
}

interface LeaderboardProps {
  data: LeaderboardUser[];
  type: 'global' | 'weekly' | 'monthly' | 'province';
  currentUserId?: number;
  className?: string;
  title?: string;
  limit?: number;
}

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Crown className="w-6 h-6" />;
    case 2:
      return <Medal className="w-6 h-6" />;
    case 3:
      return <Medal className="w-6 h-6" />;
    default:
      return <Star className="w-5 h-5" />;
  }
};

const getRankBadgeColor = (rank: number) => {
  switch (rank) {
    case 1:
      return 'bg-accent text-white border-accent';
    case 2:
      return 'bg-secondary text-secondary-foreground border-secondary';
    case 3:
      return 'bg-primary text-primary-foreground border-primary';
    default:
      return 'bg-white text-foreground border-border/60';
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'global':
      return <Globe className="w-5 h-5" />;
    case 'weekly':
      return <Calendar className="w-5 h-5" />;
    case 'monthly':
      return <Calendar className="w-5 h-5" />;
    case 'province':
      return <Users className="w-5 h-5" />;
    default:
      return <Trophy className="w-5 h-5" />;
  }
};

const getTypeTitle = (type: string) => {
  switch (type) {
    case 'global':
      return 'RANKING GLOBAL';
    case 'weekly':
      return 'RANKING SEMANAL';
    case 'monthly':
      return 'RANKING MENSUAL';
    case 'province':
      return 'RANKING POR PROVINCIA';
    default:
      return 'RANKING';
  }
};

export default function Leaderboard({
  data,
  type,
  currentUserId,
  className = '',
  title,
  limit = 10
}: LeaderboardProps) {
  const [displayData, setDisplayData] = useState<LeaderboardUser[]>([]);

  useEffect(() => {
    // Ensure data is an array before processing
    if (!Array.isArray(data)) {
      setDisplayData([]);
      return;
    }
    
    // Sort by rank and limit results
    const sortedData = [...data].sort((a, b) => a.rank - b.rank);
    setDisplayData(sortedData.slice(0, limit));
  }, [data, limit]);

  const LeaderboardItem = ({ user, index }: { user: LeaderboardUser; index: number }) => {
    const isCurrentUser = currentUserId === user.userId;
    
    return (
      <div className={`
        flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300
        ${isCurrentUser ? 'border-accent/40 bg-accent/10 shadow-[0_20px_45px_rgba(125,91,222,0.2)]' : 'bg-white/95 border-border/60 hover:-translate-y-0.5 hover:border-border/80 hover:shadow-[0_20px_45px_rgba(15,23,42,0.08)]'}
      `}>
        {/* Rank */}
        <div className="flex-shrink-0">
          <div className={`
            w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border
            ${getRankBadgeColor(user.rank)}
          `}>
            {user.rank <= 3 ? (
              getRankIcon(user.rank)
            ) : (
              user.rank
            )}
          </div>
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className={`font-semibold truncate ${isCurrentUser ? 'text-accent' : 'text-foreground'}`}>
              {user.user.name}
            </h4>
            {isCurrentUser && (
              <span className="text-xs bg-accent/15 text-accent px-2 py-1 rounded-full font-semibold">
                TÚ
              </span>
            )}
          </div>
          <p className="text-sm text-foreground/60 truncate">
            @{user.user.username}
          </p>
          {user.level && (
            <p className="text-xs text-foreground/50">
              Nivel {user.level}
            </p>
          )}
        </div>

        {/* Points */}
        <div className="flex-shrink-0 text-right">
          <div className={`text-lg font-bold ${isCurrentUser ? 'text-accent' : 'text-foreground'}`}>
            {user.points.toLocaleString()}
          </div>
          <div className="text-xs text-foreground/50">puntos</div>
        </div>
      </div>
    );
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          {getTypeIcon(type)}
          <h3 className="text-2xl font-bold text-foreground uppercase tracking-wide">
            {title || getTypeTitle(type)}
          </h3>
        </div>
        <p className="text-foreground/60">
          Los miembros más activos del movimiento ¡BASTA!
        </p>
      </div>

      {/* Leaderboard */}
      <div className="space-y-3">
        {displayData.length > 0 ? (
          displayData.map((user, index) => (
            <LeaderboardItem key={user.userId} user={user} index={index} />
          ))
        ) : (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-foreground/30 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-foreground/70 mb-2">
              No hay datos disponibles
            </h4>
            <p className="text-foreground/60">
              Sé el primero en aparecer en el ranking
            </p>
          </div>
        )}
      </div>

      {/* Current User Position (if not in top list) */}
      {currentUserId && !displayData.find(user => user.userId === currentUserId) && (
        <div className="mt-6 pt-4 border-t border-border/50">
          <div className="flex items-center justify-between text-sm text-foreground/60 mb-2">
            <span>Tu posición:</span>
            <span>Fuera del top {limit}</span>
          </div>
          <div className="bg-muted rounded-2xl p-3 text-center">
            <p className="text-sm text-foreground/70">
              ¡Sigue participando para aparecer en el ranking!
            </p>
          </div>
        </div>
      )}

      {/* Stats Summary */}
      {displayData.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="bg-muted rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-foreground">
              {displayData.length}
            </div>
            <div className="text-sm text-foreground/70">
              Miembros Activos
            </div>
          </div>
          <div className="bg-muted rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-foreground">
              {displayData.reduce((sum, user) => sum + user.points, 0).toLocaleString()}
            </div>
            <div className="text-sm text-foreground/70">
              Puntos Totales
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Compact leaderboard for sidebars
export function CompactLeaderboard({ data, type, limit = 5 }: {
  data: LeaderboardUser[];
  type: string;
  limit?: number;
}) {
  const [displayData, setDisplayData] = useState<LeaderboardUser[]>([]);

  useEffect(() => {
    const sortedData = [...data].sort((a, b) => a.rank - b.rank);
    setDisplayData(sortedData.slice(0, limit));
  }, [data, limit]);

  return (
    <div className="bg-white/95 rounded-2xl border border-border/60 p-4">
      <div className="flex items-center gap-2 mb-4">
        {getTypeIcon(type)}
        <h4 className="font-bold text-foreground text-sm uppercase tracking-wide">
          {getTypeTitle(type)}
        </h4>
      </div>
      
      <div className="space-y-2">
        {displayData.map((user, index) => (
          <div key={user.userId} className="flex items-center gap-2 text-sm">
            <div className={`
              w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border
              ${getRankBadgeColor(user.rank)}
            `}>
              {user.rank <= 3 ? (
                getRankIcon(user.rank)
              ) : (
                user.rank
              )}
            </div>
            <span className="flex-1 truncate text-foreground/80">
              {user.user.name}
            </span>
            <span className="text-foreground/50 text-xs">
              {user.points}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
