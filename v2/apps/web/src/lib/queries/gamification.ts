import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '~/lib/api';
import { readCsrfToken } from '~/lib/auth/csrf';

export interface GamificationMe {
  xp: number;
  level: number;
  streakDays: number;
  longestStreakDays: number;
  xpIntoLevel: number;
  xpForCurrent: number;
  xpForNext: number;
  badges: {
    slug: string;
    title: string;
    description: string;
    tier: string;
    iconUrl: string | null;
    earnedAt: string;
  }[];
  recentActivity: {
    id: number;
    kind: string;
    xpAwarded: number;
    activityDate: string;
    createdAt: string;
    payload: unknown;
  }[];
  inProgressChallenges: {
    progressId: number;
    challengeId: number;
    slug: string;
    title: string;
    description: string;
    cadence: string;
    xpReward: number;
    stepsCompleted: unknown;
    status: string;
  }[];
}

export interface BadgeEntry {
  id: number;
  slug: string;
  title: string;
  description: string;
  tier: string;
  iconUrl: string | null;
}

export interface LeaderboardRow {
  rank: number;
  xp: number;
  userId: number;
  displayName: string;
}

export interface ChallengeEntry {
  id: number;
  slug: string;
  title: string;
  description: string;
  cadence: 'daily' | 'weekly' | 'monthly' | 'one_time';
  xpReward: number;
  badgeId: number | null;
  steps: { id: number; title: string; description: string | null; orderIndex: number; xpReward: number }[];
  progress: { stepsCompleted: unknown; status: string } | null;
}

export function useGamificationMe(enabled = true) {
  return useQuery({
    queryKey: ['gamification', 'me'],
    queryFn: () => api.get<GamificationMe>('/api/gamification/me'),
    enabled,
    staleTime: 60_000,
  });
}

export function useBadges() {
  return useQuery({
    queryKey: ['gamification', 'badges'],
    queryFn: () => api.get<{ badges: BadgeEntry[] }>('/api/gamification/badges'),
    staleTime: 5 * 60_000,
  });
}

export function useChallenges() {
  return useQuery({
    queryKey: ['gamification', 'challenges'],
    queryFn: () => api.get<{ challenges: ChallengeEntry[] }>('/api/gamification/challenges'),
    staleTime: 60_000,
  });
}

export function useLeaderboard(period: 'weekly' | 'all_time') {
  return useQuery({
    queryKey: ['gamification', 'leaderboard', period],
    queryFn: () =>
      api.get<{ period: string; periodStart: string | null; rows: LeaderboardRow[] }>(
        `/api/gamification/leaderboard?period=${period}`,
      ),
    staleTime: 5 * 60_000,
  });
}

export function useStartChallenge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (slug: string) =>
      api.post<{ progress: { id: number; status: string } }>(
        `/api/gamification/challenges/${slug}/start`,
        {},
        { csrfToken: readCsrfToken() },
      ),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['gamification', 'challenges'] });
      void qc.invalidateQueries({ queryKey: ['gamification', 'me'] });
    },
  });
}

export function useAdvanceChallenge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { slug: string; orderIndex: number }) =>
      api.post<{ progress: { id: number; status: string }; completed: boolean }>(
        `/api/gamification/challenges/${input.slug}/advance`,
        { orderIndex: input.orderIndex },
        { csrfToken: readCsrfToken() },
      ),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['gamification', 'challenges'] });
      void qc.invalidateQueries({ queryKey: ['gamification', 'me'] });
    },
  });
}
