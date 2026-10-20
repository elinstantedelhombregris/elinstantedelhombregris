import { z } from 'zod';

import { MOTIVOS_DE_REPORTE, VALORES_DE_OPINION } from '../participacion/pila.js';

const slug = z
  .string()
  .regex(/^[A-Za-z0-9_-]{1,120}$/, 'No reconocemos esa campaña.')
  .optional();

export const pedidoTandaSchema = z
  .object({
    campana: slug,
    /** Desde «Completar los de tu región» (Ver). Sólo se honra si es la región de quien mira. */
    priorizarRegion: z.string().max(40).optional(),
  })
  .strict();

export const opinionSchema = z
  .object({
    valor: z.enum(VALORES_DE_OPINION, {
      errorMap: () => ({ message: 'Elegí yo también, yo no o paso.' }),
    }),
    provinciaId: z.number().int().positive().nullable(),
  })
  .strict();

export const dueloSchema = z
  .object({
    a: z.string().uuid(),
    b: z.string().uuid(),
    primero: z.string().uuid().nullable(),
  })
  .strict()
  .refine((v) => v.a !== v.b, { message: 'Un duelo necesita dos aportes distintos.', path: ['b'] })
  .refine((v) => v.primero === null || v.primero === v.a || v.primero === v.b, {
    message: 'Elegí uno de los dos, o los dos por igual.',
    path: ['primero'],
  });

export const reporteSchema = z
  .object({
    motivo: z.enum(MOTIVOS_DE_REPORTE, {
      errorMap: () => ({ message: 'Elegí por qué no va.' }),
    }),
  })
  .strict();

export const retencionSchema = z
  .object({
    motivo: z
      .string()
      .trim()
      .min(3, 'Escribí el motivo en pocas palabras.')
      .max(200, 'El límite es 200 caracteres.'),
  })
  .strict();

export type PedidoTanda = z.infer<typeof pedidoTandaSchema>;
export type OpinionInput = z.infer<typeof opinionSchema>;
export type DueloInput = z.infer<typeof dueloSchema>;
export type ReporteInput = z.infer<typeof reporteSchema>;
