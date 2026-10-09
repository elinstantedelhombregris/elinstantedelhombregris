import { z } from 'zod';

import { senalSchema } from '../validation/senal.js';

export const contribucionSchema = z
  .object({
    senal: senalSchema,
    campanaId: z.string().uuid().nullable(),
    edicion: z.number().int().positive().nullable(),
    modo: z.enum(['personal', 'asistido']).default('personal'),
    autorConfirmo: z.boolean().default(false),
    cuentaEsperada: z.number().int().positive().nullable().optional(),
    fragmentos: z
      .array(
        z
          .object({
            pregunta: z
              .string()
              .trim()
              .min(1, 'Este campo necesita un poco más de contexto.')
              .max(500, 'Acortá este campo sin perder su sentido.'),
            respuesta: z
              .string()
              .trim()
              .min(1, 'Este campo necesita un poco más de contexto.')
              .max(2000, 'Acortá este campo sin perder su sentido.'),
          })
          .strict(),
      )
      .max(4, 'Acortá este campo sin perder su sentido.'),
    interpretacionConfirmada: z.literal(true),
    aceptaPublicar: z.literal(true),
  })
  .strict()
  .refine((v) => v.modo !== 'asistido' || v.autorConfirmo, {
    message: 'La persona que habló tiene que revisar y autorizar su aporte antes de compartirlo.',
    path: ['autorConfirmo'],
  })
  .refine((v) => (v.campanaId === null) === (v.edicion === null), {
    message: 'La campaña y su edición van juntas.',
    path: ['edicion'],
  });
export const corregirAporteSchema = z
  .object({
    revision: z.string().datetime(),
    texto: z
      .string()
      .trim()
      .min(1, 'Este campo necesita un poco más de contexto.')
      .max(2000, 'Acortá este campo sin perder su sentido.'),
    cedeLicencia: z.boolean(),
    aceptaPublicar: z.literal(true),
  })
  .strict();
export const vincularAportesSchema = z
  .object({
    senales: z
      .array(z.string().uuid())
      .min(1, 'Este campo necesita un poco más de contexto.')
      .max(100, 'Acortá este campo sin perder su sentido.'),
    confirmaControl: z.literal(true),
  })
  .strict();
export const seguirSchema = z
  .object({
    tipo: z.enum(['campana', 'ficha', 'territorio', 'tema']),
    objeto: z
      .string()
      .trim()
      .min(1, 'Este campo necesita un poco más de contexto.')
      .max(100, 'Acortá este campo sin perder su sentido.'),
  })
  .strict();
export const guardarAnalisisSchema = z
  .object({
    nombre: z
      .string()
      .trim()
      .min(3, 'Este campo necesita un poco más de contexto.')
      .max(120, 'Acortá este campo sin perder su sentido.'),
    consulta: z.record(z.string().max(200, 'Acortá este campo sin perder su sentido.')),
    corte: z.string().datetime().nullable(),
  })
  .strict();
export type ContribucionInput = z.infer<typeof contribucionSchema>;
export type SeguimientoTipo = z.infer<typeof seguirSchema>['tipo'];
export interface AportePropio {
  id: string;
  texto: string;
  tipo: string;
  estado: string;
  tema: string | null;
  creadaEn: string;
  revision: string;
  cedeLicencia: boolean;
  precision: string;
  campanaId: string | null;
  campanaTitulo: string | null;
  edicion: number | null;
}
export interface EspacioPersonal {
  aportes: AportePropio[];
  totalAportes: number;
  procesos?: { id: string; tipo: string; titulo: string; href: string; revision: number }[];
  seguimientos: { id: string; tipo: string; objeto: string; titulo: string; href: string }[];
  analisis: {
    id: string;
    nombre: string;
    consulta: Record<string, string>;
    corte: string | null;
  }[];
}
export interface ManifiestoExportacion {
  esquema: string;
  generadoEn: string;
  corte: string;
  alcance: string;
  completo: boolean;
  conteos: Record<string, number>;
  filtros: Record<string, unknown>;
  omisiones: string[];
  licencias: { compilacion: string; textos: string };
  metodo: string;
  sha256: string;
}
