/**
 * Auth domain service.
 *
 * Pure functions over an injected UsersRepository + AuthRepository,
 * so tests can swap in stubs without touching the DB.
 *
 * The service writes one row to `auth_sessions` per refresh token it
 * issues. Refresh = revoke-then-create-new (rotation), so a stolen
 * refresh token only works once before the legitimate user's next
 * refresh invalidates it.
 */
import { randomBytes, randomUUID } from 'node:crypto';


import { getConfig } from '../../lib/config.js';
import { HttpError } from '../../middleware/error-handler.js';

import { hashPassword, verifyPassword } from './password.js';
import { signAccessToken, signRefreshToken } from './tokens.js';

import type { AuthRepository, User, UsersRepository } from '@v2/db';
import type { LoginInput, RegisterInput, UserPublic } from '@v2/shared';

interface SessionFingerprint {
  userAgent?: string | undefined;
  ipAddress?: string | undefined;
}

interface AuthResult {
  user: UserPublic;
  accessToken: string;
  refreshToken: string;
  csrfToken: string;
}

/**
 * Convert a TTL string like "30d" / "15m" to a Date in the future.
 * Mirrors the format jsonwebtoken accepts for SignOptions.expiresIn.
 */
function ttlToFuture(ttl: string): Date {
  const m = /^(\d+)\s*([smhd])$/.exec(ttl.trim());
  if (!m) throw new Error(`Invalid TTL: ${ttl}`);
  const n = Number(m[1]);
  const unit = m[2];
  const seconds = unit === 's' ? n : unit === 'm' ? n * 60 : unit === 'h' ? n * 3600 : n * 86_400;
  return new Date(Date.now() + seconds * 1000);
}

export class AuthService {
  constructor(
    private readonly users: UsersRepository,
    private readonly authRepo: AuthRepository,
  ) {}

  async register(input: RegisterInput, fingerprint: SessionFingerprint = {}): Promise<AuthResult> {
    const existingByEmail = await this.users.findByEmail(input.email);
    if (existingByEmail) {
      throw new HttpError(409, 'EMAIL_TAKEN', 'Ya existe una cuenta con ese email.');
    }
    const existingByUsername = await this.users.findByUsername(input.username);
    if (existingByUsername) {
      throw new HttpError(409, 'USERNAME_TAKEN', 'Ese nombre de usuario ya está en uso.');
    }
    const passwordHash = await hashPassword(input.password);
    const user = await this.users.create({
      username: input.username,
      email: input.email,
      name: input.name,
      passwordHash,
    });
    return this.issueTokens(user, fingerprint);
  }

  async login(input: LoginInput, fingerprint: SessionFingerprint = {}): Promise<AuthResult> {
    const candidate =
      (await this.users.findByEmail(input.identifier)) ?? (await this.users.findByUsername(input.identifier));
    if (!candidate) {
      // Same error for "user not found" vs "wrong password" — don't leak existence.
      throw new HttpError(401, 'INVALID_CREDENTIALS', 'Email o contraseña incorrectos.');
    }
    const ok = await verifyPassword(input.password, candidate.passwordHash);
    if (!ok) {
      throw new HttpError(401, 'INVALID_CREDENTIALS', 'Email o contraseña incorrectos.');
    }
    if (!candidate.isActive) {
      throw new HttpError(401, 'ACCOUNT_INACTIVE', 'Tu cuenta está desactivada.');
    }
    await this.users.recordLogin(candidate.id);
    return this.issueTokens(candidate, fingerprint);
  }

  /**
   * Internal: variant of `login` that skips the password check. Used
   * by the route handler when the password has already been verified
   * (e.g. after the 2FA branching logic). Keeps issueTokens private.
   */
  async loginAlreadyVerified(userId: number, fingerprint: SessionFingerprint = {}): Promise<AuthResult> {
    const user = await this.users.findById(userId);
    if (!user) throw new HttpError(401, 'INVALID_CREDENTIALS', 'Usuario no encontrado.');
    if (!user.isActive) throw new HttpError(401, 'ACCOUNT_INACTIVE', 'Tu cuenta está desactivada.');
    await this.users.recordLogin(user.id);
    return this.issueTokens(user, fingerprint);
  }

  /**
   * Rotate a refresh token. Verifies the incoming jti is still active,
   * revokes it, and issues a new pair. Throws if the jti was already
   * revoked — that's a strong signal of refresh-token theft.
   */
  async rotate(oldJti: string, fingerprint: SessionFingerprint = {}): Promise<AuthResult> {
    const session = await this.authRepo.findActiveSessionByJti(oldJti);
    if (!session) {
      // Token was revoked or expired. Possible theft: revoke every other
      // session for this user (we don't know who they are, since the JWT
      // verification already happened upstream — caller provides oldJti
      // only after that succeeds, so the user id is known).
      throw new HttpError(401, 'INVALID_REFRESH', 'Tu sesión expiró. Iniciá sesión de nuevo.');
    }
    const user = await this.users.findById(session.userId);
    if (!user?.isActive) {
      throw new HttpError(401, 'USER_INACTIVE', 'Usuario inactivo.');
    }
    await this.authRepo.revokeSession(oldJti);
    return this.issueTokens(user, fingerprint);
  }

  /** Revoke the refresh token bound to this jti (logout). */
  async logout(jti: string): Promise<void> {
    await this.authRepo.revokeSession(jti);
  }


  /** Sign a fresh access+refresh+csrf triple, persisting the session. */
  private async issueTokens(user: User, fingerprint: SessionFingerprint): Promise<AuthResult> {
    const cfg = getConfig();
    const jti = randomUUID();
    const accessToken = signAccessToken({ sub: user.id, username: user.username, email: user.email });
    const refreshToken = signRefreshToken({ sub: user.id, jti });
    const csrfToken = randomBytes(32).toString('hex');

    await this.authRepo.createSession({
      userId: user.id,
      jti,
      expiresAt: ttlToFuture(cfg.auth.refreshTokenTtl),
      userAgent: fingerprint.userAgent ?? null,
      ipAddress: fingerprint.ipAddress ?? null,
    });

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        location: user.location,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        emailVerified: user.emailVerified,
        onboardingCompleted: user.onboardingCompleted,
        createdAt: user.createdAt,
      },
      accessToken,
      refreshToken,
      csrfToken,
    };
  }
}
