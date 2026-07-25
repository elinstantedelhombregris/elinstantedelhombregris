import { createHmac, timingSafeEqual } from 'node:crypto';
import jwt from 'jsonwebtoken';

import { config } from '../config';
import { civicActorKeySchema, type CivicDeviceRole } from './contracts';

const DEFAULT_TTL_SECONDS = 7 * 24 * 60 * 60;

function tokenTtlSeconds(): number {
  const configured = Number(process.env.CIVIC_DEVICE_TOKEN_TTL_SECONDS ?? DEFAULT_TTL_SECONDS);
  if (!Number.isFinite(configured)) return DEFAULT_TTL_SECONDS;
  return Math.max(5 * 60, Math.min(30 * 24 * 60 * 60, Math.floor(configured)));
}

function devicePepper(): string {
  return process.env.CIVIC_DEVICE_PEPPER || config.jwt.secret;
}

export interface CivicDeviceClaims {
  sub: string;
  type: 'civic-device';
  scope: 'civic:write';
  iat?: number;
  exp?: number;
}

/** Hash rápido y con pepper: el secreto de dispositivo ya tiene 256 bits. */
export function hashDeviceSecret(secret: string): string {
  return createHmac('sha256', devicePepper()).update(secret, 'utf8').digest('hex');
}

export function verifyDeviceSecret(secret: string, expectedHash: string): boolean {
  const actual = Buffer.from(hashDeviceSecret(secret), 'hex');
  const expected = Buffer.from(expectedHash, 'hex');
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export class CivicDeviceTokenManager {
  issue(actorKey: string, _role: CivicDeviceRole): { accessToken: string; expiresAt: string } {
    const ttl = tokenTtlSeconds();
    const claims: CivicDeviceClaims = { sub: actorKey, type: 'civic-device', scope: 'civic:write' };
    const accessToken = jwt.sign(claims, config.jwt.secret, {
      expiresIn: ttl,
      issuer: 'basta-civic',
      audience: 'basta-civic-api',
    });
    return { accessToken, expiresAt: new Date(Date.now() + ttl * 1000).toISOString() };
  }

  verify(token: string): CivicDeviceClaims | null {
    try {
      const payload = jwt.verify(token, config.jwt.secret, {
        issuer: 'basta-civic',
        audience: 'basta-civic-api',
      }) as CivicDeviceClaims;
      if (
        payload.type !== 'civic-device'
        || payload.scope !== 'civic:write'
        || !civicActorKeySchema.safeParse(payload.sub).success
      ) return null;
      return payload;
    } catch {
      return null;
    }
  }

  extract(authorization: string | undefined): string | null {
    if (!authorization) return null;
    const [scheme, token, extra] = authorization.split(' ');
    return scheme === 'Bearer' && token && !extra ? token : null;
  }
}

