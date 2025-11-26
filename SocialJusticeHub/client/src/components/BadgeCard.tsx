import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Lock, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BadgeCardProps {
  badge: {
    id: number;
    name: string;
    description: string;
    iconName: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    experienceReward: number;
  };
  isEarned?: boolean;
  earnedAt?: string;
  onClick?: () => void;
  className?: string;
}

const BadgeCard: React.FC<BadgeCardProps> = ({
  badge,
  isEarned = false,
  earnedAt,
  onClick,
  className = ''
}) => {
  // Get rarity colors
  const getRarityColors = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return {
          bg: 'from-yellow-400 to-orange-500',
          text: 'text-yellow-600',
          border: 'border-yellow-200',
          cardBg: 'from-yellow-50 to-orange-50'
        };
      case 'epic':
        return {
          bg: 'from-purple-500 to-pink-500',
          text: 'text-purple-600',
          border: 'border-purple-200',
          cardBg: 'from-purple-50 to-pink-50'
        };
      case 'rare':
        return {
          bg: 'from-blue-500 to-purple-500',
          text: 'text-blue-600',
          border: 'border-blue-200',
          cardBg: 'from-blue-50 to-purple-50'
        };
      default:
        return {
          bg: 'from-gray-400 to-gray-600',
          text: 'text-gray-600',
          border: 'border-gray-200',
          cardBg: 'from-gray-50 to-gray-100'
        };
    }
  };

  // Get rarity label
  const getRarityLabel = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'LEGENDARIO';
      case 'epic': return 'ÉPICO';
      case 'rare': return 'RARO';
      default: return 'COMÚN';
    }
  };

  const colors = getRarityColors(badge.rarity);

  return (
    <Card 
      className={cn(
        'relative cursor-pointer transition-all duration-200 hover:shadow-md',
        isEarned ? `bg-gradient-to-br ${colors.cardBg} border ${colors.border}` : 'bg-gray-50 border-gray-200 opacity-75',
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center space-x-3 mb-3">
          <div className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center',
            isEarned ? `bg-gradient-to-br ${colors.bg}` : 'bg-gray-300'
          )}>
            {isEarned ? (
              <Award className="h-5 w-5 text-white" />
            ) : (
              <Lock className="h-5 w-5 text-gray-500" />
            )}
          </div>
          <div className="flex-1">
            <h3 className={cn(
              'font-semibold text-sm',
              isEarned ? 'text-gray-900' : 'text-gray-600'
            )}>
              {badge.name}
            </h3>
            <Badge 
              variant="outline" 
              className={cn(
                'text-xs px-2 py-0',
                isEarned ? colors.text : 'text-gray-500'
              )}
            >
              {getRarityLabel(badge.rarity)}
            </Badge>
          </div>
        </div>
        
        <p className={cn(
          'text-sm mb-3',
          isEarned ? 'text-gray-700' : 'text-gray-600'
        )}>
          {badge.description}
        </p>
        
        <div className="flex items-center justify-between text-xs">
          <span className={cn(
            'font-medium',
            isEarned ? 'text-gray-600' : 'text-gray-500'
          )}>
            +{badge.experienceReward} XP
          </span>
          {isEarned && earnedAt && (
            <span className="text-gray-500">
              {new Date(earnedAt).toLocaleDateString()}
            </span>
          )}
        </div>
        
        {isEarned && (
          <div className="absolute top-2 right-2">
            <Star className="h-4 w-4 text-yellow-500" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BadgeCard;
