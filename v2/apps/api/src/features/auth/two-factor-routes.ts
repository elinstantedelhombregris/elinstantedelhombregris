/**
 * 2FA TOTP routes.
 *
 * Flow:
 *   1. POST /2fa/setup        → generate secret, return otpauth URI +
 *                                QR data URL. Stores secret with
 *                                enabled=false.
 *   2. POST /2fa/enable       → verify a TOTP from the user's
 *                                authenticator app + return backup
 *                                codes. Sets enabled=true.
 *   3. POST /2fa/verify       → during login, exchange a TOTP code or
 *                                a backup code for a real session.
 *   4. POST /2fa/disable      → requires current password.
 *   5. POST /2fa/backup-codes → regenerate.
 *
 * The "login that needs 2FA" half-step uses a short-lived signed
 * challenge token (the partial-auth ticket) so the client can prove
 * which user is mid-login without holding a real session.
 */
import { randomBytes } from 'node:crypto';

import { AuthRepository, getDb, UsersRepository } from '@v2/db';
import { Router, type Router as RouterType } from 'express';
import jwt from 'jsonwebtoken';
import { toDataURL as qrToDataURL } from 'qrcode';
import speakeasy from 'speakeasy';
import { z } from 'zod';

import { getConfig } from '../../lib/config.js';
import { authenticate } from '../../middleware/auth.js';
import { HttpError } from '../../middleware/error-handler.js';
import { twoFactorVerifyRateLimit } from '../../middleware/rate-limit.js';

import { hashPassword, verifyPassword } from './password.js';

const router: RouterType = Router();

const APP_LABEL = 'El Instante del Hombre Gris';
const TWO_FA_TICKET_TTL_SEC = 5 * 60;

interface TwoFaTicketPayload {
  sub: number;
  twoFactorChallenge: true;
}

function signTwoFaTicket(userId: number): string {
  const cfg = getConfig();
  return jwt.sign({ sub: userId, twoFactorChallenge: true } satisfies TwoFaTicketPayload, cfg.auth.jwtSecret, {
    expiresIn: TWO_FA_TICKET_TTL_SEC,
    issuer: 'basta-app',
    audience: 'basta-2fa-challenge',
  });
}

function verifyTwoFaTicket(token: string): TwoFaTicketPayload | null {
  const cfg = getConfig();
  try {
    const decoded = jwt.verify(token, cfg.auth.jwtSecret, {
      issuer: 'basta-app',
      audience: 'basta-2fa-challenge',
    });
    if (typeof decoded === 'string') return null;
    const payload = decoded as unknown as Partial<TwoFaTicketPayload>;
    if (payload.twoFactorChallenge !== true || typeof payload.sub !== 'number') return null;
    return { sub: payload.sub, twoFactorChallenge: true };
  } catch {
    return null;
  }
}

function generateBackupCodes(count = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    // 10-character alphanumeric, hyphenated for readability: XXXXX-XXXXX
    const raw = randomBytes(8).toString('hex').slice(0, 10).toUpperCase();
    codes.push(`${raw.slice(0, 5)}-${raw.slice(5)}`);
  }
  return codes;
}

const verifySchema = z.object({
  ticket: z.string().min(1),
  code: z.string().min(6).max(20),
});

const enableSchema = z.object({
  code: z.string().min(6).max(8),
});

const disableSchema = z.object({
  currentPassword: z.string().min(1),
});

router.post('/2fa/setup', authenticate, async (req, res, next) => {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTHENTICATED', 'No autenticado.');
    const authRepo = new AuthRepository(getDb());

    const existing = await authRepo.findTwoFactorSecret(req.user.id);
    if (existing?.enabled) {
      throw new HttpError(409, '2FA_ALREADY_ENABLED', '2FA ya está activado. Desactivalo primero si querés re-enrollarlo.');
    }

    const secret = speakeasy.generateSecret({
      length: 20,
      name: `${APP_LABEL} (${req.user.email})`,
      issuer: APP_LABEL,
    });
    const base32 = secret.base32;
    const otpauthUrl = secret.otpauth_url;
    if (!base32 || !otpauthUrl) {
      throw new HttpError(500, '2FA_GENERATE_FAILED', 'No pudimos generar el secreto. Intentá de nuevo.');
    }
    await authRepo.upsertTwoFactorSecret(req.user.id, base32);
    const qrDataUrl = await qrToDataURL(otpauthUrl);
    res.json({ data: { otpauthUrl, qrDataUrl, secret: base32 } });
  } catch (err) {
    next(err);
  }
});

