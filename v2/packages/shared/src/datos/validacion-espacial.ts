import { z } from 'zod';

import referencia from './validacion-espacial.generated.json';

export const TIPOS_INCIDENCIA_ESPACIAL = {
  geometria_invalida: 'Polígono inválido',
  solapamiento: 'Superposición de áreas',
  fuera_de_provincia: 'Área fuera de su provincia',
  sin_cobertura_departamental: 'Diferencia de cobertura departamental',
  sin_codigo: 'Unidad sin código',
  control_no_calculable: 'Control pendiente por geometría inválida o ausente',
} as const;
const capa = z.enum(['provincias', 'departamentos', 'municipios']);
const sha = z.string().regex(/^[a-f0-9]{64}$/);
export const informeEspacialSchema = z.object({
  version: z.string(),
  generadoEn: z.string().datetime(),
  metodoVersion: z.literal('espacial-1'),
  motor: z.object({ shapely: z.string(), geos: z.string(), pyproj: z.string(), proj: z.string() }),
  proyeccion: z.string(),
  umbralM2: z.number().positive(),
  fuentes: z.array(z.object({ nombre: capa, sha256: sha, archivo: z.string() })).length(3),
  limites: z.array(z.string()),
  estado: z.enum(['con_observaciones', 'sin_hallazgos_en_estos_controles']),
  capas: z
    .array(
      z.object({
        nombre: capa,
        rasgos: z.number().int().nonnegative(),
        validos: z.number().int().nonnegative(),
        invalidos: z.number().int().nonnegative(),
        sinCodigo: z.number().int().nonnegative(),
        incidencias: z.number().int().nonnegative(),
      }),
    )
    .length(3),
  incidencias: z.array(
    z.object({
      tipo: z.enum([
        'geometria_invalida',
        'solapamiento',
        'fuera_de_provincia',
        'sin_cobertura_departamental',
        'sin_codigo',
        'control_no_calculable',
      ]),
      capa,
      unidades: z
        .array(
          z.object({
            indice: z.number().int().nonnegative(),
            codigo: z.string().nullable(),
            nombre: z.string(),
          }),
        )
        .min(1),
      detalle: z.string(),
      extension: z
        .tuple([z.number().finite(), z.number().finite(), z.number().finite(), z.number().finite()])
        .optional(),
      areaM2: z.number().finite().nonnegative().optional(),
    }),
  ),
});
export type InformeEspacial = z.infer<typeof informeEspacialSchema>;
export const VALIDACION_ESPACIAL = referencia;
