/**
 * Auth domain service. Pure functions over an injected
 * UsersRepository, so tests can swap in a stub without touching the DB.
 */
import { randomBytes, randomUUID } from 'node:crypto';


import { HttpError } from '../../middleware/error-handler.js';

import { hashPassword, verifyPassword } from './password.js';
import { signAccessToken, signRefreshToken } from './tokens.js';

import type { UsersRepository } from '@v2/db';
import type { LoginInput, RegisterInput, UserPublic } from '@v2/shared';

interface AuthResult {
  user: UserPublic;
  accessToken: string;
  refreshToken: string;
  csrfToken: string;
}

export class AuthService {
  constructor(private readonly users: UsersRepository) {}

  async register(input: RegisterInput): Promise<AuthResult> {
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
    return this.tokenizeUser(user);
  }

  async login(input: LoginInput): Promise<AuthResult> {
    const candidate =
      (await this.users.findByEmail(input.identifier)) ?? (await this.users.findByUsername(input.identifier));
    if (!candidate) {
      // Same error for "user not found" vs "wrong password" → don't leak existence.
      throw new HttpError(401, 'INVALID_CREDENTIALS', 'Email o contraseña incorrectos.');
    }
    const ok = await verifyPassword(input.password, candidate.passwordHash);
    if (!ok) {
      throw new HttpError(401, 'INVALID_CREDENTIALS', 'Email o contraseña incorrectos.');
    }
    await this.users.recordLogin(candidate.id);
    return this.tokenizeUser(candidate);
  }

  /** Sign a fresh access+refresh+csrf triple for a given user id. */
  rotate(userId: number, username: string, email: string): Omit<AuthResult, 'user'> {
    const accessToken = signAccessToken({ sub: userId, username, email });
    const refreshToken = signRefreshToken({ sub: userId, jti: randomUUID() });
    const csrfToken = randomBytes(32).toString('hex');
    return { accessToken, refreshToken, csrfToken };
  }

  private tokenizeUser(user: { id: number; username: string; email: string; name: string; location: string | null; bio: string | null; avatarUrl: string | null; emailVerified: boolean; onboardingCompleted: boolean; createdAt: Date }): AuthResult {
    const tokens = this.rotate(user.id, user.username, user.email);
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
      ...tokens,
    };
  }
}
