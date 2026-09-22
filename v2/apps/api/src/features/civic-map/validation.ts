import { z } from 'zod';

/**
 * Validación del borde del mapa cívico.
 * Spec: `docs/specs/2026-07-26-mapa-2-la-verdad-de-la-ubicacion.md` §5.
 */

export {
  consultaSenalesSchema,
  lecturaMapaSchema,
  cursorMapaSchema,
  type ConsultaSenalesQuery,
} from '@v2/shared';

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

export { MAPA_CAPAS as CAPAS } from '@v2/shared';
