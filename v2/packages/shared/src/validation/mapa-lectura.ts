import { z } from 'zod';

export const CAPAS = ['voz', 'pulso', 'propuesta', 'mandato'] as const;

/** `?capas=voz,pulso` — lista separada por comas, vacía significa todas. */
const capasSchema = z
  .string()
  .optional()
  .transform((valor) =>
    valor
      ? valor
          .split(',')
          .map((parte) => parte.trim())
          .filter(Boolean)
      : [],
  )
  .pipe(z.array(z.enum(CAPAS)));

/**
 * `?bbox=oeste,sur,este,norte` en grados WGS84.
 *
 * Se valida el orden además del rango: un bbox invertido no devuelve cero
 * resultados en silencio, devuelve un error que dice qué está mal.
 */
const bboxSchema = z
  .string()
  .optional()
  .transform((valor) => {
    if (!valor) return undefined;
    const partes = valor.split(',').map(Number);
    if (partes.length !== 4 || partes.some((n) => !Number.isFinite(n))) return null;
    const [oeste, sur, este, norte] = partes as [number, number, number, number];
    return { oeste, sur, este, norte };
  })
  .refine((bbox) => bbox !== null, {
    message: 'bbox tiene que ser cuatro números: oeste,sur,este,norte.',
  })
  .refine(
    (bbox) =>
      !bbox ||
      (bbox.sur >= -90 &&
        bbox.norte <= 90 &&
        bbox.oeste >= -180 &&
        bbox.este <= 180 &&
        bbox.sur < bbox.norte &&
        bbox.oeste < bbox.este),
    { message: 'bbox fuera de rango o invertido: se espera oeste<este y sur<norte.' },
  );

export const consultaSenalesSchema = z.object({
  capas: capasSchema,
  bbox: bboxSchema,
  desde: z.coerce.date().optional(),
  hasta: z.coerce.date().optional(),
  limite: z.coerce.number().int().min(1).max(2000).optional(),
});

export type ConsultaSenalesQuery = z.infer<typeof consultaSenalesSchema>;

export const lecturaMapaSchema = consultaSenalesSchema
  .extend({
    provinceId: z.coerce.number().int().positive().optional(),
    cityId: z.coerce.number().int().positive().optional(),
    lugarId: z.coerce.number().int().positive().optional(),
    tipo: z.string().trim().min(1).max(60).optional(),
    clase: z.enum(['hecho', 'deseo', 'acto', 'meta']).optional(),
    tema: z.string().trim().min(1).max(100).optional(),
    estado: z.string().trim().min(1).max(60).optional(),
    cursor: z.string().max(2000).optional(),
  })
  .refine((q) => !q.desde || !q.hasta || q.desde <= q.hasta, {
    message: 'La fecha desde debe ser anterior a hasta.',
  });

export const cursorMapaSchema = z
  .object({
    fecha: z.string().datetime({ offset: true }),
    id: z.string().min(1).max(100),
    hasta: z.string().datetime({ offset: true }),
    filtros: z.string().length(64),
  })
  .refine((c) => Date.parse(c.fecha) <= Date.parse(c.hasta), {
    message: 'El cursor queda fuera del período.',
  });
