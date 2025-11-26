import { useState, useEffect } from 'react';
import { Star, Target, Award, Zap, Crown, Trophy, Medal, Shield, TrendingUp, Activity } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface PointsSystemProps {
  userId?: number;
  showHeader?: boolean;
  variant?: 'compact' | 'full' | 'minimal';
  className?: string;
}

const PointsSystem = ({ 
  userId, 
  showHeader = true, 
  variant = 'full',
  className = '' 
}: PointsSystemProps) => {
  const [pointsAnimation, setPointsAnimation] = useState<number | null>(null);
  const [levelUpAnimation, setLevelUpAnimation] = useState(false);

  // Fetch user progress
  const { data: userProgress, refetch } = useQuery({
    queryKey: ['user-progress', userId],
    queryFn: async () => {
      if (!userId) return null;
      const response = await apiRequest('GET', `/api/progress/${userId}`);
      if (response.ok) {
        return response.json();
      }
      return null;
    },
    enabled: !!userId,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch user badges
  const { data: userBadges } = useQuery({
    queryKey: ['user-badges', userId],
    queryFn: async () => {
      if (!userId) return [];
      const response = await apiRequest('GET', `/api/badges/${userId}`);
      if (response.ok) {
        const result = await response.json();
        return result.data || [];
      }
      return [];
    },
    enabled: !!userId,
  });

  // Simulate points animation
  const animatePoints = (points: number) => {
    setPointsAnimation(points);
    setTimeout(() => setPointsAnimation(null), 2000);
  };

  // Simulate level up animation
  const animateLevelUp = () => {
    setLevelUpAnimation(true);
    setTimeout(() => setLevelUpAnimation(false), 3000);
  };

  useEffect(() => {
    if (userProgress?.data) {
      const points = userProgress.data.points;
      const level = userProgress.data.level;
      
      // Check for level up (simplified logic)
      if (level > 1 && points % 500 === 0) {
        animateLevelUp();
      }
      
      // Animate points increase
      if (points > 0) {
        animatePoints(points);
      }
    }
  }, [userProgress]);

  const getRankInfo = (rank: string) => {
    switch (rank) {
      case 'Líder del Movimiento':
        return {
          icon: <Crown className="w-6 h-6" />,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          borderColor: 'border-yellow-400',
          description: 'El máximo nivel de liderazgo'
        };
      case 'Agente de Cambio':
        return {
          icon: <Trophy className="w-6 h-6" />,
          color: 'text-purple-600',
          bgColor: 'bg-purple-100',
          borderColor: 'border-purple-400',
          description: 'Agente activo de transformación'
        };
      case 'Hombre Gris':
        return {
          icon: <Target className="w-6 h-6" />,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          borderColor: 'border-blue-400',
          description: 'Hombre Gris despertado'
        };
      case 'Despierto':
        return {
          icon: <Star className="w-6 h-6" />,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          borderColor: 'border-green-400',
          description: 'Consciente y actuando'
        };
      default:
        return {
          icon: <Shield className="w-6 h-6" />,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-400',
          description: 'Iniciando el camino'
        };
    }
  };

  const getProgressToNextLevel = () => {
    if (!userProgress?.data) return 0;
    const currentPoints = userProgress.data.points || 0;
    const currentLevel = userProgress.data.level || 1;
    const pointsForCurrentLevel = (currentLevel - 1) * 500;
    const pointsForNextLevel = currentLevel * 500;
    const progress = ((currentPoints - pointsForCurrentLevel) / 500) * 100;
    return Math.min(progress, 100);
  };

  if (!userProgress?.data && variant !== 'minimal') {
    return (
      <div className={`bg-gray-100 rounded-lg p-4 text-center ${className}`}>
        <p className="text-gray-600">Cargando progreso...</p>
      </div>
    );
  }

  const rankInfo = getRankInfo(userProgress?.data?.rank || 'Novato');
  const progressToNext = getProgressToNextLevel();

  if (variant === 'minimal') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className={`${rankInfo.bgColor} ${rankInfo.color} rounded-full p-1`}>
          {rankInfo.icon}
        </div>
        <span className={`text-sm font-medium ${rankInfo.color}`}>
          {userProgress?.data?.rank || 'Novato'}
        </span>
        <span className="text-sm text-gray-600">
          {userProgress?.data?.points || 0} pts
        </span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`bg-white rounded-lg p-4 border ${rankInfo.borderColor} ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`${rankInfo.bgColor} ${rankInfo.color} rounded-full p-2`}>
              {rankInfo.icon}
            </div>
            <div>
              <div className={`font-bold ${rankInfo.color}`}>
                {userProgress?.data?.rank || 'Novato'}
              </div>
              <div className="text-sm text-gray-600">
                Nivel {userProgress?.data?.level || 1}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {userProgress?.data?.points || 0}
            </div>
            <div className="text-sm text-gray-600">puntos</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl p-6 border-2 ${rankInfo.borderColor} shadow-lg ${className}`}>
      {showHeader && (
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Tu Progreso</h3>
          <p className="text-gray-600">Cada acción te acerca más a la transformación</p>
        </div>
      )}

      {/* Level Up Animation */}
      {levelUpAnimation && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-2xl p-8 text-center animate-pulse">
            <Crown className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-2">¡NIVEL SUBIDO!</h2>
            <p className="text-xl">¡Felicitaciones por tu progreso!</p>
          </div>
        </div>
      )}

      {/* Rank Display */}
      <div className="text-center mb-6">
        <div className={`${rankInfo.bgColor} ${rankInfo.color} rounded-full p-4 mx-auto mb-4 w-fit`}>
          {rankInfo.icon}
        </div>
        <h4 className={`text-2xl font-bold ${rankInfo.color} mb-2`}>
          {userProgress?.data?.rank || 'Novato'}
        </h4>
        <p className="text-gray-600 mb-2">{rankInfo.description}</p>
        <div className="flex items-center justify-center space-x-4">
          <span className="text-lg font-semibold text-gray-900">
            Nivel {userProgress?.data?.level || 1}
          </span>
          <span className="text-lg font-semibold text-gray-900">
            {userProgress?.data?.points || 0} puntos
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progreso al siguiente nivel</span>
          <span className="text-sm text-gray-600">
            {Math.round(progressToNext)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`${rankInfo.bgColor} h-3 rounded-full transition-all duration-500 ease-out`}
            style={{ width: `${progressToNext}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{(userProgress?.data?.level || 1) * 500 - 500} pts</span>
          <span>{(userProgress?.data?.level || 1) * 500} pts</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {userProgress?.data?.totalActions || 0}
          </div>
          <div className="text-sm text-gray-600">Acciones</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {userBadges?.length || 0}
          </div>
          <div className="text-sm text-gray-aly-600">Badges</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {userProgress?.data?.level || 1}
          </div>
          <div className="text-sm text-gray-600">Nivel</div>
        </div>
      </div>

      {/* Recent Badges */}
      {userBadges && userBadges.length > 0 && (
        <div>
          <h5 className="font-semibold text-gray-900 mb-3">Badges Recientes</h5>
          <div className="flex flex-wrap gap-2">
            {userBadges.slice(0, 5).map((badge: any) => (
              <div key={badge.id} className="flex items-center space-x-1 bg-yellow-100 rounded-full px-3 py-1">
                <Award className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-yellow-700">{badge.badge.name}</span>
              </div>
            ))}
            {userBadges.length > 5 && (
              <span className="text-sm text-gray-500">+{userBadges.length - 5} más</span>
            )}
          </div>
        </div>
      )}

      {/* Points Animation Overlay */}
      {pointsAnimation && (
        <div className="fixed inset-0 pointer-events-none z-40">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="bg-green-500 text-white rounded-full px-6 py-3 text-2xl font-bold animate-bounce">
              +{pointsAnimation} puntos!
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PointsSystem;
