import React, { useState, useEffect } from 'react';
import { Trophy, Star, Crown, Zap, Target, Users, Heart, Flame, Award, Sprout } from 'lucide-react';

interface Badge {
  id: number;
  name: string;
  description: string;
  iconName: string;
  category: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  experienceReward: number;
  earnedAt?: string;
  seen?: boolean;
}

interface BadgeSystemProps {
  badges: Badge[];
  showUnearned?: boolean;
  className?: string;
  title?: string;
}

const getBadgeIcon = (iconName: string) => {
  const icons: Record<string, React.ReactNode> = {
    'trophy': <Trophy className="w-6 h-6" />,
    'star': <Star className="w-6 h-6" />,
    'crown': <Crown className="w-6 h-6" />,
    'zap': <Zap className="w-6 h-6" />,
    'target': <Target className="w-6 h-6" />,
    'users': <Users className="w-6 h-6" />,
    'heart': <Heart className="w-6 h-6" />,
    'flame': <Flame className="w-6 h-6" />,
    'sprout': <Sprout className="w-6 h-6" />,
    'award': <Award className="w-6 h-6" />
  };
  return icons[iconName] || <Award className="w-6 h-6" />;
};

const getRarityStyles = (rarity: string) => {
  switch (rarity) {
    case 'common':
      return 'bg-white text-foreground border-border/60';
    case 'rare':
      return 'bg-white text-accent border-accent/30';
    case 'epic':
      return 'bg-white text-secondary border-secondary/30';
    case 'legendary':
      return 'bg-white text-[#8F6A2A] border-[#D9BF7C]/50';
    default:
      return 'bg-white text-foreground border-border/60';
  }
};

const getRarityGlow = (rarity: string) => {
  switch (rarity) {
    case 'rare':
      return 'shadow-[0_20px_45px_rgba(125,91,222,0.25)]';
    case 'epic':
      return 'shadow-[0_20px_45px_rgba(84,102,135,0.25)]';
    case 'legendary':
      return 'shadow-[0_20px_45px_rgba(217,191,124,0.35)]';
    default:
      return 'shadow-[0_15px_35px_rgba(15,23,42,0.08)]';
  }
};

export default function BadgeSystem({ 
  badges, 
  showUnearned = false, 
  className = '',
  title = "MIS LOGROS"
}: BadgeSystemProps) {
  const [earnedBadges, setEarnedBadges] = useState<Badge[]>([]);
  const [unearnedBadges, setUnearnedBadges] = useState<Badge[]>([]);

  useEffect(() => {
    const earned = badges.filter(badge => badge.earnedAt);
    const unearned = badges.filter(badge => !badge.earnedAt);
    
    setEarnedBadges(earned);
    setUnearnedBadges(unearned);
  }, [badges]);

  const BadgeCard = ({ badge, isEarned }: { badge: Badge; isEarned: boolean }) => (
    <div
      className={`
        relative p-4 rounded-2xl border transition-all duration-300 transform hover:-translate-y-1
        ${isEarned ? getRarityStyles(badge.rarity) : 'bg-white/70 text-foreground/40 border-border/50 opacity-60'}
        ${isEarned ? getRarityGlow(badge.rarity) : ''}
        ${isEarned && !badge.seen ? 'animate-pulse' : ''}
      `}
    >
      {/* Rarity indicator */}
      <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${
        isEarned ? getRarityStyles(badge.rarity) : 'bg-white text-foreground/50 border-border/40'
      }`}>
        {badge.rarity === 'legendary' ? '★' : 
         badge.rarity === 'epic' ? '◆' : 
         badge.rarity === 'rare' ? '●' : '○'}
      </div>

      <div className="text-center">
        <div className={`mb-3 ${isEarned ? '' : 'grayscale'}`}>
          {getBadgeIcon(badge.iconName)}
        </div>
        
        <h4 className="font-bold text-sm mb-1">{badge.name}</h4>
        <p className="text-xs mb-2">{badge.description}</p>
        
        {isEarned && (
          <div className="text-xs opacity-75">
            +{badge.experienceReward} XP
          </div>
        )}
        
        {isEarned && badge.earnedAt && (
          <div className="text-xs mt-2 opacity-75">
            {new Date(badge.earnedAt).toLocaleDateString()}
          </div>
        )}
      </div>

      {/* New badge indicator */}
      {isEarned && !badge.seen && (
        <div className="absolute -top-1 -left-1 w-3 h-3 bg-accent rounded-full animate-ping"></div>
      )}
    </div>
  );

  return (
    <div className={`w-full ${className}`}>
      {title && (
        <h3 className="text-2xl font-bold text-center text-foreground mb-6 uppercase tracking-wide">
          {title}
        </h3>
      )}

      {/* Earned Badges */}
      {earnedBadges.length > 0 && (
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-secondary mb-4 flex items-center">
            <Trophy className="w-5 h-5 mr-2" />
            LOGROS OBTENIDOS ({earnedBadges.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {earnedBadges.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} isEarned={true} />
            ))}
          </div>
        </div>
      )}

      {/* Unearned Badges */}
      {showUnearned && unearnedBadges.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-foreground/60 mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2" />
            LOGROS DISPONIBLES ({unearnedBadges.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {unearnedBadges.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} isEarned={false} />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {earnedBadges.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-foreground/30 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-foreground/70 mb-2">
            Aún no tienes logros
          </h4>
          <p className="text-foreground/60">
            ¡Comienza tu camino hacia el cambio y desbloquea tus primeros logros!
          </p>
        </div>
      )}
    </div>
  );
}

// Predefined badges for ¡BASTA!
export const bastaBadges: Badge[] = [
  {
    id: 1,
    name: "Primer Despertar",
    description: "Completaste tu primer compromiso",
    iconName: "target",
    category: "commitment",
    rarity: "common",
    experienceReward: 100
  },
  {
    id: 2,
    name: "Hombre Gris Nivel 1",
    description: "Completaste el nivel 1 de la guía",
    iconName: "star",
    category: "level",
    rarity: "common",
    experienceReward: 200
  },
  {
    id: 3,
    name: "Semilla Despertada",
    description: "Compartiste tu visión en el mapa y sembraste compromiso",
    iconName: "sprout",
    category: "sharing",
    rarity: "rare",
    experienceReward: 150
  },
  {
    id: 4,
    name: "Miembro de la Tribu",
    description: "Te uniste a la comunidad",
    iconName: "users",
    category: "community",
    rarity: "common",
    experienceReward: 100
  },
  {
    id: 5,
    name: "Agente de Cambio",
    description: "Creaste tu primer proyecto comunitario",
    iconName: "heart",
    category: "action",
    rarity: "epic",
    experienceReward: 300
  },
  {
    id: 6,
    name: "Líder del Movimiento",
    description: "Completaste 10+ acciones",
    iconName: "crown",
    category: "leadership",
    rarity: "legendary",
    experienceReward: 500
  }
];
