/**
 * Module augmentation for Express. Centralizes `res.locals` typing so
 * we don't sprinkle `as string` casts across the codebase.
 */
declare global {
  namespace Express {
    interface Locals {
      requestId: string;
    }
  }
}

export {};
