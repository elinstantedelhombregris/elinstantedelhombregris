import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Play, CheckCircle, Clock, Zap, Coins } from 'lucide-react';

interface ActionCardProps {
  action: {
    id: number;
    title: string;
    description: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedDuration: string;
    priority: number;
    xpReward: number;
    seedReward: number;
    userProgress?: {
      id: number;
      status: 'not_started' | 'in_progress' | 'completed' | 'abandoned';
      startedAt: string | null;
      completedAt: string | null;
    } | null;
  };
  onStart?: (actionId: number) => void;
  onComplete?: (actionId: number) => void;
}

const ActionCard: React.FC<ActionCardProps> = ({ action, onStart, onComplete }) => {
  const status = action.userProgress?.status || 'not_started';
  const isCompleted = status === 'completed';
  const isInProgress = status === 'in_progress';

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'intermediate':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'advanced':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'Principiante';
      case 'intermediate':
        return 'Intermedio';
      case 'advanced':
        return 'Avanzado';
      default:
        return difficulty;
    }
  };

  return (
    <Card className={`bg-white/5 backdrop-blur-md border-white/10 transition-all ${isCompleted ? 'opacity-60' : 'hover:bg-white/[0.07] hover:border-white/20'}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2 text-slate-200">
              {action.title}
              {isCompleted && <CheckCircle className="w-5 h-5 text-emerald-400" />}
            </CardTitle>
            <CardDescription className="mt-2 text-slate-400">{action.description}</CardDescription>
          </div>
          <Badge className={getDifficultyColor(action.difficulty)}>
            {getDifficultyLabel(action.difficulty)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-blue-400">
              <Zap className="w-4 h-4" />
              <span className="font-semibold">{action.xpReward} XP</span>
            </div>
            <div className="flex items-center gap-1 text-emerald-400">
              <Coins className="w-4 h-4" />
              <span className="font-semibold">{action.seedReward} semillas</span>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <Clock className="w-4 h-4" />
              <span>{action.estimatedDuration}</span>
            </div>
          </div>

          {isInProgress && (
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>En progreso</span>
                <span>
                  {action.userProgress?.startedAt
                    ? `Iniciado ${new Date(action.userProgress.startedAt).toLocaleDateString('es-AR', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}`
                    : 'En progreso'}
                </span>
              </div>
              <Progress value={50} className="h-2" />
            </div>
          )}

          {isCompleted && (
            <div className="text-sm text-emerald-400">
              <CheckCircle className="w-4 h-4 inline mr-1" />
              {action.userProgress?.completedAt
                ? `Completado ${new Date(action.userProgress.completedAt).toLocaleDateString('es-AR', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}`
                : 'Completado'}
            </div>
          )}

          <div className="flex gap-2">
            {status === 'not_started' && (
              <Button
                onClick={() => onStart?.(action.id)}
                className="flex-1 bg-blue-600 hover:bg-blue-500"
                size="sm"
              >
                <Play className="w-4 h-4 mr-2" />
                Iniciar
              </Button>
            )}
            {isInProgress && (
              <Button
                onClick={() => onComplete?.(action.id)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500"
                size="sm"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Completar
              </Button>
            )}
            {isCompleted && (
              <Button
                variant="outline"
                className="flex-1 border-white/10 text-slate-400"
                size="sm"
                disabled
              >
                Completado
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActionCard;
