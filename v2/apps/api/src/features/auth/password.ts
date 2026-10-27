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

/**
 * Una cuenta que entra sólo con un proveedor externo no tiene contraseña (ADR 0012): ninguna
 * coincide. Responder igual que a una contraseña equivocada no revela nada nuevo, porque el
 * ingreso ya contesta rápido cuando la cuenta no existe.
 */
export function verifyPassword(plain: string, hash: string | null): Promise<boolean> {
  if (hash === null) return Promise.resolve(false);
  return bcrypt.compare(plain, hash);
}
