// Utilidad de interpretacion de scores para Areas de Vida
// Funciones puras que generan texto interpretativo a partir de datos numericos

export interface ScoreVerdict {
  label: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export interface GapAnalysis {
  severity: 'equilibrium' | 'mild' | 'moderate' | 'significant' | 'critical';
  message: string;
  priority: number; // 1-5, 5 = highest priority
  color: string;
}

export interface SubcategoryScore {
  name: string;
  subcategoryId: number;
  currentScore: number;
  desiredScore: number;
  gap: number;
}

export interface ActionRecommendation {
  actionId: number;
  title: string;
  description: string;
  difficulty: string;
  xpReward: number;
  seedReward: number;
  estimatedDuration: string;
  relevanceScore: number;
  reason: string;
}

export interface ComparisonDelta {
  direction: 'up' | 'down' | 'stable';
  delta: number;
  message: string;
  color: string;
}

export function getScoreVerdict(score: number): ScoreVerdict {
  if (score >= 90) return {
    label: 'Optimo',
    description: 'Estas en un nivel excelente. Mantene este ritmo y segui perfeccionando.',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
  };
  if (score >= 70) return {
    label: 'Estable',
    description: 'Tenes una base solida. Hay oportunidades puntuales para seguir creciendo.',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
  };
  if (score >= 50) return {
    label: 'En desarrollo',
    description: 'Estas en camino. Identificar las brechas clave va a acelerar tu progreso.',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
  };
  if (score >= 30) return {
    label: 'Inestable',
    description: 'Esta area necesita atencion. Pequenas acciones consistentes pueden generar grandes cambios.',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20',
  };
  return {
    label: 'Critico',
    description: 'Esta area requiere atencion urgente. Empeza con una accion simple y construi desde ahi.',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
  };
}

export function getGapAnalysis(current: number, desired: number): GapAnalysis {
  const gap = desired - current;

  if (gap <= 0) return {
    severity: 'equilibrium',
    message: 'Objetivo alcanzado o superado',
    priority: 1,
    color: 'text-emerald-400',
  };
  if (gap <= 10) return {
    severity: 'mild',
    message: 'Cerca del equilibrio, ajustes menores',
    priority: 2,
    color: 'text-blue-400',
  };
  if (gap <= 25) return {
    severity: 'moderate',
    message: 'Hay espacio significativo para crecer',
    priority: 3,
    color: 'text-amber-400',
  };
  if (gap <= 40) return {
    severity: 'significant',
    message: 'Brecha importante entre realidad y aspiracion',
    priority: 4,
    color: 'text-orange-400',
  };
  return {
    severity: 'critical',
    message: 'Prioridad alta: gran distancia entre donde estas y donde queres estar',
    priority: 5,
    color: 'text-red-400',
  };
}

export function getGapMicroInsight(gap: number): string {
  if (gap <= 0) return 'Estas en equilibrio en esta dimension';
  if (gap <= 1) return 'Estas muy cerca de tu ideal';
  if (gap <= 2) return 'Hay un pequeno margen de mejora';
  if (gap <= 4) return 'Hay espacio para crecer';
  if (gap <= 6) return 'Una oportunidad significativa de mejora';
  if (gap <= 8) return 'Prioridad alta: gran brecha entre realidad y aspiracion';
  return 'Requiere atencion urgente';
}

export function getScoreLabel(score: number): string {
  if (score === 0) return 'Nulo';
  if (score <= 2) return 'Muy bajo';
  if (score <= 4) return 'Bajo';
  if (score <= 5) return 'Moderado';
  if (score <= 7) return 'Bueno';
  if (score <= 9) return 'Muy bueno';
  return 'Excelente';
}

export function getAreaNarrative(areaName: string, subcategoryScores: SubcategoryScore[]): string {
  if (subcategoryScores.length === 0) return '';

  const avgCurrent = subcategoryScores.reduce((sum, s) => sum + s.currentScore, 0) / subcategoryScores.length;
  const avgDesired = subcategoryScores.reduce((sum, s) => sum + s.desiredScore, 0) / subcategoryScores.length;
  const avgGap = avgDesired - avgCurrent;

  const strengths = subcategoryScores.filter(s => s.gap <= 10 && s.currentScore >= 70);
  const weaknesses = subcategoryScores.filter(s => s.gap > 25).sort((a, b) => b.gap - a.gap);
  const balanced = subcategoryScores.filter(s => s.currentScore >= s.desiredScore);

  let narrative = `Tu nivel general en ${areaName} esta en ${Math.round(avgCurrent)} puntos`;

  if (avgGap <= 5) {
    narrative += ', muy cerca de tu ideal. ';
  } else if (avgGap <= 15) {
    narrative += '. Tenes una base solida con oportunidades puntuales de mejora. ';
  } else if (avgGap <= 30) {
    narrative += '. Hay aspectos importantes donde tu realidad y tus aspiraciones no coinciden. ';
  } else {
    narrative += '. Existe una brecha considerable entre donde estas y donde queres estar. ';
  }

  if (strengths.length > 0) {
    narrative += `Tus fortalezas estan en ${strengths.map(s => s.name).join(' y ')}. `;
  }

  if (weaknesses.length > 0) {
    const topWeakness = weaknesses[0];
    narrative += `La mayor oportunidad de crecimiento esta en ${topWeakness.name} (brecha de ${topWeakness.gap} puntos). `;
  }

  if (balanced.length === subcategoryScores.length) {
    narrative += 'Has alcanzado o superado todos tus objetivos en esta area.';
  } else if (balanced.length > 0) {
    narrative += `Ya alcanzaste tu objetivo en ${balanced.map(s => s.name).join(', ')}.`;
  }

  return narrative;
}

export function getPriorityActions(
  subcategoryScores: SubcategoryScore[],
  availableActions: Array<{
    id: number;
    title: string;
    description: string;
    difficulty: string;
    xpReward: number;
    seedReward: number;
    estimatedDuration: string;
    category?: string;
    subcategoryId?: number;
    userProgress?: { status: string } | null;
  }>
): ActionRecommendation[] {
  const sortedByGap = [...subcategoryScores].sort((a, b) => b.gap - a.gap);
  const uncompletedActions = availableActions.filter(
    a => !a.userProgress || a.userProgress.status === 'not_started'
  );

  const recommendations: ActionRecommendation[] = [];

  for (const subcat of sortedByGap) {
    if (subcat.gap <= 0) continue;

    const matchingActions = uncompletedActions.filter(a =>
      a.subcategoryId === subcat.subcategoryId ||
      (a.category && a.category.toLowerCase().includes(subcat.name.toLowerCase()))
    );

    const appropriateDifficulty = subcat.currentScore < 40 ? 'beginner'
      : subcat.currentScore < 70 ? 'intermediate' : 'advanced';

    for (const action of matchingActions) {
      const difficultyMatch = action.difficulty === appropriateDifficulty ? 2 :
        Math.abs(['beginner', 'intermediate', 'advanced'].indexOf(action.difficulty) -
          ['beginner', 'intermediate', 'advanced'].indexOf(appropriateDifficulty)) <= 1 ? 1 : 0;

      recommendations.push({
        actionId: action.id,
        title: action.title,
        description: action.description,
        difficulty: action.difficulty,
        xpReward: action.xpReward,
        seedReward: action.seedReward,
        estimatedDuration: action.estimatedDuration,
        relevanceScore: subcat.gap * 2 + difficultyMatch * 10 + action.xpReward / 50,
        reason: `Ayuda a cerrar la brecha en ${subcat.name} (${subcat.gap} pts)`,
      });
    }
  }

  // Fallback: if no subcategory matches, add all uncompleted actions with base relevance
  if (recommendations.length === 0) {
    for (const action of uncompletedActions.slice(0, 5)) {
      const highestGap = sortedByGap[0];
      recommendations.push({
        actionId: action.id,
        title: action.title,
        description: action.description,
        difficulty: action.difficulty,
        xpReward: action.xpReward,
        seedReward: action.seedReward,
        estimatedDuration: action.estimatedDuration,
        relevanceScore: action.xpReward / 50,
        reason: highestGap ? `Contribuye a mejorar ${highestGap.name}` : 'Accion recomendada para esta area',
      });
    }
  }

  return recommendations.sort((a, b) => b.relevanceScore - a.relevanceScore);
}

export function getComparisonDelta(current: number, previous: number | null): ComparisonDelta {
  if (previous === null) {
    return { direction: 'stable', delta: 0, message: 'Primera evaluacion', color: 'text-slate-400' };
  }

  const delta = current - previous;

  if (delta > 0) {
    return {
      direction: 'up',
      delta,
      message: `+${delta} pts desde tu ultima evaluacion`,
      color: 'text-emerald-400',
    };
  }
  if (delta < 0) {
    return {
      direction: 'down',
      delta: Math.abs(delta),
      message: `${delta} pts desde tu ultima evaluacion`,
      color: 'text-red-400',
    };
  }
  return {
    direction: 'stable',
    delta: 0,
    message: 'Sin cambios desde tu ultima evaluacion',
    color: 'text-slate-400',
  };
}
