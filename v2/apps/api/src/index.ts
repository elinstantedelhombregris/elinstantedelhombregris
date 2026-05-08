/**
 * Production entry point. Binds the Express app to a port.
 *
 * `./load-env.js` MUST be the first import — it has the side effect of
 * pulling .env values into process.env before any module reads config.
 */
import './load-env.js';

import { createApp } from './app.js';
import { getConfig } from './lib/config.js';
import { logger } from './lib/logger.js';

const config = getConfig();
const app = createApp();

const server = app.listen(config.api.port, () => {
  logger.info({ port: config.api.port, env: config.env }, 'API listening');
});

function shutdown(signal: string): void {
  logger.info({ signal }, 'Shutdown requested');
  server.close((err) => {
    if (err) {
      logger.error({ err }, 'Error during shutdown');
      process.exit(1);
    }
    logger.info('Shutdown complete');
    process.exit(0);
  });
  // Hard-exit safety net.
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => { shutdown('SIGTERM'); });
process.on('SIGINT', () => { shutdown('SIGINT'); });
