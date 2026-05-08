/**
 * Open data HTTP slice — dreams, provinces, aggregations.
 *
 *   GET  /api/open-data/provinces            — 24 Argentine provinces
 *   GET  /api/open-data/dreams               — recent dreams (filters)
 *   POST /api/open-data/dreams               — submit a dream (anon ok)
 *   GET  /api/open-data/dreams/by-province   — count + top categories per province
 */
import { dreams as dreamsTable, DreamsRepository, eq, GeographicRepository, getDb, normalizeProvinceName, sql } from '@v2/db';
import { Router, type Router as RouterType } from 'express';
import { z } from 'zod';

import { optionalAuthenticate } from '../../middleware/auth.js';

const router: RouterType = Router();

const submitSchema = z.object({
  body: z.string().trim().min(1, 'Tu sueño no puede estar vacío.').max(2000),
  category: z.string().trim().max(60).optional(),
  /** Either provinceId (preferred) or provinceName (we'll normalize). */
  provinceId: z.number().int().positive().optional(),
  provinceName: z.string().trim().max(120).optional(),
  submittedAs: z.string().trim().max(80).optional(),
});

const listQuery = z.object({
  provinceId: z.coerce.number().int().positive().optional(),
  category: z.string().max(60).optional(),
  limit: z.coerce.number().int().min(1).max(500).default(200),
});

router.get('/provinces', async (_req, res, next) => {
  try {
    const repo = new GeographicRepository(getDb());
    const provinces = await repo.listProvinces();
    res.json({ data: { provinces } });
  } catch (err) {
    next(err);
  }
});

router.get('/dreams', async (req, res, next) => {
  try {
    const filters = listQuery.parse(req.query);
    const repo = new DreamsRepository(getDb());
    const callOpts: Parameters<typeof repo.listApproved>[0] = { limit: filters.limit };
    if (filters.provinceId !== undefined) callOpts.provinceId = filters.provinceId;
    if (filters.category !== undefined) callOpts.category = filters.category;
    const items = await repo.listApproved(callOpts);
    res.json({
      data: items.map((d) => ({
        id: d.id,
        body: d.body,
        category: d.category,
        provinceId: d.provinceId,
        submittedAs: d.submittedAs,
        createdAt: d.createdAt,
      })),
    });
  } catch (err) {
    next(err);
  }
});

router.post('/dreams', optionalAuthenticate, async (req, res, next) => {
  try {
    const input = submitSchema.parse(req.body);
    const dreamsRepo = new DreamsRepository(getDb());
    const geoRepo = new GeographicRepository(getDb());

    let provinceId = input.provinceId;
    if (provinceId === undefined && input.provinceName) {
      const normalized = normalizeProvinceName(input.provinceName);
      const province = await geoRepo.findProvinceByName(normalized);
      if (province) provinceId = province.id;
    }

    const insertArgs: Parameters<typeof dreamsRepo.create>[0] = {
      body: input.body,
      status: 'approved',
    };
    if (req.user) insertArgs.userId = req.user.id;
    if (input.submittedAs !== undefined) insertArgs.submittedAs = input.submittedAs;
    if (input.category !== undefined) insertArgs.category = input.category;
    if (provinceId !== undefined) insertArgs.provinceId = provinceId;

    const dream = await dreamsRepo.create(insertArgs);
    res.status(201).json({ data: { id: dream.id } });
  } catch (err) {
    next(err);
  }
});

router.get('/dreams/by-province', async (_req, res, next) => {
  try {
    const db = getDb();
    const rows = await db
      .select({
        provinceId: dreamsTable.provinceId,
        count: sql<number>`count(*)::int`,
      })
      .from(dreamsTable)
      .where(eq(dreamsTable.status, 'approved'))
      .groupBy(dreamsTable.provinceId);
    res.json({
      data: {
        byProvince: rows.map((r) => ({
          provinceId: r.provinceId,
          count: r.count,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
});

export { router as openDataRouter };
