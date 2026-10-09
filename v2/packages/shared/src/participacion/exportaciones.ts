import { z } from 'zod';

import { consultaParticipacionSchema } from './campanas.js';

export const solicitarExportacionSchema = z
  .object({
    idSolicitud: z.string().uuid(),
    formato: z.enum(['csv', 'jsonl', 'geojson']),
    filtros: consultaParticipacionSchema.innerType().omit({ cursor: true, limite: true }),
    analisis: z
      .object({ umbral: z.number().min(0).max(1), k: z.number().int().min(1).max(50) })
      .strict()
      .optional(),
  })
  .strict()
  .refine((q) => !q.filtros.edicion || Boolean(q.filtros.campana), {
    message: 'Una edición necesita su campaña.',
    path: ['filtros', 'edicion'],
  });
export type SolicitudExportacion = z.infer<typeof solicitarExportacionSchema>;
export type EstadoExportacion = 'solicitado' | 'preparando' | 'disponible' | 'vencido' | 'fallido';
export interface TrabajoExportacion {
  id: string;
  estado: EstadoExportacion;
  formato: SolicitudExportacion['formato'];
  corte: string;
  venceEn: string;
  registros: number;
  total: number;
  bytes: number;
  mensaje: string | null;
  archivoUrl: string | null;
}
