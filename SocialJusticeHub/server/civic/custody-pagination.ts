import { Buffer } from 'node:buffer';
import { z } from 'zod';

import { CivicApiError } from './service';

export const custodyPageCursorStringSchema = z.string()
  .min(8)
  .max(768)
  .regex(/^[A-Za-z0-9_-]+$/);

const canonicalUtcTimestampSchema = z.string().datetime().refine((value) => {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) && new Date(parsed).toISOString() === value;
});

const custodyPageCursorSchema = z.object({
  v: z.literal(1),
  kind: z.enum(['grant-inbox', 'coordination-inbox', 'execution-inbox']),
  asOf: canonicalUtcTimestampSchema,
  after: z.object({
    rowId: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
  }).strict(),
}).strict();

export type CustodyPageCursorKind = z.infer<typeof custodyPageCursorSchema>['kind'];

export interface CustodyPagePosition {
  rowId: number;
}

export interface CustodyPageRequest {
  asOf: string;
  after: CustodyPagePosition;
}

const invalidCursor = (): never => {
  throw new CivicApiError(
    422,
    'INVALID_CUSTODY_CURSOR',
    'El cursor de la bandeja privada no es válido.',
  );
};

/**
 * El cursor es opaco para el cliente, pero no pretende cifrar datos. Contiene
 * únicamente el corte temporal y el serial técnico del keyset; nunca
 * needId, grantId, actor, usuario, círculo ni payload.
 */
export const encodeCustodyPageCursor = (
  kind: CustodyPageCursorKind,
  request: CustodyPageRequest,
): string => {
  const parsed = custodyPageCursorSchema.safeParse({ v: 1, kind, ...request });
  if (!parsed.success) return invalidCursor();
  return Buffer.from(JSON.stringify(parsed.data), 'utf8').toString('base64url');
};

export const decodeCustodyPageCursor = (
  value: string | undefined,
  expectedKind: CustodyPageCursorKind,
): CustodyPageRequest | null => {
  if (value == null) return null;
  if (!custodyPageCursorStringSchema.safeParse(value).success) return invalidCursor();
  try {
    const decoded = Buffer.from(value, 'base64url');
    // Buffer tolera algunas codificaciones no canónicas; la frontera no.
    if (decoded.toString('base64url') !== value) return invalidCursor();
    const parsed = custodyPageCursorSchema.safeParse(JSON.parse(decoded.toString('utf8')));
    if (!parsed.success || parsed.data.kind !== expectedKind) return invalidCursor();
    return { asOf: parsed.data.asOf, after: parsed.data.after };
  } catch {
    return invalidCursor();
  }
};
