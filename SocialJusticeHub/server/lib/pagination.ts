import { z } from 'zod';
import type { Request } from 'express';

const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).max(10000).default(0),
  page: z.coerce.number().int().min(1).max(500).optional(),
});

export type Pagination = z.infer<typeof paginationSchema>;

export function parsePagination(req: Request): Pagination {
  const result = paginationSchema.safeParse(req.query);
  if (!result.success) {
    return { limit: 20, offset: 0 };
  }
  const { limit, offset, page } = result.data;
  if (page !== undefined) {
    return { limit, offset: (page - 1) * limit, page };
  }
  return { limit, offset };
}
