/**
 * Module augmentation for Express. Centralizes `res.locals` and
 * `req.user` typing so we don't sprinkle casts across the codebase.
 */
import type { AuthUser } from '../middleware/auth.js';

declare global {
   
  namespace Express {
    interface Locals {
      requestId: string;
    }
    interface Request {
      user?: AuthUser;
    }
  }
}

export {};
