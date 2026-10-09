import { z } from 'zod';
export const invitarEquipoSchema = z
  .object({
    tipo: z.enum(['ficha', 'campana']),
    objeto: z.string().uuid(),
    rol: z.enum(['editor', 'facilitador']),
  })
  .strict();
export const codigoEquipoSchema = z.object({ codigo: z.string().regex(/^[a-f0-9]{64}$/) }).strict();
export const revisionDevolucionSchema = z
  .object({
    idLocal: z.string().uuid(),
    texto: z.string().trim().min(15, 'Explicá qué necesita revisarse.').max(2000),
    aceptaPublicar: z.literal(true),
  })
  .strict();
export const respuestaRevisionSchema = z
  .object({
    texto: z
      .string()
      .trim()
      .min(15, 'Explicá cómo se incorporó o por qué sigue abierto.')
      .max(3000),
  })
  .strict();
export const preferenciasCivicasSchema = z.object({ avisos: z.boolean() }).strict();
export const cerrarCuentaSchema = z
  .object({ password: z.string().min(1).max(200), confirma: z.literal('CERRAR MI CUENTA') })
  .strict();
