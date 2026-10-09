import { createHash } from 'node:crypto';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

import { ExportacionesRepository, getDb } from '@v2/db';
import { solicitarExportacionSchema } from '@v2/shared';
import { Router, type Router as RouterType } from 'express';
import { rateLimit } from 'express-rate-limit';
import { z } from 'zod';

import { logger } from '../../lib/logger.js';
import { HttpError } from '../../middleware/error-handler.js';

import { zipPublico } from './zip-stream.js';

const router: RouterType = Router();
const uuid = z.string().uuid();
const limite = rateLimit({
  windowMs: 3_600_000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    error: {
      code: 'EXPORTACIONES_LIMITE',
      message: 'Ya pediste varios archivos. Esperá un rato antes de volver a pedir.',
    },
  },
});

router.post('/', limite, async (req, res, next) => {
  try {
    const solicitud = solicitarExportacionSchema.parse(req.body);
    const repo = new ExportacionesRepository(getDb());
    let fila;
    try {
      fila = await repo.crear(
        solicitud,
        createHash('sha256').update(JSON.stringify(solicitud)).digest('hex'),
      );
    } catch (e) {
      if (e instanceof Error && e.message === 'SOLICITUD_CAMBIADA')
        throw new HttpError(
          409,
          'SOLICITUD_CAMBIADA',
          'Ese reintento tiene otro alcance. Pedí un trabajo nuevo.',
        );
      throw e;
    }
    if (!fila)
      throw new HttpError(
        429,
        'COLA_COMPLETA',
        'Hay varios archivos en preparación. Volvé a pedirlo en un rato.',
      );
    const vigente = await repo.vigencia(fila.id);
    if (!vigente) throw new HttpError(404, 'NO_ENCONTRADO', 'No encontramos el trabajo.');
    res
      .status(202)
      .set('Cache-Control', 'no-store')
      .json({ data: repo.dto(vigente) });
  } catch (e) {
    next(e);
  }
});
router.get('/:id', async (req, res, next) => {
  try {
    const repo = new ExportacionesRepository(getDb());
    const f = await repo.vigencia(uuid.parse(req.params.id));
    if (!f)
      throw new HttpError(404, 'NO_ENCONTRADO', 'No encontramos el trabajo. Puede haber vencido.');
    res.set('Cache-Control', 'no-store').json({ data: repo.dto(f) });
  } catch (e) {
    next(e);
  }
});
router.post('/:id/cancelar', async (req, res, next) => {
  try {
    const id = uuid.parse(req.params.id);
    const { idSolicitud } = z.object({ idSolicitud: uuid }).strict().parse(req.body);
    const repo = new ExportacionesRepository(getDb());
    const f = await repo.cancelar(id, idSolicitud);
    if (!f)
      throw new HttpError(
        403,
        'SIN_CONTROL',
        'Para cancelar necesitás el control de la solicitud original.',
      );
    res.set('Cache-Control', 'no-store').json({ data: repo.dto(f) });
  } catch (e) {
    next(e);
  }
});
router.get('/:id/archivo', async (req, res, next) => {
  try {
    const repo = new ExportacionesRepository(getDb());
    const f = await repo.vigencia(uuid.parse(req.params.id));
    if (!f) throw new HttpError(404, 'NO_ENCONTRADO', 'No encontramos el trabajo.');
    if (f.estado !== 'disponible')
      throw new HttpError(
        409,
        'ARCHIVO_NO_DISPONIBLE',
        f.mensaje ?? 'Todavía estamos preparando el archivo.',
      );
    res.set({
      'Content-Type': 'application/zip',
      'Cache-Control': 'no-store, no-transform',
      'Content-Disposition': `attachment; filename="basta-registro-${f.id}.zip"`,
      'X-Content-Type-Options': 'nosniff',
    });
    if (req.method === 'HEAD') {
      res.end();
      return;
    }
    await pipeline(
      Readable.from(zipPublico(repo.leer(f.id, f.revisionPublica)), {
        objectMode: false,
        highWaterMark: 64 * 1024,
      }),
      res,
    );
  } catch (e) {
    if (!res.headersSent) next(e);
    else {
      logger.info(
        { errorName: e instanceof Error ? e.name : 'Error' },
        'Descarga pública interrumpida',
      );
      res.destroy();
    }
  }
});
export { router as trabajosExportacionesRouter };
