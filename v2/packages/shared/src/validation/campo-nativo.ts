import { z } from 'zod';

import { envioCampoSchema } from './campo-recursos.js';
import {
  planEscuchaSchema,
  resultadoEscuchaSchema,
  revisarEvidenciaSchema,
} from './gestion-iniciativas.js';

export const nuevoDispositivoCampoSchema = z
  .object({
    usuarioId: z.number().int().positive(),
    nombre: z
      .string()
      .trim()
      .min(3, 'Escribí al menos tres caracteres para identificar el teléfono.')
      .max(80, 'Usá como máximo 80 caracteres.'),
  })
  .strict();
export const vinculoFichaTareaSchema = z
  .object({
    idLocal: z.string().uuid(),
    revision: z.number().int().positive(),
    fichaId: z.string().uuid().nullable(),
  })
  .strict();
export const tareaCampoNativaSchema = z.object({
  id: z.number().int().positive(),
  iniciativaId: z.number().int().positive(),
  slug: z.string(),
  titulo: z.string(),
  alcance: z.string(),
  revision: z.number().int().positive(),
  estado: z.enum(['todo', 'in_progress', 'blocked', 'done']),
  escucha: planEscuchaSchema,
  fichaId: z.string().uuid().nullable(),
  fichaTitulo: z.string().nullable(),
});
export const paqueteCampoSchema = z.object({
  usuarioId: z.number().int().positive(),
  dispositivoId: z.string().uuid(),
  items: z.array(tareaCampoNativaSchema),
  siguiente: z.number().int().positive().nullable(),
});
export const estadoEvidenciaCampoSchema = z.object({
  id: z.number().int().positive(),
  revision: z.number().int().positive(),
  retirada: z.boolean(),
  revisada: z.boolean(),
});
export type TareaCampoNativa = z.infer<typeof tareaCampoNativaSchema>;
export type PaqueteCampo = z.infer<typeof paqueteCampoSchema>;
export interface DispositivoCampo {
  id: string;
  nombre: string;
  expira: string;
  revocado: boolean;
}
export const resultadoFichaCampoSchema = z.object({
  revision: z.number().int().positive().optional(),
  id: z.number(),
  titulo: z.string(),
  texto: z.string().nullable(),
  url: z.string().nullable(),
  revisada: z.boolean(),
  retirada: z.boolean(),
  notaRevision: z.string().nullable(),
  firmaRevision: z.string().nullable(),
  resultadoEscucha: resultadoEscuchaSchema.nullable(),
  tareaId: z.number(),
  tareaTitulo: z.string(),
  iniciativaSlug: z.string(),
});
export type ResultadoFichaCampo = z.infer<typeof resultadoFichaCampoSchema>;

// Persistencia local validada; las notas nunca forman parte del sobre de envío.
export const camposResumenCampoSchema = z
  .object({
    titulo: z.string(),
    texto: z.string(),
    desde: z.string(),
    hasta: z.string(),
    observaciones: z.string(),
    ausencias: z.string(),
    limites: z.string(),
    proximoPaso: z.string(),
  })
  .strict();

export const cuadernoNativoSchema = z
  .object({
    id: z.string().uuid(),
    usuarioId: z.number().int().positive(),
    origen: z.string().url(),
    tarea: tareaCampoNativaSchema,
    notas: z.string().max(12000),
    campos: camposResumenCampoSchema,
    version: z.number().int().nonnegative(),
    estado: z.enum(['borrador', 'pendiente', 'conflicto', 'enviado', 'retirado']),
    sobre: envioCampoSchema.nullable(),
    retiro: revisarEvidenciaSchema.nullable(),
    evidenciaId: z.number().int().positive().nullable(),
    intentos: z.number().int().nonnegative(),
    siguienteIntento: z.number(),
    mensaje: z.string(),
  })
  .strict();
export type CuadernoNativo = z.infer<typeof cuadernoNativoSchema>;
