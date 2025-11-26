import { Router } from 'express';
import crypto from 'crypto';
import { storage } from './storage';
import { authenticateToken, type AuthRequest, PasswordManager } from './auth';
import { emailService } from './email';
import { TwoFactorAuth } from './two-factor';
import { z } from 'zod';

const router = Router();

// ==================== EMAIL VERIFICATION ====================

/**
 * Send verification email
 * POST /api/auth/send-verification
 */
router.post('/send-verification', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user = await storage.getUser(req.user!.userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'Usuario no encontrado'
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        error: 'Email already verified',
        message: 'El email ya está verificado'
      });
    }

    // Generate verification token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date();
    expires.setHours(expires.getHours() + 24); // 24 hours

    await storage.setEmailVerificationToken(user.id, token, expires);
    
    // Send email
    try {
      await emailService.sendVerificationEmail(user.email, token, user.name);
      res.json({
        message: 'Email de verificación enviado',
        email: user.email
      });
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
      res.json({
        message: 'Token generado (email no configurado en desarrollo)',
        token, // Solo en desarrollo
        verifyUrl: `http://localhost:5173/verify-email?token=${token}`
      });
    }
  } catch (error) {
    console.error('Send verification error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Error interno del servidor'
    });
  }
});

/**
 * Verify email
 * POST /api/auth/verify-email
 */
router.post('/verify-email', async (req, res) => {
  try {
    const schema = z.object({
      token: z.string().min(1, 'Token es requerido')
    });

    const { token } = schema.parse(req.body);

    const user = await storage.verifyEmail(token);
    if (!user) {
      return res.status(400).json({
        error: 'Invalid or expired token',
        message: 'Token inválido o expirado',
        code: 'INVALID_TOKEN'
      });
    }

    res.json({
      message: 'Email verificado exitosamente',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        emailVerified: true
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Datos de entrada inválidos',
        details: error.errors
      });
    }
    
    console.error('Verify email error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Error interno del servidor'
    });
  }
});

// ==================== PASSWORD RESET ====================

/**
 * Request password reset
 * POST /api/auth/forgot-password
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const schema = z.object({
      email: z.string().email('Email inválido')
    });

    const { email } = schema.parse(req.body);

    // Find user by email
    const user = await storage.getUserByEmail(email);
    
    // Always return success (security: don't reveal if email exists)
    if (!user) {
      return res.json({
        message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña'
      });
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date();
    expires.setHours(expires.getHours() + 1); // 1 hour

    await storage.setPasswordResetToken(user.id, token, expires);
    
    // Send email
    try {
      await emailService.sendPasswordResetEmail(user.email, token, user.name);
      res.json({
        message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña',
        email: user.email
      });
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
      res.json({
        message: 'Token generado (email no configurado en desarrollo)',
        token, // Solo en desarrollo
        resetUrl: `http://localhost:5173/reset-password?token=${token}`
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Email inválido',
        details: error.errors
      });
    }
    
    console.error('Forgot password error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Error interno del servidor'
    });
  }
});

/**
 * Reset password
 * POST /api/auth/reset-password
 */
router.post('/reset-password', async (req, res) => {
  try {
    const schema = z.object({
      token: z.string().min(1, 'Token es requerido'),
      newPassword: z.string()
        .min(8, 'La contraseña debe tener al menos 8 caracteres')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/, 
          'La contraseña debe contener mayúsculas, minúsculas, números y caracteres especiales')
    });

    const { token, newPassword } = schema.parse(req.body);

    const user = await storage.getUserByPasswordResetToken(token);
    if (!user) {
      return res.status(400).json({
        error: 'Invalid or expired token',
        message: 'Token inválido o expirado',
        code: 'INVALID_TOKEN'
      });
    }

    // Update password
    await storage.updatePassword(user.id, newPassword);

    res.json({
      message: 'Contraseña restablecida exitosamente'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Datos de entrada inválidos',
        details: error.errors
      });
    }
    
    console.error('Reset password error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Error interno del servidor'
    });
  }
});

// ==================== 2FA (TWO-FACTOR AUTHENTICATION) ====================

/**
 * Setup 2FA - Generate QR code
 * POST /api/auth/2fa/setup
 */
