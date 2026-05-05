import { z } from 'zod';
import type { Request } from 'express';

const ABSOLUTE_MAX_LIMIT = 100;
const ABSOLUTE_MAX_OFFSET = 10000;
const ABSOLUTE_MAX_PAGE = 500;

export interface PaginationOptions {
  /** Default limit when caller omits ?limit=. Capped at maxLimit. */
  defaultLimit?: number;
  /** Hard ceiling on limit. Cannot exceed ABSOLUTE_MAX_LIMIT (100). */
  maxLimit?: number;
}

export interface Pagination {
  limit: number;
  offset: number;
  page?: number;
}

export function parsePagination(req: Request, opts: PaginationOptions = {}): Pagination {
  const maxLimit = Math.min(opts.maxLimit ?? ABSOLUTE_MAX_LIMIT, ABSOLUTE_MAX_LIMIT);
  const defaultLimit = Math.min(opts.defaultLimit ?? 20, maxLimit);

  const schema = z.object({
    // Out-of-range numeric limit is clamped to maxLimit; non-numeric falls back to defaultLimit.
    limit: z.coerce
      .number()
      .int()
      .catch(defaultLimit)
      .transform((v) => Math.min(Math.max(v, 1), maxLimit)),
    offset: z.coerce
      .number()
      .int()
      .min(0)
      .max(ABSOLUTE_MAX_OFFSET)
      .catch(0),
    page: z.coerce.number().int().min(1).max(ABSOLUTE_MAX_PAGE).optional().catch(undefined),
  });

  const result = schema.safeParse(req.query);
  if (!result.success) {
    return { limit: defaultLimit, offset: 0 };
  }
  const { limit, offset, page } = result.data;
  if (page !== undefined) {
    return { limit, offset: (page - 1) * limit, page };
  }
  return { limit, offset };
}
