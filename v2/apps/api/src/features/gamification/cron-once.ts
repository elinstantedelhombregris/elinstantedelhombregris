/**
 * CLI entry point — runs the ranking cron once and prints the result.
 *
 * Usage: pnpm --filter @v2/api run rankings:once
 */
import '../../load-env.js';

import { runRankingCron } from './cron.js';

const result = await runRankingCron();
process.stdout.write(JSON.stringify(result) + '\n');
process.exit(0);