router.post('/2fa/enable', authenticate, async (req, res, next) => {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTHENTICATED', 'No autenticado.');
    const { code } = enableSchema.parse(req.body);
    const authRepo = new AuthRepository(getDb());
    const stored = await authRepo.findTwoFactorSecret(req.user.id);
    if (!stored) throw new HttpError(400, '2FA_NOT_SETUP', 'Hacé el setup de 2FA primero.');
    const ok = speakeasy.totp.verify({
      secret: stored.secret,
      encoding: 'base32',
      token: code,
      window: 1,
    });
    if (!ok) throw new HttpError(400, 'INVALID_2FA_CODE', 'Código inválido. Intentá de nuevo.');
    await authRepo.enableTwoFactor(req.user.id);

    const codes = generateBackupCodes();
    const codeHashes = await Promise.all(codes.map(async (c) => hashPassword(c)));
    await authRepo.replaceBackupCodes(req.user.id, codeHashes);

    res.json({ data: { ok: true, backupCodes: codes } });
  } catch (err) {
    next(err);
  }
});

router.post('/2fa/disable', authenticate, async (req, res, next) => {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTHENTICATED', 'No autenticado.');
    const { currentPassword } = disableSchema.parse(req.body);
    const usersRepo = new UsersRepository(getDb());
    const authRepo = new AuthRepository(getDb());
    const user = await usersRepo.findById(req.user.id);
    if (!user) throw new HttpError(404, 'USER_NOT_FOUND', 'Usuario no encontrado.');
    const passwordOk = await verifyPassword(currentPassword, user.passwordHash);
    if (!passwordOk) throw new HttpError(401, 'INVALID_CREDENTIALS', 'Contraseña incorrecta.');
    await authRepo.disableTwoFactor(req.user.id);
    res.json({ data: { ok: true } });
  } catch (err) {
    next(err);
  }
});

router.post('/2fa/backup-codes/regenerate', authenticate, async (req, res, next) => {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTHENTICATED', 'No autenticado.');
    const authRepo = new AuthRepository(getDb());
    const stored = await authRepo.findTwoFactorSecret(req.user.id);
    if (!stored?.enabled) {
      throw new HttpError(400, '2FA_NOT_ENABLED', '2FA tiene que estar activado.');
    }
    const codes = generateBackupCodes();
    const codeHashes = await Promise.all(codes.map(async (c) => hashPassword(c)));
    await authRepo.replaceBackupCodes(req.user.id, codeHashes);
    res.json({ data: { backupCodes: codes } });
  } catch (err) {
    next(err);
  }
});

router.post('/2fa/verify', twoFactorVerifyRateLimit(), async (req, res, next) => {
  try {
    const { ticket, code } = verifySchema.parse(req.body);
    const claims = verifyTwoFaTicket(ticket);
    if (!claims) throw new HttpError(401, 'INVALID_TICKET', 'Ticket inválido o vencido.');

    const authRepo = new AuthRepository(getDb());
    const stored = await authRepo.findTwoFactorSecret(claims.sub);
    if (!stored?.enabled) throw new HttpError(400, '2FA_NOT_ENABLED', '2FA no está activado.');

    let valid = false;
    // Try TOTP first (likely path).
    const totpOk = speakeasy.totp.verify({
      secret: stored.secret,
      encoding: 'base32',
      token: code,
      window: 1,
    });
    if (totpOk) {
      valid = true;
      await authRepo.recordTwoFactorUsed(claims.sub);
    } else {
      // Fall back to backup codes.
      const unusedCodes = await authRepo.listUnusedBackupCodes(claims.sub);
      for (const candidate of unusedCodes) {
         
        const ok = await verifyPassword(code, candidate.codeHash);
        if (ok) {
           
          await authRepo.markBackupCodeUsed(candidate.id);
          valid = true;
          break;
        }
      }
    }

    if (!valid) throw new HttpError(400, 'INVALID_2FA_CODE', 'Código inválido.');

    // Caller wires this verify endpoint up to the AuthService rotation
    // logic in the next commit; for now just confirm success and let
    // the front end call /api/auth/login again with a "skip 2FA" hint.
    // The proper integration happens in P2.6's frontend slice.
    res.json({ data: { ok: true, sub: claims.sub } });
  } catch (err) {
    next(err);
  }
});

export { router as twoFactorRouter, signTwoFaTicket };
