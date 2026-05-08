/**
 * Email-related auth routes: send-verification + verify + request-reset
 * + reset.
 *
 * The send/request endpoints always return 200 regardless of whether
 * the email belongs to a real account — preventing user enumeration.
 */
import { randomBytes } from 'node:crypto';

import { AuthRepository, getDb, UsersRepository } from '@v2/db';
import { Router, type Router as RouterType } from 'express';
import { z } from 'zod';

import { getConfig } from '../../lib/config.js';
import { getEmailSender } from '../../lib/email.js';
import { logger } from '../../lib/logger.js';
import { emailVerificationRateLimit, passwordResetRequestRateLimit } from '../../middleware/rate-limit.js';

import { emailVerificationTemplate, passwordResetTemplate } from './email-templates.js';
import { hashPassword } from './password.js';

const router: RouterType = Router();

const requestVerificationSchema = z.object({
  email: z.string().email().toLowerCase().optional(),
});
const verifyEmailSchema = z.object({
  token: z.string().min(1),
});
const requestResetSchema = z.object({
  email: z.string().email().toLowerCase(),
});
const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(12).max(128),
});

const VERIFY_TTL_MS = 24 * 60 * 60 * 1000; // 24h
const RESET_TTL_MS = 60 * 60 * 1000; // 1h

router.post('/email/send-verification', emailVerificationRateLimit(), async (req, res, next) => {
  try {
    const parsed = requestVerificationSchema.parse(req.body ?? {});
    const cfg = getConfig();
    const usersRepo = new UsersRepository(getDb());
    const authRepo = new AuthRepository(getDb());

    // Authenticated path: send to the logged-in user. Anonymous path:
    // send to the email in the body if it matches a real account.
    let user;
    if (req.user) {
      user = await usersRepo.findById(req.user.id);
    } else if (parsed.email) {
      user = await usersRepo.findByEmail(parsed.email);
    }

    if (user && !user.emailVerified) {
      const token = randomBytes(32).toString('hex');
      await authRepo.createEmailVerificationToken(user.id, token, new Date(Date.now() + VERIFY_TTL_MS));
      const verifyUrl = `${cfg.web.publicUrl}/verificar-email?token=${token}`;
      const message = emailVerificationTemplate({ name: user.name, verifyUrl });
      try {
        await getEmailSender().send({ to: user.email, ...message });
      } catch (sendErr) {
        logger.error({ err: sendErr, userId: user.id }, 'Failed to send verification email');
        // Don't fail the request — we don't want to leak send-failures
        // back to the client.
      }
    }

    res.json({ data: { ok: true } });
  } catch (err) {
    next(err);
  }
});

router.post('/email/verify', async (req, res, next) => {
  try {
    const { token } = verifyEmailSchema.parse(req.body);
    const usersRepo = new UsersRepository(getDb());
    const authRepo = new AuthRepository(getDb());
    const consumed = await authRepo.consumeEmailVerificationToken(token);
    if (!consumed) {
      res.status(400).json({
        error: { code: 'INVALID_VERIFICATION', message: 'Token inválido o vencido. Pedí uno nuevo.' },
      });
      return;
    }
    await usersRepo.markEmailVerified(consumed.userId);
    res.json({ data: { ok: true } });
  } catch (err) {
    next(err);
  }
});

router.post('/password/request-reset', passwordResetRequestRateLimit(), async (req, res, next) => {
  try {
    const { email } = requestResetSchema.parse(req.body);
    const cfg = getConfig();
    const usersRepo = new UsersRepository(getDb());
    const authRepo = new AuthRepository(getDb());
    const user = await usersRepo.findByEmail(email);

    if (user) {
      const token = randomBytes(32).toString('hex');
      await authRepo.createPasswordResetToken(user.id, token, new Date(Date.now() + RESET_TTL_MS));
      const resetUrl = `${cfg.web.publicUrl}/recuperar-contrasena?token=${token}`;
      const message = passwordResetTemplate({ name: user.name, resetUrl });
      try {
        await getEmailSender().send({ to: user.email, ...message });
      } catch (sendErr) {
        logger.error({ err: sendErr, userId: user.id }, 'Failed to send password-reset email');
      }
    }

    // Always 200 — don't leak which emails are registered.
    res.json({ data: { ok: true } });
  } catch (err) {
    next(err);
  }
});

router.post('/password/reset', async (req, res, next) => {
  try {
    const { token, newPassword } = resetPasswordSchema.parse(req.body);
    const usersRepo = new UsersRepository(getDb());
    const authRepo = new AuthRepository(getDb());
    const consumed = await authRepo.consumePasswordResetToken(token);
    if (!consumed) {
      res.status(400).json({
        error: { code: 'INVALID_RESET', message: 'Token inválido o vencido. Pedí uno nuevo.' },
      });
      return;
    }
    const passwordHash = await hashPassword(newPassword);
    await usersRepo.update(consumed.userId, { passwordHash });
    // Drop any lingering reset tokens + revoke all sessions — the user
    // wants a fresh start.
    await authRepo.clearPasswordResetTokens(consumed.userId);
    await authRepo.revokeAllUserSessions(consumed.userId);
    res.json({ data: { ok: true } });
  } catch (err) {
    next(err);
  }
});

export { router as authEmailRouter };
