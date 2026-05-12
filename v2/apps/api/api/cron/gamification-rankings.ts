/**
 * Vercel cron entry (or any HTTP-triggered cron) for the ranking job.
 * The actual schedule lives in deploy config; this file is just the
 * handler the platform invokes.
 */
import { runRankingCron } from '../../src/features/gamification/cron.js';
import { logger } from '../../src/lib/logger.js';

export default async function handler(): Promise<void> {
  try {
    const result = await runRankingCron();
    logger.info({ result }, 'gamification-rankings: ok');
  } catch (err) {
    logger.error({ err }, 'gamification-rankings: failed');
    throw err;
  }
}
