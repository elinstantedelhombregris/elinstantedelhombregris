import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ActivitySection } from '../sections/ActivitySection';
import { BadgesSection } from '../sections/BadgesSection';
import { HeaderSection } from '../sections/HeaderSection';

import type { GamificationMe } from '~/lib/queries/gamification';

const insignia = (slug: string, tier: string) => ({
  slug,
  title: slug,
  description: slug,
  tier,
  iconUrl: null,
  earnedAt: '2026-10-01T00:00:00Z',
});

const DATOS: GamificationMe = {
  xp: 250,
  level: 2,
  streakDays: 5,
  longestStreakDays: 12,
  xpIntoLevel: 150,
  xpForCurrent: 100,
  xpForNext: 300,
  badges: [
    insignia('primera', 'bronze'),
    insignia('segunda', 'silver'),
    insignia('tercera', 'gold'),
    insignia('cuarta', 'platinum'),
  ],
  recentActivity: [
    {
      id: 1,
      kind: 'goal_completed',
      xpAwarded: 20,
      activityDate: '2026-10-01',
      createdAt: new Date().toISOString(),
      payload: null,
    },
  ],
  inProgressChallenges: [],
};

describe('Mi perfil en papel', () => {
  it('las tres tarjetas son de papel: crudo con borde de tinta, sin vidrio', () => {
    const { container } = render(
      <>
        <HeaderSection data={DATOS} displayName="Ana Pérez" />
        <BadgesSection badges={DATOS.badges} />
        <ActivitySection items={DATOS.recentActivity} />
      </>,
    );
    const tarjetas = container.querySelectorAll('section');
    expect(tarjetas).toHaveLength(3);
    for (const tarjeta of tarjetas) {
      expect(tarjeta).toHaveClass('bg-papel-crudo', 'border-tinta');
    }
    expect(container.innerHTML).not.toMatch(
      /white\/|iris-violet|text-muted-foreground|font-serif|rounded-/,
    );
  });

  it('los niveles de insignia usan colores que se leen sobre papel', () => {
    const { container } = render(<BadgesSection badges={DATOS.badges} />);
    const iconos = [...container.querySelectorAll('svg')].map((svg) => svg.getAttribute('class'));
    expect(iconos).toHaveLength(4);
    for (const clase of iconos) {
      // Los tonos claros del tema oscuro (slate-300, yellow-300, cyan-200) dan ~1,5:1 sobre crudo.
      expect(clase).not.toMatch(/slate-|yellow-|cyan-|amber-/);
    }
    expect(new Set(iconos).size).toBe(4);
  });
});
