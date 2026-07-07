import { z } from 'zod';

/**
 * Círculos ¡BASTA! — validación pura (sin DB) de creación, edición,
 * invitaciones y reportes. Patrón: server/lib/radar.ts.
 */

export const CIRCLE_KINDS = ['territorial', 'tematica', 'celula'] as const;
export const CIRCLE_GOVERNANCES = ['coordinado', 'abierto'] as const;

export type CircleKind = (typeof CIRCLE_KINDS)[number];
export type CircleGovernance = (typeof CIRCLE_GOVERNANCES)[number];

export const crearCirculoSchema = z.object({
  name: z.string({ required_error: 'Poné un nombre para el círculo' })
    .trim()
    .min(3, 'El nombre necesita al menos 3 caracteres')
    .max(80, 'El nombre no puede superar 80 caracteres'),
  description: z.string().trim().max(500, 'La descripción no puede superar 500 caracteres').optional(),
  kind: z.enum(CIRCLE_KINDS, {
    errorMap: () => ({ message: 'Tipo de círculo inválido: territorial, temática o célula' }),
  }),
  province: z.string().trim().max(100, 'Provincia inválida').optional(),
  city: z.string().trim().max(100, 'Ciudad inválida').optional(),
  theme: z.string().trim().max(100, 'El tema no puede superar 100 caracteres').optional(),
  governance: z.enum(CIRCLE_GOVERNANCES, {
    errorMap: () => ({ message: 'Gobernanza inválida: coordinado o abierto' }),
  }).default('coordinado'),
  isPrivate: z.boolean().optional(),
});

export type CrearCirculoInput = z.infer<typeof crearCirculoSchema>;

export const actualizarCirculoSchema = z.object({
  name: z.string().trim().min(3, 'El nombre necesita al menos 3 caracteres').max(80, 'El nombre no puede superar 80 caracteres').optional(),
  description: z.string().trim().max(500, 'La descripción no puede superar 500 caracteres').nullable().optional(),
  province: z.string().trim().max(100, 'Provincia inválida').nullable().optional(),
  city: z.string().trim().max(100, 'Ciudad inválida').nullable().optional(),
  theme: z.string().trim().max(100, 'El tema no puede superar 100 caracteres').nullable().optional(),
  governance: z.enum(CIRCLE_GOVERNANCES, {
    errorMap: () => ({ message: 'Gobernanza inválida: coordinado o abierto' }),
  }).optional(),
  isPrivate: z.boolean().optional(),
}).refine((data) => Object.values(data).some((v) => v !== undefined), {
  message: 'No mandaste ningún cambio',
});

export type ActualizarCirculoInput = z.infer<typeof actualizarCirculoSchema>;

export const canjearInviteSchema = z.object({
  code: z.string({ required_error: 'Falta el código de invitación' })
    .trim()
    .min(6, 'Ese código no parece válido')
    .max(64, 'Ese código no parece válido'),
});

export type CanjearInviteInput = z.infer<typeof canjearInviteSchema>;

export const crearInviteSchema = z.object({
  maxUses: z.coerce.number().int()
    .min(1, 'La invitación tiene que servir al menos una vez')
    .max(100, 'Máximo 100 usos por invitación')
    .optional(),
  expiresInDays: z.coerce.number().int()
    .min(1, 'La invitación tiene que durar al menos un día')
    .max(90, 'Máximo 90 días de vigencia')
    .optional(),
});

export type CrearInviteInput = z.infer<typeof crearInviteSchema>;

export const reportarSchema = z.object({
  reason: z.string({ required_error: 'Contanos por qué reportás este círculo' })
    .trim()
    .min(10, 'Contanos un poco más — al menos 10 caracteres')
    .max(500, 'Máximo 500 caracteres'),
});

export type ReportarInput = z.infer<typeof reportarSchema>;

export const resolverReporteSchema = z.object({
  estado: z.enum(['resuelto', 'descartado'], {
    errorMap: () => ({ message: 'Estado inválido: resuelto o descartado' }),
  }),
});

export type ResolverReporteInput = z.infer<typeof resolverReporteSchema>;
