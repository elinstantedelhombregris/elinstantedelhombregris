import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import crypto from 'crypto';

export class TwoFactorAuth {
  /**
   * Genera un secreto para 2FA
   */
  static generateSecret(username: string): { secret: string; otpauth_url: string } {
    const secret = speakeasy.generateSecret({
      name: `¡BASTA! (${username})`,
      issuer: '¡BASTA!',
      length: 32,
    });

    return {
      secret: secret.base32,
      otpauth_url: secret.otpauth_url || '',
    };
  }

  /**
   * Genera un código QR para configurar la app de autenticación
   */
  static async generateQRCode(otpauth_url: string): Promise<string> {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(otpauth_url);
      return qrCodeDataUrl;
    } catch (error) {
      throw new Error('Failed to generate QR code');
    }
  }

  /**
   * Verifica un token TOTP
   */
  static verifyToken(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2, // Permite 2 períodos de tiempo antes/después (60 segundos)
    });
  }

  /**
   * Genera códigos de respaldo
   */
  static generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      const code = crypto.randomBytes(5).toString('hex').toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  /**
   * Hashea códigos de respaldo para almacenamiento seguro
   */
  static async hashBackupCode(code: string): Promise<string> {
    const bcrypt = await import('bcryptjs');
    return await bcrypt.hash(code, 10);
  }

  /**
   * Verifica un código de respaldo
   */
  static async verifyBackupCode(code: string, hashedCode: string): Promise<boolean> {
    const bcrypt = await import('bcryptjs');
    return await bcrypt.compare(code, hashedCode);
  }
}

// Tipos para 2FA
export interface TwoFactorSetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export interface TwoFactorVerification {
  token: string;
  useBackupCode?: boolean;
}

