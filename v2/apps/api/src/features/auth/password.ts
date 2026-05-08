/**
 * Password hashing helper.
 *
 * Single source of truth for the cost factor and the algorithm choice.
 * Cost 12 ≈ 250ms on a modern CPU — slow enough to deter brute force,
 * fast enough not to wreck the request budget.
 */
import bcrypt from 'bcryptjs';

const COST = 12;

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, COST);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
