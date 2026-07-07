import { z } from 'zod';
import {
  CAMPAIGN_FIELD_TYPES,
  MAX_CAMPAIGN_FIELDS,
  CAMPAIGN_STATUS_FLOW,
  type CampaignFormSchema,
  type CampaignFormField,
  type CampaignEntryData,
  type CampaignStatus,
} from '@shared/campaign-forms';

/**
 * Campañas ¡BASTA! — validación pura (sin DB) de campañas, formularios
 * dinámicos y entradas. Patrón: server/lib/radar.ts.
 */

export const CAMPAIGN_TYPES = ['relevamiento', 'consulta'] as const;

/** Único host permitido para fotos (Cloudinary unsigned preset). */
export const ALLOWED_PHOTO_HOST = 'res.cloudinary.com';

export function isAllowedPhotoUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && parsed.hostname === ALLOWED_PHOTO_HOST;
  } catch {
    return false;
  }
}

const photoUrlZod = z.string()
  .trim()
  .max(500, 'La URL de la foto es demasiado larga')
  .refine(isAllowedPhotoUrl, 'La foto tiene que estar subida a nuestro servicio de imágenes (res.cloudinary.com)');

const campaignFieldZod = z.object({
  key: z.string()
    .trim()
    .min(1, 'Cada campo necesita una clave')
    .max(40, 'La clave del campo no puede superar 40 caracteres')
    .regex(/^[a-z][a-z0-9_]*$/, 'Las claves van en snake_case: minúsculas, números y guiones bajos'),
  label: z.string()
    .trim()
    .min(1, 'Cada campo necesita una pregunta o etiqueta')
    .max(200, 'La etiqueta no puede superar 200 caracteres'),
  type: z.enum(CAMPAIGN_FIELD_TYPES as [string, ...string[]], {
    errorMap: () => ({ message: 'Tipo de campo inválido: text, number, select, photo o rating' }),
  }),
  required: z.boolean(),
  options: z.array(z.string().trim().min(1).max(120)).max(24, 'Máximo 24 opciones por campo').optional(),
  max: z.coerce.number().int().min(2, 'La escala arranca en 2 como mínimo').max(10, 'La escala llega hasta 10').optional(),
  hint: z.string().trim().max(200, 'La ayuda no puede superar 200 caracteres').optional(),
});

/** Valida el shape de shared/campaign-forms.ts (máx 12 campos, claves únicas, select con opciones). */
export const campaignFormSchemaZod = z.object({
  fields: z.array(campaignFieldZod)
    .min(1, 'El formulario necesita al menos un campo')
    .max(MAX_CAMPAIGN_FIELDS, `Máximo ${MAX_CAMPAIGN_FIELDS} campos — las campañas se cargan en la calle`),
}).superRefine((form, ctx) => {
  const seen = new Set<string>();
  form.fields.forEach((field, i) => {
    if (seen.has(field.key)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['fields', i, 'key'],
        message: `La clave "${field.key}" está repetida — cada campo necesita una clave única`,
      });
    }
    seen.add(field.key);
    if (field.type === 'select' && (!field.options || field.options.length < 2)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['fields', i, 'options'],
        message: `El campo "${field.label}" es de opciones: necesita al menos 2 opciones`,
      });
    }
  });
}) as z.ZodType<CampaignFormSchema>;

export const crearCampanaSchema = z.object({
  templateId: z.coerce.number().int().positive().optional(),
  type: z.enum(CAMPAIGN_TYPES, {
    errorMap: () => ({ message: 'Tipo de campaña inválido: relevamiento o consulta' }),
  }),
  title: z.string({ required_error: 'Poné un título para la campaña' })
    .trim()
    .min(3, 'El título necesita al menos 3 caracteres')
    .max(120, 'El título no puede superar 120 caracteres'),
  description: z.string().trim().max(1000, 'La descripción no puede superar 1000 caracteres').optional(),
  category: z.string().trim().max(60, 'La categoría no puede superar 60 caracteres').optional(),
  formSchema: campaignFormSchemaZod.optional(),
  mapColor: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, 'El color va en hex, tipo #7D5BDE').optional(),
  mapIcon: z.string().trim().max(40, 'Ícono inválido').optional(),
  targetEntries: z.coerce.number().int().min(1, 'La meta tiene que ser al menos 1').max(100000, 'Meta demasiado grande').optional(),
  deadline: z.string().trim().max(30, 'Fecha límite inválida').optional(),
  targetProvince: z.string().trim().max(100, 'Provincia inválida').optional(),
  targetCity: z.string().trim().max(100, 'Ciudad inválida').optional(),
  targetLat: z.coerce.number().min(-90, 'Latitud inválida').max(90, 'Latitud inválida').optional(),
  targetLng: z.coerce.number().min(-180, 'Longitud inválida').max(180, 'Longitud inválida').optional(),
  targetRadiusKm: z.coerce.number().min(1, 'El radio mínimo es 1 km').max(1000, 'El radio máximo es 1000 km').optional(),
}).superRefine((data, ctx) => {
  if (!data.templateId && !data.formSchema) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['formSchema'],
      message: 'Elegí una plantilla o armá el formulario de la campaña',
    });
  }
  const radiusParts = [data.targetLat, data.targetLng, data.targetRadiusKm];
  const someRadius = radiusParts.some((v) => v !== undefined);
  const allRadius = radiusParts.every((v) => v !== undefined);
  if (someRadius && !allRadius) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['targetRadiusKm'],
      message: 'Para apuntar por radio necesitás latitud, longitud y radio juntos',
    });
  }
});