router.post('/2fa/setup', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user = await storage.getUser(req.user!.userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'Usuario no encontrado'
      });
    }

    if (user.twoFactorEnabled) {
      return res.status(400).json({
        error: '2FA already enabled',
        message: '2FA ya está habilitado'
      });
    }

    // Generate secret and QR code
    const { secret, otpauth_url } = TwoFactorAuth.generateSecret(user.username);
    const qrCode = await TwoFactorAuth.generateQRCode(otpauth_url);
    const backupCodes = TwoFactorAuth.generateBackupCodes(10);

    // Store in session temporarily (don't save to DB yet)
    res.json({
      message: '2FA configurado. Escanea el código QR con tu app de autenticación.',
      secret,
      qrCode,
      backupCodes,
      instructions: {
        step1: 'Descarga una app de autenticación (Google Authenticator, Authy, etc.)',
        step2: 'Escanea el código QR con la app',
        step3: 'Ingresa el código de 6 dígitos para verificar',
        step4: 'Guarda los códigos de respaldo en un lugar seguro'
      }
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Error interno del servidor'
    });
  }
});

/**
 * Enable 2FA - Verify and activate
 * POST /api/auth/2fa/enable
 */
router.post('/2fa/enable', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const schema = z.object({
      secret: z.string().min(1, 'Secret es requerido'),
      token: z.string().length(6, 'Token debe tener 6 dígitos'),
      backupCodes: z.array(z.string())
    });

    const { secret, token, backupCodes } = schema.parse(req.body);

    // Verify token
    const isValid = TwoFactorAuth.verifyToken(secret, token);
    if (!isValid) {
      return res.status(400).json({
        error: 'Invalid token',
        message: 'Código de verificación inválido',
        code: 'INVALID_2FA_TOKEN'
      });
    }

    // Hash backup codes
    const hashedBackupCodes = await Promise.all(
      backupCodes.map(code => TwoFactorAuth.hashBackupCode(code))
    );

    // Enable 2FA
    await storage.enable2FA(req.user!.userId, secret, hashedBackupCodes);

    res.json({
      message: '2FA habilitado exitosamente',
      backupCodes // Return unhashed codes for user to save
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Datos de entrada inválidos',
        details: error.errors
      });
    }
    
    console.error('2FA enable error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Error interno del servidor'
    });
  }
});

/**
 * Verify 2FA token during login
 * POST /api/auth/2fa/verify
 */
router.post('/2fa/verify', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const schema = z.object({
      token: z.string().length(6, 'Token debe tener 6 dígitos'),
      useBackupCode: z.boolean().optional()
    });

    const { token, useBackupCode } = schema.parse(req.body);

    const secret = await storage.get2FASecret(req.user!.userId);
    if (!secret) {
      return res.status(400).json({
        error: '2FA not enabled',
        message: '2FA no está habilitado'
      });
    }

    let isValid = false;

    if (useBackupCode) {
      // Verify backup code
      const user = await storage.getUser(req.user!.userId);
      if (user?.twoFactorBackupCodes) {
        const backupCodes = JSON.parse(user.twoFactorBackupCodes);
        for (let i = 0; i < backupCodes.length; i++) {
          if (backupCodes[i] && await TwoFactorAuth.verifyBackupCode(token, backupCodes[i])) {
            isValid = true;
            await storage.useBackupCode(req.user!.userId, i);
            break;
          }
        }
      }
    } else {
      // Verify TOTP token
      isValid = TwoFactorAuth.verifyToken(secret, token);
    }

    if (!isValid) {
      return res.status(400).json({
        error: 'Invalid token',
        message: 'Código de verificación inválido',
        code: 'INVALID_2FA_TOKEN'
      });
    }

    res.json({
      message: 'Verificación 2FA exitosa',
      verified: true
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Datos de entrada inválidos',
        details: error.errors
      });
    }
    
    console.error('2FA verify error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Error interno del servidor'
    });
  }
});

/**
 * Disable 2FA
 * POST /api/auth/2fa/disable
 */
router.post('/2fa/disable', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const schema = z.object({
      password: z.string().min(1, 'Contraseña es requerida')
    });

    const { password } = schema.parse(req.body);

    const user = await storage.getUser(req.user!.userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'Usuario no encontrado'
      });
    }

    // Verify password
    const isPasswordValid = await PasswordManager.verify(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid password',
        message: 'Contraseña incorrecta',
        code: 'INVALID_PASSWORD'
      });
    }

    if (user.password && !/^\$2[aby]\$\d{2}\$/.test(user.password)) {
      console.warn(`[2FA disable] Plaintext password detected for user "${user.username}". Upgrading to secure hash.`);
      await storage.updatePassword(user.id, password);
    }

    await storage.disable2FA(req.user!.userId);

    res.json({
      message: '2FA deshabilitado exitosamente'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Datos de entrada inválidos',
        details: error.errors
      });
    }
    
    console.error('2FA disable error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Error interno del servidor'
    });
  }
});

export default router;

