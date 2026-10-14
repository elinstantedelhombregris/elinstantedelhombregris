import { z } from 'zod';

import {
  detalleAlternativaSchema,
  revisionAlternativaSchema,
  type DetalleAlternativa,
  type RevisionAlternativa,
} from './detalle-alternativa';

export const afirmarSchema = z
  .object({
    texto: z
      .string()
      .trim()
      .min(10, 'Este campo necesita un poco más de contexto.')
      .max(500, 'Acortá este campo sin perder su sentido.'),
    idLocal: z.string().uuid(),
  })
  .strict();
export const responderAfirmacionSchema = z
  .object({ valor: z.enum(['acuerdo', 'desacuerdo', 'paso']) })
  .strict();
export const alternativaSchema = z
  .object({
    idLocal: z.string().uuid(),
    detalle: detalleAlternativaSchema.optional(),
    revisionDe: revisionAlternativaSchema.optional(),
    titulo: z
      .string()
      .trim()
      .min(5, 'Este campo necesita un poco más de contexto.')
      .max(160, 'Acortá este campo sin perder su sentido.'),
    funcionamiento: z
      .string()
      .trim()
      .min(20, 'Este campo necesita un poco más de contexto.')
      .max(4000, 'Acortá este campo sin perder su sentido.'),
    resultado: z
      .string()
      .trim()
      .min(10, 'Este campo necesita un poco más de contexto.')
      .max(2000, 'Acortá este campo sin perder su sentido.'),
    dependencias: z.string().trim().max(2000, 'Acortá este campo sin perder su sentido.'),
    presupuesto: z.string().trim().max(2000, 'Acortá este campo sin perder su sentido.'),
    prueba: z
      .string()
      .trim()
      .min(15, 'Este campo necesita un poco más de contexto.')
      .max(3000, 'Acortá este campo sin perder su sentido.'),
    criterioPausa: z
      .string()
      .trim()
      .min(10, 'Este campo necesita un poco más de contexto.')
      .max(1500, 'Acortá este campo sin perder su sentido.'),
  })
  .strict();
export const propuestaPruebaSchema = z
  .object({
    idLocal: z.string().uuid(),
    alternativaId: z.string().uuid(),
    titulo: z
      .string()
      .trim()
      .min(5, 'Este campo necesita un poco más de contexto.')
      .max(160, 'Acortá este campo sin perder su sentido.'),
    plazo: z.string().date(),
    alcance: z
      .string()
      .trim()
      .min(10, 'Este campo necesita un poco más de contexto.')
      .max(2000, 'Acortá este campo sin perder su sentido.'),
  })
  .strict();
export const estadosPrueba = [
  'propuesta',
  'aceptada',
  'en_curso',
  'pausada',
  'implementada',
  'resultado_observado',
  'resultado_revisado',
] as const;
export const avanzarPruebaSchema = z
  .object({
    idLocal: z.string().uuid(),
    firma: z
      .string()
      .trim()
      .min(3, 'Elegí una firma pública para aceptar responsabilidad.')
      .max(120)
      .optional(),
    revision: z.number().int().positive(),
    estado: z.enum(estadosPrueba),
    observacion: z
      .string()
      .trim()
      .min(15, 'Este campo necesita un poco más de contexto.')
      .max(4000, 'Acortá este campo sin perder su sentido.'),
    evidencia: z
      .array(
        z
          .string()
          .url()
          .refine((s) => /^https?:\/\//.test(s)),
      )
      .max(8, 'Acortá este campo sin perder su sentido.'),
  })
  .strict();
export interface DisenoFicha {
  afirmaciones: {
    id: string;
    texto: string;
    acuerdo: number | null;
    desacuerdo: number | null;
    paso: number | null;
    respuestas: number;
    miRespuesta: string | null;
    miExpuesta: boolean;
    puedoRetirar: boolean;
  }[];
  alternativas: {
    detalle?: DetalleAlternativa;
    revisionDe?: RevisionAlternativa;
    revisionPendiente?: boolean;
    id: string;
    titulo: string;
    funcionamiento: string;
    resultado: string;
    dependencias: string;
    presupuesto: string;
    prueba: string;
    criterioPausa: string;
  }[];
  pruebas: {
    id: string;
    titulo: string;
    alternativaId: string;
    plazo: string;
    alcance: string;
    responsableNombre: string | null;
    estado: (typeof estadosPrueba)[number];
    revision: number;
    puedoGestionar: boolean;
    puedoRevisar: boolean;
    eventos: { estado: string; observacion: string; evidencia: string[]; fecha: string }[];
  }[];
}
