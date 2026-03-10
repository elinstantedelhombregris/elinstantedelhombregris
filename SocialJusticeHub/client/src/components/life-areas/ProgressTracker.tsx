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
      <Card className="bg-white/5 backdrop-blur-md border-white/10">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-slate-200">
            <Target className="w-5 h-5 text-blue-400" />
            Progreso de Puntuacion
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-400">Estado Actual</span>
              <span className="font-bold text-blue-400">{currentScore}/100</span>
            </div>
            <Progress value={currentScore} className="h-3" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-400">Objetivo</span>
              <span className="font-bold text-purple-400">{desiredScore}/100</span>
            </div>
            <Progress value={desiredScore} className="h-3" />
          </div>
          {gap > 0 && (
            <div className="flex items-center gap-2 text-sm text-blue-400 bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg">
              <TrendingUp className="w-4 h-4" />
              <span>Necesitas mejorar {gap} puntos para alcanzar tu objetivo</span>
            </div>
          )}
          {gap <= 0 && (
            <div className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg">
              <Award className="w-4 h-4" />
              <span>Has alcanzado tu objetivo!</span>
            </div>
          )}
        </CardContent>
      </Card>

      {totalActions > 0 && (
        <Card className="bg-white/5 backdrop-blur-md border-white/10">
          <CardHeader>
            <CardTitle className="text-lg text-slate-200">Acciones Completadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-400">
                {actionsCompleted} de {totalActions} acciones
              </span>
              <span className="font-bold text-slate-200">{Math.round(actionsProgress)}%</span>
            </div>
            <Progress value={actionsProgress} className="h-3" />
          </CardContent>
        </Card>
      )}

      {xpRequired > 0 && (
        <Card className="bg-white/5 backdrop-blur-md border-white/10">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-slate-200">
              <Award className="w-5 h-5 text-amber-400" />
              Nivel {level}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-400">Experiencia</span>
              <span className="font-bold text-slate-200">
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
