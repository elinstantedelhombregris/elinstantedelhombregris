import React from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, PlayCircle, ArrowRight } from 'lucide-react';
import { getLifeAreaIcon } from '@/lib/lucide-icon-registry';

interface LifeAreaCardProps {
  area: {
    id: number;
    name: string;
    description: string | null;
    iconName: string | null;
    colorTheme: string | null;
    score?: {
      currentScore: number;
      desiredScore: number;
      gap: number;
    } | null;
  };
}

const LifeAreaCard: React.FC<LifeAreaCardProps> = ({ area }) => {
  const hasScore = !!area.score;
  const score = area.score?.currentScore || 0;
  const gap = area.score?.gap || 0;

  const IconComponent = getLifeAreaIcon(area.iconName);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-blue-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card 
      className={`cursor-pointer hover:shadow-lg transition-all ${
        !hasScore ? 'border-2 border-dashed border-gray-300' : ''
      }`}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${hasScore ? getScoreColor(score).replace('text-', 'bg-').replace('-600', '-100') : 'bg-gray-100'}`}>
              <IconComponent className={`w-5 h-5 ${hasScore ? getScoreColor(score) : 'text-gray-400'}`} />
            </div>
            <CardTitle className="text-lg">{area.name}</CardTitle>
          </div>
          {hasScore ? (
            <Badge variant={score >= 70 ? "default" : score >= 50 ? "secondary" : "destructive"}>
              {score}
            </Badge>
          ) : (
            <Badge variant="outline">Sin evaluar</Badge>
          )}
        </div>
        {area.description && (
          <CardDescription className="text-sm mt-2">{area.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {hasScore ? (
          <>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Estado Actual</span>
                <span className={`font-semibold ${getScoreColor(score)}`}>{score}/100</span>
              </div>
              <Progress 
                value={score} 
                className="h-2"
              />
              {gap > 0 && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <TrendingUp className="w-4 h-4" />
                  <span>Oportunidad de mejora: {gap} puntos</span>
                </div>
              )}
              {gap === 0 && score >= 80 && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <span>¡Excelente! Has alcanzado tu objetivo</span>
                </div>
              )}
            </div>
            <div className="mt-6 flex gap-2">
              <Link href={`/life-areas/${area.id}`} className="flex-1">
                <Button variant="outline" size="sm" className="w-full">
                  Ver Detalles
                </Button>
              </Link>
              <Link href={`/life-areas/${area.id}/quiz`} className="flex-1">
                <Button size="sm" variant="secondary" className="w-full">
                  Re-evaluar
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <Link href={`/life-areas/${area.id}/quiz`}>
            <Button className="w-full" variant="default">
              <PlayCircle className="w-4 h-4 mr-2" />
              Comenzar Evaluación
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
};

export default LifeAreaCard;



