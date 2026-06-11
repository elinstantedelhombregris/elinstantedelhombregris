import { z } from 'zod';

/**
 * Radar ¡BASTA! — validación y normalización de señales del colector móvil.
 * Lógica pura (sin DB) para poder testearla aislada.
 */

export const RADAR_VOICE_TYPES = ['dream', 'value', 'need', 'basta'] as const;
export const RADAR_AUTH_TYPES = ['compromiso', 'recurso'] as const;
export const RADAR_TYPES = [...RADAR_VOICE_TYPES, ...RADAR_AUTH_TYPES] as const;

export type RadarVoiceType = (typeof RADAR_VOICE_TYPES)[number];
export type RadarType = (typeof RADAR_TYPES)[number];

export const RESOURCE_CATEGORIES = [
  'legal', 'medical', 'education', 'tech', 'construction',
  'agriculture', 'communication', 'admin', 'transport',
  'space', 'equipment', 'other',
] as const;

export const radarSenalSchema = z.object({
  type: z.enum(RADAR_TYPES, {
    errorMap: () => ({ message: 'Tipo de señal inválido' }),
  }),
  text: z.string({ required_error: 'Contanos tu señal' })
    .trim()
    .min(10, 'Contanos un poco más — al menos 10 caracteres')
    .max(1000, 'Máximo 1000 caracteres'),
  location: z.string().trim().max(255, 'El lugar no puede superar 255 caracteres').optional(),
  latitude: z.coerce.number()
    .min(-90, 'Latitud inválida').max(90, 'Latitud inválida')
    .optional(),
  longitude: z.coerce.number()
    .min(-180, 'Longitud inválida').max(180, 'Longitud inválida')
    .optional(),
  // Solo para type === 'recurso'
  category: z.enum(RESOURCE_CATEGORIES).optional(),
});

export type RadarSenalInput = z.infer<typeof radarSenalSchema>;

export function isVoiceType(type: RadarType): type is RadarVoiceType {
  return (RADAR_VOICE_TYPES as readonly string[]).includes(type);
}

/**
 * Mapea una señal de voz al shape de inserción de la tabla `dreams`
 * (una columna por tipo; lat/lng son `text` en esa tabla).
 */
export function buildDreamInsert(input: RadarSenalInput, userId: number | null) {
  if (!isVoiceType(input.type)) {
    throw new Error(`buildDreamInsert solo acepta tipos de voz, recibió: ${input.type}`);
  }
  return {
    userId,
    dream: input.type === 'dream' ? input.text : null,
    value: input.type === 'value' ? input.text : null,
    need: input.type === 'need' ? input.text : null,
    basta: input.type === 'basta' ? input.text : null,
    location: input.location ?? null,
    latitude: input.latitude !== undefined ? String(input.latitude) : null,
    longitude: input.longitude !== undefined ? String(input.longitude) : null,
    type: input.type,
  };
}

/** Extracto sanitizado para el feed público (sin datos de usuario). */
export function excerptSignalText(text: string | null, max = 140): string {
  if (!text) return '';
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).trimEnd()}…`;
}
