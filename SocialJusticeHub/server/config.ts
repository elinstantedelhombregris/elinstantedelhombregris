import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface Config {
  // Database
  database: {
    url: string;
  };

  // JWT
  jwt: {
    secret: string;
    expiresIn: string;
    refreshExpiresIn: string;
  };

  // Security
  security: {
    bcryptRounds: number;
    rateLimitWindowMs: number;
    rateLimitMaxRequests: number;
    loginRateLimitMax: number;
    loginRateLimitWindowMs: number;
  };

  // CORS
  cors: {
    origin: string;
    credentials: boolean;
  };

  // Server
  server: {
    port: number;
    nodeEnv: string;
  };

  // Session
  session: {
    secret: string;
    cookieSecure: boolean;
    cookieHttpOnly: boolean;
    cookieMaxAge: number;
  };

  // AI Coaching
  ai: {
    anthropicApiKey: string | null;
    model: string;
    maxTokens: number;
    enabled: boolean;
    groqApiKey: string | null;
    groqModel: string;
    groqEnabled: boolean;
  };
}

function isProductionLikeEnv() {
  const nodeEnv = process.env.NODE_ENV || 'development';
  return nodeEnv === 'production' || Boolean(process.env.VERCEL);
}

function assertStrongSecret(envKey: 'JWT_SECRET' | 'SESSION_SECRET') {
  const current = process.env[envKey];
  if (!current || current.length < 32) {
    throw new Error(
      `[config] ${envKey} is required and must be at least 32 characters. ` +
      `Set it in the deployment environment before booting.`
    );
  }
}

function validateConfig(): Config {
  const requiredEnvVars = [
    'JWT_SECRET',
    'SESSION_SECRET'
  ];
  
  for (const varName of requiredEnvVars) {
    assertStrongSecret(varName as 'JWT_SECRET' | 'SESSION_SECRET');
  }

  const defaultCorsOrigin = isProductionLikeEnv()
    ? (process.env.CORS_ORIGIN || 'https://elinstantedelhombregris.com')
    : 'http://localhost:5173';
  
  return {
    database: {
      url: process.env.DATABASE_URL || './local.db'
    },
    
    jwt: {
      secret: process.env.JWT_SECRET!,
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
    },
    
    security: {
      bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
      rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
      rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
      loginRateLimitMax: parseInt(process.env.LOGIN_RATE_LIMIT_MAX || '5'),
      loginRateLimitWindowMs: parseInt(process.env.LOGIN_RATE_LIMIT_WINDOW_MS || '900000') // 15 minutes
    },
    
    cors: {
      origin: process.env.CORS_ORIGIN || defaultCorsOrigin,
      credentials: process.env.CORS_CREDENTIALS !== 'false' // Default to true unless explicitly set to false
    },
    
    server: {
      port: parseInt(process.env.PORT || '5000'),
      nodeEnv: process.env.NODE_ENV || 'development'
    },
    
    session: {
      secret: process.env.SESSION_SECRET!,
      cookieSecure: process.env.SESSION_COOKIE_SECURE === 'true',
      cookieHttpOnly: process.env.SESSION_COOKIE_HTTP_ONLY !== 'false',
      cookieMaxAge: parseInt(process.env.SESSION_COOKIE_MAX_AGE || '86400000') // 24 hours
    },

    ai: {
      anthropicApiKey: process.env.ANTHROPIC_API_KEY || null,
      model: process.env.AI_MODEL || 'claude-sonnet-4-20250514',
      maxTokens: parseInt(process.env.AI_MAX_TOKENS || '512'),
      enabled: !!process.env.ANTHROPIC_API_KEY,
      groqApiKey: process.env.GROQ_API_KEY || null,
      groqModel: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      groqEnabled: !!process.env.GROQ_API_KEY,
    }
  };
}

export const config = validateConfig();
export type { Config };
