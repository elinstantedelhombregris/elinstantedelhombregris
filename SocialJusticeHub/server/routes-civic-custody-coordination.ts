import type { Express, NextFunction, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';

import { authenticateToken, type AuthRequest } from './auth';
import {
  createCustodyCoordinationProposalSchema,
  custodyCoordinationIdempotencyKeySchema,
  custodyCoordinationListQuerySchema,
  custodyCoordinationStatusSchema,
  CustodyCoordinationService,
  decideCustodyCoordinationProposalSchema,
} from './civic/custody-coordination';
import { CivicDeviceTokenManager } from './civic/device-auth';
import { PostgresCustodyCoordinationStore } from './civic/postgres-custody-coordination-store';
import { CivicApiError } from './civic/service';

const coordinationMutationRateLimit = rateLimit({
  windowMs: 15 * 60_000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    code: 'CUSTODY_COORDINATION_RATE_LIMITED',
    message: 'Demasiadas operaciones de coordinación; reintentá más tarde.',
  },
});

const coordinationReadRateLimit = rateLimit({
  windowMs: 60_000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    code: 'CUSTODY_COORDINATION_RATE_LIMITED',
    message: 'Demasiadas lecturas de coordinación; esperá un momento.',
  },
});

const validationDetails = (issues: Array<{ path: Array<string | number>; code: string }>) =>
  issues.map((issue) => ({ path: `$.${issue.path.join('.')}`, code: issue.code }));

function privateResponse(res: Response): void {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Vary', 'Authorization, X-Civic-Device-Token');
}

function privateRoute(_req: Request, res: Response, next: NextFunction): void {
  privateResponse(res);
  next();
}

function apiError(res: Response, error: unknown): void {
  if (error instanceof CivicApiError) {
    res.status(error.status).json({ code: error.code, message: error.message, path: error.path });
    return;
  }
  // Nunca registrar ids, headers, body ni términos de una coordinación.
  console.error('[civic-custody-coordination] request failed:', error instanceof Error ? error.name : 'unknown_error');
  res.status(500).json({
    code: 'CUSTODY_COORDINATION_ERROR',
    message: 'No se pudo procesar la coordinación privada.',
  });
}

export function registerCivicCustodyCoordinationRoutes(app: Express): void {
  const store = new PostgresCustodyCoordinationStore();
  const service = new CustodyCoordinationService(store);
  const deviceTokens = new CivicDeviceTokenManager();

  app.post(
    '/api/v1/civic/custody/coordination/proposals',
    privateRoute,
    coordinationMutationRateLimit,
    authenticateToken,
    async (req: AuthRequest, res: Response) => {
      privateResponse(res);
      const body = createCustodyCoordinationProposalSchema.safeParse(req.body);
      const idempotency = custodyCoordinationIdempotencyKeySchema.safeParse(req.header('Idempotency-Key'));
      if (!body.success || !idempotency.success) {
        const issues = [
          ...(body.success ? [] : body.error.issues),
          ...(idempotency.success
            ? []
            : idempotency.error.issues.map((issue) => ({ ...issue, path: ['headers', 'idempotency-key'] }))),
        ];
        res.status(422).json({
          code: 'INVALID_CUSTODY_COORDINATION_PROPOSAL',
          message: 'El contrato de la propuesta no es válido.',
          details: validationDetails(issues),
        });
        return;
      }
      try {
        const result = await service.create(req.user!.userId, body.data, idempotency.data);
        res.status(result.status === 'accepted' ? 201 : 200).json(result);
      } catch (error) {
        apiError(res, error);
      }
    },
  );

  app.get(
    '/api/v1/civic/custody/coordination/proposals',
    privateRoute,
    coordinationReadRateLimit,
    authenticateToken,
    async (req: AuthRequest, res: Response) => {
      privateResponse(res);
      const query = custodyCoordinationListQuerySchema.safeParse(req.query);
      if (!query.success) {
        res.status(422).json({
          code: 'INVALID_CUSTODY_COORDINATION_QUERY',
          message: 'La consulta de coordinación no es válida.',
        });
        return;
      }
      try {
        res.status(200).json(await service.listCoordinator(
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
    '/api/v1/civic/custody/coordination/status',
    privateRoute,
    coordinationReadRateLimit,
    authenticateToken,
    async (req: AuthRequest, res: Response) => {
      privateResponse(res);
      const body = custodyCoordinationStatusSchema.safeParse(req.body);
      if (!body.success) {
        res.status(422).json({
          code: 'INVALID_CUSTODY_COORDINATION_STATUS',
          message: 'La consulta puntual de coordinación no es válida.',
        });
        return;
      }
      const proof = req.header('X-Civic-Device-Token');
      if (!proof) {
        res.status(401).json({
          code: 'MISSING_CIVIC_PROOF',
          message: 'Falta demostrar el dispositivo dueño de la necesidad.',
        });
        return;
      }
      const claims = deviceTokens.verify(proof);
      if (!claims) {
        res.status(403).json({ code: 'INVALID_CIVIC_PROOF', message: 'La credencial del dispositivo no es válida.' });
        return;
      }
      try {
        res.status(200).json(await service.ownerStatus({
          actorKey: claims.sub,
          linkedUserId: null,
          revokedAt: null,
        }, req.user!.userId, body.data.grantId));
      } catch (error) {
        apiError(res, error);
      }
    },
  );

  app.post(
    '/api/v1/civic/custody/coordination/proposals/decide',
    privateRoute,
    coordinationMutationRateLimit,
    authenticateToken,
    async (req: AuthRequest, res: Response) => {
      privateResponse(res);
      const body = decideCustodyCoordinationProposalSchema.safeParse(req.body);
      const idempotency = custodyCoordinationIdempotencyKeySchema.safeParse(req.header('Idempotency-Key'));
      if (!body.success || !idempotency.success) {
        const issues = [
          ...(body.success ? [] : body.error.issues),
          ...(idempotency.success
            ? []
            : idempotency.error.issues.map((issue) => ({ ...issue, path: ['headers', 'idempotency-key'] }))),
        ];
        res.status(422).json({
          code: 'INVALID_CUSTODY_COORDINATION_DECISION',
          message: 'El contrato de decisión no es válido.',
          details: validationDetails(issues),
        });
        return;
      }
      const proof = req.header('X-Civic-Device-Token');
      if (!proof) {
        res.status(401).json({
          code: 'MISSING_CIVIC_PROOF',
          message: 'Falta demostrar el dispositivo dueño de la necesidad.',
        });
        return;
      }
      const claims = deviceTokens.verify(proof);
      if (!claims) {
        res.status(403).json({ code: 'INVALID_CIVIC_PROOF', message: 'La credencial del dispositivo no es válida.' });
        return;
      }
      try {
        const result = await service.decide({
          actorKey: claims.sub,
          linkedUserId: null,
          revokedAt: null,
        }, req.user!.userId, body.data, idempotency.data);
        res.status(result.status === 'accepted' ? 201 : 200).json(result);
      } catch (error) {
        apiError(res, error);
      }
    },
  );
}
