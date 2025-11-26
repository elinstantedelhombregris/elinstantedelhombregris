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
        return 'bg-green-100 text-green-700';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-700';
      case 'advanced':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
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
    <Card className={`transition-all ${isCompleted ? 'opacity-75' : 'hover:shadow-md'}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {action.title}
              {isCompleted && <CheckCircle className="w-5 h-5 text-green-500" />}
            </CardTitle>
            <CardDescription className="mt-2">{action.description}</CardDescription>
          </div>
          <Badge className={getDifficultyColor(action.difficulty)}>
            {getDifficultyLabel(action.difficulty)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Rewards */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-blue-600">
              <Zap className="w-4 h-4" />
              <span className="font-semibold">{action.xpReward} XP</span>
            </div>
            <div className="flex items-center gap-1 text-green-600">
              <Coins className="w-4 h-4" />
              <span className="font-semibold">{action.seedReward} semillas</span>
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{action.estimatedDuration}</span>
            </div>
          </div>

          {/* Status */}
          {isInProgress && (
            <div>
              <div className="flex justify-between text-xs text-gray-600 mb-1">
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
            <div className="text-sm text-green-600">
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

          {/* Actions */}
          <div className="flex gap-2">
            {status === 'not_started' && (
              <Button
                onClick={() => onStart?.(action.id)}
                className="flex-1"
                size="sm"
              >
                <Play className="w-4 h-4 mr-2" />
                Iniciar
              </Button>
            )}
            {isInProgress && (
              <>
                <Button
                  onClick={() => onComplete?.(action.id)}
                  className="flex-1"
                  size="sm"
                  variant="default"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Completar
                </Button>
              </>
            )}
            {isCompleted && (
              <Button
                variant="outline"
                className="flex-1"
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

