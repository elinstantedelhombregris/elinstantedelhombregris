import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { HeaderSection } from '../sections/HeaderSection';

import type { GamificationMe } from '~/lib/queries/gamification';

const FIXTURE: GamificationMe = {
  xp: 250,
  level: 2,
  streakDays: 5,
  longestStreakDays: 12,
  xpIntoLevel: 150,
  xpForCurrent: 100,
  xpForNext: 300,
  badges: [],
  recentActivity: [],
  inProgressChallenges: [],
};

describe('HeaderSection', () => {
  it('shows level, XP, and streak', () => {
    render(<HeaderSection data={FIXTURE} displayName="Juana Pérez" />);
    expect(screen.getByText(/Hola, Juana/)).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('250 XP')).toBeInTheDocument();
    expect(screen.getByText(/Racha de 5 días/)).toBeInTheDocument();
  });
});
