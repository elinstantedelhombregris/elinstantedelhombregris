/**
 * Environment configuration parsed once at boot.
 *
 * All env access goes through this module. Direct `process.env.X` reads
 * elsewhere are an ESLint failure waiting to happen.
 */
import { z } from 'zod';

const truthy = z
  .union([z.boolean(), z.string()])
  .transform((v) => (typeof v === 'boolean' ? v : ['1', 'true', 'yes', 'on'].includes(v.toLowerCase())));

const ConfigSchema = z.object({
  env: z.enum(['development', 'test', 'production']).default('development'),
  api: z.object({
    port: z.coerce.number().int().positive().default(4000),
    publicUrl: z.string().url().default('http://localhost:4000'),
  }),
  web: z.object({
    publicUrl: z.string().url().default('http://localhost:5173'),
  }),
  database: z.object({
    url: z.string().min(1, 'DATABASE_URL is required'),
    urlUnpooled: z.string().optional(),
  }),
  auth: z.object({
    jwtSecret: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
    sessionSecret: z.string().min(32, 'SESSION_SECRET must be at least 32 characters'),
    cookieDomain: z.string().optional(),
    cookieSecure: truthy.default(false),
    accessTokenTtl: z.string().default('15m'),
    refreshTokenTtl: z.string().default('30d'),
  }),
  cors: z.object({
    origins: z
      .string()
      .default('http://localhost:5173')
      .transform((v) => v.split(',').map((s) => s.trim()).filter(Boolean)),
  }),
  rateLimit: z.object({
    windowMs: z.coerce.number().int().positive().default(60_000),
    maxRequests: z.coerce.number().int().positive().default(120),
  }),
  log: z.object({
    level: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  }),
  admin: z.object({
    /** Comma-separated usernames allowed to use admin-only endpoints
     *  (e.g. blog post creation/edit). Empty = no admins. */
    usernames: z
      .string()
      .default('')
      .transform((v) => v.split(',').map((s) => s.trim()).filter(Boolean)),
  }),
});

export type Config = z.infer<typeof ConfigSchema>;

let cached: Config | undefined;

export function getConfig(): Config {
  if (cached) return cached;

  const parsed = ConfigSchema.safeParse({
    env: process.env.NODE_ENV,
    api: {
      port: process.env.API_PORT,
      publicUrl: process.env.PUBLIC_API_URL,
    },
    web: {
      publicUrl: process.env.PUBLIC_WEB_URL,
    },
    database: {
      url: process.env.DATABASE_URL,
      urlUnpooled: process.env.DATABASE_URL_UNPOOLED,
    },
    auth: {
      jwtSecret: process.env.JWT_SECRET,
      sessionSecret: process.env.SESSION_SECRET,
      cookieDomain: process.env.COOKIE_DOMAIN,
      cookieSecure: process.env.COOKIE_SECURE,
      accessTokenTtl: process.env.ACCESS_TOKEN_TTL,
      refreshTokenTtl: process.env.REFRESH_TOKEN_TTL,
    },
    cors: {
      origins: process.env.CORS_ORIGINS,
    },
    rateLimit: {
      windowMs: process.env.RATE_LIMIT_WINDOW_MS,
      maxRequests: process.env.RATE_LIMIT_MAX_REQUESTS,
    },
    log: {
      level: process.env.LOG_LEVEL,
    },
    admin: {
      usernames: process.env.ADMIN_USERNAMES,
    },
  });

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }

  cached = parsed.data;
  return cached;
}

/**
 * Test-only: reset cached config. Production code must not call this.
 */
export function resetConfig(): void {
  cached = undefined;
}
