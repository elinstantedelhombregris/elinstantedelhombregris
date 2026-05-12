import { z } from 'zod';

export const leaderboardQuerySchema = z.object({
  period: z.enum(['weekly', 'all_time']).default('weekly'),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const challengeAdvanceSchema = z.object({
  orderIndex: z.number().int().min(0),
});
