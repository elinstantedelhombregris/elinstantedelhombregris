import type { Express, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';

import { authenticateToken, type AuthRequest } from './auth';
import {
  civicDeviceEnrollmentSchema,
  civicEventSchema,
  civicIdempotencyKeySchema,
} from './civic/contracts';
import {
  CivicDeviceTokenManager,
  hashDeviceSecret,
  verifyDeviceSecret,
} from './civic/device-auth';
import { PostgresCivicEventStore } from './civic/postgres-store';
import { CivicApiError, CivicEventService } from './civic/service';
import { buildOperationalFeed } from './civic/operational-feed';

const enrollmentRateLimit = rateLimit({
  windowMs: 60 * 60_000,
  max: 12,
  standardHeaders: true,
  legacyHeaders: false,
  message: { code: 'ENROLLMENT_RATE_LIMITED', message: 'Demasiados intentos de enrolamiento.' },
});

const eventRateLimit = rateLimit({
  windowMs: 15 * 60_000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { code: 'EVENT_RATE_LIMITED', message: 'Demasiados eventos; reintentá en unos minutos.' },
});

const feedRateLimit = rateLimit({
  windowMs: 60_000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { code: 'FEED_RATE_LIMITED', message: 'Demasiadas actualizaciones de red; esperá un momento.' },
});

const feedQuerySchema = z.object({
  after: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(200).default(200),
}).strict();

const validationDetails = (issues: Array<{ path: Array<string | number>; code: string }>) =>
  issues.map((issue) => ({ path: `$.${issue.path.join('.')}`, code: issue.code }));

function apiError(res: Response, error: unknown): void {
  if (error instanceof CivicApiError) {
    res.status(error.status).json({ code: error.code, message: error.message, path: error.path });
    return;
  }
  console.error('[civic-events] request failed:', error instanceof Error ? error.message : 'unknown_error');
  res.status(500).json({ code: 'CIVIC_EVENT_ERROR', message: 'No se pudo procesar el evento cívico.' });
}

export function registerCivicEventRoutes(app: Express): void {
  const store = new PostgresCivicEventStore();
  const service = new CivicEventService(store);
  const tokens = new CivicDeviceTokenManager();

  app.post('/api/v1/civic/devices/enroll', enrollmentRateLimit, async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    const parsed = civicDeviceEnrollmentSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(422).json({
        code: 'INVALID_ENROLLMENT',
        message: 'Los datos de enrolamiento no son válidos.',
        details: validationDetails(parsed.error.issues),
      });
      return;
    }

    try {
      let device = await store.getDevice(parsed.data.actorKey);
      if (!device) {
        device = await store.createDevice(parsed.data.actorKey, hashDeviceSecret(parsed.data.deviceSecret));
      }
      if (device.revokedAt) {
        res.status(403).json({ code: 'DEVICE_REVOKED', message: 'Este dispositivo fue revocado.' });
        return;
      }
      if (!verifyDeviceSecret(parsed.data.deviceSecret, device.secretHash)) {
        res.status(401).json({ code: 'DEVICE_SECRET_MISMATCH', message: 'La credencial del dispositivo no coincide.' });
        return;
      }
      await store.touchDevice(device.actorKey);
      const issued = tokens.issue(device.actorKey, device.role);
      res.status(200).json({
        actorKey: device.actorKey,
        role: device.role,
        linked: device.linkedUserId != null,
        ...issued,
      });
    } catch (error) {
      apiError(res, error);
    }
  });

  /**
   * Vinculación opt-in: el Authorization normal demuestra la cuenta y el
   * header separado demuestra posesión de la identidad seudónima móvil.
   */
  app.post('/api/v1/civic/devices/link', authenticateToken, async (req: AuthRequest, res: Response) => {
    res.setHeader('Cache-Control', 'no-store');
    const civicToken = req.header('X-Civic-Device-Token');
    const claims = civicToken ? tokens.verify(civicToken) : null;
    if (!claims) {
      res.status(401).json({ code: 'MISSING_CIVIC_PROOF', message: 'Falta demostrar la identidad de este dispositivo.' });
      return;
    }
    try {
      const device = await store.getDevice(claims.sub);
      if (!device || device.revokedAt) {
        res.status(403).json({ code: 'DEVICE_REVOKED', message: 'El dispositivo no está habilitado.' });
        return;
      }
      const result = await store.linkDevice(device.actorKey, req.user!.userId);
      if (result === 'conflict') {
        res.status(409).json({ code: 'DEVICE_ALREADY_LINKED', message: 'Este dispositivo ya está vinculado a otra cuenta.' });
        return;
      }
      if (result === 'missing') {
        res.status(404).json({ code: 'DEVICE_NOT_FOUND', message: 'El dispositivo todavía no está enrolado.' });
        return;
      }
      res.status(result === 'linked' ? 201 : 200).json({
        status: result,
        actorKey: device.actorKey,
        userId: req.user!.userId,
      });
    } catch (error) {
      apiError(res, error);
    }
  });

  app.post('/api/v1/civic/devices/unlink', authenticateToken, async (req: AuthRequest, res: Response) => {
    res.setHeader('Cache-Control', 'no-store');
    const civicToken = req.header('X-Civic-Device-Token');
    const claims = civicToken ? tokens.verify(civicToken) : null;
    if (!claims) {
      res.status(401).json({ code: 'MISSING_CIVIC_PROOF', message: 'Falta demostrar la identidad de este dispositivo.' });
      return;
    }
    try {
      const unlinked = await store.unlinkDevice(claims.sub, req.user!.userId);
      if (!unlinked) {
        res.status(409).json({ code: 'LINK_NOT_FOUND', message: 'La cuenta no estaba vinculada a este dispositivo.' });
        return;
      }
      res.status(200).json({ status: 'unlinked', actorKey: claims.sub });
    } catch (error) {
      apiError(res, error);
    }
  });

  app.post('/api/v1/civic/events', eventRateLimit, async (req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-store');
    const bearer = tokens.extract(req.headers.authorization);
    if (!bearer) {
      res.status(401).json({ code: 'MISSING_DEVICE_TOKEN', message: 'Falta la credencial del dispositivo.' });
      return;
    }
    const claims = tokens.verify(bearer);
    if (!claims) {
      res.status(403).json({ code: 'INVALID_DEVICE_TOKEN', message: 'La credencial del dispositivo no es válida.' });
      return;
    }

    const [eventResult, idempotencyResult] = [
      civicEventSchema.safeParse(req.body),
      civicIdempotencyKeySchema.safeParse(req.header('Idempotency-Key')),
    ];
    if (!eventResult.success || !idempotencyResult.success) {
      const issues = [
        ...(eventResult.success ? [] : eventResult.error.issues),
        ...(idempotencyResult.success ? [] : idempotencyResult.error.issues.map((issue) => ({ ...issue, path: ['headers', 'idempotency-key'] }))),
      ];
      res.status(422).json({
        code: 'INVALID_CIVIC_EVENT',
        message: 'El contrato del evento no es válido.',
        details: validationDetails(issues),
      });
      return;
    }

    try {
      const device = await store.getDevice(claims.sub);
      if (!device || device.revokedAt) {
        res.status(403).json({ code: 'DEVICE_REVOKED', message: 'El dispositivo no está habilitado.' });
        return;
      }
      const result = await service.ingest({
        actorKey: device.actorKey,
        role: device.role,
        linkedUserId: device.linkedUserId,
      }, eventResult.data, idempotencyResult.data);
      res.status(result.status === 'accepted' ? 201 : 200).json(result);
    } catch (error) {
      apiError(res, error);
    }
  });

  app.get('/api/v1/civic/feed', feedRateLimit, async (req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'private, no-store');
    const bearer = tokens.extract(req.headers.authorization);
    if (!bearer) {
      res.status(401).json({ code: 'MISSING_DEVICE_TOKEN', message: 'Falta la credencial del dispositivo.' });
      return;
    }
    const claims = tokens.verify(bearer);
    if (!claims) {
      res.status(403).json({ code: 'INVALID_DEVICE_TOKEN', message: 'La credencial del dispositivo no es válida.' });
      return;
    }
    const query = feedQuerySchema.safeParse(req.query);
    if (!query.success) {
      res.status(422).json({ code: 'INVALID_FEED_CURSOR', message: 'El cursor de actualización no es válido.' });
      return;
    }

    try {
      const device = await store.getDevice(claims.sub);
      if (!device || device.revokedAt) {
        res.status(403).json({ code: 'DEVICE_REVOKED', message: 'El dispositivo no está habilitado.' });
        return;
      }
      if (device.linkedUserId == null) {
        res.status(403).json({
          code: 'ACCOUNT_LINK_REQUIRED',
          message: 'Vinculá una cuenta para recibir señales operativas de otras personas.',
        });
        return;
      }

      const [source, matches] = await Promise.all([
        store.listFeedEventsAfter(query.data.after, query.data.limit),
        store.listMatchesForActor(device.actorKey),
      ]);
      const actions = await store.listActionLinksForMatches(matches.map((item) => item.matchId));
      const events = buildOperationalFeed(source, device.actorKey, matches, actions);
      const nextCursor = source.at(-1)?.id ?? query.data.after;
      res.status(200).json({
        contract: 'basta-civic-feed/v1',
        scope: 'linked-participant-network',
        events,
        nextCursor,
        hasMore: source.length === query.data.limit,
      });
    } catch (error) {
      apiError(res, error);
    }
  });
}
