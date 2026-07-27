/**
 * Open data HTTP slice — dreams, provinces, aggregations.
 *
 *   GET  /api/open-data/provinces            — 24 Argentine provinces
 *   GET  /api/open-data/dreams               — recent dreams (filters)
 *   POST /api/open-data/dreams               — submit a dream (anon ok)
 *   GET  /api/open-data/dreams/by-province   — count + top categories per province
 */
import { prepareRecordLocation } from '@v2/civic-core';
import { dreams as dreamsTable, DreamsRepository, eq, GeographicRepository, getDb, normalizeProvinceName, sql } from '@v2/db';
import { Router, type Router as RouterType } from 'express';
import { z } from 'zod';

import { optionalAuthenticate } from '../../middleware/auth.js';
import { anonSubmitRateLimit } from '../../middleware/rate-limit.js';

const router: RouterType = Router();

const submitSchema = z.object({
  body: z.string().trim().min(1, 'Tu sueño no puede estar vacío.').max(2000),
  category: z.string().trim().max(60).optional(),
  /** Either provinceId (preferred) or provinceName (we'll normalize). */
  provinceId: z.number().int().positive().optional(),
  provinceName: z.string().trim().max(120).optional(),
  submittedAs: z.string().trim().max(80).optional(),
  /**
   * La ubicación precisa, cuando quien habla la eligió (D2 — la precisión la
   * elige quien habla, spec 2 §6). Todo opcional: sin esto el envío se comporta
   * exactamente como antes, a nivel provincia, y los 30 segundos no cambian.
   */
  punto: z
    .object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) })
    .optional(),
  precisionPedida: z.enum(['exact', '100m', '500m', 'neighborhood', 'city', 'province']).optional(),
  locationRole: z.enum(['subject', 'capture', 'service_area', 'meeting_point']).optional(),
  sensitivity: z.enum(['low', 'moderate', 'high']).optional(),
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
        // El mapa de conversión también dibuja con honestidad (spec 1 §5):
        // sin la precisión no puede distinguir un punto clavado de una voz que
        // solo sabe su provincia, y volvería al jitter que miente. Son tres
        // columnas más sobre una consulta que ya se hace — el instrumento
        // sigue siendo lo único que se paga aparte.
        lat: d.lat === null ? null : Number(d.lat),
        lng: d.lng === null ? null : Number(d.lng),
        precision: d.precision,
      })),
    });
  } catch (err) {
    next(err);
  }
});

router.post('/dreams', anonSubmitRateLimit(), optionalAuthenticate, async (req, res, next) => {
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

    /**
     * La precisión la decide el servidor, no el cliente (D7 y spec 4 §4). Sin
     * punto, `prepareRecordLocation` devuelve `province` y nada cambia respecto
     * del comportamiento anterior.
     */
    const ubicacion = prepareRecordLocation({
      point: input.punto ?? null,
      requestedPrecision: input.precisionPedida ?? 'province',
      role: input.locationRole ?? 'subject',
      sensitivity: input.sensitivity ?? 'low',
      audience: 'collective',
    });
    if (ubicacion.publicPoint) {
      insertArgs.lat = String(ubicacion.publicPoint.lat);
      insertArgs.lng = String(ubicacion.publicPoint.lng);
    }
    insertArgs.precision = ubicacion.publishedPrecision;
    if (input.locationRole !== undefined) insertArgs.locationRole = input.locationRole;
    if (input.sensitivity !== undefined) insertArgs.sensitivity = input.sensitivity;

    const dream = await dreamsRepo.create(insertArgs);
    res.status(201).json({
      data: {
        id: dream.id,
        precisionPublicada: ubicacion.publishedPrecision,
        // Cuando el servidor engrosa, quien habló se entera en la misma
        // respuesta — nunca después.
        engrosado: ubicacion.coarsenedBecause,
      },
    });
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
