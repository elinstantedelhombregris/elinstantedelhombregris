import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import { config } from './config';

// Types
export interface AuthUser {
  id: number;
  username: string;
  email: string;
  name: string;
  location?: string | null;
  avatarUrl?: string | null;
}

export interface JWTPayload {
  userId: number;
  username: string;
  email: string;
  type: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

export interface AuthRequest extends Request {
  user?: JWTPayload;
}

// Password utilities
export class PasswordManager {
  static async hash(password: string): Promise<string> {
    return await bcrypt.hash(password, config.security.bcryptRounds);
  }
  
  static async verify(password: string, storedPassword: string): Promise<boolean> {
    if (typeof storedPassword !== 'string' || storedPassword.trim() === '') {
      return false;
    }

    const isBcryptHash = /^\$2[aby]\$\d{2}\$/.test(storedPassword);

    if (!isBcryptHash) {
      // Legacy plaintext password fallback
      return password === storedPassword;
    }

    try {
      return await bcrypt.compare(password, storedPassword);
    } catch (error) {
      console.error('[PasswordManager.verify] Failed to verify bcrypt hash:', error);
      return false;
    }
  }
  
  static validate(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// JWT utilities
export class TokenManager {
  static generateAccessToken(user: AuthUser): string {
    const payload: JWTPayload = {
      userId: user.id,
      username: user.username,
      email: user.email,
      type: 'access'
    };
    
    return jwt.sign(payload, config.jwt.secret, { 
      expiresIn: config.jwt.expiresIn,
      issuer: 'basta-app',
      audience: 'basta-users'
    } as jwt.SignOptions);
  }
  
  static generateRefreshToken(user: AuthUser): string {
    const payload: JWTPayload = {
      userId: user.id,
      username: user.username,
      email: user.email,
      type: 'refresh'
    };
    
    return jwt.sign(payload, config.jwt.secret, { 
      expiresIn: config.jwt.refreshExpiresIn,
      issuer: 'basta-app',
      audience: 'basta-users'
    } as jwt.SignOptions);
  }
  
  static verifyToken(token: string): JWTPayload | null {
    try {
      const payload = jwt.verify(token, config.jwt.secret, {
        issuer: 'basta-app',
        audience: 'basta-users'
      }) as JWTPayload;
      
      return payload;
    } catch (error) {
      return null;
    }
  }
  
  static extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader) return null;
    
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }
    
    return parts[1];
  }
}

// Rate limiting for authentication
export class RateLimiter {
  private static attempts = new Map<string, { count: number; lastAttempt: number; lockedUntil?: number }>();
  
  static checkLimit(identifier: string, maxAttempts: number = config.security.loginRateLimitMax, windowMs: number = config.security.loginRateLimitWindowMs): boolean {
    const now = Date.now();
    const key = identifier;
    const attempts = this.attempts.get(key);
    
    // Clean up expired entries
    this.cleanup();
    
    if (!attempts) {
      this.attempts.set(key, { count: 1, lastAttempt: now });
      return true;
    }
    
    // Check if still locked
    if (attempts.lockedUntil && now < attempts.lockedUntil) {
      return false;
    }
    
    // Reset if window has passed
    if (now - attempts.lastAttempt > windowMs) {
      this.attempts.set(key, { count: 1, lastAttempt: now });
      return true;
    }
    
    // Check if limit exceeded
    if (attempts.count >= maxAttempts) {
      // Lock for the window period
      attempts.lockedUntil = now + windowMs;
      return false;
    }
    
    // Increment attempts
    attempts.count++;
    attempts.lastAttempt = now;
    return true;
  }
  
  static resetLimit(identifier: string): void {
    this.attempts.delete(identifier);
  }
  
  private static cleanup(): void {
    const now = Date.now();
    const entries = Array.from(this.attempts.entries());
    for (const [key, attempts] of entries) {
      if (attempts.lockedUntil && now > attempts.lockedUntil) {
        this.attempts.delete(key);
      }
    }
  }
  
  static getRemainingTime(identifier: string): number {
    const attempts = this.attempts.get(identifier);
    if (!attempts || !attempts.lockedUntil) return 0;
    
    const remaining = attempts.lockedUntil - Date.now();
    return Math.max(0, remaining);
  }
}

// Middleware
export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): void {
  const token = TokenManager.extractTokenFromHeader(req.headers.authorization);
  const url = req.url || req.path || 'unknown';
  
  if (!token) {
    console.log('[Auth] No token provided for:', url);
    res.status(401).json({ 
      message: 'Access token required',
      code: 'MISSING_TOKEN'
    });
    return;
  }
  
  const payload = TokenManager.verifyToken(token);
  if (!payload || payload.type !== 'access') {
    console.log('[Auth] Token verification failed for:', url, { 
      hasPayload: !!payload, 
      tokenType: payload?.type,
      payload: payload 
    });
    res.status(403).json({ 
      message: 'Invalid or expired token',
      code: 'INVALID_TOKEN'
    });
    return;
  }
  
  console.log('[Auth] Token verified successfully for:', url, 'userId:', payload.userId);
  req.user = payload;
  next();
}

export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const token = TokenManager.extractTokenFromHeader(req.headers.authorization);
  
  if (token) {
    const payload = TokenManager.verifyToken(token);
    if (payload && payload.type === 'access') {
      req.user = payload;
    }
  }
  
  next();
}

// Error handling
export class AuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 401
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

// Utility functions
export function createAuthResponse(user: AuthUser) {
  const accessToken = TokenManager.generateAccessToken(user);
  const refreshToken = TokenManager.generateRefreshToken(user);
  
  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      location: user.location,
      avatarUrl: user.avatarUrl ?? null,
      emailVerified: (user as any).emailVerified ?? false,
      onboardingCompleted: (user as any).onboardingCompleted ?? false,
      createdAt: (user as any).createdAt ?? null,
      dataShareOptOut: (user as any).dataShareOptOut ?? false,
    },
    tokens: {
      accessToken,
      refreshToken
    }
  };
}
