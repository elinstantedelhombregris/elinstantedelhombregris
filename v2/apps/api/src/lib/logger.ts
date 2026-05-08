/**
 * Centralized logger.
 *
 * No `console.*` is permitted in app code (enforced by ESLint
 * `no-console: error`). All output flows through this module.
 *
 * Production: pino JSON to stdout, parseable by log aggregators.
 * Development: pino-pretty colored output, with request IDs.
 */
import pino from 'pino';

import { getConfig } from './config.js';

const config = getConfig();

const isDevelopment = config.env === 'development';

export const logger = pino({
  level: config.log.level,
  base: { service: 'api' },
  redact: {
    paths: ['password', 'token', 'accessToken', 'refreshToken', 'jwt', 'secret', '*.password', '*.token'],
    censor: '[REDACTED]',
  },
  ...(isDevelopment
    ? {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss',
            ignore: 'pid,hostname,service',
          },
        },
      }
    : {}),
});

export type Logger = typeof logger;
