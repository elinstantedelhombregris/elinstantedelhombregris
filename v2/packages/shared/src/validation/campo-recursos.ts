import { z } from 'zod';

import { evidenciaTareaSchema, resultadoEscuchaSchema } from './gestion-iniciativas.js';

export const vinculoReservaSchema = z
  .object({
    idLocal: z.string().uuid(),
    reservaId: z.string().uuid('Elegí una reserva.'),
    revisionReserva: z.number().int().positive(),
    revisionTarea: z.number().int().positive(),
    accion: z.enum(['vincular', 'desvincular']),
  })
  .strict();
export type VinculoReserva = z.infer<typeof vinculoReservaSchema>;
export const recursosTareaQuerySchema = z
  .object({
    disponibles: z.enum(['si']).optional(),
    despues: z.string().uuid().optional(),
  })
  .strict();
export const envioCampoSchema = evidenciaTareaSchema
  .extend({
    usuarioId: z.number().int().positive(),
    revisionTarea: z.number().int().positive(),
    resultadoEscucha: resultadoEscuchaSchema,
    declaroRealizada: z.literal(true, {
      errorMap: () => ({ message: 'Confirmá que realizaste la escucha.' }),
    }),
  })
  .strict();
export type EnvioCampo = z.infer<typeof envioCampoSchema>;
