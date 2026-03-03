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
}

function validateConfig(): Config {
  const requiredEnvVars = [
    'JWT_SECRET',
    'SESSION_SECRET'
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
  
  // Validate JWT secret strength
  if (process.env.JWT_SECRET!.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }
  
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
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
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
    }
  };
}

export const config = validateConfig();
export type { Config };
