import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Target, Award } from 'lucide-react';

interface ProgressTrackerProps {
  currentScore: number;
  desiredScore: number;
  gap: number;
  actionsCompleted?: number;
  totalActions?: number;
  level?: number;
  xpCurrent?: number;
  xpRequired?: number;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  currentScore,
  desiredScore,
  gap,
  actionsCompleted = 0,
  totalActions = 0,
  level = 1,
  xpCurrent = 0,
  xpRequired = 100,
}) => {
  // Calcular progreso asegurando que no exceda 100%
  const scoreProgress = desiredScore > 0 
    ? Math.min(100, (currentScore / desiredScore) * 100) 
    : currentScore;
  const actionsProgress = totalActions > 0 
    ? Math.min(100, (actionsCompleted / totalActions) * 100) 
    : 0;
  const xpProgress = xpRequired > 0 
    ? Math.min(100, (xpCurrent / xpRequired) * 100) 
    : 0;

  return (
    <div className="space-y-4">
      {/* Score Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="w-5 h-5" />
            Progreso de Puntuación
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Estado Actual</span>
              <span className="font-bold text-blue-600">{currentScore}/100</span>
            </div>
            <Progress value={currentScore} className="h-3" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Objetivo</span>
              <span className="font-bold text-purple-600">{desiredScore}/100</span>
            </div>
            <Progress value={desiredScore} className="h-3" />
          </div>
          {gap > 0 && (
            <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
              <TrendingUp className="w-4 h-4" />
              <span>Necesitas mejorar {gap} puntos para alcanzar tu objetivo</span>
            </div>
          )}
          {gap <= 0 && (
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
              <Award className="w-4 h-4" />
              <span>¡Has alcanzado tu objetivo!</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions Progress */}
      {totalActions > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Acciones Completadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">
                {actionsCompleted} de {totalActions} acciones
              </span>
              <span className="font-bold">{Math.round(actionsProgress)}%</span>
            </div>
            <Progress value={actionsProgress} className="h-3" />
          </CardContent>
        </Card>
      )}

      {/* Level Progress */}
      {xpRequired > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="w-5 h-5" />
              Nivel {level}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Experiencia</span>
              <span className="font-bold">
                {xpCurrent} / {xpRequired} XP
              </span>
            </div>
            <Progress value={xpProgress} className="h-3" />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProgressTracker;

