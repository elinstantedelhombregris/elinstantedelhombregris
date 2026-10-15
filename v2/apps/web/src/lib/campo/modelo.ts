import { envioCampoSchema } from '@v2/shared';
import { z } from 'zod';

import type { TareaIniciativa } from '@v2/shared';

export const camposCampoSchema = z
  .object({
    titulo: z.string().max(160),
    texto: z.string().max(4000),
    url: z.string().max(1500),
    desde: z.string(),
    hasta: z.string(),
    observaciones: z.string(),
    ausencias: z.string().max(4000),
    limites: z.string().max(4000),
    proximoPaso: z.string().max(4000),
  })
  .strict();
export type CamposCampo = z.infer<typeof camposCampoSchema>;
export const cuadernoSchema = z
  .object({
    id: z.string().uuid(),
    usuarioId: z.number().int().positive(),
    iniciativaId: z.number().int().positive(),
    tareaId: z.number().int().positive(),
    fichaId: z.string().uuid().nullable().optional(),
    version: z.number().int().nonnegative(),
    revisionTarea: z.number().int().positive(),
    enlace: z.string().startsWith('/iniciativas/'),
    tarea: z.string(),
    alcance: z.string(),
    zona: z.string(),
    notas: z.string().max(12000),
    campos: camposCampoSchema,
    estado: z.enum(['borrador', 'pendiente', 'enviando', 'espera', 'conflicto', 'enviado']),
    sobre: envioCampoSchema.nullable(),
    intentos: z.number().int().nonnegative(),
    siguienteIntento: z.number().nonnegative(),
    mensaje: z.string(),
    evidenciaId: z.number().int().positive().nullable(),
  })
  .strict();
export type Cuaderno = z.infer<typeof cuadernoSchema>;
export function nuevoCuaderno(
  usuarioId: number,
  iniciativaId: number,
  t: TareaIniciativa,
  enlace: string,
): Cuaderno {
  return {
    id: crypto.randomUUID(),
    usuarioId,
    iniciativaId,
    tareaId: t.id,
    fichaId: t.fichaId ?? null,
    version: 0,
    revisionTarea: t.revision,
    enlace,
    tarea: t.titulo,
    alcance: t.alcance,
    zona: t.escucha?.zona ?? '',
    notas: '',
    campos: {
      titulo: '',
      texto: '',
      url: '',
      desde: '',
      hasta: '',
      observaciones: '',
      ausencias: '',
      limites: '',
      proximoPaso: '',
    },
    estado: 'borrador',
    sobre: null,
    intentos: 0,
    siguienteIntento: 0,
    mensaje: '',
    evidenciaId: null,
  };
}
/** Lista explícita: las notas y demás campos locales nunca entran al envío. */
export function autorizarCuaderno(c: Cuaderno): Cuaderno {
  const v = c.campos;
  const sobre = envioCampoSchema.parse({
    idLocal: crypto.randomUUID(),
    usuarioId: c.usuarioId,
    revisionTarea: c.revisionTarea,
    titulo: v.titulo,
    texto: v.texto,
    url: v.url.trim() || null,
    autorizoPublicacion: true,
    declaroRealizada: true,
    resultadoEscucha: {
      desde: v.desde,
      hasta: v.hasta,
      observaciones: v.observaciones.trim() === '' ? null : Number(v.observaciones),
      ausencias: v.ausencias,
      limites: v.limites,
      proximoPaso: v.proximoPaso,
    },
  });
  return { ...c, sobre, estado: 'pendiente', intentos: 0, siguienteIntento: 0, mensaje: '' };
}
