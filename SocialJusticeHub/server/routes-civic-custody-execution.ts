import type { Express, NextFunction, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';

import { authenticateToken, type AuthRequest } from './auth';
import {
  createCustodyExecutionEventSchema,
  custodyExecutionIdempotencyKeySchema,
  custodyExecutionInboxQuerySchema,
  custodyExecutionStatusQuerySchema,
  CustodyExecutionService,
} from './civic/custody-execution';
import { CivicDeviceTokenManager } from './civic/device-auth';
import { PostgresCustodyExecutionStore } from './civic/postgres-custody-execution-store';
import { CivicApiError } from './civic/service';

const mutationRateLimit = rateLimit({
  windowMs: 15 * 60_000,
  max: 90,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    code: 'CUSTODY_EXECUTION_RATE_LIMITED',
    message: 'Demasiados eventos de ejecución; reintentá más tarde.',
  },
});

const readRateLimit = rateLimit({
  windowMs: 60_000,
  max: 90,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    code: 'CUSTODY_EXECUTION_RATE_LIMITED',
    message: 'Demasiadas lecturas de ejecución; esperá un momento.',
  },
});

const privateResponse = (res: Response): void => {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Vary', 'Authorization, X-Civic-Device-Token');
};

const privateRoute = (_req: Request, res: Response, next: NextFunction): void => {
  privateResponse(res);
  next();
};

const validationDetails = (issues: Array<{ path: Array<string | number>; code: string }>) =>
  issues.map((issue) => ({ path: `$.${issue.path.join('.')}`, code: issue.code }));

const apiError = (res: Response, error: unknown): void => {
  if (error instanceof CivicApiError) {
    res.status(error.status).json({ code: error.code, message: error.message, path: error.path });
    return;
  }
  // Nunca registrar propuesta, evento, usuario, dispositivo, headers ni body.
  console.error('[civic-custody-execution] request failed:', error instanceof Error ? error.name : 'unknown_error');
  res.status(500).json({
    code: 'CUSTODY_EXECUTION_ERROR',
    message: 'No se pudo procesar la ejecución privada.',
  });
};

export function registerCivicCustodyExecutionRoutes(app: Express): void {
  const service = new CustodyExecutionService(new PostgresCustodyExecutionStore());
  const deviceTokens = new CivicDeviceTokenManager();

  const actorKey = (req: Request, res: Response): string | null | undefined => {
    const proof = req.header('X-Civic-Device-Token');
    if (!proof) return null;
    const claims = deviceTokens.verify(proof);
    if (!claims) {
      res.status(403).json({
        code: 'INVALID_CIVIC_PROOF',
        message: 'La credencial del dispositivo no es válida.',
      });
      return undefined;
    }
    return claims.sub;
  };

  app.post(
    '/api/v1/civic/custody/execution/events',
    privateRoute,
    mutationRateLimit,
    authenticateToken,
    async (req: AuthRequest, res: Response) => {
      privateResponse(res);
      const body = createCustodyExecutionEventSchema.safeParse(req.body);
      const idempotency = custodyExecutionIdempotencyKeySchema.safeParse(req.header('Idempotency-Key'));
      if (!body.success || !idempotency.success) {
        const issues = [
          ...(body.success ? [] : body.error.issues),
          ...(idempotency.success
            ? []
            : idempotency.error.issues.map((issue) => ({ ...issue, path: ['headers', 'idempotency-key'] }))),
        ];
        res.status(422).json({
          code: 'INVALID_CUSTODY_EXECUTION_EVENT',
          message: 'El contrato del evento de ejecución no es válido.',
          details: validationDetails(issues),
        });
        return;
      }
      const ownerActorKey = actorKey(req, res);
      if (ownerActorKey === undefined) return;
      try {
        const result = await service.recordEvent(
          { actorKey: ownerActorKey },
          req.user!.userId,
          body.data,
          idempotency.data,
        );
        res.status(result.status === 'rejected' ? 409 : result.status === 'accepted' ? 201 : 200).json(result);
      } catch (error) {
        apiError(res, error);
      }
    },
  );

  app.get(
    '/api/v1/civic/custody/execution/status',
    privateRoute,
    readRateLimit,
    authenticateToken,
    async (req: AuthRequest, res: Response) => {
      privateResponse(res);
      const query = custodyExecutionStatusQuerySchema.safeParse(req.query);
      if (!query.success) {
        res.status(422).json({
          code: 'INVALID_CUSTODY_EXECUTION_STATUS_QUERY',
          message: 'La consulta puntual de ejecución no es válida.',
        });
        return;
      }
      const ownerActorKey = actorKey(req, res);
      if (ownerActorKey === undefined) return;
      try {
        res.status(200).json(await service.status(
          { actorKey: ownerActorKey },
          req.user!.userId,
          query.data.proposalId,
        ));
      } catch (error) {
        apiError(res, error);
      }
    },
  );

  app.get(
    '/api/v1/civic/custody/execution/inbox',
    privateRoute,
    readRateLimit,
    authenticateToken,
    async (req: AuthRequest, res: Response) => {
      privateResponse(res);
      const query = custodyExecutionInboxQuerySchema.safeParse(req.query);
      if (!query.success) {
        res.status(422).json({
          code: 'INVALID_CUSTODY_EXECUTION_INBOX_QUERY',
          message: 'La consulta de la bandeja de ejecución no es válida.',
        });
        return;
      }
      try {
        res.status(200).json(await service.inbox(
          req.user!.userId,
          query.data.limit,
          query.data.cursor,
        ));
      } catch (error) {
        apiError(res, error);
      }
    },
  );
}
