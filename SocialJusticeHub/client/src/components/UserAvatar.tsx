import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Flame, Star, Heart, Users, BookOpen, TrendingUp } from 'lucide-react';

interface UserAvatarProps {
  user: {
    id: number;
    name: string;
    username: string;
    email: string;
  };
  level?: number;
  streak?: number;
  showBadge?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  level = 1,
  streak = 0,
  showBadge = true,
  size = 'md',
  className = ''
}) => {
  // Get level info
  const getLevelInfo = (level: number) => {
    switch (level) {
      case 1: return { name: 'Vos', color: 'from-blue-500 to-blue-600', icon: Heart };
      case 2: return { name: 'Tu Familia', color: 'from-pink-500 to-pink-600', icon: Users };
      case 3: return { name: 'Tu Barrio', color: 'from-green-500 to-green-600', icon: BookOpen };
      case 4: return { name: 'Tu Provincia', color: 'from-purple-500 to-purple-600', icon: TrendingUp };
      case 5: return { name: 'La Nación', color: 'from-indigo-500 to-indigo-600', icon: Star };
      default: return { name: 'Vos', color: 'from-blue-500 to-blue-600', icon: Heart };
    }
  };

  // Get size classes
  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'sm': return 'h-8 w-8';
      case 'md': return 'h-10 w-10';
      case 'lg': return 'h-12 w-12';
      case 'xl': return 'h-16 w-16';
      default: return 'h-10 w-10';
    }
  };

  // Get badge size classes
  const getBadgeSizeClasses = (size: string) => {
    switch (size) {
      case 'sm': return 'h-4 w-4';
      case 'md': return 'h-5 w-5';
      case 'lg': return 'h-6 w-6';
      case 'xl': return 'h-8 w-8';
      default: return 'h-5 w-5';
    }
  };

  // Get badge position classes
  const getBadgePositionClasses = (size: string) => {
    switch (size) {
      case 'sm': return '-top-1 -right-1';
      case 'md': return '-top-1 -right-1';
      case 'lg': return '-top-1 -right-1';
      case 'xl': return '-top-2 -right-2';
      default: return '-top-1 -right-1';
    }
  };

  const levelInfo = getLevelInfo(level);
  const LevelIcon = levelInfo.icon;
  const sizeClasses = getSizeClasses(size);
  const badgeSizeClasses = getBadgeSizeClasses(size);
  const badgePositionClasses = getBadgePositionClasses(size);

  return (
    <div className={`relative inline-block ${className}`}>
      <Avatar className={sizeClasses}>
        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} />
        <AvatarFallback className="text-sm font-medium">
          {user.name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      
      {showBadge && (
        <div className={`absolute ${badgePositionClasses} w-6 h-6 bg-gradient-to-br ${levelInfo.color} rounded-full flex items-center justify-center shadow-md`}>
          <LevelIcon className={`${badgeSizeClasses} text-white`} />
        </div>
      )}
      
      {streak > 0 && (
        <div className="absolute -bottom-1 -right-1">
          <Badge variant="secondary" className="text-xs px-1 py-0">
            <Flame className="h-3 w-3 mr-1 text-orange-500" />
            {streak}
          </Badge>
        </div>
      )}
    </div>
  );
};

export default UserAvatar;
