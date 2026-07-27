import { z } from 'zod';

/**
 * Validación del borde del mapa cívico.
 * Spec: `docs/specs/2026-07-26-mapa-2-la-verdad-de-la-ubicacion.md` §5.
 */

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

/**
 * La captura de campo (spec 4 §4).
 *
 * Ojo con lo que NO se valida acá: `precisionPedida` es lo que la persona
 * eligió, no lo que se publica. El servicio la recalcula con
 * `publishedPrecision` del núcleo, así que un cliente modificado que mande
 * `exact` sobre una necesidad de alta sensibilidad no consigue publicarla
 * exacta — consigue que el servidor le devuelva un recibo diciendo que la
 * engrosó y por qué.
 */
export const capturaSchema = z.object({
  contrato: z.literal('basta-civic-captura/v1'),
  idLocal: z.string().uuid('idLocal tiene que ser un UUID del dispositivo.'),
  tipo: z.enum(['observation', 'need', 'resource']),
  texto: z.string().trim().min(1, 'La captura no puede estar vacía.').max(2000),
  punto: z
    .object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    })
    .nullable()
    .default(null),
  precisionPedida: z.enum(['exact', '100m', '500m', 'neighborhood', 'city', 'province']),
  sensitivity: z.enum(['low', 'moderate', 'high']).default('low'),
  provinceId: z.number().int().positive().optional(),
  capturadoEn: z.string().datetime().optional(),
});

export type CapturaInput = z.infer<typeof capturaSchema>;
