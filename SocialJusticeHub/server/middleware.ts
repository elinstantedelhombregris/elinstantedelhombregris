import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import { config } from './config';

// Security headers middleware
export function securityHeaders() {
  // Get backend origin for CSP connectSrc
  const backendOrigin = `http://localhost:${config.server.port}`;
  const frontendOrigin = config.cors.origin.split(',')[0].trim();
  
  // In development, we need to allow unsafe-inline for Vite HMR and React Fast Refresh
  const isDevelopment = config.server.nodeEnv === 'development';
  const connectSrc = [
    "'self'",
    backendOrigin,
    "http://localhost:*",
    "ws://localhost:*",
    "https://cdn.jsdelivr.net",
    "https://unpkg.com",
  ];

  // Only add an explicit frontend origin if it's a concrete origin (not wildcard)
  if (frontendOrigin && frontendOrigin !== '*') {
    connectSrc.splice(2, 0, frontendOrigin);
  }
  
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://unpkg.com"],
        // Always allow unpkg.com for Leaflet in both dev and production
        scriptSrc: isDevelopment 
          ? ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://unpkg.com"] // Required for Vite HMR in dev + Leaflet
          : ["'self'", "https://unpkg.com"], // Allow Leaflet in production
        scriptSrcElem: isDevelopment
          ? ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://unpkg.com", "https://www.googletagmanager.com", "https://www.google-analytics.com", "https://va.vercel-scripts.com"] // Explicit script-src-elem for <script> tags
          : ["'self'", "https://unpkg.com", "https://www.googletagmanager.com", "https://www.google-analytics.com", "https://va.vercel-scripts.com"], // Allow Leaflet + analytics in production
        styleSrcElem: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://unpkg.com"], // Explicit style-src-elem for <style> and <link> tags
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc,
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        workerSrc: ["'self'", "blob:", "https://unpkg.com"], // Allow blob URLs for workers (troika-worker-utils) and unpkg
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  });
}

// CORS configuration
export function corsConfig() {
  // Parse allowed origins (support comma-separated list)
  const allowedOrigins = config.cors.origin.split(',').map(o => o.trim());
  
  // Use function for dynamic origin checking to support multiple origins
  const originFunction = (
    origin: string | undefined, 
    callback: (err: Error | null, origin?: boolean | string | string[]) => void
  ) => {
    // Allow requests with no origin (like mobile apps, Postman, or same-origin requests)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, origin);
    }
    
    // Reject origin not in allowed list
    callback(new Error('Not allowed by CORS'));
  };

  return cors({
    origin: allowedOrigins.length === 1 && allowedOrigins[0] !== '*' 
      ? allowedOrigins[0] 
      : originFunction,
    credentials: config.cors.credentials,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });
}

// General rate limiting - effectively disabled in development
export const generalRateLimit = (() => {
  // In development, create a no-op middleware that always passes through
  // Auth routes have their own rate limiter applied directly
  if (config.server.nodeEnv === 'development') {
    return (req: Request, res: Response, next: NextFunction) => {
      // Always skip rate limiting in development
      return next();
    };
  }
  
  // Production rate limiter
  return rateLimit({
    windowMs: config.security.rateLimitWindowMs,
    max: config.security.rateLimitMaxRequests,
    message: {
      error: 'Too many requests',
      message: 'Demasiadas solicitudes. Intenta nuevamente más tarde.',
      retryAfter: Math.ceil(config.security.rateLimitWindowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip rate limiting for non-API routes
      if (!req.path.startsWith('/api')) {
        return true;
      }
      // Skip rate limiting for health checks
      return req.path === '/api/health';
    },
    handler: (req: Request, res: Response) => {
      res.status(429).json({
        error: 'Too many requests',
        message: 'Demasiadas solicitudes. Intenta nuevamente más tarde.',
        retryAfter: Math.ceil(config.security.rateLimitWindowMs / 1000)
      });
    }
  });
})();

// Strict rate limiting for authentication endpoints
export const authRateLimit = rateLimit({
  windowMs: config.security.loginRateLimitWindowMs,
  max: config.security.loginRateLimitMax,
  message: {
    error: 'Too many authentication attempts',
    message: 'Demasiados intentos de autenticación. Intenta nuevamente más tarde.',
    retryAfter: Math.ceil(config.security.loginRateLimitWindowMs / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'Too many authentication attempts',
      message: 'Demasiados intentos de autenticación. Intenta nuevamente más tarde.',
      retryAfter: Math.ceil(config.security.loginRateLimitWindowMs / 1000)
    });
  }
});

// Read-rate limiting for unauthenticated public list endpoints (60 req/min/IP)
// No-op in development.
export const publicReadRateLimit = (() => {
  if (config.server.nodeEnv === 'development') {
    return (_req: Request, _res: Response, next: NextFunction) => next();
  }
  return rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req: Request, res: Response) => {
      res.status(429).json({
        error: 'Too many requests',
        message: 'Demasiadas solicitudes. Esperá un momento.',
      });
    },
  });
})();

// Request logging middleware
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const originalSend = res.send;
  
  res.send = function(data) {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      timestamp: new Date().toISOString()
    };
    
    // Log only in development or for errors
    if (config.server.nodeEnv === 'development' || res.statusCode >= 400) {
      console.log(JSON.stringify(logData));
    }
    
    return originalSend.call(this, data);
  };
  
  next();
}

// Error handling middleware
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Error:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });

  // Don't leak error details in production
  if (config.server.nodeEnv === 'production') {
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Ha ocurrido un error interno del servidor'
    });
  } else {
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
      stack: error.stack
    });
  }
}

// 404 handler
export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    error: 'Not Found',
    message: `Ruta no encontrada: ${req.method} ${req.url}`
  });
}

// Request size limiter
export function requestSizeLimiter(maxSize: string = '10mb') {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.get('content-length') || '0');
    const maxSizeBytes = parseSize(maxSize);
    
    if (contentLength > maxSizeBytes) {
      res.status(413).json({
        error: 'Payload Too Large',
        message: `El tamaño de la solicitud excede el límite de ${maxSize}`
      });
      return;
    }
    
    next();
  };
}

// Helper function to parse size strings like "10mb"
function parseSize(size: string): number {
  const units: { [key: string]: number } = {
    'b': 1,
    'kb': 1024,
    'mb': 1024 * 1024,
    'gb': 1024 * 1024 * 1024
  };
  
  const match = size.toLowerCase().match(/^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb)?$/);
  if (!match) return 0;
  
  const value = parseFloat(match[1]);
  const unit = match[2] || 'b';
  
  return value * (units[unit] || 1);
}

// Input sanitization middleware
export function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  try {
    const sanitize = (obj: any): any => {
      if (typeof obj === 'string') {
        return obj.trim().replace(/[<>]/g, '');
      }
      if (Array.isArray(obj)) {
        return obj.map(sanitize);
      }
      if (obj && typeof obj === 'object') {
        const sanitized: any = {};
        for (const [key, value] of Object.entries(obj)) {
          sanitized[key] = sanitize(value);
        }
        return sanitized;
      }
      return obj;
    };
    
    if (req.body) {
      req.body = sanitize(req.body);
    }
    
    if (req.query) {
      req.query = sanitize(req.query);
    }
    
    next();
  } catch (error) {
    console.error('[SanitizeInput] Error:', error);
    next(); // Continue even if sanitization fails
  }
}
