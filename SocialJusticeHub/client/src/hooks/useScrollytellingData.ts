import { useMemo } from 'react';
import { useConvergenceAnalysis } from '@/hooks/useConvergenceAnalysis';
import { useTerritoryPulse } from '@/hooks/useTerritoryPulse';

// ─── Types ───

export interface ScrollStep {
  id: number;
  title: string;
  description: string;
}

export interface ScrollytellingData {
  steps: ScrollStep[];
  totalContributions: number;
  convergencePercentage: number;
  topThemes: Array<{ label: string; convergenceCount: number; totalHits: number }>;
  territories: Array<{ location: string; totalCount: number; dominantType: string }>;
  momentum: { changePercent: number; isGrowing: boolean; thisWeek: number };
  isLoading: boolean;
}

// ─── Hook ───

export const useScrollytellingData = (): ScrollytellingData => {
  const {
    convergencePercentage,
    totalContributions,
    themeCards,
    isLoading: convergenceLoading,
  } = useConvergenceAnalysis();

  const {
    termometro,
    momentum,
    isLoading: pulseLoading,
  } = useTerritoryPulse();

  const isLoading = convergenceLoading || pulseLoading;

  const topThemes = useMemo(
    () =>
      themeCards.map((card) => ({
        label: card.label,
        convergenceCount: card.convergenceCount,
        totalHits: card.totalHits,
      })),
    [themeCards],
  );

  const territories = useMemo(
    () =>
      termometro.territories.map((t) => ({
        location: t.location,
        totalCount: t.totalCount,
        dominantType: t.dominantType,
      })),
    [termometro.territories],
  );

  const topThemeLabel = topThemes.length > 0 ? topThemes[0].label : 'temas compartidos';

  const steps = useMemo<ScrollStep[]>(
    () => [
      {
        id: 1,
        title: `${totalContributions} voces cargaron su verdad`,
        description:
          'Cada sueño, cada valor, cada necesidad y cada grito de ¡BASTA! que se declara aca se suma al pulso colectivo. No es una encuesta — es un espejo de lo que la gente realmente quiere.',
      },
      {
        id: 2,
        title: `El ${convergencePercentage}% converge en ${topThemeLabel}`,
        description:
          'Cuando personas que no se conocen dicen lo mismo con palabras distintas, eso no es coincidencia — es mandato popular. Mirá donde se cruzan los sueños, los valores y las necesidades.',
      },
      {
        id: 3,
        title: 'Territorios que sueñan lo mismo',
        description:
          'De Ushuaia a La Quiaca, los territorios hablan. Cada punto en el mapa es una voz que se planta y dice: esto es lo que necesitamos acá. Mirá qué piden, qué ofrecen, qué rechazan.',
      },
      {
        id: 4,
        title: 'El pulso crece',
        description: momentum.isGrowing
          ? `Esta semana se sumaron ${momentum.thisWeek} voces nuevas — un ${momentum.changePercent}% más que la semana pasada. El movimiento no para.`
          : momentum.thisWeek > 0
            ? `Esta semana se sumaron ${momentum.thisWeek} voces. Cada declaración cuenta — sumá la tuya.`
            : 'El pulso espera tu voz. Sé el primero en declarar esta semana.',
      },
    ],
    [totalContributions, convergencePercentage, topThemeLabel, momentum],
  );

  return {
    steps,
    totalContributions,
    convergencePercentage,
    topThemes,
    territories,
    momentum: {
      changePercent: momentum.changePercent,
      isGrowing: momentum.isGrowing,
      thisWeek: momentum.thisWeek,
    },
    isLoading,
  };
};
