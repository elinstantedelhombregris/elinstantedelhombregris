import type { Express, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';

import { authenticateToken, type AuthRequest } from './auth';
import {
  createCustodyGrantSchema,
  createCustodyGrantResponseSchema,
  custodyGrantIdSchema,
  custodyGrantListQuerySchema,
  custodyIdempotencyKeySchema,
  CustodyGrantService,
} from './civic/custody-grants';
import { CivicDeviceTokenManager } from './civic/device-auth';
import { PostgresCustodyGrantStore } from './civic/postgres-custody-grant-store';
import { CivicApiError } from './civic/service';

const custodyMutationRateLimit = rateLimit({
  windowMs: 15 * 60_000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { code: 'CUSTODY_RATE_LIMITED', message: 'Demasiadas operaciones de custodia; reintentá más tarde.' },
});

const custodyInboxRateLimit = rateLimit({
  windowMs: 60_000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { code: 'CUSTODY_RATE_LIMITED', message: 'Demasiadas lecturas de custodia; esperá un momento.' },
});

const revokeBodySchema = z.object({ grantId: custodyGrantIdSchema }).strict();

const validationDetails = (issues: Array<{ path: Array<string | number>; code: string }>) =>
  issues.map((issue) => ({ path: `$.${issue.path.join('.')}`, code: issue.code }));

function privateResponse(res: Response): void {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Vary', 'Authorization, X-Civic-Device-Token');
}

function apiError(res: Response, error: unknown): void {
  if (error instanceof CivicApiError) {
    res.status(error.status).json({ code: error.code, message: error.message, path: error.path });
    return;
  }
  // Nunca se registran body, headers, ids ni payloads de una necesidad.
  console.error('[civic-custody] request failed:', error instanceof Error ? error.name : 'unknown_error');
  res.status(500).json({ code: 'CUSTODY_GRANT_ERROR', message: 'No se pudo procesar el grant privado.' });
}

export function registerCivicCustodyRoutes(app: Express): void {
  const store = new PostgresCustodyGrantStore();
  const service = new CustodyGrantService(store);
  const deviceTokens = new CivicDeviceTokenManager();

  app.post(
    '/api/v1/civic/custody/grants',
    custodyMutationRateLimit,
    authenticateToken,
    async (req: AuthRequest, res: Response) => {
      privateResponse(res);
      const body = createCustodyGrantSchema.safeParse(req.body);
      const idempotency = custodyIdempotencyKeySchema.safeParse(req.header('Idempotency-Key'));
      if (!body.success || !idempotency.success) {
        const issues = [
          ...(body.success ? [] : body.error.issues),
          ...(idempotency.success
            ? []
            : idempotency.error.issues.map((issue) => ({ ...issue, path: ['headers', 'idempotency-key'] }))),
        ];
        res.status(422).json({
          code: 'INVALID_CUSTODY_GRANT',
          message: 'El contrato del grant no es válido.',
          details: validationDetails(issues),
        });
        return;
      }

      const proof = req.header('X-Civic-Device-Token');
      if (!proof) {
        res.status(401).json({
          code: 'MISSING_CIVIC_PROOF',
          message: 'Falta demostrar la identidad del dispositivo dueño de la necesidad.',
        });
        return;
      }
      const claims = deviceTokens.verify(proof);
      if (!claims) {
        res.status(403).json({ code: 'INVALID_CIVIC_PROOF', message: 'La credencial del dispositivo no es válida.' });
        return;
      }

      try {
        const device = await store.getDevice(claims.sub);
        if (!device) {
          res.status(403).json({ code: 'DEVICE_NOT_AVAILABLE', message: 'El dispositivo no está habilitado.' });
          return;
        }
        const result = await service.create(
          device,
          req.user!.userId,
          body.data,
          idempotency.data,
        );
        res.status(result.status === 'accepted' ? 201 : 200).json({
          contract: 'basta-civic-custody-grants/v1',
          ...result,
        });
      } catch (error) {
        apiError(res, error);
      }
    },
  );

  app.get(
    '/api/v1/civic/custody/grants',
    custodyInboxRateLimit,
    authenticateToken,
    async (req: AuthRequest, res: Response) => {
      privateResponse(res);
      const query = custodyGrantListQuerySchema.safeParse(req.query);
      if (!query.success) {
        res.status(422).json({ code: 'INVALID_CUSTODY_QUERY', message: 'La consulta de custodia no es válida.' });
        return;
      }
      try {
        res.status(200).json(await service.listInbox(
          req.user!.userId,
          query.data.limit,
          query.data.cursor,
        ));
      } catch (error) {
        apiError(res, error);
      }
    },
  );

  app.post(
    '/api/v1/civic/custody/grants/respond',
    custodyMutationRateLimit,
    authenticateToken,
    async (req: AuthRequest, res: Response) => {
      privateResponse(res);
      const idempotency = custodyIdempotencyKeySchema.safeParse(req.header('Idempotency-Key'));
      const body = createCustodyGrantResponseSchema.safeParse(req.body);
      if (!idempotency.success || !body.success) {
        const issues = [
          ...(body.success ? [] : body.error.issues),
          ...(idempotency.success
            ? []
            : idempotency.error.issues.map((issue) => ({ ...issue, path: ['headers', 'idempotency-key'] }))),
        ];
        res.status(422).json({
          code: 'INVALID_CUSTODY_RESPONSE',
          message: 'El contrato de respuesta no es válido.',
          details: validationDetails(issues),
        });
        return;
      }
      try {
        const result = await service.respond(req.user!.userId, body.data, idempotency.data);
        res.status(result.status === 'accepted' ? 201 : 200).json(result);
      } catch (error) {
        apiError(res, error);
      }
    },
  );

  app.post(
    '/api/v1/civic/custody/grants/revoke',
    custodyMutationRateLimit,
    authenticateToken,
    async (req: AuthRequest, res: Response) => {
      privateResponse(res);
      const idempotency = custodyIdempotencyKeySchema.safeParse(req.header('Idempotency-Key'));
      const body = revokeBodySchema.safeParse(req.body);
      if (!idempotency.success || !body.success) {
        res.status(422).json({
          code: 'INVALID_CUSTODY_REVOCATION',
          message: 'El contrato de revocación no es válido.',
        });
        return;
      }
      try {
        res.status(200).json(await service.revoke(
          req.user!.userId,
          body.data.grantId,
          idempotency.data,
        ));
      } catch (error) {
        apiError(res, error);
      }
    },
  );
}
