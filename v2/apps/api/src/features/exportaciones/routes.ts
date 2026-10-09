import { createHash } from 'node:crypto';

import { DatosParticipacionRepository, getDb } from '@v2/db';
import { consultaParticipacionSchema, LICENCIAS } from '@v2/shared';
import { Router, type Router as RouterType } from 'express';
import { z } from 'zod';

import { HttpError } from '../../middleware/error-handler.js';

import { trabajosExportacionesRouter } from './trabajos-routes.js';

import type { ManifiestoExportacion } from '@v2/shared';

const router: RouterType = Router();
router.use('/trabajos', trabajosExportacionesRouter);
const consulta = consultaParticipacionSchema
  .innerType()
  .extend({ corte: z.string().datetime().optional() });
router.get('/publica', async (req, res, next) => {
  try {
    const v = consulta.parse(req.query);
    const corte = v.corte ? new Date(v.corte) : new Date();
    if (corte.getTime() > Date.now() + 1000)
      throw new HttpError(400, 'CORTE_INVALIDO', 'El corte no puede estar en el futuro.');
    const { corte: _corte, ...entrada } = v;
    const q = consultaParticipacionSchema.parse(entrada);
    const datos = await new DatosParticipacionRepository(getDb()).pagina(q, corte);
    const contenido = JSON.stringify(datos.registros);
    const manifiesto: ManifiestoExportacion = {
      esquema: 'basta-registro-publico/v1',
      generadoEn: new Date().toISOString(),
      corte: corte.toISOString(),
      alcance: 'Registro canónico de señales con los filtros declarados.',
      completo: datos.siguiente === null && !q.cursor,
      conteos: {
        elegibles: datos.total,
        entregados: datos.registros.length,
        textosReservados: datos.textoOmitido,
      },
      filtros: q,
      omisiones: [
        'Identidades internas, datos de cuenta, actores, secretos y relatos privados.',
        'Texto sin cesión. Coordenadas sensibles y dirección exacta.',
        'Registros legados fuera del canon; respuestas individuales y vectores de significado.',
      ],
      licencias: { compilacion: LICENCIAS.compilacion.id, textos: LICENCIAS.textos.id },
      metodo:
        'Consulta paginada por identificador público, corte de creación fijo y permisos vigentes. El retiro se respeta durante la descarga.',
      sha256: createHash('sha256').update(contenido).digest('hex'),
    };
    res.set('Cache-Control', 'no-store').json({ data: { ...datos, manifiesto } });
  } catch (e) {
    next(e);
  }
});
router.get('/contexto', async (req, res, next) => {
  try {
    const v = consulta.parse(req.query);
    const corte = v.corte ? new Date(v.corte) : new Date();
    if (corte.getTime() > Date.now() + 1000)
      throw new HttpError(400, 'CORTE_INVALIDO', 'El corte no puede estar en el futuro.');
    const { corte: _corte, ...entrada } = v;
    const q = consultaParticipacionSchema.parse(entrada);
    res
      .set('Cache-Control', 'no-store')
      .json({ data: await new DatosParticipacionRepository(getDb()).contexto(q, corte) });
  } catch (e) {
    next(e);
  }
});
router.get('/catalogo', (_req, res) => {
  res.json({
    data: {
      esquema: 'basta-catalogo-publico/v2',
      conjuntos: [
        {
          id: 'senales',
          titulo: 'Voces del registro público',
          formatos: ['CSV', 'JSONL', 'GeoJSON'],
          permiso: 'Textos según cesión; ubicación protegida.',
        },
        {
          id: 'procesos',
          titulo: 'Campañas y fichas de futuro',
          formatos: ['JSON'],
          permiso: 'Metadatos y vínculos públicos; sin las reglas de la campaña ni datos de cuenta.',
        },
      ],
      licencias: LICENCIAS,
      preparacion: '/api/v1/exportaciones/trabajos',
      nota: 'Las descargas están abiertas. Pedí un archivo; su preparación sigue en el servidor. Cada paquete dice qué incluye, qué omite y hasta dónde llega.',
    },
  });
});
export { router as exportacionesRouter };
