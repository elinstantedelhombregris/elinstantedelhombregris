import React, { useState, useEffect } from 'react';
import { TrendingUp, Target, Zap, Star, Crown, Award } from 'lucide-react';

interface UserProgress {
  level: number;
  points: number;
  rank: string;
  totalActions: number;
  lastActionAt?: string;
}

interface UserProgressTrackerProps {
  progress: UserProgress;
  showDetails?: boolean;
  className?: string;
  animate?: boolean;
}

const getRankInfo = (rank: string) => {
  switch (rank) {
    case 'Novato':
      return {
        icon: <Star className="w-5 h-5" />,
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
        borderColor: 'border-gray-300',
        description: 'Iniciando el camino del cambio'
      };
    case 'Despierto':
      return {
        icon: <Zap className="w-5 h-5" />,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        borderColor: 'border-blue-300',
        description: 'Tomando conciencia y actuando'
      };
    case 'Hombre Gris':
      return {
        icon: <Target className="w-5 h-5" />,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        borderColor: 'border-purple-300',
        description: 'Agente activo del cambio'
      };
    case 'Agente de Cambio':
      return {
        icon: <TrendingUp className="w-5 h-5" />,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        borderColor: 'border-green-300',
        description: 'Generando impacto real'
      };
    case 'Líder del Movimiento':
      return {
        icon: <Crown className="w-5 h-5" />,
        color: 'text-yellow-600',
        bgColor: 'bg-gradient-to-br from-yellow-100 to-orange-100',
        borderColor: 'border-yellow-400',
        description: 'Líder inspirador del movimiento'
      };
    default:
      return {
        icon: <Award className="w-5 h-5" />,
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
        borderColor: 'border-gray-300',
        description: 'Miembro del movimiento'
      };
  }
};

export default function UserProgressTracker({
  progress,
  showDetails = true,
  className = '',
  animate = true
}: UserProgressTrackerProps) {
  const [animatedPoints, setAnimatedPoints] = useState(0);
  const [animatedLevel, setAnimatedLevel] = useState(1);

  const rankInfo = getRankInfo(progress.rank);
  const pointsToNextLevel = (progress.level * 500) - progress.points;
  const progressPercentage = (progress.points % 500) / 500 * 100;

  useEffect(() => {
    if (animate) {
      // Animate points
      const targetPoints = progress.points;
      const duration = 1500;
      const steps = 60;
      const increment = targetPoints / steps;
      let currentPoints = 0;

      const pointsTimer = setInterval(() => {
        currentPoints += increment;
        if (currentPoints >= targetPoints) {
          currentPoints = targetPoints;
          clearInterval(pointsTimer);
        }
        setAnimatedPoints(Math.floor(currentPoints));
      }, duration / steps);

      // Animate level
      const targetLevel = progress.level;
      const levelDuration = 1000;
      const levelSteps = 30;
      const levelIncrement = targetLevel / levelSteps;
      let currentLevel = 1;

      const levelTimer = setInterval(() => {
        currentLevel += levelIncrement;
        if (currentLevel >= targetLevel) {
          currentLevel = targetLevel;
          clearInterval(levelTimer);
        }
        setAnimatedLevel(Math.floor(currentLevel));
      }, levelDuration / levelSteps);

      return () => {
        clearInterval(pointsTimer);
        clearInterval(levelTimer);
      };
    } else {
      setAnimatedPoints(progress.points);
      setAnimatedLevel(progress.level);
    }
  }, [progress.points, progress.level, animate]);

  return (
    <div className={`bg-white rounded-xl border-2 ${rankInfo.borderColor} shadow-lg ${className}`}>
      {/* Header */}
      <div className={`p-4 rounded-t-xl ${rankInfo.bgColor}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`${rankInfo.color}`}>
              {rankInfo.icon}
            </div>
            <div>
              <h3 className="font-bold text-lg">{progress.rank}</h3>
              <p className="text-sm opacity-75">{rankInfo.description}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-800">
              Nivel {animatedLevel}
            </div>
            <div className="text-sm text-gray-600">
              {animatedPoints.toLocaleString()} puntos
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="p-4">
        <div className="mb-2 flex justify-between text-sm">
          <span className="text-gray-600">Progreso al siguiente nivel</span>
          <span className="font-semibold text-gray-800">
            {pointsToNextLevel} puntos restantes
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full ${rankInfo.bgColor} transition-all duration-1000 ease-out`}
            style={{ width: `${progressPercentage}%` }}
          >
            <div className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-pulse"></div>
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500 text-center">
          {Math.floor(progressPercentage)}% completado
        </div>
      </div>

      {/* Details */}
      {showDetails && (
        <div className="px-4 pb-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-gray-800">
                {progress.totalActions}
              </div>
              <div className="text-sm text-gray-600">
                Acciones Completadas
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-gray-800">
                {progress.level === 5 ? 'MAX' : `${500 - (progress.points % 500)}`}
              </div>
              <div className="text-sm text-gray-600">
                {progress.level === 5 ? 'Nivel Máximo' : 'Para Siguiente Nivel'}
              </div>
            </div>
          </div>

          {progress.lastActionAt && (
            <div className="mt-4 text-center">
              <div className="text-sm text-gray-500">
                Última actividad: {new Date(progress.lastActionAt).toLocaleDateString()}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Level Up Indicator */}
      {progress.level >= 3 && (
        <div className="px-4 pb-4">
          <div className={`${rankInfo.bgColor} rounded-lg p-3 text-center`}>
            <div className={`font-bold ${rankInfo.color}`}>
              ¡Felicitaciones! Has alcanzado el nivel {progress.level}
            </div>
            <div className="text-sm opacity-75 mt-1">
              Sigue así para llegar al siguiente rango
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Component for displaying progress in a compact format
export function CompactProgressTracker({ progress }: { progress: UserProgress }) {
  const rankInfo = getRankInfo(progress.rank);
  const progressPercentage = (progress.points % 500) / 500 * 100;

  return (
    <div className="flex items-center gap-3 bg-white rounded-lg border border-gray-200 p-3">
      <div className={`${rankInfo.color}`}>
        {rankInfo.icon}
      </div>
      <div className="flex-1">
        <div className="flex justify-between text-sm mb-1">
          <span className="font-semibold">{progress.rank}</span>
          <span className="text-gray-600">Nivel {progress.level}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full transition-all duration-500`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm font-bold text-gray-800">
          {progress.points.toLocaleString()}
        </div>
        <div className="text-xs text-gray-500">pts</div>
      </div>
    </div>
  );
}
