import { createHash } from 'node:crypto';

import { getDb, MapaLecturaRepository, type ConsultaMapa } from '@v2/db';

import { HttpError } from '../../middleware/error-handler.js';

import { cursorMapaSchema, lecturaMapaSchema } from './validation.js';

export async function leerMapa(query: unknown) {
  const q = lecturaMapaSchema.parse(query);
  const { cursor: token, hasta: _hasta, ...filtros } = q;
  const huella = createHash('sha256').update(JSON.stringify(filtros)).digest('hex');
  let cursor;
  if (token) {
    try {
      cursor = cursorMapaSchema.parse(JSON.parse(Buffer.from(token, 'base64url').toString('utf8')));
    } catch {
      throw new HttpError(
        400,
        'CURSOR_INVALIDO',
        'El enlace de continuación no es válido. Volvé a abrir la primera página.',
      );
    }
  }
  if (cursor && cursor.filtros !== huella)
    throw new HttpError(
      400,
      'FILTROS_CAMBIADOS',
      'Los filtros cambiaron. Volvé a la primera página.',
    );
  const hasta = cursor ? new Date(cursor.hasta) : (q.hasta ?? new Date());
  if (q.desde && q.desde > hasta)
    throw new HttpError(400, 'PERIODO_INVALIDO', 'La fecha desde debe ser anterior a hasta.');
  const consulta: ConsultaMapa = {
    capas: q.capas,
    limite: q.limite ?? 500,
    hasta,
    ...(q.desde ? { desde: q.desde } : {}),
    ...(q.bbox ? { bbox: q.bbox } : {}),
    ...(q.provinceId === undefined ? {} : { provinceId: q.provinceId }),
    ...(q.cityId === undefined ? {} : { cityId: q.cityId }),
    ...(q.lugarId === undefined ? {} : { lugarId: q.lugarId }),
    ...(q.tipo ? { tipo: q.tipo } : {}),
    ...(q.clase ? { clase: q.clase } : {}),
    ...(q.tema ? { tema: q.tema } : {}),
    ...(q.estado ? { estado: q.estado } : {}),
    ...(cursor ? { cursor: { fecha: cursor.fecha, id: cursor.id } } : {}),
  };
  const lectura = await new MapaLecturaRepository(getDb()).leer(consulta);
  return {
    ...lectura,
    metadata: {
      ...lectura.metadata,
      siguiente: lectura.metadata.siguiente
        ? Buffer.from(
            JSON.stringify({
              ...lectura.metadata.siguiente,
              hasta: hasta.toISOString(),
              filtros: huella,
            }),
          ).toString('base64url')
        : null,
    },
  };
}