export type CrearCampanaInput = z.infer<typeof crearCampanaSchema>;

export const cambiarEstadoSchema = z.object({
  estado: z.enum(['borrador', 'activa', 'verificacion', 'cerrada'], {
    errorMap: () => ({ message: 'Estado inválido: borrador, activa, verificacion o cerrada' }),
  }),
});

export type CambiarEstadoInput = z.infer<typeof cambiarEstadoSchema>;

/** ¿La transición de estado es válida (solo hacia adelante)? */
export function canTransition(from: CampaignStatus, to: CampaignStatus): boolean {
  return (CAMPAIGN_STATUS_FLOW[from] ?? []).includes(to);
}

export const entradaSchema = z.object({
  latitude: z.coerce.number({ required_error: 'Falta la ubicación de la entrada' })
    .min(-90, 'Latitud inválida').max(90, 'Latitud inválida'),
  longitude: z.coerce.number({ required_error: 'Falta la ubicación de la entrada' })
    .min(-180, 'Longitud inválida').max(180, 'Longitud inválida'),
  data: z.record(z.union([z.string(), z.number(), z.null()]), {
    required_error: 'Faltan las respuestas del formulario',
    invalid_type_error: 'Las respuestas tienen un formato inválido',
  }),
  anonymous: z.boolean().optional(),
  photoUrl: photoUrlZod.optional(),
});

export type EntradaInput = z.infer<typeof entradaSchema>;

export interface EntryValidationResult {
  ok: boolean;
  /** Respuestas limpias (solo claves del form) — presente si ok */
  data?: CampaignEntryData;
  /** Mensaje de error rioplatense — presente si !ok */
  message?: string;
}

/**
 * Valida las respuestas de una entrada contra el formSchema de la campaña.
 * Chequea requeridos y cada tipo: text / number / select (opción válida) /
 * photo (URL de res.cloudinary.com) / rating (entero 1..max).
 */
export function validateEntryData(
  formSchema: CampaignFormSchema,
  data: Record<string, string | number | null>,
): EntryValidationResult {
  const clean: CampaignEntryData = {};

  for (const field of formSchema.fields) {
    const raw = data[field.key];
    const empty = raw === undefined || raw === null || (typeof raw === 'string' && raw.trim() === '');

    if (empty) {
      if (field.required) {
        return { ok: false, message: `Te faltó responder "${field.label}"` };
      }
      clean[field.key] = null;
      continue;
    }

    const err = validateFieldValue(field, raw as string | number);
    if (err) return { ok: false, message: err };

    clean[field.key] = typeof raw === 'string' ? raw.trim() : raw;
  }

  return { ok: true, data: clean };
}

function validateFieldValue(field: CampaignFormField, value: string | number): string | null {
  switch (field.type) {
    case 'text': {
      if (typeof value !== 'string') return `"${field.label}" espera texto`;
      if (value.trim().length > 1000) return `"${field.label}" no puede superar 1000 caracteres`;
      return null;
    }
    case 'number': {
      const n = typeof value === 'number' ? value : Number(value);
      if (!Number.isFinite(n)) return `"${field.label}" espera un número`;
      return null;
    }
    case 'select': {
      if (typeof value !== 'string') return `"${field.label}" espera una de las opciones`;
      if (!field.options?.includes(value)) {
        return `"${value}" no es una opción válida para "${field.label}"`;
      }
      return null;
    }
    case 'photo': {
      if (typeof value !== 'string' || !isAllowedPhotoUrl(value)) {
        return `La foto de "${field.label}" tiene que estar subida a nuestro servicio de imágenes`;
      }
      return null;
    }
    case 'rating': {
      const max = field.max ?? 5;
      const n = typeof value === 'number' ? value : Number(value);
      if (!Number.isInteger(n) || n < 1 || n > max) {
        return `"${field.label}" espera un puntaje entero entre 1 y ${max}`;
      }
      return null;
    }
    default:
      return `Tipo de campo desconocido en "${field.label}"`;
  }
}

/** Parsea el formSchema JSON persistido; null si está corrupto. */
export function parseFormSchema(raw: string | null): CampaignFormSchema | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.fields)) return parsed as CampaignFormSchema;
    return null;
  } catch {
    return null;
  }
}

/** Primer respuesta de texto de una entrada (para extractos públicos del mapa). */
export function firstTextAnswer(
  formSchema: CampaignFormSchema | null,
  data: Record<string, string | number | null> | null,
): string | null {
  if (!formSchema || !data) return null;
  for (const field of formSchema.fields) {
    if (field.type !== 'text') continue;
    const value = data[field.key];
    if (typeof value === 'string' && value.trim()) return value;
  }
  return null;
}
